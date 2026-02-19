import * as vscode from 'vscode';
import * as os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface PrerequisiteCheckResult {
    passed: boolean;
    message: string;
    canProceed: boolean;
    warnings: string[];
    errors: string[];
    details: {
        python?: VersionInfo;
        git?: VersionInfo;
        nodejs?: VersionInfo;
        extensions?: ExtensionInfo;
    };
}

export interface VersionInfo {
    installed: boolean;
    version?: string;
    compatible: boolean;
    requiredVersion: string;
    installUrl?: string;
    pathConfigured: boolean;
}

export interface ExtensionInfo {
    installed: string[];
    missing: string[];
    canAutoInstall: boolean;
    detectionNote?: string;
}

export type PrerequisiteProfile = 'monorepo' | 'package-backend' | 'package-ui';

const REQUIRED_VERSIONS = {
    python: { min: '3.8.0', recommended: '3.11.0' },
    nodejs: { min: '16.0.0', recommended: '18.0.0' },
    git: { min: '2.20.0', recommended: '2.40.0' }
};

const REQUIRED_EXTENSIONS = [
    'ms-python.python',
    'ms-python.black-formatter',
    'ms-python.isort', 
    'ms-python.mypy-type-checker',
    'ms-python.flake8'
];

export async function checkPrerequisites(): Promise<PrerequisiteCheckResult> {
    const profile: PrerequisiteProfile = 'monorepo';
    return checkPrerequisitesByProfile(profile);
}

export async function checkPrerequisitesByProfile(profile: PrerequisiteProfile): Promise<PrerequisiteCheckResult> {
    const result: PrerequisiteCheckResult = {
        passed: false,
        message: '',
        canProceed: false,
        warnings: [],
        errors: [],
        details: {}
    };

    const requiresPython = profile !== 'package-ui';
    const requiresNode = profile === 'monorepo' || profile === 'package-ui';
    const checksExtensions = profile !== 'package-ui';

    if (requiresPython) {
        result.details.python = await checkPythonAdvanced();
        if (!result.details.python.installed) {
            result.errors.push(`❌ Python not found. Required: ${REQUIRED_VERSIONS.python.min}+`);
        } else if (!result.details.python.compatible) {
            result.errors.push(`❌ Python ${result.details.python.version} is outdated. Required: ${REQUIRED_VERSIONS.python.min}+`);
        } else if (!result.details.python.pathConfigured) {
            result.warnings.push(`⚠️ Python path configuration may need adjustment`);
        }
    }

    if (checksExtensions) {
        result.details.extensions = await checkExtensionsAdvanced();
        if (result.details.extensions.missing.length > 0) {
            if (result.details.extensions.canAutoInstall) {
                result.warnings.push(`⚠️ Missing ${result.details.extensions.missing.length} Python extensions (can auto-install)`);
            } else {
                result.warnings.push(`⚠️ Missing ${result.details.extensions.missing.length} Python extensions`);
            }
        }
    }

    // Check Git installation with version check
    result.details.git = await checkGitAdvanced();
    if (!result.details.git.installed) {
        result.warnings.push(`⚠️ Git not found. Recommended for version control features`);
    } else if (!result.details.git.compatible) {
        result.warnings.push(`⚠️ Git ${result.details.git.version} is outdated. Recommended: ${REQUIRED_VERSIONS.git.recommended}+`);
    }

    if (requiresNode) {
        result.details.nodejs = await checkNodeJsAdvanced();
        if (!result.details.nodejs.installed) {
            result.errors.push(`❌ Node.js not found. Required: ${REQUIRED_VERSIONS.nodejs.min}+`);
        } else if (!result.details.nodejs.compatible) {
            result.errors.push(`❌ Node.js ${result.details.nodejs.version} is outdated. Required: ${REQUIRED_VERSIONS.nodejs.min}+`);
        }
    }

    const pythonOk = !requiresPython || (result.details.python?.installed === true && result.details.python.compatible);
    const nodeOk = !requiresNode || (result.details.nodejs?.installed === true && result.details.nodejs.compatible);
    result.canProceed = pythonOk && nodeOk;
    result.passed = result.canProceed && result.warnings.length === 0 && result.errors.length === 0;

    if (result.passed) {
        result.message = `✅ All prerequisites met!\n\n📋 Environment Details:\n${getVersionSummary(result.details)}`;
    } else if (result.canProceed) {
        result.message = `⚠️ Ready to proceed with some missing optional components.\n\n📋 Environment Status:\n${getVersionSummary(result.details)}`;
    } else {
        result.message = `❌ Critical prerequisites missing for ${getProfileLabel(profile)}. ${getRequiredComponents(profile)} required.\n\n📋 Current Environment:\n${getVersionSummary(result.details)}`;
    }

    return result;
}

function getProfileLabel(profile: PrerequisiteProfile): string {
    if (profile === 'monorepo') {
        return 'monorepo creation';
    }

    if (profile === 'package-ui') {
        return 'UI package creation';
    }

    return 'backend package creation';
}

function getRequiredComponents(profile: PrerequisiteProfile): string {
    if (profile === 'monorepo') {
        return `Python ${REQUIRED_VERSIONS.python.min}+ and Node.js ${REQUIRED_VERSIONS.nodejs.min}+ are`;
    }

    if (profile === 'package-ui') {
        return `Node.js ${REQUIRED_VERSIONS.nodejs.min}+ is`;
    }

    return `Python ${REQUIRED_VERSIONS.python.min}+ is`;
}

function getVersionSummary(details: PrerequisiteCheckResult['details']): string {
    const lines: string[] = [];
    
    if (details.python) {
        const status = details.python.installed 
            ? (details.python.compatible ? '✅' : '⚠️') 
            : '❌';
        lines.push(`${status} Python: ${details.python.version || 'Not found'} (Required: ${REQUIRED_VERSIONS.python.min}+)`);
    }

    if (details.git) {
        const status = details.git.installed 
            ? (details.git.compatible ? '✅' : '⚠️')
            : '❌';
        lines.push(`${status} Git: ${details.git.version || 'Not found'} (Recommended: ${REQUIRED_VERSIONS.git.recommended}+)`);
    }

    if (details.nodejs) {
        const status = details.nodejs.installed 
            ? (details.nodejs.compatible ? '✅' : '⚠️')
            : '❌';
        lines.push(`${status} Node.js: ${details.nodejs.version || 'Not found'} (Required: ${REQUIRED_VERSIONS.nodejs.min}+)`);
    }

    if (details.extensions) {
        if (details.extensions.detectionNote) {
            lines.push(`ℹ️ VS Code Extensions: ${details.extensions.detectionNote}`);
        } else {
            const status = details.extensions.missing.length === 0 ? '✅' : '⚠️';
            lines.push(`${status} VS Code Extensions: ${details.extensions.installed.length}/${REQUIRED_EXTENSIONS.length} installed`);
        }
    }

    return lines.join('\n');
}

async function checkPythonAdvanced(): Promise<VersionInfo> {
    const result: VersionInfo = {
        installed: false,
        compatible: false,
        requiredVersion: REQUIRED_VERSIONS.python.min,
        installUrl: 'https://python.org/downloads/',
        pathConfigured: false
    };

    try {
        // Try python command first
        let output: string;
        try {
            const { stdout } = await execAsync('python --version');
            output = stdout.trim();
        } catch {
            // Try python3 if python fails
            const { stdout } = await execAsync('python3 --version');
            output = stdout.trim();
        }

        const versionMatch = output.match(/Python (\d+\.\d+\.\d+)/);
        if (versionMatch) {
            result.version = versionMatch[1];
            result.installed = true;
            result.compatible = compareVersions(result.version, REQUIRED_VERSIONS.python.min) >= 0;
            
            // Check if Python is properly in PATH
            try {
                await execAsync('python -c "import sys; print(sys.executable)"');
                result.pathConfigured = true;
            } catch {
                try {
                    await execAsync('python3 -c "import sys; print(sys.executable)"');
                    result.pathConfigured = true;
                } catch {
                    result.pathConfigured = false;
                }
            }
        }
    } catch (error) {
        // Python not found
    }

    return result;
}

async function checkGitAdvanced(): Promise<VersionInfo> {
    const result: VersionInfo = {
        installed: false,
        compatible: false,
        requiredVersion: REQUIRED_VERSIONS.git.min,
        installUrl: 'https://git-scm.com/downloads',
        pathConfigured: false
    };

    try {
        const { stdout } = await execAsync('git --version');
        const versionMatch = stdout.match(/git version (\d+\.\d+\.\d+)/);
        
        if (versionMatch) {
            result.version = versionMatch[1];
            result.installed = true;
            result.compatible = compareVersions(result.version, REQUIRED_VERSIONS.git.min) >= 0;
            result.pathConfigured = true; // If git --version works, it's in PATH
        }
    } catch (error) {
        // Git not found
    }

    return result;
}

async function checkNodeJsAdvanced(): Promise<VersionInfo> {
    const result: VersionInfo = {
        installed: false,
        compatible: false,
        requiredVersion: REQUIRED_VERSIONS.nodejs.min,
        installUrl: 'https://nodejs.org/en/download/',
        pathConfigured: false
    };

    try {
        const { stdout } = await execAsync('node --version');
        const versionMatch = stdout.match(/v(\d+\.\d+\.\d+)/);
        
        if (versionMatch) {
            result.version = versionMatch[1];
            result.installed = true;
            result.compatible = compareVersions(result.version, REQUIRED_VERSIONS.nodejs.min) >= 0;
            result.pathConfigured = true; // If node --version works, it's in PATH
        }
    } catch (error) {
        // Node.js not found
    }

    return result;
}

async function checkExtensionsAdvanced(): Promise<ExtensionInfo> {
    const appName = vscode.env.appName.toLowerCase();
    const hasDevHostAppName = appName.includes('extension development host');
    const hasDevHostArg = process.argv.some(arg => arg.includes('--extensionDevelopmentPath='));
    const hasDevHostEnv = process.env.VSCODE_EXTENSION_DEVELOPMENT === 'true';
    const isExtensionDevelopmentHost = hasDevHostAppName || hasDevHostArg || hasDevHostEnv;
    const installedIds = new Set(
        vscode.extensions.all.map(ext => ext.id.toLowerCase())
    );

    const installed: string[] = [];
    const missing: string[] = [];

    REQUIRED_EXTENSIONS.forEach(extId => {
        const normalizedId = extId.toLowerCase();
        const directMatch = vscode.extensions.getExtension(extId) || vscode.extensions.getExtension(normalizedId);
        const scannedMatch = installedIds.has(normalizedId);

        if (directMatch || scannedMatch) {
            installed.push(extId);
        } else {
            missing.push(extId);
        }
    });

    if (isExtensionDevelopmentHost && installed.length === 0 && missing.length === REQUIRED_EXTENSIONS.length) {
        return {
            installed: [],
            missing: [],
            canAutoInstall: true,
            detectionNote: 'check skipped in Extension Development Host'
        };
    }

    return {
        installed,
        missing,
        canAutoInstall: true // VS Code always allows programmatic extension installation
    };
}

// Utility function to compare semantic versions
function compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split('.').map(n => parseInt(n, 10));
    const v2parts = version2.split('.').map(n => parseInt(n, 10));
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
        const v1part = v1parts[i] || 0;
        const v2part = v2parts[i] || 0;
        
        if (v1part > v2part) return 1;
        if (v1part < v2part) return -1;
    }
    
    return 0;
}

export async function showPrerequisiteDialog(result: PrerequisiteCheckResult): Promise<boolean> {
    // If everything is perfect, just show a success message
    if (result.passed && result.warnings.length === 0 && result.errors.length === 0) {
        await vscode.window.showInformationMessage(
            result.message,
            { modal: false }
        );
        return true;
    }

    const items: vscode.MessageItem[] = [];

    // Add intelligent action buttons based on what can be auto-fixed
    if (result.details.extensions && result.details.extensions.missing.length > 0) {
        items.push({ title: '🔧 Auto-Install Extensions', isCloseAffordance: false });
    }

    if (!result.canProceed) {
        items.push({ title: '📖 Installation Guide', isCloseAffordance: false });
    }

    if (result.canProceed) {
        items.push({ title: 'Continue Anyway', isCloseAffordance: false });
    }
    
    items.push({ title: 'Cancel', isCloseAffordance: true });

    const messageType = result.canProceed ? vscode.window.showInformationMessage : vscode.window.showWarningMessage;
    const choice = await messageType(
        result.message,
        { modal: true, detail: result.canProceed ? 'Some optional components are missing.' : 'Critical prerequisites are missing.' },
        ...items
    );

    switch (choice?.title) {
        case '🔧 Auto-Install Extensions':
            await autoInstallMissingComponents(result);
            return false; // Re-check after installation

        case '📖 Installation Guide':
            await showDetailedInstallationGuide(result);
            return false;

        case 'Continue Anyway':
            return true;

        default:
            return false; // Cancel
    }
}

export async function autoInstallMissingComponents(result: PrerequisiteCheckResult): Promise<void> {
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Auto-installing missing components...",
        cancellable: false
    }, async (progress) => {
        
        // Auto-install VS Code extensions
        if (result.details.extensions && result.details.extensions.missing.length > 0) {
            progress.report({ message: `Installing ${result.details.extensions.missing.length} extensions...` });
            
            let installed = 0;
            for (const extId of result.details.extensions.missing) {
                try {
                    progress.report({ 
                        message: `Installing ${extId.split('.').pop()}...`,
                        increment: (installed / result.details.extensions.missing.length) * 90
                    });
                    
                    await vscode.commands.executeCommand('workbench.extensions.installExtension', extId);
                    installed++;
                } catch (error) {
                    vscode.window.showErrorMessage(`Failed to install ${extId}: ${error}`);
                }
            }

            if (installed > 0) {
                vscode.window.showInformationMessage(
                    `✅ Successfully installed ${installed}/${result.details.extensions.missing.length} extensions!`,
                    'Reload Window'
                ).then(choice => {
                    if (choice === 'Reload Window') {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                    }
                });
            }
        }

        // Configure environment variables if needed
        if (result.details.python && !result.details.python.pathConfigured) {
            progress.report({ message: 'Configuring Python PATH...' });
            await configurePythonPath();
        }

        progress.report({ message: 'Setup complete!', increment: 100 });
    });
}

async function configurePythonPath(): Promise<void> {
    const platform = os.platform();
    
    try {
        // Try to find Python installation
        let pythonPath: string | undefined;
        
        if (platform === 'win32') {
            // Windows: Check common Python installation paths
            const commonPaths = [
                'C:\\Python*\\python.exe',
                'C:\\Program Files\\Python*\\python.exe',
                '%LOCALAPPDATA%\\Programs\\Python\\Python*\\python.exe'
            ];
            
            // Try to find python in AppData (typical for user installs)
            try {
                const { stdout } = await execAsync('where python');
                pythonPath = stdout.trim().split('\n')[0];
            } catch {
                // Python not in PATH
            }
        } else {
            // Unix-like: Try common locations
            try {
                const { stdout } = await execAsync('which python3 || which python');
                pythonPath = stdout.trim();
            } catch {
                // Python not found
            }
        }

        if (pythonPath) {
            // Offer to add to VS Code settings
            const choice = await vscode.window.showInformationMessage(
                `Found Python at: ${pythonPath}\n\nWould you like to configure this as your VS Code Python interpreter?`,
                'Yes, Configure',
                'No, Skip'
            );

            if (choice === 'Yes, Configure') {
                const config = vscode.workspace.getConfiguration('python');
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                const target = workspaceFolder
                    ? vscode.ConfigurationTarget.WorkspaceFolder
                    : vscode.ConfigurationTarget.Global;

                await config.update('defaultInterpreterPath', pythonPath, target);
                vscode.window.showInformationMessage('✅ Python interpreter configured for VS Code!');
            }
        }
    } catch (error) {
        console.error('Error configuring Python PATH:', error);
    }
}

async function showDetailedInstallationGuide(result: PrerequisiteCheckResult): Promise<void> {
    const instructions: string[] = ['# Python Development Environment Setup\n'];

    // Python installation instructions
    if (result.details.python && (!result.details.python.installed || !result.details.python.compatible)) {
        instructions.push(
            '## 🐍 Python Installation',
            '',
            `**Required:** Python ${REQUIRED_VERSIONS.python.min}+ (Recommended: ${REQUIRED_VERSIONS.python.recommended}+)`,
            '',
            '### Windows:',
            `1. Download Python from [python.org](${result.details.python.installUrl})`,
            '2. ✅ **IMPORTANT:** Check "Add Python to PATH" during installation',
            '3. Run the installer and follow the wizard',
            '4. Open Command Prompt and verify: `python --version`',
            '',
            '### macOS:',
            '```bash',
            '# Using Homebrew (recommended)',
            'brew install python',
            '',
            '# Or download from python.org',
            '```',
            '',
            '### Linux (Ubuntu/Debian):',
            '```bash',
            'sudo apt update',
            'sudo apt install python3 python3-pip python3-venv',
            '```',
            ''
        );
    }

    // VS Code Extensions
    if (result.details.extensions && result.details.extensions.missing.length > 0) {
        instructions.push(
            '## 🔧 VS Code Extensions',
            '',
            '**Missing Extensions:**',
            ...result.details.extensions.missing.map(ext => `- \`${ext}\``),
            '',
            '### Auto-Install (Recommended):',
            '1. Run command: **"Python Generator: Install Python Development Extensions"**',
            '2. Or use the "Auto-Install Extensions" button in the prerequisites dialog',
            '',
            '### Manual Installation:',
            '1. Open Extensions view (Ctrl+Shift+X)',
            '2. Search and install each extension listed above',
            '3. Reload VS Code when prompted',
            ''
        );
    }

    // Git installation
    if (result.details.git && (!result.details.git.installed || !result.details.git.compatible)) {
        instructions.push(
            '## 📚 Git Installation',
            '',
            `**Recommended:** Git ${REQUIRED_VERSIONS.git.recommended}+`,
            '',
            '### Windows:',
            `1. Download Git from [git-scm.com](${result.details.git.installUrl})`,
            '2. Run installer with default settings (recommended)',
            '3. Choose "Git from the command line and also from 3rd-party software"',
            '',
            '### macOS:',
            '```bash',
            '# Using Homebrew',
            'brew install git',
            '',
            '# Or download from git-scm.com',
            '```',
            '',
            '### Linux:',
            '```bash',
            '# Ubuntu/Debian',
            'sudo apt install git',
            '',
            '# CentOS/RHEL/Fedora',
            'sudo yum install git     # or dnf install git',
            '```',
            ''
        );
    }

    // Node.js installation
    if (result.details.nodejs && (!result.details.nodejs.installed || !result.details.nodejs.compatible)) {
        instructions.push(
            '## 🟢 Node.js Installation (For Frontend Development)',
            '',
            `**Required:** Node.js ${REQUIRED_VERSIONS.nodejs.min}+ (Recommended: ${REQUIRED_VERSIONS.nodejs.recommended}+)`,
            '',
            '### All Platforms:',
            `1. Download Node.js LTS from [nodejs.org](${result.details.nodejs.installUrl})`,
            '2. Run the installer with default settings',
            '3. Restart your terminal/VS Code',
            '4. Verify: `node --version` and `npm --version`',
            '',
            '### Alternative (using Package Managers):',
            '```bash',
            '# Windows (Chocolatey)',
            'choco install nodejs',
            '',
            '# macOS (Homebrew)',
            'brew install node',
            '',
            '# Linux (using NodeSource)',
            'curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -',
            'sudo apt-get install -y nodejs',
            '```',
            ''
        );
    }

    // Environment verification
    instructions.push(
        '## ✅ Verification Steps',
        '',
        'After installation, verify your setup:',
        '',
        '```bash',
        '# Check Python',
        'python --version  # Should show 3.8+ ',
        'pip --version     # Should show pip version',
        '',
        '# Check Git (if installed)',
        'git --version     # Should show Git version',
        '',
        '# Check Node.js (if installed)',
        'node --version    # Should show Node version',
        'npm --version     # Should show npm version',
        '```',
        '',
        '## 🔄 After Installation',
        '',
        '1. **Restart VS Code** completely',
        '2. Run **"Python Generator: Check Development Prerequisites"** again',
        '3. All checks should now pass ✅',
        '',
        '---',
        '',
        '*Generated by Python Monorepo Generator*'
    );

    // Show the guide in a new document
    const doc = await vscode.workspace.openTextDocument({
        content: instructions.join('\n'),
        language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc, { preview: true });
}

export async function installMissingExtensions(): Promise<void> {
    const result = await checkPrerequisites();
    await autoInstallMissingComponents(result);
}
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { execSync } from 'child_process';

interface SetupOptions {
    installPythonDeps: boolean;
    installFrontendDeps: boolean;
    initialCommit: boolean;
}

export async function setupPythonProject() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder is open. Please open a project folder first.');
        return;
    }

    const projectRoot = workspaceFolder.uri.fsPath;
    
    // Verify this is a generated monorepo project
    if (!isGeneratedProject(projectRoot)) {
        const response = await vscode.window.showWarningMessage(
            'This doesn\'t appear to be a Python Monorepo project. Continue anyway?',
            'Continue',
            'Cancel'
        );
        if (response !== 'Continue') {
            return;
        }
    }

    // Ask user what to setup
    const options = await promptSetupOptions(projectRoot);
    if (!options) {
        return; // User cancelled
    }

    // Execute setup steps
    let setupCompleted = false;
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: "Setting up project...",
        cancellable: false
    }, async (progress) => {
        try {
            let step = 1;
            const totalSteps = [options.installPythonDeps, options.installFrontendDeps, options.initialCommit]
                .filter(Boolean).length;

            // Step 1: Install Python dependencies
            if (options.installPythonDeps) {
                progress.report({ 
                    message: `(${step}/${totalSteps}) Installing Python dependencies...`,
                    increment: 0 
                });
                await installPythonDependencies(projectRoot);
                step++;
            }

            // Step 2: Install Frontend dependencies
            if (options.installFrontendDeps) {
                progress.report({ 
                    message: `(${step}/${totalSteps}) Installing frontend dependencies...`,
                    increment: (step - 1) * (100 / totalSteps)
                });
                await installFrontendDependencies(projectRoot);
                step++;
            }

            // Step 3: Initial commit
            if (options.initialCommit) {
                progress.report({ 
                    message: `(${step}/${totalSteps}) Creating initial commit...`,
                    increment: (step - 1) * (100 / totalSteps)
                });
                await createInitialCommit(projectRoot);
            }

            progress.report({ increment: 100 });
            setupCompleted = true;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            vscode.window.showErrorMessage(`Setup failed: ${errorMessage}`);
        }
    });

    // After setup is complete, check if we should push to GitHub
    if (setupCompleted) {
        const hasGitHubRemote = await checkGitHubRemote(projectRoot);
        
        if (hasGitHubRemote && options.initialCommit) {
            // Ask if user wants to push to GitHub
            const pushChoice = await vscode.window.showInformationMessage(
                '✅ Project setup completed! Push to GitHub now?',
                'Push to GitHub',
                'View README',
                'Later'
            );
            
            if (pushChoice === 'Push to GitHub') {
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Pushing to GitHub...",
                    cancellable: false
                }, async () => {
                    await pushToGitHub(projectRoot);
                });
            } else if (pushChoice === 'View README') {
                const readmePath = path.join(projectRoot, 'README.md');
                vscode.workspace.openTextDocument(readmePath).then(doc => {
                    vscode.window.showTextDocument(doc).then(() => {}, () => {});
                }, () => {});
            }
        } else {
            vscode.window.showInformationMessage(
                '✅ Project setup completed successfully!',
                'View README'
            ).then(selection => {
                if (selection === 'View README') {
                    const readmePath = path.join(projectRoot, 'README.md');
                    vscode.workspace.openTextDocument(readmePath).then(doc => {
                        vscode.window.showTextDocument(doc).then(() => {}, () => {});
                    }, () => {});
                }
            }, () => {});
        }
    }
}

function isGeneratedProject(projectRoot: string): boolean {
    // Check for characteristic files/folders of a generated project
    const markers = [
        path.join(projectRoot, 'pyproject.toml'),
        path.join(projectRoot, '.vscode', 'settings.json'),
        path.join(projectRoot, 'backend', 'main.py'),
        path.join(projectRoot, 'GETTING_STARTED.md')
    ];
    
    return markers.some(marker => fs.existsSync(marker));
}

async function promptSetupOptions(projectRoot: string): Promise<SetupOptions | undefined> {
    // Check what's available
    const hasRequirements = fs.existsSync(path.join(projectRoot, 'requirements.txt'));
    const hasFrontendWeb = fs.existsSync(path.join(projectRoot, 'frontend', 'web', 'package.json'));
    const hasFrontendMobile = fs.existsSync(path.join(projectRoot, 'frontend', 'mobile', 'package.json'));
    const hasGit = fs.existsSync(path.join(projectRoot, '.git'));

    const items: vscode.QuickPickItem[] = [];
    
    if (hasRequirements) {
        items.push({
            label: '$(package) Install Python Dependencies',
            description: 'pip install -r requirements.txt',
            picked: true
        });
    }

    if (hasFrontendWeb || hasFrontendMobile) {
        items.push({
            label: '$(symbol-namespace) Install Frontend Dependencies',
            description: 'npm install for web and mobile apps',
            picked: true
        });
    }

    if (hasGit) {
        // Check if there are staged files (from initial git add)
        try {
            const staged = require('child_process').execSync('git diff --cached --name-only', {
                cwd: projectRoot,
                encoding: 'utf-8'
            }).trim();
            
            const hasStagedFiles = staged.length > 0;
            
            items.push({
                label: '$(git-commit) Create Initial Commit',
                description: hasStagedFiles 
                    ? 'Commit project structure and installed dependencies'
                    : 'git commit all changes',
                picked: hasStagedFiles // Auto-select if files are staged from project creation
            });
        } catch {
            items.push({
                label: '$(git-commit) Create Initial Commit',
                description: 'git commit all changes',
                picked: false
            });
        }
    }

    if (items.length === 0) {
        vscode.window.showWarningMessage('Nothing to setup in this project.');
        return undefined;
    }

    const selected = await vscode.window.showQuickPick(items, {
        title: 'Select Setup Steps',
        placeHolder: 'Choose what to configure',
        canPickMany: true,
        ignoreFocusOut: false
    });

    if (!selected || selected.length === 0) {
        return undefined;
    }

    return {
        installPythonDeps: selected.some(s => s.label.includes('Python Dependencies')),
        installFrontendDeps: selected.some(s => s.label.includes('Frontend Dependencies')),
        initialCommit: selected.some(s => s.label.includes('Initial Commit'))
    };
}

async function installPythonDependencies(projectRoot: string): Promise<void> {
    const terminal = vscode.window.createTerminal({
        name: 'Setup: Python Dependencies',
        cwd: projectRoot
    });

    terminal.show();

    // Determine the correct activation command based on OS
    const isWindows = process.platform === 'win32';
    const venvPath = path.join(projectRoot, 'venv');
    
    if (!fs.existsSync(venvPath)) {
        throw new Error('Virtual environment not found. Please run the project creation first.');
    }

    const activateCmd = isWindows 
        ? `.\\venv\\Scripts\\Activate.ps1` 
        : `source venv/bin/activate`;

    // Install requirements
    terminal.sendText(`${activateCmd} ; pip install -r requirements.txt`, true);
    
    // Check if requirements-dev.txt exists
    if (fs.existsSync(path.join(projectRoot, 'requirements-dev.txt'))) {
        terminal.sendText(`pip install -r requirements-dev.txt`, true);
    }

    // Wait a bit for commands to complete
    await new Promise(resolve => setTimeout(resolve, 2000));
}

async function installFrontendDependencies(projectRoot: string): Promise<void> {
    const webPackagePath = path.join(projectRoot, 'frontend', 'web', 'package.json');
    const mobilePackagePath = path.join(projectRoot, 'frontend', 'mobile', 'package.json');

    // Install web dependencies
    if (fs.existsSync(webPackagePath)) {
        const webTerminal = vscode.window.createTerminal({
            name: 'Setup: Web Dependencies',
            cwd: path.join(projectRoot, 'frontend', 'web')
        });
        webTerminal.show();
        webTerminal.sendText('npm install', true);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Install mobile dependencies
    if (fs.existsSync(mobilePackagePath)) {
        const mobileTerminal = vscode.window.createTerminal({
            name: 'Setup: Mobile Dependencies',
            cwd: path.join(projectRoot, 'frontend', 'mobile')
        });
        mobileTerminal.show();
        mobileTerminal.sendText('npm install', true);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function createInitialCommit(projectRoot: string): Promise<void> {
    try {
        // Set environment to prevent Git from opening an editor
        const gitEnv = {
            ...process.env,
            GIT_EDITOR: 'true',
            GIT_TERMINAL_PROMPT: '0'
        };

        // Check if there are uncommitted changes
        const status = execSync('git status --porcelain', { 
            cwd: projectRoot, 
            encoding: 'utf-8',
            env: gitEnv
        });

        if (status.trim().length === 0) {
            vscode.window.showInformationMessage('No changes to commit.');
            return;
        }

        // Stage all files (including any new files like package-lock.json)
        execSync('git add .', { cwd: projectRoot, env: gitEnv });

        // Create initial commit with comprehensive message
        const commitMessage = 'Initial commit';
        execSync(`git commit -m "${commitMessage}" --no-edit`, { 
            cwd: projectRoot,
            encoding: 'utf-8',
            env: gitEnv
        });

        vscode.window.showInformationMessage('✅ Initial commit created successfully!');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Git commit failed: ${errorMessage}`);
    }
}

async function checkGitHubRemote(projectRoot: string): Promise<boolean> {
    try {
        const remotes = execSync('git remote -v', {
            cwd: projectRoot,
            encoding: 'utf-8'
        });
        
        // Check if there's an origin remote pointing to GitHub
        return remotes.includes('origin') && remotes.includes('github.com');
    } catch {
        return false;
    }
}

async function pushToGitHub(projectRoot: string): Promise<void> {
    try {
        const gitEnv = {
            ...process.env,
            GIT_EDITOR: 'true',
            GIT_TERMINAL_PROMPT: '0'
        };

        // Get current branch name
        const branch = execSync('git branch --show-current', {
            cwd: projectRoot,
            encoding: 'utf-8'
        }).trim();

        // Check if branch is master, rename to main if needed
        if (branch === 'master') {
            execSync('git branch -M main', { cwd: projectRoot, env: gitEnv });
        }

        const finalBranch = branch === 'master' ? 'main' : branch;

        // Push to GitHub
        try {
            execSync(`git push -u origin ${finalBranch}`, { 
                cwd: projectRoot, 
                env: gitEnv,
                encoding: 'utf-8'
            });
            
            vscode.window.showInformationMessage(
                `✅ Successfully pushed to GitHub (${finalBranch} branch)!`,
                'Open on GitHub'
            ).then(selection => {
                if (selection === 'Open on GitHub') {
                    // Get remote URL
                    const remoteUrl = execSync('git remote get-url origin', {
                        cwd: projectRoot,
                        encoding: 'utf-8'
                    }).trim();
                    
                    // Convert git URL to https URL
                    const httpsUrl = remoteUrl
                        .replace('git@github.com:', 'https://github.com/')
                        .replace('.git', '');
                    
                    vscode.env.openExternal(vscode.Uri.parse(httpsUrl)).then(() => {}, () => {});
                }
            }, () => {});

        } catch (pushError: any) {
            // If push fails, provide helpful guidance
            if (pushError.message.includes('remote contains work')) {
                throw new Error('Remote repository contains work that you do not have locally. Pull first with: git pull origin main --rebase');
            } else if (pushError.message.includes('Repository not found')) {
                throw new Error('GitHub repository not found. Make sure you created it on GitHub first at: https://github.com/new');
            } else {
                throw pushError;
            }
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Push to GitHub failed: ${errorMessage}`);
        throw error;
    }
}

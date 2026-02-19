import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { createMonorepoPackage, validatePackageName } from '../generators/package';

/**
 * Command to add a new package to an existing monorepo
 */
export async function addPackageToMonorepo(): Promise<void> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is open. Please open a monorepo project first.');
            return;
        }

        const projectRoot = workspaceFolder.uri.fsPath;

        // Check if packages folder exists
        const packagesPath = path.join(projectRoot, 'packages');
        if (!fs.existsSync(packagesPath)) {
            const createPackagesFolder = await vscode.window.showWarningMessage(
                'No "packages" folder found in workspace. This might not be a monorepo project. Create packages folder?',
                'Create Folder',
                'Cancel'
            );

            if (createPackagesFolder === 'Create Folder') {
                fs.mkdirSync(packagesPath, { recursive: true });
            } else {
                return;
            }
        }

        // Ask for package name
        const packageName = await vscode.window.showInputBox({
            placeHolder: 'e.g., auth-share, data-utils, common-models',
            prompt: 'Enter the package name (lowercase, use hyphens)',
            validateInput: validatePackageName
        });

        if (!packageName) {
            return;
        }

        // Ask for optional description
        const packageDescription = await vscode.window.showInputBox({
            placeHolder: 'Optional: Brief description of the package',
            prompt: 'Enter a description for the package (optional)',
        });

        // Check if package already exists
        const packagePath = path.join(packagesPath, packageName);
        if (fs.existsSync(packagePath)) {
            vscode.window.showErrorMessage(`Package "${packageName}" already exists in packages/`);
            return;
        }

        // Create the package
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Creating package: ${packageName}`,
            cancellable: false
        }, async (progress) => {
            await createMonorepoPackage(projectRoot, packageName, progress, packageDescription);
        });

        // Ask if user wants to open the new package
        const openPackage = await vscode.window.showInformationMessage(
            `Package "${packageName}" created successfully! 🎉\n\nYou can now add your logic to:\n- src/${packageName.replace(/-/g, '_')}/core.py\n- tests/test_core.py`,
            'Open Package',
            'View README',
            'Close'
        );

        if (openPackage === 'Open Package') {
            const packageUri = vscode.Uri.file(packagePath);
            await vscode.commands.executeCommand('revealInExplorer', packageUri);
            
            // Open the core.py file
            const corePyPath = path.join(packagePath, 'src', packageName.replace(/-/g, '_'), 'core.py');
            const coreDocument = await vscode.workspace.openTextDocument(corePyPath);
            await vscode.window.showTextDocument(coreDocument);
        } else if (openPackage === 'View README') {
            const readmePath = path.join(packagePath, 'README.md');
            const readmeDocument = await vscode.workspace.openTextDocument(readmePath);
            await vscode.window.showTextDocument(readmeDocument);
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error creating package: ${errorMessage}`);
    }
}

/**
 * Command to list all packages in the current monorepo
 */
export async function listMonorepoPackages(): Promise<void> {
    try {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }

        const projectRoot = workspaceFolder.uri.fsPath;
        const packagesPath = path.join(projectRoot, 'packages');

        if (!fs.existsSync(packagesPath)) {
            vscode.window.showInformationMessage('No "packages" folder found in workspace.');
            return;
        }

        // Read all subdirectories in packages/
        const packages = fs.readdirSync(packagesPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => {
                const packagePath = path.join(packagesPath, dirent.name);
                const pyprojectPath = path.join(packagePath, 'pyproject.toml');
                
                let version = 'unknown';
                let description = '';

                // Try to read version and description from pyproject.toml
                if (fs.existsSync(pyprojectPath)) {
                    try {
                        const content = fs.readFileSync(pyprojectPath, 'utf8');
                        const versionMatch = content.match(/version\s*=\s*"([^"]+)"/);
                        const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
                        
                        if (versionMatch) {
                            version = versionMatch[1];
                        }
                        if (descMatch) {
                            description = descMatch[1];
                        }
                    } catch (error) {
                        // Ignore read errors
                    }
                }

                return {
                    name: dirent.name,
                    version,
                    description,
                    path: packagePath
                };
            });

        if (packages.length === 0) {
            vscode.window.showInformationMessage('No packages found in packages/ folder.');
            return;
        }

        // Show quick pick with packages
        const items = packages.map(pkg => ({
            label: `📦 ${pkg.name}`,
            description: `v${pkg.version}`,
            detail: pkg.description,
            packagePath: pkg.path
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a package to open',
            title: `Monorepo Packages (${packages.length})`
        });

        if (selected) {
            const packageUri = vscode.Uri.file(selected.packagePath);
            await vscode.commands.executeCommand('revealInExplorer', packageUri);
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Error listing packages: ${errorMessage}`);
    }
}

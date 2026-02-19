import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectOptions, ProjectTypeChoice, PackageType } from '../types';
import { 
    validateProjectName, 
    validateGitHubRepo, 
    validateGitUserName, 
    validateGitEmail,
    checkDirectoryExists,
    removeDirectory,
    checkPrerequisitesByProfile,
    PrerequisiteProfile,
    showPrerequisiteDialog,
    installMissingExtensions,
    validateGitHubRepositoryForBootstrap
} from '../utils';
import { initializeGitRepository, initializeLocalGitRepository } from '../utils/git';
import { createMonorepoStructure } from '../generators/monorepo';
import { createStandalonePackage, validatePackageName } from '../generators/package';

export async function createPythonProject(): Promise<void> {
    try {
        // Ask user for project name
        const projectName = await vscode.window.showInputBox({
            placeHolder: 'Enter project name',
            prompt: 'What name would you like for your Python project?',
            validateInput: (value) => {
                // Try both validators
                return validateProjectName(value) || validatePackageName(value);
            }
        });

        if (!projectName) {
            return;
        }

        // Ask user what type of project to create
        const projectTypeChoices: ProjectTypeChoice[] = [
            {
                label: '🏗️ Complete Monorepo',
                description: 'Backend + Frontend + Mobile + Apps + Packages + Docs',
                detail: 'Full monorepo structure with all components'
            },
            {
                label: '📦 Python Package',
                description: 'Single Python package with tests and documentation',
                detail: 'Lightweight package structure for libraries and tools'
            }
        ];

        const projectType = await vscode.window.showQuickPick(projectTypeChoices, {
            placeHolder: 'What type of project do you want to create?'
        });

        if (!projectType) {
            return;
        }

        const isMonorepo = projectType.label.includes('Monorepo');

        // If creating a package, ask for package type
        let packageType: PackageType = 'backend';
        if (!isMonorepo) {
            const packageTypeChoice = await vscode.window.showQuickPick([
                {
                    label: '🔧 Backend / Logic Package',
                    description: 'Python package with core logic',
                    detail: 'Creates: src/, tests/, pyproject.toml, requirements.txt',
                    value: 'backend' as PackageType
                },
                {
                    label: '🎨 UI Components Package',
                    description: 'React/TypeScript components',
                    detail: 'Creates: src/components/, package.json, tsconfig.json',
                    value: 'ui' as PackageType
                }
            ], {
                placeHolder: 'Select the type of package to create',
                title: 'Package Type'
            });

            if (!packageTypeChoice) {
                return;
            }

            packageType = packageTypeChoice.value;
        }

        const prerequisiteProfile: PrerequisiteProfile = isMonorepo
            ? 'monorepo'
            : (packageType === 'ui' ? 'package-ui' : 'package-backend');

        const prerequisiteResult = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Checking development prerequisites...',
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Validating required tooling...' });
            return await checkPrerequisitesByProfile(prerequisiteProfile);
        });

        if (!prerequisiteResult.canProceed) {
            const continueAnyway = await showPrerequisiteDialog(prerequisiteResult);
            if (!continueAnyway) {
                return;
            }
        } else if (prerequisiteResult.warnings.length > 0) {
            const hasMissingExtensions = (prerequisiteResult.details.extensions?.missing.length ?? 0) > 0;
            const extensionWarningsCount = prerequisiteResult.warnings.filter(warning =>
                warning.includes('Python extensions')
            ).length;
            const onlyExtensionWarnings = hasMissingExtensions && extensionWarningsCount === prerequisiteResult.warnings.length;

            if (!onlyExtensionWarnings) {
                const choice = await vscode.window.showInformationMessage(
                    prerequisiteResult.message,
                    'Continue',
                    'Install Extensions',
                    'View Details'
                );

                if (choice === 'Install Extensions') {
                    await installMissingExtensions();
                } else if (choice === 'View Details') {
                    await showPrerequisiteDialog(prerequisiteResult);
                    return;
                } else if (!choice) {
                    return;
                }
            }
        }

        // Ask if user wants Git integration
        const gitIntegration = await vscode.window.showQuickPick(
            ['Yes, initialize local Git repository (GitHub optional)', 'No, skip Git initialization'],
            {
                placeHolder: 'Do you want to initialize a local Git repository?'
            }
        );

        if (!gitIntegration) {
            return;
        }

        const shouldInitializeLocalGit = isMonorepo || gitIntegration.startsWith('Yes');

        let githubRepo = '';
        let gitUserName = '';
        let gitUserEmail = '';

        if (gitIntegration.startsWith('Yes')) {
            const configureGitHubNow = await vscode.window.showQuickPick(
                ['Yes, configure GitHub remote now', 'No, local Git only'],
                {
                    placeHolder: 'Do you want to configure a GitHub repository now?'
                }
            );

            if (!configureGitHubNow) {
                return;
            }

            if (configureGitHubNow.startsWith('Yes')) {
                githubRepo = await vscode.window.showInputBox({
                    placeHolder: 'username/repository-name',
                    prompt: 'Enter GitHub repository (username/repo-name)',
                    validateInput: validateGitHubRepo
                }) || '';

                if (!githubRepo) {
                    return;
                }

                const repositoryValidation = await validateGitHubRepositoryForBootstrap(githubRepo);
                if (!repositoryValidation.valid) {
                    vscode.window.showErrorMessage(repositoryValidation.message || 'Invalid GitHub repository state.');
                    return;
                }
            }

            // Get Git user info
            gitUserName = await vscode.window.showInputBox({
                placeHolder: 'Your Name',
                prompt: 'Enter your Git username',
                validateInput: validateGitUserName
            }) || '';

            if (!gitUserName) {
                return;
            }

            gitUserEmail = await vscode.window.showInputBox({
                placeHolder: 'your.email@example.com',
                prompt: 'Enter your Git email',
                validateInput: validateGitEmail
            }) || '';

            if (!gitUserEmail) {
                return;
            }
        }

        // Get workspace folder or ask user to select one
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        let basePath: string;

        if (workspaceFolder) {
            basePath = workspaceFolder.uri.fsPath;
        } else {
            const folderUri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                title: 'Select folder where to create the project'
            });

            if (!folderUri || folderUri.length === 0) {
                return;
            }

            basePath = folderUri[0].fsPath;
        }

        const projectPath = path.join(basePath, projectName);

        // Check if directory already exists
        if (checkDirectoryExists(projectPath)) {
            const overwrite = await vscode.window.showWarningMessage(
                `Directory "${projectName}" already exists. Do you want to overwrite it?`,
                'Yes, overwrite',
                'No, cancel'
            );

            if (overwrite !== 'Yes, overwrite') {
                return;
            }

            removeDirectory(projectPath);
        }

        // Create project directory
        fs.mkdirSync(projectPath, { recursive: true });

        // Prepare project options
        const projectOptions: ProjectOptions = {
            name: projectName,
            type: isMonorepo ? 'monorepo' : 'package',
            path: projectPath,
            gitIntegration: shouldInitializeLocalGit,
            githubRepo,
            gitUserName,
            gitUserEmail
        };

        // Show progress and create project
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Creating ${projectOptions.type}: ${projectName}`,
            cancellable: false
        }, async (progress) => {
            try {
                if (projectOptions.type === 'monorepo') {
                    await createMonorepoStructure(
                        projectPath, 
                        projectName, 
                        progress,
                        true,
                        projectOptions.githubRepo
                    );
                } else {
                    await createStandalonePackage(projectPath, projectName, progress, packageType, undefined);
                }

                if (projectOptions.gitIntegration) {
                    progress.report({ message: 'Initializing Git repository...' });

                    if (gitUserName && gitUserEmail) {
                        await initializeGitRepository(projectPath, githubRepo, gitUserName, gitUserEmail);
                    } else {
                        await initializeLocalGitRepository(projectPath);
                    }
                }

            } catch (error) {
                vscode.window.showErrorMessage(`Error creating project: ${error}`);
                return;
            }
        });

        // Open the new project in VS Code AFTER everything is created
        const uri = vscode.Uri.file(projectPath);
        await vscode.commands.executeCommand('vscode.openFolder', uri, false);

    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    }
}
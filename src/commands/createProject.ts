import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ProjectOptions, ProjectTypeChoice } from '../types';
import { 
    validateProjectName, 
    validateGitHubRepo, 
    validateGitUserName, 
    validateGitEmail,
    checkDirectoryExists,
    removeDirectory,
    checkPrerequisites,
    showPrerequisiteDialog,
    installMissingExtensions
} from '../utils';
import { initializeGitRepository } from '../utils/git';
import { createMonorepoStructure } from '../generators/monorepo';
// import { createPackageStructure } from '../generators/package'; // TODO: Create this

export async function createPythonProject(): Promise<void> {
    try {
        // Check prerequisites first
        const prerequisiteResult = await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Checking development prerequisites...",
            cancellable: false
        }, async (progress) => {
            progress.report({ message: 'Verifying Python installation...' });
            return await checkPrerequisites();
        });
        
        // Handle prerequisite results
        if (!prerequisiteResult.canProceed) {
            const continueAnyway = await showPrerequisiteDialog(prerequisiteResult);
            if (!continueAnyway) {
                return;
            }
        } else if (prerequisiteResult.warnings.length > 0) {
            // Show optional installation dialog for warnings
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
                return; // User cancelled
            }
        }

        // Ask user for project name
        const projectName = await vscode.window.showInputBox({
            placeHolder: 'Enter project name',
            prompt: 'What name would you like for your Python project?',
            validateInput: validateProjectName
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

        // Ask if user wants Git integration
        const gitIntegration = await vscode.window.showQuickPick(
            ['Yes, initialize Git and GitHub integration', 'No, just create project structure'],
            {
                placeHolder: 'Do you want to initialize Git and GitHub integration?'
            }
        );

        let githubRepo = '';
        let gitUserName = '';
        let gitUserEmail = '';

        if (gitIntegration?.startsWith('Yes')) {
            // Get GitHub repository info
            githubRepo = await vscode.window.showInputBox({
                placeHolder: 'username/repository-name',
                prompt: 'Enter GitHub repository (username/repo-name) - Optional, press Enter to skip',
                validateInput: validateGitHubRepo
            }) || '';

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
            gitIntegration: gitIntegration?.startsWith('Yes'),
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
                        projectOptions.gitIntegration,
                        projectOptions.githubRepo
                    );
                } else {
                    // await createPackageStructure(projectPath, projectName, progress);
                    // TODO: Implement package structure creation
                    progress.report({ message: 'Package creation not yet implemented in refactored version' });
                }

                if (projectOptions.gitIntegration) {
                    progress.report({ message: 'Initializing Git repository...' });
                    await initializeGitRepository(projectPath, githubRepo, gitUserName, gitUserEmail);
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
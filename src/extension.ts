import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { createPythonProject, setupPythonProject, startServers, addPackageToMonorepo, listMonorepoPackages } from './commands';
import { checkPrerequisites, showPrerequisiteDialog, installMissingExtensions } from './utils';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    console.log('Python Monorepo Generator extension is now active!');

    // Check if this is a first-time open of a generated project
    checkAndOpenWelcome();

    // Main command to create projects
    const createProjectDisposable = vscode.commands.registerCommand(
        'pythonMonorepoGenerator.createMonorepo', 
        createPythonProject
    );

    // Command to check prerequisites
    const checkPrereqDisposable = vscode.commands.registerCommand(
        'pythonMonorepoGenerator.checkPrerequisites',
        async () => {
            const result = await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Checking development prerequisites...",
                cancellable: false
            }, checkPrerequisites);

            await showPrerequisiteDialog(result);
        }
    );

    // Command to install extensions
    const installExtensionsDisposable = vscode.commands.registerCommand(
        'pythonMonorepoGenerator.installExtensions',
        installMissingExtensions
    );

    // Command to setup project after creation
    const setupProjectDisposable = vscode.commands.registerCommand(
        'pythonMonorepoGenerator.setupProject',
        setupPythonProject
    );

    // Command to start servers
    const startServersDisposable = vscode.commands.registerCommand(
        'pythonMonorepoGenerator.startServers',
        startServers
    );

    // Command to add package to monorepo
    const addPackageDisposable = vscode.commands.registerCommand(
        'pythonMonorepoGenerator.addPackage',
        addPackageToMonorepo
    );

    // Command to list packages in monorepo
    const listPackagesDisposable = vscode.commands.registerCommand(
        'pythonMonorepoGenerator.listPackages',
        listMonorepoPackages
    );

    context.subscriptions.push(
        createProjectDisposable, 
        checkPrereqDisposable, 
        installExtensionsDisposable,
        setupProjectDisposable,
        startServersDisposable,
        addPackageDisposable,
        listPackagesDisposable
    );
}

async function checkAndOpenWelcome() {
    // Check if there's a .vscode/.welcome_pending or .setup_pending file in the workspace
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        return;
    }
    
    const welcomeMarkerPath = path.join(workspaceFolder.uri.fsPath, '.vscode', '.welcome_pending');
    const setupMarkerPath = path.join(workspaceFolder.uri.fsPath, '.vscode', '.setup_pending');
    const welcomePath = path.join(workspaceFolder.uri.fsPath, 'GETTING_STARTED.md');
    
    const hasWelcomeMarker = fs.existsSync(welcomeMarkerPath);
    const hasSetupMarker = fs.existsSync(setupMarkerPath);
    
    if (hasWelcomeMarker) {
        // Delete the welcome marker file
        try {
            fs.unlinkSync(welcomeMarkerPath);
        } catch (error) {
            console.error('Failed to delete welcome marker:', error);
        }
        
        // Show a message that the project is being prepared
        const preparing = vscode.window.setStatusBarMessage('$(sync~spin) Preparing workspace...');
        
        // Wait a bit for the Python extension to activate and read settings
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Open the welcome file
        if (fs.existsSync(welcomePath)) {
            try {
                const doc = await vscode.workspace.openTextDocument(welcomePath);
                await vscode.window.showTextDocument(doc, { preview: false });
                preparing.dispose();
            } catch (error) {
                console.error('Failed to open welcome file:', error);
                preparing.dispose();
            }
        } else {
            preparing.dispose();
        }
    }
    
    // Check if setup is pending
    if (hasSetupMarker) {
        // Delete the setup marker file
        try {
            fs.unlinkSync(setupMarkerPath);
        } catch (error) {
            console.error('Failed to delete setup marker:', error);
        }
        
        // Wait a bit more if welcome was just opened
        if (hasWelcomeMarker) {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        const gitPath = path.join(workspaceFolder.uri.fsPath, '.git');
        const hasGitRepository = fs.existsSync(gitPath);
        const hasMonorepoMarker = fs.existsSync(path.join(workspaceFolder.uri.fsPath, 'backend', 'main.py'));
        const hasPackageMarkers = fs.existsSync(path.join(workspaceFolder.uri.fsPath, 'src')) &&
            (fs.existsSync(path.join(workspaceFolder.uri.fsPath, 'pyproject.toml')) ||
             fs.existsSync(path.join(workspaceFolder.uri.fsPath, 'package.json')));
        const entityLabel = hasMonorepoMarker ? 'Monorepo' : (hasPackageMarkers ? 'Package' : 'Project');
        const setupNowLabel = hasMonorepoMarker
            ? 'Setup Monorepo Now'
            : hasPackageMarkers
                ? 'Setup Package Now'
                : 'Setup Project Now';
        
        const actions = hasGitRepository
            ? [setupNowLabel, 'Later']
            : [setupNowLabel, 'Initialize Git Now', 'Later'];

        const choice = await vscode.window.showInformationMessage(
            `✅ ${entityLabel} created successfully! 🚀 Ready to setup? Install dependencies and optionally create an initial commit.`,
            ...actions
        );

        if (choice === setupNowLabel) {
            vscode.commands.executeCommand('pythonMonorepoGenerator.setupProject').then(() => {}, () => {});
        } else if (choice === 'Initialize Git Now') {
            const initialized = await initializeLocalGitRepository(workspaceFolder.uri.fsPath);
            if (initialized) {
                const followUp = await vscode.window.showInformationMessage(
                    `✅ Local Git repository initialized. Do you want to continue with ${entityLabel.toLowerCase()} setup now?`,
                    setupNowLabel,
                    'Later'
                );

                if (followUp === setupNowLabel) {
                    vscode.commands.executeCommand('pythonMonorepoGenerator.setupProject').then(() => {}, () => {});
                }
            }
        }
    }
}

async function initializeLocalGitRepository(projectPath: string): Promise<boolean> {
    try {
        try {
            await execAsync('git init -b main', { cwd: projectPath });
        } catch {
            await execAsync('git init', { cwd: projectPath });

            try {
                await execAsync('git symbolic-ref HEAD refs/heads/main', { cwd: projectPath });
            } catch {
            }

            try {
                await execAsync('git branch -M main', { cwd: projectPath });
            } catch {
            }
        }

        return true;
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to initialize local Git repository: ${message}`);
        return false;
    }
}

export function deactivate() {}
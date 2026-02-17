import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createPythonProject, setupPythonProject, startServers } from './commands';
import { checkPrerequisites, showPrerequisiteDialog, installMissingExtensions } from './utils';

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

    context.subscriptions.push(
        createProjectDisposable, 
        checkPrereqDisposable, 
        installExtensionsDisposable,
        setupProjectDisposable,
        startServersDisposable
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
        
        // Wait a bit for the Python extension to activate and read settings
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Open the welcome file
        if (fs.existsSync(welcomePath)) {
            try {
                const doc = await vscode.workspace.openTextDocument(welcomePath);
                await vscode.window.showTextDocument(doc, { preview: false });
            } catch (error) {
                console.error('Failed to open welcome file:', error);
            }
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
        
        // Ask user if they want to setup the project now
        const choice = await vscode.window.showInformationMessage(
            '🚀 Ready to setup your project? Install dependencies and configure everything automatically.',
            'Setup Now',
            'Later'
        );
        
        if (choice === 'Setup Now') {
            vscode.commands.executeCommand('pythonMonorepoGenerator.setupProject').then(() => {}, () => {});
        }
    }
}

export function deactivate() {}
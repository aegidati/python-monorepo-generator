import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createPythonProject } from './commands';
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

    context.subscriptions.push(createProjectDisposable, checkPrereqDisposable, installExtensionsDisposable);
}

async function checkAndOpenWelcome() {
    // Check if there's a .vscode/.welcome_pending file in the workspace
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        return;
    }
    
    const markerPath = path.join(workspaceFolder.uri.fsPath, '.vscode', '.welcome_pending');
    const welcomePath = path.join(workspaceFolder.uri.fsPath, 'GETTING_STARTED.md');
    
    if (fs.existsSync(markerPath)) {
        // Delete the marker file
        try {
            fs.unlinkSync(markerPath);
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
}

export function deactivate() {}
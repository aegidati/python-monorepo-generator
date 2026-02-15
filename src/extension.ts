import * as vscode from 'vscode';
import { createPythonProject } from './commands';
import { checkPrerequisites, showPrerequisiteDialog, installMissingExtensions } from './utils';

export function activate(context: vscode.ExtensionContext) {
    console.log('Python Monorepo Generator extension is now active!');

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

export function deactivate() {}
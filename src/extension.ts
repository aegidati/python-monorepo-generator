import * as vscode from 'vscode';
import { createPythonProject } from './commands';

export function activate(context: vscode.ExtensionContext) {
    console.log('Python Monorepo Generator extension is now active!');

    const disposable = vscode.commands.registerCommand(
        'pythonMonorepoGenerator.createMonorepo', 
        createPythonProject
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
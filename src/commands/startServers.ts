import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

interface ServerOptions {
    startBackend: boolean;
    startFrontendWeb: boolean;
    startMobile: boolean;
}

export async function startServers() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    
    if (!workspaceFolder) {
        vscode.window.showErrorMessage('No workspace folder is open. Please open a project folder first.');
        return;
    }

    const projectRoot = workspaceFolder.uri.fsPath;
    
    // Ask user which servers to start
    const options = await promptServerOptions(projectRoot);
    if (!options) {
        return; // User cancelled
    }

    // Check if any server was selected
    if (!options.startBackend && !options.startFrontendWeb && !options.startMobile) {
        vscode.window.showInformationMessage('No servers selected to start.');
        return;
    }

    try {
        const startedServers: string[] = [];

        // Start Backend
        if (options.startBackend) {
            await startBackendServer(projectRoot);
            startedServers.push('Backend (http://localhost:8000)');
        }

        // Start Frontend Web
        if (options.startFrontendWeb) {
            await startFrontendWebServer(projectRoot);
            startedServers.push('Frontend Web (http://localhost:5173)');
        }

        // Start Mobile
        if (options.startMobile) {
            await startMobileServer(projectRoot);
            startedServers.push('Mobile (React Native)');
        }

        if (startedServers.length > 0) {
            vscode.window.showInformationMessage(
                `✅ Started: ${startedServers.join(', ')}`,
                'View Terminals'
            ).then(selection => {
                if (selection === 'View Terminals') {
                    vscode.commands.executeCommand('workbench.action.terminal.focus').then(() => {}, () => {});
                }
            }, () => {});
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to start servers: ${errorMessage}`);
    }
}

async function promptServerOptions(projectRoot: string): Promise<ServerOptions | undefined> {
    // Check what's available
    const hasBackend = fs.existsSync(path.join(projectRoot, 'backend', 'main.py'));
    const hasFrontendWeb = fs.existsSync(path.join(projectRoot, 'frontend', 'web', 'package.json'));
    const hasMobile = fs.existsSync(path.join(projectRoot, 'frontend', 'mobile', 'package.json'));

    const items: vscode.QuickPickItem[] = [];
    
    if (hasBackend) {
        items.push({
            label: '$(server) Start Backend Server',
            description: 'FastAPI on http://localhost:8000',
            picked: true
        });
    }

    if (hasFrontendWeb) {
        items.push({
            label: '$(browser) Start Frontend Web',
            description: 'React + Vite on http://localhost:5173',
            picked: true
        });
    }

    if (hasMobile) {
        items.push({
            label: '$(device-mobile) Start Mobile App',
            description: 'React Native packager',
            picked: false
        });
    }

    if (items.length === 0) {
        vscode.window.showWarningMessage('No servers found in this project.');
        return undefined;
    }

    const selected = await vscode.window.showQuickPick(items, {
        title: 'Select Servers to Start',
        placeHolder: 'Choose which servers to run',
        canPickMany: true,
        ignoreFocusOut: false
    });

    if (!selected || selected.length === 0) {
        return undefined;
    }

    return {
        startBackend: selected.some(s => s.label.includes('Backend Server')),
        startFrontendWeb: selected.some(s => s.label.includes('Frontend Web')),
        startMobile: selected.some(s => s.label.includes('Mobile App'))
    };
}

async function startBackendServer(projectRoot: string): Promise<void> {
    const backendPath = path.join(projectRoot, 'backend');
    const venvPath = path.join(projectRoot, 'venv');
    
    if (!fs.existsSync(backendPath)) {
        throw new Error('Backend folder not found.');
    }

    if (!fs.existsSync(venvPath)) {
        throw new Error('Virtual environment not found. Please run setup first.');
    }

    const terminal = vscode.window.createTerminal({
        name: '▶️ Backend Server',
        cwd: backendPath
    });

    terminal.show();

    // Determine the correct activation command based on OS
    const isWindows = process.platform === 'win32';
    const activateCmd = isWindows 
        ? `..\\venv\\Scripts\\Activate.ps1` 
        : `source ../venv/bin/activate`;

    // Start the backend server
    terminal.sendText(`${activateCmd} ; python main.py`, true);
    
    // Wait a bit before showing success
    await new Promise(resolve => setTimeout(resolve, 500));
}

async function startFrontendWebServer(projectRoot: string): Promise<void> {
    const webPath = path.join(projectRoot, 'frontend', 'web');
    
    if (!fs.existsSync(webPath)) {
        throw new Error('Frontend web folder not found.');
    }

    const nodeModulesPath = path.join(webPath, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        const response = await vscode.window.showWarningMessage(
            'Frontend dependencies not installed. Install them first?',
            'Install & Start',
            'Cancel'
        );
        
        if (response === 'Install & Start') {
            // Install dependencies first
            const installTerminal = vscode.window.createTerminal({
                name: '📦 Installing Web Dependencies',
                cwd: webPath
            });
            installTerminal.show();
            installTerminal.sendText('npm install && npm run dev', true);
        }
        // User cancelled or closed dialog - just return without error
        return;
    }

    const terminal = vscode.window.createTerminal({
        name: '🎨 Frontend Web',
        cwd: webPath
    });

    terminal.show();
    terminal.sendText('npm run dev', true);
    
    // Wait a bit before showing success
    await new Promise(resolve => setTimeout(resolve, 500));
}

async function startMobileServer(projectRoot: string): Promise<void> {
    const mobilePath = path.join(projectRoot, 'frontend', 'mobile');
    
    if (!fs.existsSync(mobilePath)) {
        throw new Error('Mobile folder not found.');
    }

    const nodeModulesPath = path.join(mobilePath, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
        const response = await vscode.window.showWarningMessage(
            'Mobile dependencies not installed. Install them first?',
            'Install & Start',
            'Cancel'
        );
        
        if (response === 'Install & Start') {
            // Install dependencies first
            const installTerminal = vscode.window.createTerminal({
                name: '📦 Installing Mobile Dependencies',
                cwd: mobilePath
            });
            installTerminal.show();
            installTerminal.sendText('npm install && npm start', true);
        }
        // User cancelled or closed dialog - just return without error
        return;
    }

    const terminal = vscode.window.createTerminal({
        name: '📱 Mobile App',
        cwd: mobilePath
    });

    terminal.show();
    terminal.sendText('npm start', true);
    
    // Wait a bit before showing success
    await new Promise(resolve => setTimeout(resolve, 500));
}

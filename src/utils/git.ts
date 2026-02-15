import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function initializeGitRepository(
    projectPath: string, 
    githubRepo: string, 
    userName: string, 
    userEmail: string
): Promise<void> {
    try {
        // Initialize git repository
        await execAsync('git init', { cwd: projectPath });

        // Configure git user
        await execAsync(`git config user.name "${userName}"`, { cwd: projectPath });
        await execAsync(`git config user.email "${userEmail}"`, { cwd: projectPath });

        // Add all files
        await execAsync('git add .', { cwd: projectPath });

        // Make initial commit
        await execAsync('git commit -m "Initial commit: Project structure created"', { cwd: projectPath });

        // Add GitHub remote if provided
        if (githubRepo) {
            const remoteUrl = `https://github.com/${githubRepo}.git`;
            await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectPath });
            
            vscode.window.showInformationMessage(
                `Git repository initialized and connected to ${githubRepo}. You can push your code using 'git push -u origin main'`
            );
        } else {
            vscode.window.showInformationMessage('Git repository initialized locally.');
        }

    } catch (error) {
        console.error('Git initialization error:', error);
        vscode.window.showWarningMessage(`Git initialization failed: ${error}`);
    }
}
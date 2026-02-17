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
        // Set environment to prevent Git from opening an editor
        const gitEnv = {
            ...process.env,
            GIT_EDITOR: 'true',
            GIT_TERMINAL_PROMPT: '0'
        };

        // Initialize git repository
        await execAsync('git init', { cwd: projectPath, env: gitEnv });

        // Configure git user
        await execAsync(`git config user.name "${userName}"`, { cwd: projectPath, env: gitEnv });
        await execAsync(`git config user.email "${userEmail}"`, { cwd: projectPath, env: gitEnv });
        // Prevent editor from opening on commits
        await execAsync('git config core.editor "true"', { cwd: projectPath, env: gitEnv });

        // Stage all files (commit will be done after setup)
        await execAsync('git add .', { cwd: projectPath, env: gitEnv });

        // Add GitHub remote if provided
        if (githubRepo) {
            const remoteUrl = `https://github.com/${githubRepo}.git`;
            await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectPath, env: gitEnv });
            
            vscode.window.showInformationMessage(
                `Git repository initialized and connected to ${githubRepo}. Files staged. Run "Setup Project" to complete configuration and commit.`
            );
        } else {
            vscode.window.showInformationMessage(
                'Git repository initialized locally. Files staged. Run "Setup Project" to complete configuration and commit.'
            );
        }

    } catch (error) {
        console.error('Git initialization error:', error);
        vscode.window.showWarningMessage(`Git initialization failed: ${error}`);
    }
}
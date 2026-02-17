import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as https from 'https';

const execAsync = promisify(exec);

/**
 * Make an HTTPS request
 */
function httpsRequest(
    url: string,
    options: https.RequestOptions,
    data?: string
): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode || 0,
                    body
                });
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(data);
        }
        
        req.end();
    });
}

/**
 * Create a GitHub repository using VS Code's GitHub authentication
 * @param repoName Repository name (format: username/repo-name)
 * @param description Repository description
 * @param isPrivate Whether the repository should be private
 * @returns True if repository was created successfully
 */
export async function createGitHubRepository(
    repoName: string,
    description: string = '',
    isPrivate: boolean = false
): Promise<boolean> {
    try {
        // Get GitHub authentication session
        const session = await vscode.authentication.getSession('github', ['repo'], { createIfNone: true });
        
        if (!session) {
            vscode.window.showWarningMessage('GitHub authentication failed. Please try again.');
            return false;
        }

        // Extract username and repo name
        const [owner, repo] = repoName.split('/');
        
        if (!owner || !repo) {
            throw new Error('Invalid repository name format. Expected: username/repo-name');
        }

        const commonHeaders = {
            'Authorization': `token ${session.accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'VSCode-Python-Monorepo-Generator'
        };

        // Check if repository already exists
        const checkResponse = await httpsRequest(
            `https://api.github.com/repos/${owner}/${repo}`,
            {
                method: 'GET',
                headers: commonHeaders
            }
        );

        if (checkResponse.statusCode === 200) {
            // Repository already exists
            vscode.window.showInformationMessage(`Repository ${repoName} already exists on GitHub.`);
            return true;
        }

        // Create the repository
        const repoData = JSON.stringify({
            name: repo,
            description: description || `Python monorepo project: ${repo}`,
            private: isPrivate,
            auto_init: false,
            has_issues: true,
            has_projects: false,
            has_wiki: false
        });

        const createResponse = await httpsRequest(
            'https://api.github.com/user/repos',
            {
                method: 'POST',
                headers: {
                    ...commonHeaders,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(repoData)
                }
            },
            repoData
        );

        if (createResponse.statusCode !== 201) {
            const errorData = JSON.parse(createResponse.body);
            throw new Error(errorData.message || 'Failed to create repository');
        }

        vscode.window.showInformationMessage(`✅ Repository ${repoName} created successfully on GitHub!`);
        
        return true;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`Failed to create GitHub repository: ${errorMessage}`);
        return false;
    }
}

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

        // Create GitHub repository and add remote if provided
        if (githubRepo) {
            // Show creating repository message
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: `Creating GitHub repository: ${githubRepo}`,
                cancellable: false
            }, async () => {
                const created = await createGitHubRepository(githubRepo);
                
                if (created) {
                    const remoteUrl = `https://github.com/${githubRepo}.git`;
                    await execAsync(`git remote add origin ${remoteUrl}`, { cwd: projectPath, env: gitEnv });
                    
                    vscode.window.showInformationMessage(
                        `✅ GitHub repository created and configured! Files staged. Run "Setup Project" to install dependencies and push.`
                    );
                } else {
                    vscode.window.showWarningMessage(
                        'Failed to create GitHub repository. You can create it manually later.'
                    );
                }
            });
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
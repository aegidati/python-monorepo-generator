import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ProgressReporter } from '../types';
import { createDirectories } from '../utils';

const execAsync = promisify(exec);
import { 
    createMonorepoReadme,
    createMonorepoPyprojectToml,
    createWorkspaceFile 
} from '../templates/monorepoTemplates';
import { 
    createGitignore,
    createRootRequirements,
    createDevRequirements 
} from '../templates/commonTemplates';
import {
    createBackendMain,
    createBackendPyprojectToml,
    createBackendRequirements,
    createApiRoutes,
    createCoreConfig,
    createBackendTests
} from '../templates/backendTemplates';
import {
    createFrontendIndex,
    createFrontendPackageJson,
    createFrontendApp,
    createFrontendStyles
} from '../templates/frontendTemplates';
import {
    createMobilePackageJson,
    createMobileApp,
    createMetroConfig
} from '../templates/mobileTemplates';
import {
    createSetupScript,
    createTestScript
} from '../templates/scriptsTemplates';
import {
    createVSCodeSettings,
    createMonorepoTasks,
    createMonorepoLaunchConfig,
    createVSCodeExtensions
} from '../templates/vscodeTemplates';
import { createGettingStarted } from '../templates/gettingStartedTemplate';

export async function createMonorepoStructure(
    projectPath: string, 
    name: string, 
    progress: ProgressReporter,
    gitIntegration: boolean = false,
    githubRepo?: string
): Promise<void> {
    const folders = [
        'backend',
        'backend/api',
        'backend/core',
        'backend/tests',
        'frontend',
        'frontend/web',
        'frontend/web/public',
        'frontend/web/src',
        'frontend/web/src/components',
        'frontend/web/src/styles',
        'frontend/mobile',
        'frontend/mobile/src',
        'frontend/mobile/src/components',
        'frontend/mobile/src/screens',
        'packages',
        'docs',
        'scripts',
        '.vscode'
    ];

    progress.report({ message: 'Creating directory structure...' });
    createDirectories(projectPath, folders);

    progress.report({ message: 'Creating configuration files...' });
    
    // Create root files
    fs.writeFileSync(path.join(projectPath, 'README.md'), createMonorepoReadme(name));
    fs.writeFileSync(path.join(projectPath, 'GETTING_STARTED.md'), createGettingStarted(name, gitIntegration, githubRepo));
    fs.writeFileSync(path.join(projectPath, 'pyproject.toml'), createMonorepoPyprojectToml(name));
    fs.writeFileSync(path.join(projectPath, '.gitignore'), createGitignore());
    fs.writeFileSync(path.join(projectPath, 'requirements.txt'), createRootRequirements());
    fs.writeFileSync(path.join(projectPath, 'requirements-dev.txt'), createDevRequirements());

    progress.report({ message: 'Creating backend files...' });
    fs.writeFileSync(path.join(projectPath, 'backend', 'main.py'), createBackendMain());
    fs.writeFileSync(path.join(projectPath, 'backend', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'backend', 'pyproject.toml'), createBackendPyprojectToml());
    fs.writeFileSync(path.join(projectPath, 'backend', 'requirements.txt'), createBackendRequirements());
    fs.writeFileSync(path.join(projectPath, 'backend', 'api', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'backend', 'api', 'routes.py'), createApiRoutes());
    fs.writeFileSync(path.join(projectPath, 'backend', 'core', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'backend', 'core', 'config.py'), createCoreConfig());
    fs.writeFileSync(path.join(projectPath, 'backend', 'tests', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'backend', 'tests', 'test_main.py'), createBackendTests());

    progress.report({ message: 'Creating frontend files...' });
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'index.html'), createFrontendIndex());
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'package.json'), createFrontendPackageJson(name));
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'vite.config.js'), `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
`);
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'src', 'main.jsx'), `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`);
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'src', 'App.jsx'), createFrontendApp());
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'src', 'App.css'), createFrontendStyles());
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'src', 'index.css'), `:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  
  color-scheme: light dark;
  color: rgba(0, 0, 0, 0.87);
  background-color: #f5f5f5;
  
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
}

#root {
  width: 100%;
}

* {
  box-sizing: border-box;
}
`);

    progress.report({ message: 'Creating mobile files...' });
    fs.writeFileSync(path.join(projectPath, 'frontend', 'mobile', 'package.json'), createMobilePackageJson(name));
    fs.writeFileSync(path.join(projectPath, 'frontend', 'mobile', 'App.js'), createMobileApp());
    fs.writeFileSync(path.join(projectPath, 'frontend', 'mobile', 'metro.config.js'), createMetroConfig());

    // Scripts
    fs.writeFileSync(path.join(projectPath, 'scripts', 'setup.py'), createSetupScript());
    fs.writeFileSync(path.join(projectPath, 'scripts', 'test.py'), createTestScript());

    // Create Python virtual environment BEFORE VS Code settings
    progress.report({ message: 'Creating Python virtual environment...' });
    let venvCreated = false;
    let pythonExecutable = '';
    
    try {
        // Try different Python commands (Windows might use py or python)
        const pythonCommands = ['python', 'python3', 'py'];
        
        for (const pythonCmd of pythonCommands) {
            try {
                // Create venv
                await execAsync(`${pythonCmd} -m venv venv`, { cwd: projectPath });
                
                // Verify that the venv was actually created by checking for python executable
                const isWindows = process.platform === 'win32';
                const venvPythonPath = path.join(projectPath, 'venv', isWindows ? 'Scripts' : 'bin', isWindows ? 'python.exe' : 'python');
                
                if (fs.existsSync(venvPythonPath)) {
                    pythonExecutable = venvPythonPath;
                    progress.report({ message: `Virtual environment created successfully with ${pythonCmd}!` });
                    venvCreated = true;
                    
                    // Upgrade pip to latest version (basic setup)
                    progress.report({ message: 'Upgrading pip to latest version...' });
                    try {
                        const pipUpgradeCmd = isWindows 
                            ? `"${venvPythonPath}" -m pip install --upgrade pip`
                            : `"${venvPythonPath}" -m pip install --upgrade pip`;
                        await execAsync(pipUpgradeCmd, { cwd: projectPath });
                        progress.report({ message: 'pip upgraded successfully!' });
                    } catch (pipError) {
                        console.error('pip upgrade error:', pipError);
                        // Non bloccare se l'upgrade di pip fallisce
                    }
                    
                    // Note: Dependencies installation moved to "Setup Project" command
                    // Users should run "Python Generator: Setup Project" after creation
                    
                    break;
                }
            } catch (err) {
                // Try next command
                continue;
            }
        }
        
        if (!venvCreated) {
            throw new Error('No valid Python command found');
        }
    } catch (error) {
        progress.report({ message: 'Warning: Could not create virtual environment. Please create it manually using: python -m venv venv' });
        console.error('Virtual environment creation error:', error);
    }

    progress.report({ message: 'Creating VS Code configuration...' });
    fs.writeFileSync(path.join(projectPath, '.vscode', 'tasks.json'), createMonorepoTasks());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'launch.json'), createMonorepoLaunchConfig());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'settings.json'), createVSCodeSettings());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'extensions.json'), createVSCodeExtensions());
    
    // Create marker files to trigger actions on first open
    fs.writeFileSync(path.join(projectPath, '.vscode', '.welcome_pending'), '');
    fs.writeFileSync(path.join(projectPath, '.vscode', '.setup_pending'), '');

    progress.report({ message: 'Monorepo structure created successfully!' });
}
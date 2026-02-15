import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    console.log('Python Monorepo Generator extension is now active!');

    const disposable = vscode.commands.registerCommand('pythonMonorepoGenerator.createMonorepo', async () => {
        await createPythonProject();
    });

    context.subscriptions.push(disposable);
}

async function createPythonProject() {
    try {
        // Ask user for project name
        const projectName = await vscode.window.showInputBox({
            placeHolder: 'Enter project name',
            prompt: 'What name would you like for your Python project?',
            validateInput: (value: string) => {
                if (!value || value.trim().length === 0) {
                    return 'Please enter a valid project name';
                }
                if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) {
                    return 'Name should start with letter/number and contain only letters, numbers, hyphens, and underscores';
                }
                return null;
            }
        });

        if (!projectName) {
            return;
        }

        // Ask user what type of project to create
        const projectType = await vscode.window.showQuickPick(
            [
                {
                    label: '🏗️ Complete Monorepo',
                    description: 'Backend + Frontend + Mobile + Apps + Packages + Docs',
                    detail: 'Full monorepo structure with all components'
                },
                {
                    label: '📦 Python Package',
                    description: 'Single Python package with tests and documentation',
                    detail: 'Lightweight package structure for libraries and tools'
                }
            ],
            {
                placeHolder: 'What type of project do you want to create?'
            }
        );

        if (!projectType) {
            return;
        }

        const isMonorepo = projectType.label.includes('Monorepo');

        // Ask if user wants Git integration
        const gitIntegration = await vscode.window.showQuickPick(
            ['Yes, initialize Git and GitHub integration', 'No, just create project structure'],
            {
                placeHolder: 'Do you want to initialize Git and GitHub integration?'
            }
        );

        let githubRepo = '';
        let gitUserName = '';
        let gitUserEmail = '';

        if (gitIntegration?.startsWith('Yes')) {
            // Get GitHub repository info
            githubRepo = await vscode.window.showInputBox({
                placeHolder: 'username/repository-name',
                prompt: 'Enter GitHub repository (username/repo-name) - Optional, press Enter to skip',
                validateInput: (value: string) => {
                    if (value && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\/[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value)) {
                        return 'Format should be: username/repository-name';
                    }
                    return null;
                }
            }) || '';

            // Get Git user info
            gitUserName = await vscode.window.showInputBox({
                placeHolder: 'Your Name',
                prompt: 'Enter your Git username',
                validateInput: (value: string) => {
                    if (!value || value.trim().length === 0) {
                        return 'Please enter your Git username';
                    }
                    return null;
                }
            }) || '';

            if (!gitUserName) {
                return;
            }

            gitUserEmail = await vscode.window.showInputBox({
                placeHolder: 'your.email@example.com',
                prompt: 'Enter your Git email',
                validateInput: (value: string) => {
                    if (!value || value.trim().length === 0) {
                        return 'Please enter your Git email';
                    }
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        return 'Please enter a valid email address';
                    }
                    return null;
                }
            }) || '';

            if (!gitUserEmail) {
                return;
            }
        }

        // Get workspace folder or ask user to select one
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        let basePath: string;

        if (workspaceFolder) {
            basePath = workspaceFolder.uri.fsPath;
        } else {
            const folderUri = await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                title: 'Select folder where to create the project'
            });

            if (!folderUri || folderUri.length === 0) {
                return;
            }

            basePath = folderUri[0].fsPath;
        }

        const projectPath = path.join(basePath, projectName);

        // Check if directory already exists
        if (fs.existsSync(projectPath)) {
            const overwrite = await vscode.window.showWarningMessage(
                `Directory "${projectName}" already exists. Do you want to overwrite it?`,
                'Yes, overwrite',
                'No, cancel'
            );

            if (overwrite !== 'Yes, overwrite') {
                return;
            }

            // Remove existing directory
            fs.rmSync(projectPath, { recursive: true, force: true });
        }

        // Create project directory
        fs.mkdirSync(projectPath, { recursive: true });

        // Show progress
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Creating ${isMonorepo ? 'monorepo' : 'package'}: ${projectName}`,
            cancellable: false
        }, async (progress) => {
            try {
                if (isMonorepo) {
                    await createMonorepoStructure(projectPath, projectName, progress);
                } else {
                    await createPackageStructure(projectPath, projectName, progress);
                }

                if (gitIntegration?.startsWith('Yes')) {
                    progress.report({ message: 'Initializing Git repository...' });
                    await initializeGitRepository(projectPath, githubRepo, gitUserName, gitUserEmail);
                }

                progress.report({ message: 'Opening project...' });
                
                // Open the new project in VS Code
                const uri = vscode.Uri.file(projectPath);
                await vscode.commands.executeCommand('vscode.openFolder', uri, true);

            } catch (error) {
                vscode.window.showErrorMessage(`Error creating project: ${error}`);
            }
        });

    } catch (error) {
        vscode.window.showErrorMessage(`Error: ${error}`);
    }
}

async function createMonorepoStructure(projectPath: string, name: string, progress: vscode.Progress<{increment?: number, message?: string}>) {
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
        'mobile',
        'mobile/react-native',
        'mobile/react-native/src',
        'mobile/react-native/src/components',
        'mobile/react-native/src/screens',
        'apps',
        'packages',
        'docs',
        'scripts',
        '.vscode'
    ];

    progress.report({ message: 'Creating directory structure...' });
    
    // Create directories
    folders.forEach(folder => {
        fs.mkdirSync(path.join(projectPath, folder), { recursive: true });
    });

    progress.report({ message: 'Creating configuration files...' });

    // Create root files
    fs.writeFileSync(path.join(projectPath, 'README.md'), createMonorepoReadme(name));
    fs.writeFileSync(path.join(projectPath, 'pyproject.toml'), createMonorepoPyprojectToml(name));
    fs.writeFileSync(path.join(projectPath, '.gitignore'), createGitignore());
    fs.writeFileSync(path.join(projectPath, 'requirements.txt'), createRootRequirements());
    fs.writeFileSync(path.join(projectPath, 'requirements-dev.txt'), createDevRequirements());
    fs.writeFileSync(path.join(projectPath, `${name}.code-workspace`), createWorkspaceFile(name));

    // Backend files
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

    // Frontend files
    progress.report({ message: 'Creating frontend files...' });
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'index.html'), createFrontendIndex());
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'package.json'), createFrontendPackageJson(name));
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'src', 'app.js'), createFrontendApp());
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'src', 'styles', 'main.css'), createFrontendStyles());

    // Mobile files
    progress.report({ message: 'Creating mobile files...' });
    fs.writeFileSync(path.join(projectPath, 'mobile', 'react-native', 'package.json'), createMobilePackageJson(name));
    fs.writeFileSync(path.join(projectPath, 'mobile', 'react-native', 'App.js'), createMobileApp());

    // Scripts
    fs.writeFileSync(path.join(projectPath, 'scripts', 'setup.py'), createSetupScript());
    fs.writeFileSync(path.join(projectPath, 'scripts', 'test.py'), createTestScript());

    // VS Code configuration
    progress.report({ message: 'Creating VS Code configuration...' });
    fs.writeFileSync(path.join(projectPath, '.vscode', 'tasks.json'), createMonorepoTasks());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'launch.json'), createMonorepoLaunchConfig());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'settings.json'), createVSCodeSettings());

    progress.report({ message: 'Monorepo structure created successfully!' });
}

async function createPackageStructure(projectPath: string, name: string, progress: vscode.Progress<{increment?: number, message?: string}>) {
    const folders = [
        'src',
        'src/' + name.replace(/-/g, '_'),
        'tests',
        'docs',
        '.vscode'
    ];

    progress.report({ message: 'Creating package structure...' });
    
    // Create directories
    folders.forEach(folder => {
        fs.mkdirSync(path.join(projectPath, folder), { recursive: true });
    });

    const packageName = name.replace(/-/g, '_');

    progress.report({ message: 'Creating package files...' });

    // Create package files
    fs.writeFileSync(path.join(projectPath, 'README.md'), createPackageReadme(name));
    fs.writeFileSync(path.join(projectPath, 'pyproject.toml'), createPackagePyprojectToml(name));
    fs.writeFileSync(path.join(projectPath, '.gitignore'), createGitignore());
    fs.writeFileSync(path.join(projectPath, 'requirements.txt'), createPackageRequirements());
    fs.writeFileSync(path.join(projectPath, 'requirements-dev.txt'), createDevRequirements());

    // Package source files
    fs.writeFileSync(path.join(projectPath, 'src', packageName, '__init__.py'), createPackageInit(packageName));
    fs.writeFileSync(path.join(projectPath, 'src', packageName, 'main.py'), createPackageMain(name));
    fs.writeFileSync(path.join(projectPath, 'src', packageName, 'utils.py'), createPackageUtils());

    // Test files
    fs.writeFileSync(path.join(projectPath, 'tests', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'tests', 'test_main.py'), createPackageTests(name));

    // Documentation
    fs.writeFileSync(path.join(projectPath, 'docs', 'usage.md'), createPackageUsageDocs(name));

    // VS Code configuration
    progress.report({ message: 'Creating VS Code configuration...' });
    fs.writeFileSync(path.join(projectPath, '.vscode', 'tasks.json'), createPackageTasks());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'launch.json'), createPackageLaunchConfig());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'settings.json'), createVSCodeSettings());

    progress.report({ message: 'Package structure created successfully!' });
}

async function initializeGitRepository(projectPath: string, githubRepo: string, userName: string, userEmail: string) {
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

// Content creation functions

function createMonorepoReadme(name: string): string {
    return `# ${name}

A modern Python monorepo with backend, frontend, mobile, and documentation.

## Structure

- \`backend/\` - Python FastAPI backend
- \`frontend/web/\` - Web frontend
- \`mobile/react-native/\` - React Native mobile app
- \`apps/\` - Applications
- \`packages/\` - Shared packages
- \`docs/\` - Documentation
- \`scripts/\` - Utility scripts

## Getting Started

1. Install dependencies:
   \`\`\`bash
   pip install -r requirements-dev.txt
   \`\`\`

2. Run backend:
   \`\`\`bash
   cd backend
   python main.py
   \`\`\`

3. Run web frontend:
   \`\`\`bash
   cd frontend/web
   npm install
   npm start
   \`\`\`

## Development

- Use VS Code tasks for common operations
- Run tests with pytest
- Format code with black and isort
- Type checking with mypy

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
`;
}

function createPackageReadme(name: string): string {
    return `# ${name}

A modern Python package with tests and documentation.

## Installation

\`\`\`bash
pip install ${name}
\`\`\`

## Usage

\`\`\`python
from ${name.replace(/-/g, '_')} import hello_world

result = hello_world("World")
print(result)
\`\`\`

## Development

1. Install development dependencies:
   \`\`\`bash
   pip install -r requirements-dev.txt
   \`\`\`

2. Run tests:
   \`\`\`bash
   pytest tests/
   \`\`\`

3. Format code:
   \`\`\`bash
   black src/ tests/
   isort src/ tests/
   \`\`\`

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.
`;
}

function createMonorepoPyprojectToml(name: string): string {
    return `[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "${name}"
version = "0.1.0"
description = "A modern Python monorepo"
readme = "README.md"
requires-python = ">=3.8"
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

[project.optional-dependencies]
dev = [
    "pytest",
    "black",
    "isort",
    "mypy",
    "flake8",
]

[tool.black]
line-length = 88
target-version = ['py38']

[tool.isort]
profile = "black"
line_length = 88

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
`;
}

function createPackagePyprojectToml(name: string): string {
    return `[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "${name}"
version = "0.1.0"
description = "A modern Python package"
readme = "README.md"
requires-python = ">=3.8"
classifiers = [
    "Development Status :: 4 - Beta",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Operating System :: OS Independent",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

[project.optional-dependencies]
dev = [
    "pytest",
    "black",
    "isort",
    "mypy",
    "flake8",
    "pytest-cov",
]

[tool.setuptools.packages.find]
where = ["src"]

[tool.black]
line-length = 88
target-version = ['py38']

[tool.isort]
profile = "black"
line_length = 88

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true

[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-v --tb=short"
`;
}

function createGitignore(): string {
    return `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST
*.manifest
*.spec
pip-log.txt
pip-delete-this-directory.txt
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/
cover/

# Virtual environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# React Native
.expo/
.expo-shared/

# Logs
logs
*.log
`;
}

function createRootRequirements(): string {
    return `# Add your production dependencies here
# Example:
# requests>=2.28.0
# fastapi>=0.68.0
`;
}

function createPackageRequirements(): string {
    return `# Add your production dependencies here
# Example:
# requests>=2.28.0
`;
}

function createDevRequirements(): string {
    return `pytest>=7.0.0
black>=22.0.0
isort>=5.10.0
mypy>=0.950
flake8>=4.0.0
pytest-cov>=4.0.0
`;
}

function createWorkspaceFile(name: string): string {
    return `{
    "folders": [
        {
            "name": "${name}",
            "path": "."
        },
        {
            "name": "Backend",
            "path": "./backend"
        },
        {
            "name": "Frontend Web",
            "path": "./frontend/web"
        },
        {
            "name": "Mobile",
            "path": "./mobile/react-native"
        },
        {
            "name": "Docs",
            "path": "./docs"
        }
    ],
    "settings": {
        "python.defaultInterpreterPath": "./venv/bin/python",
        "python.terminal.activateEnvironment": true
    },
    "extensions": {
        "recommendations": [
            "ms-python.python",
            "ms-python.flake8",
            "ms-python.black-formatter",
            "ms-python.isort",
            "ms-python.mypy-type-checker"
        ]
    }
}`;
}

function createBackendMain(): string {
    return `"""Main application entry point."""

from fastapi import FastAPI
from api.routes import router

app = FastAPI(title="Backend API", version="0.1.0")
app.include_router(router, prefix="/api/v1")

@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Backend API is running!"}

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
`;
}

function createBackendPyprojectToml(): string {
    return `[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "backend"
version = "0.1.0"
description = "Backend API"
requires-python = ">=3.8"
dependencies = [
    "fastapi>=0.68.0",
    "uvicorn[standard]>=0.15.0",
]

[project.optional-dependencies]
dev = [
    "pytest",
    "httpx",
    "pytest-asyncio",
]
`;
}

function createBackendRequirements(): string {
    return `fastapi>=0.68.0
uvicorn[standard]>=0.15.0
`;
}

function createApiRoutes(): string {
    return `"""API routes."""

from fastapi import APIRouter

router = APIRouter()

@router.get("/items")
async def get_items():
    """Get all items."""
    return {"items": ["item1", "item2", "item3"]}

@router.get("/items/{item_id}")
async def get_item(item_id: int):
    """Get item by ID."""
    return {"item_id": item_id, "name": f"Item {item_id}"}
`;
}

function createCoreConfig(): string {
    return `"""Core application configuration."""

import os
from typing import Optional

class Settings:
    """Application settings."""
    
    def __init__(self):
        self.debug: bool = os.getenv("DEBUG", "false").lower() == "true"
        self.database_url: Optional[str] = os.getenv("DATABASE_URL")
        self.secret_key: str = os.getenv("SECRET_KEY", "dev-secret-key")

settings = Settings()
`;
}

function createBackendTests(): string {
    return `"""Tests for backend main module."""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Backend API is running!"}

def test_health_check():
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_get_items():
    """Test get items endpoint."""
    response = client.get("/api/v1/items")
    assert response.status_code == 200
    assert "items" in response.json()
`;
}

function createFrontendIndex(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Frontend App</title>
    <link rel="stylesheet" href="src/styles/main.css">
</head>
<body>
    <div id="app">
        <h1>Frontend Application</h1>
        <p>Welcome to your frontend application!</p>
        <button id="api-test">Test API Connection</button>
        <div id="result"></div>
    </div>
    <script src="src/app.js"></script>
</body>
</html>`;
}

function createFrontendPackageJson(name: string): string {
    return `{
  "name": "${name}-frontend",
  "version": "0.1.0",
  "description": "Frontend for ${name}",
  "main": "src/app.js",
  "scripts": {
    "start": "python -m http.server 8080",
    "build": "echo 'Build step placeholder'",
    "test": "echo 'Test step placeholder'"
  },
  "devDependencies": {
    "live-server": "^1.2.2"
  }
}`;
}

function createFrontendApp(): string {
    return `// Frontend application logic

document.addEventListener('DOMContentLoaded', function() {
    console.log('Frontend application loaded');
    
    const apiTestButton = document.getElementById('api-test');
    const resultDiv = document.getElementById('result');
    
    if (apiTestButton) {
        apiTestButton.addEventListener('click', async function() {
            try {
                const response = await fetch('http://localhost:8000/api/v1/items');
                const data = await response.json();
                
                if (resultDiv) {
                    resultDiv.innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
                }
            } catch (error) {
                console.error('API test failed:', error);
                if (resultDiv) {
                    resultDiv.innerHTML = '<p>API connection failed. Make sure the backend is running on port 8000.</p>';
                }
            }
        });
    }
});
`;
}

function createFrontendStyles(): string {
    return `/* Frontend application styles */

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

#app {
    max-width: 800px;
    margin: 0 auto;
    background: white;
    padding: 40px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    margin-bottom: 20px;
}

button {
    background-color: #007acc;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

button:hover {
    background-color: #005a9e;
}

#result {
    margin-top: 20px;
    padding: 20px;
    background-color: #f8f8f8;
    border-radius: 4px;
    border-left: 4px solid #007acc;
}

pre {
    margin: 0;
    background-color: #282c34;
    color: #abb2bf;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
}
`;
}

function createMobilePackageJson(name: string): string {
    return `{
  "name": "${name}-mobile",
  "version": "0.1.0",
  "description": "React Native mobile app for ${name}",
  "main": "App.js",
  "scripts": {
    "start": "npx react-native start",
    "android": "npx react-native run-android",
    "ios": "npx react-native run-ios",
    "test": "jest"
  },
  "dependencies": {
    "react": "18.0.0",
    "react-native": "0.71.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "jest": "^29.2.1"
  }
}`;
}

function createMobileApp(): string {
    return `// React Native mobile application

import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';

function App() {
  const testAPI = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/items');
      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      console.error('API test failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#007acc" />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.content}>
          <Text style={styles.title}>Mobile Application</Text>
          <Text style={styles.description}>
            Welcome to your React Native mobile application!
          </Text>
          <TouchableOpacity style={styles.button} onPress={testAPI}>
            <Text style={styles.buttonText}>Test API Connection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007acc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
`;
}

function createSetupScript(): string {
    return `#!/usr/bin/env python3
"""Setup script for development environment."""

import subprocess
import sys
from pathlib import Path

def run_command(command: list[str]) -> None:
    """Run a command and check for errors."""
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {' '.join(command)}")
        sys.exit(e.returncode)

def main():
    """Main setup function."""
    print("Setting up development environment...")
    
    # Install Python dependencies
    print("Installing Python dependencies...")
    run_command([sys.executable, "-m", "pip", "install", "-r", "requirements-dev.txt"])
    
    # Install backend dependencies
    print("Installing backend dependencies...")
    run_command([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
    
    # Install frontend dependencies
    print("Installing frontend dependencies...")
    run_command(["npm", "install"], cwd="frontend/web")
    
    print("Development environment setup complete!")

if __name__ == "__main__":
    main()
`;
}

function createTestScript(): string {
    return `#!/usr/bin/env python3
"""Script to run all tests."""

import subprocess
import sys
from pathlib import Path

def main():
    """Run all tests."""
    print("Running backend tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", "backend/tests/", "-v"
    ])
    
    if result.returncode != 0:
        print("Backend tests failed!")
        sys.exit(1)
    
    print("All tests passed!")

if __name__ == "__main__":
    main()
`;
}

function createPackageInit(packageName: string): string {
    return `"""${packageName} package."""

from .main import hello_world, main_function
from .utils import format_message, validate_input, safe_string

__version__ = "0.1.0"
__all__ = [
    "hello_world", 
    "main_function", 
    "format_message",
    "validate_input",
    "safe_string",
]
`;
}

function createPackageMain(name: string): string {
    return `"""Main module for ${name} package."""

from typing import Optional
from .utils import format_message, validate_input


def hello_world(name: Optional[str] = None) -> str:
    """Generate a hello world message.
    
    Args:
        name: Optional name to include in greeting
        
    Returns:
        Formatted greeting message
    """
    if name:
        validate_input(name)
        message = f"Hello, {name}!"
    else:
        message = "Hello, World!"
    
    return format_message(message)


def main_function() -> str:
    """Main function for demonstration.
    
    Returns:
        Result of the main operation
    """
    result = hello_world("Python Developer")
    print(result)
    return result


if __name__ == "__main__":
    main_function()
`;
}

function createPackageUtils(): string {
    return `"""Utility functions for the package."""

from typing import Any


def format_message(message: str) -> str:
    """Format a message with decorative elements.
    
    Args:
        message: The message to format
        
    Returns:
        Formatted message with decorations
    """
    return f"✨ {message} ✨"


def validate_input(value: Any) -> None:
    """Validate input value.
    
    Args:
        value: Value to validate
        
    Raises:
        ValueError: If value is invalid
    """
    if not value:
        raise ValueError("Value cannot be empty")
    
    if isinstance(value, str) and not value.strip():
        raise ValueError("String value cannot be empty")


def safe_string(value: Any, default: str = "") -> str:
    """Safely convert value to string.
    
    Args:
        value: Value to convert
        default: Default value if conversion fails
        
    Returns:
        String representation of value or default
    """
    try:
        return str(value) if value is not None else default
    except Exception:
        return default
`;
}

function createPackageTests(name: string): string {
    const packageName = name.replace(/-/g, '_');
    return `"""Tests for ${name} main module."""

import pytest
from ${packageName}.main import hello_world, main_function


def test_hello_world_with_name():
    """Test hello_world with name."""
    result = hello_world("Test")
    assert "Hello, Test!" in result
    assert "✨" in result


def test_hello_world_without_name():
    """Test hello_world without name."""
    result = hello_world()
    assert "Hello, World!" in result
    assert "✨" in result


def test_hello_world_empty_string():
    """Test hello_world with empty string should raise ValueError."""
    with pytest.raises(ValueError):
        hello_world("")


def test_main_function():
    """Test main function."""
    result = main_function()
    assert isinstance(result, str)
    assert "Python Developer" in result
`;
}

function createPackageUsageDocs(name: string): string {
    const packageName = name.replace(/-/g, '_');
    return `# Usage Guide

## Installation

Install the package using pip:

\`\`\`bash
pip install ${name}
\`\`\`

## Basic Usage

### Hello World Function

\`\`\`python
from ${packageName} import hello_world

# With a name
result = hello_world("Alice")
print(result)  # ✨ Hello, Alice! ✨

# Without a name
result = hello_world()
print(result)  # ✨ Hello, World! ✨
\`\`\`

### Utility Functions

\`\`\`python
from ${packageName}.utils import format_message, validate_input, safe_string

# Format a message
formatted = format_message("Important message")
print(formatted)  # ✨ Important message ✨

# Validate input
try:
    validate_input("valid input")
    print("Input is valid")
except ValueError as e:
    print(f"Invalid input: {e}")

# Safe string conversion
result = safe_string(123, "default")
print(result)  # "123"
\`\`\`

## API Reference

### hello_world(name: Optional[str] = None) -> str

Generate a formatted hello world message.

**Parameters:**
- \`name\` (Optional[str]): Name to include in greeting. Defaults to None.

**Returns:**
- str: Formatted greeting message with decorative elements.

**Raises:**
- ValueError: If name is an empty string.

### format_message(message: str) -> str

Format a message with decorative elements.

**Parameters:**
- \`message\` (str): The message to format.

**Returns:**
- str: Formatted message with decorations.

### validate_input(value: Any) -> None

Validate that input value is not empty.

**Parameters:**
- \`value\` (Any): Value to validate.

**Raises:**
- ValueError: If value is empty or invalid.

### safe_string(value: Any, default: str = "") -> str

Safely convert any value to string with fallback.

**Parameters:**
- \`value\` (Any): Value to convert.
- \`default\` (str): Default value if conversion fails.

**Returns:**
- str: String representation of value or default.
`;
}

function createVSCodeSettings(): string {
    return `{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.terminal.activateEnvironment": true,
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "python.linting.mypyEnabled": true,
    "python.formatting.provider": "black",
    "python.formatting.blackPath": "black",
    "python.sortImports.path": "isort",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true,
        "**/.pytest_cache": true,
        "**/.mypy_cache": true
    }
}`;
}

function createMonorepoTasks(): string {
    return `{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Install Dependencies",
            "type": "shell",
            "command": "python",
            "args": ["scripts/setup.py"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Run Backend",
            "type": "shell",
            "command": "python",
            "args": ["main.py"],
            "options": {
                "cwd": "./backend"
            },
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Run Frontend",
            "type": "shell",
            "command": "npm",
            "args": ["start"],
            "options": {
                "cwd": "./frontend/web"
            },
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Run Tests",
            "type": "shell",
            "command": "python",
            "args": ["scripts/test.py"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Format Code",
            "type": "shell",
            "command": "black",
            "args": ["backend/", "scripts/"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Type Check",
            "type": "shell",
            "command": "mypy",
            "args": ["backend/", "scripts/"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}`;
}

function createPackageTasks(): string {
    return `{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Install Dependencies",
            "type": "shell",
            "command": "pip",
            "args": ["install", "-r", "requirements-dev.txt"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Run Tests",
            "type": "shell",
            "command": "pytest",
            "args": ["tests/", "-v"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Run Tests with Coverage",
            "type": "shell",
            "command": "pytest",
            "args": ["tests/", "--cov=src", "--cov-report=term-missing"],
            "group": "test",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Format Code",
            "type": "shell",
            "command": "black",
            "args": ["src/", "tests/"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Sort Imports",
            "type": "shell",
            "command": "isort",
            "args": ["src/", "tests/"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Type Check",
            "type": "shell",
            "command": "mypy",
            "args": ["src/"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Build Package",
            "type": "shell",
            "command": "python",
            "args": ["-m", "build"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        }
    ]
}`;
}

function createMonorepoLaunchConfig(): string {
    return `{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Backend",
            "type": "python",
            "request": "launch",
            "program": "main.py",
            "cwd": "./backend",
            "console": "integratedTerminal",
            "env": {
                "DEBUG": "true"
            }
        },
        {
            "name": "Python: Backend Tests",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": ["backend/tests/", "-v"],
            "console": "integratedTerminal"
        },
        {
            "name": "Python: Setup Script",
            "type": "python",
            "request": "launch",
            "program": "scripts/setup.py",
            "console": "integratedTerminal"
        }
    ]
}`;
}

function createPackageLaunchConfig(): string {
    return `{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Current File",
            "type": "python",
            "request": "launch",
            "program": "\${file}",
            "console": "integratedTerminal",
            "cwd": "\${workspaceFolder}"
        },
        {
            "name": "Python: Main Module",
            "type": "python",
            "request": "launch",
            "module": "src.main",
            "console": "integratedTerminal",
            "cwd": "\${workspaceFolder}"
        },
        {
            "name": "Python: Tests",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": ["tests/", "-v"],
            "console": "integratedTerminal",
            "cwd": "\${workspaceFolder}"
        },
        {
            "name": "Python: Tests with Coverage",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": ["tests/", "--cov=src", "--cov-report=term-missing"],
            "console": "integratedTerminal",
            "cwd": "\${workspaceFolder}"
        }
    ]
}`;
}

export function deactivate() {}
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    console.log('Python Monorepo Generator extension is now active!');

    const disposable = vscode.commands.registerCommand('pythonMonorepoGenerator.createMonorepo', async () => {
        await createPythonMonorepo();
    });

    context.subscriptions.push(disposable);
}

async function createPythonMonorepo() {
    try {
        // Ask user for monorepo name
        const monorepoName = await vscode.window.showInputBox({
            placeHolder: 'Enter monorepo name',
            prompt: 'What name would you like for your Python monorepo?',
            validateInput: (value: string) => {
                if (!value || value.trim().length === 0) {
                    return 'Please enter a valid monorepo name';
                }
                if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) {
                    return 'Name should start with letter/number and contain only letters, numbers, hyphens, and underscores';
                }
                return null;
            }
        });

        if (!monorepoName) {
            return;
        }

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
                    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        return 'Please enter a valid email address';
                    }
                    return null;
                }
            }) || '';

            if (!gitUserEmail) {
                return;
            }
        }

        // Get current workspace folder or ask user to select one
        const workspaceFolder = await getWorkspaceFolder();
        if (!workspaceFolder) {
            return;
        }

        // Get the file system path from either WorkspaceFolder or Uri
        const basePath = 'uri' in workspaceFolder ? workspaceFolder.uri.fsPath : workspaceFolder.fsPath;
        
        // Create monorepo structure
        const monorepoPath = path.join(basePath, monorepoName);
        
        // Check if directory already exists
        if (fs.existsSync(monorepoPath)) {
            const choice = await vscode.window.showWarningMessage(
                `Directory "${monorepoName}" already exists. Do you want to continue?`,
                'Yes', 'No'
            );
            if (choice !== 'Yes') {
                return;
            }
        }

        await createMonorepoStructure(monorepoPath, monorepoName);
        
        // Initialize Git if requested
        if (gitIntegration?.startsWith('Yes')) {
            await initializeGitRepository(monorepoPath, monorepoName, githubRepo, gitUserName, gitUserEmail);
        }
        
        // Show success message with Git info
        let successMessage = `Python monorepo "${monorepoName}" created successfully!`;
        if (gitIntegration?.startsWith('Yes')) {
            successMessage += ' Git repository initialized.';
            if (githubRepo) {
                successMessage += ` GitHub remote added: ${githubRepo}`;
            }
        }

        const choice = await vscode.window.showInformationMessage(
            successMessage,
            'Open in New Window',
            'Add to Workspace'
        );

        if (choice === 'Open in New Window') {
            await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(monorepoPath), true);
        } else if (choice === 'Add to Workspace') {
            vscode.workspace.updateWorkspaceFolders(
                vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0,
                null,
                { uri: vscode.Uri.file(monorepoPath) }
            );
        }

    } catch (error) {
        vscode.window.showErrorMessage(`Error creating monorepo: ${error}`);
    }
}

async function getWorkspaceFolder(): Promise<vscode.WorkspaceFolder | vscode.Uri | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    
    if (!workspaceFolders || workspaceFolders.length === 0) {
        // No workspace folder open, let user select a folder
        const choice = await vscode.window.showInformationMessage(
            'No workspace folder is open. Would you like to select a folder for your monorepo?',
            'Select Folder', 'Cancel'
        );
        
        if (choice === 'Select Folder') {
            const selectedFolder = await vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                canSelectMany: false,
                openLabel: 'Select Folder for Monorepo'
            });
            
            if (selectedFolder && selectedFolder[0]) {
                return selectedFolder[0];
            }
        }
        
        return undefined;
    }
    
    if (workspaceFolders.length === 1) {
        return workspaceFolders[0];
    }
    
    // If multiple workspace folders, let user choose
    const options = workspaceFolders.map(folder => ({
        label: folder.name,
        description: folder.uri.fsPath,
        folder: folder
    }));
    
    const selected = await vscode.window.showQuickPick(options, {
        placeHolder: 'Select workspace folder for the monorepo'
    });
    
    return selected?.folder;
}

async function createMonorepoStructure(monorepoPath: string, monorepoName: string) {
    // Create main directory
    await createDirectory(monorepoPath);

    // Create directory structure
    const directories = [
        'backend',
        'backend/src',
        'backend/tests',
        'frontend',
        'frontend/src',
        'frontend/public',
        'mobile',
        'mobile/src',
        'mobile/src/components',
        'mobile/src/screens',
        'mobile/src/navigation',
        'mobile/src/services',
        'mobile/assets',
        'mobile/assets/images',
        'mobile/assets/fonts',
        'apps',
        'packages',
        'docs',
        'scripts',
        '.vscode'
    ];

    for (const dir of directories) {
        await createDirectory(path.join(monorepoPath, dir));
    }

    // Create files
    await createFiles(monorepoPath, monorepoName);
}

async function createDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

async function createFiles(monorepoPath: string, monorepoName: string) {
    // Root files
    await createFile(path.join(monorepoPath, 'README.md'), createReadmeContent(monorepoName));
    await createFile(path.join(monorepoPath, '.gitignore'), createProjectGitignoreContent());
    await createFile(path.join(monorepoPath, 'pyproject.toml'), createPyprojectContent(monorepoName));
    await createFile(path.join(monorepoPath, 'requirements.txt'), createRequirementsContent());
    await createFile(path.join(monorepoPath, 'requirements-dev.txt'), createDevRequirementsContent());

    // Backend files
    await createFile(path.join(monorepoPath, 'backend', '__init__.py'), '');
    await createFile(path.join(monorepoPath, 'backend', 'src', '__init__.py'), '');
    await createFile(path.join(monorepoPath, 'backend', 'src', 'main.py'), createMainPyContent());
    await createFile(path.join(monorepoPath, 'backend', 'tests', '__init__.py'), '');
    await createFile(path.join(monorepoPath, 'backend', 'tests', 'test_main.py'), createTestMainContent());

    // Frontend files
    await createFile(path.join(monorepoPath, 'frontend', 'package.json'), createFrontendPackageJsonContent(monorepoName));
    await createFile(path.join(monorepoPath, 'frontend', 'public', 'index.html'), createFrontendIndexHtmlContent(monorepoName));
    await createFile(path.join(monorepoPath, 'frontend', 'src', 'main.js'), createFrontendMainJsContent());
    await createFile(path.join(monorepoPath, 'frontend', 'src', 'style.css'), createFrontendStyleCssContent());

    // Mobile files
    await createFile(path.join(monorepoPath, 'mobile', 'package.json'), createMobilePackageJsonContent(monorepoName));
    await createFile(path.join(monorepoPath, 'mobile', 'App.js'), createMobileAppJsContent(monorepoName));
    await createFile(path.join(monorepoPath, 'mobile', 'app.json'), createMobileAppJsonContent(monorepoName));
    await createFile(path.join(monorepoPath, 'mobile', 'babel.config.js'), createMobileBabelConfigContent());
    await createFile(path.join(monorepoPath, 'mobile', 'metro.config.js'), createMobileMetroConfigContent());
    await createFile(path.join(monorepoPath, 'mobile', 'src', 'components', 'Header.js'), createMobileHeaderComponentContent());
    await createFile(path.join(monorepoPath, 'mobile', 'src', 'screens', 'HomeScreen.js'), createMobileHomeScreenContent());
    await createFile(path.join(monorepoPath, 'mobile', 'src', 'navigation', 'AppNavigator.js'), createMobileAppNavigatorContent());
    await createFile(path.join(monorepoPath, 'mobile', 'src', 'services', 'ApiService.js'), createMobileApiServiceContent());
    await createFile(path.join(monorepoPath, 'mobile', 'assets', 'README.md'), '# Assets\n\nPlace your images, fonts, and other assets here.\n');

    // Apps and packages
    await createFile(path.join(monorepoPath, 'apps', 'README.md'), '# Apps\\n\\nPlace your applications here.\\n');
    await createFile(path.join(monorepoPath, 'packages', 'README.md'), '# Packages\\n\\nPlace your reusable packages here.\\n');

    // Documentation
    await createFile(path.join(monorepoPath, 'docs', 'README.md'), createDocsReadmeContent(monorepoName));

    // Scripts
    await createFile(path.join(monorepoPath, 'scripts', 'setup.py'), createSetupScriptContent());
    await createFile(path.join(monorepoPath, 'scripts', 'run_tests.py'), createTestScriptContent());

    // VS Code configurations
    await createFile(path.join(monorepoPath, '.vscode', 'settings.json'), createVSCodeSettingsContent());
    await createFile(path.join(monorepoPath, '.vscode', 'tasks.json'), createVSCodeTasksContent());
    await createFile(path.join(monorepoPath, '.vscode', 'launch.json'), createVSCodeLaunchContent());
    
    // Workspace file
    await createFile(path.join(monorepoPath, `${monorepoName}.code-workspace`), createWorkspaceContent(monorepoName));
}

async function createFile(filePath: string, content: string) {
    fs.writeFileSync(filePath, content, 'utf8');
}

// Content creation functions
function createReadmeContent(name: string): string {
    return `# ${name}

A comprehensive monorepo structure with backend, frontend, mobile, apps, packages, and documentation.

## Structure

- \`backend/\` - Python backend application
- \`frontend/\` - Web frontend application
- \`mobile/\` - React Native mobile application
- \`apps/\` - Standalone applications
- \`packages/\` - Reusable packages
- \`docs/\` - Documentation
- \`scripts/\` - Utility scripts

## Getting Started

### Backend
1. Install Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   pip install -r requirements-dev.txt
   \`\`\`

2. Run the backend:
   \`\`\`bash
   python backend/src/main.py
   \`\`\`

### Frontend
1. Install Node.js dependencies:
   \`\`\`bash
   cd frontend
   npm install
   \`\`\`

2. Run the frontend:
   \`\`\`bash
   cd frontend
   npm start
   \`\`\`

### Mobile
1. Install mobile dependencies:
   \`\`\`bash
   cd mobile
   npm install
   \`\`\`

2. Run on iOS:
   \`\`\`bash
   cd mobile
   npx react-native run-ios
   \`\`\`

3. Run on Android:
   \`\`\`bash
   cd mobile
   npx react-native run-android
   \`\`\`

### Testing
Run Python tests:
\`\`\`bash
python scripts/run_tests.py
\`\`\`

## Development

This monorepo is configured with VS Code settings, tasks, and debug configurations.
Use the provided \`.code-workspace\` file for the best development experience.
`;
}

function createProjectGitignoreContent(): string {
    return `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
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

# PyInstaller
*.manifest
*.spec

# Installer logs
pip-log.txt
pip-delete-this-directory.txt

# Unit test / coverage reports
htmlcov/
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

# Translations
*.mo
*.pot

# Django stuff:
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal

# Flask stuff:
instance/
.webassets-cache

# Scrapy stuff:
.scrapy

# Sphinx documentation
docs/_build/

# PyBuilder
.pybuilder/
target/

# Jupyter Notebook
.ipynb_checkpoints

# IPython
profile_default/
ipython_config.py

# pyenv
.python-version

# pipenv
Pipfile.lock

# poetry
poetry.lock

# pdm
.pdm.toml

# PEP 582
__pypackages__/

# Celery stuff
celerybeat-schedule
celerybeat.pid

# SageMath parsed files
*.sage.py

# Environments
.env
.venv
env/
venv/
ENV/
env.bak/
venv.bak/

# Spyder project settings
.spyderproject
.spyproject

# Rope project settings
.ropeproject

# mkdocs documentation
/site

# mypy
.mypy_cache/
.dmypy.json
dmypy.json

# Pyre type checker
.pyre/

# pytype static type analyzer
.pytype/

# Cython debug symbols
cython_debug/

# PyCharm
.idea/

# VS Code
.vscode/
*.code-workspace

# Node.js (for frontend and mobile)
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.npm
.yarn/
.pnp.*

# React Native
.expo/
.expo-shared/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# macOS
.DS_Store

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~

# IDEs
*.swp
*.swo
*~

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
.nyc_output/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
.cache
.parcel-cache

# Next.js build output
.next

# Nuxt.js build / generate output
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?`;
}

function createPyprojectContent(name: string): string {
    return `[build-system]
requires = ["setuptools>=45", "wheel", "setuptools-scm[toml]>=6.2"]
build-backend = "setuptools.build_meta"

[project]
name = "${name}"
version = "0.1.0"
description = "A Python monorepo"
authors = [{name = "Your Name", email = "your.email@example.com"}]
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}

[project.urls]
homepage = "https://github.com/yourusername/${name}"
repository = "https://github.com/yourusername/${name}"

[tool.setuptools.packages.find]
where = ["backend/src", "packages"]

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
testpaths = ["backend/tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
`;
}

function createRequirementsContent(): string {
    return `# Add your production dependencies here
fastapi>=0.68.0
uvicorn[standard]>=0.15.0
pydantic>=1.8.0
`;
}

function createDevRequirementsContent(): string {
    return `# Development dependencies
pytest>=6.0.0
black>=21.0.0
isort>=5.0.0
mypy>=0.910
flake8>=3.9.0
coverage>=5.5
pytest-cov>=2.12.0
`;
}

function createMainPyContent(): string {
    return `"""Main application entry point."""

def main():
    """Main function."""
    print("Hello from Python Monorepo!")
    return "Hello, World!"


if __name__ == "__main__":
    main()
`;
}

function createTestMainContent(): string {
    return `"""Tests for main module."""
import pytest
from backend.src.main import main


def test_main():
    """Test main function."""
    result = main()
    assert result == "Hello, World!"
`;
}

function createDocsReadmeContent(name: string): string {
    return `# ${name} Documentation

Welcome to the documentation for ${name}.

## Structure

- \`api/\` - API documentation
- \`guides/\` - User guides
- \`development/\` - Development documentation

## Contributing

Please read the development guides before contributing to this project.
`;
}

function createSetupScriptContent(): string {
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
        print(f"Error running command {' '.join(command)}: {e}")
        sys.exit(1)


def main():
    """Main setup function."""
    print("Setting up development environment...")
    
    # Install dependencies
    run_command([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    run_command([sys.executable, "-m", "pip", "install", "-r", "requirements-dev.txt"])
    
    # Install pre-commit hooks if available
    try:
        run_command(["pre-commit", "install"])
    except FileNotFoundError:
        print("pre-commit not found, skipping hook installation")
    
    print("Setup complete!")


if __name__ == "__main__":
    main()
`;
}

function createTestScriptContent(): string {
    return `#!/usr/bin/env python3
"""Script to run all tests."""

import subprocess
import sys
from pathlib import Path


def main():
    """Run all tests."""
    print("Running tests...")
    
    # Run pytest with coverage
    result = subprocess.run([
        sys.executable, "-m", "pytest",
        "backend/tests",
        "--cov=backend/src",
        "--cov-report=html",
        "--cov-report=term-missing"
    ])
    
    if result.returncode == 0:
        print("All tests passed!")
    else:
        print("Some tests failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
`;
}

function createVSCodeSettingsContent(): string {
    return `{
    "python.defaultInterpreterPath": "./venv/bin/python",
    "python.linting.enabled": true,
    "python.linting.pylintEnabled": false,
    "python.linting.flake8Enabled": true,
    "python.linting.mypyEnabled": true,
    "python.formatting.provider": "black",
    "python.sortImports.args": ["--profile", "black"],
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.organizeImports": true
    },
    "files.exclude": {
        "**/__pycache__": true,
        "**/*.pyc": true,
        ".pytest_cache": true,
        ".coverage": true,
        "htmlcov": true,
        ".mypy_cache": true
    }
}`;
}

function createVSCodeTasksContent(): string {
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
            "label": "Run Tests",
            "type": "shell",
            "command": "python",
            "args": ["scripts/run_tests.py"],
            "group": "test",
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
            "args": ["backend/src/main.py"],
            "group": "build",
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
            "args": ["backend", "packages"],
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
            "args": ["backend", "packages"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Start Frontend",
            "type": "shell",
            "command": "python",
            "args": ["-m", "http.server", "8000", "--directory", "frontend/public"],
            "group": "build",
            "presentation": {
                "echo": true,
                "reveal": "always",
                "focus": false,
                "panel": "shared"
            }
        },
        {
            "label": "Install Frontend Dependencies",
            "type": "shell",
            "command": "npm",
            "args": ["install"],
            "options": {
                "cwd": "frontend"
            },
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

function createVSCodeLaunchContent(): string {
    return `{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Python: Backend Main",
            "type": "python",
            "request": "launch",
            "program": "\${workspaceFolder}/backend/src/main.py",
            "console": "integratedTerminal",
            "cwd": "\${workspaceFolder}",
            "env": {
                "PYTHONPATH": "\${workspaceFolder}/backend/src:\${workspaceFolder}/packages"
            }
        },
        {
            "name": "Python: Current File",
            "type": "python",
            "request": "launch",
            "program": "\${file}",
            "console": "integratedTerminal",
            "cwd": "\${workspaceFolder}"
        },
        {
            "name": "Python: Tests",
            "type": "python",
            "request": "launch",
            "module": "pytest",
            "args": ["backend/tests", "-v"],
            "console": "integratedTerminal",
            "cwd": "\${workspaceFolder}"
        },
        {
            "name": "Launch Frontend",
            "type": "node",
            "request": "launch",
            "program": "\${workspaceFolder}/frontend/src/main.js",
            "runtimeExecutable": "python",
            "runtimeArgs": ["-m", "http.server", "8000", "--directory", "frontend/public"],
            "console": "integratedTerminal",
            "cwd": "\${workspaceFolder}",
            "presentation": {
                "hidden": false,
                "group": "",
                "order": 1
            }
        }
    ]
}`;
}

function createWorkspaceContent(name: string): string {
    return `{
    "folders": [
        {
            "name": "${name}",
            "path": "."
        }
    ],
    "settings": {
        "python.defaultInterpreterPath": "./venv/bin/python",
        "python.linting.enabled": true,
        "python.linting.flake8Enabled": true,
        "python.linting.mypyEnabled": true,
        "python.formatting.provider": "black",
        "editor.formatOnSave": true
    },
    "extensions": {
        "recommendations": [
            "ms-python.python",
            "ms-python.black-formatter",
            "ms-python.isort",
            "ms-python.mypy-type-checker",
            "ms-python.flake8"
        ]
    }
}`;
}

// Frontend content creation functions
function createFrontendPackageJsonContent(name: string): string {
    return `{
  "name": "${name}-frontend",
  "version": "1.0.0",
  "description": "Frontend for ${name}",
  "main": "src/main.js",
  "scripts": {
    "start": "python -m http.server 8000 --directory public",
    "dev": "python -m http.server 8000 --directory public",
    "build": "echo 'Build process not configured yet'"
  },
  "keywords": [],
  "author": "",
  "license": "MIT"
}`;
}

function createFrontendIndexHtmlContent(name: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${name} Frontend</title>
    <link rel="stylesheet" href="../src/style.css">
</head>
<body>
    <div id="app">
        <header>
            <h1>${name}</h1>
        </header>
        <main>
            <div class="container">
                <h2>Welcome to your Frontend!</h2>
                <p>This is a basic HTML frontend for your monorepo.</p>
                <div id="status">
                    <p id="backend-status">Checking backend connection...</p>
                </div>
            </div>
        </main>
    </div>
    <script src="../src/main.js"></script>
</body>
</html>`;
}

function createFrontendMainJsContent(): string {
    return `// Main JavaScript file for the frontend

// Check backend connection
async function checkBackendStatus() {
    const statusElement = document.getElementById('backend-status');
    
    try {
        // Try to connect to backend (assuming it runs on port 8000)
        const response = await fetch('http://localhost:8000/health');
        
        if (response.ok) {
            statusElement.textContent = '✅ Backend is running';
            statusElement.className = 'success';
        } else {
            throw new Error('Backend not available');
        }
    } catch (error) {
        statusElement.textContent = '❌ Backend is not running';
        statusElement.className = 'error';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('Frontend loaded!');
    checkBackendStatus();
});

// Add some interactivity
document.querySelector('h1').addEventListener('click', () => {
    alert('Hello from your monorepo frontend!');
});`;
}

function createFrontendStyleCssContent(): string {
    return `/* Main stylesheet for the frontend */

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f5f5f5;
}

header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    text-align: center;
    padding: 2rem 0;
    margin-bottom: 2rem;
}

header h1 {
    font-size: 2.5rem;
    cursor: pointer;
    transition: transform 0.2s ease;
}

header h1:hover {
    transform: scale(1.05);
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 2rem;
}

h2 {
    color: #4a5568;
    margin-bottom: 1rem;
}

p {
    margin-bottom: 1rem;
    color: #718096;
}

#status {
    margin-top: 2rem;
    padding: 1rem;
    border-radius: 4px;
    background-color: #f7fafc;
    border-left: 4px solid #e2e8f0;
}

.success {
    color: #38a169 !important;
    border-left-color: #38a169 !important;
}

.error {
    color: #e53e3e !important;
    border-left-color: #e53e3e !important;
}

@media (max-width: 768px) {
    .container {
        margin: 1rem;
        padding: 1rem;
    }
    
    header h1 {
        font-size: 2rem;
    }
}`;
}

// Mobile content creation functions
function createMobilePackageJsonContent(name: string): string {
    return `{
  "name": "${name}-mobile",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint ."
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6",
    "@react-navigation/native": "^6.1.7",
    "@react-navigation/stack": "^6.3.17",
    "react-native-screens": "^3.24.0",
    "react-native-safe-area-context": "^4.7.2",
    "react-native-gesture-handler": "^2.13.1",
    "axios": "^1.5.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@babel/preset-env": "^7.20.0",
    "@babel/runtime": "^7.20.0",
    "@react-native/eslint-config": "^0.72.2",
    "@react-native/metro-config": "^0.72.11",
    "@tsconfig/react-native": "^3.0.0",
    "@types/react": "^18.0.24",
    "@types/react-test-renderer": "^18.0.0",
    "babel-jest": "^29.2.1",
    "eslint": "^8.19.0",
    "jest": "^29.2.1",
    "metro-react-native-babel-preset": "0.76.8",
    "prettier": "^2.4.1",
    "react-test-renderer": "18.2.0",
    "typescript": "4.8.4"
  },
  "engines": {
    "node": ">=16"
  }
}`;
}

function createMobileAppJsContent(name: string): string {
    return `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default App;`;
}

function createMobileAppJsonContent(name: string): string {
    return `{
  "name": "${name}",
  "displayName": "${name}",
  "expo": {
    "name": "${name}",
    "slug": "${name.toLowerCase()}",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}`;
}

function createMobileBabelConfigContent(): string {
    return `module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
};`;
}

function createMobileMetroConfigContent(): string {
    return `const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);`;
}

function createMobileHeaderComponentContent(): string {
    return `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = ({ title }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Header;`;
}

function createMobileHomeScreenContent(): string {
    return `import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Header from '../components/Header';
import ApiService from '../services/ApiService';

const HomeScreen = () => {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkBackendStatus();
  }, []);

  const checkBackendStatus = async () => {
    try {
      setLoading(true);
      const isConnected = await ApiService.checkHealth();
      setBackendStatus(isConnected ? 'connected' : 'disconnected');
    } catch (error) {
      setBackendStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    checkBackendStatus();
  };

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'connected':
        return '#10b981';
      case 'disconnected':
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (backendStatus) {
      case 'connected':
        return '✅ Backend Connected';
      case 'disconnected':
        return '❌ Backend Disconnected';
      case 'error':
        return '❌ Connection Error';
      default:
        return '⏳ Checking...';
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Mobile App" />
      <View style={styles.content}>
        <Text style={styles.welcome}>Welcome to your Monorepo Mobile App!</Text>
        
        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Backend Status:</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#6366f1" />
          ) : (
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          )}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleRefresh}>
          <Text style={styles.buttonText}>Refresh Status</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.secondaryButton]} 
          onPress={() => Alert.alert('Hello!', 'This is your mobile app!')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>Show Alert</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 30,
  },
  statusContainer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: '100%',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: '100%',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButtonText: {
    color: '#6366f1',
  },
});

export default HomeScreen;`;
}

function createMobileAppNavigatorContent(): string {
    return `import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // We use custom header
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;`;
}

function createMobileApiServiceContent(): string {
    return `import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // Change to your backend URL

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  async getData(endpoint) {
    try {
      const response = await this.client.get(endpoint);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async postData(endpoint, data) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async putData(endpoint, data) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async deleteData(endpoint) {
    try {
      const response = await this.client.delete(endpoint);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
}

export default new ApiService();`;
}

async function initializeGitRepository(monorepoPath: string, monorepoName: string, githubRepo: string, gitUserName: string, gitUserEmail: string) {
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);

    try {
        // Change to monorepo directory and initialize git
        await execAsync('git init', { cwd: monorepoPath });
        
        // Configure git user
        await execAsync(`git config user.name "${gitUserName}"`, { cwd: monorepoPath });
        await execAsync(`git config user.email "${gitUserEmail}"`, { cwd: monorepoPath });
        
        // Add all files
        await execAsync('git add .', { cwd: monorepoPath });
        
        // Create initial commit
        const commitMessage = `feat: Initial ${monorepoName} monorepo setup

✨ Features:
- Complete Python monorepo structure
- Backend with FastAPI setup and testing
- Frontend with HTML/CSS/JS
- React Native mobile app
- VS Code workspace configuration
- Development tools and scripts

🛠️ Structure:
- backend/ - Python backend with src and tests
- frontend/ - Web frontend application  
- mobile/ - React Native mobile app
- apps/ - Standalone applications
- packages/ - Reusable packages
- docs/ - Documentation
- scripts/ - Utility scripts`;
        
        await execAsync(`git commit -m "${commitMessage}"`, { cwd: monorepoPath });
        
        // Add GitHub remote if provided
        if (githubRepo) {
            const remoteUrl = `https://github.com/${githubRepo}.git`;
            await execAsync(`git remote add origin ${remoteUrl}`, { cwd: monorepoPath });
            
            // Set up main branch
            await execAsync('git branch -M main', { cwd: monorepoPath });
            
            vscode.window.showInformationMessage(
                `Git initialized! To push to GitHub: cd ${monorepoName} && git push -u origin main`
            );
        } else {
            vscode.window.showInformationMessage(
                `Git initialized successfully in ${monorepoName}!`
            );
        }
        
    } catch (error) {
        vscode.window.showWarningMessage(
            `Git initialization failed: ${error}. You can initialize manually with: git init`
        );
    }
}

export function deactivate() {}
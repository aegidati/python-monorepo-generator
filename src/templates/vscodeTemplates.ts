export function createVSCodeSettings(): string {
    const isWindows = process.platform === 'win32';
    const pythonPath = isWindows ? "./venv/Scripts/python.exe" : "./venv/bin/python";
    return `{
    "python.defaultInterpreterPath": "${pythonPath}",
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
    },
    "extensions.ignoreRecommendations": false
}`;
}

export function createVSCodeExtensions(): string {
    return `{
    "recommendations": [
        "ms-python.python",
        "ms-python.flake8",
        "ms-python.black-formatter",
        "ms-python.isort",
        "ms-python.mypy-type-checker"
    ]
}`;
}

export function createMonorepoTasks(): string {
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

export function createPackageTasks(): string {
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

export function createMonorepoLaunchConfig(): string {
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

export function createPackageLaunchConfig(): string {
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
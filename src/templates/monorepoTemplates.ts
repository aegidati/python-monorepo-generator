export function createMonorepoReadme(name: string): string {
    return `# ${name}

A modern Python monorepo with backend, frontend, mobile, and documentation.

## Structure

- \`backend/\` - Python FastAPI backend
- \`frontend/web/\` - Web application
- \`frontend/mobile/\` - React Native mobile app
- \`packages/\` - Shared Python packages
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

export function createMonorepoPyprojectToml(name: string): string {
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

export function createWorkspaceFile(name: string): string {
    const isWindows = process.platform === 'win32';
    const pythonPath = isWindows ? ".\\\\venv\\\\Scripts\\\\python.exe" : "./venv/bin/python";
    
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
        "python.defaultInterpreterPath": "${pythonPath}",
        "python.terminal.activateEnvironment": true,
        "python.linting.enabled": true,
        "python.linting.flake8Enabled": true,
        "python.linting.mypyEnabled": true,
        "python.formatting.provider": "black",
        "editor.formatOnSave": true
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
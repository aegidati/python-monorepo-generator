# Python Monorepo Generator

A VS Code extension that generates complete Python monorepo structures with backend, apps, packages, docs, and development configurations.

## Features

- **Interactive Setup**: Prompts for monorepo name with input validation
- **Complete Structure**: Creates backend, apps, packages, docs, and scripts folders
- **Ready-to-use Configs**: Includes VS Code settings, tasks, and debug configurations
- **Development Tools**: Pre-configured with Black, isort, MyPy, Flake8, and pytest
- **Workspace File**: Generates a `.code-workspace` file for optimal development experience

## Usage

1. Open VS Code in the folder where you want to create your monorepo
2. Run the command "Create Python Monorepo" from the Command Palette
3. Enter your desired monorepo name
4. Choose to open the new monorepo in a new window or add it to your current workspace

## Generated Structure

```
your-monorepo/
├── backend/
│   ├── src/
│   │   ├── __init__.py
│   │   └── main.py
│   └── tests/
│       ├── __init__.py
│       └── test_main.py
├── apps/
├── packages/
├── docs/
├── scripts/
│   ├── setup.py
│   └── run_tests.py
├── .vscode/
│   ├── settings.json
│   ├── tasks.json
│   └── launch.json
├── .gitignore
├── README.md
├── pyproject.toml
├── requirements.txt
├── requirements-dev.txt
└── your-monorepo.code-workspace
```

## VS Code Integration

The generated monorepo includes:

- **Tasks**: Install dependencies, run tests, run backend, format code, sort imports
- **Debug Configurations**: Backend main, current file, and tests
- **Settings**: Python interpreter, linting, formatting, and file exclusions
- **Extension Recommendations**: Python, Black, isort, MyPy, Flake8

## Requirements

- VS Code
- Python 3.8 or higher

## Installation

Install from VS Code Extensions Marketplace or package the extension manually.

## Development

1. Clone this repository
2. Run `npm install`
3. Press F5 to launch a new Extension Development Host window
4. Test the extension in the new window

## License

MIT
# Python Monorepo Generator

A VS Code extension that generates complete Python monorepo structures **or** single Python packages with backend, frontend, mobile, apps, packages, docs, and development configurations.

## Features

- **Flexible Project Creation**: Choose between complete monorepo or single Python package
- **Interactive Setup**: Prompts for project name with input validation
- **Git Integration**: Optional Git initialization with GitHub remote setup
- **GitHub Ready**: Automatically configures Git with user info and remote repository
- **Complete Monorepo Structure**: Creates backend, frontend, mobile, apps, packages, docs, scripts folders
- **Lightweight Package Option**: Creates focused Python package with tests and documentation
- **VS Code Integration**: Includes settings, tasks, and debug configurations
- **Development Tools**: Pre-configured with Black, isort, MyPy, Flake8, and pytest
- **Workspace File**: Generates appropriate project files for optimal development experience

## Project Types

### 🏗️ Complete Monorepo
Creates a full-featured monorepo with:
- **Backend**: Python with FastAPI setup and testing
- **Frontend**: HTML/CSS/JS with Python HTTP server
- **Mobile**: React Native with navigation and API service
- **Apps**: Folder for standalone applications
- **Packages**: Shared/reusable packages
- **Docs**: Documentation structure
- **Scripts**: Utility scripts

### 📦 Python Package  
Creates a focused package structure with:
- **src/ layout**: Modern Python package structure
- **Testing**: pytest setup with coverage
- **Documentation**: API docs and examples
- **Development tools**: All linting/formatting configured
- **setup.py & pyproject.toml**: Ready for distribution

## Usage

### Creating a New Project

1. Open VS Code in the folder where you want to create your project
2. Run the command "Create Python Project" from the Command Palette
3. Enter your desired project name
4. **Choose project type**: Complete Monorepo or Python Package
5. Choose whether to enable Git and GitHub integration:
   - **Yes**: Enter GitHub repository info (username/repo-name), Git username, and email
   - **No**: Create project structure only
6. Choose to open the new project in a new window or add it to your current workspace

### Setting Up an Existing Project

After creating a project, use the **Setup Project** command to automatically install dependencies:

1. Open the generated project in VS Code
2. Run the command **"Python Generator: Setup Project"** from the Command Palette (Ctrl+Shift+P / Cmd+Shift+P)
3. Select which setup steps to execute:
   - 📦 **Install Python Dependencies** - Runs pip install for all requirements
   - 🎨 **Install Frontend Dependencies** - Runs npm install for web and mobile apps
   - 📝 **Create Initial Commit** - Creates the first Git commit (optional)
4. Wait for the automatic installation to complete

This command automates all the manual setup steps described in the generated `GETTING_STARTED.md` file.

## Available Commands

Access all commands via the Command Palette (Ctrl+Shift+P / Cmd+Shift+P):

- **Python Generator: Create Python Project** - Generate a new monorepo or package
- **Python Generator: Setup Project** - Automatically install dependencies and configure the project
- **Python Generator: Start Servers** - Start backend, frontend web, and/or mobile servers
- **Python Generator: Check Development Prerequisites** - Verify Python, Git, and Node.js installation
- **Python Generator: Install Python Development Extensions** - Install recommended VS Code extensions

### Git Integration Features

When you enable Git integration, the extension will:
- Initialize a Git repository in the new monorepo
- Configure Git with your username and email
- Create an initial commit with all generated files
- Add GitHub remote repository (if provided)
- Set up the main branch
- Provide instructions for pushing to GitHub

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
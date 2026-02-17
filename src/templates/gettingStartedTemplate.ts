export function createGettingStarted(projectName: string, hasGit: boolean, githubRepo?: string): string {
    return `# 🎉 Welcome to ${projectName}!

Your Python monorepo has been successfully created and configured!

## 📁 Project Structure

\`\`\`
${projectName}/
├── 📦 backend/              # FastAPI backend application
│   ├── main.py             # Main FastAPI app
│   ├── api/                # API routes
│   ├── core/               # Core configuration
│   └── tests/              # Backend tests
│
├── 🎨 frontend/            # Frontend applications
│   ├── web/                # Web application
│   │   ├── src/            # Source files
│   │   │   ├── app.js      # Main app logic
│   │   │   └── styles/     # CSS styles
│   │   ├── public/         # Static assets
│   │   └── index.html      # Entry HTML
│   │
│   └── mobile/             # React Native mobile app
│       ├── App.js          # Main mobile app
│       ├── src/            # Mobile source files
│       │   ├── components/ # Reusable components
│       │   └── screens/    # App screens
│       └── package.json    # Mobile dependencies
│
├── 📦 packages/            # Shared Python packages
├── 📚 docs/                # Documentation
├── 🔧 scripts/             # Utility scripts
│   ├── setup.py           # Environment setup
│   └── test.py            # Test runner
│
├── 🗂️ .vscode/            # VS Code configuration
│   ├── settings.json      # Python & editor settings
│   ├── tasks.json         # Build & run tasks
│   └── launch.json        # Debug configurations
│
├── 🐍 venv/               # Python virtual environment
├── 📋 pyproject.toml      # Python project metadata
└── 📝 README.md           # Project documentation
\`\`\`

## 🚀 Quick Start

### ⚡ Automatic Setup (Recommended)

The fastest way to get started is using the built-in setup command:

1. Press **Ctrl+Shift+P** (Cmd+Shift+P on Mac)
2. Type **"Python Generator: Setup Project"**
3. Select the setup steps to execute:
   - 📦 Install Python Dependencies
   - 🎨 Install Frontend Dependencies  
   - 📝 Create Initial Commit (optional)
4. Wait for completion ✅

This automatically handles all dependency installation for you!

### 🔧 Manual Setup (Alternative)

If you prefer manual setup or need more control:

#### 0️⃣ Select Python Interpreter (If Needed)

If VS Code shows a warning about the Python interpreter:

1. Press **Ctrl+Shift+P** (Cmd+Shift+P on Mac)
2. Type **"Python: Select Interpreter"**
3. Choose **"./venv/Scripts/python.exe"** (Windows) or **"./venv/bin/python"** (Linux/Mac)

The virtual environment is already created and configured!

#### 1️⃣ Activate Virtual Environment

**Windows (PowerShell):**
\`\`\`powershell
.\\venv\\Scripts\\Activate.ps1
\`\`\`

**Windows (CMD):**
\`\`\`cmd
.\\venv\\Scripts\\activate.bat
\`\`\`

**Linux/Mac:**
\`\`\`bash
source venv/bin/activate
\`\`\`

#### 2️⃣ Install Dependencies

> **💡 Tip:** Skip this step if you used the automatic setup command above!

\`\`\`bash
# Install Python dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Install frontend dependencies
cd frontend/web
npm install
cd ../..

# Install mobile dependencies
cd frontend/mobile
npm install
cd ../..
\`\`\`

#### 3️⃣ Run Your Applications

**⚡ Quick Start (Recommended):**

Press **Ctrl+Shift+P** (Cmd+Shift+P on Mac) and run **"Python Generator: Start Servers"** to launch:
- 🔧 Backend Server (FastAPI on http://localhost:8000)
- 🎨 Frontend Web (React + Vite on http://localhost:5173)
- 📱 Mobile App (React Native)

Select which servers you want to start, and they'll open in separate terminals!

**🔧 Manual Start (Alternative):**

**Backend (FastAPI):**
\`\`\`bash
cd backend
python main.py
# or use VS Code task: Ctrl+Shift+B → "Run Backend"
\`\`\`
→ Backend will be available at http://localhost:8000

**Frontend (React + Vite):**
\`\`\`bash
cd frontend/web
npm run dev
# or use VS Code task: Ctrl+Shift+B → "Run Frontend"
\`\`\`
→ Frontend will be available at http://localhost:5173

**Mobile (React Native):**
\`\`\`bash
cd frontend/mobile
npm run start
\`\`\`

## 🛠️ Available VS Code Tasks

Press **Ctrl+Shift+B** (Cmd+Shift+B on Mac) to access:

- 🔧 **Install Dependencies** - Set up all project dependencies
- ▶️ **Run Backend** - Start FastAPI server
- 🎨 **Run Frontend** - Start React development server
- 🧪 **Run Tests** - Execute all tests
- 📝 **Format Code** - Format with Black
- 🔍 **Type Check** - Run MyPy type checking

## 🐛 Debugging

Press **F5** to start debugging:
- Backend debugging is pre-configured
- Breakpoints work out of the box
- Auto-reload on code changes

## 📋 Recommended Next Steps

- [ ] Review and customize \`backend/core/config.py\`
- [ ] Add your API endpoints in \`backend/api/routes.py\`
- [ ] Customize frontend in \`frontend/web/src/app.js\`
- [ ] Write tests in \`backend/tests/\`
- [ ] Update project documentation in \`README.md\`
${hasGit ? `- [ ] Make your first commit: \`git add . && git commit -m "Initial commit"\`` : '- [ ] Initialize Git repository: `git init`'}
${githubRepo ? `- [ ] Push to GitHub: \`git remote add origin https://github.com/${githubRepo}.git && git push -u origin main\`` : ''}

## 🧪 Testing

Run all tests:
\`\`\`bash
python scripts/test.py
# or
pytest backend/tests/ -v
\`\`\`

Run tests with coverage:
\`\`\`bash
pytest backend/tests/ --cov=backend --cov-report=html
\`\`\`

## 📦 Adding New Packages

### Backend Package:
\`\`\`bash
cd packages
mkdir my_package
cd my_package
# Create package structure
\`\`\`

### Install Package in Development Mode:
\`\`\`bash
pip install -e ./packages/my_package
\`\`\`

## 🎯 Code Quality

This project is pre-configured with:

- ✅ **Black** - Code formatting
- ✅ **isort** - Import sorting  
- ✅ **Flake8** - Linting
- ✅ **MyPy** - Type checking
- ✅ **Pytest** - Testing framework

Format on save is enabled! Your code will be automatically formatted.

## 📚 Documentation

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Python Packaging Guide](https://packaging.python.org/)

## 💡 Tips

- Use the integrated terminal (\`Ctrl+\`\`) with the virtual environment already activated
- Explorer sidebar shows all your project files
- The Python interpreter is automatically configured to use \`./venv\`
- All recommended VS Code extensions are configured

## 🆘 Need Help?

- Check \`README.md\` for detailed project information
- Review generated code for examples and patterns
- Use VS Code's IntelliSense (Ctrl+Space) for code completion

---

**Happy Coding! 🚀**

*This project was generated by Python Monorepo Generator*
`;
}

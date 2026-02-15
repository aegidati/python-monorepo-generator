export function createGitignore(): string {
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

export function createRootRequirements(): string {
    return `# Add your production dependencies here
# Example:
# requests>=2.28.0
# fastapi>=0.68.0
`;
}

export function createPackageRequirements(): string {
    return `# Add your production dependencies here
# Example:
# requests>=2.28.0
`;
}

export function createDevRequirements(): string {
    return `pytest>=7.0.0
black>=22.0.0
isort>=5.10.0
mypy>=0.950
flake8>=4.0.0
pytest-cov>=4.0.0
`;
}
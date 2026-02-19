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

export function createGitattributes(): string {
    return `* text=auto

# Keep lockfiles stable across platforms
package-lock.json text eol=lf
**/package-lock.json text eol=lf

# Common script defaults
*.sh text eol=lf
*.ps1 text eol=crlf
*.bat text eol=crlf
`;
}

export function createRootRequirements(): string {
    return `# Production dependencies
fastapi>=0.115.0
uvicorn[standard]>=0.32.0
pydantic>=2.10.0
python-multipart>=0.0.20
`;
}

export function createPackageRequirements(): string {
    return `# Add your production dependencies here
# Example:
# requests>=2.28.0
`;
}

export function createDevRequirements(): string {
    return `pytest>=9.0.0
black>=26.0.0
isort>=7.0.0
mypy>=1.19.0
flake8>=7.3.0
pytest-cov>=7.0.0
`;
}
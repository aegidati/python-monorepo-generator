export function createPackageReadme(packageName: string): string {
    return `# ${packageName}

A shared Python package for use across the monorepo.

## Installation

This package is designed to be used within the monorepo structure.

## Usage

\`\`\`python
from ${packageName.replace(/-/g, '_')} import *
\`\`\`

## Development

### Running Tests

\`\`\`bash
pytest tests/ -v
\`\`\`

### Type Checking

\`\`\`bash
mypy src/${packageName.replace(/-/g, '_')}/
\`\`\`

### Code Formatting

\`\`\`bash
black src/ tests/
isort src/ tests/
\`\`\`

## Structure

\`\`\`
${packageName}/
├── src/
│   └── ${packageName.replace(/-/g, '_')}/
│       ├── __init__.py
│       └── core.py
├── tests/
│   ├── __init__.py
│   └── test_core.py
├── pyproject.toml
├── README.md
└── requirements.txt
\`\`\`

## Contributing

Add your package logic in the \`src/${packageName.replace(/-/g, '_')}/\` directory.
`;
}

export function createPackagePyprojectToml(packageName: string, description: string = 'Shared package'): string {
    const pythonPackageName = packageName.replace(/-/g, '_');
    return `[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[project]
name = "${packageName}"
version = "0.1.0"
description = "${description}"
readme = "README.md"
requires-python = ">=3.8"
classifiers = [
    "Development Status :: 3 - Alpha",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Programming Language :: Python :: 3",
    "Programming Language :: Python :: 3.8",
    "Programming Language :: Python :: 3.9",
    "Programming Language :: Python :: 3.10",
    "Programming Language :: Python :: 3.11",
    "Programming Language :: Python :: 3.12",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "black>=23.7.0",
    "isort>=5.12.0",
    "mypy>=1.5.0",
    "flake8>=6.1.0",
]

[tool.black]
line-length = 88
target-version = ['py38']
include = '\\.pyi?$'

[tool.isort]
profile = "black"
line_length = 88

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = false
ignore_missing_imports = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-v --cov=src/${pythonPackageName} --cov-report=term-missing"
`;
}

export function createPackageRequirementsTxt(): string {
    return `# Add your package dependencies here
# Example:
# requests>=2.31.0
# pydantic>=2.0.0
`;
}

export function createPackageInit(packageName: string): string {
    const pythonPackageName = packageName.replace(/-/g, '_');
    return `"""
${packageName} - Shared package for the monorepo

This package provides shared functionality across the monorepo.
"""

__version__ = "0.1.0"

# Import main components here
# Example:
# from .core import MyClass, my_function

__all__ = [
    # Add your public API here
    # "MyClass",
    # "my_function",
]
`;
}

export function createPackageCore(packageName: string): string {
    return `"""
Core functionality for ${packageName}

Add your main package logic here.
"""

from typing import Any, Dict, Optional


class PackageCore:
    """
    Base class for ${packageName} functionality.
    
    Replace or extend this with your actual implementation.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the package core.
        
        Args:
            config: Optional configuration dictionary
        """
        self.config = config or {}
    
    def process(self, data: Any) -> Any:
        """
        Process data with package logic.
        
        Args:
            data: Input data to process
            
        Returns:
            Processed data
        """
        # Add your implementation here
        return data


def example_function(param: str) -> str:
    """
    Example function demonstrating package functionality.
    
    Args:
        param: Input parameter
        
    Returns:
        Processed result
    """
    return f"Processed: {param}"
`;
}

export function createPackageTests(packageName: string): string {
    const pythonPackageName = packageName.replace(/-/g, '_');
    return `"""
Tests for ${packageName}
"""

import pytest
from ${pythonPackageName}.core import PackageCore, example_function


class TestPackageCore:
    """Test cases for PackageCore class"""
    
    def test_init_default(self):
        """Test default initialization"""
        core = PackageCore()
        assert core.config == {}
    
    def test_init_with_config(self):
        """Test initialization with config"""
        config = {"key": "value"}
        core = PackageCore(config=config)
        assert core.config == config
    
    def test_process(self):
        """Test process method"""
        core = PackageCore()
        data = "test"
        result = core.process(data)
        assert result == data


class TestHelperFunctions:
    """Test cases for helper functions"""
    
    def test_example_function(self):
        """Test example function"""
        result = example_function("test")
        assert result == "Processed: test"
    
    def test_example_function_empty(self):
        """Test example function with empty string"""
        result = example_function("")
        assert result == "Processed: "


# Add more test cases as you develop your package
`;
}

export function createPackageManifest(): string {
    return `include README.md
include LICENSE
include pyproject.toml
recursive-include src *.py
recursive-include tests *.py
global-exclude __pycache__
global-exclude *.py[co]
`;
}

export function createPackageSetupCfg(packageName: string): string {
    const pythonPackageName = packageName.replace(/-/g, '_');
    return `[metadata]
name = ${packageName}
version = attr: ${pythonPackageName}.__version__

[options]
package_dir =
    = src
packages = find:
python_requires = >=3.8

[options.packages.find]
where = src
`;
}

export function createStandalonePackagePyprojectToml(packageName: string, description: string = 'A Python package'): string {
    const pythonPackageName = packageName.replace(/-/g, '_');
    return `[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "${packageName}"
version = "0.1.0"
description = "${description}"
readme = "README.md"
requires-python = ">=3.8"
license = {text = "MIT"}
authors = [
    {name = "Your Name", email = "your.email@example.com"}
]
classifiers = [
    "Development Status :: 3 - Alpha",
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

dependencies = [
    # Add your runtime dependencies here
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "black>=23.7.0",
    "isort>=5.12.0",
    "mypy>=1.5.0",
    "flake8>=6.1.0",
]

[project.urls]
Homepage = "https://github.com/yourusername/${packageName}"
Repository = "https://github.com/yourusername/${packageName}"
Documentation = "https://github.com/yourusername/${packageName}/blob/main/README.md"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
${pythonPackageName} = ["py.typed"]

[tool.black]
line-length = 88
target-version = ['py38']
include = '\\.pyi?$'
extend-exclude = '''
/(
  # directories
  \\.eggs
  | \\.git
  | \\.hg
  | \\.mypy_cache
  | \\.tox
  | \\.venv
  | build
  | dist
)/
'''

[tool.isort]
profile = "black"
line_length = 88
skip_gitignore = true

[tool.mypy]
python_version = "3.8"
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = false
ignore_missing_imports = true
check_untyped_defs = true
no_implicit_optional = true
show_error_codes = true

[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = [
    "-v",
    "--cov=src/${pythonPackageName}",
    "--cov-report=term-missing",
    "--cov-report=html",
    "--cov-report=xml",
]

[tool.coverage.run]
source = ["src"]
omit = ["*/tests/*", "*/test_*.py"]

[tool.coverage.report]
exclude_lines = [
    "pragma: no cover",
    "def __repr__",
    "raise AssertionError",
    "raise NotImplementedError",
    "if __name__ == .__main__.:",
    "if TYPE_CHECKING:",
    "class .*\\bProtocol\\):",
    "@(abc\\.)?abstractmethod",
]
`;
}

export function createStandalonePackageReadme(packageName: string): string {
    const pythonPackageName = packageName.replace(/-/g, '_');
    return `# ${packageName}

A Python package for [describe your package purpose].

## Features

- ✨ Feature 1
- 🚀 Feature 2
- 📦 Feature 3

## Installation

### From PyPI (when published)

\`\`\`bash
pip install ${packageName}
\`\`\`

### Development Installation

\`\`\`bash
# Clone the repository
git clone https://github.com/yourusername/${packageName}.git
cd ${packageName}

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# Install in editable mode with dev dependencies
pip install -e ".[dev]"
\`\`\`

## Quick Start

\`\`\`python
from ${pythonPackageName} import example_function

result = example_function("input")
print(result)
\`\`\`

## Usage

### Basic Example

\`\`\`python
from ${pythonPackageName}.core import PackageCore

# Initialize
core = PackageCore(config={"option": "value"})

# Use the package
result = core.process(data)
\`\`\`

### Advanced Usage

\`\`\`python
# Add your advanced usage examples here
\`\`\`

## Development

### Setup

\`\`\`bash
# Install development dependencies
pip install -e ".[dev]"
\`\`\`

### Running Tests

\`\`\`bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/${pythonPackageName} --cov-report=html

# Run specific test file
pytest tests/test_core.py -v
\`\`\`

### Code Quality

\`\`\`bash
# Format code
black src/ tests/
isort src/ tests/

# Type checking
mypy src/${pythonPackageName}/

# Linting
flake8 src/ tests/
\`\`\`

### Building and Publishing

\`\`\`bash
# Build package
python -m build

# Upload to PyPI (requires credentials)
python -m twine upload dist/*
\`\`\`

## Project Structure

\`\`\`
${packageName}/
├── src/
│   └── ${pythonPackageName}/
│       ├── __init__.py
│       └── core.py
├── tests/
│   ├── __init__.py
│   └── test_core.py
├── docs/                   # Optional: documentation
├── .gitignore
├── pyproject.toml
├── README.md
├── LICENSE
└── requirements-dev.txt
\`\`\`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## Support

- 📫 Email: your.email@example.com
- 🐛 Issues: https://github.com/yourusername/${packageName}/issues
- 💬 Discussions: https://github.com/yourusername/${packageName}/discussions

## Credits

Created and maintained by [Your Name](https://github.com/yourusername).
`;
}

// ============================================
// UI PACKAGE TEMPLATES
// ============================================

export function createUIPackageJson(packageName: string): string {
    return `{
  "name": "${packageName}",
  "version": "0.1.0",
  "description": "UI components package for ${packageName}",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "src"
  ],
  "scripts": {
    "build": "tsup src/index.tsx --format cjs,esm --dts",
    "dev": "tsup src/index.tsx --format cjs,esm --dts --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write \\"src/**/*.{ts,tsx}\\"",
    "type-check": "tsc --noEmit"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.17",
    "@types/react-dom": "^18.3.5",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "prettier": "^3.4.0",
    "tsup": "^8.0.0",
    "typescript": "^5.3.0"
  },
  "keywords": [
    "react",
    "components",
    "ui",
    "typescript"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/${packageName}.git"
  },
  "license": "MIT"
}`;
}

export function createUITsConfig(): string {
    return `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "declaration": true,
    "declarationMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`;
}

export function createUIIndexFile(packageName: string): string {
    const componentName = packageName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    
    return `/**
 * ${packageName} - UI Components Package
 * 
 * Export all components from this file
 */

export { default as ${componentName}Provider } from './components/Provider';
export { default as ${componentName}Button } from './components/Button';
export { default as ${componentName}Form } from './components/Form';

// Export types
export type { ${componentName}Props } from './types';
`;
}

export function createUIProviderComponent(packageName: string): string {
    const componentName = packageName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    
    return `import React, { createContext, useContext, ReactNode } from 'react';

interface ${componentName}ContextType {
  // Add your context properties here
  isAuthenticated?: boolean;
  user?: any;
}

const ${componentName}Context = createContext<${componentName}ContextType | undefined>(undefined);

export interface ${componentName}ProviderProps {
  children: ReactNode;
  // Add your provider props here
}

/**
 * ${componentName}Provider - Context provider for ${packageName}
 */
const ${componentName}Provider: React.FC<${componentName}ProviderProps> = ({ children }) => {
  // Add your provider logic here
  const value: ${componentName}ContextType = {
    isAuthenticated: false,
    user: null,
  };

  return (
    <${componentName}Context.Provider value={value}>
      {children}
    </${componentName}Context.Provider>
  );
};

/**
 * Hook to use ${componentName} context
 */
export const use${componentName} = () => {
  const context = useContext(${componentName}Context);
  if (context === undefined) {
    throw new Error('use${componentName} must be used within a ${componentName}Provider');
  }
  return context;
};

export default ${componentName}Provider;
`;
}

export function createUIButtonComponent(packageName: string): string {
    const componentName = packageName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    
    return `import React from 'react';

export interface ${componentName}ButtonProps {
  /**
   * Button text
   */
  children: React.ReactNode;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'danger';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * ${componentName}Button - Reusable button component
 */
const ${componentName}Button: React.FC<${componentName}ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  className = '',
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={\`\${baseStyles} \${variantStyles[variant]} \${sizeStyles[size]} \${disabled ? disabledStyles : ''} \${className}\`}
    >
      {children}
    </button>
  );
};

export default ${componentName}Button;
`;
}

export function createUIFormComponent(packageName: string): string {
    const componentName = packageName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    
    return `import React, { FormEvent, useState } from 'react';
import ${componentName}Button from './Button';

export interface ${componentName}FormProps {
  /**
   * Form submit handler
   */
  onSubmit?: (data: any) => void;
  /**
   * Form title
   */
  title?: string;
  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * ${componentName}Form - Reusable form component
 */
const ${componentName}Form: React.FC<${componentName}FormProps> = ({
  onSubmit,
  title = 'Form',
  className = '',
}) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit?.(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={\`space-y-4 \${className}\`}>
      {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <${componentName}Button type="submit" variant="primary" className="w-full">
        Submit
      </${componentName}Button>
    </form>
  );
};

export default ${componentName}Form;
`;
}

export function createUITypesFile(packageName: string): string {
    const componentName = packageName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    
    return `/**
 * Type definitions for ${packageName}
 */

export interface ${componentName}Props {
  /**
   * Theme variant
   */
  theme?: 'light' | 'dark';
  /**
   * Custom styles
   */
  style?: React.CSSProperties;
  /**
   * Additional CSS class
   */
  className?: string;
}

export interface ${componentName}Config {
  /**
   * API endpoint
   */
  apiUrl?: string;
  /**
   * Enable debug mode
   */
  debug?: boolean;
}
`;
}

export function createUIPackageReadme(packageName: string): string {
    const componentName = packageName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');
    
    return `# ${packageName}

UI components package for ${packageName}. Lightweight, reusable React components.

## Installation

\`\`\`bash
npm install ${packageName}
# or
yarn add ${packageName}
\`\`\`

## Usage

### Provider Setup

Wrap your application with the ${componentName}Provider:

\`\`\`tsx
import { ${componentName}Provider } from '${packageName}';

function App() {
  return (
    <${componentName}Provider>
      <YourApp />
    </${componentName}Provider>
  );
}
\`\`\`

### Using Components

#### Button

\`\`\`tsx
import { ${componentName}Button } from '${packageName}';

function MyComponent() {
  return (
    <${componentName}Button 
      variant="primary" 
      size="medium"
      onClick={() => console.log('Clicked!')}
    >
      Click Me
    </${componentName}Button>
  );
}
\`\`\`

#### Form

\`\`\`tsx
import { ${componentName}Form } from '${packageName}';

function MyComponent() {
  const handleSubmit = (data: any) => {
    console.log('Form submitted:', data);
  };

  return (
    <${componentName}Form 
      title="Login"
      onSubmit={handleSubmit}
    />
  );
}
\`\`\`

## Components

- **${componentName}Provider**: Context provider for managing state
- **${componentName}Button**: Customizable button component
- **${componentName}Form**: Form component with built-in validation

## Development

### Build

\`\`\`bash
npm run build
\`\`\`

### Watch Mode

\`\`\`bash
npm run dev
\`\`\`

### Type Check

\`\`\`bash
npm run type-check
\`\`\`

### Lint

\`\`\`bash
npm run lint
\`\`\`

## Peer Dependencies

This package requires React 18 or higher:

- react ^18.0.0
- react-dom ^18.0.0

## License

MIT
`;
}

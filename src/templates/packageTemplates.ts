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

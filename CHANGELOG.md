# Changelog

All notable changes to the "Python Monorepo Generator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Package Generator System**: Complete implementation for creating Python packages
  - `createMonorepoPackage()` - Add packages to existing monorepos
  - `createStandalonePackage()` - Create distributable Python packages
  - Python-compliant package name validation with reserved keyword checks
- **New Commands**:
  - **Add Package to Monorepo** - Interactive package creation in `packages/` folder
  - **List Monorepo Packages** - View all packages with versions and descriptions
- **Package Templates**:
  - Modern `src/` layout structure (PEP 420 compliant)
  - Complete pyproject.toml with PEP 517/518 configuration
  - pytest setup with coverage and conftest.py
  - Type hints support with py.typed marker (PEP 561)
  - Build tools configuration (setuptools, build, twine)
  - Comprehensive documentation (README, CHANGELOG, LICENSE)
  - VS Code tasks for testing, formatting, and type checking
- **GitHub Integration for Packages**:
  - Automatic repository creation with OAuth authentication
  - Support for both monorepo and standalone package projects
  - Remote origin configuration and initial staging
- **Documentation**:
  - Package flow analysis document
  - Updated README with package management examples
  - Clear distinction between monorepo (application) and package (library)

### Changed
- Improved package name validation to support hyphens and underscores
- Enhanced error messages for package creation failures
- Refactored Git integration to work consistently across project types

### Fixed
- Removed unused `gitIntegration` parameter from `createStandalonePackage()`
- Resolved export conflicts between template functions
- Fixed JSON syntax errors in package.json command definitions

### Technical
- Added `packageTemplates.ts` with comprehensive package generation templates
- Created `generators/package.ts` with dual package creation modes
- Implemented `commands/addPackage.ts` for monorepo package management
- Updated extension activation events for new commands
- Zero compilation errors after refactoring

## [0.0.1] - 2026-02-15

### Added
- Git and GitHub integration during monorepo creation
- Interactive prompts for Git username and email configuration
- Optional GitHub repository setup with remote origin
- Automatic initial Git commit with descriptive message
- Comprehensive .gitignore for Python, Node.js, and React Native projects
- Instructions for pushing to GitHub after project creation

### Enhanced
- Improved README generation with Git workflow instructions
- Enhanced project structure documentation
- Better error handling for Git operations

## [0.0.1] - 2026-02-15

### Added
- Initial release of Python Monorepo Generator
- Command to create complete Python monorepo structure
- Interactive input for monorepo name with validation
- Automatic generation of backend structure with Python files
- Frontend structure with HTML, CSS, JavaScript
- Mobile structure with React Native setup
- VS Code workspace configuration
- Pre-configured tasks for development
- Debug configurations for backend, frontend, and mobile
- Comprehensive documentation and README files
- Support for workspace folder selection or manual folder picking
- Complete project structure with apps, packages, docs, and scripts folders

### Features
- **Backend**: Python with FastAPI setup, tests with pytest
- **Frontend**: HTML/CSS/JS with Python HTTP server
- **Mobile**: React Native with navigation and API service
- **VS Code Integration**: Tasks, debugging, settings, and workspace file
- **Development Tools**: Black, isort, MyPy, Flake8, ESLint configurations
- **Documentation**: Auto-generated README, docs structure

### Technical
- TypeScript implementation
- VS Code Extension API integration
- Cross-platform support (Windows, macOS, Linux)
- Comprehensive error handling and user feedback
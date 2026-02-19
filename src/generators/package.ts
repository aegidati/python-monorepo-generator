import * as fs from 'fs';
import * as path from 'path';
import { ProgressReporter } from '../types';
import { createDirectories } from '../utils';
import {
    createPackageReadme,
    createPackagePyprojectToml,
    createPackageRequirementsTxt,
    createPackageInit,
    createPackageCore,
    createPackageTests,
    createPackageManifest,
    createPackageSetupCfg,
    createStandalonePackagePyprojectToml,
    createStandalonePackageReadme
} from '../templates/packageTemplates';
import { createGitignore } from '../templates/commonTemplates';
import {
    createVSCodeSettings,
    createPackageTasks,
    createPackageLaunchConfig,
    createVSCodeExtensions
} from '../templates/vscodeTemplates';

/**
 * Create a package inside a monorepo's packages/ folder
 */
export async function createMonorepoPackage(
    monorepoPath: string,
    packageName: string,
    progress: ProgressReporter,
    description?: string
): Promise<void> {
    const packagePath = path.join(monorepoPath, 'packages', packageName);
    const pythonPackageName = packageName.replace(/-/g, '_');

    // Check if package already exists
    if (fs.existsSync(packagePath)) {
        throw new Error(`Package "${packageName}" already exists in packages/`);
    }

    progress.report({ message: `Creating package: ${packageName}...` });

    // Create package directory structure
    const folders = [
        '',
        'src',
        `src/${pythonPackageName}`,
        'tests'
    ];

    createDirectories(packagePath, folders);

    progress.report({ message: 'Creating package files...' });

    // Create package files
    fs.writeFileSync(
        path.join(packagePath, 'README.md'),
        createPackageReadme(packageName)
    );

    fs.writeFileSync(
        path.join(packagePath, 'pyproject.toml'),
        createPackagePyprojectToml(packageName, description || `Shared ${packageName} package`)
    );

    fs.writeFileSync(
        path.join(packagePath, 'requirements.txt'),
        createPackageRequirementsTxt()
    );

    fs.writeFileSync(
        path.join(packagePath, 'MANIFEST.in'),
        createPackageManifest()
    );

    fs.writeFileSync(
        path.join(packagePath, 'setup.cfg'),
        createPackageSetupCfg(packageName)
    );

    // Create source files
    fs.writeFileSync(
        path.join(packagePath, 'src', pythonPackageName, '__init__.py'),
        createPackageInit(packageName)
    );

    fs.writeFileSync(
        path.join(packagePath, 'src', pythonPackageName, 'core.py'),
        createPackageCore(packageName)
    );

    // Create test files
    fs.writeFileSync(
        path.join(packagePath, 'tests', '__init__.py'),
        '# Tests for ' + packageName + '\n'
    );

    fs.writeFileSync(
        path.join(packagePath, 'tests', 'test_core.py'),
        createPackageTests(packageName)
    );

    progress.report({ message: `Package ${packageName} created successfully!` });
}

/**
 * Create a standalone Python package (not within a monorepo)
 */
export async function createStandalonePackage(
    projectPath: string,
    packageName: string,
    progress: ProgressReporter,
    description?: string
): Promise<void> {
    const pythonPackageName = packageName.replace(/-/g, '_');

    progress.report({ message: `Creating standalone package: ${packageName}...` });

    // Create package directory structure
    const folders = [
        'src',
        `src/${pythonPackageName}`,
        'tests',
        'docs',
        '.vscode'
    ];

    createDirectories(projectPath, folders);

    progress.report({ message: 'Creating package configuration files...' });

    // Root files
    fs.writeFileSync(
        path.join(projectPath, 'README.md'),
        createStandalonePackageReadme(packageName)
    );

    fs.writeFileSync(
        path.join(projectPath, 'pyproject.toml'),
        createStandalonePackagePyprojectToml(packageName, description || 'A Python package')
    );

    fs.writeFileSync(
        path.join(projectPath, 'requirements-dev.txt'),
        `# Development dependencies (also in pyproject.toml [project.optional-dependencies])
pytest>=7.4.0
pytest-cov>=4.1.0
black>=23.7.0
isort>=5.12.0
mypy>=1.5.0
flake8>=6.1.0
build>=0.10.0
twine>=4.0.0
`
    );

    fs.writeFileSync(
        path.join(projectPath, '.gitignore'),
        createGitignore()
    );

    fs.writeFileSync(
        path.join(projectPath, 'MANIFEST.in'),
        createPackageManifest()
    );

    fs.writeFileSync(
        path.join(projectPath, 'setup.cfg'),
        createPackageSetupCfg(packageName)
    );

    fs.writeFileSync(
        path.join(projectPath, 'LICENSE'),
        `MIT License

Copyright (c) ${new Date().getFullYear()} [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`
    );

    fs.writeFileSync(
        path.join(projectPath, 'CHANGELOG.md'),
        `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project structure
- Basic functionality

## [0.1.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release
- Core functionality
- Tests and documentation
`
    );

    progress.report({ message: 'Creating source files...' });

    // Source files
    fs.writeFileSync(
        path.join(projectPath, 'src', pythonPackageName, '__init__.py'),
        createPackageInit(packageName)
    );

    fs.writeFileSync(
        path.join(projectPath, 'src', pythonPackageName, 'core.py'),
        createPackageCore(packageName)
    );

    fs.writeFileSync(
        path.join(projectPath, 'src', pythonPackageName, 'py.typed'),
        '# Marker file for PEP 561\n'
    );

    // Test files
    fs.writeFileSync(
        path.join(projectPath, 'tests', '__init__.py'),
        '# Tests for ' + packageName + '\n'
    );

    fs.writeFileSync(
        path.join(projectPath, 'tests', 'test_core.py'),
        createPackageTests(packageName)
    );

    fs.writeFileSync(
        path.join(projectPath, 'tests', 'conftest.py'),
        `"""
Pytest configuration and fixtures
"""

import pytest


# Add your fixtures here
@pytest.fixture
def sample_data():
    """Sample data for testing"""
    return {"key": "value"}
`
    );

    // Documentation
    fs.writeFileSync(
        path.join(projectPath, 'docs', 'index.md'),
        `# ${packageName} Documentation

Welcome to the ${packageName} documentation.

## Overview

[Add your package overview here]

## Installation

\`\`\`bash
pip install ${packageName}
\`\`\`

## Quick Start

[Add quick start guide here]

## API Reference

[Add API documentation here]
`
    );

    progress.report({ message: 'Creating VS Code configuration...' });

    // VS Code configuration
    fs.writeFileSync(
        path.join(projectPath, '.vscode', 'settings.json'),
        createVSCodeSettings()
    );

    fs.writeFileSync(
        path.join(projectPath, '.vscode', 'tasks.json'),
        createPackageTasks()
    );

    fs.writeFileSync(
        path.join(projectPath, '.vscode', 'launch.json'),
        createPackageLaunchConfig()
    );

    fs.writeFileSync(
        path.join(projectPath, '.vscode', 'extensions.json'),
        createVSCodeExtensions()
    );

    progress.report({ message: 'Package structure created successfully!' });
}

/**
 * Validate package name
 */
export function validatePackageName(name: string): string | undefined {
    if (!name) {
        return 'Package name is required';
    }

    // Check for valid Python package name
    const pythonNamePattern = /^[a-z][a-z0-9_-]*$/;
    if (!pythonNamePattern.test(name)) {
        return 'Package name must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores';
    }

    // Check for reserved Python keywords
    const reservedKeywords = [
        'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
        'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
        'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is',
        'lambda', 'nonlocal', 'not', 'or', 'pass', 'raise', 'return',
        'try', 'while', 'with', 'yield'
    ];

    if (reservedKeywords.includes(name)) {
        return 'Package name cannot be a Python reserved keyword';
    }

    return undefined;
}

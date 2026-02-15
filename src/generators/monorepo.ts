import * as fs from 'fs';
import * as path from 'path';
import { ProgressReporter } from '../types';
import { createDirectories } from '../utils';
import { 
    createMonorepoReadme,
    createMonorepoPyprojectToml,
    createWorkspaceFile 
} from '../templates/monorepoTemplates';
import { 
    createGitignore,
    createRootRequirements,
    createDevRequirements 
} from '../templates/commonTemplates';
import {
    createBackendMain,
    createBackendPyprojectToml,
    createBackendRequirements,
    createApiRoutes,
    createCoreConfig,
    createBackendTests
} from '../templates/backendTemplates';
import {
    createFrontendIndex,
    createFrontendPackageJson,
    createFrontendApp,
    createFrontendStyles
} from '../templates/frontendTemplates';
import {
    createMobilePackageJson,
    createMobileApp
} from '../templates/mobileTemplates';
import {
    createSetupScript,
    createTestScript
} from '../templates/scriptsTemplates';
import {
    createVSCodeSettings,
    createMonorepoTasks,
    createMonorepoLaunchConfig
} from '../templates/vscodeTemplates';

export async function createMonorepoStructure(
    projectPath: string, 
    name: string, 
    progress: ProgressReporter
): Promise<void> {
    const folders = [
        'backend',
        'backend/api',
        'backend/core',
        'backend/tests',
        'frontend',
        'frontend/web',
        'frontend/web/public',
        'frontend/web/src',
        'frontend/web/src/components',
        'frontend/web/src/styles',
        'mobile',
        'mobile/react-native',
        'mobile/react-native/src',
        'mobile/react-native/src/components',
        'mobile/react-native/src/screens',
        'apps',
        'packages',
        'docs',
        'scripts',
        '.vscode'
    ];

    progress.report({ message: 'Creating directory structure...' });
    createDirectories(projectPath, folders);

    progress.report({ message: 'Creating configuration files...' });
    
    // Create root files
    fs.writeFileSync(path.join(projectPath, 'README.md'), createMonorepoReadme(name));
    fs.writeFileSync(path.join(projectPath, 'pyproject.toml'), createMonorepoPyprojectToml(name));
    fs.writeFileSync(path.join(projectPath, '.gitignore'), createGitignore());
    fs.writeFileSync(path.join(projectPath, 'requirements.txt'), createRootRequirements());
    fs.writeFileSync(path.join(projectPath, 'requirements-dev.txt'), createDevRequirements());
    fs.writeFileSync(path.join(projectPath, `${name}.code-workspace`), createWorkspaceFile(name));

    progress.report({ message: 'Creating backend files...' });
    fs.writeFileSync(path.join(projectPath, 'backend', 'main.py'), createBackendMain());
    fs.writeFileSync(path.join(projectPath, 'backend', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'backend', 'pyproject.toml'), createBackendPyprojectToml());
    fs.writeFileSync(path.join(projectPath, 'backend', 'requirements.txt'), createBackendRequirements());
    fs.writeFileSync(path.join(projectPath, 'backend', 'api', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'backend', 'api', 'routes.py'), createApiRoutes());
    fs.writeFileSync(path.join(projectPath, 'backend', 'core', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'backend', 'core', 'config.py'), createCoreConfig());
    fs.writeFileSync(path.join(projectPath, 'backend', 'tests', '__init__.py'), '');
    fs.writeFileSync(path.join(projectPath, 'backend', 'tests', 'test_main.py'), createBackendTests());

    progress.report({ message: 'Creating frontend files...' });
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'index.html'), createFrontendIndex());
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'package.json'), createFrontendPackageJson(name));
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'src', 'app.js'), createFrontendApp());
    fs.writeFileSync(path.join(projectPath, 'frontend', 'web', 'src', 'styles', 'main.css'), createFrontendStyles());

    progress.report({ message: 'Creating mobile files...' });
    fs.writeFileSync(path.join(projectPath, 'mobile', 'react-native', 'package.json'), createMobilePackageJson(name));
    fs.writeFileSync(path.join(projectPath, 'mobile', 'react-native', 'App.js'), createMobileApp());

    // Scripts
    fs.writeFileSync(path.join(projectPath, 'scripts', 'setup.py'), createSetupScript());
    fs.writeFileSync(path.join(projectPath, 'scripts', 'test.py'), createTestScript());

    progress.report({ message: 'Creating VS Code configuration...' });
    fs.writeFileSync(path.join(projectPath, '.vscode', 'tasks.json'), createMonorepoTasks());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'launch.json'), createMonorepoLaunchConfig());
    fs.writeFileSync(path.join(projectPath, '.vscode', 'settings.json'), createVSCodeSettings());

    progress.report({ message: 'Monorepo structure created successfully!' });
}
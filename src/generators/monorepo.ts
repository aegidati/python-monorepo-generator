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
    // TODO: Add backend file creation

    progress.report({ message: 'Creating frontend files...' });
    // TODO: Add frontend file creation

    progress.report({ message: 'Creating mobile files...' });
    // TODO: Add mobile file creation

    progress.report({ message: 'Creating VS Code configuration...' });
    // TODO: Add VS Code configuration creation

    progress.report({ message: 'Monorepo structure created successfully!' });
}
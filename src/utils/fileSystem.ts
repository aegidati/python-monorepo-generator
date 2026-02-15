import * as fs from 'fs';
import * as path from 'path';

export function createDirectories(basePath: string, folders: string[]): void {
    folders.forEach(folder => {
        fs.mkdirSync(path.join(basePath, folder), { recursive: true });
    });
}

export function writeFiles(basePath: string, files: Array<{path: string, content: string}>): void {
    files.forEach(file => {
        fs.writeFileSync(path.join(basePath, file.path), file.content);
    });
}

export function checkDirectoryExists(dirPath: string): boolean {
    return fs.existsSync(dirPath);
}

export function removeDirectory(dirPath: string): void {
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
    }
}
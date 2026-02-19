import * as vscode from 'vscode';

export interface ProjectOptions {
    name: string;
    type: 'monorepo' | 'package';
    path: string;
    gitIntegration?: boolean;
    githubRepo?: string;
    gitUserName?: string;
    gitUserEmail?: string;
}

export interface ProjectTypeChoice {
    label: string;
    description: string;
    detail: string;
}

export type PackageType = 'backend' | 'ui';

export interface PackageOptions {
    name: string;
    type: PackageType;
    description?: string;
}

export type ProgressReporter = vscode.Progress<{increment?: number, message?: string}>;
export function validateProjectName(value: string): string | null {
    if (!value || value.trim().length === 0) {
        return 'Please enter a valid project name';
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(value)) {
        return 'Name should start with letter/number and contain only letters, numbers, hyphens, and underscores';
    }
    return null;
}

export function validateGitHubRepo(value: string): string | null {
    if (value && !/^[a-zA-Z0-9][a-zA-Z0-9._-]*\/[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(value)) {
        return 'Format should be: username/repository-name';
    }
    return null;
}

export function validateGitUserName(value: string): string | null {
    if (!value || value.trim().length === 0) {
        return 'Please enter your Git username';
    }
    return null;
}

export function validateGitEmail(value: string): string | null {
    if (!value || value.trim().length === 0) {
        return 'Please enter your Git email';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
    }
    return null;
}
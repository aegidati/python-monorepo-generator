export function createSetupScript(): string {
    return `#!/usr/bin/env python3
"""Setup script for development environment."""

import subprocess
import sys
from pathlib import Path

def run_command(command: list[str]) -> None:
    """Run a command and check for errors."""
    try:
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Command failed: {' '.join(command)}")
        sys.exit(e.returncode)

def main():
    """Main setup function."""
    print("Setting up development environment...")
    
    # Install Python dependencies
    print("Installing Python dependencies...")
    run_command([sys.executable, "-m", "pip", "install", "-r", "requirements-dev.txt"])
    
    # Install backend dependencies
    print("Installing backend dependencies...")
    run_command([sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"])
    
    # Install frontend dependencies
    print("Installing frontend dependencies...")
    run_command(["npm", "install"], cwd="frontend/web")
    
    print("Development environment setup complete!")

if __name__ == "__main__":
    main()
`;
}

export function createTestScript(): string {
    return `#!/usr/bin/env python3
"""Script to run all tests."""

import subprocess
import sys
from pathlib import Path

def main():
    """Run all tests."""
    print("Running backend tests...")
    result = subprocess.run([
        sys.executable, "-m", "pytest", "backend/tests/", "-v"
    ])
    
    if result.returncode != 0:
        print("Backend tests failed!")
        sys.exit(1)
    
    print("All tests passed!")

if __name__ == "__main__":
    main()
`;
}
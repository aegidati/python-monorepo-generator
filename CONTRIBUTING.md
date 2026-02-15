# Contributing to Python Monorepo Generator

Thank you for your interest in contributing to the Python Monorepo Generator VS Code extension! 

## Getting Started

1. **Fork and Clone**: Fork the repository and clone it to your local machine
2. **Install Dependencies**: Run `npm install` to install all dependencies
3. **Build**: Run `npm run compile` to compile the TypeScript code
4. **Test**: Press F5 to launch a new Extension Development Host window for testing

## Development Workflow

1. **Make Changes**: Edit the TypeScript files in the `src/` directory
2. **Compile**: Run `npm run compile` or `npm run watch` for continuous compilation
3. **Test**: Use F5 to test your changes in the Extension Development Host
4. **Debug**: Set breakpoints in VS Code for debugging the extension

## Project Structure

- `src/extension.ts` - Main extension file with all functionality
- `package.json` - Extension manifest and configuration
- `tsconfig.json` - TypeScript configuration
- `.vscode/launch.json` - Debug configuration

## Code Guidelines

- **TypeScript**: Use TypeScript for all code
- **Formatting**: Follow consistent indentation and naming conventions
- **Error Handling**: Include proper error handling with user-friendly messages
- **Comments**: Add comments for complex logic and public functions

## Testing Your Changes

1. Open the project in VS Code
2. Press F5 to launch Extension Development Host
3. In the new window, test the "Create Python Monorepo" command
4. Verify all generated files and structures are correct
5. Test edge cases (empty input, existing directories, etc.)

## Adding New Features

When adding new features to the generated monorepo:

1. **Update Directory Structure**: Add new directories to the `directories` array
2. **Create Content Functions**: Add functions to generate file contents
3. **Update File Creation**: Add calls to create the new files
4. **Update Tasks/Configs**: Add relevant VS Code tasks and debug configurations
5. **Update Documentation**: Update README and generated documentation

## Submitting Changes

1. **Create Branch**: Create a feature branch for your changes
2. **Test Thoroughly**: Test your changes with various scenarios
3. **Update Documentation**: Update README.md and CHANGELOG.md as needed
4. **Submit PR**: Submit a pull request with a clear description of changes

## Release Process

1. **Update Version**: Bump version in package.json
2. **Update Changelog**: Add new entry to CHANGELOG.md with changes
3. **Test**: Thoroughly test the extension
4. **Package**: Run `npm run package` to create .vsix file
5. **Publish**: Run `npm run publish` to publish to marketplace

## Issues and Feature Requests

- **Issues**: Report bugs via GitHub Issues with steps to reproduce
- **Features**: Suggest new features via GitHub Issues with use cases
- **Discussions**: Use GitHub Discussions for general questions

## Code of Conduct

- Be respectful and inclusive in all communications
- Focus on constructive feedback and solutions
- Help maintain a welcoming environment for all contributors

## Questions?

If you have questions about contributing, feel free to open an issue or discussion on GitHub.

Thank you for contributing! 🚀
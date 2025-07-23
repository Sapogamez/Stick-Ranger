# Contributing to Stick Ranger

Thank you for your interest in contributing to Stick Ranger! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code:

- **Be respectful**: Treat all contributors with respect and courtesy
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be collaborative**: Work together towards common goals

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/Stick-Ranger.git
   cd Stick-Ranger
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js 18.0.0 or higher
- npm 8.0.0 or higher
- Git

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm test             # Run tests
npm run lint         # Check linting
npm run format       # Format code
npm run type-check   # TypeScript check
```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

- **Bug fixes**: Fix existing issues
- **Features**: Add new functionality
- **Documentation**: Improve or add documentation
- **Tests**: Add or improve test coverage
- **Performance**: Optimize existing code
- **Refactoring**: Improve code structure

### Before You Start

1. **Check existing issues** to see if your contribution is already being worked on
2. **Open an issue** to discuss major changes before implementing them
3. **Keep changes focused**: One feature or fix per pull request
4. **Write tests**: Include tests for new functionality

## Coding Standards

### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add type annotations where helpful
- Avoid `any` types when possible

### React Components
- Use functional components with hooks
- Follow the component structure in existing files
- Use proper prop types and interfaces
- Keep components focused and single-purpose

### File Organization
```
src/
├── components/     # React components
├── systems/        # Game logic systems
├── types/          # TypeScript types
├── styles/         # CSS styles
├── utils/          # Utility functions
├── assets/         # Static assets
└── tests/          # Test files
```

### Naming Conventions
- **Files**: PascalCase for components (`GameBoard.tsx`), camelCase for utilities (`gameHelpers.ts`)
- **Components**: PascalCase (`GameBoard`)
- **Functions**: camelCase (`calculateDamage`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_HEALTH`)
- **Interfaces/Types**: PascalCase (`PlayerStats`)

## Testing Guidelines

### Writing Tests
- Write tests for all new functionality
- Use descriptive test names
- Test both happy paths and edge cases
- Aim for high test coverage (70%+ as configured)

### Test Structure
```typescript
describe('ComponentName', () => {
  it('should perform expected behavior', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

### Running Tests
```bash
npm test                 # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## Pull Request Process

### Before Submitting
1. **Update your branch** with latest main:
   ```bash
   git checkout main
   git pull upstream main
   git checkout your-branch
   git rebase main
   ```

2. **Run all checks**:
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

3. **Update documentation** if necessary

### Pull Request Template
When creating a pull request, include:

- **Description**: Clear description of changes
- **Related Issues**: Reference any related issues
- **Testing**: How you tested your changes
- **Screenshots**: For UI changes
- **Breaking Changes**: Note any breaking changes

### Review Process
1. All PRs require at least one review
2. Address reviewer feedback promptly
3. Keep discussions respectful and constructive
4. Update your PR based on feedback

## Issue Reporting

### Bug Reports
Include the following information:
- **Description**: Clear description of the bug
- **Steps to Reproduce**: Detailed steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node.js version
- **Screenshots**: If applicable

### Feature Requests
Include the following information:
- **Description**: Clear description of the feature
- **Use Case**: Why this feature would be useful
- **Implementation Ideas**: Any ideas on implementation
- **Alternatives**: Alternative solutions considered

### Issue Labels
- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Improvements to documentation
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention is needed

## Development Best Practices

### Git Workflow
- Use meaningful commit messages
- Keep commits focused and atomic
- Use present tense ("Add feature" not "Added feature")
- Reference issues in commit messages when applicable

### Code Review Guidelines
- Be constructive and helpful
- Explain the reasoning behind suggestions
- Appreciate good work and improvements
- Focus on the code, not the person

### Performance Considerations
- Optimize for maintainability first
- Profile before optimizing
- Use React best practices (useMemo, useCallback when appropriate)
- Minimize bundle size

## Getting Help

- **Discord/Chat**: [Link to community chat]
- **Issues**: Use GitHub issues for bug reports and feature requests
- **Documentation**: Check existing documentation first
- **Code**: Look at existing code for patterns and examples

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special mentions for first-time contributors

Thank you for contributing to Stick Ranger! 🎮
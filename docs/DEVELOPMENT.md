# Development Setup Guide

This guide will help you set up your development environment for contributing to Stick Ranger.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE (optional but recommended)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Sapogamez/Stick-Ranger.git
cd Stick-Ranger
```

### 2. Install Dependencies

```bash
npm install
```

This will install all necessary dependencies including:
- React and React DOM
- TypeScript
- Webpack and build tools
- Testing framework (Jest)
- Linting tools (ESLint)
- Formatting tools (Prettier)

### 3. Verify Installation

Run the following commands to ensure everything is set up correctly:

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Build the project
npm run build
```

## Development Workflow

### Starting Development Server

```bash
npm run dev
```

This will:
- Start the webpack development server
- Open your browser to `http://localhost:3000`
- Enable hot reloading for instant feedback
- Watch for file changes

### Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (recommended during development)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

#### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting errors
npm run lint:fix
```

#### Formatting

```bash
# Check code formatting
npm run format:check

# Format all code
npm run format
```

#### Type Checking

```bash
# Run TypeScript compiler check
npm run type-check
```

## Project Structure

```
stick-ranger/
├── .github/                 # GitHub templates and workflows
│   ├── workflows/          # CI/CD pipelines
│   ├── ISSUE_TEMPLATE/     # Issue templates
│   └── pull_request_template.md
├── docs/                   # Documentation
│   └── API.md             # API documentation
├── legacy/                 # Legacy code (moved from root)
│   ├── HTML/              # Original HTML files
│   ├── CSS/               # Original CSS files
│   └── JavaScript/        # Original JavaScript files
├── public/                 # Static assets
│   └── index.html         # HTML template
├── src/                    # Source code
│   ├── components/        # React components
│   ├── systems/           # Game logic systems
│   ├── types/             # TypeScript type definitions
│   ├── styles/            # CSS styles
│   ├── utils/             # Utility functions
│   ├── assets/            # Images, fonts, etc.
│   ├── tests/             # Test files
│   ├── App.tsx            # Main App component
│   ├── index.tsx          # Application entry point
│   └── setupTests.ts      # Test configuration
├── dist/                   # Build output (generated)
├── node_modules/          # Dependencies (generated)
├── .eslintrc.json         # ESLint configuration
├── .prettierrc.json       # Prettier configuration
├── .gitignore             # Git ignore rules
├── jest.config.js         # Jest test configuration
├── tsconfig.json          # TypeScript configuration
├── webpack.config.js      # Webpack build configuration
├── package.json           # Project dependencies and scripts
├── README.md              # Project overview
├── CONTRIBUTING.md        # Contribution guidelines
└── LICENSE                # Project license
```

## VS Code Setup (Recommended)

### Extensions

Install these recommended extensions:

1. **ES7+ React/Redux/React-Native snippets**
2. **TypeScript Importer**
3. **ESLint**
4. **Prettier - Code formatter**
5. **Auto Rename Tag**
6. **Bracket Pair Colorizer**
7. **GitLens**

### Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## Common Development Tasks

### Adding a New Component

1. Create the component file in `src/components/`
2. Follow the naming convention: `ComponentName.tsx`
3. Export the component as default
4. Add corresponding styles if needed
5. Write tests in `src/tests/ComponentName.test.tsx`

### Adding Game System Logic

1. Create the system file in `src/systems/`
2. Follow the naming convention: `SystemName.ts`
3. Export the main class
4. Add type definitions in `src/types/`
5. Write comprehensive tests

### Adding Styles

1. Create or modify CSS files in `src/styles/`
2. Import styles in `src/styles/index.css`
3. Use CSS modules or global styles as appropriate
4. Follow BEM naming convention for classes

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
NODE_ENV=development
PORT=3000
```

## Debugging

### Browser DevTools

- Use React Developer Tools for component debugging
- Use browser console for runtime debugging
- Use Network tab for performance analysis

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Chrome",
      "request": "launch",
      "type": "pwa-chrome",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

## Performance Optimization

### Development Best Practices

- Use React DevTools Profiler
- Monitor bundle size with webpack-bundle-analyzer
- Implement lazy loading for routes
- Use React.memo for expensive components
- Optimize images and assets

### Build Optimization

```bash
# Analyze bundle size
npx webpack-bundle-analyzer dist/

# Run production build
npm run build
```

## Common Issues and Solutions

### Port Already in Use

```bash
# Kill process using port 3000
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

### Node Modules Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Restart TypeScript service in VS Code
Ctrl/Cmd + Shift + P > "TypeScript: Restart TS Server"

# Check TypeScript configuration
npm run type-check
```

## Getting Help

- Check the [Issues](https://github.com/Sapogamez/Stick-Ranger/issues) page
- Read the [Contributing Guidelines](../CONTRIBUTING.md)
- Review the [API Documentation](API.md)
- Ask questions in GitHub Discussions

## Next Steps

After setting up your development environment:

1. Read the [Contributing Guidelines](../CONTRIBUTING.md)
2. Look for "good first issue" labels in the Issues
3. Explore the codebase and run the application
4. Set up your IDE with recommended extensions
5. Start contributing!

Happy coding! 🎮
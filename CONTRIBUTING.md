# Contributing to Stick Ranger

Thank you for your interest in contributing to Stick Ranger! This document provides guidelines and information for contributors.

## 🎯 Ways to Contribute

### Code Contributions
- Bug fixes and performance improvements
- New features and game mechanics
- UI/UX enhancements
- Test coverage improvements
- Documentation updates

### Non-Code Contributions
- Bug reports and feature requests
- Game balance feedback
- Documentation improvements
- Community support

## 🚀 Getting Started

### Prerequisites

1. **Node.js** (v16 or higher)
2. **npm** or **yarn**
3. **Git** for version control
4. **TypeScript** knowledge (helpful but not required)
5. **React** familiarity (recommended)

### Development Setup

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/your-username/Stick-Ranger.git
cd Stick-Ranger

# Add upstream remote
git remote add upstream https://github.com/Sapogamez/Stick-Ranger.git

# Install dependencies
npm install

# Start development server
npm start
```

### Project Structure

```
Stick-Ranger/
├── src/
│   ├── components/     # React components
│   ├── systems/        # Game logic systems
│   ├── types/          # TypeScript type definitions
│   ├── styles/         # CSS styling
│   └── tests/          # Test files
├── docs/
│   └── wiki/           # Documentation
├── HTML/               # Static HTML files
├── CSS/                # Global styles
└── JavaScript/         # Legacy JS files
```

## 📝 Development Guidelines

### Code Style

#### TypeScript/JavaScript
- Use TypeScript for all new code
- Follow existing naming conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

```typescript
/**
 * Calculates damage based on attacker stats and target defense
 * @param attacker - The attacking player
 * @param target - The target enemy
 * @returns The calculated damage amount
 */
function calculateDamage(attacker: Player, target: Enemy): number {
  return Math.max(1, attacker.stats.atk - target.defense);
}
```

#### React Components
- Use functional components with hooks
- Follow the existing component structure
- Use TypeScript interfaces for props

```typescript
interface PlayerCardProps {
  player: Player;
  onUpdate: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onUpdate }) => {
  // Component implementation
};
```

#### CSS
- Use CSS modules or styled-components
- Follow BEM naming convention for classes
- Maintain responsive design principles

### Git Workflow

#### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Commit Messages
Follow conventional commit format:

```
type(scope): description

body (optional)

footer (optional)
```

Examples:
```
feat(combat): add critical hit calculation
fix(ui): resolve player card display issue
docs(readme): update installation instructions
```

### Testing

#### Writing Tests
- Write tests for all new features
- Use Jest and React Testing Library
- Aim for at least 80% code coverage
- Test both positive and negative scenarios

```typescript
// Example test structure
describe('CombatSystem', () => {
  it('should calculate damage correctly', () => {
    const attacker = createMockPlayer({ atk: 10 });
    const target = createMockEnemy({ defense: 3 });
    
    const damage = calculateDamage(attacker, target);
    
    expect(damage).toBe(7);
  });
});
```

#### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🐛 Bug Reports

### Before Submitting
1. Check existing issues to avoid duplicates
2. Ensure you're using the latest version
3. Try to reproduce the bug consistently

### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Step one
2. Step two
3. Step three

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- Browser: [e.g., Chrome 96]
- OS: [e.g., Windows 10]
- Game Version: [e.g., v1.2.0]

## Additional Context
Screenshots, error messages, etc.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the proposed feature

## Problem Statement
What problem does this solve?

## Proposed Solution
Detailed description of your solution

## Alternatives Considered
Other approaches you've thought about

## Additional Context
Mockups, examples, references
```

## 🎮 Game Balance Contributions

### Balance Feedback
- Test new character classes thoroughly
- Report overpowered or underpowered abilities
- Suggest stat adjustments with reasoning
- Consider impact on different play styles

### Balance Testing Process
1. Play-test changes extensively
2. Document performance metrics
3. Consider edge cases and exploits
4. Get feedback from multiple players

## 📚 Documentation Contributions

### Documentation Guidelines
- Use clear, concise language
- Include code examples where relevant
- Keep documentation up-to-date with code changes
- Use proper markdown formatting

### Wiki Contributions
- Follow existing documentation structure
- Include technical details and examples
- Add diagrams or screenshots when helpful
- Cross-reference related documentation

## 🔄 Pull Request Process

### Before Submitting
1. Ensure all tests pass: `npm test`
2. Verify TypeScript compilation: `npm run build`
3. Update documentation if needed
4. Add tests for new functionality

### Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All existing tests pass
- [ ] New tests added and passing
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors or warnings
```

### Review Process
1. Automated checks must pass
2. At least one maintainer review required
3. Address all review feedback
4. Maintain clean commit history

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributor section
- Release notes for significant contributions
- GitHub contributor statistics

## 📞 Getting Help

### Community Support
- **GitHub Discussions**: For general questions
- **Issues**: For bug reports and feature requests
- **Discord** (if available): Real-time community chat

### Maintainer Contact
- Create GitHub issues for technical questions
- Use discussions for design questions
- Tag maintainers in relevant issues

## 🔒 Security

### Reporting Security Issues
- Do not create public issues for security vulnerabilities
- Email security concerns to project maintainers
- Include detailed reproduction steps
- Allow time for fixes before public disclosure

---

Thank you for contributing to Stick Ranger! Your efforts help make the game better for everyone. 🎮
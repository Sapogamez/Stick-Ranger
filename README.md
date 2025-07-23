# Stick Ranger

A modern recreation of the classic Stick Ranger RPG game using TypeScript, React, and modern web technologies.

## 🎮 About

Stick Ranger is a beloved classic RPG game featuring stick figure characters in an adventure-filled world. This project aims to recreate the game experience using modern web development practices while maintaining the charm and gameplay mechanics of the original.

## 🚀 Features

- **Modern Tech Stack**: Built with TypeScript, React, and Webpack
- **Component-Based Architecture**: Modular, reusable components
- **Comprehensive Testing**: Unit tests with Jest and React Testing Library
- **Type Safety**: Full TypeScript support for better code quality
- **Developer Experience**: ESLint, Prettier, and hot reloading
- **Responsive Design**: Works across different screen sizes
- **Performance Optimized**: Code splitting and optimized bundles

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/Sapogamez/Stick-Ranger.git
cd Stick-Ranger
```

2. Install dependencies:
```bash
npm install
```

## 🏃‍♂️ Development

Start the development server:
```bash
npm run dev
```

The game will be available at `http://localhost:3000` with hot reloading enabled.

## 🏗️ Building

Build for production:
```bash
npm run build
```

Build for development:
```bash
npm run build:dev
```

## 🧪 Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

## 🔧 Development Tools

### Linting
```bash
npm run lint          # Check for linting errors
npm run lint:fix      # Fix auto-fixable linting errors
```

### Formatting
```bash
npm run format        # Format code with Prettier
npm run format:check  # Check if code is properly formatted
```

### Type Checking
```bash
npm run type-check    # Run TypeScript compiler check
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Button.tsx
│   ├── GameBoard.tsx
│   ├── MapSystem.tsx
│   ├── PlayerCard.tsx
│   ├── Slider.tsx
│   └── Toggle.tsx
├── systems/            # Game logic systems
│   ├── CombatSystem.ts
│   ├── EnemyAI.ts
│   ├── SkillSystem.ts
│   └── SkillPriorityManager.ts
├── types/              # TypeScript type definitions
│   └── game.ts
├── styles/             # CSS styles
│   ├── index.css
│   ├── components.css
│   └── game.css
├── utils/              # Utility functions
├── assets/             # Static assets
├── tests/              # Test files
├── App.tsx             # Main App component
└── index.tsx           # Application entry point
```

## 🎯 Game Features

### Character Classes
- **Warrior**: Melee combat specialist
- **Archer**: Ranged damage dealer
- **Mage**: Magical damage and spells
- **Priest**: Support and healing
- **Boxer**: Hand-to-hand combat

### Game Systems
- **Combat System**: Turn-based combat mechanics
- **Skill System**: Character abilities and upgrades
- **Enemy AI**: Intelligent enemy behavior
- **Map System**: Level progression and exploration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature-name`
8. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Stick Ranger game creators
- The open-source community for tools and libraries
- Contributors and testers

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Sapogamez/Stick-Ranger/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the problem

## 🗺️ Roadmap

- [ ] Core game mechanics implementation
- [ ] Character progression system
- [ ] Save/load functionality
- [ ] Multiplayer support
- [ ] Mobile optimization
- [ ] Sound and music integration
- [ ] Advanced graphics and animations

# Stick Ranger

A comprehensive stick figure-based RPG game featuring advanced combat systems, character progression, and multiplayer capabilities.

## 🎮 Game Overview

Stick Ranger is a tactical RPG where players control stick figure characters through various levels, battling enemies and collecting equipment. The game features multiple character classes, each with unique abilities and progression paths.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- TypeScript 5.8+
- React 19+

### Installation
```bash
npm install
```

### Building
```bash
npm run build
```

### Running the Game

#### Canvas Version (New)
The new TypeScript/React implementation with canvas rendering:
```bash
npm start  # Run the compiled game
# Or for development:
npm run dev  # Watch mode for development
```

#### HTML Version (Legacy)
Open `HTML/index.html` in a web browser or serve via a local development server.

### Game Infrastructure

The game now features a complete TypeScript-based engine with:

- **Canvas Rendering**: Hardware-accelerated 2D rendering with the Canvas API
- **Game Loop**: Fixed timestep game loop with FPS monitoring and debug controls
- **Entity System**: Complete Entity-Component-System architecture for game objects
- **React Integration**: React components for UI and game integration
- **TypeScript**: Full type safety with strict mode enabled

#### Debug Controls
- **Space**: Pause/Resume game
- **1-5**: Time scale control (0.1x to 5x speed)

## 🏗️ Architecture

This project uses a modern Entity-Component-System (ECS) architecture with the following key systems:

- **Combat System**: Handles damage calculations, status effects, and combat mechanics
- **AI System**: Manages enemy behavior patterns and decision making  
- **Physics System**: Collision detection and movement calculations
- **Rendering System**: Canvas-based rendering with optimized draw calls
- **Input System**: Keyboard and mouse input handling with customizable bindings

## 📁 Project Structure

```
src/
├── components/       # React components for UI (including Game.tsx)
├── engine/          # Core game engine (GameLoop.ts, Canvas.ts)
├── systems/         # Game systems (Combat, AI, Physics, EntitySystem.ts)
├── types/           # TypeScript type definitions
├── tests/           # Unit and integration tests
└── index.ts         # Main entry point

HTML/                # Legacy game HTML files
CSS/                 # Stylesheets
JavaScript/          # Legacy JavaScript files
dist/                # Compiled TypeScript output
```

## 🎯 Character Classes

- **Warrior**: Melee fighter with high health and defense
- **Archer**: Ranged attacker with precision and mobility  
- **Mage**: Magic user with powerful spells and crowd control
- **Priest**: Support class with healing and buffs
- **Boxer**: Fast melee fighter with combo attacks

## 🔧 Development

### Building
```bash
npx tsc
```

### Testing
```bash
npm test  # When test scripts are configured
```

### Linting
Follow TypeScript strict mode guidelines for consistent code quality.

## 📚 Documentation

- [Technical Documentation](TECHNICAL_DOCUMENTATION.md) - Detailed system implementations
- [Gameplay Mechanics](GAMEPLAY_MECHANICS.md) - Combat and ability systems
- [Wiki](WIKI.md) - Character classes and equipment guide
- [Code Examples](CODE_EXAMPLES.md) - Implementation patterns and examples

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following TypeScript best practices
4. Ensure all types compile without errors
5. Submit a pull request

## 📄 License

This project is open source. Please respect the original Stick Ranger game concepts and artwork.

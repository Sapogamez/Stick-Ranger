# Stick Ranger Game Infrastructure Guide

## Overview

This guide explains how to use the newly implemented game infrastructure for Stick Ranger, which provides a solid foundation for building a TypeScript-based game with React integration.

## Architecture

### Core Components

1. **Game Engine** (`src/engine/`)
   - `GameLoop.ts`: Main game loop with fixed timestep and FPS monitoring
   - `Canvas.ts`: Canvas rendering context with drawing utilities

2. **Entity System** (`src/systems/`)
   - `EntitySystem.ts`: High-level wrapper for entity management
   - Builds on existing `EntityComponentSystem.ts` for full ECS architecture

3. **React Integration** (`src/components/`)
   - `Game.tsx`: Main React component that wraps the canvas game

4. **Entry Point** (`src/index.ts`)
   - Initializes and starts the game engine

## Quick Start

### Building the Game

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run in Node.js (for testing)
npm start

# Development mode (watch for changes)
npm run dev
```

### Using in Browser

1. Include the compiled JavaScript in an HTML file:
```html
<canvas id="gameCanvas" width="800" height="600"></canvas>
<script src="dist/index.js"></script>
```

2. Or use the React component:
```jsx
import { Game } from './src/components/Game';

function App() {
  return <Game width={800} height={600} showDebug={true} />;
}
```

## Game Loop Features

### Debug Controls

The game loop includes built-in debug controls:

- **Space**: Pause/Resume the game
- **1**: Set time scale to 0.1x (slow motion)
- **2**: Set time scale to 0.5x
- **3**: Set time scale to 1.0x (normal speed)
- **4**: Set time scale to 2.0x
- **5**: Set time scale to 5.0x (fast forward)

### Performance Monitoring

The game displays real-time performance information:
- FPS (Frames Per Second)
- Delta time in milliseconds
- Entity count
- Game state (running/paused)

## Entity System Usage

### Creating Entities

```typescript
import { EntitySystem } from './src/systems/EntitySystem';

const entitySystem = new EntitySystem();

// Create a player
const player = entitySystem.createPlayer({ x: 400, y: 300 });

// Create an enemy
const enemy = entitySystem.createEnemy({ x: 200, y: 200 });
```

### Custom Entities

```typescript
// Get the underlying entity manager for advanced usage
const entity = entitySystem.getAllEntities()[0];

// Add components
entity.addComponent(new HealthComponent(100));
entity.addComponent(new MovementComponent(150));
```

## Canvas Rendering

### Basic Drawing

```typescript
import { Canvas } from './src/engine/Canvas';

const canvas = new Canvas('myCanvas', 800, 600);

// Drawing operations
canvas.clear();
canvas.fill('#1a1a1a');
canvas.drawRect(100, 100, 50, 50, '#ff0000');
canvas.drawCircle(200, 200, 25, '#00ff00');
canvas.drawText('Hello World', 10, 10, '#ffffff');
```

### Advanced Rendering

```typescript
// Save/restore context
canvas.save();
canvas.setAlpha(0.5);
// ... drawing operations ...
canvas.restore();

// Drawing lines and shapes
canvas.drawLine({ x: 0, y: 0 }, { x: 100, y: 100 }, '#ffffff', 2);
canvas.drawCircleOutline(300, 300, 50, '#ffff00', 3);
```

## React Integration

### Basic Game Component

```tsx
import React from 'react';
import { Game } from './src/components/Game';

export function MyGame() {
  return (
    <div>
      <h1>My Stick Ranger Game</h1>
      <Game 
        width={800} 
        height={600} 
        showDebug={true} 
      />
    </div>
  );
}
```

### Custom Game Controls

```tsx
function GameWithControls() {
  const [isPaused, setIsPaused] = useState(false);
  
  return (
    <div>
      <Game width={800} height={600} />
      <button onClick={() => {
        // Access game loop through refs if needed
      }}>
        {isPaused ? 'Resume' : 'Pause'}
      </button>
    </div>
  );
}
```

## TypeScript Configuration

The project uses strict TypeScript configuration:

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "forceConsistentCasingInFileNames": true,
    "jsx": "react"
  }
}
```

## Next Steps

With this infrastructure in place, you can now:

1. **Add Game Logic**: Implement player controls, enemy AI, and game mechanics
2. **Enhance Graphics**: Add sprites, animations, and visual effects
3. **Create UI**: Build React components for menus, HUD, and game interface
4. **Add Audio**: Integrate sound effects and music
5. **Implement Networking**: Add multiplayer capabilities
6. **Optimize Performance**: Profile and optimize rendering and game logic

## Example: Adding a New System

```typescript
// Create a new system
class MyCustomSystem extends System {
  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      // Custom logic here
    });
  }
}

// Add it to the entity system
const customSystem = new MyCustomSystem();
entityManager.addSystem(customSystem);
```

This infrastructure provides a solid, type-safe foundation for building complex game features while maintaining good performance and code organization.
# Technical Architecture Documentation

## System Overview

Stick Ranger is built using modern web technologies with a focus on maintainability, performance, and scalability. The architecture follows React best practices with TypeScript for type safety and component-based design patterns.

## Technology Stack

### Frontend Framework
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "@types/react": "^19.1.8",
  "@types/react-dom": "^19.1.6"
}
```

### Build and Development Tools
```json
{
  "typescript": "^5.8.3",
  "jest": "^30.0.5",
  "@types/jest": "^30.0.0"
}
```

### Project Structure

```
Stick-Ranger/
├── src/
│   ├── components/          # React components
│   │   ├── Button.tsx
│   │   ├── GameBoard.tsx
│   │   ├── MapSystem.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── Slider.tsx
│   │   └── Toggle.tsx
│   ├── systems/             # Game logic systems
│   │   ├── CombatSystem.ts
│   │   ├── EnemyAI.ts
│   │   ├── SkillPriorityManager.ts
│   │   └── SkillSystem.ts
│   ├── types/               # TypeScript definitions
│   │   └── game.ts
│   ├── styles/              # Component styling
│   └── tests/               # Test files
├── docs/                    # Documentation
│   └── wiki/               # Detailed documentation
├── HTML/                   # Static HTML files
├── CSS/                    # Global stylesheets
├── JavaScript/             # Legacy JavaScript files
└── dist/                   # Build output
```

## Component Architecture

### Component Hierarchy

```
App
├── GameBoard (Main game container)
│   ├── MapSystem (Battlefield management)
│   ├── PlayerCard[] (Character displays)
│   │   ├── Button[] (Action controls)
│   │   ├── Slider[] (Stat displays)
│   │   └── Toggle[] (Setting controls)
│   └── CombatSystem (Game logic integration)
```

### Core Components

#### GameBoard Component
The main game container managing overall game state and coordination:

```typescript
import React, { useEffect, useState } from 'react';
import MapSystem from './MapSystem';
import SkillPriorityManager from '../systems/SkillPriorityManager';
import EnemyAI from '../systems/EnemyAI';
import { Player, Enemy } from '../types/game';

const GameBoard: React.FC = () => {
  const [currentLevel, setCurrentLevel] = useState('Level 1');
  const [gameOver, setGameOver] = useState(false);
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [enemies, setEnemies] = useState<Enemy[]>(initialEnemies);

  // Game loop implementation
  useEffect(() => {
    const gameLoop = setInterval(() => {
      updateGameState();
    }, 1000 / 60); // 60 FPS

    return () => clearInterval(gameLoop);
  }, []);

  return (
    <div className="game-board">
      <MapSystem level={currentLevel} />
      {players.map(player => (
        <PlayerCard key={player.id} player={player} />
      ))}
    </div>
  );
};
```

#### PlayerCard Component
Displays individual character information and controls:

```typescript
interface PlayerCardProps {
  player: Player;
  onUpdate?: (player: Player) => void;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onUpdate }) => {
  return (
    <div className="player-card">
      <div className="character-info">
        <h3>{player.class}</h3>
        <div className="stats">
          <Slider 
            label="HP" 
            value={player.stats.hp} 
            max={player.stats.maxHp} 
          />
          <Slider 
            label="Mana" 
            value={player.stats.mana} 
            max={100} 
          />
        </div>
      </div>
      <div className="controls">
        <Toggle 
          label="Auto Attack" 
          onChange={handleAutoAttackToggle} 
        />
        <Button 
          onClick={() => useSkill(player, 'heal')}
          disabled={!canUseSkill(player, 'heal')}
        >
          Heal
        </Button>
      </div>
    </div>
  );
};
```

## Game Systems Architecture

### System Design Pattern

Game systems follow a modular architecture where each system handles specific aspects of gameplay:

```typescript
interface GameSystem {
  update(deltaTime: number): void;
  initialize(): void;
  cleanup(): void;
}

abstract class BaseSystem implements GameSystem {
  protected initialized: boolean = false;

  abstract update(deltaTime: number): void;
  
  initialize(): void {
    this.initialized = true;
  }
  
  cleanup(): void {
    this.initialized = false;
  }
}
```

### Combat System Implementation

```typescript
export class CombatSystem extends BaseSystem {
  protected autoAttackEnabled: boolean = false;
  private lastUpdateTime: number = 0;

  toggleAutoAttack(enabled: boolean): void {
    this.autoAttackEnabled = enabled;
  }

  update(deltaTime: number): void {
    if (!this.initialized) return;

    this.lastUpdateTime += deltaTime;
    
    // Update at 60 FPS
    if (this.lastUpdateTime >= 16.67) {
      this.processAutoAttacks();
      this.updateSkillCooldowns();
      this.processAutoSkills();
      this.lastUpdateTime = 0;
    }
  }

  private processAutoAttacks(): void {
    // Auto-attack logic implementation
  }

  private updateSkillCooldowns(): void {
    // Skill cooldown management
  }

  processAutoSkills(player: Player, targets: Enemy[]): void {
    if (!player.skills.length) return;

    const availableSkills = player.skills.filter(skill => 
      this.isSkillAvailable(player, skill)
    );

    if (availableSkills.length > 0) {
      const bestSkill = this.selectBestSkill(player, targets, availableSkills);
      if (bestSkill) {
        this.executeSkill(player, bestSkill, targets);
      }
    }
  }
}
```

### AI System Architecture

```typescript
interface AIController {
  update(enemy: Enemy, players: Player[], deltaTime: number): void;
  getTargetPriority(enemy: Enemy, players: Player[]): Player | null;
}

export class EnemyAI implements AIController {
  private behaviorStrategies: Map<AIBehavior, AIStrategy>;

  constructor() {
    this.behaviorStrategies = new Map([
      ['Aggressive', new AggressiveStrategy()],
      ['Defensive', new DefensiveStrategy()],
      ['Neutral', new NeutralStrategy()]
    ]);
  }

  update(enemy: Enemy, players: Player[], deltaTime: number): void {
    const strategy = this.behaviorStrategies.get(enemy.ai);
    if (strategy) {
      strategy.execute(enemy, players, deltaTime);
    }
  }

  updateEnemyAI(enemy: Enemy, players: Player[], deltaTime: number): void {
    // Legacy method maintained for compatibility
    this.update(enemy, players, deltaTime);
  }
}
```

## State Management

### Game State Structure

```typescript
interface GameState {
  currentLevel: string;
  gameOver: boolean;
  players: Player[];
  enemies: Enemy[];
  gameTime: number;
  settings: GameSettings;
}

interface GameSettings {
  autoAttackEnabled: boolean;
  difficultyLevel: 'Easy' | 'Normal' | 'Hard';
  soundEnabled: boolean;
  animationSpeed: number;
}
```

### State Management Pattern

Using React hooks for state management with custom hooks for game logic:

```typescript
// Custom hook for game state management
function useGameState() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  
  const updatePlayer = useCallback((playerId: number, updates: Partial<Player>) => {
    setGameState(prevState => ({
      ...prevState,
      players: prevState.players.map(player =>
        player.id === playerId ? { ...player, ...updates } : player
      )
    }));
  }, []);

  const updateEnemy = useCallback((enemyId: number, updates: Partial<Enemy>) => {
    setGameState(prevState => ({
      ...prevState,
      enemies: prevState.enemies.map(enemy =>
        enemy.id === enemyId ? { ...enemy, ...updates } : enemy
      )
    }));
  }, []);

  return {
    gameState,
    updatePlayer,
    updateEnemy,
    setGameState
  };
}
```

### Performance Optimization

#### Memoization Strategy

```typescript
// Memoize expensive calculations
const memoizedPlayerCard = React.memo(PlayerCard, (prevProps, nextProps) => {
  return (
    prevProps.player.stats.hp === nextProps.player.stats.hp &&
    prevProps.player.stats.mana === nextProps.player.stats.mana &&
    prevProps.player.equipment === nextProps.player.equipment
  );
});

// Memoize complex computations
const calculateDamage = useMemo(() => {
  return (attacker: Player, target: Enemy) => {
    return Math.max(1, attacker.stats.atk - target.defense);
  };
}, []);
```

#### Efficient Updates

```typescript
// Batch state updates to prevent excessive re-renders
const updateMultiplePlayers = useCallback((updates: PlayerUpdate[]) => {
  setGameState(prevState => ({
    ...prevState,
    players: prevState.players.map(player => {
      const update = updates.find(u => u.playerId === player.id);
      return update ? { ...player, ...update.changes } : player;
    })
  }));
}, []);
```

## Type System Architecture

### Core Type Definitions

```typescript
// Base interfaces for game entities
interface Entity {
  id: number;
  position: Position;
}

interface CombatEntity extends Entity {
  stats: CombatStats;
  equipment?: Equipment;
}

// Player type extending CombatEntity
export interface Player extends CombatEntity {
  class: PlayerClass;
  skills: Skill[];
  level?: number;
  experience?: number;
}

// Enemy type with AI behavior
export interface Enemy extends Entity {
  type: EnemyType;
  health: number;
  ai: AIBehavior;
  defense?: number;
}
```

### Type Guards and Validation

```typescript
// Type guards for runtime type checking
function isPlayer(entity: Entity): entity is Player {
  return 'class' in entity && 'skills' in entity;
}

function isEnemy(entity: Entity): entity is Enemy {
  return 'type' in entity && 'ai' in entity;
}

// Validation functions
function validatePlayerStats(stats: PlayerStats): boolean {
  return (
    stats.hp > 0 &&
    stats.maxHp > 0 &&
    stats.hp <= stats.maxHp &&
    stats.atk >= 0 &&
    stats.def >= 0 &&
    stats.spd > 0
  );
}
```

### Generic Utility Types

```typescript
// Utility types for common patterns
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Game-specific utility types
type PlayerUpdate = PartialBy<Player, 'id'>;
type EnemySpawn = RequiredBy<Partial<Enemy>, 'type' | 'ai'>;

// Event system types
interface GameEvent<T = any> {
  type: string;
  timestamp: number;
  data: T;
}

type GameEventHandler<T> = (event: GameEvent<T>) => void;
```

## Event System

### Event-Driven Architecture

```typescript
class EventEmitter<T extends Record<string, any>> {
  private listeners: Map<keyof T, Set<Function>> = new Map();

  on<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  off<K extends keyof T>(event: K, listener: (data: T[K]) => void): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.listeners.get(event)?.forEach(listener => listener(data));
  }
}

// Game events interface
interface GameEvents {
  playerDamaged: { playerId: number; damage: number };
  enemyDefeated: { enemyId: number; experience: number };
  skillUsed: { playerId: number; skillId: string };
  levelCompleted: { level: string; time: number };
}

// Global event emitter
export const gameEvents = new EventEmitter<GameEvents>();
```

## Error Handling

### Error Boundaries

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class GameErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game error:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-screen">
          <h2>Game Error</h2>
          <p>Something went wrong. Please refresh the page.</p>
          <button onClick={() => window.location.reload()}>
            Restart Game
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Runtime Error Handling

```typescript
// Error handling utilities
class GameError extends Error {
  constructor(
    message: string,
    public code: string,
    public context?: any
  ) {
    super(message);
    this.name = 'GameError';
  }
}

// Safe execution wrapper
function safeExecute<T>(
  operation: () => T,
  fallback: T,
  errorHandler?: (error: Error) => void
): T {
  try {
    return operation();
  } catch (error) {
    if (errorHandler) {
      errorHandler(error as Error);
    } else {
      console.error('Safe execution failed:', error);
    }
    return fallback;
  }
}
```

## Testing Architecture

### Component Testing Strategy

```typescript
// Test utilities
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Test factory functions
function createMockPlayer(overrides?: Partial<Player>): Player {
  return {
    id: 1,
    class: 'Warrior',
    stats: { hp: 100, maxHp: 100, atk: 10, def: 5, spd: 2, range: 1, mana: 50 },
    position: { x: 0, y: 0 },
    equipment: { weapon: 'Sword', armor: 'Shield', accessory: 'Ring', boots: 'Boots' },
    skills: [],
    ...overrides
  };
}

// Component test example
describe('PlayerCard', () => {
  test('displays player information correctly', () => {
    const mockPlayer = createMockPlayer();
    render(<PlayerCard player={mockPlayer} />);
    
    expect(screen.getByText('Warrior')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument(); // HP
  });

  test('handles auto-attack toggle', () => {
    const mockPlayer = createMockPlayer();
    const onUpdate = jest.fn();
    
    render(<PlayerCard player={mockPlayer} onUpdate={onUpdate} />);
    
    const toggle = screen.getByLabelText('Auto Attack');
    fireEvent.click(toggle);
    
    expect(onUpdate).toHaveBeenCalled();
  });
});
```

### System Testing

```typescript
// Game system tests
describe('CombatSystem', () => {
  let combatSystem: CombatSystem;
  
  beforeEach(() => {
    combatSystem = new CombatSystem();
    combatSystem.initialize();
  });

  test('auto-attack can be toggled', () => {
    expect(combatSystem['autoAttackEnabled']).toBe(false);
    
    combatSystem.toggleAutoAttack(true);
    expect(combatSystem['autoAttackEnabled']).toBe(true);
  });

  test('processes auto skills correctly', () => {
    const player = createMockPlayer({
      skills: [{ id: 'heal', name: 'Heal', cooldown: 0, manaCost: 10 }]
    });
    const enemies = [createMockEnemy()];
    
    const spy = jest.spyOn(combatSystem as any, 'executeSkill');
    combatSystem.processAutoSkills(player, enemies);
    
    expect(spy).toHaveBeenCalled();
  });
});
```

## Build and Deployment

### TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": [
    "src"
  ]
}
```

### Build Process

```bash
# Development build with hot reload
npm start

# Production build with optimization
npm run build

# Type checking without emitting files
npm run type-check

# Run tests
npm test
```

## Performance Considerations

### Memory Management

```typescript
// Cleanup patterns for preventing memory leaks
useEffect(() => {
  const gameLoop = setInterval(updateGame, 16);
  
  return () => {
    clearInterval(gameLoop); // Cleanup timers
  };
}, []);

// Object pooling for frequently created objects
class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;

  constructor(factory: () => T, initialSize: number = 10) {
    this.factory = factory;
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory());
    }
  }

  get(): T {
    return this.pool.pop() || this.factory();
  }

  release(obj: T): void {
    this.pool.push(obj);
  }
}
```

### Optimization Strategies

- **Component Memoization**: Use React.memo for expensive components
- **State Batching**: Batch multiple state updates together
- **Event Debouncing**: Debounce high-frequency events
- **Lazy Loading**: Load components and assets on demand
- **Virtual Scrolling**: For large lists of game entities

---

This technical architecture documentation provides a comprehensive overview of the system design, implementation patterns, and best practices used in Stick Ranger's development.
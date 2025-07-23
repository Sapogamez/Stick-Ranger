# API Documentation

This document provides an overview of the Stick Ranger game architecture and APIs.

## Game Systems

### Combat System

The `CombatSystem` handles all combat-related mechanics including damage calculation, turn management, and battle flow.

#### Methods

- `calculateDamage(attacker: Player, target: Enemy): number` - Calculates damage based on attacker stats and target defense
- `executeAttack(player: Player, enemy: Enemy): void` - Executes an attack action
- `processTurn(): void` - Processes a single combat turn
- `isAutoAttackEnabled(): boolean` - Returns current auto-attack state

### Skill System

The `SkillSystem` manages character abilities, skill trees, and progression.

#### Methods

- `useSkill(player: Player, skillId: string): void` - Executes a skill
- `canUseSkill(player: Player, skillId: string): boolean` - Checks if skill can be used
- `getAvailableSkills(player: Player): Skill[]` - Returns usable skills for a player

### Enemy AI

The `EnemyAI` system controls enemy behavior patterns and decision making.

#### Methods

- `selectTarget(enemies: Enemy[], players: Player[]): Player` - AI target selection
- `chooseAction(enemy: Enemy): Action` - Determines enemy action for the turn
- `updateBehavior(enemy: Enemy): void` - Updates enemy behavior based on game state

## Components

### GameBoard

Main game component that orchestrates all game systems.

#### Props

- `initialPlayers?: Player[]` - Starting player configuration
- `gameMode?: 'story' | 'arena'` - Game mode selection

### PlayerCard

Component for displaying and managing individual player information.

#### Props

- `player: Player` - Player data object
- `onClassChange: (playerId: string, newClass: PlayerClass) => void` - Class change handler
- `autoSkillEnabled: boolean` - Auto-skill toggle state
- `onAutoSkillToggle: (enabled: boolean) => void` - Auto-skill toggle handler

### MapSystem

Component for level selection and progression tracking.

#### Props

- `levels: string[]` - Available levels
- `currentLevel: string` - Currently selected level
- `onLevelSelect: (level: string) => void` - Level selection handler

## Types

### Player

```typescript
interface Player {
  id: string;
  class: PlayerClass;
  stats: PlayerStats;
  level: number;
  experience: number;
  skills: Skill[];
}
```

### PlayerStats

```typescript
interface PlayerStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
}
```

### Enemy

```typescript
interface Enemy {
  id: string;
  type: EnemyType;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  level: number;
}
```

### Skill

```typescript
interface Skill {
  id: string;
  name: string;
  description: string;
  manaCost: number;
  cooldown: number;
  effect: SkillEffect;
}
```

## Events

The game uses a custom event system for component communication:

- `player-damaged` - Fired when a player takes damage
- `enemy-defeated` - Fired when an enemy is defeated
- `level-completed` - Fired when a level is completed
- `skill-used` - Fired when a skill is activated

## Configuration

### Game Constants

```typescript
const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  MAX_LEVEL: 100,
  BASE_EXPERIENCE: 100,
  DAMAGE_MULTIPLIER: 1.2
};
```

### Player Classes

- **Warrior**: High attack and defense, melee focused
- **Archer**: High speed and range, physical damage
- **Mage**: Magic damage and area effects
- **Priest**: Healing and support abilities
- **Boxer**: Fast attacks and combo system

## Usage Examples

### Creating a New Game

```typescript
import { GameBoard } from '@components/GameBoard';

const initialPlayers = [
  { id: '1', class: 'Warrior', level: 1 },
  { id: '2', class: 'Mage', level: 1 }
];

<GameBoard initialPlayers={initialPlayers} gameMode="story" />
```

### Using Combat System

```typescript
import { CombatSystem } from '@systems/CombatSystem';

const combat = new CombatSystem();
const damage = combat.calculateDamage(player, enemy);
combat.executeAttack(player, enemy);
```

## Error Handling

The game includes comprehensive error handling for:

- Invalid player configurations
- Combat calculation errors
- Save/load failures
- Network connectivity issues

All errors are logged to the console in development mode and handled gracefully in production.

## Performance Considerations

- Components use React.memo for optimization
- State updates are batched where possible
- Large data sets are paginated
- Images and assets are lazy-loaded

## Testing

The API includes comprehensive test coverage:

- Unit tests for all game systems
- Integration tests for component interactions
- End-to-end tests for complete game flows
- Performance tests for critical paths

See the test files in `src/tests/` for implementation examples.
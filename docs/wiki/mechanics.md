# Game Mechanics Documentation

## Combat System

The combat system in Stick Ranger is the core gameplay mechanic, combining real-time action with strategic decision-making. The system is built around the `CombatSystem` class and integrates with various game components.

### Core Combat Loop

```typescript
// Combat system implementation
export class CombatSystem {
  protected autoAttackEnabled: boolean = false;

  toggleAutoAttack(enabled: boolean): void {
    this.autoAttackEnabled = enabled;
  }

  processAutoSkills(player: Player, targets: Enemy[]): void {
    // Check cooldowns and mana costs
    // Apply skill priority and conditions
    // Execute highest priority available skill
  }
}
```

### Damage Calculation

Damage in Stick Ranger follows a straightforward formula that considers both offensive and defensive capabilities:

```typescript
function calculateDamage(attacker: Player, target: Enemy): number {
  const baseDamage = attacker.stats.atk;
  const defense = target.defense || 0;
  const finalDamage = Math.max(1, baseDamage - defense);
  
  // Critical hit chance (future implementation)
  const criticalChance = attacker.stats.critRate || 0;
  const isCritical = Math.random() < criticalChance;
  
  return isCritical ? finalDamage * 2 : finalDamage;
}
```

### Auto-Attack System

Auto-attack provides continuous combat engagement without constant player input:

#### Features:
- **Toggle Control**: Players can enable/disable auto-attack
- **Target Priority**: Automatic target selection based on proximity and threat
- **Attack Speed**: Governed by character's speed statistic
- **Range Consideration**: Respects character's attack range limitations

#### Implementation:

```typescript
interface AutoAttackConfig {
  enabled: boolean;
  attackSpeed: number;
  targetPriority: 'nearest' | 'weakest' | 'strongest';
  range: number;
}

class AutoAttackSystem {
  private lastAttackTime: number = 0;
  
  update(player: Player, enemies: Enemy[], deltaTime: number): void {
    if (!this.config.enabled) return;
    
    const currentTime = Date.now();
    const attackCooldown = 1000 / player.stats.spd; // Convert speed to cooldown
    
    if (currentTime - this.lastAttackTime >= attackCooldown) {
      const target = this.selectTarget(player, enemies);
      if (target && this.isInRange(player, target)) {
        this.executeAttack(player, target);
        this.lastAttackTime = currentTime;
      }
    }
  }
}
```

## Character Statistics

Every character in Stick Ranger has core statistics that define their capabilities:

```typescript
interface PlayerStats {
  hp: number;        // Current health points
  maxHp: number;     // Maximum health points
  atk: number;       // Attack power
  def: number;       // Defense rating
  spd: number;       // Speed (affects attack rate and movement)
  range: number;     // Attack range
  mana: number;      // Magic points for skills
}
```

### Stat Interactions

- **HP/MaxHP**: Determines survival capability and healing thresholds
- **Attack vs Defense**: Core damage calculation components
- **Speed**: Affects both attack frequency and movement capabilities
- **Range**: Determines engagement distance and positioning strategy
- **Mana**: Enables skill usage and special abilities

## Skill System

The skill system provides depth and customization to combat through special abilities with strategic costs and benefits.

### Skill Structure

```typescript
interface Skill {
  id: string;         // Unique identifier
  name: string;       // Display name
  cooldown: number;   // Time between uses (milliseconds)
  manaCost: number;   // Mana required to cast
  damage?: number;    // Damage dealt (if applicable)
  healing?: number;   // Healing provided (if applicable)
  range?: number;     // Skill range override
  aoeRadius?: number; // Area of effect radius
}
```

### Skill Priority System

The `SkillPriorityManager` determines which skills to use automatically:

```typescript
interface SkillPriority {
  condition: (player: Player, enemies: Enemy[]) => boolean;
  skillId: string;
  priority: number; // Higher numbers = higher priority
}

// Example priority configurations
const healingPriority: SkillPriority = {
  condition: (player) => player.stats.hp < player.stats.maxHp * 0.3,
  skillId: 'heal',
  priority: 10
};

const offensivePriority: SkillPriority = {
  condition: (player, enemies) => enemies.length > 2,
  skillId: 'fireball',
  priority: 7
};
```

### Skill Categories

#### Offensive Skills
- **Direct Damage**: Single-target damage abilities
- **Area of Effect**: Multi-target damage abilities
- **Damage Over Time**: Persistent damage effects

#### Defensive Skills
- **Healing**: Restore health to self or allies
- **Shielding**: Temporary damage reduction
- **Positioning**: Movement and escape abilities

#### Utility Skills
- **Buffs**: Temporary stat enhancements
- **Debuffs**: Enemy weakening effects
- **Control**: Stun, slow, or immobilize effects

## Enemy AI System

The AI system drives enemy behavior and creates challenging encounters:

```typescript
interface Enemy {
  id: number;
  type: EnemyType;
  health: number;
  position: Position;
  ai: AIBehavior;
  attackRange: number;
  moveSpeed: number;
  defense: number;
}

type AIBehavior = 'Aggressive' | 'Defensive' | 'Neutral';
```

### AI Behavior Types

#### Aggressive AI
- **Target Priority**: Focus on weakest or closest player
- **Movement Pattern**: Direct charge toward targets
- **Engagement Style**: High aggression, low self-preservation

```typescript
class AggressiveAI implements AIController {
  update(enemy: Enemy, players: Player[]): void {
    const target = this.findWeakestPlayer(players);
    this.moveToward(enemy, target.position);
    
    if (this.isInRange(enemy, target)) {
      this.attack(enemy, target);
    }
  }
}
```

#### Defensive AI
- **Target Priority**: Protect other enemies or key positions
- **Movement Pattern**: Defensive positioning
- **Engagement Style**: Reactive combat, focus on survival

#### Neutral AI
- **Target Priority**: Opportunistic targeting
- **Movement Pattern**: Balanced positioning
- **Engagement Style**: Moderate aggression and self-preservation

### Pathfinding

Enemies use simple pathfinding to navigate toward targets:

```typescript
interface PathfindingNode {
  x: number;
  y: number;
  cost: number;
  parent?: PathfindingNode;
}

class SimplePathfinder {
  findPath(start: Position, target: Position, obstacles: Position[]): Position[] {
    // A* pathfinding implementation
    // Considers obstacles and terrain
    // Returns optimal path as array of positions
  }
}
```

## Equipment System

Equipment modifies character statistics and provides gameplay customization:

```typescript
interface Equipment {
  weapon: string;     // Primary weapon (affects attack and range)
  armor: string;      // Protective gear (affects defense and HP)
  accessory: string;  // Special items (various stat bonuses)
  boots: string;      // Footwear (affects speed and movement)
}
```

### Equipment Effects

#### Weapons
```typescript
interface WeaponStats {
  attackBonus: number;
  rangeModifier: number;
  speedPenalty?: number;
  specialEffects?: string[];
}

const weaponEffects = {
  'Sword': { attackBonus: 5, rangeModifier: 0 },
  'Bow': { attackBonus: 3, rangeModifier: 3 },
  'Staff': { attackBonus: 2, rangeModifier: 2, manaBonus: 20 }
};
```

#### Armor
```typescript
interface ArmorStats {
  defenseBonus: number;
  hpBonus: number;
  speedPenalty: number;
  resistances?: string[];
}

const armorEffects = {
  'Light Armor': { defenseBonus: 2, hpBonus: 10, speedPenalty: 0 },
  'Heavy Armor': { defenseBonus: 8, hpBonus: 30, speedPenalty: 2 },
  'Robes': { defenseBonus: 1, hpBonus: 5, manaBonus: 15 }
};
```

## Level Progression

The game features progressive difficulty through multiple levels:

### Level Structure

```typescript
interface GameLevel {
  id: string;
  name: string;
  enemies: EnemyWave[];
  objectives: Objective[];
  rewards: Reward[];
  unlockRequirements: string[];
}

interface EnemyWave {
  enemies: Enemy[];
  spawnDelay: number;
  spawnPattern: 'simultaneous' | 'sequential' | 'random';
}
```

### Current Level Configuration

```typescript
const levels = ['Level 1', 'Level 2', 'Boss Level'];

// Level 1: Tutorial and basic mechanics
const level1Config = {
  enemies: [
    { type: 'Goblin', count: 3, ai: 'Aggressive' },
    { type: 'Orc', count: 1, ai: 'Defensive' }
  ],
  objectives: ['Defeat all enemies', 'Survive for 60 seconds']
};
```

### Difficulty Scaling

- **Enemy Health**: Increases with level progression
- **Enemy Damage**: Scales to maintain challenge
- **AI Complexity**: More sophisticated behavior in later levels
- **Wave Composition**: Mixed enemy types requiring diverse strategies

## Map System

The `MapSystem` component manages battlefield layout and positioning:

```typescript
interface MapConfig {
  width: number;
  height: number;
  terrain: TerrainType[][];
  spawnPoints: {
    players: Position[];
    enemies: Position[];
  };
  obstacles: Position[];
}

enum TerrainType {
  Normal = 'normal',
  Difficult = 'difficult',  // Slower movement
  Impassable = 'impassable', // Blocks movement
  Hazard = 'hazard'          // Damages occupants
}
```

### Positioning Mechanics

- **Formation**: Players can arrange team positioning
- **Line of Sight**: Range attacks may be blocked by obstacles
- **Engagement Zones**: Optimal positioning for different classes
- **Retreat Paths**: Safe areas for low-health characters

## Game State Management

The game maintains state through React hooks and components:

```typescript
interface GameState {
  currentLevel: string;
  gameOver: boolean;
  players: Player[];
  enemies: Enemy[];
  combatSystem: CombatSystem;
  elapsedTime: number;
}

const GameBoard: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  
  useEffect(() => {
    const gameLoop = setInterval(() => {
      updateGameState(gameState);
    }, 1000 / 60); // 60 FPS
    
    return () => clearInterval(gameLoop);
  }, [gameState]);
};
```

### State Updates

- **Combat Resolution**: Apply damage and effects each frame
- **Skill Cooldowns**: Track and update ability availability
- **Position Updates**: Move characters based on AI and player input
- **Win/Loss Conditions**: Monitor level objectives and failure states

## Performance Optimization

### Efficient Updates

```typescript
// Only update when necessary
const memoizedPlayerCard = React.memo(PlayerCard, (prevProps, nextProps) => {
  return prevProps.player.stats.hp === nextProps.player.stats.hp &&
         prevProps.player.equipment === nextProps.player.equipment;
});
```

### Batch Operations

```typescript
// Process multiple updates together
function batchUpdate(players: Player[], enemies: Enemy[]): void {
  const updates = [];
  
  players.forEach(player => {
    const update = processPlayerFrame(player, enemies);
    if (update) updates.push(update);
  });
  
  applyBatchedUpdates(updates);
}
```

---

This mechanics documentation provides the foundation for understanding how Stick Ranger's gameplay systems work together to create an engaging tactical combat experience.
# Character System Documentation

## Overview

The character system in Stick Ranger provides five distinct classes, each with unique abilities, playstyles, and strategic roles. The system is built around the `Player` interface and integrated with the combat, equipment, and skill systems.

## Character Classes

### Base Player Structure

```typescript
interface Player {
  id: number;
  class: PlayerClass;
  stats: PlayerStats;
  position: Position;
  equipment: Equipment;
  skills: Skill[];
}

type PlayerClass = 'Warrior' | 'Archer' | 'Mage' | 'Priest' | 'Boxer';
```

## Warrior Class

The Warrior serves as the primary tank and frontline fighter, excelling in close combat and damage absorption.

### Core Characteristics

```typescript
const warriorBase: PlayerStats = {
  hp: 120,
  maxHp: 120,
  atk: 12,
  def: 8,
  spd: 2,
  range: 1,
  mana: 30
};
```

### Strengths
- **High Durability**: Highest HP and defense ratings
- **Melee Superiority**: Strong close-range damage output
- **Tanking Ability**: Can absorb damage for fragile allies
- **Equipment Synergy**: Benefits most from heavy armor and weapons

### Weaknesses
- **Limited Range**: Must close distance to engage enemies
- **Low Speed**: Vulnerable to kiting and positioning disadvantages
- **Mana Limitations**: Fewer skill uses due to low mana pool

### Optimal Equipment

```typescript
const warriorLoadout: Equipment = {
  weapon: 'Sword',      // High damage, good reach
  armor: 'Heavy Armor', // Maximum defense bonus
  accessory: 'Ring',    // General stat enhancement
  boots: 'Steel Boots'  // Defense over speed
};
```

### Tactical Role
- **Frontline Engagement**: First to engage enemies
- **Damage Absorption**: Draw enemy attacks away from allies
- **Choke Point Control**: Block narrow passages
- **Emergency Response**: Rescue overwhelmed allies

### Skill Recommendations

```typescript
const warriorSkills: Skill[] = [
  {
    id: 'taunt',
    name: 'Taunt',
    cooldown: 8000,
    manaCost: 15,
    effect: 'Force enemies to attack this character'
  },
  {
    id: 'charge',
    name: 'Charge',
    cooldown: 12000,
    manaCost: 20,
    effect: 'Rapid movement to close distance with enemies'
  }
];
```

## Archer Class

The Archer provides consistent ranged damage and excels at controlling engagement distances.

### Core Characteristics

```typescript
const archerBase: PlayerStats = {
  hp: 80,
  maxHp: 80,
  atk: 8,
  def: 3,
  spd: 4,
  range: 4,
  mana: 40
};
```

### Strengths
- **Superior Range**: Longest attack distance
- **High Mobility**: Fast movement speed for positioning
- **Consistent Damage**: Reliable damage output over time
- **Kiting Ability**: Can attack while maintaining distance

### Weaknesses
- **Low Durability**: Vulnerable when caught in melee
- **Positioning Dependent**: Effectiveness relies on good positioning
- **Limited AoE**: Primarily single-target focused

### Optimal Equipment

```typescript
const archerLoadout: Equipment = {
  weapon: 'Bow',          // Range and accuracy bonus
  armor: 'Light Armor',   // Mobility with some protection
  accessory: 'Quiver',    // Attack speed enhancement
  boots: 'Swift Boots'    // Maximum movement speed
};
```

### Tactical Role
- **Ranged DPS**: Primary damage dealer from safe distance
- **Target Prioritization**: Focus on high-value or vulnerable enemies
- **Positioning**: Maintain optimal range and escape routes
- **Support Fire**: Assist frontline fighters with covering fire

### Skill Recommendations

```typescript
const archerSkills: Skill[] = [
  {
    id: 'multishot',
    name: 'Multi Shot',
    cooldown: 6000,
    manaCost: 25,
    effect: 'Fire multiple arrows at different targets'
  },
  {
    id: 'retreat',
    name: 'Tactical Retreat',
    cooldown: 10000,
    manaCost: 15,
    effect: 'Rapid movement away from enemies'
  }
];
```

## Mage Class

The Mage specializes in magical damage and area-of-effect abilities, offering high burst potential.

### Core Characteristics

```typescript
const mageBase: PlayerStats = {
  hp: 60,
  maxHp: 60,
  atk: 6,
  def: 2,
  spd: 3,
  range: 3,
  mana: 80
};
```

### Strengths
- **High Burst Damage**: Powerful magical attacks
- **Area of Effect**: Can damage multiple enemies simultaneously
- **Large Mana Pool**: More frequent skill usage
- **Elemental Variety**: Different damage types and effects

### Weaknesses
- **Extremely Fragile**: Lowest HP and defense
- **Mana Dependent**: Ineffective when out of mana
- **Skill Reliant**: Weak basic attacks
- **Positioning Critical**: Must maintain safe distance

### Optimal Equipment

```typescript
const mageLoadout: Equipment = {
  weapon: 'Staff',        // Mana and spell power bonus
  armor: 'Robes',         // Mana enhancement with minimal defense
  accessory: 'Orb',       // Magical power amplification
  boots: 'Mage Boots'     // Mana regeneration bonus
};
```

### Tactical Role
- **AoE Damage**: Clear groups of enemies efficiently
- **Burst DPS**: High damage in short windows
- **Crowd Control**: Stun, slow, or disable enemies
- **Elemental Advantage**: Exploit enemy weaknesses

### Skill Recommendations

```typescript
const mageSkills: Skill[] = [
  {
    id: 'fireball',
    name: 'Fireball',
    cooldown: 4000,
    manaCost: 30,
    effect: 'Large area magical damage'
  },
  {
    id: 'shield',
    name: 'Mana Shield',
    cooldown: 15000,
    manaCost: 40,
    effect: 'Absorb damage using mana instead of HP'
  }
];
```

## Priest Class

The Priest provides essential support through healing and defensive abilities.

### Core Characteristics

```typescript
const priestBase: PlayerStats = {
  hp: 90,
  maxHp: 90,
  atk: 4,
  def: 4,
  spd: 3,
  range: 2,
  mana: 70
};
```

### Strengths
- **Healing Abilities**: Keep team members alive
- **Support Skills**: Buffs and protective abilities
- **Moderate Durability**: Better survival than pure DPS classes
- **Team Multiplier**: Makes entire team more effective

### Weaknesses
- **Low Damage Output**: Weakest offensive capabilities
- **Support Dependent**: Team effectiveness relies on priest survival
- **Mana Management**: Healing costs can drain mana quickly
- **Target Priority**: Often focused by intelligent enemies

### Optimal Equipment

```typescript
const priestLoadout: Equipment = {
  weapon: 'Holy Symbol',  // Healing power enhancement
  armor: 'Blessed Robes', // Balance of defense and mana
  accessory: 'Pendant',   // Mana regeneration
  boots: 'Sacred Boots'   // Mobility for positioning
};
```

### Tactical Role
- **Team Sustainability**: Keep allies healthy and effective
- **Emergency Response**: Prioritize critical healing
- **Buff Management**: Enhance team capabilities
- **Safe Positioning**: Stay protected while supporting

### Skill Recommendations

```typescript
const priestSkills: Skill[] = [
  {
    id: 'heal',
    name: 'Heal',
    cooldown: 3000,
    manaCost: 25,
    effect: 'Restore HP to target ally'
  },
  {
    id: 'blessing',
    name: 'Divine Blessing',
    cooldown: 20000,
    manaCost: 50,
    effect: 'Temporary stat boost for all allies'
  }
];
```

## Boxer Class

The Boxer combines speed and aggression for hit-and-run tactics and sustained melee combat.

### Core Characteristics

```typescript
const boxerBase: PlayerStats = {
  hp: 100,
  maxHp: 100,
  atk: 10,
  def: 5,
  spd: 5,
  range: 1,
  mana: 50
};
```

### Strengths
- **High Speed**: Fastest movement and attack speed
- **Balanced Stats**: Good mix of offense and defense
- **Mobility Combat**: Excels at hit-and-run tactics
- **Combo Potential**: Chain attacks and skills effectively

### Weaknesses
- **Melee Range**: Must engage at close distance
- **Resource Management**: Balanced stats mean no exceptional strengths
- **Positioning Skill**: Requires good tactical awareness
- **Equipment Dependent**: Needs good gear to excel

### Optimal Equipment

```typescript
const boxerLoadout: Equipment = {
  weapon: 'Gloves',       // Attack speed and combo bonuses
  armor: 'Flexible Gear', // Balance of protection and mobility
  accessory: 'Band',      // Stat enhancement
  boots: 'Combat Boots'   // Speed and durability
};
```

### Tactical Role
- **Mobile Striker**: Quick engagements and disengagements
- **Flanking**: Attack from unexpected angles
- **Pursuit**: Chase down fleeing enemies
- **Cleanup**: Finish weakened opponents

### Skill Recommendations

```typescript
const boxerSkills: Skill[] = [
  {
    id: 'combo',
    name: 'Combo Strike',
    cooldown: 5000,
    manaCost: 20,
    effect: 'Multiple rapid attacks in sequence'
  },
  {
    id: 'dodge',
    name: 'Evasion',
    cooldown: 8000,
    manaCost: 15,
    effect: 'Temporary invulnerability while moving'
  }
];
```

## Team Composition Strategies

### Balanced Composition
```typescript
const balancedTeam = {
  tank: 'Warrior',      // Frontline protection
  dps: 'Archer',        // Consistent damage
  support: 'Priest',    // Healing and buffs
  flex: 'Mage'          // Burst damage and AoE
};
```

### Aggressive Composition
```typescript
const aggressiveTeam = {
  melee1: 'Warrior',    // Frontline engagement
  melee2: 'Boxer',      // Mobile striker
  ranged: 'Archer',     // Covering fire
  burst: 'Mage'         // High damage output
};
```

### Defensive Composition
```typescript
const defensiveTeam = {
  tank: 'Warrior',      // Primary defender
  healer: 'Priest',     // Sustainability
  support: 'Priest',    // Redundant healing
  dps: 'Archer'         // Safe damage dealing
};
```

## Character Progression

### Experience and Leveling

```typescript
interface CharacterProgression {
  level: number;
  experience: number;
  experienceToNext: number;
  statBoosts: StatBoosts;
  skillPoints: number;
}

interface StatBoosts {
  hp: number;
  atk: number;
  def: number;
  spd: number;
  mana: number;
}
```

### Skill Acquisition

```typescript
interface SkillTree {
  classType: PlayerClass;
  skills: SkillNode[];
}

interface SkillNode {
  skill: Skill;
  prerequisites: string[];
  level: number;
  cost: number;
}
```

## Advanced Character Mechanics

### Stat Synergies

Different character classes benefit from different stat combinations:

```typescript
const statSynergies = {
  Warrior: {
    primary: ['hp', 'def', 'atk'],
    secondary: ['mana'],
    scaling: { hp: 1.5, def: 1.3, atk: 1.2 }
  },
  Archer: {
    primary: ['spd', 'range', 'atk'],
    secondary: ['def'],
    scaling: { spd: 1.4, range: 1.2, atk: 1.3 }
  },
  Mage: {
    primary: ['mana', 'atk'],
    secondary: ['spd'],
    scaling: { mana: 1.5, atk: 1.4 }
  },
  Priest: {
    primary: ['mana', 'hp'],
    secondary: ['def'],
    scaling: { mana: 1.4, hp: 1.2 }
  },
  Boxer: {
    primary: ['spd', 'atk'],
    secondary: ['hp', 'def'],
    scaling: { spd: 1.5, atk: 1.2 }
  }
};
```

### Class-Specific Mechanics

#### Warrior: Damage Mitigation
```typescript
function calculateWarriorDamage(incomingDamage: number, warrior: Player): number {
  const mitigationRate = warrior.stats.def / (warrior.stats.def + 50);
  return Math.floor(incomingDamage * (1 - mitigationRate));
}
```

#### Archer: Critical Hits
```typescript
function calculateArcherCritical(archer: Player): number {
  const baseCritRate = 0.05; // 5% base
  const speedBonus = archer.stats.spd * 0.01; // 1% per speed point
  return Math.min(0.5, baseCritRate + speedBonus); // Cap at 50%
}
```

#### Mage: Spell Power
```typescript
function calculateMageSpellPower(mage: Player): number {
  const basePower = mage.stats.atk;
  const manaMultiplier = mage.stats.mana / 100;
  return Math.floor(basePower * (1 + manaMultiplier));
}
```

#### Priest: Healing Efficiency
```typescript
function calculatePriestHealing(priest: Player, healAmount: number): number {
  const efficiency = 1 + (priest.stats.mana / 200);
  return Math.floor(healAmount * efficiency);
}
```

#### Boxer: Attack Speed
```typescript
function calculateBoxerAttackSpeed(boxer: Player): number {
  const baseSpeed = 1000; // 1 attack per second
  const speedMultiplier = boxer.stats.spd / 10;
  return Math.max(200, baseSpeed / (1 + speedMultiplier)); // Minimum 200ms between attacks
}
```

## Implementation Guidelines

### Character Creation

```typescript
function createCharacter(classType: PlayerClass, id: number): Player {
  const baseStats = getBaseStats(classType);
  const startingEquipment = getStartingEquipment(classType);
  const classSkills = getClassSkills(classType);
  
  return {
    id,
    class: classType,
    stats: baseStats,
    position: { x: 0, y: 0 },
    equipment: startingEquipment,
    skills: classSkills
  };
}
```

### Character Updates

```typescript
function updateCharacterStats(player: Player): Player {
  const equipmentBonuses = calculateEquipmentBonuses(player.equipment);
  const levelBonuses = calculateLevelBonuses(player.level);
  
  return {
    ...player,
    stats: applyStatModifiers(player.stats, equipmentBonuses, levelBonuses)
  };
}
```

---

This character system documentation provides comprehensive information for understanding, implementing, and balancing the five character classes in Stick Ranger. Each class offers unique gameplay opportunities while maintaining overall game balance.
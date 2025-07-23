# Weapon System Documentation

## Overview

The weapon system in Stick Ranger provides diverse equipment options that significantly impact gameplay through stat modifications, special abilities, and strategic considerations. Each weapon type is designed to complement specific character classes while offering meaningful choices for customization.

## Equipment Structure

### Base Equipment Interface

```typescript
interface Equipment {
  weapon: string;     // Primary weapon affecting damage and range
  armor: string;      // Defensive equipment affecting HP and defense
  accessory: string;  // Special items providing various bonuses
  boots: string;      // Footwear affecting speed and mobility
}
```

### Equipment Effect System

```typescript
interface EquipmentEffect {
  statModifiers: StatModifiers;
  specialAbilities?: SpecialAbility[];
  restrictions?: ClassRestriction[];
}

interface StatModifiers {
  hp?: number;
  maxHp?: number;
  atk?: number;
  def?: number;
  spd?: number;
  range?: number;
  mana?: number;
  critRate?: number;
  critDamage?: number;
}
```

## Weapon Categories

### Melee Weapons

#### Sword
The standard warrior weapon, balanced for offense and versatility.

```typescript
const swordStats: EquipmentEffect = {
  statModifiers: {
    atk: 8,
    range: 1,
    critRate: 0.05
  },
  specialAbilities: [
    {
      name: 'Parry',
      chance: 0.15,
      effect: 'Block incoming attack and counter'
    }
  ],
  restrictions: [
    { class: 'Warrior', bonus: { atk: 2 } },
    { class: 'Boxer', penalty: { spd: -1 } }
  ]
};
```

**Characteristics:**
- High base damage output
- Moderate attack range
- Parry ability for defensive utility
- Optimal for Warriors, usable by other melee classes

#### Gloves
Specialized boxing equipment emphasizing speed and combo attacks.

```typescript
const glovesStats: EquipmentEffect = {
  statModifiers: {
    atk: 5,
    spd: 3,
    range: 1,
    critRate: 0.1
  },
  specialAbilities: [
    {
      name: 'Combo Chain',
      trigger: 'consecutive_hits',
      effect: 'Each hit increases next attack damage by 20%'
    }
  ],
  restrictions: [
    { class: 'Boxer', bonus: { spd: 2, atk: 1 } }
  ]
};
```

**Characteristics:**
- Lower base damage but higher attack speed
- Combo system for sustained damage
- Enhanced critical hit rate
- Designed specifically for Boxer class

#### Dagger
Fast, lightweight weapon for hit-and-run tactics.

```typescript
const daggerStats: EquipmentEffect = {
  statModifiers: {
    atk: 4,
    spd: 4,
    range: 1,
    critRate: 0.15
  },
  specialAbilities: [
    {
      name: 'Backstab',
      condition: 'attack_from_behind',
      effect: 'Double damage when attacking from behind'
    }
  ]
};
```

### Ranged Weapons

#### Bow
Primary archer weapon providing superior range and precision.

```typescript
const bowStats: EquipmentEffect = {
  statModifiers: {
    atk: 6,
    range: 4,
    spd: 1,
    critRate: 0.08
  },
  specialAbilities: [
    {
      name: 'Piercing Shot',
      chance: 0.2,
      effect: 'Arrow passes through first target to hit enemies behind'
    }
  ],
  restrictions: [
    { class: 'Archer', bonus: { range: 1, critRate: 0.05 } }
  ]
};
```

**Characteristics:**
- Excellent range for safe engagement
- Moderate damage with precision bonuses
- Piercing shots for crowd control
- Class synergy with Archer abilities

#### Crossbow
Heavy ranged weapon trading speed for power.

```typescript
const crossbowStats: EquipmentEffect = {
  statModifiers: {
    atk: 10,
    range: 3,
    spd: -2,
    critDamage: 0.5
  },
  specialAbilities: [
    {
      name: 'Armor Pierce',
      effect: 'Ignores 50% of target defense'
    }
  ]
};
```

### Magical Weapons

#### Staff
Mage weapon enhancing magical abilities and mana efficiency.

```typescript
const staffStats: EquipmentEffect = {
  statModifiers: {
    atk: 3,
    range: 2,
    mana: 30,
    spellPower: 1.5
  },
  specialAbilities: [
    {
      name: 'Mana Efficiency',
      effect: 'All spells cost 20% less mana'
    },
    {
      name: 'Spell Focus',
      effect: 'Increased spell critical hit chance'
    }
  ],
  restrictions: [
    { class: 'Mage', bonus: { mana: 20, spellPower: 0.3 } }
  ]
};
```

#### Wand
Lightweight magical weapon for utility and speed.

```typescript
const wandStats: EquipmentEffect = {
  statModifiers: {
    atk: 2,
    range: 2,
    spd: 2,
    mana: 20,
    spellPower: 1.2
  },
  specialAbilities: [
    {
      name: 'Quick Cast',
      effect: 'Reduced spell cooldowns by 25%'
    }
  ]
};
```

#### Holy Symbol
Priest weapon focusing on healing and support abilities.

```typescript
const holySymbolStats: EquipmentEffect = {
  statModifiers: {
    atk: 1,
    range: 2,
    mana: 25,
    healPower: 1.4
  },
  specialAbilities: [
    {
      name: 'Divine Protection',
      effect: 'Healing spells provide temporary damage resistance'
    },
    {
      name: 'Blessed Recovery',
      effect: 'Chance to not consume mana when casting healing spells'
    }
  ],
  restrictions: [
    { class: 'Priest', bonus: { healPower: 0.3, mana: 15 } }
  ]
};
```

## Armor System

### Armor Categories

#### Light Armor
Balanced protection with minimal speed penalty.

```typescript
const lightArmorStats: EquipmentEffect = {
  statModifiers: {
    def: 3,
    hp: 15,
    spd: 0
  },
  specialAbilities: [
    {
      name: 'Agility',
      effect: 'Dodge chance increased by 10%'
    }
  ]
};
```

#### Medium Armor
Moderate protection with some mobility trade-off.

```typescript
const mediumArmorStats: EquipmentEffect = {
  statModifiers: {
    def: 6,
    hp: 25,
    spd: -1
  },
  specialAbilities: [
    {
      name: 'Damage Absorption',
      effect: 'Reduce all incoming damage by 1 point'
    }
  ]
};
```

#### Heavy Armor
Maximum protection at the cost of mobility.

```typescript
const heavyArmorStats: EquipmentEffect = {
  statModifiers: {
    def: 12,
    hp: 40,
    spd: -3
  },
  specialAbilities: [
    {
      name: 'Fortress',
      effect: 'Immune to critical hits'
    },
    {
      name: 'Damage Reflection',
      chance: 0.1,
      effect: 'Reflect 25% of melee damage back to attacker'
    }
  ],
  restrictions: [
    { class: 'Warrior', bonus: { def: 3, hp: 10 } }
  ]
};
```

#### Robes
Magical armor providing mana bonuses and spell enhancements.

```typescript
const robesStats: EquipmentEffect = {
  statModifiers: {
    def: 1,
    hp: 5,
    mana: 35,
    spellPower: 1.2
  },
  specialAbilities: [
    {
      name: 'Arcane Attunement',
      effect: 'Regenerate mana 50% faster'
    }
  ],
  restrictions: [
    { class: 'Mage', bonus: { mana: 15, spellPower: 0.2 } },
    { class: 'Priest', bonus: { mana: 10, healPower: 0.1 } }
  ]
};
```

## Accessory System

### Accessory Types

#### Rings
General purpose accessories providing balanced stat bonuses.

```typescript
const ringTypes = {
  'Power Ring': {
    statModifiers: { atk: 3, critRate: 0.03 }
  },
  'Guardian Ring': {
    statModifiers: { def: 4, hp: 20 }
  },
  'Swift Ring': {
    statModifiers: { spd: 2, dodgeRate: 0.05 }
  },
  'Mystic Ring': {
    statModifiers: { mana: 20, spellPower: 1.1 }
  }
};
```

#### Amulets
Specialized accessories with unique abilities.

```typescript
const amuletTypes = {
  'Amulet of Regeneration': {
    specialAbilities: [
      {
        name: 'Health Regeneration',
        effect: 'Restore 1 HP every 3 seconds'
      }
    ]
  },
  'Amulet of Warding': {
    specialAbilities: [
      {
        name: 'Magic Resistance',
        effect: 'Reduce magical damage by 25%'
      }
    ]
  }
};
```

#### Class-Specific Accessories

```typescript
const classAccessories = {
  'Warrior Badge': {
    restrictions: [{ class: 'Warrior' }],
    statModifiers: { def: 5, hp: 30 },
    specialAbilities: [
      {
        name: 'Courage',
        effect: 'Immune to fear and charm effects'
      }
    ]
  },
  'Archer Quiver': {
    restrictions: [{ class: 'Archer' }],
    statModifiers: { range: 1, spd: 2 },
    specialAbilities: [
      {
        name: 'Endless Arrows',
        effect: 'Attacks have 10% chance to not trigger cooldown'
      }
    ]
  }
};
```

## Boot System

### Boot Categories

#### Speed Boots
Focus on mobility and positioning advantages.

```typescript
const speedBootsStats: EquipmentEffect = {
  statModifiers: {
    spd: 3,
    dodgeRate: 0.08
  },
  specialAbilities: [
    {
      name: 'Fleet Footed',
      effect: 'Move 25% faster when health is below 50%'
    }
  ]
};
```

#### Defensive Boots
Provide protection and stability.

```typescript
const defensiveBootsStats: EquipmentEffect = {
  statModifiers: {
    def: 2,
    hp: 15,
    knockbackResist: 0.5
  },
  specialAbilities: [
    {
      name: 'Sure Footed',
      effect: 'Immune to movement impairing effects'
    }
  ]
};
```

#### Magical Boots
Enhance magical capabilities and mana efficiency.

```typescript
const magicalBootsStats: EquipmentEffect = {
  statModifiers: {
    mana: 25,
    spellPower: 1.1,
    spd: 1
  },
  specialAbilities: [
    {
      name: 'Arcane Steps',
      effect: 'Leave magical traces that damage enemies'
    }
  ]
};
```

## Equipment Interaction System

### Stat Calculation

```typescript
function calculateFinalStats(player: Player): PlayerStats {
  let finalStats = { ...player.baseStats };
  
  // Apply equipment modifiers
  const equipmentEffects = [
    getWeaponEffect(player.equipment.weapon),
    getArmorEffect(player.equipment.armor),
    getAccessoryEffect(player.equipment.accessory),
    getBootsEffect(player.equipment.boots)
  ];
  
  equipmentEffects.forEach(effect => {
    finalStats = applyStatModifiers(finalStats, effect.statModifiers);
  });
  
  // Apply class bonuses
  finalStats = applyClassBonuses(finalStats, player.class);
  
  return finalStats;
}
```

### Set Bonuses

Some equipment combinations provide additional bonuses:

```typescript
interface EquipmentSet {
  name: string;
  items: string[];
  bonuses: {
    [itemCount: number]: EquipmentEffect;
  };
}

const warriorSet: EquipmentSet = {
  name: 'Guardian Set',
  items: ['Iron Sword', 'Plate Armor', 'Guardian Ring', 'Steel Boots'],
  bonuses: {
    2: { statModifiers: { def: 2 } },
    3: { statModifiers: { hp: 20, def: 3 } },
    4: { 
      statModifiers: { hp: 40, def: 5 },
      specialAbilities: [
        {
          name: 'Unbreakable',
          effect: 'Cannot be reduced below 1 HP for 3 seconds after taking fatal damage'
        }
      ]
    }
  }
};
```

## Weapon Upgrade System

### Enhancement Levels

```typescript
interface WeaponEnhancement {
  level: number;        // 0-10 enhancement level
  statMultiplier: number;
  successRate: number;
  materials: Material[];
}

const enhancementLevels: WeaponEnhancement[] = [
  { level: 1, statMultiplier: 1.1, successRate: 0.9, materials: ['Iron Ore'] },
  { level: 2, statMultiplier: 1.2, successRate: 0.8, materials: ['Iron Ore', 'Coal'] },
  { level: 3, statMultiplier: 1.3, successRate: 0.7, materials: ['Steel Ingot'] },
  // ... up to level 10
];
```

### Enchantment System

```typescript
interface Enchantment {
  name: string;
  effect: SpecialAbility;
  applicableTypes: WeaponType[];
  conflictsWith?: string[];
}

const enchantments: Enchantment[] = [
  {
    name: 'Flame',
    effect: {
      name: 'Fire Damage',
      effect: 'Attacks deal additional fire damage over time'
    },
    applicableTypes: ['sword', 'dagger', 'bow']
  },
  {
    name: 'Frost',
    effect: {
      name: 'Slow',
      effect: 'Attacks reduce target movement speed by 25%'
    },
    applicableTypes: ['staff', 'bow', 'crossbow'],
    conflictsWith: ['Flame']
  }
];
```

## Equipment Balance Guidelines

### Damage Per Second (DPS) Calculations

```typescript
function calculateWeaponDPS(weapon: WeaponStats): number {
  const attacksPerSecond = 1 / (weapon.attackSpeed / 1000);
  const averageDamage = weapon.damage * (1 + weapon.critRate * weapon.critMultiplier);
  return attacksPerSecond * averageDamage;
}
```

### Effective Health Points (EHP) Calculations

```typescript
function calculateEffectiveHP(armor: ArmorStats): number {
  const damageReduction = armor.defense / (armor.defense + 100);
  return armor.hp / (1 - damageReduction);
}
```

### Power Level System

```typescript
interface PowerLevel {
  combat: number;     // Offensive capability
  defense: number;    // Defensive capability
  utility: number;    // Special abilities value
  total: number;      // Overall power rating
}

function calculatePowerLevel(equipment: Equipment): PowerLevel {
  // Calculate overall equipment power for balance purposes
  const combatPower = calculateCombatValue(equipment);
  const defensePower = calculateDefenseValue(equipment);
  const utilityPower = calculateUtilityValue(equipment);
  
  return {
    combat: combatPower,
    defense: defensePower,
    utility: utilityPower,
    total: combatPower + defensePower + utilityPower
  };
}
```

## Implementation Guidelines

### Equipment Loading

```typescript
async function loadEquipmentData(): Promise<EquipmentDatabase> {
  // Load equipment data from JSON files or database
  const weapons = await loadWeaponData();
  const armor = await loadArmorData();
  const accessories = await loadAccessoryData();
  const boots = await loadBootsData();
  
  return {
    weapons,
    armor,
    accessories,
    boots
  };
}
```

### Equipment Validation

```typescript
function validateEquipment(player: Player, equipment: Equipment): ValidationResult {
  const errors: string[] = [];
  
  // Check class restrictions
  if (!canEquipWeapon(player.class, equipment.weapon)) {
    errors.push(`${player.class} cannot equip ${equipment.weapon}`);
  }
  
  // Check level requirements
  if (!meetsLevelRequirement(player.level, equipment)) {
    errors.push('Player level too low for this equipment');
  }
  
  // Check stat requirements
  if (!meetsStatRequirements(player.stats, equipment)) {
    errors.push('Player stats insufficient for this equipment');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Dynamic Equipment Effects

```typescript
class EquipmentManager {
  private activeEffects: Map<string, SpecialAbility[]> = new Map();
  
  equipItem(player: Player, slot: EquipmentSlot, item: string): void {
    // Remove old equipment effects
    this.removeEquipmentEffects(player, slot);
    
    // Apply new equipment
    player.equipment[slot] = item;
    
    // Add new equipment effects
    this.applyEquipmentEffects(player, slot, item);
    
    // Check for set bonuses
    this.updateSetBonuses(player);
    
    // Recalculate final stats
    player.finalStats = this.calculateFinalStats(player);
  }
}
```

---

This weapon system documentation provides a comprehensive framework for implementing, balancing, and extending the equipment mechanics in Stick Ranger. The system emphasizes meaningful choices, class synergy, and strategic depth while maintaining gameplay balance.
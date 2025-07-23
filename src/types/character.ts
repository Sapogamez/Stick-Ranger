// Character type definitions for Stick Ranger

/**
 * Enum for different character classes
 */
export enum CharacterClass {
  WARRIOR = 'Warrior',
  ARCHER = 'Archer',
  MAGE = 'Mage',
  PRIEST = 'Priest',
  BOXER = 'Boxer'
}

/**
 * Base character statistics interface
 */
export interface CharacterStats {
  health: number;
  maxHealth: number;
  attackPower: number;
  defense: number;
  speed: number;
  mana?: number;
  maxMana?: number;
  criticalChance?: number;
  criticalMultiplier?: number;
}

/**
 * Special abilities interface for each character class
 */
export interface SpecialAbility {
  id: string;
  name: string;
  description: string;
  cooldown: number;
  manaCost?: number;
  damage?: number;
  healAmount?: number;
  effect?: string;
}

/**
 * Character level and experience interface
 */
export interface CharacterProgression {
  level: number;
  experience: number;
  experienceToNext: number;
  statPoints: number;
  skillPoints: number;
}

/**
 * Base character interface
 */
export interface ICharacter {
  id: string;
  name: string;
  class: CharacterClass;
  stats: CharacterStats;
  progression: CharacterProgression;
  abilities: SpecialAbility[];
  equipment: CharacterEquipment;
  
  // Core methods
  takeDamage(amount: number): number;
  heal(amount: number): number;
  attack(target: ICharacter): number;
  useAbility(abilityId: string, target?: ICharacter): boolean;
  levelUp(): void;
  updateStats(): void;
}

/**
 * Character equipment slots
 */
export interface CharacterEquipment {
  weapon?: EquipmentItem;
  armor?: EquipmentItem;
  accessory?: EquipmentItem;
  boots?: EquipmentItem;
}

/**
 * Reference to equipment item (defined in equipment.d.ts)
 */
export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  stats: Partial<CharacterStats>;
}

/**
 * Character class-specific configuration
 */
export interface CharacterClassConfig {
  baseStats: CharacterStats;
  statGrowth: Partial<CharacterStats>;
  defaultAbilities: SpecialAbility[];
  equipmentTypes: string[];
}
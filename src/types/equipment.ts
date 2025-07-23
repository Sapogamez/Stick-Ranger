// Equipment type definitions for Stick Ranger

/**
 * Equipment slot types
 */
export enum EquipmentSlot {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  ACCESSORY = 'accessory',
  BOOTS = 'boots'
}

/**
 * Equipment rarity levels
 */
export enum EquipmentRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

/**
 * Equipment type categories
 */
export enum EquipmentType {
  // Weapons
  SWORD = 'sword',
  BOW = 'bow',
  STAFF = 'staff',
  GLOVES = 'gloves',
  HAMMER = 'hammer',
  
  // Armor
  LIGHT_ARMOR = 'light_armor',
  HEAVY_ARMOR = 'heavy_armor',
  ROBE = 'robe',
  
  // Accessories
  RING = 'ring',
  AMULET = 'amulet',
  CHARM = 'charm',
  
  // Boots
  LEATHER_BOOTS = 'leather_boots',
  METAL_BOOTS = 'metal_boots',
  MAGIC_BOOTS = 'magic_boots'
}

/**
 * Equipment stat modifiers
 */
export interface EquipmentStats {
  health?: number;
  maxHealth?: number;
  attackPower?: number;
  defense?: number;
  speed?: number;
  mana?: number;
  maxMana?: number;
  criticalChance?: number;
  criticalMultiplier?: number;
}

/**
 * Equipment special effects
 */
export interface EquipmentEffect {
  id: string;
  name: string;
  description: string;
  type: 'passive' | 'onHit' | 'onKill' | 'onEquip' | 'onUnequip';
  value: number;
  duration?: number;
  chance?: number;
}

/**
 * Main equipment item interface
 */
export interface Equipment {
  id: string;
  name: string;
  description: string;
  type: EquipmentType;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  level: number;
  requiredLevel: number;
  stats: EquipmentStats;
  effects: EquipmentEffect[];
  classRestrictions?: string[];
  value: number;
  durability?: number;
  maxDurability?: number;
}

/**
 * Equipment set bonuses
 */
export interface EquipmentSet {
  id: string;
  name: string;
  description: string;
  items: string[]; // Equipment IDs
  bonuses: {
    itemsRequired: number;
    stats: EquipmentStats;
    effects: EquipmentEffect[];
  }[];
}

/**
 * Equipment manager interface
 */
export interface IEquipmentManager {
  equipItem(characterId: string, equipment: Equipment): boolean;
  unequipItem(characterId: string, slot: EquipmentSlot): Equipment | null;
  getEquippedItems(characterId: string): Partial<Record<EquipmentSlot, Equipment>>;
  calculateTotalStats(equipment: Partial<Record<EquipmentSlot, Equipment>>): EquipmentStats;
  canEquip(characterId: string, equipment: Equipment): boolean;
  getSetBonuses(equipment: Partial<Record<EquipmentSlot, Equipment>>): EquipmentSet[];
}
import { 
  Equipment, 
  EquipmentSlot, 
  EquipmentStats, 
  EquipmentSet, 
  IEquipmentManager 
} from '../../types/equipment';
import { CharacterClass } from '../../types/character';

/**
 * Equipment management system
 * Handles equipping, unequipping, and stat calculations for character equipment
 */
export class EquipmentManager implements IEquipmentManager {
  private characterEquipment: Map<string, Partial<Record<EquipmentSlot, Equipment>>> = new Map();
  private equipmentSets: Map<string, EquipmentSet> = new Map();

  /**
   * Equips an item to a character
   * @param characterId - The character's unique identifier
   * @param equipment - The equipment item to equip
   * @returns True if successfully equipped, false otherwise
   */
  public equipItem(characterId: string, equipment: Equipment): boolean {
    if (!this.canEquip(characterId, equipment)) {
      return false;
    }

    const characterEquip = this.getCharacterEquipment(characterId);
    characterEquip[equipment.slot] = equipment;
    
    return true;
  }

  /**
   * Unequips an item from a character's slot
   * @param characterId - The character's unique identifier
   * @param slot - The equipment slot to unequip
   * @returns The unequipped item, or null if slot was empty
   */
  public unequipItem(characterId: string, slot: EquipmentSlot): Equipment | null {
    const characterEquip = this.getCharacterEquipment(characterId);
    const item = characterEquip[slot] || null;
    
    if (item) {
      delete characterEquip[slot];
    }
    
    return item;
  }

  /**
   * Gets all equipped items for a character
   * @param characterId - The character's unique identifier
   * @returns Object containing all equipped items by slot
   */
  public getEquippedItems(characterId: string): Partial<Record<EquipmentSlot, Equipment>> {
    return { ...this.getCharacterEquipment(characterId) };
  }

  /**
   * Calculates total stats from all equipped items
   * @param equipment - The character's equipped items
   * @returns Combined stats from all equipment
   */
  public calculateTotalStats(equipment: Partial<Record<EquipmentSlot, Equipment>>): EquipmentStats {
    const totalStats: EquipmentStats = {
      health: 0,
      maxHealth: 0,
      attackPower: 0,
      defense: 0,
      speed: 0,
      mana: 0,
      maxMana: 0,
      criticalChance: 0,
      criticalMultiplier: 0
    };

    // Sum stats from all equipped items
    Object.values(equipment).forEach(item => {
      if (item && item.stats) {
        this.addStats(totalStats, item.stats);
      }
    });

    // Add set bonuses
    const setBonuses = this.getSetBonuses(equipment);
    setBonuses.forEach(set => {
      set.bonuses.forEach(bonus => {
        const equippedSetItems = this.countSetItems(equipment, set.items);
        if (equippedSetItems >= bonus.itemsRequired) {
          this.addStats(totalStats, bonus.stats);
        }
      });
    });

    return totalStats;
  }

  /**
   * Checks if a character can equip an item
   * @param characterId - The character's unique identifier
   * @param equipment - The equipment item to check
   * @returns True if the item can be equipped, false otherwise
   */
  public canEquip(characterId: string, equipment: Equipment): boolean {
    // TODO: Get character data to check level and class restrictions
    // For now, assume all equipment can be equipped
    
    // Check if item has class restrictions (basic validation)
    if (equipment.classRestrictions && equipment.classRestrictions.length > 0) {
      // This would require character data to validate properly
      // For minimal implementation, we'll allow it
    }

    // Check item durability
    if (equipment.durability !== undefined && equipment.durability <= 0) {
      return false;
    }

    return true;
  }

  /**
   * Gets set bonuses that apply to the current equipment
   * @param equipment - The character's equipped items
   * @returns Array of equipment sets with active bonuses
   */
  public getSetBonuses(equipment: Partial<Record<EquipmentSlot, Equipment>>): EquipmentSet[] {
    const activeSets: EquipmentSet[] = [];

    this.equipmentSets.forEach(set => {
      const equippedSetItems = this.countSetItems(equipment, set.items);
      if (equippedSetItems >= 2) { // Minimum 2 items for a set bonus
        activeSets.push(set);
      }
    });

    return activeSets;
  }

  /**
   * Adds an equipment set to the manager
   * @param equipmentSet - The equipment set to add
   */
  public addEquipmentSet(equipmentSet: EquipmentSet): void {
    this.equipmentSets.set(equipmentSet.id, equipmentSet);
  }

  /**
   * Gets or creates character equipment record
   * @param characterId - The character's unique identifier
   * @returns The character's equipment record
   */
  private getCharacterEquipment(characterId: string): Partial<Record<EquipmentSlot, Equipment>> {
    if (!this.characterEquipment.has(characterId)) {
      this.characterEquipment.set(characterId, {});
    }
    return this.characterEquipment.get(characterId)!;
  }

  /**
   * Adds equipment stats to a total stats object
   * @param totalStats - The stats object to add to
   * @param itemStats - The stats to add
   */
  private addStats(totalStats: EquipmentStats, itemStats: EquipmentStats): void {
    totalStats.health = (totalStats.health || 0) + (itemStats.health || 0);
    totalStats.maxHealth = (totalStats.maxHealth || 0) + (itemStats.maxHealth || 0);
    totalStats.attackPower = (totalStats.attackPower || 0) + (itemStats.attackPower || 0);
    totalStats.defense = (totalStats.defense || 0) + (itemStats.defense || 0);
    totalStats.speed = (totalStats.speed || 0) + (itemStats.speed || 0);
    totalStats.mana = (totalStats.mana || 0) + (itemStats.mana || 0);
    totalStats.maxMana = (totalStats.maxMana || 0) + (itemStats.maxMana || 0);
    totalStats.criticalChance = (totalStats.criticalChance || 0) + (itemStats.criticalChance || 0);
    totalStats.criticalMultiplier = (totalStats.criticalMultiplier || 0) + (itemStats.criticalMultiplier || 0);
  }

  /**
   * Counts how many items from a set are currently equipped
   * @param equipment - The character's equipped items
   * @param setItems - Array of equipment IDs in the set
   * @returns Number of set items equipped
   */
  private countSetItems(equipment: Partial<Record<EquipmentSlot, Equipment>>, setItems: string[]): number {
    let count = 0;
    Object.values(equipment).forEach(item => {
      if (item && setItems.includes(item.id)) {
        count++;
      }
    });
    return count;
  }

  /**
   * Creates a basic equipment item
   * @param config - Configuration for the equipment item
   * @returns A new Equipment object
   */
  public static createEquipment(config: {
    id: string;
    name: string;
    description: string;
    type: any;
    slot: EquipmentSlot;
    rarity: any;
    level: number;
    requiredLevel: number;
    stats: EquipmentStats;
    effects?: any[];
    classRestrictions?: string[];
    value: number;
  }): Equipment {
    return {
      id: config.id,
      name: config.name,
      description: config.description,
      type: config.type,
      slot: config.slot,
      rarity: config.rarity,
      level: config.level,
      requiredLevel: config.requiredLevel,
      stats: config.stats,
      effects: config.effects || [],
      classRestrictions: config.classRestrictions,
      value: config.value,
      durability: 100,
      maxDurability: 100
    };
  }
}
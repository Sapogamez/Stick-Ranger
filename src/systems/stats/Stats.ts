import { CharacterStats } from '../../types/character';
import { EquipmentStats } from '../../types/equipment';

/**
 * Stats management system for characters
 * Handles stat calculations, modifications, and equipment bonuses
 */
export class StatsManager {
  /**
   * Creates a copy of base stats
   * @param baseStats - The base character stats
   * @returns A deep copy of the stats
   */
  public static cloneStats(baseStats: CharacterStats): CharacterStats {
    return {
      health: baseStats.health,
      maxHealth: baseStats.maxHealth,
      attackPower: baseStats.attackPower,
      defense: baseStats.defense,
      speed: baseStats.speed,
      mana: baseStats.mana || 0,
      maxMana: baseStats.maxMana || 0,
      criticalChance: baseStats.criticalChance || 0,
      criticalMultiplier: baseStats.criticalMultiplier || 1.5
    };
  }

  /**
   * Applies equipment stats to character base stats
   * @param baseStats - The character's base stats
   * @param equipmentStats - The equipment stat bonuses
   * @returns Modified stats with equipment bonuses applied
   */
  public static applyEquipmentStats(
    baseStats: CharacterStats,
    equipmentStats: EquipmentStats
  ): CharacterStats {
    const modifiedStats = this.cloneStats(baseStats);

    // Apply flat bonuses
    if (equipmentStats.health) {
      modifiedStats.health += equipmentStats.health;
    }
    if (equipmentStats.maxHealth) {
      modifiedStats.maxHealth += equipmentStats.maxHealth;
    }
    if (equipmentStats.attackPower) {
      modifiedStats.attackPower += equipmentStats.attackPower;
    }
    if (equipmentStats.defense) {
      modifiedStats.defense += equipmentStats.defense;
    }
    if (equipmentStats.speed) {
      modifiedStats.speed += equipmentStats.speed;
    }
    if (equipmentStats.mana) {
      modifiedStats.mana = (modifiedStats.mana || 0) + equipmentStats.mana;
    }
    if (equipmentStats.maxMana) {
      modifiedStats.maxMana = (modifiedStats.maxMana || 0) + equipmentStats.maxMana;
    }
    if (equipmentStats.criticalChance) {
      modifiedStats.criticalChance = (modifiedStats.criticalChance || 0) + equipmentStats.criticalChance;
    }
    if (equipmentStats.criticalMultiplier) {
      modifiedStats.criticalMultiplier = (modifiedStats.criticalMultiplier || 1.5) + equipmentStats.criticalMultiplier;
    }

    // Ensure health doesn't exceed maxHealth
    modifiedStats.health = Math.min(modifiedStats.health, modifiedStats.maxHealth);
    
    // Ensure mana doesn't exceed maxMana
    if (modifiedStats.mana && modifiedStats.maxMana) {
      modifiedStats.mana = Math.min(modifiedStats.mana, modifiedStats.maxMana);
    }

    return modifiedStats;
  }

  /**
   * Calculates level-based stat growth
   * @param baseStats - The character's base stats at level 1
   * @param growthStats - The stat growth per level
   * @param level - The character's current level
   * @returns Stats adjusted for the character's level
   */
  public static calculateLevelStats(
    baseStats: CharacterStats,
    growthStats: Partial<CharacterStats>,
    level: number
  ): CharacterStats {
    const levelMultiplier = level - 1; // Level 1 = base stats, no growth
    const leveledStats = this.cloneStats(baseStats);

    if (growthStats.maxHealth) {
      leveledStats.maxHealth += Math.floor(growthStats.maxHealth * levelMultiplier);
      leveledStats.health = leveledStats.maxHealth; // Full health on level calculation
    }
    if (growthStats.attackPower) {
      leveledStats.attackPower += Math.floor(growthStats.attackPower * levelMultiplier);
    }
    if (growthStats.defense) {
      leveledStats.defense += Math.floor(growthStats.defense * levelMultiplier);
    }
    if (growthStats.speed) {
      leveledStats.speed += Math.floor(growthStats.speed * levelMultiplier);
    }
    if (growthStats.maxMana) {
      leveledStats.maxMana = (leveledStats.maxMana || 0) + Math.floor(growthStats.maxMana * levelMultiplier);
      leveledStats.mana = leveledStats.maxMana; // Full mana on level calculation
    }

    return leveledStats;
  }

  /**
   * Calculates damage reduction based on defense
   * @param incomingDamage - The raw damage amount
   * @param defense - The defender's defense stat
   * @returns The reduced damage amount
   */
  public static calculateDamageReduction(incomingDamage: number, defense: number): number {
    // Simple damage reduction formula: damage * (1 - defense / (defense + 100))
    const reductionFactor = defense / (defense + 100);
    const reducedDamage = incomingDamage * (1 - reductionFactor);
    return Math.max(1, Math.floor(reducedDamage)); // Minimum 1 damage
  }

  /**
   * Calculates critical hit damage
   * @param baseDamage - The base damage amount
   * @param criticalChance - The chance to critical hit (0-1)
   * @param criticalMultiplier - The damage multiplier for critical hits
   * @returns Object containing final damage and whether it was a critical hit
   */
  public static calculateCriticalHit(
    baseDamage: number,
    criticalChance: number = 0,
    criticalMultiplier: number = 1.5
  ): { damage: number; isCritical: boolean } {
    const isCritical = Math.random() < criticalChance;
    const damage = isCritical ? Math.floor(baseDamage * criticalMultiplier) : baseDamage;
    
    return { damage, isCritical };
  }

  /**
   * Validates that stats are within reasonable bounds
   * @param stats - The stats to validate
   * @returns True if stats are valid, false otherwise
   */
  public static validateStats(stats: CharacterStats): boolean {
    return (
      stats.health >= 0 &&
      stats.maxHealth > 0 &&
      stats.health <= stats.maxHealth &&
      stats.attackPower >= 0 &&
      stats.defense >= 0 &&
      stats.speed >= 0 &&
      (stats.mana === undefined || stats.mana >= 0) &&
      (stats.maxMana === undefined || stats.maxMana >= 0) &&
      (stats.mana === undefined || stats.maxMana === undefined || stats.mana <= stats.maxMana)
    );
  }
}
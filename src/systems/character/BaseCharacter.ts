import { 
  ICharacter, 
  CharacterClass, 
  CharacterStats, 
  CharacterProgression, 
  SpecialAbility,
  CharacterEquipment,
  CharacterClassConfig
} from '../../types/character';
import { EquipmentSlot } from '../../types/equipment';
import { StatsManager } from '../stats/Stats';
import { EquipmentManager } from '../equipment/Equipment';

/**
 * Abstract base class for all character types
 * Provides common functionality and enforces interface implementation
 */
export abstract class BaseCharacter implements ICharacter {
  public readonly id: string;
  public readonly name: string;
  public readonly class: CharacterClass;
  public stats: CharacterStats;
  public progression: CharacterProgression;
  public abilities: SpecialAbility[];
  public equipment: CharacterEquipment;

  protected baseStats: CharacterStats;
  protected classConfig: CharacterClassConfig;
  protected equipmentManager: EquipmentManager;
  protected abilityCooldowns: Map<string, number> = new Map();

  /**
   * Creates a new character instance
   * @param id - Unique identifier for the character
   * @param name - Display name for the character
   * @param characterClass - The character's class
   * @param classConfig - Configuration for the character class
   * @param equipmentManager - Equipment manager instance
   */
  constructor(
    id: string,
    name: string,
    characterClass: CharacterClass,
    classConfig: CharacterClassConfig,
    equipmentManager: EquipmentManager
  ) {
    this.id = id;
    this.name = name;
    this.class = characterClass;
    this.classConfig = classConfig;
    this.equipmentManager = equipmentManager;

    // Initialize base stats from class config
    this.baseStats = StatsManager.cloneStats(classConfig.baseStats);
    this.stats = StatsManager.cloneStats(this.baseStats);

    // Initialize progression
    this.progression = {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      statPoints: 0,
      skillPoints: 0
    };

    // Initialize abilities
    this.abilities = [...classConfig.defaultAbilities];

    // Initialize equipment
    this.equipment = {};

    // Update stats to include equipment bonuses
    this.updateStats();
  }

  /**
   * Applies damage to the character
   * @param amount - The amount of damage to apply
   * @returns The actual damage taken after defense calculations
   */
  public takeDamage(amount: number): number {
    const actualDamage = StatsManager.calculateDamageReduction(amount, this.stats.defense);
    this.stats.health = Math.max(0, this.stats.health - actualDamage);
    return actualDamage;
  }

  /**
   * Heals the character
   * @param amount - The amount of healing to apply
   * @returns The actual healing applied
   */
  public heal(amount: number): number {
    const missingHealth = this.stats.maxHealth - this.stats.health;
    const actualHealing = Math.min(amount, missingHealth);
    this.stats.health += actualHealing;
    return actualHealing;
  }

  /**
   * Performs a basic attack on a target
   * @param target - The character to attack
   * @returns The damage dealt
   */
  public attack(target: ICharacter): number {
    const critResult = StatsManager.calculateCriticalHit(
      this.stats.attackPower,
      this.stats.criticalChance,
      this.stats.criticalMultiplier
    );

    const damageDealt = target.takeDamage(critResult.damage);
    return damageDealt;
  }

  /**
   * Uses a special ability
   * @param abilityId - The ID of the ability to use
   * @param target - Optional target for the ability
   * @returns True if the ability was successfully used
   */
  public useAbility(abilityId: string, target?: ICharacter): boolean {
    const ability = this.abilities.find(a => a.id === abilityId);
    if (!ability) {
      return false;
    }

    // Check cooldown
    const cooldownRemaining = this.abilityCooldowns.get(abilityId) || 0;
    if (cooldownRemaining > 0) {
      return false;
    }

    // Check mana cost
    if (ability.manaCost && (this.stats.mana || 0) < ability.manaCost) {
      return false;
    }

    // Use the ability
    const success = this.executeAbility(ability, target);
    
    if (success) {
      // Apply cooldown
      this.abilityCooldowns.set(abilityId, ability.cooldown);
      
      // Consume mana
      if (ability.manaCost) {
        this.stats.mana = (this.stats.mana || 0) - ability.manaCost;
      }
    }

    return success;
  }

  /**
   * Levels up the character
   */
  public levelUp(): void {
    this.progression.level++;
    this.progression.experience = 0;
    this.progression.experienceToNext = this.calculateExperienceRequired(this.progression.level + 1);
    this.progression.statPoints += 5; // Award stat points
    this.progression.skillPoints += 1; // Award skill points

    // Update stats based on new level
    this.updateStats();

    // Trigger level up effects
    this.onLevelUp();
  }

  /**
   * Updates character stats based on level, equipment, and other factors
   */
  public updateStats(): void {
    // Calculate level-based stats
    const leveledStats = StatsManager.calculateLevelStats(
      this.baseStats,
      this.classConfig.statGrowth,
      this.progression.level
    );

    // Get equipment stats
    const equippedItems = this.equipmentManager.getEquippedItems(this.id);
    const equipmentStats = this.equipmentManager.calculateTotalStats(equippedItems);

    // Apply equipment bonuses
    this.stats = StatsManager.applyEquipmentStats(leveledStats, equipmentStats);

    // Apply any additional character-specific modifications
    this.applyClassSpecificStats();
  }

  /**
   * Checks if the character is alive
   * @returns True if the character has health > 0
   */
  public isAlive(): boolean {
    return this.stats.health > 0;
  }

  /**
   * Gains experience points
   * @param amount - The amount of experience to gain
   */
  public gainExperience(amount: number): void {
    this.progression.experience += amount;
    
    while (this.progression.experience >= this.progression.experienceToNext) {
      this.progression.experience -= this.progression.experienceToNext;
      this.levelUp();
    }
  }

  /**
   * Updates cooldowns (should be called each game tick)
   * @param deltaTime - Time elapsed since last update in seconds
   */
  public updateCooldowns(deltaTime: number): void {
    this.abilityCooldowns.forEach((cooldown, abilityId) => {
      const newCooldown = Math.max(0, cooldown - deltaTime);
      if (newCooldown === 0) {
        this.abilityCooldowns.delete(abilityId);
      } else {
        this.abilityCooldowns.set(abilityId, newCooldown);
      }
    });
  }

  /**
   * Gets the remaining cooldown for an ability
   * @param abilityId - The ID of the ability
   * @returns Remaining cooldown time in seconds
   */
  public getAbilityCooldown(abilityId: string): number {
    return this.abilityCooldowns.get(abilityId) || 0;
  }

  // Abstract methods that must be implemented by subclasses

  /**
   * Executes a special ability (implemented by subclasses)
   * @param ability - The ability to execute
   * @param target - Optional target for the ability
   * @returns True if the ability was successfully executed
   */
  protected abstract executeAbility(ability: SpecialAbility, target?: ICharacter): boolean;

  /**
   * Called when the character levels up (implemented by subclasses)
   */
  protected abstract onLevelUp(): void;

  /**
   * Applies class-specific stat modifications (implemented by subclasses)
   */
  protected abstract applyClassSpecificStats(): void;

  // Helper methods

  /**
   * Calculates experience required for a given level
   * @param level - The target level
   * @returns Experience required to reach that level
   */
  private calculateExperienceRequired(level: number): number {
    return 100 * level * level; // Exponential experience curve
  }
}
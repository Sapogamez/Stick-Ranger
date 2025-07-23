import { BaseCharacter } from '../BaseCharacter';
import { CharacterClass, SpecialAbility, CharacterClassConfig, ICharacter } from '../../../types/character';
import { EquipmentManager } from '../../equipment/Equipment';

/**
 * Warrior character class - Melee fighter with high health and defense
 * Specializes in tanking damage and melee combat
 */
export class Warrior extends BaseCharacter {
  /**
   * Creates a new Warrior character
   * @param id - Unique identifier for the character
   * @param name - Display name for the character
   * @param equipmentManager - Equipment manager instance
   */
  constructor(id: string, name: string, equipmentManager: EquipmentManager) {
    const classConfig: CharacterClassConfig = Warrior.getClassConfig();
    super(id, name, CharacterClass.WARRIOR, classConfig, equipmentManager);
  }

  /**
   * Gets the class configuration for Warriors
   * @returns Configuration object for the Warrior class
   */
  public static getClassConfig(): CharacterClassConfig {
    return {
      baseStats: {
        health: 120,
        maxHealth: 120,
        attackPower: 25,
        defense: 15,
        speed: 8,
        mana: 20,
        maxMana: 20,
        criticalChance: 0.05,
        criticalMultiplier: 1.5
      },
      statGrowth: {
        maxHealth: 15,
        attackPower: 3,
        defense: 2,
        speed: 1,
        maxMana: 2
      },
      defaultAbilities: [
        {
          id: 'warrior_charge',
          name: 'Charge',
          description: 'Rushes forward and deals increased damage',
          cooldown: 8,
          manaCost: 10,
          damage: 35,
          effect: 'movement'
        },
        {
          id: 'warrior_shield_bash',
          name: 'Shield Bash',
          description: 'Stuns the target and deals moderate damage',
          cooldown: 12,
          manaCost: 15,
          damage: 20,
          effect: 'stun'
        },
        {
          id: 'warrior_berserker_rage',
          name: 'Berserker Rage',
          description: 'Increases attack power but reduces defense temporarily',
          cooldown: 20,
          manaCost: 25,
          effect: 'buff'
        }
      ],
      equipmentTypes: ['sword', 'hammer', 'heavy_armor', 'metal_boots']
    };
  }

  /**
   * Executes a Warrior-specific special ability
   * @param ability - The ability to execute
   * @param target - Optional target for the ability
   * @returns True if the ability was successfully executed
   */
  protected executeAbility(ability: SpecialAbility, target?: ICharacter): boolean {
    switch (ability.id) {
      case 'warrior_charge':
        return this.executeCharge(target);
      case 'warrior_shield_bash':
        return this.executeShieldBash(target);
      case 'warrior_berserker_rage':
        return this.executeBerserkerRage();
      default:
        return false;
    }
  }

  /**
   * Called when the Warrior levels up
   */
  protected onLevelUp(): void {
    // Warriors gain bonus health every 5 levels
    if (this.progression.level % 5 === 0) {
      this.stats.maxHealth += 10;
      this.stats.health += 10;
    }
  }

  /**
   * Applies Warrior-specific stat modifications
   */
  protected applyClassSpecificStats(): void {
    // Warriors have natural damage resistance
    this.stats.defense += Math.floor(this.progression.level / 3);
  }

  /**
   * Executes the Charge ability
   * @param target - The target to charge at
   * @returns True if successful
   */
  private executeCharge(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Deal enhanced damage
    const enhancedDamage = this.stats.attackPower + 35; // Charge bonus damage
    const damageDealt = target.takeDamage(enhancedDamage);
    
    return damageDealt > 0;
  }

  /**
   * Executes the Shield Bash ability
   * @param target - The target to bash
   * @returns True if successful
   */
  private executeShieldBash(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Deal damage and apply stun effect (simplified)
    const damage = 20; // Shield bash damage
    const damageDealt = target.takeDamage(damage);
    
    // TODO: Implement actual stun status effect
    return damageDealt > 0;
  }

  /**
   * Executes the Berserker Rage ability
   * @returns True if successful
   */
  private executeBerserkerRage(): boolean {
    // Temporarily boost attack power and reduce defense
    // TODO: Implement proper temporary stat modifications
    // For now, just apply immediate effects
    
    return true;
  }
}
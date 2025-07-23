import { BaseCharacter } from '../BaseCharacter';
import { CharacterClass, SpecialAbility, CharacterClassConfig, ICharacter } from '../../../types/character';
import { EquipmentManager } from '../../equipment/Equipment';

/**
 * Archer character class - Ranged attacker with precision and mobility
 * Specializes in ranged combat and critical hits
 */
export class Archer extends BaseCharacter {
  /**
   * Creates a new Archer character
   * @param id - Unique identifier for the character
   * @param name - Display name for the character
   * @param equipmentManager - Equipment manager instance
   */
  constructor(id: string, name: string, equipmentManager: EquipmentManager) {
    const classConfig: CharacterClassConfig = Archer.getClassConfig();
    super(id, name, CharacterClass.ARCHER, classConfig, equipmentManager);
  }

  /**
   * Gets the class configuration for Archers
   * @returns Configuration object for the Archer class
   */
  public static getClassConfig(): CharacterClassConfig {
    return {
      baseStats: {
        health: 80,
        maxHealth: 80,
        attackPower: 30,
        defense: 8,
        speed: 15,
        mana: 40,
        maxMana: 40,
        criticalChance: 0.15,
        criticalMultiplier: 2.0
      },
      statGrowth: {
        maxHealth: 8,
        attackPower: 4,
        defense: 1,
        speed: 2,
        maxMana: 3
      },
      defaultAbilities: [
        {
          id: 'archer_piercing_shot',
          name: 'Piercing Shot',
          description: 'Fires an arrow that pierces through enemies',
          cooldown: 6,
          manaCost: 15,
          damage: 40,
          effect: 'piercing'
        },
        {
          id: 'archer_multi_shot',
          name: 'Multi Shot',
          description: 'Fires multiple arrows at nearby enemies',
          cooldown: 10,
          manaCost: 25,
          damage: 25,
          effect: 'area'
        },
        {
          id: 'archer_eagle_eye',
          name: 'Eagle Eye',
          description: 'Increases critical hit chance temporarily',
          cooldown: 15,
          manaCost: 20,
          effect: 'buff'
        }
      ],
      equipmentTypes: ['bow', 'light_armor', 'leather_boots']
    };
  }

  /**
   * Executes an Archer-specific special ability
   * @param ability - The ability to execute
   * @param target - Optional target for the ability
   * @returns True if the ability was successfully executed
   */
  protected executeAbility(ability: SpecialAbility, target?: ICharacter): boolean {
    switch (ability.id) {
      case 'archer_piercing_shot':
        return this.executePiercingShot(target);
      case 'archer_multi_shot':
        return this.executeMultiShot(target);
      case 'archer_eagle_eye':
        return this.executeEagleEye();
      default:
        return false;
    }
  }

  /**
   * Called when the Archer levels up
   */
  protected onLevelUp(): void {
    // Archers gain bonus critical chance every 4 levels
    if (this.progression.level % 4 === 0) {
      this.stats.criticalChance = (this.stats.criticalChance || 0) + 0.02;
    }
  }

  /**
   * Applies Archer-specific stat modifications
   */
  protected applyClassSpecificStats(): void {
    // Archers have natural speed bonus
    this.stats.speed += Math.floor(this.progression.level / 2);
    
    // Enhanced critical hit chance at higher levels
    if (this.progression.level >= 10) {
      this.stats.criticalChance = (this.stats.criticalChance || 0) + 0.05;
    }
  }

  /**
   * Executes the Piercing Shot ability
   * @param target - The primary target
   * @returns True if successful
   */
  private executePiercingShot(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Deal enhanced damage with guaranteed critical hit
    const damage = this.stats.attackPower + 40;
    const criticalDamage = Math.floor(damage * (this.stats.criticalMultiplier || 2.0));
    const damageDealt = target.takeDamage(criticalDamage);
    
    // TODO: Implement piercing through multiple enemies
    return damageDealt > 0;
  }

  /**
   * Executes the Multi Shot ability
   * @param target - The primary target (used for area effect)
   * @returns True if successful
   */
  private executeMultiShot(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Deal damage to primary target and nearby enemies
    const damage = 25;
    const damageDealt = target.takeDamage(damage);
    
    // TODO: Implement area of effect damage to nearby enemies
    return damageDealt > 0;
  }

  /**
   * Executes the Eagle Eye ability
   * @returns True if successful
   */
  private executeEagleEye(): boolean {
    // Temporarily increase critical hit chance
    // TODO: Implement proper temporary stat modifications
    // For now, just apply immediate effects
    
    return true;
  }
}
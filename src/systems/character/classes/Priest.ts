import { BaseCharacter } from '../BaseCharacter';
import { CharacterClass, SpecialAbility, CharacterClassConfig, ICharacter } from '../../../types/character';
import { EquipmentManager } from '../../equipment/Equipment';

/**
 * Priest character class - Support class with healing abilities
 * Specializes in healing and support magic
 */
export class Priest extends BaseCharacter {
  /**
   * Creates a new Priest character
   * @param id - Unique identifier for the character
   * @param name - Display name for the character
   * @param equipmentManager - Equipment manager instance
   */
  constructor(id: string, name: string, equipmentManager: EquipmentManager) {
    const classConfig: CharacterClassConfig = Priest.getClassConfig();
    super(id, name, CharacterClass.PRIEST, classConfig, equipmentManager);
  }

  /**
   * Gets the class configuration for Priests
   * @returns Configuration object for the Priest class
   */
  public static getClassConfig(): CharacterClassConfig {
    return {
      baseStats: {
        health: 90,
        maxHealth: 90,
        attackPower: 18,
        defense: 10,
        speed: 12,
        mana: 80,
        maxMana: 80,
        criticalChance: 0.06,
        criticalMultiplier: 1.8
      },
      statGrowth: {
        maxHealth: 10,
        attackPower: 2,
        defense: 2,
        speed: 1,
        maxMana: 6
      },
      defaultAbilities: [
        {
          id: 'priest_heal',
          name: 'Heal',
          description: 'Restores health to an ally',
          cooldown: 3,
          manaCost: 15,
          healAmount: 50,
          effect: 'healing'
        },
        {
          id: 'priest_group_heal',
          name: 'Group Heal',
          description: 'Heals all nearby allies',
          cooldown: 8,
          manaCost: 30,
          healAmount: 35,
          effect: 'area_healing'
        },
        {
          id: 'priest_divine_protection',
          name: 'Divine Protection',
          description: 'Grants temporary damage reduction to an ally',
          cooldown: 12,
          manaCost: 25,
          effect: 'protection'
        },
        {
          id: 'priest_holy_light',
          name: 'Holy Light',
          description: 'Damages undead enemies or heals living allies',
          cooldown: 6,
          manaCost: 20,
          damage: 40,
          healAmount: 40,
          effect: 'holy'
        }
      ],
      equipmentTypes: ['staff', 'robe', 'magic_boots']
    };
  }

  /**
   * Executes a Priest-specific special ability
   * @param ability - The ability to execute
   * @param target - Optional target for the ability
   * @returns True if the ability was successfully executed
   */
  protected executeAbility(ability: SpecialAbility, target?: ICharacter): boolean {
    switch (ability.id) {
      case 'priest_heal':
        return this.executeHeal(target);
      case 'priest_group_heal':
        return this.executeGroupHeal();
      case 'priest_divine_protection':
        return this.executeDivineProtection(target);
      case 'priest_holy_light':
        return this.executeHolyLight(target);
      default:
        return false;
    }
  }

  /**
   * Called when the Priest levels up
   */
  protected onLevelUp(): void {
    // Priests gain enhanced healing power every 5 levels
    if (this.progression.level % 5 === 0) {
      // Healing effectiveness increases
      this.abilities.forEach(ability => {
        if (ability.healAmount) {
          ability.healAmount += 10;
        }
      });
    }
  }

  /**
   * Applies Priest-specific stat modifications
   */
  protected applyClassSpecificStats(): void {
    // Priests have enhanced mana regeneration
    const manaBonus = Math.floor(this.progression.level / 4) * 5;
    this.stats.maxMana = (this.stats.maxMana || 0) + manaBonus;
    
    // Divine favor increases with level
    if (this.progression.level >= 10) {
      this.stats.defense += 3;
    }
  }

  /**
   * Executes the Heal ability
   * @param target - The target to heal
   * @returns True if successful
   */
  private executeHeal(target?: ICharacter): boolean {
    if (!target) {
      // Can heal self if no target specified
      target = this;
    }

    // Calculate healing amount based on level and stats
    const baseHealing = 50;
    const bonusHealing = Math.floor((this.stats.maxMana || 0) / 10);
    const totalHealing = baseHealing + bonusHealing;
    
    const healingDone = target.heal(totalHealing);
    return healingDone > 0;
  }

  /**
   * Executes the Group Heal ability
   * @returns True if successful
   */
  private executeGroupHeal(): boolean {
    // Heal self and nearby allies
    // For now, just heal self
    const baseHealing = 35;
    const bonusHealing = Math.floor((this.stats.maxMana || 0) / 15);
    const totalHealing = baseHealing + bonusHealing;
    
    const healingDone = this.heal(totalHealing);
    
    // TODO: Implement area healing for nearby allies
    return healingDone > 0;
  }

  /**
   * Executes the Divine Protection ability
   * @param target - The target to protect
   * @returns True if successful
   */
  private executeDivineProtection(target?: ICharacter): boolean {
    if (!target) {
      target = this;
    }

    // Apply temporary damage reduction
    // TODO: Implement proper temporary stat modifications/buffs
    // For now, just return success
    
    return true;
  }

  /**
   * Executes the Holy Light ability
   * @param target - The target (enemy to damage or ally to heal)
   * @returns True if successful
   */
  private executeHolyLight(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // TODO: Determine if target is undead/enemy or living/ally
    // For now, assume it's used for healing
    const baseHealing = 40;
    const bonusHealing = Math.floor((this.stats.maxMana || 0) / 12);
    const totalHealing = baseHealing + bonusHealing;
    
    const healingDone = target.heal(totalHealing);
    return healingDone > 0;
  }

  /**
   * Regenerates mana over time (should be called each game tick)
   * @param deltaTime - Time elapsed since last update in seconds
   */
  public regenerateMana(deltaTime: number): void {
    if (this.stats.mana !== undefined && this.stats.maxMana !== undefined) {
      const regenRate = 3; // Mana per second (slower than mage)
      const manaToRegen = regenRate * deltaTime;
      this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + manaToRegen);
    }
  }

  /**
   * Calculates the effectiveness of healing spells
   * @param baseHealing - The base healing amount
   * @returns Modified healing amount
   */
  public calculateHealingPower(baseHealing: number): number {
    const wisdomBonus = Math.floor((this.stats.maxMana || 0) / 20);
    const levelBonus = Math.floor(this.progression.level / 5);
    return baseHealing + wisdomBonus + levelBonus;
  }
}
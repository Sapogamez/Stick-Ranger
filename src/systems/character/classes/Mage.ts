import { BaseCharacter } from '../BaseCharacter';
import { CharacterClass, SpecialAbility, CharacterClassConfig, ICharacter } from '../../../types/character';
import { EquipmentManager } from '../../equipment/Equipment';

/**
 * Mage character class - Magic user with powerful spells
 * Specializes in elemental magic and area damage
 */
export class Mage extends BaseCharacter {
  /**
   * Creates a new Mage character
   * @param id - Unique identifier for the character
   * @param name - Display name for the character
   * @param equipmentManager - Equipment manager instance
   */
  constructor(id: string, name: string, equipmentManager: EquipmentManager) {
    const classConfig: CharacterClassConfig = Mage.getClassConfig();
    super(id, name, CharacterClass.MAGE, classConfig, equipmentManager);
  }

  /**
   * Gets the class configuration for Mages
   * @returns Configuration object for the Mage class
   */
  public static getClassConfig(): CharacterClassConfig {
    return {
      baseStats: {
        health: 60,
        maxHealth: 60,
        attackPower: 20,
        defense: 5,
        speed: 10,
        mana: 100,
        maxMana: 100,
        criticalChance: 0.08,
        criticalMultiplier: 2.5
      },
      statGrowth: {
        maxHealth: 6,
        attackPower: 2,
        defense: 1,
        speed: 1,
        maxMana: 8
      },
      defaultAbilities: [
        {
          id: 'mage_fireball',
          name: 'Fireball',
          description: 'Hurls a fireball that explodes on impact',
          cooldown: 4,
          manaCost: 20,
          damage: 45,
          effect: 'fire'
        },
        {
          id: 'mage_ice_shard',
          name: 'Ice Shard',
          description: 'Launches ice shards that slow enemies',
          cooldown: 5,
          manaCost: 18,
          damage: 35,
          effect: 'ice'
        },
        {
          id: 'mage_lightning_bolt',
          name: 'Lightning Bolt',
          description: 'Strikes with electricity that chains to nearby enemies',
          cooldown: 8,
          manaCost: 30,
          damage: 55,
          effect: 'lightning'
        },
        {
          id: 'mage_mana_shield',
          name: 'Mana Shield',
          description: 'Uses mana to absorb incoming damage',
          cooldown: 12,
          manaCost: 25,
          effect: 'shield'
        }
      ],
      equipmentTypes: ['staff', 'robe', 'magic_boots']
    };
  }

  /**
   * Executes a Mage-specific special ability
   * @param ability - The ability to execute
   * @param target - Optional target for the ability
   * @returns True if the ability was successfully executed
   */
  protected executeAbility(ability: SpecialAbility, target?: ICharacter): boolean {
    switch (ability.id) {
      case 'mage_fireball':
        return this.executeFireball(target);
      case 'mage_ice_shard':
        return this.executeIceShard(target);
      case 'mage_lightning_bolt':
        return this.executeLightningBolt(target);
      case 'mage_mana_shield':
        return this.executeManaShield();
      default:
        return false;
    }
  }

  /**
   * Called when the Mage levels up
   */
  protected onLevelUp(): void {
    // Mages gain bonus mana every 3 levels
    if (this.progression.level % 3 === 0) {
      this.stats.maxMana = (this.stats.maxMana || 0) + 15;
      this.stats.mana = this.stats.maxMana;
    }
  }

  /**
   * Applies Mage-specific stat modifications
   */
  protected applyClassSpecificStats(): void {
    // Mages have enhanced spell power based on mana
    const manaBonus = Math.floor((this.stats.maxMana || 0) / 20);
    this.stats.attackPower += manaBonus;
    
    // Higher critical multiplier for spell casting
    if (this.progression.level >= 15) {
      this.stats.criticalMultiplier = (this.stats.criticalMultiplier || 2.5) + 0.5;
    }
  }

  /**
   * Executes the Fireball ability
   * @param target - The target to hit with fireball
   * @returns True if successful
   */
  private executeFireball(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Deal fire damage with chance for area effect
    const baseDamage = this.stats.attackPower + 45;
    const magicDamage = Math.floor(baseDamage * 1.5); // Magic damage modifier
    const damageDealt = target.takeDamage(magicDamage);
    
    // TODO: Implement explosion area damage
    return damageDealt > 0;
  }

  /**
   * Executes the Ice Shard ability
   * @param target - The target to hit with ice shard
   * @returns True if successful
   */
  private executeIceShard(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Deal ice damage and apply slow effect
    const baseDamage = this.stats.attackPower + 35;
    const iceDamage = Math.floor(baseDamage * 1.3);
    const damageDealt = target.takeDamage(iceDamage);
    
    // TODO: Implement slow status effect
    return damageDealt > 0;
  }

  /**
   * Executes the Lightning Bolt ability
   * @param target - The primary target
   * @returns True if successful
   */
  private executeLightningBolt(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Deal lightning damage with chain effect
    const baseDamage = this.stats.attackPower + 55;
    const lightningDamage = Math.floor(baseDamage * 1.8);
    const damageDealt = target.takeDamage(lightningDamage);
    
    // TODO: Implement chain lightning to nearby enemies
    return damageDealt > 0;
  }

  /**
   * Executes the Mana Shield ability
   * @returns True if successful
   */
  private executeManaShield(): boolean {
    // Activate mana shield protection
    // TODO: Implement proper mana shield mechanic
    // For now, just return success
    
    return true;
  }

  /**
   * Regenerates mana over time (should be called each game tick)
   * @param deltaTime - Time elapsed since last update in seconds
   */
  public regenerateMana(deltaTime: number): void {
    if (this.stats.mana !== undefined && this.stats.maxMana !== undefined) {
      const regenRate = 5; // Mana per second
      const manaToRegen = regenRate * deltaTime;
      this.stats.mana = Math.min(this.stats.maxMana, this.stats.mana + manaToRegen);
    }
  }
}
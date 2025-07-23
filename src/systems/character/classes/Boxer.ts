import { BaseCharacter } from '../BaseCharacter';
import { CharacterClass, SpecialAbility, CharacterClassConfig, ICharacter } from '../../../types/character';
import { EquipmentManager } from '../../equipment/Equipment';

/**
 * Boxer character class - Fast melee fighter with combo attacks
 * Specializes in speed, combos, and quick strikes
 */
export class Boxer extends BaseCharacter {
  private comboCount: number = 0;
  private comboTimer: number = 0;
  private maxCombo: number = 5;

  /**
   * Creates a new Boxer character
   * @param id - Unique identifier for the character
   * @param name - Display name for the character
   * @param equipmentManager - Equipment manager instance
   */
  constructor(id: string, name: string, equipmentManager: EquipmentManager) {
    const classConfig: CharacterClassConfig = Boxer.getClassConfig();
    super(id, name, CharacterClass.BOXER, classConfig, equipmentManager);
  }

  /**
   * Gets the class configuration for Boxers
   * @returns Configuration object for the Boxer class
   */
  public static getClassConfig(): CharacterClassConfig {
    return {
      baseStats: {
        health: 100,
        maxHealth: 100,
        attackPower: 22,
        defense: 8,
        speed: 18,
        mana: 30,
        maxMana: 30,
        criticalChance: 0.12,
        criticalMultiplier: 1.8
      },
      statGrowth: {
        maxHealth: 9,
        attackPower: 3,
        defense: 1,
        speed: 3,
        maxMana: 2
      },
      defaultAbilities: [
        {
          id: 'boxer_rapid_punch',
          name: 'Rapid Punch',
          description: 'Performs a quick series of punches',
          cooldown: 4,
          manaCost: 8,
          damage: 15,
          effect: 'combo'
        },
        {
          id: 'boxer_uppercut',
          name: 'Uppercut',
          description: 'Powerful upward punch that launches enemies',
          cooldown: 7,
          manaCost: 15,
          damage: 35,
          effect: 'knockup'
        },
        {
          id: 'boxer_counter_attack',
          name: 'Counter Attack',
          description: 'Blocks next attack and counters with increased damage',
          cooldown: 10,
          manaCost: 12,
          effect: 'counter'
        },
        {
          id: 'boxer_combo_finisher',
          name: 'Combo Finisher',
          description: 'Devastating attack that scales with combo count',
          cooldown: 12,
          manaCost: 20,
          damage: 25,
          effect: 'finisher'
        }
      ],
      equipmentTypes: ['gloves', 'light_armor', 'leather_boots']
    };
  }

  /**
   * Executes a Boxer-specific special ability
   * @param ability - The ability to execute
   * @param target - Optional target for the ability
   * @returns True if the ability was successfully executed
   */
  protected executeAbility(ability: SpecialAbility, target?: ICharacter): boolean {
    switch (ability.id) {
      case 'boxer_rapid_punch':
        return this.executeRapidPunch(target);
      case 'boxer_uppercut':
        return this.executeUppercut(target);
      case 'boxer_counter_attack':
        return this.executeCounterAttack();
      case 'boxer_combo_finisher':
        return this.executeComboFinisher(target);
      default:
        return false;
    }
  }

  /**
   * Called when the Boxer levels up
   */
  protected onLevelUp(): void {
    // Boxers gain increased combo potential every 4 levels
    if (this.progression.level % 4 === 0) {
      this.maxCombo += 1;
    }

    // Speed bonus every 3 levels
    if (this.progression.level % 3 === 0) {
      this.stats.speed += 2;
    }
  }

  /**
   * Applies Boxer-specific stat modifications
   */
  protected applyClassSpecificStats(): void {
    // Boxers gain attack speed and critical chance based on speed
    const speedBonus = Math.floor(this.stats.speed / 10);
    this.stats.criticalChance = (this.stats.criticalChance || 0) + (speedBonus * 0.01);
    
    // Combo system enhances damage
    if (this.comboCount > 0) {
      const comboDamageBonus = this.comboCount * 2;
      this.stats.attackPower += comboDamageBonus;
    }
  }

  /**
   * Performs a basic attack with combo system
   * @param target - The character to attack
   * @returns The damage dealt
   */
  public attack(target: ICharacter): number {
    const damage = super.attack(target);
    
    // Build combo on successful hits
    if (damage > 0) {
      this.buildCombo();
    }
    
    return damage;
  }

  /**
   * Updates the boxer's combo system
   * @param deltaTime - Time elapsed since last update in seconds
   */
  public updateCombos(deltaTime: number): void {
    // Combo decays over time
    this.comboTimer += deltaTime;
    if (this.comboTimer >= 3.0) { // 3 seconds without action resets combo
      this.resetCombo();
    }

    // Update ability cooldowns
    this.updateCooldowns(deltaTime);
  }

  /**
   * Executes the Rapid Punch ability
   * @param target - The target to punch
   * @returns True if successful
   */
  private executeRapidPunch(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Perform multiple quick hits
    let totalDamage = 0;
    const hitCount = 3;
    
    for (let i = 0; i < hitCount; i++) {
      const damage = Math.floor((this.stats.attackPower + 15) * 0.6); // Reduced per-hit damage
      totalDamage += target.takeDamage(damage);
      this.buildCombo();
    }
    
    return totalDamage > 0;
  }

  /**
   * Executes the Uppercut ability
   * @param target - The target to uppercut
   * @returns True if successful
   */
  private executeUppercut(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Deal heavy damage with potential combo bonus
    const baseDamage = this.stats.attackPower + 35;
    const comboBonus = this.comboCount * 5;
    const totalDamage = baseDamage + comboBonus;
    
    const damageDealt = target.takeDamage(totalDamage);
    
    if (damageDealt > 0) {
      this.buildCombo();
      // TODO: Implement knockup effect
    }
    
    return damageDealt > 0;
  }

  /**
   * Executes the Counter Attack ability
   * @returns True if successful
   */
  private executeCounterAttack(): boolean {
    // Set up counter stance
    // TODO: Implement proper counter attack mechanic
    // For now, just build combo and return success
    this.buildCombo();
    return true;
  }

  /**
   * Executes the Combo Finisher ability
   * @param target - The target for the finisher
   * @returns True if successful
   */
  private executeComboFinisher(target?: ICharacter): boolean {
    if (!target) {
      return false;
    }

    // Damage scales massively with combo count
    const baseDamage = this.stats.attackPower + 25;
    const comboMultiplier = Math.max(1, this.comboCount * 0.5);
    const finalDamage = Math.floor(baseDamage * comboMultiplier);
    
    const damageDealt = target.takeDamage(finalDamage);
    
    if (damageDealt > 0) {
      // Reset combo after finisher
      this.resetCombo();
    }
    
    return damageDealt > 0;
  }

  /**
   * Builds the combo counter
   */
  private buildCombo(): void {
    if (this.comboCount < this.maxCombo) {
      this.comboCount++;
    }
    this.comboTimer = 0; // Reset decay timer
  }

  /**
   * Resets the combo counter
   */
  private resetCombo(): void {
    this.comboCount = 0;
    this.comboTimer = 0;
    // Recalculate stats without combo bonus
    this.updateStats();
  }

  /**
   * Gets the current combo count
   * @returns Current combo count
   */
  public getComboCount(): number {
    return this.comboCount;
  }

  /**
   * Gets the maximum possible combo count
   * @returns Maximum combo count
   */
  public getMaxCombo(): number {
    return this.maxCombo;
  }
}
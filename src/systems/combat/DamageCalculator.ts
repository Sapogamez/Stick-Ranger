import { Entity } from '../../types/game';
import { CombatStats, DamageResult, DamageType, CombatModifiers } from '../../types/combat';

/**
 * Handles all damage calculation logic for the combat system.
 * Includes critical hits, damage types, resistances, and modifiers.
 */
export class DamageCalculator {
  private readonly baseCriticalChance = 0.05;
  private readonly baseCriticalMultiplier = 1.5;

  /**
   * Calculate damage from an attacker to a target
   */
  calculateDamage(
    attacker: Entity,
    target: Entity,
    baseDamage: number,
    damageType: DamageType = DamageType.Physical,
    attackerStats?: CombatStats,
    targetStats?: CombatStats,
    modifiers?: CombatModifiers
  ): DamageResult {
    try {
      // Get stats (with defaults if not provided)
      const atkStats = attackerStats || this.getDefaultStats();
      const defStats = targetStats || this.getDefaultStats();
      const mods = modifiers || this.getDefaultModifiers();

      // Calculate base damage with attack stat
      let finalDamage = baseDamage + (atkStats.attack * 0.5);

      // Apply damage type multiplier
      finalDamage *= mods.damageMultiplier;

      // Check for critical hit
      const isCritical = this.rollCriticalHit(atkStats, mods);
      if (isCritical) {
        const critMultiplier = (atkStats.criticalMultiplier || this.baseCriticalMultiplier) + mods.criticalBonus;
        finalDamage *= critMultiplier;
      }

      // Apply defense
      const defense = defStats.defense * mods.defenseMultiplier;
      finalDamage = Math.max(1, finalDamage - defense);

      // Apply damage type resistance
      const resistance = mods.resistances.get(damageType) || 0;
      finalDamage *= (1 - resistance);

      // Add random variation (±5%)
      const variation = (Math.random() - 0.5) * 0.1;
      finalDamage *= (1 + variation);

      // Ensure minimum damage
      finalDamage = Math.max(1, Math.floor(finalDamage));

      return {
        amount: finalDamage,
        isCritical,
        damageType,
        source: attacker,
        effects: []
      };
    } catch (error) {
      console.error('Error calculating damage:', error);
      return {
        amount: 1,
        isCritical: false,
        damageType,
        source: attacker,
        effects: []
      };
    }
  }

  /**
   * Calculate healing amount
   */
  calculateHealing(
    healer: Entity,
    target: Entity,
    baseHealing: number,
    healerStats?: CombatStats,
    modifiers?: CombatModifiers
  ): DamageResult {
    try {
      const stats = healerStats || this.getDefaultStats();
      const mods = modifiers || this.getDefaultModifiers();

      // Calculate healing with healer's attack stat (representing spell power)
      let finalHealing = baseHealing + (stats.attack * 0.3);

      // Apply modifiers
      finalHealing *= mods.damageMultiplier;

      // Check for critical healing
      const isCritical = this.rollCriticalHit(stats, mods);
      if (isCritical) {
        finalHealing *= (stats.criticalMultiplier || this.baseCriticalMultiplier);
      }

      // Add random variation
      const variation = (Math.random() - 0.5) * 0.1;
      finalHealing *= (1 + variation);

      finalHealing = Math.max(1, Math.floor(finalHealing));

      return {
        amount: finalHealing,
        isCritical,
        damageType: DamageType.Healing,
        source: healer,
        effects: []
      };
    } catch (error) {
      console.error('Error calculating healing:', error);
      return {
        amount: 1,
        isCritical: false,
        damageType: DamageType.Healing,
        source: healer,
        effects: []
      };
    }
  }

  /**
   * Check if an attack hits the target
   */
  calculateHitChance(
    attackerStats: CombatStats,
    targetStats: CombatStats,
    modifiers?: CombatModifiers
  ): boolean {
    try {
      const mods = modifiers || this.getDefaultModifiers();
      
      // Base accuracy vs evasion
      const baseAccuracy = attackerStats.accuracy + mods.accuracyBonus;
      const evasion = targetStats.evasion;
      
      // Calculate hit chance (75% base, modified by stats)
      const hitChance = Math.max(0.05, Math.min(0.95, 0.75 + (baseAccuracy - evasion) * 0.01));
      
      return Math.random() < hitChance;
    } catch (error) {
      console.error('Error calculating hit chance:', error);
      return true; // Default to hit on error
    }
  }

  /**
   * Calculate damage mitigation from armor/defense
   */
  calculateDamageMitigation(
    damage: number,
    defense: number,
    damageType: DamageType,
    resistances: Map<DamageType, number>
  ): number {
    try {
      // Physical damage is reduced by defense
      let mitigatedDamage = damage;
      
      if (damageType === DamageType.Physical) {
        mitigatedDamage = Math.max(damage * 0.1, damage - defense);
      }
      
      // Apply elemental resistances
      const resistance = resistances.get(damageType) || 0;
      mitigatedDamage *= (1 - Math.max(0, Math.min(0.9, resistance)));
      
      return Math.max(1, Math.floor(mitigatedDamage));
    } catch (error) {
      console.error('Error calculating damage mitigation:', error);
      return damage;
    }
  }

  /**
   * Roll for critical hit
   */
  private rollCriticalHit(stats: CombatStats, modifiers: CombatModifiers): boolean {
    const critChance = (stats.criticalChance || this.baseCriticalChance) + modifiers.criticalBonus;
    return Math.random() < Math.max(0, Math.min(0.5, critChance));
  }

  /**
   * Get default combat stats
   */
  private getDefaultStats(): CombatStats {
    return {
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      speed: 10,
      criticalChance: this.baseCriticalChance,
      criticalMultiplier: this.baseCriticalMultiplier,
      accuracy: 0.8,
      evasion: 0.1
    };
  }

  /**
   * Get default combat modifiers
   */
  private getDefaultModifiers(): CombatModifiers {
    return {
      damageMultiplier: 1.0,
      defenseMultiplier: 1.0,
      speedMultiplier: 1.0,
      criticalBonus: 0,
      accuracyBonus: 0,
      resistances: new Map()
    };
  }

  /**
   * Calculate damage over time (DoT) effects
   */
  calculateDoTDamage(
    baseDamage: number,
    stacks: number,
    damageType: DamageType,
    targetStats?: CombatStats,
    resistances?: Map<DamageType, number>
  ): number {
    try {
      let damage = baseDamage * stacks;
      
      // Apply resistances
      if (resistances) {
        const resistance = resistances.get(damageType) || 0;
        damage *= (1 - resistance);
      }
      
      return Math.max(1, Math.floor(damage));
    } catch (error) {
      console.error('Error calculating DoT damage:', error);
      return 1;
    }
  }
}
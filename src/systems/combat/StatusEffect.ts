import { Entity, StatusEffect as BaseStatusEffect } from '../../types/game';
import { DamageType, CombatModifiers } from '../../types/combat';
import { DamageCalculator } from './DamageCalculator';

/**
 * Enhanced status effect system with improved management and predefined effects
 */

// Base implementation for all status effects
export abstract class StatusEffectBase implements BaseStatusEffect {
  abstract id: string;
  abstract name: string;
  duration: number;
  remainingTime: number;
  stackable: boolean;
  maxStacks: number;
  currentStacks: number;

  constructor(duration: number, stackable = false, maxStacks = 1) {
    this.duration = duration;
    this.remainingTime = duration;
    this.stackable = stackable;
    this.maxStacks = maxStacks;
    this.currentStacks = 1;
  }

  abstract onApply(target: Entity): void;
  abstract onUpdate(target: Entity, deltaTime: number): void;
  abstract onRemove(target: Entity): void;

  canStack(other: BaseStatusEffect): boolean {
    return this.stackable && other.id === this.id && this.currentStacks < this.maxStacks;
  }

  addStack(): void {
    if (this.currentStacks < this.maxStacks) {
      this.currentStacks++;
      this.remainingTime = this.duration; // Refresh duration on stack
    }
  }

  getRemainingTime(): number {
    return this.remainingTime;
  }

  update(target: Entity, deltaTime: number): void {
    this.remainingTime -= deltaTime;
    this.onUpdate(target, deltaTime);
  }

  isExpired(): boolean {
    return this.remainingTime <= 0;
  }
}

// Predefined status effects
export class PoisonEffect extends StatusEffectBase {
  id = 'poison';
  name = 'Poison';
  
  private damagePerSecond: number;
  private damageCalculator: DamageCalculator;
  private lastDamageTime = 0;
  private damageInterval = 1.0; // Damage every second

  constructor(duration: number, damagePerSecond: number) {
    super(duration, true, 5);
    this.damagePerSecond = damagePerSecond;
    this.damageCalculator = new DamageCalculator();
  }

  onApply(target: Entity): void {
    console.log(`${target.id} is poisoned!`);
  }

  onUpdate(target: Entity, deltaTime: number): void {
    this.lastDamageTime += deltaTime;
    
    if (this.lastDamageTime >= this.damageInterval) {
      const damage = this.damageCalculator.calculateDoTDamage(
        this.damagePerSecond,
        this.currentStacks,
        DamageType.Poison
      );
      
      // Apply damage to target (would integrate with health component)
      this.applyDamageToTarget(target, damage);
      this.lastDamageTime = 0;
    }
  }

  onRemove(target: Entity): void {
    console.log(`${target.id} recovers from poison.`);
  }

  private applyDamageToTarget(target: Entity, damage: number): void {
    // This would integrate with the actual health component
    console.log(`${target.id} takes ${damage} poison damage`);
  }
}

export class StunEffect extends StatusEffectBase {
  id = 'stun';
  name = 'Stun';

  constructor(duration: number) {
    super(duration, false, 1);
  }

  onApply(target: Entity): void {
    console.log(`${target.id} is stunned!`);
    // Disable movement and actions
  }

  onUpdate(target: Entity, deltaTime: number): void {
    // Stun just prevents actions, no periodic effect
  }

  onRemove(target: Entity): void {
    console.log(`${target.id} recovers from stun.`);
    // Re-enable movement and actions
  }
}

export class BurnEffect extends StatusEffectBase {
  id = 'burn';
  name = 'Burn';
  
  private damagePerSecond: number;
  private damageCalculator: DamageCalculator;

  constructor(duration: number, damagePerSecond: number) {
    super(duration, true, 3);
    this.damagePerSecond = damagePerSecond;
    this.damageCalculator = new DamageCalculator();
  }

  onApply(target: Entity): void {
    console.log(`${target.id} is burning!`);
  }

  onUpdate(target: Entity, deltaTime: number): void {
    const damage = this.damageCalculator.calculateDoTDamage(
      this.damagePerSecond * deltaTime,
      this.currentStacks,
      DamageType.Fire
    );
    
    this.applyDamageToTarget(target, damage);
  }

  onRemove(target: Entity): void {
    console.log(`${target.id} stops burning.`);
  }

  private applyDamageToTarget(target: Entity, damage: number): void {
    console.log(`${target.id} takes ${damage} fire damage`);
  }
}

export class FreezeEffect extends StatusEffectBase {
  id = 'freeze';
  name = 'Freeze';
  
  private speedReduction = 0.5; // 50% speed reduction

  constructor(duration: number) {
    super(duration, false, 1);
  }

  onApply(target: Entity): void {
    console.log(`${target.id} is frozen!`);
    // Apply speed reduction
  }

  onUpdate(target: Entity, deltaTime: number): void {
    // Freeze effect is passive
  }

  onRemove(target: Entity): void {
    console.log(`${target.id} thaws out.`);
    // Remove speed reduction
  }
}

export class ShieldEffect extends StatusEffectBase {
  id = 'shield';
  name = 'Shield';
  
  private shieldAmount: number;
  private currentShield: number;

  constructor(duration: number, shieldAmount: number) {
    super(duration, false, 1);
    this.shieldAmount = shieldAmount;
    this.currentShield = shieldAmount;
  }

  onApply(target: Entity): void {
    console.log(`${target.id} gains a shield of ${this.shieldAmount}!`);
  }

  onUpdate(target: Entity, deltaTime: number): void {
    // Shield effect is passive
  }

  onRemove(target: Entity): void {
    console.log(`${target.id}'s shield fades.`);
  }

  absorb(damage: number): number {
    const absorbed = Math.min(damage, this.currentShield);
    this.currentShield -= absorbed;
    
    if (this.currentShield <= 0) {
      this.remainingTime = 0; // Shield broken, remove effect
    }
    
    return damage - absorbed;
  }

  getShieldAmount(): number {
    return this.currentShield;
  }
}

/**
 * Enhanced status effect manager with improved organization and features
 */
export class StatusEffectManager {
  private effects: Map<string, BaseStatusEffect[]> = new Map();
  private effectFactory: Map<string, (...args: any[]) => BaseStatusEffect> = new Map();

  constructor() {
    this.initializeEffectFactory();
  }

  private initializeEffectFactory(): void {
    this.effectFactory.set('poison', (duration: number, dps: number) => new PoisonEffect(duration, dps));
    this.effectFactory.set('stun', (duration: number) => new StunEffect(duration));
    this.effectFactory.set('burn', (duration: number, dps: number) => new BurnEffect(duration, dps));
    this.effectFactory.set('freeze', (duration: number) => new FreezeEffect(duration));
    this.effectFactory.set('shield', (duration: number, amount: number) => new ShieldEffect(duration, amount));
  }

  /**
   * Create a status effect by ID
   */
  createEffect(effectId: string, ...args: any[]): BaseStatusEffect | null {
    const factory = this.effectFactory.get(effectId);
    return factory ? factory(...args) : null;
  }

  /**
   * Apply a status effect to an entity
   */
  applyEffect(target: Entity, effect: BaseStatusEffect): void {
    try {
      const targetId = target.id;
      
      if (!this.effects.has(targetId)) {
        this.effects.set(targetId, []);
      }
      
      const targetEffects = this.effects.get(targetId)!;
      
      // Check for existing effect of the same type
      const existingEffect = targetEffects.find(e => e.id === effect.id);
      
      if (existingEffect && existingEffect.canStack(effect)) {
        // Stack the effect
        if (existingEffect instanceof StatusEffectBase) {
          existingEffect.addStack();
        }
      } else if (!existingEffect) {
        // Apply new effect
        targetEffects.push(effect);
        effect.onApply(target);
      } else {
        // Refresh existing non-stackable effect
        existingEffect.remainingTime = effect.duration;
      }
    } catch (error) {
      console.error('Error applying status effect:', error);
    }
  }

  /**
   * Remove a specific status effect from an entity
   */
  removeEffect(target: Entity, effectId: string): void {
    try {
      const targetId = target.id;
      const targetEffects = this.effects.get(targetId);
      
      if (targetEffects) {
        const index = targetEffects.findIndex(e => e.id === effectId);
        if (index !== -1) {
          const effect = targetEffects[index];
          effect.onRemove(target);
          targetEffects.splice(index, 1);
        }
      }
    } catch (error) {
      console.error('Error removing status effect:', error);
    }
  }

  /**
   * Update all status effects
   */
  update(deltaTime: number, entities: Map<string, Entity>): void {
    try {
      this.effects.forEach((effects, targetId) => {
        const target = entities.get(targetId);
        if (!target) {
          this.effects.delete(targetId);
          return;
        }
        
        // Update effects in reverse order for safe removal
        for (let i = effects.length - 1; i >= 0; i--) {
          const effect = effects[i];
          
          if (effect instanceof StatusEffectBase) {
            effect.update(target, deltaTime);
            
            if (effect.isExpired()) {
              effect.onRemove(target);
              effects.splice(i, 1);
            }
          } else {
            // Handle legacy status effects
            effect.onUpdate(target, deltaTime);
            effect.remainingTime -= deltaTime;
            
            if (effect.remainingTime <= 0) {
              effect.onRemove(target);
              effects.splice(i, 1);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error updating status effects:', error);
    }
  }

  /**
   * Get all effects on an entity
   */
  getEffects(target: Entity): BaseStatusEffect[] {
    return this.effects.get(target.id) || [];
  }

  /**
   * Check if an entity has a specific effect
   */
  hasEffect(target: Entity, effectId: string): boolean {
    const effects = this.getEffects(target);
    return effects.some(e => e.id === effectId);
  }

  /**
   * Get a specific effect on an entity
   */
  getEffect(target: Entity, effectId: string): BaseStatusEffect | undefined {
    const effects = this.getEffects(target);
    return effects.find(e => e.id === effectId);
  }

  /**
   * Clear all effects from an entity
   */
  clearEffects(target: Entity): void {
    try {
      const effects = this.effects.get(target.id);
      if (effects) {
        effects.forEach(effect => effect.onRemove(target));
        this.effects.delete(target.id);
      }
    } catch (error) {
      console.error('Error clearing status effects:', error);
    }
  }

  /**
   * Get all entities with effects
   */
  getAffectedEntities(): string[] {
    return Array.from(this.effects.keys());
  }

  /**
   * Get effect count for an entity
   */
  getEffectCount(target: Entity): number {
    return this.getEffects(target).length;
  }
}
import { 
    Weapon, WeaponType, WeaponStats, WeaponProperties, WeaponEffect,
    StatusEffect, Vector2
} from '../types/game';
import { HealthComponent, TransformComponent, Entity } from './EntityComponentSystem';

/**
 * Advanced Combat System
 * 
 * Provides comprehensive combat mechanics including weapons, status effects,
 * combo system, and damage calculation with various modifiers.
 */

// Status Effect Implementations
export class PoisonEffect implements StatusEffect {
    id = 'poison';
    name = 'Poison';
    duration: number;
    remainingTime: number;
    stackable = true;
    maxStacks = 5;
    currentStacks = 1;
    
    private damagePerSecond: number;
    private damageInterval = 1.0;
    private lastDamageTime = 0;
    
    constructor(duration: number, damagePerSecond: number) {
        this.duration = duration;
        this.remainingTime = duration;
        this.damagePerSecond = damagePerSecond;
    }
    
    onApply(target: Entity): void {
        console.log(`${target.id} is poisoned!`);
        // Could trigger visual effects, sound, etc.
    }
    
    onUpdate(target: Entity, deltaTime: number): void {
        this.remainingTime -= deltaTime;
        this.lastDamageTime += deltaTime;
        
        if (this.lastDamageTime >= this.damageInterval) {
            const health = target.getComponent(HealthComponent);
            if (health) {
                const totalDamage = this.damagePerSecond * this.currentStacks;
                health.takeDamage(totalDamage, 'poison');
                this.lastDamageTime = 0;
            }
        }
    }
    
    onRemove(target: Entity): void {
        console.log(`${target.id} recovers from poison.`);
    }
    
    canStack(other: StatusEffect): boolean {
        return other.id === this.id && this.currentStacks < this.maxStacks;
    }
}

export class BurnEffect implements StatusEffect {
    id = 'burn';
    name = 'Burn';
    duration: number;
    remainingTime: number;
    stackable = true;
    maxStacks = 3;
    currentStacks = 1;
    
    private damagePerSecond: number;
    
    constructor(duration: number, damagePerSecond: number) {
        this.duration = duration;
        this.remainingTime = duration;
        this.damagePerSecond = damagePerSecond;
    }
    
    onApply(target: Entity): void {
        console.log(`${target.id} is burning!`);
    }
    
    onUpdate(target: Entity, deltaTime: number): void {
        this.remainingTime -= deltaTime;
        
        const health = target.getComponent(HealthComponent);
        if (health) {
            const damage = this.damagePerSecond * this.currentStacks * deltaTime;
            health.takeDamage(damage, 'fire');
        }
    }
    
    onRemove(target: Entity): void {
        console.log(`${target.id} stops burning.`);
    }
    
    canStack(other: StatusEffect): boolean {
        return other.id === this.id && this.currentStacks < this.maxStacks;
    }
}

export class FreezeEffect implements StatusEffect {
    id = 'freeze';
    name = 'Freeze';
    duration: number;
    remainingTime: number;
    stackable = false;
    maxStacks = 1;
    currentStacks = 1;
    
    private originalSpeed: number = 0;
    
    constructor(duration: number) {
        this.duration = duration;
        this.remainingTime = duration;
    }
    
    onApply(target: Entity): void {
        // Store original speed and reduce movement
        // Implementation would depend on movement component
        console.log(`${target.id} is frozen!`);
    }
    
    onUpdate(target: Entity, deltaTime: number): void {
        this.remainingTime -= deltaTime;
    }
    
    onRemove(target: Entity): void {
        // Restore original speed
        console.log(`${target.id} thaws out.`);
    }
    
    canStack(other: StatusEffect): boolean {
        return false;
    }
}

// Status Effect Manager
export class StatusEffectManager {
    private effects: Map<string, StatusEffect[]> = new Map();
    
    applyEffect(target: Entity, effect: StatusEffect): void {
        const targetId = target.id;
        
        if (!this.effects.has(targetId)) {
            this.effects.set(targetId, []);
        }
        
        const targetEffects = this.effects.get(targetId)!;
        
        // Check for stacking
        const existingEffect = targetEffects.find(e => e.id === effect.id);
        if (existingEffect && existingEffect.canStack(effect)) {
            existingEffect.currentStacks++;
            existingEffect.remainingTime = Math.max(existingEffect.remainingTime, effect.duration);
        } else if (!existingEffect) {
            targetEffects.push(effect);
            effect.onApply(target);
        }
    }
    
    removeEffect(target: Entity, effectId: string): void {
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
    }
    
    update(deltaTime: number, entityManager: any): void {
        this.effects.forEach((effects, targetId) => {
            const target = entityManager.getEntity(targetId);
            if (!target) {
                this.effects.delete(targetId);
                return;
            }
            
            for (let i = effects.length - 1; i >= 0; i--) {
                const effect = effects[i];
                effect.onUpdate(target, deltaTime);
                
                if (effect.remainingTime <= 0) {
                    effect.onRemove(target);
                    effects.splice(i, 1);
                }
            }
        });
    }
    
    getEffects(target: Entity): StatusEffect[] {
        return this.effects.get(target.id) || [];
    }
    
    hasEffect(target: Entity, effectId: string): boolean {
        const effects = this.getEffects(target);
        return effects.some(e => e.id === effectId);
    }
    
    clearEffects(target: Entity): void {
        const effects = this.effects.get(target.id);
        if (effects) {
            effects.forEach(effect => effect.onRemove(target));
            this.effects.delete(target.id);
        }
    }
}

// Combo System
export class ComboSystem {
    private comboCounter: Map<string, number> = new Map();
    private comboTimer: Map<string, number> = new Map();
    private comboWindow: number = 3.0; // 3 seconds to continue combo
    private maxCombo: number = 50;
    
    registerHit(entityId: string, damage: number): number {
        const currentCombo = this.comboCounter.get(entityId) || 0;
        const newCombo = Math.min(currentCombo + 1, this.maxCombo);
        
        this.comboCounter.set(entityId, newCombo);
        this.comboTimer.set(entityId, this.comboWindow);
        
        // Calculate combo multiplier
        const multiplier = this.calculateComboMultiplier(newCombo);
        const finalDamage = Math.floor(damage * multiplier);
        
        // Trigger combo events
        this.triggerComboEvent(entityId, newCombo, finalDamage);
        
        return finalDamage;
    }
    
    private calculateComboMultiplier(combo: number): number {
        if (combo <= 5) return 1.0;
        if (combo <= 10) return 1.1;
        if (combo <= 20) return 1.25;
        if (combo <= 30) return 1.5;
        if (combo <= 40) return 1.75;
        return 2.0; // Max multiplier at 40+ combo
    }
    
    private triggerComboEvent(entityId: string, combo: number, damage: number): void {
        if (combo % 10 === 0) {
            console.log(`${entityId} achieved ${combo} hit combo! Damage: ${damage}`);
        }
    }
    
    update(deltaTime: number): void {
        this.comboTimer.forEach((time, entityId) => {
            const newTime = time - deltaTime;
            if (newTime <= 0) {
                // Combo expired
                this.comboCounter.delete(entityId);
                this.comboTimer.delete(entityId);
                this.triggerComboBreak(entityId);
            } else {
                this.comboTimer.set(entityId, newTime);
            }
        });
    }
    
    private triggerComboBreak(entityId: string): void {
        const finalCombo = this.comboCounter.get(entityId) || 0;
        if (finalCombo > 0) {
            console.log(`${entityId} combo broken at ${finalCombo} hits`);
        }
    }
    
    getCombo(entityId: string): number {
        return this.comboCounter.get(entityId) || 0;
    }
    
    resetCombo(entityId: string): void {
        this.comboCounter.delete(entityId);
        this.comboTimer.delete(entityId);
    }
}

// Weapon Manager
export class WeaponManager {
    private weapons: Map<string, Weapon> = new Map();
    
    constructor() {
        this.initializeDefaultWeapons();
    }
    
    private initializeDefaultWeapons(): void {
        this.addWeapon(this.createAssaultRifle());
        this.addWeapon(this.createSniperRifle());
        this.addWeapon(this.createShotgun());
        this.addWeapon(this.createSword());
        this.addWeapon(this.createStaff());
    }
    
    private createAssaultRifle(): Weapon {
        return {
            id: 'assault_rifle_basic',
            name: 'Basic Assault Rifle',
            type: WeaponType.AssaultRifle,
            stats: {
                baseDamage: 25,
                criticalChance: 0.05,
                criticalMultiplier: 1.5,
                fireRate: 10,
                range: 200,
                accuracy: 0.85,
                recoil: 0.3,
                magazineSize: 30,
                reloadTime: 2.0
            },
            properties: {
                isAutomatic: true,
                penetration: 1,
                explosive: false
            },
            effects: []
        };
    }
    
    private createSniperRifle(): Weapon {
        return {
            id: 'sniper_rifle_basic',
            name: 'Basic Sniper Rifle',
            type: WeaponType.SniperRifle,
            stats: {
                baseDamage: 120,
                criticalChance: 0.25,
                criticalMultiplier: 2.0,
                fireRate: 0.67,
                range: 500,
                accuracy: 0.95,
                recoil: 1.5,
                magazineSize: 5,
                reloadTime: 2.5
            },
            properties: {
                isAutomatic: false,
                penetration: 3,
                explosive: false
            },
            effects: []
        };
    }
    
    private createShotgun(): Weapon {
        return {
            id: 'shotgun_basic',
            name: 'Basic Shotgun',
            type: WeaponType.Shotgun,
            stats: {
                baseDamage: 15,
                criticalChance: 0.1,
                criticalMultiplier: 1.3,
                fireRate: 2,
                range: 50,
                accuracy: 0.6,
                recoil: 1.0,
                magazineSize: 8,
                reloadTime: 3.0
            },
            properties: {
                isAutomatic: false,
                penetration: 0,
                explosive: false,
                multiShot: 8,
                spread: Math.PI * 0.2
            },
            effects: []
        };
    }
    
    private createSword(): Weapon {
        return {
            id: 'iron_sword',
            name: 'Iron Sword',
            type: WeaponType.Sword,
            stats: {
                baseDamage: 35,
                criticalChance: 0.15,
                criticalMultiplier: 1.8,
                fireRate: 2.0,
                range: 3,
                accuracy: 0.95,
                recoil: 0,
                magazineSize: 1,
                reloadTime: 0
            },
            properties: {
                isAutomatic: false,
                penetration: 0,
                explosive: false
            },
            effects: []
        };
    }
    
    private createStaff(): Weapon {
        return {
            id: 'fire_staff',
            name: 'Fire Staff',
            type: WeaponType.Staff,
            stats: {
                baseDamage: 28,
                criticalChance: 0.12,
                criticalMultiplier: 1.6,
                fireRate: 1.5,
                range: 150,
                accuracy: 0.9,
                recoil: 0.1,
                magazineSize: 1,
                reloadTime: 0
            },
            properties: {
                isAutomatic: false,
                penetration: 1,
                explosive: false
            },
            effects: [
                {
                    type: 'onHit',
                    effect: new BurnEffect(3, 5),
                    chance: 0.3
                }
            ]
        };
    }
    
    addWeapon(weapon: Weapon): void {
        this.weapons.set(weapon.id, weapon);
    }
    
    getWeapon(id: string): Weapon | undefined {
        return this.weapons.get(id);
    }
    
    getAllWeapons(): Weapon[] {
        return Array.from(this.weapons.values());
    }
    
    getWeaponsByType(type: WeaponType): Weapon[] {
        return this.getAllWeapons().filter(weapon => weapon.type === type);
    }
}

// Advanced Combat System
export class AdvancedCombatSystem {
    private statusEffectManager: StatusEffectManager;
    private comboSystem: ComboSystem;
    private weaponManager: WeaponManager;
    
    constructor() {
        this.statusEffectManager = new StatusEffectManager();
        this.comboSystem = new ComboSystem();
        this.weaponManager = new WeaponManager();
    }
    
    calculateDamage(weapon: Weapon, attacker: Entity, target: Entity): number {
        let damage = weapon.stats.baseDamage;
        
        // Apply attacker modifiers (would get from stats component)
        // damage += attackerStats.atk * 0.5;
        
        // Check for critical hit
        if (Math.random() < weapon.stats.criticalChance) {
            damage *= weapon.stats.criticalMultiplier;
            this.triggerCriticalHit(attacker);
        }
        
        // Apply target defense (would get from stats component)
        // damage = Math.max(1, damage - targetStats.def);
        
        // Apply combo multiplier
        damage = this.comboSystem.registerHit(attacker.id, damage);
        
        // Add random variation (±10%)
        const variation = (Math.random() - 0.5) * 0.2;
        damage *= (1 + variation);
        
        return Math.floor(damage);
    }
    
    dealDamage(attacker: Entity, target: Entity, weapon: Weapon): void {
        const damage = this.calculateDamage(weapon, attacker, target);
        
        const targetHealth = target.getComponent(HealthComponent);
        if (targetHealth) {
            targetHealth.takeDamage(damage, weapon.type.toString(), attacker);
        }
        
        // Apply weapon effects
        this.applyWeaponEffects(weapon, attacker, target);
        
        console.log(`${attacker.id} deals ${damage} damage to ${target.id} with ${weapon.name}`);
    }
    
    private applyWeaponEffects(weapon: Weapon, attacker: Entity, target: Entity): void {
        weapon.effects
            .filter(effect => effect.type === 'onHit')
            .forEach(effect => {
                if (Math.random() < effect.chance) {
                    if (effect.effect instanceof Object && 'id' in effect.effect) {
                        // It's a status effect
                        this.statusEffectManager.applyEffect(target, effect.effect as StatusEffect);
                    }
                }
            });
    }
    
    private triggerCriticalHit(attacker: Entity): void {
        console.log(`${attacker.id} scores a critical hit!`);
        // Could trigger visual/audio effects, screen shake, etc.
    }
    
    createExplosion(center: Vector2, radius: number, damage: number, attacker: Entity, entityManager: any): void {
        // Find all entities within explosion radius
        const entities = entityManager.getAllEntities();
        
        entities.forEach((entity: Entity) => {
            const transform = entity.getComponent(TransformComponent);
            if (!transform) return;
            
            const distance = Math.sqrt(
                Math.pow(transform.position.x - center.x, 2) +
                Math.pow(transform.position.y - center.y, 2)
            );
            
            if (distance <= radius && entity !== attacker) {
                // Calculate damage falloff with distance
                const damageFalloff = 1 - (distance / radius);
                const finalDamage = damage * damageFalloff;
                
                const health = entity.getComponent(HealthComponent);
                if (health) {
                    health.takeDamage(finalDamage, 'explosion', attacker);
                }
            }
        });
        
        console.log(`Explosion at (${center.x}, ${center.y}) with radius ${radius} and damage ${damage}`);
    }
    
    update(deltaTime: number, entityManager: any): void {
        this.statusEffectManager.update(deltaTime, entityManager);
        this.comboSystem.update(deltaTime);
    }
    
    getStatusEffectManager(): StatusEffectManager {
        return this.statusEffectManager;
    }
    
    getComboSystem(): ComboSystem {
        return this.comboSystem;
    }
    
    getWeaponManager(): WeaponManager {
        return this.weaponManager;
    }
    
    // Utility methods for weapon handling
    calculateRecoil(weapon: Weapon): Vector2 {
        const baseRecoil = weapon.stats.recoil;
        const variation = (Math.random() - 0.5) * 0.2;
        const modifiedRecoil = baseRecoil * (1 + variation);
        
        return {
            x: (Math.random() - 0.5) * modifiedRecoil,
            y: -Math.abs(modifiedRecoil) * 0.7 // Upward recoil
        };
    }
    
    calculateSpread(weapon: Weapon): number {
        const baseAccuracy = weapon.stats.accuracy;
        return (1.0 - baseAccuracy) * Math.PI * 0.1; // Max 18 degrees spread
    }
    
    isInRange(attacker: Entity, target: Entity, weapon: Weapon): boolean {
        const attackerTransform = attacker.getComponent(TransformComponent);
        const targetTransform = target.getComponent(TransformComponent);
        
        if (!attackerTransform || !targetTransform) return false;
        
        const distance = Math.sqrt(
            Math.pow(targetTransform.position.x - attackerTransform.position.x, 2) +
            Math.pow(targetTransform.position.y - attackerTransform.position.y, 2)
        );
        
        return distance <= weapon.stats.range;
    }
}
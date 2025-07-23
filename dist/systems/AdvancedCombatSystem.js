"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedCombatSystem = exports.WeaponManager = exports.ComboSystem = exports.StatusEffectManager = exports.FreezeEffect = exports.BurnEffect = exports.PoisonEffect = void 0;
const game_1 = require("../types/game");
const EntityComponentSystem_1 = require("./EntityComponentSystem");
/**
 * Advanced Combat System
 *
 * Provides comprehensive combat mechanics including weapons, status effects,
 * combo system, and damage calculation with various modifiers.
 */
// Status Effect Implementations
class PoisonEffect {
    constructor(duration, damagePerSecond) {
        this.id = 'poison';
        this.name = 'Poison';
        this.stackable = true;
        this.maxStacks = 5;
        this.currentStacks = 1;
        this.damageInterval = 1.0;
        this.lastDamageTime = 0;
        this.duration = duration;
        this.remainingTime = duration;
        this.damagePerSecond = damagePerSecond;
    }
    onApply(target) {
        console.log(`${target.id} is poisoned!`);
        // Could trigger visual effects, sound, etc.
    }
    onUpdate(target, deltaTime) {
        this.remainingTime -= deltaTime;
        this.lastDamageTime += deltaTime;
        if (this.lastDamageTime >= this.damageInterval) {
            const health = target.getComponent(EntityComponentSystem_1.HealthComponent);
            if (health) {
                const totalDamage = this.damagePerSecond * this.currentStacks;
                health.takeDamage(totalDamage, 'poison');
                this.lastDamageTime = 0;
            }
        }
    }
    onRemove(target) {
        console.log(`${target.id} recovers from poison.`);
    }
    canStack(other) {
        return other.id === this.id && this.currentStacks < this.maxStacks;
    }
}
exports.PoisonEffect = PoisonEffect;
class BurnEffect {
    constructor(duration, damagePerSecond) {
        this.id = 'burn';
        this.name = 'Burn';
        this.stackable = true;
        this.maxStacks = 3;
        this.currentStacks = 1;
        this.duration = duration;
        this.remainingTime = duration;
        this.damagePerSecond = damagePerSecond;
    }
    onApply(target) {
        console.log(`${target.id} is burning!`);
    }
    onUpdate(target, deltaTime) {
        this.remainingTime -= deltaTime;
        const health = target.getComponent(EntityComponentSystem_1.HealthComponent);
        if (health) {
            const damage = this.damagePerSecond * this.currentStacks * deltaTime;
            health.takeDamage(damage, 'fire');
        }
    }
    onRemove(target) {
        console.log(`${target.id} stops burning.`);
    }
    canStack(other) {
        return other.id === this.id && this.currentStacks < this.maxStacks;
    }
}
exports.BurnEffect = BurnEffect;
class FreezeEffect {
    constructor(duration) {
        this.id = 'freeze';
        this.name = 'Freeze';
        this.stackable = false;
        this.maxStacks = 1;
        this.currentStacks = 1;
        this.originalSpeed = 0;
        this.duration = duration;
        this.remainingTime = duration;
    }
    onApply(target) {
        // Store original speed and reduce movement
        // Implementation would depend on movement component
        console.log(`${target.id} is frozen!`);
    }
    onUpdate(target, deltaTime) {
        this.remainingTime -= deltaTime;
    }
    onRemove(target) {
        // Restore original speed
        console.log(`${target.id} thaws out.`);
    }
    canStack(other) {
        return false;
    }
}
exports.FreezeEffect = FreezeEffect;
// Status Effect Manager
class StatusEffectManager {
    constructor() {
        this.effects = new Map();
    }
    applyEffect(target, effect) {
        const targetId = target.id;
        if (!this.effects.has(targetId)) {
            this.effects.set(targetId, []);
        }
        const targetEffects = this.effects.get(targetId);
        // Check for stacking
        const existingEffect = targetEffects.find(e => e.id === effect.id);
        if (existingEffect && existingEffect.canStack(effect)) {
            existingEffect.currentStacks++;
            existingEffect.remainingTime = Math.max(existingEffect.remainingTime, effect.duration);
        }
        else if (!existingEffect) {
            targetEffects.push(effect);
            effect.onApply(target);
        }
    }
    removeEffect(target, effectId) {
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
    update(deltaTime, entityManager) {
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
    getEffects(target) {
        return this.effects.get(target.id) || [];
    }
    hasEffect(target, effectId) {
        const effects = this.getEffects(target);
        return effects.some(e => e.id === effectId);
    }
    clearEffects(target) {
        const effects = this.effects.get(target.id);
        if (effects) {
            effects.forEach(effect => effect.onRemove(target));
            this.effects.delete(target.id);
        }
    }
}
exports.StatusEffectManager = StatusEffectManager;
// Combo System
class ComboSystem {
    constructor() {
        this.comboCounter = new Map();
        this.comboTimer = new Map();
        this.comboWindow = 3.0; // 3 seconds to continue combo
        this.maxCombo = 50;
    }
    registerHit(entityId, damage) {
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
    calculateComboMultiplier(combo) {
        if (combo <= 5)
            return 1.0;
        if (combo <= 10)
            return 1.1;
        if (combo <= 20)
            return 1.25;
        if (combo <= 30)
            return 1.5;
        if (combo <= 40)
            return 1.75;
        return 2.0; // Max multiplier at 40+ combo
    }
    triggerComboEvent(entityId, combo, damage) {
        if (combo % 10 === 0) {
            console.log(`${entityId} achieved ${combo} hit combo! Damage: ${damage}`);
        }
    }
    update(deltaTime) {
        this.comboTimer.forEach((time, entityId) => {
            const newTime = time - deltaTime;
            if (newTime <= 0) {
                // Combo expired
                this.comboCounter.delete(entityId);
                this.comboTimer.delete(entityId);
                this.triggerComboBreak(entityId);
            }
            else {
                this.comboTimer.set(entityId, newTime);
            }
        });
    }
    triggerComboBreak(entityId) {
        const finalCombo = this.comboCounter.get(entityId) || 0;
        if (finalCombo > 0) {
            console.log(`${entityId} combo broken at ${finalCombo} hits`);
        }
    }
    getCombo(entityId) {
        return this.comboCounter.get(entityId) || 0;
    }
    resetCombo(entityId) {
        this.comboCounter.delete(entityId);
        this.comboTimer.delete(entityId);
    }
}
exports.ComboSystem = ComboSystem;
// Weapon Manager
class WeaponManager {
    constructor() {
        this.weapons = new Map();
        this.initializeDefaultWeapons();
    }
    initializeDefaultWeapons() {
        this.addWeapon(this.createAssaultRifle());
        this.addWeapon(this.createSniperRifle());
        this.addWeapon(this.createShotgun());
        this.addWeapon(this.createSword());
        this.addWeapon(this.createStaff());
    }
    createAssaultRifle() {
        return {
            id: 'assault_rifle_basic',
            name: 'Basic Assault Rifle',
            type: game_1.WeaponType.AssaultRifle,
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
    createSniperRifle() {
        return {
            id: 'sniper_rifle_basic',
            name: 'Basic Sniper Rifle',
            type: game_1.WeaponType.SniperRifle,
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
    createShotgun() {
        return {
            id: 'shotgun_basic',
            name: 'Basic Shotgun',
            type: game_1.WeaponType.Shotgun,
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
    createSword() {
        return {
            id: 'iron_sword',
            name: 'Iron Sword',
            type: game_1.WeaponType.Sword,
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
    createStaff() {
        return {
            id: 'fire_staff',
            name: 'Fire Staff',
            type: game_1.WeaponType.Staff,
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
    addWeapon(weapon) {
        this.weapons.set(weapon.id, weapon);
    }
    getWeapon(id) {
        return this.weapons.get(id);
    }
    getAllWeapons() {
        return Array.from(this.weapons.values());
    }
    getWeaponsByType(type) {
        return this.getAllWeapons().filter(weapon => weapon.type === type);
    }
}
exports.WeaponManager = WeaponManager;
// Advanced Combat System
class AdvancedCombatSystem {
    constructor() {
        this.statusEffectManager = new StatusEffectManager();
        this.comboSystem = new ComboSystem();
        this.weaponManager = new WeaponManager();
    }
    calculateDamage(weapon, attacker, target) {
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
    dealDamage(attacker, target, weapon) {
        const damage = this.calculateDamage(weapon, attacker, target);
        const targetHealth = target.getComponent(EntityComponentSystem_1.HealthComponent);
        if (targetHealth) {
            targetHealth.takeDamage(damage, weapon.type.toString(), attacker);
        }
        // Apply weapon effects
        this.applyWeaponEffects(weapon, attacker, target);
        console.log(`${attacker.id} deals ${damage} damage to ${target.id} with ${weapon.name}`);
    }
    applyWeaponEffects(weapon, attacker, target) {
        weapon.effects
            .filter(effect => effect.type === 'onHit')
            .forEach(effect => {
            if (Math.random() < effect.chance) {
                if (effect.effect instanceof Object && 'id' in effect.effect) {
                    // It's a status effect
                    this.statusEffectManager.applyEffect(target, effect.effect);
                }
            }
        });
    }
    triggerCriticalHit(attacker) {
        console.log(`${attacker.id} scores a critical hit!`);
        // Could trigger visual/audio effects, screen shake, etc.
    }
    createExplosion(center, radius, damage, attacker, entityManager) {
        // Find all entities within explosion radius
        const entities = entityManager.getAllEntities();
        entities.forEach((entity) => {
            const transform = entity.getComponent(EntityComponentSystem_1.TransformComponent);
            if (!transform)
                return;
            const distance = Math.sqrt(Math.pow(transform.position.x - center.x, 2) +
                Math.pow(transform.position.y - center.y, 2));
            if (distance <= radius && entity !== attacker) {
                // Calculate damage falloff with distance
                const damageFalloff = 1 - (distance / radius);
                const finalDamage = damage * damageFalloff;
                const health = entity.getComponent(EntityComponentSystem_1.HealthComponent);
                if (health) {
                    health.takeDamage(finalDamage, 'explosion', attacker);
                }
            }
        });
        console.log(`Explosion at (${center.x}, ${center.y}) with radius ${radius} and damage ${damage}`);
    }
    update(deltaTime, entityManager) {
        this.statusEffectManager.update(deltaTime, entityManager);
        this.comboSystem.update(deltaTime);
    }
    getStatusEffectManager() {
        return this.statusEffectManager;
    }
    getComboSystem() {
        return this.comboSystem;
    }
    getWeaponManager() {
        return this.weaponManager;
    }
    // Utility methods for weapon handling
    calculateRecoil(weapon) {
        const baseRecoil = weapon.stats.recoil;
        const variation = (Math.random() - 0.5) * 0.2;
        const modifiedRecoil = baseRecoil * (1 + variation);
        return {
            x: (Math.random() - 0.5) * modifiedRecoil,
            y: -Math.abs(modifiedRecoil) * 0.7 // Upward recoil
        };
    }
    calculateSpread(weapon) {
        const baseAccuracy = weapon.stats.accuracy;
        return (1.0 - baseAccuracy) * Math.PI * 0.1; // Max 18 degrees spread
    }
    isInRange(attacker, target, weapon) {
        const attackerTransform = attacker.getComponent(EntityComponentSystem_1.TransformComponent);
        const targetTransform = target.getComponent(EntityComponentSystem_1.TransformComponent);
        if (!attackerTransform || !targetTransform)
            return false;
        const distance = Math.sqrt(Math.pow(targetTransform.position.x - attackerTransform.position.x, 2) +
            Math.pow(targetTransform.position.y - attackerTransform.position.y, 2));
        return distance <= weapon.stats.range;
    }
}
exports.AdvancedCombatSystem = AdvancedCombatSystem;

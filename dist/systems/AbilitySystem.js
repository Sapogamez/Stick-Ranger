"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbilityComponent = exports.AbilitySystem = exports.CooldownManager = exports.AbilityImpl = exports.ResourceComponent = void 0;
const game_1 = require("../types/game");
const EntityComponentSystem_1 = require("./EntityComponentSystem");
/**
 * Ability System
 *
 * Manages abilities, resources, cooldowns, and casting mechanics.
 * Supports complex targeting, resource costs, and effect combinations.
 */
// Resource Component for managing mana, stamina, etc.
class ResourceComponent {
    constructor() {
        this.resources = new Map();
        // Initialize default resources
        this.addResource(game_1.ResourceType.Mana, 100, 5);
        this.addResource(game_1.ResourceType.Stamina, 100, 10);
        this.addResource(game_1.ResourceType.Health, 100, 1);
    }
    init() {
        // Initialize resource component
    }
    update(deltaTime) {
        this.resources.forEach(resource => {
            if (resource.current < resource.maximum && resource.regenerationRate > 0) {
                const regeneration = resource.regenerationRate * deltaTime;
                resource.current = Math.min(resource.maximum, resource.current + regeneration);
            }
        });
    }
    addResource(type, maximum, regenerationRate) {
        this.resources.set(type, {
            type,
            current: maximum,
            maximum,
            regenerationRate
        });
    }
    getResource(type) {
        return this.resources.get(type);
    }
    consumeResource(type, amount) {
        const resource = this.resources.get(type);
        if (!resource || resource.current < amount) {
            return false;
        }
        resource.current = Math.max(0, resource.current - amount);
        return true;
    }
    restoreResource(type, amount) {
        const resource = this.resources.get(type);
        if (resource) {
            resource.current = Math.min(resource.maximum, resource.current + amount);
        }
    }
    hasResource(type, amount) {
        const resource = this.resources.get(type);
        return resource ? resource.current >= amount : false;
    }
    getAllResources() {
        return Array.from(this.resources.values());
    }
    setMaximum(type, newMaximum) {
        const resource = this.resources.get(type);
        if (resource) {
            const ratio = resource.current / resource.maximum;
            resource.maximum = newMaximum;
            resource.current = Math.min(newMaximum, resource.maximum * ratio);
        }
    }
}
exports.ResourceComponent = ResourceComponent;
// Ability Implementation
class AbilityImpl {
    constructor(id, name, description, cooldown, castTime = 0, range = 0, targets = game_1.TargetType.Self) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.cooldown = cooldown;
        this.castTime = castTime;
        this.range = range;
        this.targets = targets;
        this.costs = new Map();
        this.effects = [];
    }
    addCost(resourceType, amount) {
        this.costs.set(resourceType, amount);
        return this;
    }
    addEffect(effect) {
        this.effects.push(effect);
        return this;
    }
    canUse(user) {
        // Check if user has required components
        const resources = user.getComponent(ResourceComponent);
        if (!resources)
            return false;
        // Check resource costs
        for (const [type, cost] of this.costs) {
            if (!resources.hasResource(type, cost)) {
                return false;
            }
        }
        // Additional checks can be added here (health requirements, etc.)
        return true;
    }
    execute(user, target) {
        if (!this.canUse(user))
            return false;
        // Validate target
        if (!this.isValidTarget(user, target))
            return false;
        // Consume resources
        const resources = user.getComponent(ResourceComponent);
        if (resources) {
            for (const [type, cost] of this.costs) {
                if (!resources.consumeResource(type, cost)) {
                    return false; // Shouldn't happen if canUse was checked
                }
            }
        }
        // Apply effects
        this.applyEffects(user, target);
        console.log(`${user.id} used ability: ${this.name}`);
        return true;
    }
    isValidTarget(user, target) {
        switch (this.targets) {
            case game_1.TargetType.Self:
                return target === undefined || target === user;
            case game_1.TargetType.Enemy:
            case game_1.TargetType.Ally:
                return target !== undefined && typeof target === 'object' && 'id' in target;
            case game_1.TargetType.Ground:
            case game_1.TargetType.Direction:
                return target !== undefined && typeof target === 'object' && 'x' in target && 'y' in target;
            case game_1.TargetType.Area:
                return target !== undefined;
            default:
                return false;
        }
    }
    applyEffects(user, target) {
        this.effects.forEach(effect => {
            switch (effect.type) {
                case 'damage':
                    this.applyDamage(user, target, effect.value);
                    break;
                case 'heal':
                    this.applyHeal(user, target, effect.value);
                    break;
                case 'statusEffect':
                    if (effect.statusEffect && target && typeof target === 'object' && 'id' in target) {
                        // Apply status effect (would need status effect manager)
                        console.log(`Applied ${effect.statusEffect.name} to ${target.id}`);
                    }
                    break;
                case 'teleport':
                    this.applyTeleport(user, target);
                    break;
                case 'summon':
                    this.applySummon(user, target, effect.value);
                    break;
            }
        });
    }
    applyDamage(user, target, damage) {
        if (!target || !damage || typeof target !== 'object' || !('id' in target))
            return;
        const targetEntity = target;
        const health = targetEntity.getComponent(EntityComponentSystem_1.HealthComponent);
        if (health) {
            health.takeDamage(damage, 'ability', user);
        }
    }
    applyHeal(user, target, healing) {
        if (!healing)
            return;
        let targetEntity;
        if (!target || target === user) {
            targetEntity = user;
        }
        else if (typeof target === 'object' && 'id' in target) {
            targetEntity = target;
        }
        else {
            return;
        }
        const health = targetEntity.getComponent(EntityComponentSystem_1.HealthComponent);
        if (health) {
            health.heal(healing);
        }
    }
    applyTeleport(user, target) {
        if (!target || typeof target !== 'object' || !('x' in target && 'y' in target))
            return;
        const transform = user.getComponent(EntityComponentSystem_1.TransformComponent);
        if (transform) {
            transform.position = { x: target.x, y: target.y };
        }
    }
    applySummon(user, target, count) {
        // Implementation would depend on entity spawning system
        console.log(`${user.id} summons ${count || 1} entities`);
    }
}
exports.AbilityImpl = AbilityImpl;
// Cooldown Manager
class CooldownManager {
    constructor() {
        this.cooldowns = new Map(); // entityId -> abilityId -> remainingTime
    }
    startCooldown(entityId, abilityId, duration) {
        if (!this.cooldowns.has(entityId)) {
            this.cooldowns.set(entityId, new Map());
        }
        this.cooldowns.get(entityId).set(abilityId, duration);
    }
    isOnCooldown(entityId, abilityId) {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (!entityCooldowns)
            return false;
        const remainingTime = entityCooldowns.get(abilityId) || 0;
        return remainingTime > 0;
    }
    getCooldownRemaining(entityId, abilityId) {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (!entityCooldowns)
            return 0;
        return entityCooldowns.get(abilityId) || 0;
    }
    reduceCooldown(entityId, abilityId, reduction) {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (!entityCooldowns)
            return;
        const currentCooldown = entityCooldowns.get(abilityId) || 0;
        const newCooldown = Math.max(0, currentCooldown - reduction);
        if (newCooldown <= 0) {
            entityCooldowns.delete(abilityId);
        }
        else {
            entityCooldowns.set(abilityId, newCooldown);
        }
    }
    resetCooldown(entityId, abilityId) {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (entityCooldowns) {
            entityCooldowns.delete(abilityId);
        }
    }
    resetAllCooldowns(entityId) {
        this.cooldowns.delete(entityId);
    }
    update(deltaTime) {
        this.cooldowns.forEach((entityCooldowns, entityId) => {
            entityCooldowns.forEach((time, abilityId) => {
                const newTime = time - deltaTime;
                if (newTime <= 0) {
                    entityCooldowns.delete(abilityId);
                }
                else {
                    entityCooldowns.set(abilityId, newTime);
                }
            });
        });
    }
    getAllCooldowns(entityId) {
        return this.cooldowns.get(entityId) || new Map();
    }
}
exports.CooldownManager = CooldownManager;
// Main Ability System
class AbilitySystem {
    constructor() {
        this.abilities = new Map();
        this.cooldownManager = new CooldownManager();
        this.castingState = new Map(); // entityId -> current cast
        this.initializeDefaultAbilities();
    }
    initializeDefaultAbilities() {
        // Create some default abilities
        this.addAbility(this.createFireballAbility());
        this.addAbility(this.createHealAbility());
        this.addAbility(this.createChargeAbility());
        this.addAbility(this.createTeleportAbility());
        this.addAbility(this.createShieldAbility());
    }
    addAbility(ability) {
        this.abilities.set(ability.id, ability);
    }
    getAbility(id) {
        return this.abilities.get(id);
    }
    useAbility(abilityId, user, target) {
        const ability = this.abilities.get(abilityId);
        if (!ability) {
            console.warn(`Ability ${abilityId} not found`);
            return false;
        }
        // Check cooldown
        if (this.cooldownManager.isOnCooldown(user.id, abilityId)) {
            console.log(`Ability ${ability.name} is on cooldown`);
            return false;
        }
        // Check if already casting
        if (this.isCasting(user.id)) {
            console.log(`${user.id} is already casting an ability`);
            return false;
        }
        // Check ability requirements
        if (!ability.canUse(user)) {
            console.log(`Cannot use ability ${ability.name} - requirements not met`);
            return false;
        }
        // Start casting or execute immediately
        if (ability.castTime > 0) {
            this.startCasting(user, ability, target);
            return true;
        }
        else {
            return this.executeAbility(ability, user, target);
        }
    }
    startCasting(user, ability, target) {
        const cast = {
            ability,
            user,
            target,
            remainingTime: ability.castTime,
            interrupted: false,
            startTime: Date.now()
        };
        this.castingState.set(user.id, cast);
        console.log(`${user.id} begins casting ${ability.name} (${ability.castTime}s)`);
    }
    executeAbility(ability, user, target) {
        const success = ability.execute(user, target);
        if (success) {
            // Start cooldown
            this.cooldownManager.startCooldown(user.id, ability.id, ability.cooldown);
        }
        return success;
    }
    interruptCast(entityId) {
        const cast = this.castingState.get(entityId);
        if (cast) {
            cast.interrupted = true;
            this.castingState.delete(entityId);
            console.log(`${entityId} casting interrupted`);
            return true;
        }
        return false;
    }
    isCasting(entityId) {
        return this.castingState.has(entityId);
    }
    getCastProgress(entityId) {
        const cast = this.castingState.get(entityId);
        if (!cast)
            return 0;
        const elapsed = cast.ability.castTime - cast.remainingTime;
        return elapsed / cast.ability.castTime;
    }
    getCurrentCast(entityId) {
        return this.castingState.get(entityId);
    }
    update(deltaTime) {
        // Update cooldowns
        this.cooldownManager.update(deltaTime);
        // Update resource regeneration
        // This would be handled by a ResourceSystem if entities had ResourceComponents
        // Update casting
        this.updateCasting(deltaTime);
    }
    updateCasting(deltaTime) {
        const completedCasts = [];
        this.castingState.forEach((cast, entityId) => {
            if (cast.interrupted) {
                completedCasts.push(entityId);
                return;
            }
            cast.remainingTime -= deltaTime;
            if (cast.remainingTime <= 0) {
                // Casting complete
                this.executeAbility(cast.ability, cast.user, cast.target);
                completedCasts.push(entityId);
            }
        });
        // Remove completed casts
        completedCasts.forEach(entityId => {
            this.castingState.delete(entityId);
        });
    }
    getCooldownManager() {
        return this.cooldownManager;
    }
    getAllAbilities() {
        return Array.from(this.abilities.values());
    }
    // Predefined ability creators
    createFireballAbility() {
        return new AbilityImpl('fireball', 'Fireball', 'Launches a fiery projectile', 5.0, 1.5, 200, game_1.TargetType.Ground)
            .addCost(game_1.ResourceType.Mana, 30)
            .addEffect({ type: 'damage', value: 75 });
    }
    createHealAbility() {
        return new AbilityImpl('heal', 'Heal', 'Restores health to target ally', 3.0, 2.0, 100, game_1.TargetType.Ally)
            .addCost(game_1.ResourceType.Mana, 20)
            .addEffect({ type: 'heal', value: 50 });
    }
    createChargeAbility() {
        return new AbilityImpl('charge', 'Charge', 'Rush forward dealing damage', 8.0, 0.5, 150, game_1.TargetType.Direction)
            .addCost(game_1.ResourceType.Stamina, 25)
            .addEffect({ type: 'damage', value: 40 });
    }
    createTeleportAbility() {
        return new AbilityImpl('teleport', 'Teleport', 'Instantly move to target location', 12.0, 0, 300, game_1.TargetType.Ground)
            .addCost(game_1.ResourceType.Mana, 40)
            .addEffect({ type: 'teleport', value: 0 });
    }
    createShieldAbility() {
        return new AbilityImpl('shield', 'Magic Shield', 'Creates a protective barrier', 15.0, 1.0, 0, game_1.TargetType.Self)
            .addCost(game_1.ResourceType.Mana, 35)
            .addEffect({ type: 'statusEffect', value: 0 }); // Would need shield status effect
    }
}
exports.AbilitySystem = AbilitySystem;
// Ability Component for entities that can use abilities
class AbilityComponent {
    constructor(abilitySystem) {
        this.knownAbilities = new Set();
        this.abilitySystem = abilitySystem;
    }
    learnAbility(abilityId) {
        this.knownAbilities.add(abilityId);
    }
    forgetAbility(abilityId) {
        this.knownAbilities.delete(abilityId);
    }
    hasAbility(abilityId) {
        return this.knownAbilities.has(abilityId);
    }
    getKnownAbilities() {
        return Array.from(this.knownAbilities);
    }
    useAbility(abilityId, user, target) {
        if (!this.hasAbility(abilityId)) {
            console.log(`${user.id} doesn't know ability ${abilityId}`);
            return false;
        }
        return this.abilitySystem.useAbility(abilityId, user, target);
    }
    getAbilityInfo(abilityId) {
        if (!this.hasAbility(abilityId))
            return undefined;
        return this.abilitySystem.getAbility(abilityId);
    }
    isOnCooldown(abilityId, userId) {
        return this.abilitySystem.getCooldownManager().isOnCooldown(userId, abilityId);
    }
    getCooldownRemaining(abilityId, userId) {
        return this.abilitySystem.getCooldownManager().getCooldownRemaining(userId, abilityId);
    }
}
exports.AbilityComponent = AbilityComponent;

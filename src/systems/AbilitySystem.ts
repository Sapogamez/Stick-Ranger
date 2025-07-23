import { 
    Ability, TargetType, AbilityEffect, Resource, ResourceType, Vector2, Component
} from '../types/game';
import { Entity, HealthComponent, TransformComponent } from './EntityComponentSystem';

/**
 * Ability System
 * 
 * Manages abilities, resources, cooldowns, and casting mechanics.
 * Supports complex targeting, resource costs, and effect combinations.
 */

// Resource Component for managing mana, stamina, etc.
export class ResourceComponent implements Component {
    entity!: Entity;
    private resources: Map<ResourceType, Resource> = new Map();
    
    constructor() {
        // Initialize default resources
        this.addResource(ResourceType.Mana, 100, 5);
        this.addResource(ResourceType.Stamina, 100, 10);
        this.addResource(ResourceType.Health, 100, 1);
    }
    
    init(): void {
        // Initialize resource component
    }
    
    update(deltaTime: number): void {
        this.resources.forEach(resource => {
            if (resource.current < resource.maximum && resource.regenerationRate > 0) {
                const regeneration = resource.regenerationRate * deltaTime;
                resource.current = Math.min(resource.maximum, resource.current + regeneration);
            }
        });
    }
    
    addResource(type: ResourceType, maximum: number, regenerationRate: number): void {
        this.resources.set(type, {
            type,
            current: maximum,
            maximum,
            regenerationRate
        });
    }
    
    getResource(type: ResourceType): Resource | undefined {
        return this.resources.get(type);
    }
    
    consumeResource(type: ResourceType, amount: number): boolean {
        const resource = this.resources.get(type);
        if (!resource || resource.current < amount) {
            return false;
        }
        
        resource.current = Math.max(0, resource.current - amount);
        return true;
    }
    
    restoreResource(type: ResourceType, amount: number): void {
        const resource = this.resources.get(type);
        if (resource) {
            resource.current = Math.min(resource.maximum, resource.current + amount);
        }
    }
    
    hasResource(type: ResourceType, amount: number): boolean {
        const resource = this.resources.get(type);
        return resource ? resource.current >= amount : false;
    }
    
    getAllResources(): Resource[] {
        return Array.from(this.resources.values());
    }
    
    setMaximum(type: ResourceType, newMaximum: number): void {
        const resource = this.resources.get(type);
        if (resource) {
            const ratio = resource.current / resource.maximum;
            resource.maximum = newMaximum;
            resource.current = Math.min(newMaximum, resource.maximum * ratio);
        }
    }
}

// Ability Cast State
interface AbilityCast {
    ability: Ability;
    user: Entity;
    target?: Entity | Vector2;
    remainingTime: number;
    interrupted: boolean;
    startTime: number;
}

// Ability Implementation
export class AbilityImpl implements Ability {
    id: string;
    name: string;
    description: string;
    cooldown: number;
    costs: Map<ResourceType, number>;
    castTime: number;
    range: number;
    targets: TargetType;
    effects: AbilityEffect[];
    
    constructor(
        id: string,
        name: string,
        description: string,
        cooldown: number,
        castTime: number = 0,
        range: number = 0,
        targets: TargetType = TargetType.Self
    ) {
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
    
    addCost(resourceType: ResourceType, amount: number): this {
        this.costs.set(resourceType, amount);
        return this;
    }
    
    addEffect(effect: AbilityEffect): this {
        this.effects.push(effect);
        return this;
    }
    
    canUse(user: Entity): boolean {
        // Check if user has required components
        const resources = user.getComponent(ResourceComponent);
        if (!resources) return false;
        
        // Check resource costs
        for (const [type, cost] of this.costs) {
            if (!resources.hasResource(type, cost)) {
                return false;
            }
        }
        
        // Additional checks can be added here (health requirements, etc.)
        return true;
    }
    
    execute(user: Entity, target?: Entity | Vector2): boolean {
        if (!this.canUse(user)) return false;
        
        // Validate target
        if (!this.isValidTarget(user, target)) return false;
        
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
    
    private isValidTarget(user: Entity, target?: Entity | Vector2): boolean {
        switch (this.targets) {
            case TargetType.Self:
                return target === undefined || target === user;
            
            case TargetType.Enemy:
            case TargetType.Ally:
                return target !== undefined && typeof target === 'object' && 'id' in target;
            
            case TargetType.Ground:
            case TargetType.Direction:
                return target !== undefined && typeof target === 'object' && 'x' in target && 'y' in target;
            
            case TargetType.Area:
                return target !== undefined;
            
            default:
                return false;
        }
    }
    
    private applyEffects(user: Entity, target?: Entity | Vector2): void {
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
                        console.log(`Applied ${effect.statusEffect.name} to ${(target as Entity).id}`);
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
    
    private applyDamage(user: Entity, target?: Entity | Vector2, damage?: number): void {
        if (!target || !damage || typeof target !== 'object' || !('id' in target)) return;
        
        const targetEntity = target as Entity;
        const health = targetEntity.getComponent(HealthComponent);
        if (health) {
            health.takeDamage(damage, 'ability', user);
        }
    }
    
    private applyHeal(user: Entity, target?: Entity | Vector2, healing?: number): void {
        if (!healing) return;
        
        let targetEntity: Entity;
        
        if (!target || target === user) {
            targetEntity = user;
        } else if (typeof target === 'object' && 'id' in target) {
            targetEntity = target as Entity;
        } else {
            return;
        }
        
        const health = targetEntity.getComponent(HealthComponent);
        if (health) {
            health.heal(healing);
        }
    }
    
    private applyTeleport(user: Entity, target?: Entity | Vector2): void {
        if (!target || typeof target !== 'object' || !('x' in target && 'y' in target)) return;
        
        const transform = user.getComponent(TransformComponent);
        if (transform) {
            transform.position = { x: (target as Vector2).x, y: (target as Vector2).y };
        }
    }
    
    private applySummon(user: Entity, target?: Entity | Vector2, count?: number): void {
        // Implementation would depend on entity spawning system
        console.log(`${user.id} summons ${count || 1} entities`);
    }
}

// Cooldown Manager
export class CooldownManager {
    private cooldowns: Map<string, Map<string, number>> = new Map(); // entityId -> abilityId -> remainingTime
    
    startCooldown(entityId: string, abilityId: string, duration: number): void {
        if (!this.cooldowns.has(entityId)) {
            this.cooldowns.set(entityId, new Map());
        }
        this.cooldowns.get(entityId)!.set(abilityId, duration);
    }
    
    isOnCooldown(entityId: string, abilityId: string): boolean {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (!entityCooldowns) return false;
        
        const remainingTime = entityCooldowns.get(abilityId) || 0;
        return remainingTime > 0;
    }
    
    getCooldownRemaining(entityId: string, abilityId: string): number {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (!entityCooldowns) return 0;
        
        return entityCooldowns.get(abilityId) || 0;
    }
    
    reduceCooldown(entityId: string, abilityId: string, reduction: number): void {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (!entityCooldowns) return;
        
        const currentCooldown = entityCooldowns.get(abilityId) || 0;
        const newCooldown = Math.max(0, currentCooldown - reduction);
        
        if (newCooldown <= 0) {
            entityCooldowns.delete(abilityId);
        } else {
            entityCooldowns.set(abilityId, newCooldown);
        }
    }
    
    resetCooldown(entityId: string, abilityId: string): void {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (entityCooldowns) {
            entityCooldowns.delete(abilityId);
        }
    }
    
    resetAllCooldowns(entityId: string): void {
        this.cooldowns.delete(entityId);
    }
    
    update(deltaTime: number): void {
        this.cooldowns.forEach((entityCooldowns, entityId) => {
            entityCooldowns.forEach((time, abilityId) => {
                const newTime = time - deltaTime;
                if (newTime <= 0) {
                    entityCooldowns.delete(abilityId);
                } else {
                    entityCooldowns.set(abilityId, newTime);
                }
            });
        });
    }
    
    getAllCooldowns(entityId: string): Map<string, number> {
        return this.cooldowns.get(entityId) || new Map();
    }
}

// Main Ability System
export class AbilitySystem {
    private abilities: Map<string, Ability> = new Map();
    private cooldownManager: CooldownManager = new CooldownManager();
    private castingState: Map<string, AbilityCast> = new Map(); // entityId -> current cast
    
    constructor() {
        this.initializeDefaultAbilities();
    }
    
    private initializeDefaultAbilities(): void {
        // Create some default abilities
        this.addAbility(this.createFireballAbility());
        this.addAbility(this.createHealAbility());
        this.addAbility(this.createChargeAbility());
        this.addAbility(this.createTeleportAbility());
        this.addAbility(this.createShieldAbility());
    }
    
    addAbility(ability: Ability): void {
        this.abilities.set(ability.id, ability);
    }
    
    getAbility(id: string): Ability | undefined {
        return this.abilities.get(id);
    }
    
    useAbility(abilityId: string, user: Entity, target?: Entity | Vector2): boolean {
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
        } else {
            return this.executeAbility(ability, user, target);
        }
    }
    
    private startCasting(user: Entity, ability: Ability, target?: Entity | Vector2): void {
        const cast: AbilityCast = {
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
    
    private executeAbility(ability: Ability, user: Entity, target?: Entity | Vector2): boolean {
        const success = ability.execute(user, target);
        
        if (success) {
            // Start cooldown
            this.cooldownManager.startCooldown(user.id, ability.id, ability.cooldown);
        }
        
        return success;
    }
    
    interruptCast(entityId: string): boolean {
        const cast = this.castingState.get(entityId);
        if (cast) {
            cast.interrupted = true;
            this.castingState.delete(entityId);
            console.log(`${entityId} casting interrupted`);
            return true;
        }
        return false;
    }
    
    isCasting(entityId: string): boolean {
        return this.castingState.has(entityId);
    }
    
    getCastProgress(entityId: string): number {
        const cast = this.castingState.get(entityId);
        if (!cast) return 0;
        
        const elapsed = cast.ability.castTime - cast.remainingTime;
        return elapsed / cast.ability.castTime;
    }
    
    getCurrentCast(entityId: string): AbilityCast | undefined {
        return this.castingState.get(entityId);
    }
    
    update(deltaTime: number): void {
        // Update cooldowns
        this.cooldownManager.update(deltaTime);
        
        // Update resource regeneration
        // This would be handled by a ResourceSystem if entities had ResourceComponents
        
        // Update casting
        this.updateCasting(deltaTime);
    }
    
    private updateCasting(deltaTime: number): void {
        const completedCasts: string[] = [];
        
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
    
    getCooldownManager(): CooldownManager {
        return this.cooldownManager;
    }
    
    getAllAbilities(): Ability[] {
        return Array.from(this.abilities.values());
    }
    
    // Predefined ability creators
    private createFireballAbility(): Ability {
        return new AbilityImpl('fireball', 'Fireball', 'Launches a fiery projectile', 5.0, 1.5, 200, TargetType.Ground)
            .addCost(ResourceType.Mana, 30)
            .addEffect({ type: 'damage', value: 75 });
    }
    
    private createHealAbility(): Ability {
        return new AbilityImpl('heal', 'Heal', 'Restores health to target ally', 3.0, 2.0, 100, TargetType.Ally)
            .addCost(ResourceType.Mana, 20)
            .addEffect({ type: 'heal', value: 50 });
    }
    
    private createChargeAbility(): Ability {
        return new AbilityImpl('charge', 'Charge', 'Rush forward dealing damage', 8.0, 0.5, 150, TargetType.Direction)
            .addCost(ResourceType.Stamina, 25)
            .addEffect({ type: 'damage', value: 40 });
    }
    
    private createTeleportAbility(): Ability {
        return new AbilityImpl('teleport', 'Teleport', 'Instantly move to target location', 12.0, 0, 300, TargetType.Ground)
            .addCost(ResourceType.Mana, 40)
            .addEffect({ type: 'teleport', value: 0 });
    }
    
    private createShieldAbility(): Ability {
        return new AbilityImpl('shield', 'Magic Shield', 'Creates a protective barrier', 15.0, 1.0, 0, TargetType.Self)
            .addCost(ResourceType.Mana, 35)
            .addEffect({ type: 'statusEffect', value: 0 }); // Would need shield status effect
    }
}

// Ability Component for entities that can use abilities
export class AbilityComponent {
    private knownAbilities: Set<string> = new Set();
    private abilitySystem: AbilitySystem;
    
    constructor(abilitySystem: AbilitySystem) {
        this.abilitySystem = abilitySystem;
    }
    
    learnAbility(abilityId: string): void {
        this.knownAbilities.add(abilityId);
    }
    
    forgetAbility(abilityId: string): void {
        this.knownAbilities.delete(abilityId);
    }
    
    hasAbility(abilityId: string): boolean {
        return this.knownAbilities.has(abilityId);
    }
    
    getKnownAbilities(): string[] {
        return Array.from(this.knownAbilities);
    }
    
    useAbility(abilityId: string, user: Entity, target?: Entity | Vector2): boolean {
        if (!this.hasAbility(abilityId)) {
            console.log(`${user.id} doesn't know ability ${abilityId}`);
            return false;
        }
        
        return this.abilitySystem.useAbility(abilityId, user, target);
    }
    
    getAbilityInfo(abilityId: string): Ability | undefined {
        if (!this.hasAbility(abilityId)) return undefined;
        return this.abilitySystem.getAbility(abilityId);
    }
    
    isOnCooldown(abilityId: string, userId: string): boolean {
        return this.abilitySystem.getCooldownManager().isOnCooldown(userId, abilityId);
    }
    
    getCooldownRemaining(abilityId: string, userId: string): number {
        return this.abilitySystem.getCooldownManager().getCooldownRemaining(userId, abilityId);
    }
}
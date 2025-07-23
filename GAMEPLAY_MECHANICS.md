# Gameplay Mechanics

This document outlines the advanced combat systems, ability mechanics, and gameplay features in Stick Ranger.

## Advanced Combat System

### Status Effects System

```typescript
// Status effect base interface
interface StatusEffect {
    id: string;
    name: string;
    duration: number;
    remainingTime: number;
    stackable: boolean;
    maxStacks: number;
    currentStacks: number;
    
    onApply(target: Entity): void;
    onUpdate(target: Entity, deltaTime: number): void;
    onRemove(target: Entity): void;
    canStack(other: StatusEffect): boolean;
}

// Example status effects
class PoisonEffect implements StatusEffect {
    id = 'poison';
    name = 'Poison';
    duration: number;
    remainingTime: number;
    stackable = true;
    maxStacks = 5;
    currentStacks = 1;
    
    private damagePerSecond: number;
    private damageInterval = 1.0; // Damage every second
    private lastDamageTime = 0;
    
    constructor(duration: number, damagePerSecond: number) {
        this.duration = duration;
        this.remainingTime = duration;
        this.damagePerSecond = damagePerSecond;
    }
    
    onApply(target: Entity): void {
        console.log(`${target} is now poisoned!`);
        // Apply visual effects, sound, etc.
    }
    
    onUpdate(target: Entity, deltaTime: number): void {
        this.remainingTime -= deltaTime;
        this.lastDamageTime += deltaTime;
        
        if (this.lastDamageTime >= this.damageInterval) {
            const health = target.getComponent(HealthComponent);
            if (health) {
                const totalDamage = this.damagePerSecond * this.currentStacks;
                health.takeDamage(totalDamage);
                this.lastDamageTime = 0;
            }
        }
    }
    
    onRemove(target: Entity): void {
        console.log(`${target} recovers from poison.`);
    }
    
    canStack(other: StatusEffect): boolean {
        return other.id === this.id && this.currentStacks < this.maxStacks;
    }
}

class FreezeEffect implements StatusEffect {
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
        // Store original speed and set to 0
        const stats = target.getComponent(PlayerStats);
        if (stats) {
            this.originalSpeed = stats.spd;
            stats.spd = 0;
        }
    }
    
    onUpdate(target: Entity, deltaTime: number): void {
        this.remainingTime -= deltaTime;
    }
    
    onRemove(target: Entity): void {
        // Restore original speed
        const stats = target.getComponent(PlayerStats);
        if (stats) {
            stats.spd = this.originalSpeed;
        }
    }
    
    canStack(other: StatusEffect): boolean {
        return false; // Freeze cannot stack
    }
}

// Status effect manager
class StatusEffectManager {
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
    
    update(deltaTime: number): void {
        this.effects.forEach((effects, targetId) => {
            const target = this.findEntityById(targetId);
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
    
    private findEntityById(id: string): Entity | null {
        // Implementation to find entity by ID
        // This would typically be handled by a scene or entity manager
        return null;
    }
    
    getEffects(target: Entity): StatusEffect[] {
        return this.effects.get(target.id) || [];
    }
    
    hasEffect(target: Entity, effectId: string): boolean {
        const effects = this.getEffects(target);
        return effects.some(e => e.id === effectId);
    }
}
```

### Combo System

```typescript
// Combo system for chaining attacks
class ComboSystem {
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
        // Trigger visual effects, sounds, score events
        if (combo % 10 === 0) {
            console.log(`${entityId} achieved ${combo} hit combo!`);
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
```

### Weapon System

```typescript
// Enhanced weapon interface
interface Weapon {
    id: string;
    name: string;
    type: WeaponType;
    stats: WeaponStats;
    properties: WeaponProperties;
    effects: WeaponEffect[];
}

interface WeaponStats {
    baseDamage: number;
    criticalChance: number;
    criticalMultiplier: number;
    fireRate: number; // Attacks per second
    range: number;
    accuracy: number; // 0-1, affects spread
    recoil: number;
    magazineSize: number;
    reloadTime: number;
}

interface WeaponProperties {
    isAutomatic: boolean;
    penetration: number; // How many enemies projectile can pierce
    explosive: boolean;
    explosionRadius?: number;
    multiShot?: number; // Number of projectiles per shot
    spread?: number; // Spread angle for multi-shot
}

interface WeaponEffect {
    type: 'onHit' | 'onKill' | 'onReload' | 'passive';
    effect: StatusEffect | ((target: Entity, source: Entity) => void);
    chance: number; // 0-1, probability of triggering
}

enum WeaponType {
    AssaultRifle,
    SniperRifle,
    Shotgun,
    Pistol,
    MachineGun,
    RocketLauncher,
    Bow,
    Staff,
    Sword,
    Fist
}

// Advanced combat system implementation
class AdvancedCombatSystem extends CombatSystem {
    private statusEffectManager: StatusEffectManager;
    private comboSystem: ComboSystem;
    private weaponManager: WeaponManager;
    
    constructor() {
        super();
        this.statusEffectManager = new StatusEffectManager();
        this.comboSystem = new ComboSystem();
        this.weaponManager = new WeaponManager();
    }
    
    handleWeaponFire(weapon: Weapon, shooter: Entity, targetDirection: Vector2): void {
        const recoil = this.calculateRecoil(weapon, shooter);
        const spread = this.calculateSpread(weapon, shooter);
        const damage = this.calculateDamage(weapon, shooter);
        
        // Create projectiles based on weapon properties
        const projectileCount = weapon.properties.multiShot || 1;
        for (let i = 0; i < projectileCount; i++) {
            const spreadAngle = this.calculateSpreadAngle(spread, i, projectileCount);
            const projectileDirection = this.applySpread(targetDirection, spreadAngle);
            
            this.createProjectile(weapon, damage, projectileDirection, shooter);
        }
        
        this.applyRecoil(shooter, recoil);
        this.triggerWeaponEffects(weapon, shooter, 'onFire');
    }
    
    private calculateRecoil(weapon: Weapon, shooter: Entity): Vector2 {
        const baseRecoil = weapon.stats.recoil;
        
        // Apply character stats and modifiers
        const stats = shooter.getComponent(PlayerStats);
        let modifiedRecoil = baseRecoil;
        
        if (stats) {
            // Higher strength reduces recoil
            const strengthModifier = 1.0 - (stats.def * 0.01);
            modifiedRecoil *= Math.max(0.1, strengthModifier);
        }
        
        // Add random variation
        const variation = (Math.random() - 0.5) * 0.2;
        modifiedRecoil *= (1 + variation);
        
        return {
            x: (Math.random() - 0.5) * modifiedRecoil,
            y: -Math.abs(modifiedRecoil) * 0.7 // Upward recoil
        };
    }
    
    private calculateSpread(weapon: Weapon, shooter: Entity): number {
        const baseAccuracy = weapon.stats.accuracy;
        
        // Apply character stats
        const stats = shooter.getComponent(PlayerStats);
        let finalAccuracy = baseAccuracy;
        
        if (stats) {
            // Higher speed/dexterity improves accuracy
            const dexterityModifier = 1.0 + (stats.spd * 0.005);
            finalAccuracy = Math.min(1.0, baseAccuracy * dexterityModifier);
        }
        
        // Convert accuracy to spread (inverted relationship)
        return (1.0 - finalAccuracy) * Math.PI * 0.1; // Max 18 degrees spread
    }
    
    private calculateDamage(weapon: Weapon, shooter: Entity): number {
        let damage = weapon.stats.baseDamage;
        
        // Apply character stats
        const stats = shooter.getComponent(PlayerStats);
        if (stats) {
            damage += stats.atk * 0.5; // Attack stat adds to damage
        }
        
        // Check for critical hit
        if (Math.random() < weapon.stats.criticalChance) {
            damage *= weapon.stats.criticalMultiplier;
            this.triggerCriticalHit(shooter);
        }
        
        // Add random variation (±10%)
        const variation = (Math.random() - 0.5) * 0.2;
        damage *= (1 + variation);
        
        return Math.floor(damage);
    }
    
    private calculateSpreadAngle(spread: number, index: number, total: number): number {
        if (total === 1) return 0;
        
        // Distribute shots evenly across spread angle
        const step = spread / (total - 1);
        return -spread * 0.5 + (step * index);
    }
    
    private applySpread(direction: Vector2, spreadAngle: number): Vector2 {
        const cos = Math.cos(spreadAngle);
        const sin = Math.sin(spreadAngle);
        
        return {
            x: direction.x * cos - direction.y * sin,
            y: direction.x * sin + direction.y * cos
        };
    }
    
    private createProjectile(weapon: Weapon, damage: number, direction: Vector2, shooter: Entity): void {
        // Create projectile entity with physics and collision components
        const projectile = new Entity(`projectile_${Date.now()}`);
        
        // Add components
        const transform = new TransformComponent();
        const shooterTransform = shooter.getComponent(TransformComponent);
        if (shooterTransform) {
            transform.position = { ...shooterTransform.position };
        }
        
        const physics = new ProjectilePhysics(direction, weapon.stats.range);
        const collision = new ProjectileCollision(damage, weapon, shooter);
        
        projectile.addComponent(transform);
        projectile.addComponent(physics);
        projectile.addComponent(collision);
    }
    
    private applyRecoil(shooter: Entity, recoil: Vector2): void {
        // Apply recoil to shooter's aim or position
        const transform = shooter.getComponent(TransformComponent);
        if (transform) {
            // In a real implementation, this might affect camera shake or aim offset
            transform.rotation += recoil.x * 0.1;
        }
    }
    
    private triggerWeaponEffects(weapon: Weapon, user: Entity, triggerType: string): void {
        weapon.effects
            .filter(effect => effect.type === triggerType)
            .forEach(effect => {
                if (Math.random() < effect.chance) {
                    if (effect.effect instanceof StatusEffect) {
                        this.statusEffectManager.applyEffect(user, effect.effect);
                    } else {
                        effect.effect(user, user);
                    }
                }
            });
    }
    
    private triggerCriticalHit(shooter: Entity): void {
        // Visual/audio feedback for critical hits
        console.log('Critical hit!');
    }
    
    handleProjectileHit(projectile: Entity, target: Entity): void {
        const collision = projectile.getComponent(ProjectileCollision);
        if (!collision) return;
        
        const weapon = collision.weapon;
        const shooter = collision.shooter;
        const damage = collision.damage;
        
        // Apply damage with combo multiplier
        const finalDamage = this.comboSystem.registerHit(shooter.id, damage);
        
        const health = target.getComponent(HealthComponent);
        if (health) {
            health.takeDamage(finalDamage);
        }
        
        // Apply weapon effects
        this.triggerWeaponEffects(weapon, target, 'onHit');
        
        // Handle penetration
        if (weapon.properties.penetration > 0) {
            collision.penetrationCount++;
            if (collision.penetrationCount >= weapon.properties.penetration) {
                // Destroy projectile after max penetrations
                this.destroyProjectile(projectile);
            }
        } else {
            this.destroyProjectile(projectile);
        }
        
        // Handle explosive weapons
        if (weapon.properties.explosive && weapon.properties.explosionRadius) {
            this.createExplosion(projectile, weapon.properties.explosionRadius, damage * 0.5);
        }
    }
    
    private destroyProjectile(projectile: Entity): void {
        // Remove projectile from scene
        // This would be handled by the scene manager
    }
    
    private createExplosion(center: Entity, radius: number, damage: number): void {
        // Find all entities within explosion radius and apply damage
        const centerTransform = center.getComponent(TransformComponent);
        if (!centerTransform) return;
        
        // Implementation would query spatial partitioning system for nearby entities
    }
    
    update(deltaTime: number): void {
        super.update(deltaTime);
        this.statusEffectManager.update(deltaTime);
        this.comboSystem.update(deltaTime);
    }
}

// Helper components for projectiles
class ProjectilePhysics implements Component {
    entity!: Entity;
    velocity: Vector2;
    maxRange: number;
    traveledDistance: number = 0;
    
    constructor(direction: Vector2, range: number, speed: number = 300) {
        this.velocity = Vector2.multiply(direction, speed);
        this.maxRange = range;
    }
    
    init(): void {}
    
    update(deltaTime: number): void {
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            const movement = Vector2.multiply(this.velocity, deltaTime);
            transform.position = Vector2.add(transform.position, movement);
            
            this.traveledDistance += Vector2.distance({ x: 0, y: 0 }, movement);
            
            if (this.traveledDistance >= this.maxRange) {
                // Projectile reached max range
                // Destroy or handle as needed
            }
        }
    }
}

class ProjectileCollision implements Component {
    entity!: Entity;
    damage: number;
    weapon: Weapon;
    shooter: Entity;
    penetrationCount: number = 0;
    
    constructor(damage: number, weapon: Weapon, shooter: Entity) {
        this.damage = damage;
        this.weapon = weapon;
        this.shooter = shooter;
    }
    
    init(): void {}
    update(deltaTime: number): void {}
}

class WeaponManager {
    private weapons: Map<string, Weapon> = new Map();
    
    constructor() {
        this.initializeDefaultWeapons();
    }
    
    private initializeDefaultWeapons(): void {
        // Initialize default weapon templates
        this.addWeapon(this.createAssaultRifle());
        this.addWeapon(this.createSniperRifle());
        this.addWeapon(this.createShotgun());
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
                fireRate: 10, // 10 shots per second
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
                fireRate: 0.67, // 40 RPM
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
                fireRate: 2, // 2 shots per second
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
                spread: Math.PI * 0.2 // 36 degree spread
            },
            effects: []
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
}
```

## Ability System

```typescript
// Resource types for abilities
enum ResourceType {
    Mana,
    Stamina,
    Rage,
    Energy,
    Health
}

// Resource management
interface Resource {
    type: ResourceType;
    current: number;
    maximum: number;
    regenerationRate: number; // Per second
}

// Base ability interface
interface Ability {
    id: string;
    name: string;
    description: string;
    cooldown: number;
    costs: Map<ResourceType, number>;
    castTime: number;
    range: number;
    targets: TargetType;
    effects: AbilityEffect[];
    
    canUse(user: Entity): boolean;
    execute(user: Entity, target?: Entity | Vector2): boolean;
}

enum TargetType {
    Self,
    Enemy,
    Ally,
    Ground,
    Direction,
    Area
}

interface AbilityEffect {
    type: 'damage' | 'heal' | 'statusEffect' | 'teleport' | 'summon';
    value: number;
    statusEffect?: StatusEffect;
    duration?: number;
}

// Ability system manager
class AbilitySystem {
    private cooldowns: Map<string, Map<string, number>> = new Map(); // entityId -> abilityId -> remainingTime
    private resources: Map<string, Map<ResourceType, Resource>> = new Map(); // entityId -> resourceType -> resource
    private castingState: Map<string, AbilityCast> = new Map(); // entityId -> current cast
    
    private abilities: Map<string, Ability> = new Map();
    
    constructor() {
        this.initializeDefaultAbilities();
    }
    
    useAbility(abilityId: string, user: Entity, target?: Entity | Vector2): boolean {
        const ability = this.abilities.get(abilityId);
        if (!ability) return false;
        
        if (!this.checkCooldown(user.id, abilityId)) return false;
        if (!this.checkResources(user.id, ability)) return false;
        if (!ability.canUse(user)) return false;
        
        // Start casting
        if (ability.castTime > 0) {
            this.startCasting(user, ability, target);
            return true;
        } else {
            // Instant cast
            return this.executeLability(ability, user, target);
        }
    }
    
    private checkCooldown(entityId: string, abilityId: string): boolean {
        const entityCooldowns = this.cooldowns.get(entityId);
        if (!entityCooldowns) return true;
        
        const remainingCooldown = entityCooldowns.get(abilityId) || 0;
        return remainingCooldown <= 0;
    }
    
    private checkResources(entityId: string, ability: Ability): boolean {
        const entityResources = this.resources.get(entityId);
        if (!entityResources) return false;
        
        for (const [resourceType, cost] of ability.costs) {
            const resource = entityResources.get(resourceType);
            if (!resource || resource.current < cost) {
                return false;
            }
        }
        return true;
    }
    
    private consumeResources(entityId: string, ability: Ability): void {
        const entityResources = this.resources.get(entityId);
        if (!entityResources) return;
        
        for (const [resourceType, cost] of ability.costs) {
            const resource = entityResources.get(resourceType);
            if (resource) {
                resource.current = Math.max(0, resource.current - cost);
            }
        }
    }
    
    private startCooldown(entityId: string, abilityId: string, duration: number): void {
        if (!this.cooldowns.has(entityId)) {
            this.cooldowns.set(entityId, new Map());
        }
        this.cooldowns.get(entityId)!.set(abilityId, duration);
    }
    
    private startCasting(user: Entity, ability: Ability, target?: Entity | Vector2): void {
        const cast: AbilityCast = {
            ability,
            user,
            target,
            remainingTime: ability.castTime,
            interrupted: false
        };
        
        this.castingState.set(user.id, cast);
    }
    
    private executeLability(ability: Ability, user: Entity, target?: Entity | Vector2): boolean {
        this.consumeResources(user.id, ability);
        this.startCooldown(user.id, ability.id, ability.cooldown);
        
        return ability.execute(user, target);
    }
    
    interruptCast(entityId: string): boolean {
        const cast = this.castingState.get(entityId);
        if (cast) {
            cast.interrupted = true;
            this.castingState.delete(entityId);
            return true;
        }
        return false;
    }
    
    addResource(entityId: string, resourceType: ResourceType, maximum: number, regenerationRate: number): void {
        if (!this.resources.has(entityId)) {
            this.resources.set(entityId, new Map());
        }
        
        const resource: Resource = {
            type: resourceType,
            current: maximum,
            maximum,
            regenerationRate
        };
        
        this.resources.get(entityId)!.set(resourceType, resource);
    }
    
    getResource(entityId: string, resourceType: ResourceType): Resource | undefined {
        const entityResources = this.resources.get(entityId);
        return entityResources?.get(resourceType);
    }
    
    update(deltaTime: number): void {
        this.updateCooldowns(deltaTime);
        this.updateResources(deltaTime);
        this.updateCasting(deltaTime);
    }
    
    private updateCooldowns(deltaTime: number): void {
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
    
    private updateResources(deltaTime: number): void {
        this.resources.forEach((entityResources, entityId) => {
            entityResources.forEach((resource, resourceType) => {
                if (resource.current < resource.maximum) {
                    resource.current = Math.min(resource.maximum, 
                        resource.current + resource.regenerationRate * deltaTime);
                }
            });
        });
    }
    
    private updateCasting(deltaTime: number): void {
        this.castingState.forEach((cast, entityId) => {
            if (cast.interrupted) {
                this.castingState.delete(entityId);
                return;
            }
            
            cast.remainingTime -= deltaTime;
            
            if (cast.remainingTime <= 0) {
                // Casting complete
                this.executeLability(cast.ability, cast.user, cast.target);
                this.castingState.delete(entityId);
            }
        });
    }
    
    private initializeDefaultAbilities(): void {
        // Initialize some default abilities
        this.addAbility(this.createFireballAbility());
        this.addAbility(this.createHealAbility());
        this.addAbility(this.createChargeAbility());
    }
    
    addAbility(ability: Ability): void {
        this.abilities.set(ability.id, ability);
    }
    
    private createFireballAbility(): Ability {
        return {
            id: 'fireball',
            name: 'Fireball',
            description: 'Launches a fiery projectile that explodes on impact',
            cooldown: 5.0,
            costs: new Map([[ResourceType.Mana, 30]]),
            castTime: 1.5,
            range: 200,
            targets: TargetType.Ground,
            effects: [
                { type: 'damage', value: 75 },
                { type: 'statusEffect', statusEffect: new BurnEffect(5, 10) }
            ],
            
            canUse(user: Entity): boolean {
                // Check if user has the required skill/class
                return true;
            },
            
            execute(user: Entity, target?: Entity | Vector2): boolean {
                if (!target || typeof target === 'object' && 'id' in target) return false;
                
                const targetPos = target as Vector2;
                // Create fireball projectile
                console.log(`${user.id} casts Fireball at ${targetPos.x}, ${targetPos.y}`);
                return true;
            }
        };
    }
    
    private createHealAbility(): Ability {
        return {
            id: 'heal',
            name: 'Heal',
            description: 'Restores health to target ally',
            cooldown: 3.0,
            costs: new Map([[ResourceType.Mana, 20]]),
            castTime: 2.0,
            range: 100,
            targets: TargetType.Ally,
            effects: [
                { type: 'heal', value: 50 }
            ],
            
            canUse(user: Entity): boolean {
                return true;
            },
            
            execute(user: Entity, target?: Entity | Vector2): boolean {
                if (!target || typeof target !== 'object' || !('id' in target)) return false;
                
                const targetEntity = target as Entity;
                const health = targetEntity.getComponent(HealthComponent);
                if (health) {
                    health.heal(50);
                    console.log(`${user.id} heals ${targetEntity.id} for 50 HP`);
                    return true;
                }
                return false;
            }
        };
    }
    
    private createChargeAbility(): Ability {
        return {
            id: 'charge',
            name: 'Charge',
            description: 'Rush forward, dealing damage to enemies in path',
            cooldown: 8.0,
            costs: new Map([[ResourceType.Stamina, 25]]),
            castTime: 0.5,
            range: 150,
            targets: TargetType.Direction,
            effects: [
                { type: 'damage', value: 40 }
            ],
            
            canUse(user: Entity): boolean {
                return true;
            },
            
            execute(user: Entity, target?: Entity | Vector2): boolean {
                if (!target) return false;
                
                const direction = typeof target === 'object' && 'x' in target ? 
                    target as Vector2 : 
                    (target as Entity).getComponent(TransformComponent)?.position;
                
                if (direction) {
                    console.log(`${user.id} charges towards ${direction.x}, ${direction.y}`);
                    return true;
                }
                return false;
            }
        };
    }
}

// Additional status effects for abilities
class BurnEffect implements StatusEffect {
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
        
        // Apply damage every second
        const health = target.getComponent(HealthComponent);
        if (health) {
            const damage = this.damagePerSecond * this.currentStacks * deltaTime;
            health.takeDamage(damage);
        }
    }
    
    onRemove(target: Entity): void {
        console.log(`${target.id} stops burning.`);
    }
    
    canStack(other: StatusEffect): boolean {
        return other.id === this.id && this.currentStacks < this.maxStacks;
    }
}

interface AbilityCast {
    ability: Ability;
    user: Entity;
    target?: Entity | Vector2;
    remainingTime: number;
    interrupted: boolean;
}
```

## Error Handling and Performance

### Error Handling
```typescript
class GameError extends Error {
    constructor(message: string, public context?: any) {
        super(message);
        this.name = 'GameError';
    }
}

class CombatError extends GameError {
    constructor(message: string, public attacker?: Entity, public target?: Entity) {
        super(message, { attacker, target });
        this.name = 'CombatError';
    }
}

// Error handling in combat system
try {
    this.handleWeaponFire(weapon, shooter, direction);
} catch (error) {
    if (error instanceof CombatError) {
        console.error(`Combat error: ${error.message}`, error.context);
        // Handle combat-specific error
    } else {
        console.error(`Unexpected error in combat: ${error.message}`);
    }
}
```

### Performance Considerations
- **Object Pooling**: Reuse projectile and effect objects to reduce garbage collection
- **Spatial Queries**: Use spatial partitioning for efficient range queries in abilities
- **Batching**: Group similar effects for batch processing
- **Caching**: Cache expensive calculations like damage formulas
- **Culling**: Only process abilities and effects for entities in active areas
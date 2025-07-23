import { Component, Entity as IEntity, Vector2 } from '../types/game';

/**
 * Entity Component System Implementation
 * 
 * This module provides the core ECS architecture for Stick Ranger,
 * enabling flexible and performance-oriented game object management.
 */

// Entity implementation
export class Entity implements IEntity {
    public id: string;
    public components: Map<string, Component>;
    
    constructor(id: string) {
        this.id = id;
        this.components = new Map();
    }
    
    addComponent<T extends Component>(component: T): T {
        this.components.set(component.constructor.name, component);
        component.entity = this;
        component.init();
        return component;
    }
    
    getComponent<T extends Component>(componentType: new(...args: any[]) => T): T | undefined {
        return this.components.get(componentType.name) as T;
    }
    
    removeComponent<T extends Component>(componentType: new(...args: any[]) => T): void {
        const component = this.components.get(componentType.name);
        if (component && component.destroy) {
            component.destroy();
        }
        this.components.delete(componentType.name);
    }
    
    update(deltaTime: number): void {
        this.components.forEach(component => component.update(deltaTime));
    }
    
    hasComponent<T extends Component>(componentType: new(...args: any[]) => T): boolean {
        return this.components.has(componentType.name);
    }
    
    destroy(): void {
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.components.clear();
    }
}

// Base System class
export abstract class System {
    protected entities: Entity[] = [];
    protected enabled: boolean = true;
    
    addEntity(entity: Entity): void {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
        }
    }
    
    removeEntity(entity: Entity): void {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }
    
    getEntities(): Entity[] {
        return this.entities;
    }
    
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
    
    isEnabled(): boolean {
        return this.enabled;
    }
    
    abstract update(deltaTime: number): void;
}

// Transform Component - handles position, rotation, and scale
export class TransformComponent implements Component {
    entity!: Entity;
    position: Vector2 = { x: 0, y: 0 };
    rotation: number = 0;
    scale: Vector2 = { x: 1, y: 1 };
    
    constructor(position?: Vector2, rotation?: number, scale?: Vector2) {
        if (position) this.position = position;
        if (rotation !== undefined) this.rotation = rotation;
        if (scale) this.scale = scale;
    }
    
    init(): void {
        // Initialize transform
    }
    
    update(deltaTime: number): void {
        // Transform updates handled by other systems
    }
    
    translate(delta: Vector2): void {
        this.position.x += delta.x;
        this.position.y += delta.y;
    }
    
    rotate(deltaRotation: number): void {
        this.rotation += deltaRotation;
        // Normalize rotation to [0, 2π]
        this.rotation = this.rotation % (Math.PI * 2);
        if (this.rotation < 0) {
            this.rotation += Math.PI * 2;
        }
    }
    
    getForwardDirection(): Vector2 {
        return {
            x: Math.cos(this.rotation),
            y: Math.sin(this.rotation)
        };
    }
    
    distanceTo(other: TransformComponent): number {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

// Health Component - manages entity health and damage
export class HealthComponent implements Component {
    entity!: Entity;
    maxHealth: number;
    currentHealth: number;
    
    // Health regeneration
    regenerationRate: number = 0; // HP per second
    
    // Damage modifiers
    damageReduction: number = 0; // Percentage (0-1)
    immunities: Set<string> = new Set(); // Damage type immunities
    
    // Events
    private onDamageCallbacks: ((damage: number, source?: Entity) => void)[] = [];
    private onHealCallbacks: ((amount: number) => void)[] = [];
    private onDeathCallbacks: (() => void)[] = [];
    
    constructor(maxHealth: number, regenerationRate: number = 0) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.regenerationRate = regenerationRate;
    }
    
    init(): void {
        // Initialize health component
    }
    
    update(deltaTime: number): void {
        // Handle health regeneration
        if (this.regenerationRate > 0 && this.currentHealth < this.maxHealth && this.currentHealth > 0) {
            this.heal(this.regenerationRate * deltaTime);
        }
    }
    
    takeDamage(amount: number, damageType?: string, source?: Entity): void {
        if (this.isDead()) return;
        
        // Check immunity
        if (damageType && this.immunities.has(damageType)) {
            return;
        }
        
        // Apply damage reduction
        const reducedDamage = amount * (1 - this.damageReduction);
        const finalDamage = Math.max(0, reducedDamage);
        
        this.currentHealth = Math.max(0, this.currentHealth - finalDamage);
        
        // Trigger damage callbacks
        this.onDamageCallbacks.forEach(callback => callback(finalDamage, source));
        
        // Check for death
        if (this.isDead()) {
            this.triggerDeath();
        }
    }
    
    heal(amount: number): void {
        if (this.isDead()) return;
        
        const healAmount = Math.min(amount, this.maxHealth - this.currentHealth);
        this.currentHealth += healAmount;
        
        // Trigger heal callbacks
        this.onHealCallbacks.forEach(callback => callback(healAmount));
    }
    
    setMaxHealth(newMaxHealth: number): void {
        const ratio = this.currentHealth / this.maxHealth;
        this.maxHealth = newMaxHealth;
        this.currentHealth = this.maxHealth * ratio;
    }
    
    isDead(): boolean {
        return this.currentHealth <= 0;
    }
    
    getHealthRatio(): number {
        return this.currentHealth / this.maxHealth;
    }
    
    addImmunity(damageType: string): void {
        this.immunities.add(damageType);
    }
    
    removeImmunity(damageType: string): void {
        this.immunities.delete(damageType);
    }
    
    private triggerDeath(): void {
        this.onDeathCallbacks.forEach(callback => callback());
    }
    
    // Event subscription methods
    onDamage(callback: (damage: number, source?: Entity) => void): void {
        this.onDamageCallbacks.push(callback);
    }
    
    onHeal(callback: (amount: number) => void): void {
        this.onHealCallbacks.push(callback);
    }
    
    onDeath(callback: () => void): void {
        this.onDeathCallbacks.push(callback);
    }
}

// Movement Component - handles velocity and movement
export class MovementComponent implements Component {
    entity!: Entity;
    velocity: Vector2 = { x: 0, y: 0 };
    maxSpeed: number = 100;
    acceleration: number = 500;
    friction: number = 0.8;
    
    constructor(maxSpeed: number = 100, acceleration: number = 500, friction: number = 0.8) {
        this.maxSpeed = maxSpeed;
        this.acceleration = acceleration;
        this.friction = friction;
    }
    
    init(): void {
        // Initialize movement
    }
    
    update(deltaTime: number): void {
        const transform = this.entity.getComponent(TransformComponent);
        if (!transform) return;
        
        // Apply velocity to position
        transform.position.x += this.velocity.x * deltaTime;
        transform.position.y += this.velocity.y * deltaTime;
        
        // Apply friction
        this.velocity.x *= Math.pow(this.friction, deltaTime);
        this.velocity.y *= Math.pow(this.friction, deltaTime);
    }
    
    addForce(force: Vector2): void {
        this.velocity.x += force.x;
        this.velocity.y += force.y;
        
        // Clamp to max speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
    }
    
    setVelocity(velocity: Vector2): void {
        this.velocity = { ...velocity };
    }
    
    stop(): void {
        this.velocity = { x: 0, y: 0 };
    }
    
    getSpeed(): number {
        return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }
}

// Renderable Component - handles visual representation
export class RenderableComponent implements Component {
    entity!: Entity;
    layer: string = 'default';
    zIndex: number = 0;
    visible: boolean = true;
    texture?: string;
    color: { r: number; g: number; b: number; a: number } = { r: 255, g: 255, b: 255, a: 1 };
    size: Vector2 = { x: 32, y: 32 };
    
    constructor(layer: string = 'default', zIndex: number = 0) {
        this.layer = layer;
        this.zIndex = zIndex;
    }
    
    init(): void {
        // Initialize renderable
    }
    
    update(deltaTime: number): void {
        // Renderable updates handled by render system
    }
    
    setTexture(texture: string): void {
        this.texture = texture;
    }
    
    setColor(r: number, g: number, b: number, a: number = 1): void {
        this.color = { r, g, b, a };
    }
    
    setSize(width: number, height: number): void {
        this.size = { x: width, y: height };
    }
    
    setVisible(visible: boolean): void {
        this.visible = visible;
    }
}

// Entity Manager - manages all entities in the game
export class EntityManager {
    private entities: Map<string, Entity> = new Map();
    private systems: System[] = [];
    private entityIdCounter: number = 0;
    
    createEntity(id?: string): Entity {
        const entityId = id || `entity_${this.entityIdCounter++}`;
        const entity = new Entity(entityId);
        this.entities.set(entityId, entity);
        return entity;
    }
    
    removeEntity(id: string): void {
        const entity = this.entities.get(id);
        if (entity) {
            // Remove from all systems
            this.systems.forEach(system => system.removeEntity(entity));
            
            // Destroy entity
            entity.destroy();
            
            // Remove from manager
            this.entities.delete(id);
        }
    }
    
    getEntity(id: string): Entity | undefined {
        return this.entities.get(id);
    }
    
    getAllEntities(): Entity[] {
        return Array.from(this.entities.values());
    }
    
    getEntitiesWithComponent<T extends Component>(componentType: new(...args: any[]) => T): Entity[] {
        return this.getAllEntities().filter(entity => entity.hasComponent(componentType));
    }
    
    addSystem(system: System): void {
        this.systems.push(system);
    }
    
    removeSystem(system: System): void {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.splice(index, 1);
        }
    }
    
    update(deltaTime: number): void {
        // Update all entities
        this.entities.forEach(entity => entity.update(deltaTime));
        
        // Update all systems
        this.systems.forEach(system => {
            if (system.isEnabled()) {
                system.update(deltaTime);
            }
        });
    }
    
    clear(): void {
        // Remove all entities
        this.entities.forEach((entity, id) => {
            this.removeEntity(id);
        });
        
        // Clear systems
        this.systems.length = 0;
    }
    
    getEntityCount(): number {
        return this.entities.size;
    }
}

// Example specialized system - Movement System
export class MovementSystem extends System {
    update(deltaTime: number): void {
        this.entities.forEach(entity => {
            const movement = entity.getComponent(MovementComponent);
            if (movement) {
                movement.update(deltaTime);
            }
        });
    }
}

// Example specialized system - Health System
export class HealthSystem extends System {
    update(deltaTime: number): void {
        this.entities.forEach(entity => {
            const health = entity.getComponent(HealthComponent);
            if (health) {
                health.update(deltaTime);
                
                // Remove dead entities (optional - could be handled elsewhere)
                if (health.isDead()) {
                    // Could trigger death effects, drop items, etc.
                    console.log(`Entity ${entity.id} has died`);
                }
            }
        });
    }
}
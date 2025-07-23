"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthSystem = exports.MovementSystem = exports.EntityManager = exports.RenderableComponent = exports.MovementComponent = exports.HealthComponent = exports.TransformComponent = exports.System = exports.Entity = void 0;
/**
 * Entity Component System Implementation
 *
 * This module provides the core ECS architecture for Stick Ranger,
 * enabling flexible and performance-oriented game object management.
 */
// Entity implementation
class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
    }
    addComponent(component) {
        this.components.set(component.constructor.name, component);
        component.entity = this;
        component.init();
        return component;
    }
    getComponent(componentType) {
        return this.components.get(componentType.name);
    }
    removeComponent(componentType) {
        const component = this.components.get(componentType.name);
        if (component && component.destroy) {
            component.destroy();
        }
        this.components.delete(componentType.name);
    }
    update(deltaTime) {
        this.components.forEach(component => component.update(deltaTime));
    }
    hasComponent(componentType) {
        return this.components.has(componentType.name);
    }
    destroy() {
        this.components.forEach(component => {
            if (component.destroy) {
                component.destroy();
            }
        });
        this.components.clear();
    }
}
exports.Entity = Entity;
// Base System class
class System {
    constructor() {
        this.entities = [];
        this.enabled = true;
    }
    addEntity(entity) {
        if (!this.entities.includes(entity)) {
            this.entities.push(entity);
        }
    }
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }
    getEntities() {
        return this.entities;
    }
    setEnabled(enabled) {
        this.enabled = enabled;
    }
    isEnabled() {
        return this.enabled;
    }
}
exports.System = System;
// Transform Component - handles position, rotation, and scale
class TransformComponent {
    constructor(position, rotation, scale) {
        this.position = { x: 0, y: 0 };
        this.rotation = 0;
        this.scale = { x: 1, y: 1 };
        if (position)
            this.position = position;
        if (rotation !== undefined)
            this.rotation = rotation;
        if (scale)
            this.scale = scale;
    }
    init() {
        // Initialize transform
    }
    update(deltaTime) {
        // Transform updates handled by other systems
    }
    translate(delta) {
        this.position.x += delta.x;
        this.position.y += delta.y;
    }
    rotate(deltaRotation) {
        this.rotation += deltaRotation;
        // Normalize rotation to [0, 2π]
        this.rotation = this.rotation % (Math.PI * 2);
        if (this.rotation < 0) {
            this.rotation += Math.PI * 2;
        }
    }
    getForwardDirection() {
        return {
            x: Math.cos(this.rotation),
            y: Math.sin(this.rotation)
        };
    }
    distanceTo(other) {
        const dx = this.position.x - other.position.x;
        const dy = this.position.y - other.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}
exports.TransformComponent = TransformComponent;
// Health Component - manages entity health and damage
class HealthComponent {
    constructor(maxHealth, regenerationRate = 0) {
        // Health regeneration
        this.regenerationRate = 0; // HP per second
        // Damage modifiers
        this.damageReduction = 0; // Percentage (0-1)
        this.immunities = new Set(); // Damage type immunities
        // Events
        this.onDamageCallbacks = [];
        this.onHealCallbacks = [];
        this.onDeathCallbacks = [];
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
        this.regenerationRate = regenerationRate;
    }
    init() {
        // Initialize health component
    }
    update(deltaTime) {
        // Handle health regeneration
        if (this.regenerationRate > 0 && this.currentHealth < this.maxHealth && this.currentHealth > 0) {
            this.heal(this.regenerationRate * deltaTime);
        }
    }
    takeDamage(amount, damageType, source) {
        if (this.isDead())
            return;
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
    heal(amount) {
        if (this.isDead())
            return;
        const healAmount = Math.min(amount, this.maxHealth - this.currentHealth);
        this.currentHealth += healAmount;
        // Trigger heal callbacks
        this.onHealCallbacks.forEach(callback => callback(healAmount));
    }
    setMaxHealth(newMaxHealth) {
        const ratio = this.currentHealth / this.maxHealth;
        this.maxHealth = newMaxHealth;
        this.currentHealth = this.maxHealth * ratio;
    }
    isDead() {
        return this.currentHealth <= 0;
    }
    getHealthRatio() {
        return this.currentHealth / this.maxHealth;
    }
    addImmunity(damageType) {
        this.immunities.add(damageType);
    }
    removeImmunity(damageType) {
        this.immunities.delete(damageType);
    }
    triggerDeath() {
        this.onDeathCallbacks.forEach(callback => callback());
    }
    // Event subscription methods
    onDamage(callback) {
        this.onDamageCallbacks.push(callback);
    }
    onHeal(callback) {
        this.onHealCallbacks.push(callback);
    }
    onDeath(callback) {
        this.onDeathCallbacks.push(callback);
    }
}
exports.HealthComponent = HealthComponent;
// Movement Component - handles velocity and movement
class MovementComponent {
    constructor(maxSpeed = 100, acceleration = 500, friction = 0.8) {
        this.velocity = { x: 0, y: 0 };
        this.maxSpeed = 100;
        this.acceleration = 500;
        this.friction = 0.8;
        this.maxSpeed = maxSpeed;
        this.acceleration = acceleration;
        this.friction = friction;
    }
    init() {
        // Initialize movement
    }
    update(deltaTime) {
        const transform = this.entity.getComponent(TransformComponent);
        if (!transform)
            return;
        // Apply velocity to position
        transform.position.x += this.velocity.x * deltaTime;
        transform.position.y += this.velocity.y * deltaTime;
        // Apply friction
        this.velocity.x *= Math.pow(this.friction, deltaTime);
        this.velocity.y *= Math.pow(this.friction, deltaTime);
    }
    addForce(force) {
        this.velocity.x += force.x;
        this.velocity.y += force.y;
        // Clamp to max speed
        const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
        if (speed > this.maxSpeed) {
            this.velocity.x = (this.velocity.x / speed) * this.maxSpeed;
            this.velocity.y = (this.velocity.y / speed) * this.maxSpeed;
        }
    }
    setVelocity(velocity) {
        this.velocity = Object.assign({}, velocity);
    }
    stop() {
        this.velocity = { x: 0, y: 0 };
    }
    getSpeed() {
        return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    }
}
exports.MovementComponent = MovementComponent;
// Renderable Component - handles visual representation
class RenderableComponent {
    constructor(layer = 'default', zIndex = 0) {
        this.layer = 'default';
        this.zIndex = 0;
        this.visible = true;
        this.color = { r: 255, g: 255, b: 255, a: 1 };
        this.size = { x: 32, y: 32 };
        this.layer = layer;
        this.zIndex = zIndex;
    }
    init() {
        // Initialize renderable
    }
    update(deltaTime) {
        // Renderable updates handled by render system
    }
    setTexture(texture) {
        this.texture = texture;
    }
    setColor(r, g, b, a = 1) {
        this.color = { r, g, b, a };
    }
    setSize(width, height) {
        this.size = { x: width, y: height };
    }
    setVisible(visible) {
        this.visible = visible;
    }
}
exports.RenderableComponent = RenderableComponent;
// Entity Manager - manages all entities in the game
class EntityManager {
    constructor() {
        this.entities = new Map();
        this.systems = [];
        this.entityIdCounter = 0;
    }
    createEntity(id) {
        const entityId = id || `entity_${this.entityIdCounter++}`;
        const entity = new Entity(entityId);
        this.entities.set(entityId, entity);
        return entity;
    }
    removeEntity(id) {
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
    getEntity(id) {
        return this.entities.get(id);
    }
    getAllEntities() {
        return Array.from(this.entities.values());
    }
    getEntitiesWithComponent(componentType) {
        return this.getAllEntities().filter(entity => entity.hasComponent(componentType));
    }
    addSystem(system) {
        this.systems.push(system);
    }
    removeSystem(system) {
        const index = this.systems.indexOf(system);
        if (index !== -1) {
            this.systems.splice(index, 1);
        }
    }
    update(deltaTime) {
        // Update all entities
        this.entities.forEach(entity => entity.update(deltaTime));
        // Update all systems
        this.systems.forEach(system => {
            if (system.isEnabled()) {
                system.update(deltaTime);
            }
        });
    }
    clear() {
        // Remove all entities
        this.entities.forEach((entity, id) => {
            this.removeEntity(id);
        });
        // Clear systems
        this.systems.length = 0;
    }
    getEntityCount() {
        return this.entities.size;
    }
}
exports.EntityManager = EntityManager;
// Example specialized system - Movement System
class MovementSystem extends System {
    update(deltaTime) {
        this.entities.forEach(entity => {
            const movement = entity.getComponent(MovementComponent);
            if (movement) {
                movement.update(deltaTime);
            }
        });
    }
}
exports.MovementSystem = MovementSystem;
// Example specialized system - Health System
class HealthSystem extends System {
    update(deltaTime) {
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
exports.HealthSystem = HealthSystem;

/**
 * EntitySystem - High-level wrapper for the Entity Component System
 * 
 * This provides a simplified interface for managing entities and systems
 * in the Stick Ranger game, building on the existing EntityComponentSystem.
 */

import { 
    EntityManager, 
    Entity, 
    System,
    TransformComponent, 
    RenderableComponent, 
    MovementComponent, 
    HealthComponent,
    MovementSystem,
    HealthSystem
} from './EntityComponentSystem';
import { Canvas } from '../engine/Canvas';
import { Vector2 } from '../types/game';

export class EntitySystem {
    private entityManager: EntityManager;
    private movementSystem: MovementSystem;
    private healthSystem: HealthSystem;
    private renderSystem: RenderSystem;

    constructor() {
        this.entityManager = new EntityManager();
        
        // Initialize core systems
        this.movementSystem = new MovementSystem();
        this.healthSystem = new HealthSystem();
        this.renderSystem = new RenderSystem();
        
        // Add systems to entity manager
        this.entityManager.addSystem(this.movementSystem);
        this.entityManager.addSystem(this.healthSystem);
        this.entityManager.addSystem(this.renderSystem);
        
        // Create some demo entities
        this.createDemoEntities();
    }

    /**
     * Update all entities and systems
     */
    update(deltaTime: number): void {
        this.entityManager.update(deltaTime);
    }

    /**
     * Render all entities
     */
    render(canvas: Canvas): void {
        this.renderSystem.render(canvas);
    }

    /**
     * Create a basic player entity
     */
    createPlayer(position: Vector2): Entity {
        const player = this.entityManager.createEntity('player');
        
        // Add components
        player.addComponent(new TransformComponent(position));
        player.addComponent(new MovementComponent(150, 800, 0.9));
        player.addComponent(new HealthComponent(100, 1));
        
        const renderable = player.addComponent(new RenderableComponent('player', 10));
        renderable.setColor(0, 150, 255); // Blue for player
        renderable.setSize(16, 16);
        
        // Add to systems
        this.movementSystem.addEntity(player);
        this.healthSystem.addEntity(player);
        this.renderSystem.addEntity(player);
        
        return player;
    }

    /**
     * Create a basic enemy entity
     */
    createEnemy(position: Vector2): Entity {
        const enemy = this.entityManager.createEntity();
        
        // Add components
        enemy.addComponent(new TransformComponent(position));
        enemy.addComponent(new MovementComponent(80, 400, 0.8));
        enemy.addComponent(new HealthComponent(50, 0.5));
        
        const renderable = enemy.addComponent(new RenderableComponent('enemy', 5));
        renderable.setColor(255, 100, 100); // Red for enemy
        renderable.setSize(12, 12);
        
        // Add to systems
        this.movementSystem.addEntity(enemy);
        this.healthSystem.addEntity(enemy);
        this.renderSystem.addEntity(enemy);
        
        return enemy;
    }

    /**
     * Get entity by ID
     */
    getEntity(id: string): Entity | undefined {
        return this.entityManager.getEntity(id);
    }

    /**
     * Remove entity by ID
     */
    removeEntity(id: string): void {
        this.entityManager.removeEntity(id);
    }

    /**
     * Get total entity count
     */
    getEntityCount(): number {
        return this.entityManager.getEntityCount();
    }

    /**
     * Get all entities
     */
    getAllEntities(): Entity[] {
        return this.entityManager.getAllEntities();
    }

    /**
     * Clear all entities
     */
    clear(): void {
        this.entityManager.clear();
    }

    /**
     * Create some demo entities for testing
     */
    private createDemoEntities(): void {
        // Create a player at center
        this.createPlayer({ x: 400, y: 300 });
        
        // Create some enemies
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = 100;
            const x = 400 + Math.cos(angle) * radius;
            const y = 300 + Math.sin(angle) * radius;
            this.createEnemy({ x, y });
        }
        
        console.log(`Created ${this.getEntityCount()} demo entities`);
    }
}

/**
 * Custom render system for the game
 */
class RenderSystem extends System {
    private renderEntities: Entity[] = [];

    addEntity(entity: Entity): void {
        super.addEntity(entity);
        if (!this.renderEntities.includes(entity)) {
            this.renderEntities.push(entity);
        }
    }

    removeEntity(entity: Entity): void {
        super.removeEntity(entity);
        const index = this.renderEntities.indexOf(entity);
        if (index !== -1) {
            this.renderEntities.splice(index, 1);
        }
    }

    update(deltaTime: number): void {
        // Render system doesn't need delta time updates
        // Rendering is handled separately through the render method
    }

    render(canvas: Canvas): void {
        // Sort entities by z-index for proper rendering order
        const renderableEntities = this.renderEntities
            .filter(entity => entity.hasComponent(RenderableComponent))
            .sort((a, b) => {
                const renderableA = a.getComponent(RenderableComponent)!;
                const renderableB = b.getComponent(RenderableComponent)!;
                return renderableA.zIndex - renderableB.zIndex;
            });

        // Render each entity
        renderableEntities.forEach(entity => {
            const transform = entity.getComponent(TransformComponent);
            const renderable = entity.getComponent(RenderableComponent);
            
            if (!transform || !renderable || !renderable.visible) {
                return;
            }

            // Set alpha if needed
            if (renderable.color.a < 1) {
                canvas.setAlpha(renderable.color.a);
            }

            // Render based on type (simple colored rectangles for now)
            const color = `rgb(${renderable.color.r}, ${renderable.color.g}, ${renderable.color.b})`;
            canvas.drawRect(
                transform.position.x - renderable.size.x / 2,
                transform.position.y - renderable.size.y / 2,
                renderable.size.x,
                renderable.size.y,
                color
            );

            // Draw health bar for entities with health
            const health = entity.getComponent(HealthComponent);
            if (health && health.currentHealth < health.maxHealth) {
                this.renderHealthBar(canvas, transform.position, health, renderable.size.x);
            }

            // Reset alpha
            if (renderable.color.a < 1) {
                canvas.setAlpha(1);
            }
        });
    }

    private renderHealthBar(canvas: Canvas, position: Vector2, health: HealthComponent, width: number): void {
        const barWidth = width;
        const barHeight = 4;
        const barY = position.y - 20;
        const barX = position.x - barWidth / 2;
        
        // Background
        canvas.drawRect(barX, barY, barWidth, barHeight, '#333333');
        
        // Health bar
        const healthRatio = health.getHealthRatio();
        const healthWidth = barWidth * healthRatio;
        const healthColor = healthRatio > 0.5 ? '#00ff00' : healthRatio > 0.25 ? '#ffff00' : '#ff0000';
        canvas.drawRect(barX, barY, healthWidth, barHeight, healthColor);
        
        // Border
        canvas.drawRectOutline(barX, barY, barWidth, barHeight, '#ffffff', 1);
    }
}
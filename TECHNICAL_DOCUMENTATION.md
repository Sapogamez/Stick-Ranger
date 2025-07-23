# Technical Documentation

This document provides detailed technical implementations for the Stick Ranger game systems.

## Entity Component System (ECS)

The game uses an Entity Component System architecture for maximum flexibility and performance.

### Core Interfaces

```typescript
// Component base interface
interface Component {
    entity: Entity;
    init(): void;
    update(deltaTime: number): void;
    destroy?(): void;
}

// Entity manager class
class Entity {
    private components: Map<string, Component>;
    private id: string;
    
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
}

// System base class
abstract class System {
    protected entities: Entity[] = [];
    
    addEntity(entity: Entity): void {
        this.entities.push(entity);
    }
    
    removeEntity(entity: Entity): void {
        const index = this.entities.indexOf(entity);
        if (index !== -1) {
            this.entities.splice(index, 1);
        }
    }
    
    abstract update(deltaTime: number): void;
}
```

### Component Examples

```typescript
// Transform component for position and rotation
class TransformComponent implements Component {
    entity!: Entity;
    position: Vector2 = { x: 0, y: 0 };
    rotation: number = 0;
    scale: Vector2 = { x: 1, y: 1 };
    
    init(): void {
        // Initialize transform
    }
    
    update(deltaTime: number): void {
        // Update transform if needed
    }
}

// Health component for entities with HP
class HealthComponent implements Component {
    entity!: Entity;
    maxHealth: number;
    currentHealth: number;
    
    constructor(maxHealth: number) {
        this.maxHealth = maxHealth;
        this.currentHealth = maxHealth;
    }
    
    init(): void {
        // Initialize health
    }
    
    update(deltaTime: number): void {
        // Handle health regeneration, etc.
    }
    
    takeDamage(amount: number): void {
        this.currentHealth = Math.max(0, this.currentHealth - amount);
    }
    
    heal(amount: number): void {
        this.currentHealth = Math.min(this.maxHealth, this.currentHealth + amount);
    }
    
    isDead(): boolean {
        return this.currentHealth <= 0;
    }
}
```

## Physics System

Advanced collision detection and response system with spatial optimization.

```typescript
// Physics body for collision detection
interface PhysicsBody {
    entity: Entity;
    position: Vector2;
    velocity: Vector2;
    bounds: Rectangle;
    mass: number;
    isStatic: boolean;
    collisionLayer: number;
    collisionMask: number;
}

// Spatial partitioning for performance
class QuadTree {
    private bounds: Rectangle;
    private objects: PhysicsBody[];
    private children: QuadTree[];
    private maxObjects: number = 10;
    private maxLevels: number = 5;
    private level: number;
    
    constructor(bounds: Rectangle, level: number = 0) {
        this.bounds = bounds;
        this.level = level;
        this.objects = [];
        this.children = [];
    }
    
    insert(object: PhysicsBody): void {
        if (this.children.length > 0) {
            const index = this.getIndex(object);
            if (index !== -1) {
                this.children[index].insert(object);
                return;
            }
        }
        
        this.objects.push(object);
        
        if (this.objects.length > this.maxObjects && this.level < this.maxLevels) {
            if (this.children.length === 0) {
                this.split();
            }
            
            let i = 0;
            while (i < this.objects.length) {
                const index = this.getIndex(this.objects[i]);
                if (index !== -1) {
                    this.children[index].insert(this.objects.splice(i, 1)[0]);
                } else {
                    i++;
                }
            }
        }
    }
    
    retrieve(object: PhysicsBody): PhysicsBody[] {
        const index = this.getIndex(object);
        let returnObjects = [...this.objects];
        
        if (this.children.length > 0) {
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.children[index].retrieve(object));
            } else {
                // Object spans multiple quadrants
                this.children.forEach(child => {
                    returnObjects = returnObjects.concat(child.retrieve(object));
                });
            }
        }
        
        return returnObjects;
    }
    
    private split(): void {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;
        
        this.children[0] = new QuadTree({ x: x + subWidth, y: y, width: subWidth, height: subHeight }, this.level + 1);
        this.children[1] = new QuadTree({ x: x, y: y, width: subWidth, height: subHeight }, this.level + 1);
        this.children[2] = new QuadTree({ x: x, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1);
        this.children[3] = new QuadTree({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1);
    }
    
    private getIndex(object: PhysicsBody): number {
        let index = -1;
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
        
        const topQuadrant = (object.bounds.y < horizontalMidpoint && object.bounds.y + object.bounds.height < horizontalMidpoint);
        const bottomQuadrant = (object.bounds.y > horizontalMidpoint);
        
        if (object.bounds.x < verticalMidpoint && object.bounds.x + object.bounds.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            } else if (bottomQuadrant) {
                index = 2;
            }
        } else if (object.bounds.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            } else if (bottomQuadrant) {
                index = 3;
            }
        }
        
        return index;
    }
}

// Main physics system
class PhysicsSystem extends System {
    private bodies: PhysicsBody[];
    private quadTree: QuadTree;
    private gravity: Vector2 = { x: 0, y: 9.81 };
    private worldBounds: Rectangle;
    
    constructor(worldBounds: Rectangle) {
        super();
        this.bodies = [];
        this.worldBounds = worldBounds;
        this.quadTree = new QuadTree(worldBounds);
    }
    
    update(deltaTime: number): void {
        this.updatePositions(deltaTime);
        this.checkCollisions();
        this.resolveCollisions();
    }
    
    private updatePositions(deltaTime: number): void {
        this.bodies.forEach(body => {
            if (!body.isStatic) {
                // Apply gravity
                body.velocity.x += this.gravity.x * deltaTime;
                body.velocity.y += this.gravity.y * deltaTime;
                
                // Update position
                body.position.x += body.velocity.x * deltaTime;
                body.position.y += body.velocity.y * deltaTime;
                
                // Update bounds
                body.bounds.x = body.position.x;
                body.bounds.y = body.position.y;
            }
        });
    }
    
    private checkCollisions(): void {
        // Rebuild quad tree
        this.quadTree = new QuadTree(this.worldBounds);
        this.bodies.forEach(body => this.quadTree.insert(body));
        
        // Check collisions using spatial partitioning
        this.bodies.forEach(body => {
            const candidates = this.quadTree.retrieve(body);
            candidates.forEach(other => {
                if (body !== other && this.shouldCollide(body, other)) {
                    if (this.isColliding(body, other)) {
                        this.handleCollision(body, other);
                    }
                }
            });
        });
    }
    
    private shouldCollide(body1: PhysicsBody, body2: PhysicsBody): boolean {
        return (body1.collisionLayer & body2.collisionMask) !== 0 ||
               (body2.collisionLayer & body1.collisionMask) !== 0;
    }
    
    private isColliding(body1: PhysicsBody, body2: PhysicsBody): boolean {
        return !(body1.bounds.x + body1.bounds.width < body2.bounds.x ||
                body2.bounds.x + body2.bounds.width < body1.bounds.x ||
                body1.bounds.y + body1.bounds.height < body2.bounds.y ||
                body2.bounds.y + body2.bounds.height < body1.bounds.y);
    }
    
    private handleCollision(body1: PhysicsBody, body2: PhysicsBody): void {
        // Basic collision response
        const overlap = this.calculateOverlap(body1, body2);
        
        if (!body1.isStatic && !body2.isStatic) {
            // Both dynamic - split the correction
            body1.position.x -= overlap.x / 2;
            body1.position.y -= overlap.y / 2;
            body2.position.x += overlap.x / 2;
            body2.position.y += overlap.y / 2;
        } else if (!body1.isStatic) {
            // Only body1 is dynamic
            body1.position.x -= overlap.x;
            body1.position.y -= overlap.y;
        } else if (!body2.isStatic) {
            // Only body2 is dynamic
            body2.position.x += overlap.x;
            body2.position.y += overlap.y;
        }
        
        // Trigger collision events
        this.triggerCollisionEvent(body1, body2);
    }
    
    private calculateOverlap(body1: PhysicsBody, body2: PhysicsBody): Vector2 {
        const overlapX = Math.min(body1.bounds.x + body1.bounds.width - body2.bounds.x,
                                 body2.bounds.x + body2.bounds.width - body1.bounds.x);
        const overlapY = Math.min(body1.bounds.y + body1.bounds.height - body2.bounds.y,
                                 body2.bounds.y + body2.bounds.height - body1.bounds.y);
        
        // Return smaller overlap to minimize correction
        if (overlapX < overlapY) {
            return { x: body1.bounds.x < body2.bounds.x ? -overlapX : overlapX, y: 0 };
        } else {
            return { x: 0, y: body1.bounds.y < body2.bounds.y ? -overlapY : overlapY };
        }
    }
    
    private resolveCollisions(): void {
        // Additional collision resolution logic
        // Velocity corrections, bouncing, etc.
    }
    
    private triggerCollisionEvent(body1: PhysicsBody, body2: PhysicsBody): void {
        // Dispatch collision events to entities
        // Could trigger damage, sound effects, particle effects, etc.
    }
}
```

## Rendering Pipeline

Optimized rendering system with layer management and shader support.

```typescript
// Render layer for organizing draw order
interface RenderLayer {
    id: string;
    zIndex: number;
    visible: boolean;
    renderables: Renderable[];
}

// Base renderable interface
interface Renderable {
    entity: Entity;
    layer: string;
    zIndex: number;
    visible: boolean;
    render(context: CanvasRenderingContext2D, camera: Camera): void;
}

// Shader interface for advanced rendering effects
interface Shader {
    name: string;
    vertexShader: string;
    fragmentShader: string;
    uniforms: Map<string, any>;
    compile(gl: WebGLRenderingContext): WebGLProgram;
}

// Camera for viewport management
class Camera {
    position: Vector2 = { x: 0, y: 0 };
    zoom: number = 1.0;
    rotation: number = 0;
    viewport: Rectangle;
    
    constructor(viewport: Rectangle) {
        this.viewport = viewport;
    }
    
    worldToScreen(worldPos: Vector2): Vector2 {
        const rotatedX = Math.cos(this.rotation) * (worldPos.x - this.position.x) - 
                        Math.sin(this.rotation) * (worldPos.y - this.position.y);
        const rotatedY = Math.sin(this.rotation) * (worldPos.x - this.position.x) + 
                        Math.cos(this.rotation) * (worldPos.y - this.position.y);
        
        return {
            x: (rotatedX * this.zoom) + (this.viewport.width / 2),
            y: (rotatedY * this.zoom) + (this.viewport.height / 2)
        };
    }
    
    screenToWorld(screenPos: Vector2): Vector2 {
        const centeredX = screenPos.x - (this.viewport.width / 2);
        const centeredY = screenPos.y - (this.viewport.height / 2);
        
        const scaledX = centeredX / this.zoom;
        const scaledY = centeredY / this.zoom;
        
        return {
            x: Math.cos(-this.rotation) * scaledX - Math.sin(-this.rotation) * scaledY + this.position.x,
            y: Math.sin(-this.rotation) * scaledX + Math.cos(-this.rotation) * scaledY + this.position.y
        };
    }
    
    isInView(bounds: Rectangle): boolean {
        const worldViewport = {
            x: this.position.x - (this.viewport.width / 2) / this.zoom,
            y: this.position.y - (this.viewport.height / 2) / this.zoom,
            width: this.viewport.width / this.zoom,
            height: this.viewport.height / this.zoom
        };
        
        return !(bounds.x + bounds.width < worldViewport.x ||
                worldViewport.x + worldViewport.width < bounds.x ||
                bounds.y + bounds.height < worldViewport.y ||
                worldViewport.y + worldViewport.height < bounds.y);
    }
}

// Main rendering pipeline
class RenderPipeline {
    private layers: Map<string, RenderLayer>;
    private shaders: Map<string, Shader>;
    private camera: Camera;
    private context: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d')!;
        this.layers = new Map();
        this.shaders = new Map();
        this.camera = new Camera({ x: 0, y: 0, width: canvas.width, height: canvas.height });
        
        this.initializeDefaultLayers();
    }
    
    private initializeDefaultLayers(): void {
        this.addLayer('background', -1000);
        this.addLayer('terrain', -500);
        this.addLayer('entities', 0);
        this.addLayer('effects', 500);
        this.addLayer('ui', 1000);
    }
    
    addLayer(id: string, zIndex: number): RenderLayer {
        const layer: RenderLayer = {
            id,
            zIndex,
            visible: true,
            renderables: []
        };
        this.layers.set(id, layer);
        return layer;
    }
    
    addRenderable(renderable: Renderable): void {
        const layer = this.layers.get(renderable.layer);
        if (layer) {
            layer.renderables.push(renderable);
            // Sort by zIndex for proper draw order
            layer.renderables.sort((a, b) => a.zIndex - b.zIndex);
        }
    }
    
    removeRenderable(renderable: Renderable): void {
        const layer = this.layers.get(renderable.layer);
        if (layer) {
            const index = layer.renderables.indexOf(renderable);
            if (index !== -1) {
                layer.renderables.splice(index, 1);
            }
        }
    }
    
    render(scene: Scene): void {
        this.clearBuffers();
        this.updateLighting();
        this.renderLayers();
        this.applyPostProcessing();
    }
    
    private clearBuffers(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.fillStyle = '#000000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    private updateLighting(): void {
        // Implement dynamic lighting system
        // Could include ambient light, point lights, directional lights
    }
    
    private renderLayers(): void {
        // Sort layers by zIndex
        const sortedLayers = Array.from(this.layers.values())
            .filter(layer => layer.visible)
            .sort((a, b) => a.zIndex - b.zIndex);
        
        sortedLayers.forEach(layer => {
            this.renderLayer(layer);
        });
    }
    
    private renderLayer(layer: RenderLayer): void {
        layer.renderables
            .filter(renderable => renderable.visible)
            .forEach(renderable => {
                // Frustum culling - only render if in camera view
                const transform = renderable.entity.getComponent(TransformComponent);
                if (transform) {
                    const bounds = {
                        x: transform.position.x,
                        y: transform.position.y,
                        width: 32, // Default size, should be from sprite/bounds component
                        height: 32
                    };
                    
                    if (this.camera.isInView(bounds)) {
                        this.context.save();
                        renderable.render(this.context, this.camera);
                        this.context.restore();
                    }
                }
            });
    }
    
    private applyPostProcessing(): void {
        // Implement post-processing effects
        // Bloom, color grading, screen-space effects, etc.
    }
    
    setCamera(camera: Camera): void {
        this.camera = camera;
    }
    
    getCamera(): Camera {
        return this.camera;
    }
}
```

## AI Behavior System

Advanced AI system with behavior trees and state machines.

```typescript
// Base AI behavior interface
interface AIBehavior {
    update(agent: AIAgent, deltaTime: number): void;
    onEnter?(agent: AIAgent): void;
    onExit?(agent: AIAgent): void;
}

// AI Agent with decision making capabilities
class AIAgent {
    entity: Entity;
    position: Vector2;
    target: Entity | null = null;
    blackboard: Map<string, any> = new Map();
    currentBehavior: AIBehavior | null = null;
    
    constructor(entity: Entity) {
        this.entity = entity;
        const transform = entity.getComponent(TransformComponent);
        this.position = transform ? transform.position : { x: 0, y: 0 };
    }
    
    setBehavior(behavior: AIBehavior): void {
        if (this.currentBehavior && this.currentBehavior.onExit) {
            this.currentBehavior.onExit(this);
        }
        
        this.currentBehavior = behavior;
        
        if (behavior.onEnter) {
            behavior.onEnter(this);
        }
    }
    
    update(deltaTime: number): void {
        if (this.currentBehavior) {
            this.currentBehavior.update(this, deltaTime);
        }
    }
    
    moveTo(target: Vector2, speed: number = 1.0): void {
        const direction = Vector2.normalize(Vector2.subtract(target, this.position));
        const velocity = Vector2.multiply(direction, speed);
        
        this.position.x += velocity.x * 0.016; // Assuming 60 FPS
        this.position.y += velocity.y * 0.016;
        
        // Update entity transform
        const transform = this.entity.getComponent(TransformComponent);
        if (transform) {
            transform.position = this.position;
        }
    }
    
    distanceTo(target: Vector2): number {
        return Vector2.distance(this.position, target);
    }
    
    setBlackboardValue(key: string, value: any): void {
        this.blackboard.set(key, value);
    }
    
    getBlackboardValue(key: string): any {
        return this.blackboard.get(key);
    }
}

// Patrol behavior implementation
class PatrolBehavior implements AIBehavior {
    private waypoints: Vector2[];
    private currentIndex: number = 0;
    private speed: number;
    private waitTime: number;
    private currentWaitTime: number = 0;
    
    constructor(waypoints: Vector2[], speed: number = 50, waitTime: number = 2) {
        this.waypoints = waypoints;
        this.speed = speed;
        this.waitTime = waitTime;
    }
    
    onEnter(agent: AIAgent): void {
        agent.setBlackboardValue('patrolStartTime', Date.now());
    }
    
    update(agent: AIAgent, deltaTime: number): void {
        if (this.waypoints.length === 0) return;
        
        const currentTarget = this.waypoints[this.currentIndex];
        const distanceToTarget = agent.distanceTo(currentTarget);
        
        if (distanceToTarget < 5) {
            // Reached waypoint, wait then move to next
            this.currentWaitTime += deltaTime;
            
            if (this.currentWaitTime >= this.waitTime) {
                this.currentIndex = (this.currentIndex + 1) % this.waypoints.length;
                this.currentWaitTime = 0;
            }
        } else {
            // Move towards current waypoint
            agent.moveTo(currentTarget, this.speed);
        }
    }
    
    addWaypoint(waypoint: Vector2): void {
        this.waypoints.push(waypoint);
    }
    
    setSpeed(speed: number): void {
        this.speed = speed;
    }
}

// Chase behavior for aggressive enemies
class ChaseBehavior implements AIBehavior {
    private speed: number;
    private maxChaseDistance: number;
    private attackRange: number;
    
    constructor(speed: number = 75, maxChaseDistance: number = 200, attackRange: number = 30) {
        this.speed = speed;
        this.maxChaseDistance = maxChaseDistance;
        this.attackRange = attackRange;
    }
    
    update(agent: AIAgent, deltaTime: number): void {
        if (!agent.target) {
            // Find nearest player
            agent.target = this.findNearestPlayer(agent);
        }
        
        if (agent.target) {
            const targetTransform = agent.target.getComponent(TransformComponent);
            if (targetTransform) {
                const distance = agent.distanceTo(targetTransform.position);
                
                if (distance > this.maxChaseDistance) {
                    // Target too far, give up chase
                    agent.target = null;
                    agent.setBlackboardValue('lostTarget', true);
                } else if (distance <= this.attackRange) {
                    // In attack range
                    this.attack(agent);
                } else {
                    // Chase target
                    agent.moveTo(targetTransform.position, this.speed);
                }
            }
        }
    }
    
    private findNearestPlayer(agent: AIAgent): Entity | null {
        // Implementation would search for nearest player entity
        // This is a placeholder
        return null;
    }
    
    private attack(agent: AIAgent): void {
        // Implement attack logic
        agent.setBlackboardValue('lastAttackTime', Date.now());
    }
}

// State machine for complex AI behaviors
class AIStateMachine {
    private states: Map<string, AIBehavior> = new Map();
    private transitions: Map<string, Map<string, () => boolean>> = new Map();
    private currentState: string | null = null;
    private agent: AIAgent;
    
    constructor(agent: AIAgent) {
        this.agent = agent;
    }
    
    addState(name: string, behavior: AIBehavior): void {
        this.states.set(name, behavior);
        if (!this.transitions.has(name)) {
            this.transitions.set(name, new Map());
        }
    }
    
    addTransition(fromState: string, toState: string, condition: () => boolean): void {
        if (!this.transitions.has(fromState)) {
            this.transitions.set(fromState, new Map());
        }
        this.transitions.get(fromState)!.set(toState, condition);
    }
    
    setState(stateName: string): void {
        if (this.states.has(stateName)) {
            this.currentState = stateName;
            this.agent.setBehavior(this.states.get(stateName)!);
        }
    }
    
    update(deltaTime: number): void {
        if (this.currentState) {
            // Check for transitions
            const stateTransitions = this.transitions.get(this.currentState);
            if (stateTransitions) {
                for (const [toState, condition] of stateTransitions) {
                    if (condition()) {
                        this.setState(toState);
                        break;
                    }
                }
            }
            
            // Update current behavior
            this.agent.update(deltaTime);
        }
    }
}

// Behavior tree node types
abstract class BehaviorTreeNode {
    abstract execute(agent: AIAgent, deltaTime: number): BehaviorResult;
}

enum BehaviorResult {
    Success,
    Failure,
    Running
}

// Composite nodes
class SequenceNode extends BehaviorTreeNode {
    private children: BehaviorTreeNode[];
    private currentChild: number = 0;
    
    constructor(children: BehaviorTreeNode[]) {
        super();
        this.children = children;
    }
    
    execute(agent: AIAgent, deltaTime: number): BehaviorResult {
        while (this.currentChild < this.children.length) {
            const result = this.children[this.currentChild].execute(agent, deltaTime);
            
            if (result === BehaviorResult.Failure) {
                this.currentChild = 0;
                return BehaviorResult.Failure;
            } else if (result === BehaviorResult.Running) {
                return BehaviorResult.Running;
            }
            
            this.currentChild++;
        }
        
        this.currentChild = 0;
        return BehaviorResult.Success;
    }
}

class SelectorNode extends BehaviorTreeNode {
    private children: BehaviorTreeNode[];
    private currentChild: number = 0;
    
    constructor(children: BehaviorTreeNode[]) {
        super();
        this.children = children;
    }
    
    execute(agent: AIAgent, deltaTime: number): BehaviorResult {
        while (this.currentChild < this.children.length) {
            const result = this.children[this.currentChild].execute(agent, deltaTime);
            
            if (result === BehaviorResult.Success) {
                this.currentChild = 0;
                return BehaviorResult.Success;
            } else if (result === BehaviorResult.Running) {
                return BehaviorResult.Running;
            }
            
            this.currentChild++;
        }
        
        this.currentChild = 0;
        return BehaviorResult.Failure;
    }
}
```

## Utility Types

```typescript
// Vector2 utility interface
interface Vector2 {
    x: number;
    y: number;
}

namespace Vector2 {
    export function add(a: Vector2, b: Vector2): Vector2 {
        return { x: a.x + b.x, y: a.y + b.y };
    }
    
    export function subtract(a: Vector2, b: Vector2): Vector2 {
        return { x: a.x - b.x, y: a.y - b.y };
    }
    
    export function multiply(a: Vector2, scalar: number): Vector2 {
        return { x: a.x * scalar, y: a.y * scalar };
    }
    
    export function distance(a: Vector2, b: Vector2): number {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    export function normalize(a: Vector2): Vector2 {
        const magnitude = Math.sqrt(a.x * a.x + a.y * a.y);
        if (magnitude === 0) return { x: 0, y: 0 };
        return { x: a.x / magnitude, y: a.y / magnitude };
    }
}

// Rectangle utility interface
interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Scene interface for managing game objects
interface Scene {
    entities: Entity[];
    systems: System[];
    camera: Camera;
    
    addEntity(entity: Entity): void;
    removeEntity(entity: Entity): void;
    addSystem(system: System): void;
    update(deltaTime: number): void;
}
```

## Performance Considerations

### Object Pooling
```typescript
class ObjectPool<T> {
    private pool: T[] = [];
    private createFn: () => T;
    private resetFn: (obj: T) => void;
    
    constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        
        for (let i = 0; i < initialSize; i++) {
            this.pool.push(createFn());
        }
    }
    
    get(): T {
        if (this.pool.length > 0) {
            return this.pool.pop()!;
        } else {
            return this.createFn();
        }
    }
    
    release(obj: T): void {
        this.resetFn(obj);
        this.pool.push(obj);
    }
}
```

### Memory Management
- Use object pooling for frequently created/destroyed objects
- Implement proper cleanup in component destroy methods
- Avoid memory leaks by removing event listeners and references
- Use WeakMap and WeakSet where appropriate for automatic garbage collection

### Optimization Strategies
- Spatial partitioning (QuadTree) for collision detection
- Frustum culling for rendering
- Level-of-detail (LOD) for distant objects
- Batch rendering for similar objects
- Time-slicing for expensive operations
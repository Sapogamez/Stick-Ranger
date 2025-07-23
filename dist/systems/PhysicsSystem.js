"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysicsSystem = exports.CollisionDetector = exports.QuadTree = exports.PhysicsComponent = void 0;
const EntityComponentSystem_1 = require("./EntityComponentSystem");
// Physics Component
class PhysicsComponent {
    constructor(bounds, mass = 1.0, isStatic = false) {
        // Physics properties
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.mass = 1.0;
        this.isStatic = false;
        this.collisionLayer = 1; // What layer this object is on
        this.collisionMask = 1; // What layers this object collides with
        // Material properties
        this.bounciness = 0.3;
        this.friction = 0.7;
        // State tracking
        this.isGrounded = false;
        this.isColliding = false;
        this.bounds = bounds;
        this.mass = mass;
        this.isStatic = isStatic;
    }
    init() {
        // Initialize physics component
        this.updateBoundsFromTransform();
    }
    update(deltaTime) {
        if (this.isStatic)
            return;
        // Update bounds based on transform position
        this.updateBoundsFromTransform();
        // Physics integration is handled by the PhysicsSystem
    }
    updateBoundsFromTransform() {
        const transform = this.entity.getComponent(EntityComponentSystem_1.TransformComponent);
        if (transform) {
            this.bounds.x = transform.position.x - this.bounds.width / 2;
            this.bounds.y = transform.position.y - this.bounds.height / 2;
        }
    }
    addForce(force) {
        if (this.isStatic)
            return;
        this.acceleration.x += force.x / this.mass;
        this.acceleration.y += force.y / this.mass;
    }
    addImpulse(impulse) {
        if (this.isStatic)
            return;
        this.velocity.x += impulse.x / this.mass;
        this.velocity.y += impulse.y / this.mass;
    }
    setStatic(isStatic) {
        this.isStatic = isStatic;
        if (isStatic) {
            this.velocity = { x: 0, y: 0 };
            this.acceleration = { x: 0, y: 0 };
        }
    }
    getPhysicsBody() {
        const transform = this.entity.getComponent(EntityComponentSystem_1.TransformComponent);
        return {
            entity: this.entity,
            position: transform ? transform.position : { x: 0, y: 0 },
            velocity: this.velocity,
            bounds: this.bounds,
            mass: this.mass,
            isStatic: this.isStatic,
            collisionLayer: this.collisionLayer,
            collisionMask: this.collisionMask,
            bounciness: this.bounciness,
            friction: this.friction
        };
    }
}
exports.PhysicsComponent = PhysicsComponent;
// Spatial partitioning with QuadTree for performance optimization
class QuadTree {
    constructor(bounds, level = 0) {
        this.maxObjects = 10;
        this.maxLevels = 5;
        this.bounds = bounds;
        this.level = level;
        this.objects = [];
        this.children = [];
    }
    clear() {
        this.objects = [];
        this.children.forEach(child => child.clear());
        this.children = [];
    }
    insert(object) {
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
                }
                else {
                    i++;
                }
            }
        }
    }
    retrieve(object) {
        const index = this.getIndex(object);
        let returnObjects = [...this.objects];
        if (this.children.length > 0) {
            if (index !== -1) {
                returnObjects = returnObjects.concat(this.children[index].retrieve(object));
            }
            else {
                // Object spans multiple quadrants
                this.children.forEach(child => {
                    returnObjects = returnObjects.concat(child.retrieve(object));
                });
            }
        }
        return returnObjects;
    }
    split() {
        const subWidth = this.bounds.width / 2;
        const subHeight = this.bounds.height / 2;
        const x = this.bounds.x;
        const y = this.bounds.y;
        this.children[0] = new QuadTree({ x: x + subWidth, y: y, width: subWidth, height: subHeight }, this.level + 1);
        this.children[1] = new QuadTree({ x: x, y: y, width: subWidth, height: subHeight }, this.level + 1);
        this.children[2] = new QuadTree({ x: x, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1);
        this.children[3] = new QuadTree({ x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight }, this.level + 1);
    }
    getIndex(object) {
        let index = -1;
        const verticalMidpoint = this.bounds.x + (this.bounds.width / 2);
        const horizontalMidpoint = this.bounds.y + (this.bounds.height / 2);
        const topQuadrant = (object.bounds.y < horizontalMidpoint && object.bounds.y + object.bounds.height < horizontalMidpoint);
        const bottomQuadrant = (object.bounds.y > horizontalMidpoint);
        if (object.bounds.x < verticalMidpoint && object.bounds.x + object.bounds.width < verticalMidpoint) {
            if (topQuadrant) {
                index = 1;
            }
            else if (bottomQuadrant) {
                index = 2;
            }
        }
        else if (object.bounds.x > verticalMidpoint) {
            if (topQuadrant) {
                index = 0;
            }
            else if (bottomQuadrant) {
                index = 3;
            }
        }
        return index;
    }
    getTotalObjects() {
        let count = this.objects.length;
        this.children.forEach(child => {
            count += child.getTotalObjects();
        });
        return count;
    }
}
exports.QuadTree = QuadTree;
// Collision detection and response
class CollisionDetector {
    static isColliding(body1, body2) {
        return !(body1.bounds.x + body1.bounds.width < body2.bounds.x ||
            body2.bounds.x + body2.bounds.width < body1.bounds.x ||
            body1.bounds.y + body1.bounds.height < body2.bounds.y ||
            body2.bounds.y + body2.bounds.height < body1.bounds.y);
    }
    static calculateOverlap(body1, body2) {
        const overlapX = Math.min(body1.bounds.x + body1.bounds.width - body2.bounds.x, body2.bounds.x + body2.bounds.width - body1.bounds.x);
        const overlapY = Math.min(body1.bounds.y + body1.bounds.height - body2.bounds.y, body2.bounds.y + body2.bounds.height - body1.bounds.y);
        // Return separation vector (smaller overlap direction)
        if (overlapX < overlapY) {
            return {
                x: body1.bounds.x < body2.bounds.x ? -overlapX : overlapX,
                y: 0
            };
        }
        else {
            return {
                x: 0,
                y: body1.bounds.y < body2.bounds.y ? -overlapY : overlapY
            };
        }
    }
    static resolveCollision(body1, body2) {
        if (body1.isStatic && body2.isStatic)
            return;
        const overlap = this.calculateOverlap(body1, body2);
        // Position correction
        if (!body1.isStatic && !body2.isStatic) {
            // Both dynamic - split the correction based on mass
            const totalMass = body1.mass + body2.mass;
            const ratio1 = body2.mass / totalMass;
            const ratio2 = body1.mass / totalMass;
            body1.position.x -= overlap.x * ratio1;
            body1.position.y -= overlap.y * ratio1;
            body2.position.x += overlap.x * ratio2;
            body2.position.y += overlap.y * ratio2;
        }
        else if (!body1.isStatic) {
            // Only body1 is dynamic
            body1.position.x -= overlap.x;
            body1.position.y -= overlap.y;
        }
        else if (!body2.isStatic) {
            // Only body2 is dynamic
            body2.position.x += overlap.x;
            body2.position.y += overlap.y;
        }
        // Velocity correction (bounce and friction)
        this.resolveVelocities(body1, body2, overlap);
    }
    static resolveVelocities(body1, body2, overlap) {
        if (body1.isStatic && body2.isStatic)
            return;
        // Determine collision normal
        const normal = this.normalizeVector(overlap);
        // Calculate relative velocity
        const relativeVelocity = {
            x: body2.velocity.x - body1.velocity.x,
            y: body2.velocity.y - body1.velocity.y
        };
        // Calculate relative velocity in collision normal direction
        const velocityAlongNormal = relativeVelocity.x * normal.x + relativeVelocity.y * normal.y;
        // Do not resolve if velocities are separating
        if (velocityAlongNormal > 0)
            return;
        // Calculate restitution (bounciness)
        const restitution = Math.min(body1.bounciness, body2.bounciness);
        // Calculate impulse scalar
        let impulseScalar = -(1 + restitution) * velocityAlongNormal;
        if (!body1.isStatic && !body2.isStatic) {
            impulseScalar /= (1 / body1.mass + 1 / body2.mass);
        }
        else if (body1.isStatic) {
            impulseScalar /= (1 / body2.mass);
        }
        else if (body2.isStatic) {
            impulseScalar /= (1 / body1.mass);
        }
        // Apply impulse
        const impulse = {
            x: impulseScalar * normal.x,
            y: impulseScalar * normal.y
        };
        if (!body1.isStatic) {
            body1.velocity.x -= impulse.x / body1.mass;
            body1.velocity.y -= impulse.y / body1.mass;
        }
        if (!body2.isStatic) {
            body2.velocity.x += impulse.x / body2.mass;
            body2.velocity.y += impulse.y / body2.mass;
        }
        // Apply friction
        this.applyFriction(body1, body2, normal);
    }
    static applyFriction(body1, body2, normal) {
        // Calculate friction coefficient
        const friction = Math.sqrt(body1.friction * body2.friction);
        // Calculate tangent vector
        const relativeVelocity = {
            x: body2.velocity.x - body1.velocity.x,
            y: body2.velocity.y - body1.velocity.y
        };
        const tangent = {
            x: relativeVelocity.x - (relativeVelocity.x * normal.x + relativeVelocity.y * normal.y) * normal.x,
            y: relativeVelocity.y - (relativeVelocity.x * normal.x + relativeVelocity.y * normal.y) * normal.y
        };
        // Normalize tangent
        const tangentLength = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y);
        if (tangentLength > 0.01) {
            tangent.x /= tangentLength;
            tangent.y /= tangentLength;
            // Calculate friction impulse
            let frictionImpulse = -(relativeVelocity.x * tangent.x + relativeVelocity.y * tangent.y);
            if (!body1.isStatic && !body2.isStatic) {
                frictionImpulse /= (1 / body1.mass + 1 / body2.mass);
            }
            else if (body1.isStatic) {
                frictionImpulse /= (1 / body2.mass);
            }
            else if (body2.isStatic) {
                frictionImpulse /= (1 / body1.mass);
            }
            frictionImpulse *= friction;
            // Apply friction
            if (!body1.isStatic) {
                body1.velocity.x -= frictionImpulse * tangent.x / body1.mass;
                body1.velocity.y -= frictionImpulse * tangent.y / body1.mass;
            }
            if (!body2.isStatic) {
                body2.velocity.x += frictionImpulse * tangent.x / body2.mass;
                body2.velocity.y += frictionImpulse * tangent.y / body2.mass;
            }
        }
    }
    static normalizeVector(vector) {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (length === 0)
            return { x: 0, y: 0 };
        return { x: vector.x / length, y: vector.y / length };
    }
}
exports.CollisionDetector = CollisionDetector;
// Main Physics System
class PhysicsSystem extends EntityComponentSystem_1.System {
    constructor(worldBounds) {
        super();
        this.gravity = { x: 0, y: 9.81 * 100 }; // Scaled for pixel coordinates
        this.timeAccumulator = 0;
        this.fixedTimeStep = 1 / 60; // 60 FPS physics
        // Performance tracking
        this.collisionChecks = 0;
        this.collisionResolutions = 0;
        this.worldBounds = worldBounds;
        this.quadTree = new QuadTree(worldBounds);
    }
    update(deltaTime) {
        // Use fixed timestep for stable physics
        this.timeAccumulator += deltaTime;
        while (this.timeAccumulator >= this.fixedTimeStep) {
            this.fixedUpdate(this.fixedTimeStep);
            this.timeAccumulator -= this.fixedTimeStep;
        }
        // Interpolate positions between fixed updates
        const alpha = this.timeAccumulator / this.fixedTimeStep;
        this.interpolatePositions(alpha);
    }
    fixedUpdate(deltaTime) {
        this.collisionChecks = 0;
        this.collisionResolutions = 0;
        // Clear quad tree
        this.quadTree.clear();
        // Get all physics bodies
        const physicsBodies = [];
        this.entities.forEach(entity => {
            const physics = entity.getComponent(PhysicsComponent);
            if (physics) {
                physicsBodies.push(physics.getPhysicsBody());
            }
        });
        // Update physics integration
        this.updatePhysics(physicsBodies, deltaTime);
        // Populate quad tree
        physicsBodies.forEach(body => {
            this.quadTree.insert(body);
        });
        // Check collisions
        this.checkCollisions(physicsBodies);
        // Update entity transforms
        this.updateTransforms(physicsBodies);
        // Debug output
        if (this.collisionChecks > 0) {
            console.debug(`Physics: ${this.collisionChecks} checks, ${this.collisionResolutions} resolutions`);
        }
    }
    updatePhysics(bodies, deltaTime) {
        bodies.forEach(body => {
            if (body.isStatic)
                return;
            const physics = body.entity.getComponent(PhysicsComponent);
            if (!physics)
                return;
            // Apply gravity
            physics.addForce({
                x: this.gravity.x * physics.mass,
                y: this.gravity.y * physics.mass
            });
            // Integrate velocity
            physics.velocity.x += physics.acceleration.x * deltaTime;
            physics.velocity.y += physics.acceleration.y * deltaTime;
            // Integrate position
            body.position.x += physics.velocity.x * deltaTime;
            body.position.y += physics.velocity.y * deltaTime;
            // Apply damping
            const damping = 0.99;
            physics.velocity.x *= Math.pow(damping, deltaTime);
            physics.velocity.y *= Math.pow(damping, deltaTime);
            // Reset acceleration
            physics.acceleration = { x: 0, y: 0 };
            // Update bounds
            body.bounds.x = body.position.x - body.bounds.width / 2;
            body.bounds.y = body.position.y - body.bounds.height / 2;
            // World bounds checking
            this.constrainToWorldBounds(body, physics);
        });
    }
    checkCollisions(bodies) {
        bodies.forEach(body => {
            if (this.shouldCheckCollisions(body)) {
                const candidates = this.quadTree.retrieve(body);
                candidates.forEach(other => {
                    if (body !== other && this.shouldCollide(body, other)) {
                        this.collisionChecks++;
                        if (CollisionDetector.isColliding(body, other)) {
                            CollisionDetector.resolveCollision(body, other);
                            this.collisionResolutions++;
                            // Trigger collision events
                            this.triggerCollisionEvent(body, other);
                        }
                    }
                });
            }
        });
    }
    shouldCheckCollisions(body) {
        // Skip collision checks for static bodies that aren't moving
        return !body.isStatic || (body.velocity.x !== 0 || body.velocity.y !== 0);
    }
    shouldCollide(body1, body2) {
        return (body1.collisionLayer & body2.collisionMask) !== 0 ||
            (body2.collisionLayer & body1.collisionMask) !== 0;
    }
    updateTransforms(bodies) {
        bodies.forEach(body => {
            const transform = body.entity.getComponent(EntityComponentSystem_1.TransformComponent);
            if (transform) {
                transform.position = Object.assign({}, body.position);
            }
        });
    }
    interpolatePositions(alpha) {
        // For smooth visual representation between fixed updates
        // This would require storing previous positions
        // Implementation depends on rendering requirements
    }
    constrainToWorldBounds(body, physics) {
        // Left boundary
        if (body.bounds.x < this.worldBounds.x) {
            body.position.x = this.worldBounds.x + body.bounds.width / 2;
            physics.velocity.x = Math.abs(physics.velocity.x) * physics.bounciness;
        }
        // Right boundary
        if (body.bounds.x + body.bounds.width > this.worldBounds.x + this.worldBounds.width) {
            body.position.x = this.worldBounds.x + this.worldBounds.width - body.bounds.width / 2;
            physics.velocity.x = -Math.abs(physics.velocity.x) * physics.bounciness;
        }
        // Top boundary
        if (body.bounds.y < this.worldBounds.y) {
            body.position.y = this.worldBounds.y + body.bounds.height / 2;
            physics.velocity.y = Math.abs(physics.velocity.y) * physics.bounciness;
        }
        // Bottom boundary
        if (body.bounds.y + body.bounds.height > this.worldBounds.y + this.worldBounds.height) {
            body.position.y = this.worldBounds.y + this.worldBounds.height - body.bounds.height / 2;
            physics.velocity.y = -Math.abs(physics.velocity.y) * physics.bounciness;
            physics.isGrounded = true;
        }
        else {
            physics.isGrounded = false;
        }
    }
    triggerCollisionEvent(body1, body2) {
        // Trigger collision events on both entities
        // This could be used for damage, sound effects, particle effects, etc.
        console.debug(`Collision between ${body1.entity.id} and ${body2.entity.id}`);
    }
    // Public methods for external systems
    setGravity(gravity) {
        this.gravity = Object.assign({}, gravity);
    }
    getGravity() {
        return Object.assign({}, this.gravity);
    }
    addForceToEntity(entityId, force) {
        const entity = this.entities.find(e => e.id === entityId);
        if (entity) {
            const physics = entity.getComponent(PhysicsComponent);
            if (physics) {
                physics.addForce(force);
            }
        }
    }
    addImpulseToEntity(entityId, impulse) {
        const entity = this.entities.find(e => e.id === entityId);
        if (entity) {
            const physics = entity.getComponent(PhysicsComponent);
            if (physics) {
                physics.addImpulse(impulse);
            }
        }
    }
    raycast(origin, direction, maxDistance) {
        // Simple raycast implementation
        const step = 5; // Step size in pixels
        const normalizedDirection = this.normalizeVector(direction);
        for (let distance = 0; distance < maxDistance; distance += step) {
            const testPoint = {
                x: origin.x + normalizedDirection.x * distance,
                y: origin.y + normalizedDirection.y * distance
            };
            // Check if point intersects with any physics body
            for (const entity of this.entities) {
                const physics = entity.getComponent(PhysicsComponent);
                if (physics && this.pointInBounds(testPoint, physics.bounds)) {
                    return entity;
                }
            }
        }
        return null;
    }
    pointInBounds(point, bounds) {
        return point.x >= bounds.x && point.x <= bounds.x + bounds.width &&
            point.y >= bounds.y && point.y <= bounds.y + bounds.height;
    }
    normalizeVector(vector) {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
        if (length === 0)
            return { x: 0, y: 0 };
        return { x: vector.x / length, y: vector.y / length };
    }
    getPerformanceStats() {
        return {
            collisionChecks: this.collisionChecks,
            collisionResolutions: this.collisionResolutions,
            quadTreeObjects: this.quadTree.getTotalObjects()
        };
    }
}
exports.PhysicsSystem = PhysicsSystem;

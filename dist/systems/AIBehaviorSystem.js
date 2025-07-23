"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AISystem = exports.AIStateMachine = exports.AttackBehavior = exports.FleeBehavior = exports.ChaseBehavior = exports.PatrolBehavior = exports.IdleBehavior = exports.BaseBehavior = exports.AIAgentComponent = void 0;
const EntityComponentSystem_1 = require("./EntityComponentSystem");
/**
 * AI Behavior System
 *
 * Provides advanced AI behaviors including state machines, behavior trees,
 * and common patterns like patrol, chase, and flee.
 */
// AI Agent Implementation
class AIAgentComponent {
    constructor(entity) {
        this.target = null;
        this.blackboard = new Map();
        this.currentBehavior = null;
        // AI Configuration
        this.detectionRange = 100;
        this.attackRange = 30;
        this.speed = 50;
        // State tracking
        this.lastSeenTargetPosition = null;
        this.alertLevel = 0; // 0 = calm, 1 = alert, 2 = combat
        this.entity = entity;
        const transform = entity.getComponent(EntityComponentSystem_1.TransformComponent);
        this.position = transform ? transform.position : { x: 0, y: 0 };
    }
    setBehavior(behavior) {
        if (this.currentBehavior && this.currentBehavior.onExit) {
            this.currentBehavior.onExit(this);
        }
        this.currentBehavior = behavior;
        if (behavior.onEnter) {
            behavior.onEnter(this);
        }
    }
    update(deltaTime) {
        // Update position from transform
        const transform = this.entity.getComponent(EntityComponentSystem_1.TransformComponent);
        if (transform) {
            this.position = transform.position;
        }
        // Update alert level over time
        if (this.alertLevel > 0) {
            this.alertLevel = Math.max(0, this.alertLevel - deltaTime * 0.1);
        }
        // Update current behavior
        if (this.currentBehavior) {
            this.currentBehavior.update(this, deltaTime);
        }
    }
    moveTo(target, speed) {
        const moveSpeed = speed || this.speed;
        const direction = this.getDirectionTo(target);
        const distance = this.distanceTo(target);
        if (distance > 5) { // Don't move if very close
            const transform = this.entity.getComponent(EntityComponentSystem_1.TransformComponent);
            if (transform) {
                const movement = {
                    x: direction.x * moveSpeed * 0.016, // Assuming 60 FPS
                    y: direction.y * moveSpeed * 0.016
                };
                transform.position.x += movement.x;
                transform.position.y += movement.y;
                this.position = transform.position;
            }
        }
    }
    getDirectionTo(target) {
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        if (length === 0)
            return { x: 0, y: 0 };
        return { x: dx / length, y: dy / length };
    }
    distanceTo(target) {
        const dx = this.position.x - target.x;
        const dy = this.position.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    setBlackboardValue(key, value) {
        this.blackboard.set(key, value);
    }
    getBlackboardValue(key) {
        return this.blackboard.get(key);
    }
    canSeeTarget(target) {
        const targetTransform = target.getComponent(EntityComponentSystem_1.TransformComponent);
        if (!targetTransform)
            return false;
        const distance = this.distanceTo(targetTransform.position);
        return distance <= this.detectionRange;
    }
    isInAttackRange(target) {
        const targetTransform = target.getComponent(EntityComponentSystem_1.TransformComponent);
        if (!targetTransform)
            return false;
        const distance = this.distanceTo(targetTransform.position);
        return distance <= this.attackRange;
    }
    raiseAlert(level) {
        this.alertLevel = Math.max(this.alertLevel, level);
    }
}
exports.AIAgentComponent = AIAgentComponent;
// Base Behavior Classes
class BaseBehavior {
    onEnter(agent) {
        // Default empty implementation
    }
    onExit(agent) {
        // Default empty implementation
    }
}
exports.BaseBehavior = BaseBehavior;
// Idle Behavior - Just wait around
class IdleBehavior extends BaseBehavior {
    constructor(idleTime = 3) {
        super();
        this.idleTime = 0;
        this.totalIdleTime = idleTime;
    }
    onEnter(agent) {
        this.idleTime = this.totalIdleTime;
        agent.setBlackboardValue('idleStartTime', Date.now());
    }
    update(agent, deltaTime) {
        this.idleTime -= deltaTime;
        // Look for targets while idle
        if (agent instanceof AIAgentComponent) {
            // In a real implementation, you'd search for nearby entities
            // For now, just reduce alert level
            if (agent.alertLevel > 0) {
                agent.alertLevel = Math.max(0, agent.alertLevel - deltaTime * 0.5);
            }
        }
    }
    isComplete() {
        return this.idleTime <= 0;
    }
}
exports.IdleBehavior = IdleBehavior;
// Patrol Behavior - Move between waypoints
class PatrolBehavior extends BaseBehavior {
    constructor(waypoints, speed = 50, waitTime = 2) {
        super();
        this.currentIndex = 0;
        this.currentWaitTime = 0;
        this.isWaiting = false;
        this.waypoints = [...waypoints];
        this.speed = speed;
        this.waitTime = waitTime;
    }
    onEnter(agent) {
        agent.setBlackboardValue('patrolStartTime', Date.now());
        agent.setBlackboardValue('originalSpeed', agent.speed);
        this.currentWaitTime = 0;
        this.isWaiting = false;
    }
    update(agent, deltaTime) {
        if (this.waypoints.length === 0)
            return;
        const currentTarget = this.waypoints[this.currentIndex];
        const distanceToTarget = agent.distanceTo(currentTarget);
        if (distanceToTarget < 10) {
            // Reached waypoint
            if (!this.isWaiting) {
                this.isWaiting = true;
                this.currentWaitTime = this.waitTime;
            }
            else {
                this.currentWaitTime -= deltaTime;
                if (this.currentWaitTime <= 0) {
                    // Move to next waypoint
                    this.currentIndex = (this.currentIndex + 1) % this.waypoints.length;
                    this.isWaiting = false;
                }
            }
        }
        else {
            // Move towards current waypoint
            if (!this.isWaiting) {
                agent.moveTo(currentTarget, this.speed);
            }
        }
        // Check for targets while patrolling
        if (agent instanceof AIAgentComponent) {
            // Simple detection would go here
        }
    }
    addWaypoint(waypoint) {
        this.waypoints.push(waypoint);
    }
    setSpeed(speed) {
        this.speed = speed;
    }
    getCurrentWaypoint() {
        return this.waypoints.length > 0 ? this.waypoints[this.currentIndex] : null;
    }
}
exports.PatrolBehavior = PatrolBehavior;
// Chase Behavior - Pursue a target
class ChaseBehavior extends BaseBehavior {
    constructor(speed = 75, maxChaseDistance = 200) {
        super();
        this.lostTargetTime = 0;
        this.maxLostTime = 5; // Give up chase after 5 seconds
        this.speed = speed;
        this.maxChaseDistance = maxChaseDistance;
    }
    onEnter(agent) {
        agent.setBlackboardValue('chaseStartTime', Date.now());
        this.lostTargetTime = 0;
        if (agent instanceof AIAgentComponent) {
            agent.raiseAlert(2); // High alert
        }
    }
    update(agent, deltaTime) {
        if (!agent.target) {
            this.lostTargetTime += deltaTime;
            return;
        }
        const targetTransform = agent.target.getComponent(EntityComponentSystem_1.TransformComponent);
        if (!targetTransform) {
            agent.target = null;
            return;
        }
        const distance = agent.distanceTo(targetTransform.position);
        // Check if target is too far
        if (distance > this.maxChaseDistance) {
            this.lostTargetTime += deltaTime;
            agent.setBlackboardValue('lastSeenPosition', targetTransform.position);
            if (this.lostTargetTime >= this.maxLostTime) {
                agent.target = null;
                agent.setBlackboardValue('gaveUpChase', true);
            }
            return;
        }
        // Reset lost time if we can see target
        this.lostTargetTime = 0;
        // Update last seen position
        if (agent instanceof AIAgentComponent) {
            agent.lastSeenTargetPosition = Object.assign({}, targetTransform.position);
        }
        // Move towards target
        agent.moveTo(targetTransform.position, this.speed);
        // Check if in attack range
        if (agent instanceof AIAgentComponent && agent.isInAttackRange(agent.target)) {
            agent.setBlackboardValue('inAttackRange', true);
        }
    }
    onExit(agent) {
        agent.setBlackboardValue('chaseEndTime', Date.now());
    }
    hasLostTarget() {
        return this.lostTargetTime >= this.maxLostTime;
    }
    getTimeLost() {
        return this.lostTargetTime;
    }
}
exports.ChaseBehavior = ChaseBehavior;
// Flee Behavior - Run away from threats
class FleeBehavior extends BaseBehavior {
    constructor(fleeSpeed = 100, safeDistance = 150) {
        super();
        this.fleeDirection = null;
        this.fleeSpeed = fleeSpeed;
        this.safeDistance = safeDistance;
    }
    onEnter(agent) {
        agent.setBlackboardValue('fleeStartTime', Date.now());
        this.calculateFleeDirection(agent);
        if (agent instanceof AIAgentComponent) {
            agent.raiseAlert(1); // Medium alert
        }
    }
    update(agent, deltaTime) {
        if (!agent.target || !this.fleeDirection)
            return;
        const targetTransform = agent.target.getComponent(EntityComponentSystem_1.TransformComponent);
        if (!targetTransform) {
            agent.target = null;
            return;
        }
        const distance = agent.distanceTo(targetTransform.position);
        // Check if we've reached safe distance
        if (distance >= this.safeDistance) {
            agent.setBlackboardValue('reachedSafety', true);
            return;
        }
        // Continue fleeing
        const fleeTarget = {
            x: agent.position.x + this.fleeDirection.x * 100,
            y: agent.position.y + this.fleeDirection.y * 100
        };
        agent.moveTo(fleeTarget, this.fleeSpeed);
        // Recalculate flee direction periodically
        this.calculateFleeDirection(agent);
    }
    calculateFleeDirection(agent) {
        if (!agent.target)
            return;
        const targetTransform = agent.target.getComponent(EntityComponentSystem_1.TransformComponent);
        if (!targetTransform)
            return;
        // Direction away from target
        const directionToTarget = agent.getDirectionTo(targetTransform.position);
        this.fleeDirection = {
            x: -directionToTarget.x,
            y: -directionToTarget.y
        };
    }
    isSafe(agent) {
        if (!agent.target)
            return true;
        const targetTransform = agent.target.getComponent(EntityComponentSystem_1.TransformComponent);
        if (!targetTransform)
            return true;
        return agent.distanceTo(targetTransform.position) >= this.safeDistance;
    }
}
exports.FleeBehavior = FleeBehavior;
// Attack Behavior - Combat actions
class AttackBehavior extends BaseBehavior {
    constructor(attackRate = 1, damage = 20) {
        super();
        this.attackCooldown = 0;
        this.attackRate = 1; // Attacks per second
        this.attackRate = attackRate;
        this.damage = damage;
    }
    onEnter(agent) {
        agent.setBlackboardValue('combatStartTime', Date.now());
        this.attackCooldown = 0;
    }
    update(agent, deltaTime) {
        this.attackCooldown -= deltaTime;
        if (!agent.target)
            return;
        if (agent instanceof AIAgentComponent && !agent.isInAttackRange(agent.target)) {
            agent.setBlackboardValue('targetOutOfRange', true);
            return;
        }
        // Attack if cooldown is ready
        if (this.attackCooldown <= 0) {
            this.performAttack(agent);
            this.attackCooldown = 1 / this.attackRate;
        }
    }
    performAttack(agent) {
        if (!agent.target)
            return;
        const targetHealth = agent.target.getComponent(EntityComponentSystem_1.HealthComponent);
        if (targetHealth) {
            targetHealth.takeDamage(this.damage, 'melee', agent.entity);
            console.log(`${agent.entity.id} attacks ${agent.target.id} for ${this.damage} damage`);
        }
        agent.setBlackboardValue('lastAttackTime', Date.now());
    }
    canAttack() {
        return this.attackCooldown <= 0;
    }
    getAttackCooldown() {
        return this.attackCooldown;
    }
}
exports.AttackBehavior = AttackBehavior;
// State Machine for AI
class AIStateMachine {
    constructor(agent) {
        this.states = new Map();
        this.transitions = new Map();
        this.currentState = null;
        this.agent = agent;
    }
    addState(name, behavior) {
        this.states.set(name, behavior);
        if (!this.transitions.has(name)) {
            this.transitions.set(name, new Map());
        }
    }
    addTransition(fromState, toState, condition) {
        if (!this.transitions.has(fromState)) {
            this.transitions.set(fromState, new Map());
        }
        this.transitions.get(fromState).set(toState, condition);
    }
    setState(stateName) {
        if (this.states.has(stateName)) {
            this.currentState = stateName;
            this.agent.setBehavior(this.states.get(stateName));
        }
    }
    getCurrentState() {
        return this.currentState;
    }
    update(deltaTime) {
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
    getAvailableStates() {
        return Array.from(this.states.keys());
    }
    hasState(stateName) {
        return this.states.has(stateName);
    }
}
exports.AIStateMachine = AIStateMachine;
// AI System Manager
class AISystem {
    constructor() {
        this.agents = [];
    }
    addAgent(agent) {
        this.agents.push(agent);
    }
    removeAgent(agent) {
        const index = this.agents.indexOf(agent);
        if (index !== -1) {
            this.agents.splice(index, 1);
        }
    }
    update(deltaTime) {
        this.agents.forEach(agent => {
            agent.update(deltaTime);
        });
    }
    getAgentCount() {
        return this.agents.length;
    }
    getAgentsInRange(position, range) {
        return this.agents.filter(agent => {
            const distance = Math.sqrt(Math.pow(agent.position.x - position.x, 2) +
                Math.pow(agent.position.y - position.y, 2));
            return distance <= range;
        });
    }
    createBasicEnemyAI(entity) {
        const agent = new AIAgentComponent(entity);
        // Create a simple state machine
        const stateMachine = new AIStateMachine(agent);
        // Add states
        stateMachine.addState('idle', new IdleBehavior(3));
        stateMachine.addState('patrol', new PatrolBehavior([
            { x: agent.position.x - 50, y: agent.position.y },
            { x: agent.position.x + 50, y: agent.position.y },
            { x: agent.position.x, y: agent.position.y - 50 },
            { x: agent.position.x, y: agent.position.y + 50 }
        ]));
        stateMachine.addState('chase', new ChaseBehavior());
        stateMachine.addState('attack', new AttackBehavior());
        stateMachine.addState('flee', new FleeBehavior());
        // Add transitions
        stateMachine.addTransition('idle', 'patrol', () => {
            const idle = agent.currentBehavior;
            return idle.isComplete();
        });
        stateMachine.addTransition('patrol', 'chase', () => {
            return agent.target !== null && agent.canSeeTarget(agent.target);
        });
        stateMachine.addTransition('chase', 'attack', () => {
            return agent.target !== null && agent.isInAttackRange(agent.target);
        });
        stateMachine.addTransition('attack', 'chase', () => {
            return agent.target !== null && !agent.isInAttackRange(agent.target);
        });
        stateMachine.addTransition('chase', 'patrol', () => {
            return agent.target === null || agent.currentBehavior.hasLostTarget();
        });
        stateMachine.addTransition('attack', 'flee', () => {
            const health = agent.entity.getComponent(EntityComponentSystem_1.HealthComponent);
            return health ? health.getHealthRatio() < 0.25 : false;
        });
        // Start in idle state
        stateMachine.setState('idle');
        // Store state machine in blackboard
        agent.setBlackboardValue('stateMachine', stateMachine);
        this.addAgent(agent);
        return agent;
    }
}
exports.AISystem = AISystem;

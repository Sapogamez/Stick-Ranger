import { Vector2, AIBehaviorInterface, AIAgent } from '../types/game';
import { Entity, TransformComponent, HealthComponent } from './EntityComponentSystem';

/**
 * AI Behavior System
 * 
 * Provides advanced AI behaviors including state machines, behavior trees,
 * and common patterns like patrol, chase, and flee.
 */

// AI Agent Implementation
export class AIAgentComponent implements AIAgent {
    entity: Entity;
    position: Vector2;
    target: Entity | null = null;
    blackboard: Map<string, any> = new Map();
    currentBehavior: AIBehaviorInterface | null = null;
    
    // AI Configuration
    detectionRange: number = 100;
    attackRange: number = 30;
    speed: number = 50;
    
    // State tracking
    lastSeenTargetPosition: Vector2 | null = null;
    alertLevel: number = 0; // 0 = calm, 1 = alert, 2 = combat
    
    constructor(entity: Entity) {
        this.entity = entity;
        const transform = entity.getComponent(TransformComponent);
        this.position = transform ? transform.position : { x: 0, y: 0 };
    }
    
    setBehavior(behavior: AIBehaviorInterface): void {
        if (this.currentBehavior && this.currentBehavior.onExit) {
            this.currentBehavior.onExit(this);
        }
        
        this.currentBehavior = behavior;
        
        if (behavior.onEnter) {
            behavior.onEnter(this);
        }
    }
    
    update(deltaTime: number): void {
        // Update position from transform
        const transform = this.entity.getComponent(TransformComponent);
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
    
    moveTo(target: Vector2, speed?: number): void {
        const moveSpeed = speed || this.speed;
        const direction = this.getDirectionTo(target);
        const distance = this.distanceTo(target);
        
        if (distance > 5) { // Don't move if very close
            const transform = this.entity.getComponent(TransformComponent);
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
    
    getDirectionTo(target: Vector2): Vector2 {
        const dx = target.x - this.position.x;
        const dy = target.y - this.position.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        
        if (length === 0) return { x: 0, y: 0 };
        
        return { x: dx / length, y: dy / length };
    }
    
    distanceTo(target: Vector2): number {
        const dx = this.position.x - target.x;
        const dy = this.position.y - target.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    setBlackboardValue(key: string, value: any): void {
        this.blackboard.set(key, value);
    }
    
    getBlackboardValue(key: string): any {
        return this.blackboard.get(key);
    }
    
    canSeeTarget(target: Entity): boolean {
        const targetTransform = target.getComponent(TransformComponent);
        if (!targetTransform) return false;
        
        const distance = this.distanceTo(targetTransform.position);
        return distance <= this.detectionRange;
    }
    
    isInAttackRange(target: Entity): boolean {
        const targetTransform = target.getComponent(TransformComponent);
        if (!targetTransform) return false;
        
        const distance = this.distanceTo(targetTransform.position);
        return distance <= this.attackRange;
    }
    
    raiseAlert(level: number): void {
        this.alertLevel = Math.max(this.alertLevel, level);
    }
}

// Base Behavior Classes
export abstract class BaseBehavior implements AIBehaviorInterface {
    abstract update(agent: AIAgent, deltaTime: number): void;
    
    onEnter?(agent: AIAgent): void {
        // Default empty implementation
    }
    
    onExit?(agent: AIAgent): void {
        // Default empty implementation
    }
}

// Idle Behavior - Just wait around
export class IdleBehavior extends BaseBehavior {
    private idleTime: number = 0;
    private totalIdleTime: number;
    
    constructor(idleTime: number = 3) {
        super();
        this.totalIdleTime = idleTime;
    }
    
    onEnter(agent: AIAgent): void {
        this.idleTime = this.totalIdleTime;
        (agent as AIAgentComponent).setBlackboardValue('idleStartTime', Date.now());
    }
    
    update(agent: AIAgent, deltaTime: number): void {
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
    
    isComplete(): boolean {
        return this.idleTime <= 0;
    }
}

// Patrol Behavior - Move between waypoints
export class PatrolBehavior extends BaseBehavior {
    private waypoints: Vector2[];
    private currentIndex: number = 0;
    private speed: number;
    private waitTime: number;
    private currentWaitTime: number = 0;
    private isWaiting: boolean = false;
    
    constructor(waypoints: Vector2[], speed: number = 50, waitTime: number = 2) {
        super();
        this.waypoints = [...waypoints];
        this.speed = speed;
        this.waitTime = waitTime;
    }
    
    onEnter(agent: AIAgent): void {
        (agent as AIAgentComponent).setBlackboardValue('patrolStartTime', Date.now());
        (agent as AIAgentComponent).setBlackboardValue('originalSpeed', (agent as AIAgentComponent).speed);
        this.currentWaitTime = 0;
        this.isWaiting = false;
    }
    
    update(agent: AIAgent, deltaTime: number): void {
        if (this.waypoints.length === 0) return;
        
        const currentTarget = this.waypoints[this.currentIndex];
        const distanceToTarget = (agent as AIAgentComponent).distanceTo(currentTarget);
        
        if (distanceToTarget < 10) {
            // Reached waypoint
            if (!this.isWaiting) {
                this.isWaiting = true;
                this.currentWaitTime = this.waitTime;
            } else {
                this.currentWaitTime -= deltaTime;
                
                if (this.currentWaitTime <= 0) {
                    // Move to next waypoint
                    this.currentIndex = (this.currentIndex + 1) % this.waypoints.length;
                    this.isWaiting = false;
                }
            }
        } else {
            // Move towards current waypoint
            if (!this.isWaiting) {
                (agent as AIAgentComponent).moveTo(currentTarget, this.speed);
            }
        }
        
        // Check for targets while patrolling
        if (agent instanceof AIAgentComponent) {
            // Simple detection would go here
        }
    }
    
    addWaypoint(waypoint: Vector2): void {
        this.waypoints.push(waypoint);
    }
    
    setSpeed(speed: number): void {
        this.speed = speed;
    }
    
    getCurrentWaypoint(): Vector2 | null {
        return this.waypoints.length > 0 ? this.waypoints[this.currentIndex] : null;
    }
}

// Chase Behavior - Pursue a target
export class ChaseBehavior extends BaseBehavior {
    private speed: number;
    private maxChaseDistance: number;
    private lostTargetTime: number = 0;
    private maxLostTime: number = 5; // Give up chase after 5 seconds
    
    constructor(speed: number = 75, maxChaseDistance: number = 200) {
        super();
        this.speed = speed;
        this.maxChaseDistance = maxChaseDistance;
    }
    
    onEnter(agent: AIAgent): void {
        (agent as AIAgentComponent).setBlackboardValue('chaseStartTime', Date.now());
        this.lostTargetTime = 0;
        
        if (agent instanceof AIAgentComponent) {
            agent.raiseAlert(2); // High alert
        }
    }
    
    update(agent: AIAgent, deltaTime: number): void {
        if (!agent.target) {
            this.lostTargetTime += deltaTime;
            return;
        }
        
        const targetTransform = agent.target.getComponent(TransformComponent);
        if (!targetTransform) {
            agent.target = null;
            return;
        }
        
        const distance = (agent as AIAgentComponent).distanceTo(targetTransform.position);
        
        // Check if target is too far
        if (distance > this.maxChaseDistance) {
            this.lostTargetTime += deltaTime;
            (agent as AIAgentComponent).setBlackboardValue('lastSeenPosition', targetTransform.position);
            
            if (this.lostTargetTime >= this.maxLostTime) {
                agent.target = null;
                (agent as AIAgentComponent).setBlackboardValue('gaveUpChase', true);
            }
            return;
        }
        
        // Reset lost time if we can see target
        this.lostTargetTime = 0;
        
        // Update last seen position
        if (agent instanceof AIAgentComponent) {
            agent.lastSeenTargetPosition = { ...targetTransform.position };
        }
        
        // Move towards target
        (agent as AIAgentComponent).moveTo(targetTransform.position, this.speed);
        
        // Check if in attack range
        if (agent instanceof AIAgentComponent && agent.isInAttackRange(agent.target)) {
            (agent as AIAgentComponent).setBlackboardValue('inAttackRange', true);
        }
    }
    
    onExit(agent: AIAgent): void {
        (agent as AIAgentComponent).setBlackboardValue('chaseEndTime', Date.now());
    }
    
    hasLostTarget(): boolean {
        return this.lostTargetTime >= this.maxLostTime;
    }
    
    getTimeLost(): number {
        return this.lostTargetTime;
    }
}

// Flee Behavior - Run away from threats
export class FleeBehavior extends BaseBehavior {
    private fleeSpeed: number;
    private safeDistance: number;
    private fleeDirection: Vector2 | null = null;
    
    constructor(fleeSpeed: number = 100, safeDistance: number = 150) {
        super();
        this.fleeSpeed = fleeSpeed;
        this.safeDistance = safeDistance;
    }
    
    onEnter(agent: AIAgent): void {
        (agent as AIAgentComponent).setBlackboardValue('fleeStartTime', Date.now());
        this.calculateFleeDirection(agent);
        
        if (agent instanceof AIAgentComponent) {
            agent.raiseAlert(1); // Medium alert
        }
    }
    
    update(agent: AIAgent, deltaTime: number): void {
        if (!agent.target || !this.fleeDirection) return;
        
        const targetTransform = agent.target.getComponent(TransformComponent);
        if (!targetTransform) {
            agent.target = null;
            return;
        }
        
        const distance = (agent as AIAgentComponent).distanceTo(targetTransform.position);
        
        // Check if we've reached safe distance
        if (distance >= this.safeDistance) {
            (agent as AIAgentComponent).setBlackboardValue('reachedSafety', true);
            return;
        }
        
        // Continue fleeing
        const fleeTarget = {
            x: agent.position.x + this.fleeDirection.x * 100,
            y: agent.position.y + this.fleeDirection.y * 100
        };
        
        (agent as AIAgentComponent).moveTo(fleeTarget, this.fleeSpeed);
        
        // Recalculate flee direction periodically
        this.calculateFleeDirection(agent);
    }
    
    private calculateFleeDirection(agent: AIAgent): void {
        if (!agent.target) return;
        
        const targetTransform = agent.target.getComponent(TransformComponent);
        if (!targetTransform) return;
        
        // Direction away from target
        const directionToTarget = (agent as AIAgentComponent).getDirectionTo(targetTransform.position);
        this.fleeDirection = {
            x: -directionToTarget.x,
            y: -directionToTarget.y
        };
    }
    
    isSafe(agent: AIAgent): boolean {
        if (!agent.target) return true;
        
        const targetTransform = agent.target.getComponent(TransformComponent);
        if (!targetTransform) return true;
        
        return (agent as AIAgentComponent).distanceTo(targetTransform.position) >= this.safeDistance;
    }
}

// Attack Behavior - Combat actions
export class AttackBehavior extends BaseBehavior {
    private attackCooldown: number = 0;
    private attackRate: number = 1; // Attacks per second
    private damage: number;
    
    constructor(attackRate: number = 1, damage: number = 20) {
        super();
        this.attackRate = attackRate;
        this.damage = damage;
    }
    
    onEnter(agent: AIAgent): void {
        (agent as AIAgentComponent).setBlackboardValue('combatStartTime', Date.now());
        this.attackCooldown = 0;
    }
    
    update(agent: AIAgent, deltaTime: number): void {
        this.attackCooldown -= deltaTime;
        
        if (!agent.target) return;
        
        if (agent instanceof AIAgentComponent && !agent.isInAttackRange(agent.target)) {
            (agent as AIAgentComponent).setBlackboardValue('targetOutOfRange', true);
            return;
        }
        
        // Attack if cooldown is ready
        if (this.attackCooldown <= 0) {
            this.performAttack(agent);
            this.attackCooldown = 1 / this.attackRate;
        }
    }
    
    private performAttack(agent: AIAgent): void {
        if (!agent.target) return;
        
        const targetHealth = agent.target.getComponent(HealthComponent);
        if (targetHealth) {
            targetHealth.takeDamage(this.damage, 'melee', (agent as AIAgentComponent).entity);
            console.log(`${agent.entity.id} attacks ${agent.target.id} for ${this.damage} damage`);
        }
        
        (agent as AIAgentComponent).setBlackboardValue('lastAttackTime', Date.now());
    }
    
    canAttack(): boolean {
        return this.attackCooldown <= 0;
    }
    
    getAttackCooldown(): number {
        return this.attackCooldown;
    }
}

// State Machine for AI
export class AIStateMachine {
    private states: Map<string, AIBehaviorInterface> = new Map();
    private transitions: Map<string, Map<string, () => boolean>> = new Map();
    private currentState: string | null = null;
    private agent: AIAgent;
    
    constructor(agent: AIAgent) {
        this.agent = agent;
    }
    
    addState(name: string, behavior: AIBehaviorInterface): void {
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
            (this.agent as AIAgentComponent).setBehavior(this.states.get(stateName)!);
        }
    }
    
    getCurrentState(): string | null {
        return this.currentState;
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
            (this.agent as AIAgentComponent).update(deltaTime);
        }
    }
    
    getAvailableStates(): string[] {
        return Array.from(this.states.keys());
    }
    
    hasState(stateName: string): boolean {
        return this.states.has(stateName);
    }
}

// AI System Manager
export class AISystem {
    private agents: AIAgentComponent[] = [];
    
    addAgent(agent: AIAgentComponent): void {
        this.agents.push(agent);
    }
    
    removeAgent(agent: AIAgentComponent): void {
        const index = this.agents.indexOf(agent);
        if (index !== -1) {
            this.agents.splice(index, 1);
        }
    }
    
    update(deltaTime: number): void {
        this.agents.forEach(agent => {
            agent.update(deltaTime);
        });
    }
    
    getAgentCount(): number {
        return this.agents.length;
    }
    
    getAgentsInRange(position: Vector2, range: number): AIAgentComponent[] {
        return this.agents.filter(agent => {
            const distance = Math.sqrt(
                Math.pow(agent.position.x - position.x, 2) +
                Math.pow(agent.position.y - position.y, 2)
            );
            return distance <= range;
        });
    }
    
    createBasicEnemyAI(entity: Entity): AIAgentComponent {
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
            const idle = agent.currentBehavior as IdleBehavior;
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
            return agent.target === null || (agent.currentBehavior as ChaseBehavior).hasLostTarget();
        });
        
        stateMachine.addTransition('attack', 'flee', () => {
            const health = agent.entity.getComponent(HealthComponent);
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
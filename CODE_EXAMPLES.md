# Code Examples

This document provides implementation examples for advanced game systems including networking, particle effects, and input management.

## Networking Implementation

### Real-time Multiplayer System

```typescript
// Network message types
enum MessageType {
    STATE_UPDATE = 'STATE_UPDATE',
    PLAYER_ACTION = 'PLAYER_ACTION',
    SPAWN_ENTITY = 'SPAWN_ENTITY',
    DESTROY_ENTITY = 'DESTROY_ENTITY',
    CHAT_MESSAGE = 'CHAT_MESSAGE',
    PLAYER_CONNECT = 'PLAYER_CONNECT',
    PLAYER_DISCONNECT = 'PLAYER_DISCONNECT'
}

// Network message interface
interface NetworkMessage {
    type: MessageType;
    timestamp: number;
    playerId: string;
    data: any;
}

// Entity state for networking
interface EntityState {
    id: string;
    position: Vector2;
    rotation: number;
    velocity: Vector2;
    health: number;
    animation: string;
    timestamp: number;
}

// Main network manager
class NetworkManager {
    private socket: WebSocket;
    private entityStates: Map<string, EntityState>;
    private interpolation: boolean = true;
    private interpolationBuffer: Map<string, EntityState[]>;
    private latency: number = 0;
    private playerId: string;
    private isHost: boolean = false;
    
    // Event callbacks
    private onPlayerConnect?: (playerId: string) => void;
    private onPlayerDisconnect?: (playerId: string) => void;
    private onEntitySpawn?: (entity: EntityState) => void;
    private onEntityDestroy?: (entityId: string) => void;
    
    constructor(serverUrl: string, playerId: string) {
        this.playerId = playerId;
        this.entityStates = new Map();
        this.interpolationBuffer = new Map();
        this.socket = new WebSocket(serverUrl);
        this.setupHandlers();
    }
    
    private setupHandlers(): void {
        this.socket.onopen = () => {
            console.log('Connected to game server');
            this.sendMessage({
                type: MessageType.PLAYER_CONNECT,
                timestamp: Date.now(),
                playerId: this.playerId,
                data: { name: 'Player', class: 'Warrior' }
            });
        };
        
        this.socket.onmessage = (event) => {
            try {
                const message: NetworkMessage = JSON.parse(event.data);
                this.handleMessage(message);
            } catch (error) {
                console.error('Failed to parse network message:', error);
            }
        };
        
        this.socket.onclose = () => {
            console.log('Disconnected from game server');
            this.attemptReconnect();
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }
    
    private handleMessage(message: NetworkMessage): void {
        // Calculate latency
        this.latency = Date.now() - message.timestamp;
        
        switch (message.type) {
            case MessageType.STATE_UPDATE:
                this.handleStateUpdate(message.data.entities);
                break;
                
            case MessageType.SPAWN_ENTITY:
                this.handleSpawnEntity(message.data.entity);
                break;
                
            case MessageType.DESTROY_ENTITY:
                this.handleDestroyEntity(message.data.entityId);
                break;
                
            case MessageType.PLAYER_CONNECT:
                if (this.onPlayerConnect) {
                    this.onPlayerConnect(message.playerId);
                }
                break;
                
            case MessageType.PLAYER_DISCONNECT:
                if (this.onPlayerDisconnect) {
                    this.onPlayerDisconnect(message.playerId);
                }
                break;
                
            case MessageType.PLAYER_ACTION:
                this.handlePlayerAction(message);
                break;
                
            case MessageType.CHAT_MESSAGE:
                this.handleChatMessage(message.data);
                break;
        }
    }
    
    private handleStateUpdate(entities: EntityState[]): void {
        entities.forEach(state => {
            if (this.interpolation) {
                this.addToInterpolationBuffer(state);
            } else {
                this.applyState(state);
            }
        });
    }
    
    private addToInterpolationBuffer(state: EntityState): void {
        if (!this.interpolationBuffer.has(state.id)) {
            this.interpolationBuffer.set(state.id, []);
        }
        
        const buffer = this.interpolationBuffer.get(state.id)!;
        buffer.push(state);
        
        // Keep only last 3 states for interpolation
        if (buffer.length > 3) {
            buffer.shift();
        }
    }
    
    private interpolateState(entityId: string, currentTime: number): EntityState | null {
        const buffer = this.interpolationBuffer.get(entityId);
        if (!buffer || buffer.length < 2) return null;
        
        // Find the two states to interpolate between
        let fromState = buffer[0];
        let toState = buffer[1];
        
        for (let i = 0; i < buffer.length - 1; i++) {
            if (buffer[i].timestamp <= currentTime && buffer[i + 1].timestamp > currentTime) {
                fromState = buffer[i];
                toState = buffer[i + 1];
                break;
            }
        }
        
        // Calculate interpolation factor
        const timeDiff = toState.timestamp - fromState.timestamp;
        const factor = timeDiff > 0 ? (currentTime - fromState.timestamp) / timeDiff : 0;
        const clampedFactor = Math.max(0, Math.min(1, factor));
        
        // Interpolate between states
        return {
            id: entityId,
            position: {
                x: this.lerp(fromState.position.x, toState.position.x, clampedFactor),
                y: this.lerp(fromState.position.y, toState.position.y, clampedFactor)
            },
            rotation: this.lerpAngle(fromState.rotation, toState.rotation, clampedFactor),
            velocity: toState.velocity, // Use latest velocity
            health: toState.health, // Use latest health
            animation: toState.animation, // Use latest animation
            timestamp: currentTime
        };
    }
    
    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }
    
    private lerpAngle(a: number, b: number, t: number): number {
        // Handle angle wrapping for smooth rotation interpolation
        let diff = b - a;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        return a + diff * t;
    }
    
    private applyState(state: EntityState): void {
        this.entityStates.set(state.id, state);
        
        // Update actual game entity
        const entity = this.findEntityById(state.id);
        if (entity) {
            const transform = entity.getComponent(TransformComponent);
            if (transform) {
                transform.position = state.position;
                transform.rotation = state.rotation;
            }
            
            const health = entity.getComponent(HealthComponent);
            if (health) {
                health.currentHealth = state.health;
            }
        }
    }
    
    private handleSpawnEntity(entityData: any): void {
        if (this.onEntitySpawn) {
            this.onEntitySpawn(entityData);
        }
    }
    
    private handleDestroyEntity(entityId: string): void {
        this.entityStates.delete(entityId);
        this.interpolationBuffer.delete(entityId);
        
        if (this.onEntityDestroy) {
            this.onEntityDestroy(entityId);
        }
    }
    
    private handlePlayerAction(message: NetworkMessage): void {
        // Process player actions from other players
        // This could include movement, attacks, ability usage, etc.
        console.log(`Player ${message.playerId} performed action:`, message.data);
    }
    
    private handleChatMessage(data: any): void {
        console.log(`[${data.playerName}]: ${data.message}`);
    }
    
    // Public methods for sending data
    sendPlayerAction(action: string, data: any): void {
        this.sendMessage({
            type: MessageType.PLAYER_ACTION,
            timestamp: Date.now(),
            playerId: this.playerId,
            data: { action, ...data }
        });
    }
    
    sendChatMessage(message: string): void {
        this.sendMessage({
            type: MessageType.CHAT_MESSAGE,
            timestamp: Date.now(),
            playerId: this.playerId,
            data: { message }
        });
    }
    
    private sendMessage(message: NetworkMessage): void {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(message));
        } else {
            console.warn('Cannot send message: WebSocket not connected');
        }
    }
    
    // Update interpolation (call this every frame)
    update(deltaTime: number): void {
        if (this.interpolation) {
            const currentTime = Date.now() - this.latency;
            
            this.interpolationBuffer.forEach((buffer, entityId) => {
                const interpolatedState = this.interpolateState(entityId, currentTime);
                if (interpolatedState) {
                    this.applyState(interpolatedState);
                }
            });
        }
    }
    
    private findEntityById(id: string): Entity | null {
        // This would be implemented by the game's entity manager
        return null;
    }
    
    private attemptReconnect(): void {
        setTimeout(() => {
            console.log('Attempting to reconnect...');
            this.setupHandlers();
        }, 3000);
    }
    
    // Event handlers
    setOnPlayerConnect(callback: (playerId: string) => void): void {
        this.onPlayerConnect = callback;
    }
    
    setOnPlayerDisconnect(callback: (playerId: string) => void): void {
        this.onPlayerDisconnect = callback;
    }
    
    setOnEntitySpawn(callback: (entity: EntityState) => void): void {
        this.onEntitySpawn = callback;
    }
    
    setOnEntityDestroy(callback: (entityId: string) => void): void {
        this.onEntityDestroy = callback;
    }
    
    getLatency(): number {
        return this.latency;
    }
    
    isConnected(): boolean {
        return this.socket.readyState === WebSocket.OPEN;
    }
    
    disconnect(): void {
        this.socket.close();
    }
}

// Client-side prediction for responsive controls
class ClientPrediction {
    private networkManager: NetworkManager;
    private localPlayer: Entity;
    private inputBuffer: PlayerInput[] = [];
    private lastConfirmedState: EntityState | null = null;
    private predictionEnabled: boolean = true;
    
    constructor(networkManager: NetworkManager, localPlayer: Entity) {
        this.networkManager = networkManager;
        this.localPlayer = localPlayer;
    }
    
    processInput(input: PlayerInput): void {
        // Store input for potential rollback
        input.timestamp = Date.now();
        input.sequence = this.getNextSequenceNumber();
        this.inputBuffer.push(input);
        
        // Apply input locally for immediate response
        if (this.predictionEnabled) {
            this.applyInput(this.localPlayer, input);
        }
        
        // Send to server
        this.networkManager.sendPlayerAction('input', input);
        
        // Clean old inputs
        this.cleanInputBuffer();
    }
    
    onServerStateUpdate(serverState: EntityState): void {
        if (serverState.id !== this.localPlayer.id) return;
        
        this.lastConfirmedState = serverState;
        
        if (this.predictionEnabled) {
            // Check if prediction was correct
            const currentTransform = this.localPlayer.getComponent(TransformComponent);
            if (currentTransform) {
                const positionError = Vector2.distance(currentTransform.position, serverState.position);
                
                if (positionError > 5) { // Threshold for correction
                    // Rollback and replay
                    this.rollbackAndReplay(serverState);
                }
            }
        } else {
            // No prediction, just apply server state
            this.applyServerState(serverState);
        }
    }
    
    private rollbackAndReplay(serverState: EntityState): void {
        // Set to server state
        this.applyServerState(serverState);
        
        // Replay all inputs after the server timestamp
        const inputsToReplay = this.inputBuffer.filter(input => 
            input.timestamp > serverState.timestamp
        );
        
        inputsToReplay.forEach(input => {
            this.applyInput(this.localPlayer, input);
        });
    }
    
    private applyServerState(state: EntityState): void {
        const transform = this.localPlayer.getComponent(TransformComponent);
        const health = this.localPlayer.getComponent(HealthComponent);
        
        if (transform) {
            transform.position = state.position;
            transform.rotation = state.rotation;
        }
        
        if (health) {
            health.currentHealth = state.health;
        }
    }
    
    private applyInput(entity: Entity, input: PlayerInput): void {
        const transform = entity.getComponent(TransformComponent);
        if (!transform) return;
        
        const speed = 100; // Units per second
        const deltaTime = 0.016; // Assume 60 FPS
        
        if (input.moveDirection.x !== 0 || input.moveDirection.y !== 0) {
            const normalizedDirection = Vector2.normalize(input.moveDirection);
            const movement = Vector2.multiply(normalizedDirection, speed * deltaTime);
            transform.position = Vector2.add(transform.position, movement);
        }
        
        if (input.rotation !== undefined) {
            transform.rotation = input.rotation;
        }
    }
    
    private getNextSequenceNumber(): number {
        return this.inputBuffer.length;
    }
    
    private cleanInputBuffer(): void {
        // Keep only last 60 inputs (1 second at 60 FPS)
        if (this.inputBuffer.length > 60) {
            this.inputBuffer = this.inputBuffer.slice(-60);
        }
    }
    
    setPredictionEnabled(enabled: boolean): void {
        this.predictionEnabled = enabled;
    }
}

interface PlayerInput {
    moveDirection: Vector2;
    rotation?: number;
    actions: string[]; // e.g., ['fire', 'reload', 'ability1']
    timestamp: number;
    sequence: number;
}
```

## Particle System

### Advanced Particle Effects

```typescript
// Particle data structure
interface Particle {
    position: Vector2;
    velocity: Vector2;
    acceleration: Vector2;
    life: number;
    maxLife: number;
    size: number;
    color: Color;
    alpha: number;
    rotation: number;
    angularVelocity: number;
    
    // Animation properties
    sizeOverTime?: AnimationCurve;
    colorOverTime?: ColorGradient;
    alphaOverTime?: AnimationCurve;
}

interface Color {
    r: number; // 0-255
    g: number; // 0-255
    b: number; // 0-255
}

// Animation curve for smooth value transitions
class AnimationCurve {
    private keyframes: { time: number; value: number; }[];
    
    constructor(keyframes: { time: number; value: number; }[]) {
        this.keyframes = keyframes.sort((a, b) => a.time - b.time);
    }
    
    evaluate(time: number): number {
        if (this.keyframes.length === 0) return 0;
        if (this.keyframes.length === 1) return this.keyframes[0].value;
        
        // Clamp time to curve bounds
        time = Math.max(0, Math.min(1, time));
        
        // Find keyframes to interpolate between
        for (let i = 0; i < this.keyframes.length - 1; i++) {
            const current = this.keyframes[i];
            const next = this.keyframes[i + 1];
            
            if (time >= current.time && time <= next.time) {
                const t = (time - current.time) / (next.time - current.time);
                return this.lerp(current.value, next.value, t);
            }
        }
        
        // If time is beyond last keyframe
        return this.keyframes[this.keyframes.length - 1].value;
    }
    
    private lerp(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }
}

// Color gradient for smooth color transitions
class ColorGradient {
    private colorStops: { time: number; color: Color; }[];
    
    constructor(colorStops: { time: number; color: Color; }[]) {
        this.colorStops = colorStops.sort((a, b) => a.time - b.time);
    }
    
    evaluate(time: number): Color {
        if (this.colorStops.length === 0) return { r: 255, g: 255, b: 255 };
        if (this.colorStops.length === 1) return this.colorStops[0].color;
        
        time = Math.max(0, Math.min(1, time));
        
        for (let i = 0; i < this.colorStops.length - 1; i++) {
            const current = this.colorStops[i];
            const next = this.colorStops[i + 1];
            
            if (time >= current.time && time <= next.time) {
                const t = (time - current.time) / (next.time - current.time);
                return this.lerpColor(current.color, next.color, t);
            }
        }
        
        return this.colorStops[this.colorStops.length - 1].color;
    }
    
    private lerpColor(a: Color, b: Color, t: number): Color {
        return {
            r: Math.round(a.r + (b.r - a.r) * t),
            g: Math.round(a.g + (b.g - a.g) * t),
            b: Math.round(a.b + (b.b - a.b) * t)
        };
    }
}

// Particle emitter configuration
interface EmitterConfig {
    // Emission properties
    emissionRate: number; // Particles per second
    burstCount: number; // Particles per burst
    duration: number; // Emitter lifetime (-1 for infinite)
    
    // Particle lifetime
    startLifetime: { min: number; max: number; };
    
    // Spawn properties
    startSpeed: { min: number; max: number; };
    startSize: { min: number; max: number; };
    startColor: Color;
    startAlpha: { min: number; max: number; };
    
    // Physics
    gravity: Vector2;
    damping: number; // Air resistance (0-1)
    
    // Shape and direction
    shape: EmitterShape;
    direction: Vector2;
    spreadAngle: number; // Radians
    
    // Animation
    sizeOverTime?: AnimationCurve;
    colorOverTime?: ColorGradient;
    alphaOverTime?: AnimationCurve;
    
    // Rendering
    texture?: string; // Texture name/path
    blendMode: BlendMode;
    renderLayer: string;
}

enum EmitterShape {
    Point,
    Circle,
    Rectangle,
    Line,
    Cone
}

enum BlendMode {
    Normal,
    Additive,
    Multiply,
    Screen
}

// Particle emitter class
class ParticleEmitter {
    private config: EmitterConfig;
    private particles: Particle[];
    private position: Vector2;
    private isActive: boolean = true;
    private age: number = 0;
    private emissionTimer: number = 0;
    
    constructor(config: EmitterConfig, position: Vector2) {
        this.config = { ...config }; // Clone config
        this.position = position;
        this.particles = [];
    }
    
    update(deltaTime: number): void {
        if (!this.isActive) return;
        
        this.age += deltaTime;
        
        // Check if emitter should stop
        if (this.config.duration > 0 && this.age >= this.config.duration) {
            this.isActive = false;
        }
        
        // Emit new particles
        if (this.isActive) {
            this.emissionTimer += deltaTime;
            const emissionInterval = 1.0 / this.config.emissionRate;
            
            while (this.emissionTimer >= emissionInterval) {
                this.emitParticle();
                this.emissionTimer -= emissionInterval;
            }
        }
        
        // Update existing particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            this.updateParticle(particle, deltaTime);
            
            if (!this.isParticleAlive(particle)) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    private emitParticle(): void {
        const particle: Particle = {
            position: this.getSpawnPosition(),
            velocity: this.getInitialVelocity(),
            acceleration: { x: 0, y: 0 },
            life: 0,
            maxLife: this.randomRange(this.config.startLifetime.min, this.config.startLifetime.max),
            size: this.randomRange(this.config.startSize.min, this.config.startSize.max),
            color: { ...this.config.startColor },
            alpha: this.randomRange(this.config.startAlpha.min, this.config.startAlpha.max),
            rotation: Math.random() * Math.PI * 2,
            angularVelocity: (Math.random() - 0.5) * 4,
            
            sizeOverTime: this.config.sizeOverTime,
            colorOverTime: this.config.colorOverTime,
            alphaOverTime: this.config.alphaOverTime
        };
        
        this.particles.push(particle);
    }
    
    private getSpawnPosition(): Vector2 {
        switch (this.config.shape) {
            case EmitterShape.Point:
                return { ...this.position };
                
            case EmitterShape.Circle:
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 20; // Configurable radius
                return {
                    x: this.position.x + Math.cos(angle) * radius,
                    y: this.position.y + Math.sin(angle) * radius
                };
                
            case EmitterShape.Rectangle:
                return {
                    x: this.position.x + (Math.random() - 0.5) * 40, // Configurable width
                    y: this.position.y + (Math.random() - 0.5) * 20  // Configurable height
                };
                
            case EmitterShape.Line:
                const t = Math.random();
                return {
                    x: this.position.x + t * 50, // Configurable line length
                    y: this.position.y
                };
                
            default:
                return { ...this.position };
        }
    }
    
    private getInitialVelocity(): Vector2 {
        const speed = this.randomRange(this.config.startSpeed.min, this.config.startSpeed.max);
        const baseAngle = Math.atan2(this.config.direction.y, this.config.direction.x);
        const spreadOffset = (Math.random() - 0.5) * this.config.spreadAngle;
        const finalAngle = baseAngle + spreadOffset;
        
        return {
            x: Math.cos(finalAngle) * speed,
            y: Math.sin(finalAngle) * speed
        };
    }
    
    private updateParticle(particle: Particle, deltaTime: number): void {
        particle.life += deltaTime;
        const normalizedLife = particle.life / particle.maxLife;
        
        // Apply physics
        particle.acceleration = Vector2.add(particle.acceleration, this.config.gravity);
        particle.velocity = Vector2.add(particle.velocity, Vector2.multiply(particle.acceleration, deltaTime));
        
        // Apply damping
        particle.velocity = Vector2.multiply(particle.velocity, Math.pow(1 - this.config.damping, deltaTime));
        
        // Update position
        particle.position = Vector2.add(particle.position, Vector2.multiply(particle.velocity, deltaTime));
        
        // Update visual properties based on curves
        if (particle.sizeOverTime) {
            particle.size = particle.sizeOverTime.evaluate(normalizedLife);
        }
        
        if (particle.colorOverTime) {
            particle.color = particle.colorOverTime.evaluate(normalizedLife);
        }
        
        if (particle.alphaOverTime) {
            particle.alpha = particle.alphaOverTime.evaluate(normalizedLife);
        }
        
        // Update rotation
        particle.rotation += particle.angularVelocity * deltaTime;
        
        // Reset acceleration for next frame
        particle.acceleration = { x: 0, y: 0 };
    }
    
    private isParticleAlive(particle: Particle): boolean {
        return particle.life < particle.maxLife && particle.alpha > 0;
    }
    
    private randomRange(min: number, max: number): number {
        return min + Math.random() * (max - min);
    }
    
    render(context: CanvasRenderingContext2D, camera: Camera): void {
        this.particles.forEach(particle => {
            this.renderParticle(context, particle, camera);
        });
    }
    
    private renderParticle(context: CanvasRenderingContext2D, particle: Particle, camera: Camera): void {
        const screenPos = camera.worldToScreen(particle.position);
        
        context.save();
        
        // Set blend mode
        context.globalCompositeOperation = this.getBlendMode();
        context.globalAlpha = particle.alpha;
        
        // Transform
        context.translate(screenPos.x, screenPos.y);
        context.rotate(particle.rotation);
        context.scale(particle.size, particle.size);
        
        // Render particle
        if (this.config.texture) {
            // Render textured particle (would need texture loading system)
            this.renderTexturedParticle(context, particle);
        } else {
            // Render colored circle
            context.fillStyle = `rgb(${particle.color.r}, ${particle.color.g}, ${particle.color.b})`;
            context.beginPath();
            context.arc(0, 0, 1, 0, Math.PI * 2);
            context.fill();
        }
        
        context.restore();
    }
    
    private renderTexturedParticle(context: CanvasRenderingContext2D, particle: Particle): void {
        // Implementation for textured particles
        // Would require texture management system
    }
    
    private getBlendMode(): GlobalCompositeOperation {
        switch (this.config.blendMode) {
            case BlendMode.Normal: return 'source-over';
            case BlendMode.Additive: return 'lighter';
            case BlendMode.Multiply: return 'multiply';
            case BlendMode.Screen: return 'screen';
            default: return 'source-over';
        }
    }
    
    // Public methods
    emit(): void {
        for (let i = 0; i < this.config.burstCount; i++) {
            this.emitParticle();
        }
    }
    
    setPosition(position: Vector2): void {
        this.position = position;
    }
    
    stop(): void {
        this.isActive = false;
    }
    
    isAlive(): boolean {
        return this.isActive || this.particles.length > 0;
    }
    
    getParticleCount(): number {
        return this.particles.length;
    }
}

// Main particle system manager
class ParticleSystem {
    private emitters: ParticleEmitter[];
    private context: CanvasRenderingContext2D;
    private camera: Camera;
    
    constructor(context: CanvasRenderingContext2D, camera: Camera) {
        this.emitters = [];
        this.context = context;
        this.camera = camera;
    }
    
    createEmitter(config: EmitterConfig, position: Vector2): ParticleEmitter {
        const emitter = new ParticleEmitter(config, position);
        this.emitters.push(emitter);
        return emitter;
    }
    
    removeEmitter(emitter: ParticleEmitter): void {
        const index = this.emitters.indexOf(emitter);
        if (index !== -1) {
            this.emitters.splice(index, 1);
        }
    }
    
    update(deltaTime: number): void {
        // Update all emitters
        this.emitters.forEach(emitter => emitter.update(deltaTime));
        
        // Remove dead emitters
        this.emitters = this.emitters.filter(emitter => emitter.isAlive());
    }
    
    render(): void {
        this.emitters.forEach(emitter => {
            emitter.render(this.context, this.camera);
        });
    }
    
    getTotalParticleCount(): number {
        return this.emitters.reduce((total, emitter) => total + emitter.getParticleCount(), 0);
    }
    
    clear(): void {
        this.emitters.forEach(emitter => emitter.stop());
    }
    
    // Preset effect creators
    createExplosion(position: Vector2): ParticleEmitter {
        const config: EmitterConfig = {
            emissionRate: 0,
            burstCount: 50,
            duration: 0.1,
            startLifetime: { min: 1.0, max: 2.0 },
            startSpeed: { min: 50, max: 150 },
            startSize: { min: 2, max: 8 },
            startColor: { r: 255, g: 150, b: 0 },
            startAlpha: { min: 0.8, max: 1.0 },
            gravity: { x: 0, y: 50 },
            damping: 0.05,
            shape: EmitterShape.Circle,
            direction: { x: 0, y: -1 },
            spreadAngle: Math.PI * 2,
            alphaOverTime: new AnimationCurve([
                { time: 0, value: 1 },
                { time: 0.7, value: 0.8 },
                { time: 1, value: 0 }
            ]),
            colorOverTime: new ColorGradient([
                { time: 0, color: { r: 255, g: 200, b: 100 } },
                { time: 0.5, color: { r: 255, g: 100, b: 50 } },
                { time: 1, color: { r: 100, g: 50, b: 50 } }
            ]),
            blendMode: BlendMode.Additive,
            renderLayer: 'effects'
        };
        
        return this.createEmitter(config, position);
    }
    
    createBloodSplatter(position: Vector2): ParticleEmitter {
        const config: EmitterConfig = {
            emissionRate: 0,
            burstCount: 20,
            duration: 0.1,
            startLifetime: { min: 0.5, max: 1.5 },
            startSpeed: { min: 30, max: 80 },
            startSize: { min: 1, max: 4 },
            startColor: { r: 150, g: 0, b: 0 },
            startAlpha: { min: 0.9, max: 1.0 },
            gravity: { x: 0, y: 100 },
            damping: 0.1,
            shape: EmitterShape.Point,
            direction: { x: 0, y: -1 },
            spreadAngle: Math.PI * 0.8,
            alphaOverTime: new AnimationCurve([
                { time: 0, value: 1 },
                { time: 0.8, value: 0.5 },
                { time: 1, value: 0 }
            ]),
            blendMode: BlendMode.Normal,
            renderLayer: 'effects'
        };
        
        return this.createEmitter(config, position);
    }
    
    createMuzzleFlash(position: Vector2, direction: Vector2): ParticleEmitter {
        const config: EmitterConfig = {
            emissionRate: 0,
            burstCount: 15,
            duration: 0.05,
            startLifetime: { min: 0.1, max: 0.3 },
            startSpeed: { min: 100, max: 200 },
            startSize: { min: 3, max: 6 },
            startColor: { r: 255, g: 255, b: 200 },
            startAlpha: { min: 1.0, max: 1.0 },
            gravity: { x: 0, y: 0 },
            damping: 0.2,
            shape: EmitterShape.Cone,
            direction: direction,
            spreadAngle: Math.PI * 0.3,
            alphaOverTime: new AnimationCurve([
                { time: 0, value: 1 },
                { time: 1, value: 0 }
            ]),
            blendMode: BlendMode.Additive,
            renderLayer: 'effects'
        };
        
        return this.createEmitter(config, position);
    }
}
```

## Input System

### Comprehensive Input Management

```typescript
// Input action mapping
interface InputAction {
    name: string;
    keys: string[];
    mouseButtons?: number[];
    gamepadButtons?: number[];
    description: string;
}

// Input state tracking
interface InputState {
    pressed: boolean;     // True on the frame the input was pressed
    held: boolean;        // True while the input is being held
    released: boolean;    // True on the frame the input was released
    duration: number;     // How long the input has been held
}

// Mouse input data
interface MouseState {
    position: Vector2;
    deltaPosition: Vector2;
    wheel: number;
    buttons: boolean[];
}

// Gamepad input data
interface GamepadState {
    connected: boolean;
    buttons: boolean[];
    axes: number[];
    vibration: { left: number; right: number; };
}

// Input event for callbacks
interface InputEvent {
    action: string;
    type: 'pressed' | 'held' | 'released';
    timestamp: number;
    modifiers: {
        shift: boolean;
        ctrl: boolean;
        alt: boolean;
    };
}

// Main input manager
class InputManager {
    private keyStates: Map<string, InputState>;
    private mouseState: MouseState;
    private gamepadStates: GamepadState[];
    private actionBindings: Map<string, InputAction>;
    private actionStates: Map<string, InputState>;
    
    // Event listeners
    private inputEventListeners: Map<string, ((event: InputEvent) => void)[]>;
    
    // Configuration
    private mouseSensitivity: number = 1.0;
    private keyRepeatDelay: number = 0.5;
    private keyRepeatRate: number = 0.1;
    
    // Canvas reference for mouse position calculation
    private canvas: HTMLCanvasElement;
    
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.keyStates = new Map();
        this.mouseState = {
            position: { x: 0, y: 0 },
            deltaPosition: { x: 0, y: 0 },
            wheel: 0,
            buttons: [false, false, false]
        };
        this.gamepadStates = [];
        this.actionBindings = new Map();
        this.actionStates = new Map();
        this.inputEventListeners = new Map();
        
        this.setupEventListeners();
        this.loadDefaultBindings();
    }
    
    private setupEventListeners(): void {
        // Keyboard events
        window.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        window.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
        
        // Mouse events
        this.canvas.addEventListener('mousedown', (event) => {
            this.handleMouseDown(event);
        });
        
        this.canvas.addEventListener('mouseup', (event) => {
            this.handleMouseUp(event);
        });
        
        this.canvas.addEventListener('mousemove', (event) => {
            this.handleMouseMove(event);
        });
        
        this.canvas.addEventListener('wheel', (event) => {
            this.handleMouseWheel(event);
        });
        
        // Prevent context menu on right click
        this.canvas.addEventListener('contextmenu', (event) => {
            event.preventDefault();
        });
        
        // Gamepad events
        window.addEventListener('gamepadconnected', (event) => {
            this.handleGamepadConnected(event);
        });
        
        window.addEventListener('gamepaddisconnected', (event) => {
            this.handleGamepadDisconnected(event);
        });
    }
    
    private handleKeyDown(event: KeyboardEvent): void {
        event.preventDefault();
        const key = event.code;
        
        const currentState = this.keyStates.get(key) || this.createInputState();
        
        if (!currentState.held) {
            currentState.pressed = true;
            currentState.held = true;
            currentState.duration = 0;
            
            this.triggerActionEvents(key, 'pressed', event);
        }
        
        this.keyStates.set(key, currentState);
    }
    
    private handleKeyUp(event: KeyboardEvent): void {
        const key = event.code;
        const currentState = this.keyStates.get(key);
        
        if (currentState && currentState.held) {
            currentState.held = false;
            currentState.released = true;
            
            this.triggerActionEvents(key, 'released', event);
        }
    }
    
    private handleMouseDown(event: MouseEvent): void {
        event.preventDefault();
        this.mouseState.buttons[event.button] = true;
        this.triggerActionEvents(`Mouse${event.button}`, 'pressed', event);
    }
    
    private handleMouseUp(event: MouseEvent): void {
        this.mouseState.buttons[event.button] = false;
        this.triggerActionEvents(`Mouse${event.button}`, 'released', event);
    }
    
    private handleMouseMove(event: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const newPosition = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
        
        this.mouseState.deltaPosition = {
            x: newPosition.x - this.mouseState.position.x,
            y: newPosition.y - this.mouseState.position.y
        };
        
        this.mouseState.position = newPosition;
    }
    
    private handleMouseWheel(event: WheelEvent): void {
        event.preventDefault();
        this.mouseState.wheel = event.deltaY;
    }
    
    private handleGamepadConnected(event: GamepadEvent): void {
        console.log(`Gamepad connected: ${event.gamepad.id}`);
        this.updateGamepadState(event.gamepad.index);
    }
    
    private handleGamepadDisconnected(event: GamepadEvent): void {
        console.log(`Gamepad disconnected: ${event.gamepad.id}`);
        if (this.gamepadStates[event.gamepad.index]) {
            this.gamepadStates[event.gamepad.index].connected = false;
        }
    }
    
    private updateGamepadState(index: number): void {
        const gamepad = navigator.getGamepads()[index];
        if (!gamepad) return;
        
        if (!this.gamepadStates[index]) {
            this.gamepadStates[index] = {
                connected: true,
                buttons: [],
                axes: [],
                vibration: { left: 0, right: 0 }
            };
        }
        
        const state = this.gamepadStates[index];
        state.connected = gamepad.connected;
        
        // Update button states
        for (let i = 0; i < gamepad.buttons.length; i++) {
            const wasPressed = state.buttons[i] || false;
            const isPressed = gamepad.buttons[i].pressed;
            
            state.buttons[i] = isPressed;
            
            if (isPressed && !wasPressed) {
                this.triggerActionEvents(`Gamepad${index}Button${i}`, 'pressed');
            } else if (!isPressed && wasPressed) {
                this.triggerActionEvents(`Gamepad${index}Button${i}`, 'released');
            }
        }
        
        // Update axis states
        state.axes = Array.from(gamepad.axes);
    }
    
    private triggerActionEvents(inputKey: string, type: 'pressed' | 'released', originalEvent?: any): void {
        // Find actions bound to this input
        this.actionBindings.forEach((action, actionName) => {
            if (action.keys.includes(inputKey) || 
                (action.mouseButtons && action.mouseButtons.includes(parseInt(inputKey.replace('Mouse', '')))) ||
                (action.gamepadButtons && action.gamepadButtons.includes(parseInt(inputKey.split('Button')[1])))) {
                
                const event: InputEvent = {
                    action: actionName,
                    type,
                    timestamp: Date.now(),
                    modifiers: {
                        shift: originalEvent?.shiftKey || false,
                        ctrl: originalEvent?.ctrlKey || false,
                        alt: originalEvent?.altKey || false
                    }
                };
                
                // Update action state
                this.updateActionState(actionName, type);
                
                // Trigger listeners
                const listeners = this.inputEventListeners.get(actionName) || [];
                listeners.forEach(listener => listener(event));
            }
        });
    }
    
    private updateActionState(actionName: string, type: 'pressed' | 'released'): void {
        const currentState = this.actionStates.get(actionName) || this.createInputState();
        
        if (type === 'pressed') {
            currentState.pressed = true;
            currentState.held = true;
            currentState.duration = 0;
        } else if (type === 'released') {
            currentState.held = false;
            currentState.released = true;
        }
        
        this.actionStates.set(actionName, currentState);
    }
    
    private createInputState(): InputState {
        return {
            pressed: false,
            held: false,
            released: false,
            duration: 0
        };
    }
    
    // Public API methods
    update(deltaTime: number): void {
        // Update key state durations
        this.keyStates.forEach((state, key) => {
            if (state.held) {
                state.duration += deltaTime;
            }
            
            // Clear frame-specific flags
            state.pressed = false;
            state.released = false;
        });
        
        // Update action state durations
        this.actionStates.forEach((state, action) => {
            if (state.held) {
                state.duration += deltaTime;
            }
            
            state.pressed = false;
            state.released = false;
        });
        
        // Reset mouse delta and wheel
        this.mouseState.deltaPosition = { x: 0, y: 0 };
        this.mouseState.wheel = 0;
        
        // Update gamepad states
        for (let i = 0; i < 4; i++) {
            this.updateGamepadState(i);
        }
    }
    
    // Action query methods
    isActionPressed(action: string): boolean {
        const state = this.actionStates.get(action);
        return state?.pressed || false;
    }
    
    isActionHeld(action: string): boolean {
        const state = this.actionStates.get(action);
        return state?.held || false;
    }
    
    isActionReleased(action: string): boolean {
        const state = this.actionStates.get(action);
        return state?.released || false;
    }
    
    getActionDuration(action: string): number {
        const state = this.actionStates.get(action);
        return state?.duration || 0;
    }
    
    // Mouse query methods
    getMousePosition(): Vector2 {
        return { ...this.mouseState.position };
    }
    
    getMouseDelta(): Vector2 {
        return { ...this.mouseState.deltaPosition };
    }
    
    getMouseWheel(): number {
        return this.mouseState.wheel;
    }
    
    isMouseButtonPressed(button: number): boolean {
        return this.mouseState.buttons[button] || false;
    }
    
    // Gamepad query methods
    isGamepadConnected(index: number): boolean {
        return this.gamepadStates[index]?.connected || false;
    }
    
    getGamepadAxisValue(index: number, axis: number): number {
        const state = this.gamepadStates[index];
        if (!state || !state.connected) return 0;
        return state.axes[axis] || 0;
    }
    
    isGamepadButtonPressed(index: number, button: number): boolean {
        const state = this.gamepadStates[index];
        if (!state || !state.connected) return false;
        return state.buttons[button] || false;
    }
    
    // Input binding management
    bindAction(actionName: string, keys: string[], mouseButtons?: number[], gamepadButtons?: number[], description: string = ''): void {
        this.actionBindings.set(actionName, {
            name: actionName,
            keys,
            mouseButtons,
            gamepadButtons,
            description
        });
    }
    
    unbindAction(actionName: string): void {
        this.actionBindings.delete(actionName);
        this.actionStates.delete(actionName);
    }
    
    getActionBinding(actionName: string): InputAction | undefined {
        return this.actionBindings.get(actionName);
    }
    
    getAllActions(): InputAction[] {
        return Array.from(this.actionBindings.values());
    }
    
    // Event listener management
    addEventListener(actionName: string, callback: (event: InputEvent) => void): void {
        if (!this.inputEventListeners.has(actionName)) {
            this.inputEventListeners.set(actionName, []);
        }
        this.inputEventListeners.get(actionName)!.push(callback);
    }
    
    removeEventListener(actionName: string, callback: (event: InputEvent) => void): void {
        const listeners = this.inputEventListeners.get(actionName);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    // Configuration
    setMouseSensitivity(sensitivity: number): void {
        this.mouseSensitivity = Math.max(0.1, Math.min(5.0, sensitivity));
    }
    
    getMouseSensitivity(): number {
        return this.mouseSensitivity;
    }
    
    // Gamepad vibration
    setGamepadVibration(index: number, leftMotor: number, rightMotor: number, duration: number = 1000): void {
        const gamepad = navigator.getGamepads()[index];
        if (gamepad && gamepad.vibrationActuator) {
            gamepad.vibrationActuator.playEffect('dual-rumble', {
                startDelay: 0,
                duration: duration,
                weakMagnitude: leftMotor,
                strongMagnitude: rightMotor
            });
        }
    }
    
    // Save/load key bindings
    saveBindings(): string {
        const bindings: any = {};
        this.actionBindings.forEach((action, name) => {
            bindings[name] = action;
        });
        return JSON.stringify(bindings);
    }
    
    loadBindings(bindingsJson: string): void {
        try {
            const bindings = JSON.parse(bindingsJson);
            this.actionBindings.clear();
            
            Object.entries(bindings).forEach(([name, action]: [string, any]) => {
                this.actionBindings.set(name, action);
            });
        } catch (error) {
            console.error('Failed to load key bindings:', error);
        }
    }
    
    private loadDefaultBindings(): void {
        // Movement
        this.bindAction('moveUp', ['KeyW', 'ArrowUp'], undefined, [12], 'Move character up');
        this.bindAction('moveDown', ['KeyS', 'ArrowDown'], undefined, [13], 'Move character down');
        this.bindAction('moveLeft', ['KeyA', 'ArrowLeft'], undefined, [14], 'Move character left');
        this.bindAction('moveRight', ['KeyD', 'ArrowRight'], undefined, [15], 'Move character right');
        
        // Combat
        this.bindAction('fire', ['Space'], [0], [0], 'Primary fire');
        this.bindAction('altFire', ['KeyF'], [2], [1], 'Secondary fire');
        this.bindAction('reload', ['KeyR'], undefined, [2], 'Reload weapon');
        this.bindAction('melee', ['KeyE'], undefined, [3], 'Melee attack');
        
        // Abilities
        this.bindAction('ability1', ['Digit1'], undefined, [4], 'First ability');
        this.bindAction('ability2', ['Digit2'], undefined, [5], 'Second ability');
        this.bindAction('ability3', ['Digit3'], undefined, [6], 'Third ability');
        this.bindAction('ultimate', ['KeyQ'], undefined, [7], 'Ultimate ability');
        
        // Interface
        this.bindAction('inventory', ['Tab'], undefined, [8], 'Open inventory');
        this.bindAction('map', ['KeyM'], undefined, [9], 'Open map');
        this.bindAction('pause', ['Escape'], undefined, [10], 'Pause game');
        this.bindAction('chat', ['Enter'], undefined, undefined, 'Open chat');
        
        // Misc
        this.bindAction('jump', ['Space'], undefined, [0], 'Jump');
        this.bindAction('crouch', ['KeyC'], undefined, [1], 'Crouch');
        this.bindAction('sprint', ['ShiftLeft'], undefined, [4], 'Sprint');
    }
}

// Input helper for common patterns
class InputHelper {
    private inputManager: InputManager;
    
    constructor(inputManager: InputManager) {
        this.inputManager = inputManager;
    }
    
    getMovementVector(): Vector2 {
        const vector = { x: 0, y: 0 };
        
        if (this.inputManager.isActionHeld('moveLeft')) vector.x -= 1;
        if (this.inputManager.isActionHeld('moveRight')) vector.x += 1;
        if (this.inputManager.isActionHeld('moveUp')) vector.y -= 1;
        if (this.inputManager.isActionHeld('moveDown')) vector.y += 1;
        
        // Normalize diagonal movement
        if (vector.x !== 0 && vector.y !== 0) {
            const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
            vector.x /= length;
            vector.y /= length;
        }
        
        return vector;
    }
    
    getGamepadMovementVector(gamepadIndex: number): Vector2 {
        if (!this.inputManager.isGamepadConnected(gamepadIndex)) {
            return { x: 0, y: 0 };
        }
        
        const x = this.inputManager.getGamepadAxisValue(gamepadIndex, 0);
        const y = this.inputManager.getGamepadAxisValue(gamepadIndex, 1);
        
        // Apply deadzone
        const deadzone = 0.15;
        const magnitude = Math.sqrt(x * x + y * y);
        
        if (magnitude < deadzone) {
            return { x: 0, y: 0 };
        }
        
        // Scale input beyond deadzone
        const scaledMagnitude = (magnitude - deadzone) / (1 - deadzone);
        const normalizedX = (x / magnitude) * scaledMagnitude;
        const normalizedY = (y / magnitude) * scaledMagnitude;
        
        return { x: normalizedX, y: normalizedY };
    }
    
    isAnyMovementPressed(): boolean {
        return this.inputManager.isActionHeld('moveLeft') ||
               this.inputManager.isActionHeld('moveRight') ||
               this.inputManager.isActionHeld('moveUp') ||
               this.inputManager.isActionHeld('moveDown');
    }
    
    isAnyAbilityPressed(): boolean {
        return this.inputManager.isActionPressed('ability1') ||
               this.inputManager.isActionPressed('ability2') ||
               this.inputManager.isActionPressed('ability3') ||
               this.inputManager.isActionPressed('ultimate');
    }
    
    getMouseDirectionFromCenter(canvasCenter: Vector2): Vector2 {
        const mousePos = this.inputManager.getMousePosition();
        const direction = {
            x: mousePos.x - canvasCenter.x,
            y: mousePos.y - canvasCenter.y
        };
        
        const length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
        if (length > 0) {
            direction.x /= length;
            direction.y /= length;
        }
        
        return direction;
    }
}
```

## Performance Optimization

### Frame Rate Management
```typescript
class PerformanceManager {
    private frameTime: number = 0;
    private frameCount: number = 0;
    private lastFpsUpdate: number = 0;
    private currentFps: number = 60;
    private targetFps: number = 60;
    
    update(deltaTime: number): void {
        this.frameTime += deltaTime;
        this.frameCount++;
        
        if (this.frameTime >= 1.0) {
            this.currentFps = this.frameCount / this.frameTime;
            this.frameCount = 0;
            this.frameTime = 0;
        }
        
        // Dynamic quality adjustment
        if (this.currentFps < this.targetFps * 0.8) {
            this.reduceQuality();
        } else if (this.currentFps > this.targetFps * 0.95) {
            this.increaseQuality();
        }
    }
    
    private reduceQuality(): void {
        // Reduce particle count, disable post-processing, etc.
    }
    
    private increaseQuality(): void {
        // Restore quality settings gradually
    }
}
```

### Memory Management
```typescript
class MemoryManager {
    private objectPools: Map<string, any[]> = new Map();
    
    getPooledObject<T>(type: string, createFn: () => T): T {
        const pool = this.objectPools.get(type) || [];
        
        if (pool.length > 0) {
            return pool.pop() as T;
        } else {
            return createFn();
        }
    }
    
    returnToPool(type: string, object: any): void {
        const pool = this.objectPools.get(type) || [];
        pool.push(object);
        this.objectPools.set(type, pool);
    }
}
```

### Error Handling
```typescript
class ErrorHandler {
    static handleNetworkError(error: Error, context: string): void {
        console.error(`Network error in ${context}:`, error);
        // Show user-friendly message
        // Attempt reconnection
    }
    
    static handleRenderError(error: Error): void {
        console.error('Rendering error:', error);
        // Fallback to basic rendering
    }
    
    static handleInputError(error: Error): void {
        console.error('Input error:', error);
        // Reset input state
    }
}
```

These code examples provide comprehensive implementations for networking, particle systems, and input management that can be integrated into the Stick Ranger game architecture. Each system is designed to be modular, performant, and extensible.
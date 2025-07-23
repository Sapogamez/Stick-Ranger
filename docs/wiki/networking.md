# Networking Implementation Documentation

## Overview

While Stick Ranger currently operates as a single-player browser-based game, this documentation outlines the networking architecture designed for future multiplayer implementations. The system is built with scalability and real-time collaboration in mind.

## Current Implementation Status

### Single-Player Architecture

The current game operates entirely client-side with no networking requirements:

```typescript
// Current single-player game state
interface SinglePlayerGame {
  players: Player[];
  enemies: Enemy[];
  gameState: 'playing' | 'paused' | 'gameOver';
  currentLevel: string;
}

// All game logic runs locally
const gameLoop = () => {
  updatePlayers();
  updateEnemies();
  processCombat();
  checkWinConditions();
};
```

### Planned Networking Features

1. **Real-time Multiplayer**: Cooperative gameplay with multiple users
2. **Leaderboards**: Global and friend-based scoring systems
3. **Ghost Data**: Share gameplay sessions for comparison
4. **User Accounts**: Persistent progression and achievements
5. **Content Sharing**: User-generated levels and modifications

## Multiplayer Architecture Design

### Client-Server Model

```typescript
// Server-side game state
interface MultiplayerGameState {
  gameId: string;
  hostId: string;
  players: Map<string, NetworkPlayer>;
  enemies: Enemy[];
  gameSettings: GameSettings;
  gamePhase: GamePhase;
  timestamp: number;
}

interface NetworkPlayer extends Player {
  userId: string;
  connectionId: string;
  lastUpdate: number;
  inputBuffer: InputCommand[];
}

type GamePhase = 'lobby' | 'preparation' | 'combat' | 'victory' | 'defeat';
```

### WebSocket Communication

#### Connection Management

```typescript
class GameNetworkManager {
  private socket: WebSocket | null = null;
  private gameId: string | null = null;
  private playerId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;

  constructor(private gameEvents: EventEmitter) {
    this.setupEventHandlers();
  }

  async connect(gameId: string, playerId: string): Promise<void> {
    try {
      this.socket = new WebSocket(`ws://localhost:8080/game/${gameId}`);
      this.gameId = gameId;
      this.playerId = playerId;
      
      this.socket.onopen = this.handleConnection.bind(this);
      this.socket.onmessage = this.handleMessage.bind(this);
      this.socket.onclose = this.handleDisconnection.bind(this);
      this.socket.onerror = this.handleError.bind(this);
      
    } catch (error) {
      console.error('Failed to connect:', error);
      throw new NetworkError('Connection failed', 'CONNECTION_FAILED');
    }
  }

  private handleConnection(): void {
    console.log('Connected to game server');
    this.reconnectAttempts = 0;
    
    // Send authentication
    this.send({
      type: 'authenticate',
      playerId: this.playerId,
      timestamp: Date.now()
    });
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as NetworkMessage;
      this.processMessage(message);
    } catch (error) {
      console.error('Failed to parse message:', error);
    }
  }

  send(message: NetworkMessage): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        ...message,
        playerId: this.playerId,
        timestamp: Date.now()
      }));
    }
  }
}
```

#### Message Protocol

```typescript
interface NetworkMessage {
  type: MessageType;
  playerId?: string;
  timestamp: number;
  data?: any;
}

type MessageType = 
  | 'authenticate'
  | 'gameState'
  | 'playerInput'
  | 'playerUpdate'
  | 'enemyUpdate'
  | 'skillUse'
  | 'levelComplete'
  | 'gameOver'
  | 'ping'
  | 'pong';

// Message type definitions
interface PlayerInputMessage extends NetworkMessage {
  type: 'playerInput';
  data: {
    action: InputAction;
    target?: Position | number; // Position for movement, number for target ID
    skillId?: string;
  };
}

interface GameStateMessage extends NetworkMessage {
  type: 'gameState';
  data: {
    players: NetworkPlayer[];
    enemies: Enemy[];
    gamePhase: GamePhase;
    levelData: LevelData;
  };
}

interface SkillUseMessage extends NetworkMessage {
  type: 'skillUse';
  data: {
    skillId: string;
    targetId?: number;
    targetPosition?: Position;
  };
}
```

### Input Handling and Prediction

#### Client-Side Prediction

```typescript
class InputManager {
  private inputBuffer: InputCommand[] = [];
  private predictedState: GameState;
  private confirmedState: GameState;
  private networkManager: GameNetworkManager;

  constructor(networkManager: GameNetworkManager) {
    this.networkManager = networkManager;
  }

  // Handle local input with prediction
  handleInput(action: InputAction, target?: any): void {
    const inputCommand: InputCommand = {
      id: generateUniqueId(),
      action,
      target,
      timestamp: Date.now(),
      predicted: false
    };

    // Add to buffer
    this.inputBuffer.push(inputCommand);

    // Apply optimistic prediction
    this.applyInputPrediction(inputCommand);

    // Send to server
    this.networkManager.send({
      type: 'playerInput',
      data: {
        commandId: inputCommand.id,
        action: inputCommand.action,
        target: inputCommand.target
      }
    });
  }

  // Reconcile predictions with server state
  reconcileWithServer(serverState: GameState, confirmedInputs: string[]): void {
    // Remove confirmed inputs from buffer
    this.inputBuffer = this.inputBuffer.filter(
      input => !confirmedInputs.includes(input.id)
    );

    // Reset to confirmed server state
    this.confirmedState = serverState;

    // Re-apply unconfirmed inputs
    this.predictedState = { ...serverState };
    this.inputBuffer.forEach(input => {
      this.applyInputPrediction(input);
    });
  }
}
```

#### Lag Compensation

```typescript
class LagCompensation {
  private roundTripTime: number = 0;
  private serverTimeOffset: number = 0;
  private pingHistory: number[] = [];

  updatePing(pingTime: number): void {
    this.pingHistory.push(pingTime);
    if (this.pingHistory.length > 10) {
      this.pingHistory.shift();
    }
    
    this.roundTripTime = this.calculateAveragePing();
  }

  // Compensate for network delay in hit detection
  compensatePosition(player: Player, timestamp: number): Position {
    const timeDelta = Date.now() - timestamp - this.roundTripTime / 2;
    const compensatedPosition = {
      x: player.position.x - (player.velocity?.x || 0) * timeDelta,
      y: player.position.y - (player.velocity?.y || 0) * timeDelta
    };
    
    return compensatedPosition;
  }

  private calculateAveragePing(): number {
    if (this.pingHistory.length === 0) return 0;
    return this.pingHistory.reduce((sum, ping) => sum + ping, 0) / this.pingHistory.length;
  }
}
```

### State Synchronization

#### Snapshot System

```typescript
interface GameSnapshot {
  id: string;
  timestamp: number;
  gameState: GameState;
  playerInputs: Map<string, InputCommand[]>;
}

class StateManager {
  private snapshots: GameSnapshot[] = [];
  private maxSnapshots: number = 100;
  private snapshotInterval: number = 100; // 10 snapshots per second

  createSnapshot(gameState: GameState): GameSnapshot {
    const snapshot: GameSnapshot = {
      id: generateUniqueId(),
      timestamp: Date.now(),
      gameState: this.cloneGameState(gameState),
      playerInputs: new Map()
    };

    this.snapshots.push(snapshot);
    
    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    return snapshot;
  }

  getSnapshotAt(timestamp: number): GameSnapshot | null {
    // Find closest snapshot to the requested timestamp
    let closest: GameSnapshot | null = null;
    let closestDistance = Infinity;

    for (const snapshot of this.snapshots) {
      const distance = Math.abs(snapshot.timestamp - timestamp);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = snapshot;
      }
    }

    return closest;
  }

  interpolateState(snapshot1: GameSnapshot, snapshot2: GameSnapshot, timestamp: number): GameState {
    const timeDelta = snapshot2.timestamp - snapshot1.timestamp;
    const factor = (timestamp - snapshot1.timestamp) / timeDelta;

    return this.interpolateGameState(snapshot1.gameState, snapshot2.gameState, factor);
  }
}
```

#### Delta Compression

```typescript
interface StateDelta {
  timestamp: number;
  playerDeltas: Map<string, Partial<Player>>;
  enemyDeltas: Map<number, Partial<Enemy>>;
  removedEntities: {
    players: string[];
    enemies: number[];
  };
}

class DeltaCompression {
  private lastSentState: GameState | null = null;

  createDelta(currentState: GameState): StateDelta {
    const delta: StateDelta = {
      timestamp: Date.now(),
      playerDeltas: new Map(),
      enemyDeltas: new Map(),
      removedEntities: { players: [], enemies: [] }
    };

    if (!this.lastSentState) {
      // First delta - include everything
      currentState.players.forEach(player => {
        delta.playerDeltas.set(player.id.toString(), player);
      });
      currentState.enemies.forEach(enemy => {
        delta.enemyDeltas.set(enemy.id, enemy);
      });
    } else {
      // Compare with last state and include only changes
      this.compareAndAddPlayerDeltas(delta, currentState);
      this.compareAndAddEnemyDeltas(delta, currentState);
    }

    this.lastSentState = this.cloneGameState(currentState);
    return delta;
  }

  applyDelta(baseState: GameState, delta: StateDelta): GameState {
    const newState = this.cloneGameState(baseState);

    // Apply player changes
    delta.playerDeltas.forEach((playerDelta, playerId) => {
      const existingPlayer = newState.players.find(p => p.id.toString() === playerId);
      if (existingPlayer) {
        Object.assign(existingPlayer, playerDelta);
      } else {
        newState.players.push(playerDelta as Player);
      }
    });

    // Apply enemy changes
    delta.enemyDeltas.forEach((enemyDelta, enemyId) => {
      const existingEnemy = newState.enemies.find(e => e.id === enemyId);
      if (existingEnemy) {
        Object.assign(existingEnemy, enemyDelta);
      } else {
        newState.enemies.push(enemyDelta as Enemy);
      }
    });

    // Remove entities
    delta.removedEntities.players.forEach(playerId => {
      newState.players = newState.players.filter(p => p.id.toString() !== playerId);
    });
    delta.removedEntities.enemies.forEach(enemyId => {
      newState.enemies = newState.enemies.filter(e => e.id !== enemyId);
    });

    return newState;
  }
}
```

## Server Architecture

### Game Server Implementation

```typescript
// Server-side game instance
class GameServer {
  private gameId: string;
  private players: Map<string, ServerPlayer> = new Map();
  private gameState: ServerGameState;
  private gameLoop: NodeJS.Timeout | null = null;
  private tickRate: number = 60; // 60 FPS

  constructor(gameId: string, hostId: string) {
    this.gameId = gameId;
    this.gameState = this.initializeGameState(hostId);
  }

  addPlayer(playerId: string, socket: WebSocket): void {
    const player = this.createServerPlayer(playerId, socket);
    this.players.set(playerId, player);
    
    // Send current game state to new player
    this.sendToPlayer(playerId, {
      type: 'gameState',
      data: this.getClientGameState()
    });

    // Notify other players
    this.broadcast({
      type: 'playerJoined',
      data: { playerId, playerData: player.clientData }
    }, playerId);
  }

  removePlayer(playerId: string): void {
    this.players.delete(playerId);
    
    this.broadcast({
      type: 'playerLeft',
      data: { playerId }
    });

    // End game if no players remain
    if (this.players.size === 0) {
      this.endGame();
    }
  }

  handlePlayerInput(playerId: string, inputData: any): void {
    const player = this.players.get(playerId);
    if (!player) return;

    // Validate input
    if (!this.validateInput(inputData)) {
      console.warn(`Invalid input from player ${playerId}`);
      return;
    }

    // Process input
    this.processPlayerInput(player, inputData);

    // Send confirmation
    this.sendToPlayer(playerId, {
      type: 'inputConfirmed',
      data: { commandId: inputData.commandId }
    });
  }

  startGame(): void {
    this.gameLoop = setInterval(() => {
      this.tick();
    }, 1000 / this.tickRate);
  }

  private tick(): void {
    // Update game simulation
    this.updateGameSimulation();

    // Create and send state delta
    const delta = this.createStateDelta();
    this.broadcast({
      type: 'stateDelta',
      data: delta
    });

    // Check win/loss conditions
    this.checkGameEndConditions();
  }
}
```

### Authoritative Server Logic

```typescript
class AuthoritativeGameLogic {
  // Server validates all game actions
  validateSkillUse(player: ServerPlayer, skillId: string, target?: any): boolean {
    const skill = player.skills.find(s => s.id === skillId);
    if (!skill) return false;

    // Check cooldown
    if (skill.lastUsed + skill.cooldown > Date.now()) {
      return false;
    }

    // Check mana cost
    if (player.stats.mana < skill.manaCost) {
      return false;
    }

    // Check range if targeting
    if (target && !this.isInRange(player, target, skill.range)) {
      return false;
    }

    return true;
  }

  // Server-side damage calculation (authoritative)
  calculateDamage(attacker: ServerPlayer, target: ServerEnemy): number {
    // Use server-side random seed for consistency
    const baseDamage = attacker.stats.atk;
    const defense = target.defense || 0;
    const randomVariance = this.getSeededRandom() * 0.2 - 0.1; // ±10% variance
    
    const finalDamage = Math.max(1, 
      Math.floor((baseDamage - defense) * (1 + randomVariance))
    );

    return finalDamage;
  }

  // Anti-cheat validation
  validatePlayerPosition(player: ServerPlayer, newPosition: Position): boolean {
    const maxDistance = player.stats.spd * this.tickInterval / 1000;
    const distance = this.calculateDistance(player.position, newPosition);
    
    return distance <= maxDistance * 1.1; // Allow 10% tolerance for lag
  }
}
```

## Security Considerations

### Anti-Cheat Measures

```typescript
class AntiCheatSystem {
  private suspiciousActivity: Map<string, number> = new Map();
  private maxViolations: number = 5;

  validatePlayerAction(playerId: string, action: any): boolean {
    const violations = this.suspiciousActivity.get(playerId) || 0;
    
    if (violations > this.maxViolations) {
      this.kickPlayer(playerId, 'Too many validation failures');
      return false;
    }

    // Various validation checks
    if (!this.validateActionTiming(action) ||
        !this.validateActionParameters(action) ||
        !this.validatePlayerCapabilities(playerId, action)) {
      
      this.suspiciousActivity.set(playerId, violations + 1);
      return false;
    }

    return true;
  }

  private validateActionTiming(action: any): boolean {
    // Prevent actions sent too rapidly
    const minTimeBetweenActions = 50; // 50ms
    return action.timestamp - action.lastAction >= minTimeBetweenActions;
  }

  private validateActionParameters(action: any): boolean {
    // Validate that action parameters are within expected ranges
    if (action.position) {
      return this.isValidPosition(action.position);
    }
    if (action.damage) {
      return this.isValidDamageValue(action.damage);
    }
    return true;
  }
}
```

### Data Encryption

```typescript
// Message encryption for sensitive data
class MessageEncryption {
  private encryptionKey: string;

  constructor(encryptionKey: string) {
    this.encryptionKey = encryptionKey;
  }

  encryptMessage(message: NetworkMessage): string {
    const jsonString = JSON.stringify(message);
    // Use Web Crypto API for encryption
    return this.encrypt(jsonString);
  }

  decryptMessage(encryptedData: string): NetworkMessage {
    const decryptedJson = this.decrypt(encryptedData);
    return JSON.parse(decryptedJson);
  }

  private encrypt(data: string): string {
    // Implementation using Web Crypto API
    // This is a simplified example
    return btoa(data); // Base64 encoding (not secure, just for example)
  }

  private decrypt(data: string): string {
    return atob(data); // Base64 decoding
  }
}
```

## Performance Optimization

### Bandwidth Optimization

```typescript
class BandwidthOptimizer {
  private compressionThreshold: number = 1024; // Compress messages over 1KB
  
  optimizeMessage(message: NetworkMessage): NetworkMessage {
    // Remove unnecessary data
    const optimized = this.removeUnnecessaryFields(message);
    
    // Quantize floating point numbers
    if (optimized.data.position) {
      optimized.data.position = this.quantizePosition(optimized.data.position);
    }
    
    // Compress large messages
    if (JSON.stringify(optimized).length > this.compressionThreshold) {
      return this.compressMessage(optimized);
    }
    
    return optimized;
  }

  private quantizePosition(position: Position): Position {
    // Reduce precision to save bandwidth
    return {
      x: Math.round(position.x * 100) / 100,
      y: Math.round(position.y * 100) / 100
    };
  }

  private removeUnnecessaryFields(message: NetworkMessage): NetworkMessage {
    // Remove fields that haven't changed
    const optimized = { ...message };
    
    // Only send changed stats
    if (optimized.data.stats) {
      optimized.data.stats = this.filterChangedStats(optimized.data.stats);
    }
    
    return optimized;
  }
}
```

### Connection Quality Adaptation

```typescript
class ConnectionQualityManager {
  private connectionQuality: 'poor' | 'good' | 'excellent' = 'good';
  private adaptiveSettings: AdaptiveSettings;

  constructor() {
    this.adaptiveSettings = {
      updateRate: 60,
      compressionLevel: 1,
      predictionBuffer: 3
    };
  }

  updateQuality(latency: number, packetLoss: number): void {
    if (latency > 200 || packetLoss > 0.05) {
      this.connectionQuality = 'poor';
      this.adaptiveSettings.updateRate = 30;
      this.adaptiveSettings.compressionLevel = 3;
      this.adaptiveSettings.predictionBuffer = 5;
    } else if (latency < 50 && packetLoss < 0.01) {
      this.connectionQuality = 'excellent';
      this.adaptiveSettings.updateRate = 60;
      this.adaptiveSettings.compressionLevel = 1;
      this.adaptiveSettings.predictionBuffer = 2;
    } else {
      this.connectionQuality = 'good';
      this.adaptiveSettings.updateRate = 45;
      this.adaptiveSettings.compressionLevel = 2;
      this.adaptiveSettings.predictionBuffer = 3;
    }
  }
}
```

## Implementation Roadmap

### Phase 1: Foundation (Months 1-2)
- [ ] WebSocket server setup
- [ ] Basic message protocol
- [ ] Client-server authentication
- [ ] Simple lobby system

### Phase 2: Core Multiplayer (Months 3-4)
- [ ] Real-time game state synchronization
- [ ] Input prediction and lag compensation
- [ ] Authoritative server validation
- [ ] Basic anti-cheat measures

### Phase 3: Advanced Features (Months 5-6)
- [ ] Spectator mode
- [ ] Replay system
- [ ] Leaderboards
- [ ] User accounts and progression

### Phase 4: Optimization (Months 7-8)
- [ ] Performance optimization
- [ ] Scalability improvements
- [ ] Advanced anti-cheat
- [ ] Mobile support

---

This networking documentation provides a comprehensive framework for implementing multiplayer features in Stick Ranger while maintaining security, performance, and user experience standards.
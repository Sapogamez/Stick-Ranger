export interface NetworkMessage {
  type: MessageType;
  timestamp: number;
  senderId: string;
  data: any;
  messageId: string;
}

export interface ConnectionInfo {
  id: string;
  isHost: boolean;
  latency: number;
  status: ConnectionStatus;
  lastHeartbeat: number;
}

export interface GameSyncData {
  gameState: any;
  playerStates: any[];
  enemyStates: any[];
  timestamp: number;
  frame: number;
}

export interface NetworkConfig {
  maxConnections: number;
  heartbeatInterval: number;
  syncInterval: number;
  maxLatency: number;
  enableP2P: boolean;
  enableRelay: boolean;
}

export type MessageType = 
  | 'connect' | 'disconnect' | 'heartbeat' | 'sync' | 'player_action' 
  | 'game_event' | 'chat' | 'error' | 'request_sync' | 'host_migration';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnecting' | 'disconnected' | 'error';

export class NetworkProtocol {
  private static instance: NetworkProtocol;
  private connections: Map<string, ConnectionInfo> = new Map();
  private messageHandlers: Map<MessageType, Function[]> = new Map();
  private config: NetworkConfig;
  private isHost: boolean = false;
  private hostId: string | null = null;
  private localPlayerId: string;
  private messageQueue: NetworkMessage[] = [];
  private syncFrame: number = 0;
  private lastSyncTime: number = 0;

  private constructor() {
    this.localPlayerId = this.generatePlayerId();
    this.config = this.getDefaultConfig();
    this.initializeMessageHandlers();
  }

  public static getInstance(): NetworkProtocol {
    if (!NetworkProtocol.instance) {
      NetworkProtocol.instance = new NetworkProtocol();
    }
    return NetworkProtocol.instance;
  }

  // Connection Management
  async createRoom(): Promise<string> {
    this.isHost = true;
    this.hostId = this.localPlayerId;
    
    // In a real implementation, this would create a room on a server
    const roomId = this.generateRoomId();
    
    this.connections.set(this.localPlayerId, {
      id: this.localPlayerId,
      isHost: true,
      latency: 0,
      status: 'connected',
      lastHeartbeat: Date.now()
    });

    return roomId;
  }

  async joinRoom(roomId: string): Promise<boolean> {
    try {
      this.isHost = false;
      
      // In a real implementation, this would connect to a server/room
      // For now, simulate a successful connection
      
      this.connections.set(this.localPlayerId, {
        id: this.localPlayerId,
        isHost: false,
        latency: 50, // Simulated latency
        status: 'connected',
        lastHeartbeat: Date.now()
      });

      this.sendMessage('connect', {
        playerId: this.localPlayerId,
        timestamp: Date.now()
      });

      return true;
    } catch (error) {
      console.error('Failed to join room:', error);
      return false;
    }
  }

  disconnect(): void {
    this.sendMessage('disconnect', {
      playerId: this.localPlayerId,
      timestamp: Date.now()
    });

    this.connections.clear();
    this.isHost = false;
    this.hostId = null;
  }

  // Message Handling
  sendMessage(type: MessageType, data: any, targetId?: string): void {
    const message: NetworkMessage = {
      type,
      timestamp: Date.now(),
      senderId: this.localPlayerId,
      data,
      messageId: this.generateMessageId()
    };

    // Add to local queue for processing
    this.messageQueue.push(message);

    // In a real implementation, this would send via WebSocket/WebRTC
    this.simulateMessageSend(message, targetId);
  }

  onMessage(type: MessageType, handler: (message: NetworkMessage) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  processMessages(): void {
    const messages = [...this.messageQueue];
    this.messageQueue = [];

    for (const message of messages) {
      this.handleMessage(message);
    }
  }

  // Game Synchronization
  sendGameSync(syncData: GameSyncData): void {
    if (!this.isHost) return;

    this.sendMessage('sync', {
      ...syncData,
      frame: this.syncFrame++
    });
  }

  requestSync(): void {
    if (this.isHost) return;

    this.sendMessage('request_sync', {
      requesterId: this.localPlayerId,
      timestamp: Date.now()
    });
  }

  // Player Action Synchronization
  sendPlayerAction(action: string, actionData: any): void {
    this.sendMessage('player_action', {
      action,
      actionData,
      playerId: this.localPlayerId,
      frame: this.syncFrame
    });
  }

  // Connection Status
  getConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values());
  }

  getConnectionCount(): number {
    return this.connections.size;
  }

  isConnected(): boolean {
    return this.connections.size > 0;
  }

  getLatency(playerId?: string): number {
    const connection = this.connections.get(playerId || this.localPlayerId);
    return connection?.latency || 0;
  }

  // Heartbeat System
  startHeartbeat(): void {
    setInterval(() => {
      this.sendHeartbeat();
      this.checkConnectionHealth();
    }, this.config.heartbeatInterval);
  }

  // Utility Methods
  getLocalPlayerId(): string {
    return this.localPlayerId;
  }

  isHostPlayer(): boolean {
    return this.isHost;
  }

  getHostId(): string | null {
    return this.hostId;
  }

  updateConfig(newConfig: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getNetworkStats(): {
    connections: number;
    avgLatency: number;
    messagesProcessed: number;
    syncFrame: number;
    isHost: boolean;
  } {
    const connections = Array.from(this.connections.values());
    const avgLatency = connections.length > 0 
      ? connections.reduce((sum, conn) => sum + conn.latency, 0) / connections.length 
      : 0;

    return {
      connections: connections.length,
      avgLatency: Math.round(avgLatency),
      messagesProcessed: this.syncFrame,
      syncFrame: this.syncFrame,
      isHost: this.isHost
    };
  }

  // Private Methods
  private handleMessage(message: NetworkMessage): void {
    const handlers = this.messageHandlers.get(message.type) || [];
    
    for (const handler of handlers) {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error handling message type ${message.type}:`, error);
      }
    }

    // Built-in message handling
    switch (message.type) {
      case 'connect':
        this.handlePlayerConnect(message);
        break;
      case 'disconnect':
        this.handlePlayerDisconnect(message);
        break;
      case 'heartbeat':
        this.handleHeartbeat(message);
        break;
      case 'sync':
        this.handleGameSync(message);
        break;
      case 'request_sync':
        this.handleSyncRequest(message);
        break;
    }
  }

  private handlePlayerConnect(message: NetworkMessage): void {
    const { playerId } = message.data;
    
    if (!this.connections.has(playerId)) {
      this.connections.set(playerId, {
        id: playerId,
        isHost: false,
        latency: 0,
        status: 'connected',
        lastHeartbeat: Date.now()
      });

      // If we're the host, send current game state
      if (this.isHost) {
        this.sendMessage('sync', {
          gameState: {}, // Would be populated with actual game state
          timestamp: Date.now()
        }, playerId);
      }
    }
  }

  private handlePlayerDisconnect(message: NetworkMessage): void {
    const { playerId } = message.data;
    this.connections.delete(playerId);

    // Handle host migration if the host disconnected
    if (playerId === this.hostId && !this.isHost) {
      this.handleHostMigration();
    }
  }

  private handleHeartbeat(message: NetworkMessage): void {
    const connection = this.connections.get(message.senderId);
    if (connection) {
      connection.lastHeartbeat = Date.now();
      connection.latency = Date.now() - message.timestamp;
    }
  }

  private handleGameSync(message: NetworkMessage): void {
    if (this.isHost) return; // Hosts don't process sync messages
    
    this.lastSyncTime = Date.now();
    // Apply game state from sync data
    // This would update the local game state to match the host's
  }

  private handleSyncRequest(message: NetworkMessage): void {
    if (!this.isHost) return;
    
    // Send current game state to the requester
    this.sendMessage('sync', {
      gameState: {}, // Would be populated with actual game state
      timestamp: Date.now()
    }, message.senderId);
  }

  private sendHeartbeat(): void {
    this.sendMessage('heartbeat', {
      timestamp: Date.now()
    });
  }

  private checkConnectionHealth(): void {
    const now = Date.now();
    const timeout = this.config.heartbeatInterval * 3;

    for (const [playerId, connection] of this.connections) {
      if (now - connection.lastHeartbeat > timeout) {
        console.warn(`Connection timeout for player ${playerId}`);
        connection.status = 'disconnected';
        this.connections.delete(playerId);
      }
    }
  }

  private handleHostMigration(): void {
    // Find the player with the lowest latency to become the new host
    const connections = Array.from(this.connections.values())
      .filter(conn => conn.id !== this.hostId)
      .sort((a, b) => a.latency - b.latency);

    if (connections.length > 0) {
      const newHost = connections[0];
      this.hostId = newHost.id;
      
      if (newHost.id === this.localPlayerId) {
        this.isHost = true;
      }

      this.sendMessage('host_migration', {
        newHostId: newHost.id,
        timestamp: Date.now()
      });
    }
  }

  private simulateMessageSend(message: NetworkMessage, targetId?: string): void {
    // Simulate network delay
    setTimeout(() => {
      if (targetId) {
        // Send to specific target
        this.messageQueue.push(message);
      } else {
        // Broadcast to all connections
        this.messageQueue.push(message);
      }
    }, 10 + Math.random() * 40); // 10-50ms simulated latency
  }

  private initializeMessageHandlers(): void {
    // Initialize default message handlers
    this.messageHandlers.set('connect', []);
    this.messageHandlers.set('disconnect', []);
    this.messageHandlers.set('heartbeat', []);
    this.messageHandlers.set('sync', []);
    this.messageHandlers.set('player_action', []);
    this.messageHandlers.set('game_event', []);
    this.messageHandlers.set('chat', []);
    this.messageHandlers.set('error', []);
    this.messageHandlers.set('request_sync', []);
    this.messageHandlers.set('host_migration', []);
  }

  private generatePlayerId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateRoomId(): string {
    return `room_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultConfig(): NetworkConfig {
    return {
      maxConnections: 4,
      heartbeatInterval: 1000,
      syncInterval: 50,
      maxLatency: 500,
      enableP2P: true,
      enableRelay: false
    };
  }
}
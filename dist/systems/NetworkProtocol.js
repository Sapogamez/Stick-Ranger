"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkProtocol = void 0;
class NetworkProtocol {
    constructor() {
        this.connections = new Map();
        this.messageHandlers = new Map();
        this.isHost = false;
        this.hostId = null;
        this.messageQueue = [];
        this.syncFrame = 0;
        this.lastSyncTime = 0;
        this.localPlayerId = this.generatePlayerId();
        this.config = this.getDefaultConfig();
        this.initializeMessageHandlers();
    }
    static getInstance() {
        if (!NetworkProtocol.instance) {
            NetworkProtocol.instance = new NetworkProtocol();
        }
        return NetworkProtocol.instance;
    }
    // Connection Management
    createRoom() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    joinRoom(roomId) {
        return __awaiter(this, void 0, void 0, function* () {
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
            }
            catch (error) {
                console.error('Failed to join room:', error);
                return false;
            }
        });
    }
    disconnect() {
        this.sendMessage('disconnect', {
            playerId: this.localPlayerId,
            timestamp: Date.now()
        });
        this.connections.clear();
        this.isHost = false;
        this.hostId = null;
    }
    // Message Handling
    sendMessage(type, data, targetId) {
        const message = {
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
    onMessage(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, []);
        }
        this.messageHandlers.get(type).push(handler);
    }
    processMessages() {
        const messages = [...this.messageQueue];
        this.messageQueue = [];
        for (const message of messages) {
            this.handleMessage(message);
        }
    }
    // Game Synchronization
    sendGameSync(syncData) {
        if (!this.isHost)
            return;
        this.sendMessage('sync', Object.assign(Object.assign({}, syncData), { frame: this.syncFrame++ }));
    }
    requestSync() {
        if (this.isHost)
            return;
        this.sendMessage('request_sync', {
            requesterId: this.localPlayerId,
            timestamp: Date.now()
        });
    }
    // Player Action Synchronization
    sendPlayerAction(action, actionData) {
        this.sendMessage('player_action', {
            action,
            actionData,
            playerId: this.localPlayerId,
            frame: this.syncFrame
        });
    }
    // Connection Status
    getConnections() {
        return Array.from(this.connections.values());
    }
    getConnectionCount() {
        return this.connections.size;
    }
    isConnected() {
        return this.connections.size > 0;
    }
    getLatency(playerId) {
        const connection = this.connections.get(playerId || this.localPlayerId);
        return (connection === null || connection === void 0 ? void 0 : connection.latency) || 0;
    }
    // Heartbeat System
    startHeartbeat() {
        setInterval(() => {
            this.sendHeartbeat();
            this.checkConnectionHealth();
        }, this.config.heartbeatInterval);
    }
    // Utility Methods
    getLocalPlayerId() {
        return this.localPlayerId;
    }
    isHostPlayer() {
        return this.isHost;
    }
    getHostId() {
        return this.hostId;
    }
    updateConfig(newConfig) {
        this.config = Object.assign(Object.assign({}, this.config), newConfig);
    }
    getNetworkStats() {
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
    handleMessage(message) {
        const handlers = this.messageHandlers.get(message.type) || [];
        for (const handler of handlers) {
            try {
                handler(message);
            }
            catch (error) {
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
    handlePlayerConnect(message) {
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
    handlePlayerDisconnect(message) {
        const { playerId } = message.data;
        this.connections.delete(playerId);
        // Handle host migration if the host disconnected
        if (playerId === this.hostId && !this.isHost) {
            this.handleHostMigration();
        }
    }
    handleHeartbeat(message) {
        const connection = this.connections.get(message.senderId);
        if (connection) {
            connection.lastHeartbeat = Date.now();
            connection.latency = Date.now() - message.timestamp;
        }
    }
    handleGameSync(message) {
        if (this.isHost)
            return; // Hosts don't process sync messages
        this.lastSyncTime = Date.now();
        // Apply game state from sync data
        // This would update the local game state to match the host's
    }
    handleSyncRequest(message) {
        if (!this.isHost)
            return;
        // Send current game state to the requester
        this.sendMessage('sync', {
            gameState: {}, // Would be populated with actual game state
            timestamp: Date.now()
        }, message.senderId);
    }
    sendHeartbeat() {
        this.sendMessage('heartbeat', {
            timestamp: Date.now()
        });
    }
    checkConnectionHealth() {
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
    handleHostMigration() {
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
    simulateMessageSend(message, targetId) {
        // Simulate network delay
        setTimeout(() => {
            if (targetId) {
                // Send to specific target
                this.messageQueue.push(message);
            }
            else {
                // Broadcast to all connections
                this.messageQueue.push(message);
            }
        }, 10 + Math.random() * 40); // 10-50ms simulated latency
    }
    initializeMessageHandlers() {
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
    generatePlayerId() {
        return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateRoomId() {
        return `room_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    }
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getDefaultConfig() {
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
exports.NetworkProtocol = NetworkProtocol;

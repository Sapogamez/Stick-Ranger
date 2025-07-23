"use strict";
/**
 * Main Game React Component for Stick Ranger
 *
 * This component provides the React UI wrapper around the game engine
 * and handles the integration between React and the canvas-based game.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const react_1 = __importStar(require("react"));
const GameLoop_1 = require("../engine/GameLoop");
const Canvas_1 = require("../engine/Canvas");
const EntitySystem_1 = require("../systems/EntitySystem");
const Game = ({ width = 800, height = 600, showDebug = true }) => {
    const canvasRef = (0, react_1.useRef)(null);
    const gameLoopRef = (0, react_1.useRef)(null);
    const canvasEngineRef = (0, react_1.useRef)(null);
    const entitySystemRef = (0, react_1.useRef)(null);
    const [gameStats, setGameStats] = (0, react_1.useState)({
        fps: 0,
        entityCount: 0,
        isRunning: false,
        isPaused: false
    });
    // Initialize game when component mounts
    (0, react_1.useEffect)(() => {
        if (canvasRef.current && !gameLoopRef.current) {
            try {
                // Create canvas engine using the React canvas element
                const canvas = new Canvas_1.Canvas(canvasRef.current.id, width, height);
                canvasEngineRef.current = canvas;
                // Create entity system
                const entitySystem = new EntitySystem_1.EntitySystem();
                entitySystemRef.current = entitySystem;
                // Create and start game loop
                const gameLoop = new GameLoop_1.GameLoop(canvas, entitySystem);
                gameLoopRef.current = gameLoop;
                // Setup debug controls if enabled
                if (showDebug) {
                    gameLoop.setupDebugControls();
                }
                // Start the game
                gameLoop.start();
                console.log('Game initialized and started from React component');
            }
            catch (error) {
                console.error('Failed to initialize game:', error);
            }
        }
        // Cleanup on unmount
        return () => {
            if (gameLoopRef.current) {
                gameLoopRef.current.stop();
            }
        };
    }, [width, height, showDebug]);
    // Update stats periodically
    (0, react_1.useEffect)(() => {
        const interval = setInterval(() => {
            if (gameLoopRef.current && entitySystemRef.current) {
                setGameStats({
                    fps: gameLoopRef.current.getFPS(),
                    entityCount: entitySystemRef.current.getEntityCount(),
                    isRunning: gameLoopRef.current.getIsRunning(),
                    isPaused: gameLoopRef.current.getIsPaused()
                });
            }
        }, 100); // Update every 100ms
        return () => clearInterval(interval);
    }, []);
    // Handle canvas resize
    (0, react_1.useEffect)(() => {
        if (canvasEngineRef.current) {
            canvasEngineRef.current.resize(width, height);
        }
    }, [width, height]);
    const handlePauseToggle = () => {
        if (gameLoopRef.current) {
            if (gameStats.isPaused) {
                gameLoopRef.current.resume();
            }
            else {
                gameLoopRef.current.pause();
            }
        }
    };
    const handleRestart = () => {
        if (gameLoopRef.current && entitySystemRef.current) {
            // Clear existing entities and create new ones
            entitySystemRef.current.clear();
            // Recreate demo entities
            const entitySystem = new EntitySystem_1.EntitySystem();
            entitySystemRef.current = entitySystem;
            console.log('Game restarted');
        }
    };
    return (react_1.default.createElement("div", { style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px',
            fontFamily: 'monospace'
        } },
        react_1.default.createElement("h1", { style: { margin: '0 0 20px 0', color: '#333' } }, "Stick Ranger"),
        react_1.default.createElement("canvas", { ref: canvasRef, id: "game-canvas", width: width, height: height, style: {
                border: '2px solid #333',
                borderRadius: '4px',
                backgroundColor: '#1a1a1a'
            } }),
        react_1.default.createElement("div", { style: {
                marginTop: '20px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center'
            } },
            react_1.default.createElement("button", { onClick: handlePauseToggle, style: {
                    padding: '8px 16px',
                    backgroundColor: gameStats.isPaused ? '#4CAF50' : '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                } }, gameStats.isPaused ? 'Resume' : 'Pause'),
            react_1.default.createElement("button", { onClick: handleRestart, style: {
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                } }, "Restart")),
        showDebug && (react_1.default.createElement("div", { style: {
                marginTop: '20px',
                padding: '15px',
                backgroundColor: '#f5f5f5',
                borderRadius: '4px',
                minWidth: '300px'
            } },
            react_1.default.createElement("h3", { style: { margin: '0 0 10px 0' } }, "Debug Information"),
            react_1.default.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' } },
                react_1.default.createElement("span", null, "FPS:"),
                react_1.default.createElement("span", { style: { fontWeight: 'bold' } }, gameStats.fps),
                react_1.default.createElement("span", null, "Entities:"),
                react_1.default.createElement("span", { style: { fontWeight: 'bold' } }, gameStats.entityCount),
                react_1.default.createElement("span", null, "Running:"),
                react_1.default.createElement("span", { style: {
                        fontWeight: 'bold',
                        color: gameStats.isRunning ? '#4CAF50' : '#f44336'
                    } }, gameStats.isRunning ? 'Yes' : 'No'),
                react_1.default.createElement("span", null, "Paused:"),
                react_1.default.createElement("span", { style: {
                        fontWeight: 'bold',
                        color: gameStats.isPaused ? '#f44336' : '#4CAF50'
                    } }, gameStats.isPaused ? 'Yes' : 'No')),
            react_1.default.createElement("div", { style: { marginTop: '10px', fontSize: '12px', color: '#666' } },
                react_1.default.createElement("div", null, "Keyboard Controls:"),
                react_1.default.createElement("div", null, "\u2022 Space: Pause/Resume"),
                react_1.default.createElement("div", null, "\u2022 1-5: Time scale (0.1x - 5x)"))))));
};
exports.Game = Game;
exports.default = exports.Game;

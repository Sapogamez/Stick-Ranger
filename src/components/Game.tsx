/**
 * Main Game React Component for Stick Ranger
 * 
 * This component provides the React UI wrapper around the game engine
 * and handles the integration between React and the canvas-based game.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameLoop } from '../engine/GameLoop';
import { Canvas } from '../engine/Canvas';
import { EntitySystem } from '../systems/EntitySystem';

interface GameProps {
    width?: number;
    height?: number;
    showDebug?: boolean;
}

interface GameStats {
    fps: number;
    entityCount: number;
    isRunning: boolean;
    isPaused: boolean;
}

export const Game: React.FC<GameProps> = ({ 
    width = 800, 
    height = 600, 
    showDebug = true 
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const gameLoopRef = useRef<GameLoop | null>(null);
    const canvasEngineRef = useRef<Canvas | null>(null);
    const entitySystemRef = useRef<EntitySystem | null>(null);
    
    const [gameStats, setGameStats] = useState<GameStats>({
        fps: 0,
        entityCount: 0,
        isRunning: false,
        isPaused: false
    });

    // Initialize game when component mounts
    useEffect(() => {
        if (canvasRef.current && !gameLoopRef.current) {
            try {
                // Create canvas engine using the React canvas element
                const canvas = new Canvas(canvasRef.current.id, width, height);
                canvasEngineRef.current = canvas;
                
                // Create entity system
                const entitySystem = new EntitySystem();
                entitySystemRef.current = entitySystem;
                
                // Create and start game loop
                const gameLoop = new GameLoop(canvas, entitySystem);
                gameLoopRef.current = gameLoop;
                
                // Setup debug controls if enabled
                if (showDebug) {
                    gameLoop.setupDebugControls();
                }
                
                // Start the game
                gameLoop.start();
                
                console.log('Game initialized and started from React component');
            } catch (error) {
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
    useEffect(() => {
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
    useEffect(() => {
        if (canvasEngineRef.current) {
            canvasEngineRef.current.resize(width, height);
        }
    }, [width, height]);

    const handlePauseToggle = () => {
        if (gameLoopRef.current) {
            if (gameStats.isPaused) {
                gameLoopRef.current.resume();
            } else {
                gameLoopRef.current.pause();
            }
        }
    };

    const handleRestart = () => {
        if (gameLoopRef.current && entitySystemRef.current) {
            // Clear existing entities and create new ones
            entitySystemRef.current.clear();
            
            // Recreate demo entities
            const entitySystem = new EntitySystem();
            entitySystemRef.current = entitySystem;
            
            console.log('Game restarted');
        }
    };

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            padding: '20px',
            fontFamily: 'monospace'
        }}>
            <h1 style={{ margin: '0 0 20px 0', color: '#333' }}>
                Stick Ranger
            </h1>
            
            {/* Game Canvas */}
            <canvas
                ref={canvasRef}
                id="game-canvas"
                width={width}
                height={height}
                style={{
                    border: '2px solid #333',
                    borderRadius: '4px',
                    backgroundColor: '#1a1a1a'
                }}
            />
            
            {/* Game Controls */}
            <div style={{ 
                marginTop: '20px', 
                display: 'flex', 
                gap: '10px', 
                alignItems: 'center' 
            }}>
                <button 
                    onClick={handlePauseToggle}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: gameStats.isPaused ? '#4CAF50' : '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    {gameStats.isPaused ? 'Resume' : 'Pause'}
                </button>
                
                <button 
                    onClick={handleRestart}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Restart
                </button>
            </div>
            
            {/* Debug Information */}
            {showDebug && (
                <div style={{ 
                    marginTop: '20px', 
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    minWidth: '300px'
                }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>Debug Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px' }}>
                        <span>FPS:</span>
                        <span style={{ fontWeight: 'bold' }}>{gameStats.fps}</span>
                        
                        <span>Entities:</span>
                        <span style={{ fontWeight: 'bold' }}>{gameStats.entityCount}</span>
                        
                        <span>Running:</span>
                        <span style={{ 
                            fontWeight: 'bold', 
                            color: gameStats.isRunning ? '#4CAF50' : '#f44336' 
                        }}>
                            {gameStats.isRunning ? 'Yes' : 'No'}
                        </span>
                        
                        <span>Paused:</span>
                        <span style={{ 
                            fontWeight: 'bold', 
                            color: gameStats.isPaused ? '#f44336' : '#4CAF50' 
                        }}>
                            {gameStats.isPaused ? 'Yes' : 'No'}
                        </span>
                    </div>
                    
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                        <div>Keyboard Controls:</div>
                        <div>• Space: Pause/Resume</div>
                        <div>• 1-5: Time scale (0.1x - 5x)</div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Game;
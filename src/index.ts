/**
 * Main entry point for Stick Ranger game
 * 
 * This file initializes the game engine and starts the main game loop.
 */

import { GameLoop } from './engine/GameLoop';
import { Canvas } from './engine/Canvas';
import { EntitySystem } from './systems/EntitySystem';

/**
 * Initialize and start the game
 */
function initGame(): void {
    // Create canvas and get rendering context
    const canvas = new Canvas('gameCanvas', 800, 600);
    
    // Initialize entity system
    const entitySystem = new EntitySystem();
    
    // Create and start game loop
    const gameLoop = new GameLoop(canvas, entitySystem);
    gameLoop.start();
    
    console.log('Stick Ranger game initialized successfully!');
}

// Start the game when DOM is loaded
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    } else {
        initGame();
    }
} else {
    // Node.js environment - export for testing
    console.log('Stick Ranger - Server/Test Environment');
}

// Export main initialization function for external use
export { initGame };
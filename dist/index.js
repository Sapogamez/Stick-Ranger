"use strict";
/**
 * Main entry point for Stick Ranger game
 *
 * This file initializes the game engine and starts the main game loop.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initGame = initGame;
const GameLoop_1 = require("./engine/GameLoop");
const Canvas_1 = require("./engine/Canvas");
const EntitySystem_1 = require("./systems/EntitySystem");
/**
 * Initialize and start the game
 */
function initGame() {
    // Create canvas and get rendering context
    const canvas = new Canvas_1.Canvas('gameCanvas', 800, 600);
    // Initialize entity system
    const entitySystem = new EntitySystem_1.EntitySystem();
    // Create and start game loop
    const gameLoop = new GameLoop_1.GameLoop(canvas, entitySystem);
    gameLoop.start();
    console.log('Stick Ranger game initialized successfully!');
}
// Start the game when DOM is loaded
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGame);
    }
    else {
        initGame();
    }
}
else {
    // Node.js environment - export for testing
    console.log('Stick Ranger - Server/Test Environment');
}

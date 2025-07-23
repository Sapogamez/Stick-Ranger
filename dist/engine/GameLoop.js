"use strict";
/**
 * Game Loop implementation for Stick Ranger
 *
 * Manages the main game loop, timing, and coordination between systems.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameLoop = void 0;
class GameLoop {
    constructor(canvas, entitySystem) {
        this.isRunning = false;
        this.lastTime = 0;
        this.animationFrameId = null;
        // Performance tracking
        this.frameCount = 0;
        this.fpsUpdateTime = 0;
        this.currentFPS = 0;
        this.targetFPS = 60;
        this.deltaTime = 0;
        // Game state
        this.isPaused = false;
        this.timeScale = 1.0;
        this.canvas = canvas;
        this.entitySystem = entitySystem;
        // Bind methods to maintain context
        this.gameLoop = this.gameLoop.bind(this);
    }
    /**
     * Start the game loop
     */
    start() {
        if (this.isRunning) {
            console.warn('Game loop is already running');
            return;
        }
        this.isRunning = true;
        this.lastTime = performance.now();
        this.fpsUpdateTime = this.lastTime;
        this.frameCount = 0;
        console.log('Starting game loop...');
        this.gameLoop();
    }
    /**
     * Stop the game loop
     */
    stop() {
        if (!this.isRunning) {
            console.warn('Game loop is not running');
            return;
        }
        this.isRunning = false;
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        console.log('Game loop stopped');
    }
    /**
     * Pause the game loop (continue rendering but stop updates)
     */
    pause() {
        this.isPaused = true;
        console.log('Game loop paused');
    }
    /**
     * Resume the game loop
     */
    resume() {
        this.isPaused = false;
        console.log('Game loop resumed');
    }
    /**
     * Set the time scale for game simulation
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0, scale);
    }
    /**
     * Get current FPS
     */
    getFPS() {
        return this.currentFPS;
    }
    /**
     * Get current delta time
     */
    getDeltaTime() {
        return this.deltaTime;
    }
    /**
     * Check if the game loop is running
     */
    getIsRunning() {
        return this.isRunning;
    }
    /**
     * Check if the game is paused
     */
    getIsPaused() {
        return this.isPaused;
    }
    /**
     * Main game loop function
     */
    gameLoop() {
        if (!this.isRunning) {
            return;
        }
        const currentTime = performance.now();
        const rawDeltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
        // Cap delta time to prevent large jumps (e.g., when tab loses focus)
        this.deltaTime = Math.min(rawDeltaTime, 1 / 20) * this.timeScale; // Max 50ms delta
        this.lastTime = currentTime;
        // Update FPS counter
        this.updateFPS(currentTime);
        // Update game logic (only if not paused)
        if (!this.isPaused) {
            this.update(this.deltaTime);
        }
        // Always render (even when paused)
        this.render();
        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
    /**
     * Update game logic
     */
    update(deltaTime) {
        // Update entity system
        this.entitySystem.update(deltaTime);
        // Additional game logic updates would go here
    }
    /**
     * Render the game
     */
    render() {
        // Clear canvas
        this.canvas.clear();
        this.canvas.fill('#1a1a1a'); // Dark background
        // Render entities
        this.entitySystem.render(this.canvas);
        // Render debug information
        this.renderDebugInfo();
    }
    /**
     * Render debug information
     */
    renderDebugInfo() {
        const padding = 10;
        const lineHeight = 16;
        let y = padding;
        // FPS
        this.canvas.drawText(`FPS: ${this.currentFPS}`, padding, y, '#00ff00', 12);
        y += lineHeight;
        // Delta time
        this.canvas.drawText(`Delta: ${(this.deltaTime * 1000).toFixed(1)}ms`, padding, y, '#00ff00', 12);
        y += lineHeight;
        // Entity count
        const entityCount = this.entitySystem.getEntityCount();
        this.canvas.drawText(`Entities: ${entityCount}`, padding, y, '#00ff00', 12);
        y += lineHeight;
        // Time scale
        if (this.timeScale !== 1.0) {
            this.canvas.drawText(`Time Scale: ${this.timeScale.toFixed(1)}x`, padding, y, '#ffff00', 12);
            y += lineHeight;
        }
        // Paused indicator
        if (this.isPaused) {
            this.canvas.drawText('PAUSED', padding, y, '#ff0000', 12);
        }
    }
    /**
     * Update FPS counter
     */
    updateFPS(currentTime) {
        this.frameCount++;
        if (currentTime - this.fpsUpdateTime >= 1000) { // Update every second
            this.currentFPS = Math.round(this.frameCount * 1000 / (currentTime - this.fpsUpdateTime));
            this.frameCount = 0;
            this.fpsUpdateTime = currentTime;
        }
    }
    /**
     * Add keyboard controls for debugging
     */
    setupDebugControls() {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    if (this.isPaused) {
                        this.resume();
                    }
                    else {
                        this.pause();
                    }
                    break;
                case 'Digit1':
                    event.preventDefault();
                    this.setTimeScale(0.1);
                    break;
                case 'Digit2':
                    event.preventDefault();
                    this.setTimeScale(0.5);
                    break;
                case 'Digit3':
                    event.preventDefault();
                    this.setTimeScale(1.0);
                    break;
                case 'Digit4':
                    event.preventDefault();
                    this.setTimeScale(2.0);
                    break;
                case 'Digit5':
                    event.preventDefault();
                    this.setTimeScale(5.0);
                    break;
            }
        });
        console.log('Debug controls enabled:');
        console.log('  Space: Pause/Resume');
        console.log('  1-5: Time scale (0.1x, 0.5x, 1x, 2x, 5x)');
    }
}
exports.GameLoop = GameLoop;

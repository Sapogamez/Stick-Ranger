/**
 * Game Loop implementation for Stick Ranger
 * 
 * Manages the main game loop, timing, and coordination between systems.
 */

import { Canvas } from './Canvas';
import { EntitySystem } from '../systems/EntitySystem';

export class GameLoop {
    private canvas: Canvas;
    private entitySystem: EntitySystem;
    private isRunning: boolean = false;
    private lastTime: number = 0;
    private animationFrameId: number | null = null;
    
    // Performance tracking
    private frameCount: number = 0;
    private fpsUpdateTime: number = 0;
    private currentFPS: number = 0;
    private targetFPS: number = 60;
    private deltaTime: number = 0;
    
    // Game state
    private isPaused: boolean = false;
    private timeScale: number = 1.0;

    constructor(canvas: Canvas, entitySystem: EntitySystem) {
        this.canvas = canvas;
        this.entitySystem = entitySystem;
        
        // Bind methods to maintain context
        this.gameLoop = this.gameLoop.bind(this);
    }

    /**
     * Start the game loop
     */
    start(): void {
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
    stop(): void {
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
    pause(): void {
        this.isPaused = true;
        console.log('Game loop paused');
    }

    /**
     * Resume the game loop
     */
    resume(): void {
        this.isPaused = false;
        console.log('Game loop resumed');
    }

    /**
     * Set the time scale for game simulation
     */
    setTimeScale(scale: number): void {
        this.timeScale = Math.max(0, scale);
    }

    /**
     * Get current FPS
     */
    getFPS(): number {
        return this.currentFPS;
    }

    /**
     * Get current delta time
     */
    getDeltaTime(): number {
        return this.deltaTime;
    }

    /**
     * Check if the game loop is running
     */
    getIsRunning(): boolean {
        return this.isRunning;
    }

    /**
     * Check if the game is paused
     */
    getIsPaused(): boolean {
        return this.isPaused;
    }

    /**
     * Main game loop function
     */
    private gameLoop(): void {
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
    private update(deltaTime: number): void {
        // Update entity system
        this.entitySystem.update(deltaTime);
        
        // Additional game logic updates would go here
    }

    /**
     * Render the game
     */
    private render(): void {
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
    private renderDebugInfo(): void {
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
    private updateFPS(currentTime: number): void {
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
    setupDebugControls(): void {
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'Space':
                    event.preventDefault();
                    if (this.isPaused) {
                        this.resume();
                    } else {
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
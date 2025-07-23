/**
 * Canvas rendering context manager for Stick Ranger
 * 
 * Handles canvas creation, resizing, and basic rendering operations.
 */

import { Vector2 } from '../types/game';

export class Canvas {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(canvasId: string, width: number, height: number) {
        this.width = width;
        this.height = height;
        
        // Try to get existing canvas or create new one
        let existingCanvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (existingCanvas) {
            this.canvas = existingCanvas;
        } else {
            this.canvas = document.createElement('canvas');
            this.canvas.id = canvasId;
            document.body.appendChild(this.canvas);
        }
        
        // Set canvas dimensions
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.border = '1px solid #000';
        
        // Get 2D context
        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get 2D rendering context');
        }
        this.context = ctx;
        
        // Setup default rendering settings
        this.setupDefaults();
    }

    private setupDefaults(): void {
        this.context.imageSmoothingEnabled = false; // Pixel-perfect rendering
        this.context.textAlign = 'left';
        this.context.textBaseline = 'top';
        this.context.font = '12px monospace';
    }

    /**
     * Clear the entire canvas
     */
    clear(): void {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    /**
     * Fill the canvas with a solid color
     */
    fill(color: string): void {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    /**
     * Draw a rectangle
     */
    drawRect(x: number, y: number, width: number, height: number, color: string): void {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, width, height);
    }

    /**
     * Draw a rectangle outline
     */
    drawRectOutline(x: number, y: number, width: number, height: number, color: string, lineWidth: number = 1): void {
        this.context.strokeStyle = color;
        this.context.lineWidth = lineWidth;
        this.context.strokeRect(x, y, width, height);
    }

    /**
     * Draw a circle
     */
    drawCircle(x: number, y: number, radius: number, color: string): void {
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.fill();
    }

    /**
     * Draw a circle outline
     */
    drawCircleOutline(x: number, y: number, radius: number, color: string, lineWidth: number = 1): void {
        this.context.strokeStyle = color;
        this.context.lineWidth = lineWidth;
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, Math.PI * 2);
        this.context.stroke();
    }

    /**
     * Draw text
     */
    drawText(text: string, x: number, y: number, color: string, fontSize: number = 12): void {
        this.context.fillStyle = color;
        this.context.font = `${fontSize}px monospace`;
        this.context.fillText(text, x, y);
    }

    /**
     * Draw a line
     */
    drawLine(start: Vector2, end: Vector2, color: string, lineWidth: number = 1): void {
        this.context.strokeStyle = color;
        this.context.lineWidth = lineWidth;
        this.context.beginPath();
        this.context.moveTo(start.x, start.y);
        this.context.lineTo(end.x, end.y);
        this.context.stroke();
    }

    /**
     * Get canvas dimensions
     */
    getDimensions(): { width: number; height: number } {
        return { width: this.width, height: this.height };
    }

    /**
     * Get the HTML canvas element
     */
    getElement(): HTMLCanvasElement {
        return this.canvas;
    }

    /**
     * Get the 2D rendering context
     */
    getContext(): CanvasRenderingContext2D {
        return this.context;
    }

    /**
     * Resize the canvas
     */
    resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        this.setupDefaults(); // Re-apply defaults after resize
    }

    /**
     * Save the current rendering state
     */
    save(): void {
        this.context.save();
    }

    /**
     * Restore the previous rendering state
     */
    restore(): void {
        this.context.restore();
    }

    /**
     * Set the global alpha (transparency) for subsequent draw operations
     */
    setAlpha(alpha: number): void {
        this.context.globalAlpha = Math.max(0, Math.min(1, alpha));
    }
}
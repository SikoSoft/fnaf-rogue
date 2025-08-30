import { Bounds, Vector2D } from '../types/GameState';
import { InputHandler } from '../InputHandler';

export class Player implements Vector2D {
    public x: number;
    public y: number;
    public width: number = 32;
    public height: number = 32;
    public speed: number = 200;
    public health: number = 100;
    public bounds: Bounds;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.bounds = new PlayerBounds(this.x, this.y, this.width, this.height);
    }

    public update(deltaTime: number, inputHandler: InputHandler): void {
        const moveSpeed = this.speed * (deltaTime / 1000);
        
        if (inputHandler.keys.ArrowUp || inputHandler.keys.w) {
            this.y -= moveSpeed;
        }
        if (inputHandler.keys.ArrowDown || inputHandler.keys.s) {
            this.y += moveSpeed;
        }
        if (inputHandler.keys.ArrowLeft || inputHandler.keys.a) {
            this.x -= moveSpeed;
        }
        if (inputHandler.keys.ArrowRight || inputHandler.keys.d) {
            this.x += moveSpeed;
        }

        // Keep player within bounds
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
        this.y = Math.max(0, Math.min(600 - this.height, this.y));

        // Update bounds
        this.bounds.x = this.x;
        this.bounds.y = this.y;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Draw player as a pixel art boy
        ctx.save();
        
        // Body (blue shirt)
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(this.x + 8, this.y + 16, 16, 16);
        
        // Head (skin tone)
        ctx.fillStyle = '#f4d03f';
        ctx.fillRect(this.x + 10, this.y + 4, 12, 12);
        
        // Eyes (black)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 12, this.y + 7, 2, 2);
        ctx.fillRect(this.x + 18, this.y + 7, 2, 2);
        
        // Mouth (simple line)
        ctx.fillRect(this.x + 14, this.y + 11, 4, 1);
        
        // Arms (blue)
        ctx.fillStyle = '#4a90e2';
        ctx.fillRect(this.x + 4, this.y + 18, 4, 8);
        ctx.fillRect(this.x + 24, this.y + 18, 4, 8);
        
        // Legs (blue jeans)
        ctx.fillStyle = '#34495e';
        ctx.fillRect(this.x + 10, this.y + 32, 6, 8);
        ctx.fillRect(this.x + 16, this.y + 32, 6, 8);
        
        // Shoes (black)
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y + 40, 8, 2);
        ctx.fillRect(this.x + 16, this.y + 40, 8, 2);

        ctx.restore();
    }
}

class PlayerBounds implements Bounds {
    constructor(
        public x: number,
        public y: number,
        public width: number,
        public height: number
    ) {}

    public intersects(other: Bounds): boolean {
        return this.x < other.x + other.width &&
               this.x + this.width > other.x &&
               this.y < other.y + other.height &&
               this.y + this.height > other.y;
    }
}

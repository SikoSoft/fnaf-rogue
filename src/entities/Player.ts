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

    public update(deltaTime: number, inputHandler: InputHandler, colliders: Array<{x: number, y: number, width: number, height: number}> = []): void {
        const moveSpeed = this.speed * (deltaTime / 1000);

        let dx = 0;
        let dy = 0;
        if (inputHandler.keys.ArrowUp || (inputHandler as any).keys.w) dy -= moveSpeed;
        if (inputHandler.keys.ArrowDown || (inputHandler as any).keys.s) dy += moveSpeed;
        if (inputHandler.keys.ArrowLeft || (inputHandler as any).keys.a) dx -= moveSpeed;
        if (inputHandler.keys.ArrowRight || (inputHandler as any).keys.d) dx += moveSpeed;

        // Move X and resolve collisions
        this.x += dx;
        this.resolveCollisions(colliders, 'x');

        // Move Y and resolve collisions
        this.y += dy;
        this.resolveCollisions(colliders, 'y');

        // Keep within canvas bounds
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
        this.y = Math.max(0, Math.min(600 - this.height, this.y));

        // Update bounds
        this.bounds.x = this.x;
        this.bounds.y = this.y;
    }

    private resolveCollisions(colliders: Array<{x: number, y: number, width: number, height: number}>, axis: 'x' | 'y') {
        const selfRect = { x: this.x, y: this.y, width: this.width, height: this.height };
        for (const c of colliders) {
            if (this.rectsOverlap(selfRect, c)) {
                if (axis === 'x') {
                    if (selfRect.x + selfRect.width / 2 < c.x + c.width / 2) {
                        // Coming from left
                        this.x = c.x - this.width;
                    } else {
                        // From right
                        this.x = c.x + c.width;
                    }
                    selfRect.x = this.x;
                } else {
                    if (selfRect.y + selfRect.height / 2 < c.y + c.height / 2) {
                        // From top
                        this.y = c.y - this.height;
                    } else {
                        // From bottom
                        this.y = c.y + c.height;
                    }
                    selfRect.y = this.y;
                }
            }
        }
    }

    private rectsOverlap(a: {x:number,y:number,width:number,height:number}, b: {x:number,y:number,width:number,height:number}): boolean {
        return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
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

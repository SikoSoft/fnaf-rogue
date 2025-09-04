import { Bounds, Vector2D } from '../types/GameState';
import { Player } from './Player';

export class Enemy implements Vector2D {
    public x: number;
    public y: number;
    public width: number = 32;
    public height: number = 32;
    public speed: number = 80; // Slower than player
    public type: 'chicken' | 'fox' | 'bear';
    public bounds: Bounds;
    public animationFrame: number = 0;
    public animationSpeed: number = 0.1;
    private hasEnteredPlayArea: boolean = false;

    constructor(x: number, y: number, type: 'chicken' | 'fox' | 'bear') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.bounds = new EnemyBounds(this.x, this.y, this.width, this.height);
    }

    public update(deltaTime: number, player: Player, colliders: Array<{x: number, y: number, width: number, height: number}> = []): void {
        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const moveSpeed = this.speed * (deltaTime / 1000);
            let stepX = (dx / distance) * moveSpeed;
            let stepY = (dy / distance) * moveSpeed;

            // If not yet in play area, skip collision resolution until inside
            if (!this.hasEnteredPlayArea) {
                this.x += stepX;
                this.y += stepY;
            } else {
                // Move X then resolve
                this.x += stepX;
                this.resolveCollisions(colliders, 'x');
                // Move Y then resolve
                this.y += stepY;
                this.resolveCollisions(colliders, 'y');
            }
        }

        // Update animation frame
        this.animationFrame += this.animationSpeed * (deltaTime / 16);

        // Update bounds
        this.bounds.x = this.x;
        this.bounds.y = this.y;

        // Check if fully inside the play area now
        if (!this.hasEnteredPlayArea) {
            const insideX = this.x >= 0 && this.x <= 800 - this.width;
            const insideY = this.y >= 0 && this.y <= 600 - this.height;
            if (insideX && insideY) this.hasEnteredPlayArea = true;
        }
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        switch (this.type) {
            case 'chicken':
                this.renderChicken(ctx);
                break;
            case 'fox':
                this.renderFox(ctx);
                break;
            case 'bear':
                this.renderBear(ctx);
                break;
        }

        ctx.restore();
    }

    private renderChicken(ctx: CanvasRenderingContext2D): void {
        // Chicken body (white)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 8, this.y + 16, 16, 16);
        
        // Chicken head (white)
        ctx.fillRect(this.x + 10, this.y + 4, 12, 12);
        
        // Beak (orange)
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(this.x + 16, this.y + 8, 4, 2);
        
        // Eyes (black with red glow)
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x + 12, this.y + 7, 2, 2);
        ctx.fillRect(this.x + 18, this.y + 7, 2, 2);
        
        // Wings (white with black outline)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 4, this.y + 18, 4, 8);
        ctx.fillRect(this.x + 24, this.y + 18, 4, 8);
        
        // Legs (yellow)
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(this.x + 12, this.y + 32, 2, 8);
        ctx.fillRect(this.x + 18, this.y + 32, 2, 8);
    }

    private renderFox(ctx: CanvasRenderingContext2D): void {
        // Fox body (orange)
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(this.x + 8, this.y + 16, 16, 16);
        
        // Fox head (orange)
        ctx.fillRect(this.x + 10, this.y + 4, 12, 12);
        
        // Snout (lighter orange)
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(this.x + 16, this.y + 8, 4, 4);
        
        // Eyes (black with yellow glow)
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(this.x + 12, this.y + 7, 2, 2);
        ctx.fillRect(this.x + 18, this.y + 7, 2, 2);
        
        // Ears (orange triangles)
        ctx.fillStyle = '#e67e22';
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y + 2);
        ctx.lineTo(this.x + 16, this.y + 6);
        ctx.lineTo(this.x + 20, this.y + 2);
        ctx.fill();
        
        // Legs (orange)
        ctx.fillRect(this.x + 10, this.y + 32, 4, 8);
        ctx.fillRect(this.x + 18, this.y + 32, 4, 8);
    }

    private renderBear(ctx: CanvasRenderingContext2D): void {
        // Bear body (brown)
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x + 8, this.y + 16, 16, 16);
        
        // Bear head (brown)
        ctx.fillRect(this.x + 10, this.y + 4, 12, 12);
        
        // Snout (darker brown)
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + 16, this.y + 8, 4, 4);
        
        // Eyes (black with red glow)
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(this.x + 12, this.y + 7, 2, 2);
        ctx.fillRect(this.x + 18, this.y + 7, 2, 2);
        
        // Ears (brown)
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(this.x + 12, this.y + 2, 3, 3);
        ctx.fillRect(this.x + 17, this.y + 2, 3, 3);
        
        // Arms (brown)
        ctx.fillRect(this.x + 4, this.y + 18, 4, 8);
        ctx.fillRect(this.x + 24, this.y + 18, 4, 8);
        
        // Legs (brown)
        ctx.fillRect(this.x + 10, this.y + 32, 4, 8);
        ctx.fillRect(this.x + 18, this.y + 32, 4, 8);
    }
    private resolveCollisions(colliders: Array<{x: number, y: number, width: number, height: number}>, axis: 'x' | 'y') {
        const selfRect = { x: this.x, y: this.y, width: this.width, height: this.height };
        for (const c of colliders) {
            if (this.rectsOverlap(selfRect, c)) {
                if (axis === 'x') {
                    if (selfRect.x + selfRect.width / 2 < c.x + c.width / 2) {
                        this.x = c.x - this.width;
                    } else {
                        this.x = c.x + c.width;
                    }
                    selfRect.x = this.x;
                } else {
                    if (selfRect.y + selfRect.height / 2 < c.y + c.height / 2) {
                        this.y = c.y - this.height;
                    } else {
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
}

class EnemyBounds implements Bounds {
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

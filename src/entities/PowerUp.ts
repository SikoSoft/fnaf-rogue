import { Bounds, Vector2D } from '../types/GameState';

export class PowerUp implements Vector2D {
    public x: number;
    public y: number;
    public width: number = 24;
    public height: number = 24;
    public bounds: Bounds;
    public animationFrame: number = 0;
    public animationSpeed: number = 0.2;
    public glowIntensity: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.bounds = new PowerUpBounds(this.x, this.y, this.width, this.height);
    }

    public update(deltaTime: number): void {
        // Update animation frame
        this.animationFrame += this.animationSpeed * (deltaTime / 16);
        
        // Update glow effect
        this.glowIntensity = Math.sin(this.animationFrame) * 0.5 + 0.5;
    }

    public render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        
        // Draw pizza slice with glow effect
        this.drawPizzaSlice(ctx);
        
        ctx.restore();
    }

    private drawPizzaSlice(ctx: CanvasRenderingContext2D): void {
        // Glow effect
        ctx.shadowColor = '#e74c3c';
        ctx.shadowBlur = 10 + this.glowIntensity * 10;
        
        // Pizza slice base (crust color)
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y + 12);
        ctx.lineTo(this.x + 24, this.y + 12);
        ctx.lineTo(this.x + 12, this.y + 24);
        ctx.closePath();
        ctx.fill();
        
        // Pizza toppings (pepperoni)
        ctx.fillStyle = '#e74c3c';
        ctx.beginPath();
        ctx.arc(this.x + 16, this.y + 16, 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x + 20, this.y + 18, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Cheese (yellow)
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(this.x + 12, this.y + 12);
        ctx.lineTo(this.x + 22, this.y + 12);
        ctx.lineTo(this.x + 12, this.y + 22);
        ctx.closePath();
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
    }
}

class PowerUpBounds implements Bounds {
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

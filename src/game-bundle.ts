// Game Types and Interfaces
interface GameState {
    player: Player;
    enemies: Enemy[];
    powerUps: PowerUp[];
    gameOver: boolean;
    paused: boolean;
}

interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
    intersects(other: Bounds): boolean;
}

interface Vector2D {
    x: number;
    y: number;
}

// Input Handler Class
class InputHandler {
    public keys: { [key: string]: boolean } = {};

    constructor() {
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });

        // Prevent default behavior for arrow keys
        document.addEventListener('keydown', (e) => {
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
    }

    public handleKeyDown(e: KeyboardEvent): void {
        this.keys[e.key] = true;
    }

    public handleKeyUp(e: KeyboardEvent): void {
        this.keys[e.key] = false;
    }

    public isKeyPressed(key: string): boolean {
        return this.keys[key] || false;
    }

    public getMovementVector(): { x: number, y: number } {
        let x = 0;
        let y = 0;

        if (this.keys['ArrowUp'] || this.keys.w) y -= 1;
        if (this.keys['ArrowDown'] || this.keys.s) y += 1;
        if (this.keys['ArrowLeft'] || this.keys.a) x -= 1;
        if (this.keys['ArrowRight'] || this.keys.d) x += 1;

        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            x *= 0.707; // 1/√2
            y *= 0.707;
        }

        return { x, y };
    }
}

// Player Bounds Class
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

// Player Class
class Player implements Vector2D {
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

    public update(deltaTime: number, inputHandler: InputHandler, colliders: Array<{x:number,y:number,width:number,height:number}> = []): void {
        const moveSpeed = this.speed * (deltaTime / 1000);
        let dx = 0, dy = 0;
        if (inputHandler.keys.ArrowUp || (inputHandler as any).keys.w) dy -= moveSpeed;
        if (inputHandler.keys.ArrowDown || (inputHandler as any).keys.s) dy += moveSpeed;
        if (inputHandler.keys.ArrowLeft || (inputHandler as any).keys.a) dx -= moveSpeed;
        if (inputHandler.keys.ArrowRight || (inputHandler as any).keys.d) dx += moveSpeed;

        this.x += dx;
        this.resolveCollisions(colliders, 'x');
        this.y += dy;
        this.resolveCollisions(colliders, 'y');

        // Keep player within bounds
        this.x = Math.max(0, Math.min(800 - this.width, this.x));
        this.y = Math.max(0, Math.min(600 - this.height, this.y));

        // Update bounds
        this.bounds.x = this.x;
        this.bounds.y = this.y;
    }

    private resolveCollisions(colliders: Array<{x:number,y:number,width:number,height:number}>, axis: 'x'|'y') {
        const selfRect = { x: this.x, y: this.y, width: this.width, height: this.height };
        for (const c of colliders) {
            if (selfRect.x < c.x + c.width && selfRect.x + selfRect.width > c.x && selfRect.y < c.y + c.height && selfRect.y + selfRect.height > c.y) {
                if (axis === 'x') {
                    if (selfRect.x + selfRect.width / 2 < c.x + c.width / 2) this.x = c.x - this.width; else this.x = c.x + c.width;
                    selfRect.x = this.x;
                } else {
                    if (selfRect.y + selfRect.height / 2 < c.y + c.height / 2) this.y = c.y - this.height; else this.y = c.y + c.height;
                    selfRect.y = this.y;
                }
            }
        }
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

// Enemy Bounds Class
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

// Enemy Class
class Enemy implements Vector2D {
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

    public update(deltaTime: number, player: Player, colliders: Array<{x:number,y:number,width:number,height:number}> = []): void {
        // Move towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const moveSpeed = this.speed * (deltaTime / 1000);
            const stepX = (dx / distance) * moveSpeed;
            const stepY = (dy / distance) * moveSpeed;
            if (!this.hasEnteredPlayArea) {
                this.x += stepX;
                this.y += stepY;
            } else {
                this.x += stepX;
                this.resolveCollisions(colliders, 'x');
                this.y += stepY;
                this.resolveCollisions(colliders, 'y');
            }
        }

        // Update animation frame
        this.animationFrame += this.animationSpeed * (deltaTime / 16);

        // Update bounds
        this.bounds.x = this.x;
        this.bounds.y = this.y;

        if (!this.hasEnteredPlayArea) {
            const insideX = this.x >= 0 && this.x <= 800 - this.width;
            const insideY = this.y >= 0 && this.y <= 600 - this.height;
            if (insideX && insideY) this.hasEnteredPlayArea = true;
        }
    }

    private resolveCollisions(colliders: Array<{x:number,y:number,width:number,height:number}>, axis: 'x'|'y') {
        const selfRect = { x: this.x, y: this.y, width: this.width, height: this.height };
        for (const c of colliders) {
            if (selfRect.x < c.x + c.width && selfRect.x + selfRect.width > c.x && selfRect.y < c.y + c.height && selfRect.y + selfRect.height > c.y) {
                if (axis === 'x') {
                    if (selfRect.x + selfRect.width / 2 < c.x + c.width / 2) this.x = c.x - this.width; else this.x = c.x + c.width;
                    selfRect.x = this.x;
                } else {
                    if (selfRect.y + selfRect.height / 2 < c.y + c.height / 2) this.y = c.y - this.height; else this.y = c.y + c.height;
                    selfRect.y = this.y;
                }
            }
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
}

// PowerUp Bounds Class
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

// PowerUp Class
class PowerUp implements Vector2D {
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

// Room Class
class Room {
    private width: number;
    private height: number;
    private walls: Array<{x: number, y: number, width: number, height: number}> = [];
    private decorations: Array<{x: number, y: number, type: string}> = [];
    private floorPattern: Array<{x: number, y: number, color: string}> = [];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    public generateRoom(): void {
        this.generateWalls();
        this.generateFloor();
        this.generateDecorations();
    }

    private generateWalls(): void {
        // Outer walls
        this.walls.push({x: 0, y: 0, width: this.width, height: 20}); // Top
        this.walls.push({x: 0, y: this.height - 20, width: this.width, height: 20}); // Bottom
        this.walls.push({x: 0, y: 0, width: 20, height: this.height}); // Left
        this.walls.push({x: this.width - 20, y: 0, width: 20, height: this.height}); // Right

        // Internal walls (randomly placed)
        const numInternalWalls = Math.floor(Math.random() * 3) + 2;
        for (let i = 0; i < numInternalWalls; i++) {
            if (Math.random() < 0.5) {
                // Horizontal wall
                const x = Math.random() * (this.width - 100) + 50;
                const y = Math.random() * (this.height - 100) + 50;
                const width = Math.random() * 100 + 50;
                this.walls.push({x, y, width, height: 15});
            } else {
                // Vertical wall
                const x = Math.random() * (this.width - 100) + 50;
                const y = Math.random() * (this.height - 100) + 50;
                const height = Math.random() * 100 + 50;
                this.walls.push({x, y, width: 15, height});
            }
        }
    }

    private generateFloor(): void {
        // Create a checkered floor pattern
        const tileSize = 40;
        for (let x = 0; x < this.width; x += tileSize) {
            for (let y = 0; y < this.height; y += tileSize) {
                const color = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0 
                    ? '#2c3e50' 
                    : '#34495e';
                this.floorPattern.push({x, y, color});
            }
        }
    }

    private generateDecorations(): void {
        // Add some pizzeria-themed decorations
        const decorations = [
            {type: 'table', count: 3},
            {type: 'chair', count: 8},
            {type: 'plant', count: 2},
            {type: 'poster', count: 4},
            {type: 'arcade', count: 1}
        ];

        decorations.forEach(dec => {
            for (let i = 0; i < dec.count; i++) {
                let x, y;
                let attempts = 0;
                do {
                    x = Math.random() * (this.width - 60) + 30;
                    y = Math.random() * (this.height - 60) + 30;
                    attempts++;
                } while (this.isPositionOccupied(x, y) && attempts < 50);

                if (attempts < 50) {
                    this.decorations.push({x, y, type: dec.type});
                }
            }
        });
    }

    private isPositionOccupied(x: number, y: number): boolean {
        // Check if position conflicts with walls
        return this.walls.some(wall => 
            x < wall.x + wall.width && 
            x + 40 > wall.x && 
            y < wall.y + wall.height && 
            y + 40 > wall.y
        );
    }

    public render(ctx: CanvasRenderingContext2D): void {
        // Draw floor
        this.floorPattern.forEach(tile => {
            ctx.fillStyle = tile.color;
            ctx.fillRect(tile.x, tile.y, 40, 40);
        });

        // Draw walls
        ctx.fillStyle = '#8b4513';
        this.walls.forEach(wall => {
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            
            // Add wall texture
            ctx.fillStyle = '#654321';
            for (let i = 0; i < wall.width; i += 10) {
                for (let j = 0; j < wall.height; j += 10) {
                    if (Math.random() < 0.3) {
                        ctx.fillRect(wall.x + i, wall.y + j, 2, 2);
                    }
                }
            }
            ctx.fillStyle = '#8b4513';
        });

        // Draw decorations
        this.decorations.forEach(dec => {
            this.drawDecoration(ctx, dec.x, dec.y, dec.type);
        });
    }

    private drawDecoration(ctx: CanvasRenderingContext2D, x: number, y: number, type: string): void {
        switch (type) {
            case 'table':
                // Brown table
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(x, y, 40, 30);
                ctx.fillStyle = '#654321';
                ctx.fillRect(x + 5, y + 25, 30, 5);
                break;
                
            case 'chair':
                // Red chair
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(x, y, 20, 25);
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(x + 2, y + 20, 16, 5);
                break;
                
            case 'plant':
                // Green plant in pot
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(x + 15, y + 20, 10, 15);
                ctx.fillStyle = '#27ae60';
                ctx.beginPath();
                ctx.arc(x + 20, y + 15, 12, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'poster':
                // Colorful poster
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(x, y, 30, 20);
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(x + 5, y + 5, 20, 10);
                break;
                
            case 'arcade':
                // Arcade machine
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(x, y, 30, 50);
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(x + 5, y + 5, 20, 15);
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(x + 10, y + 25, 10, 5);
                break;
        }
    }
    public getColliders(): Array<{x: number, y: number, width: number, height: number}> {
        const colliders: Array<{x: number, y: number, width: number, height: number}> = [];
        colliders.push(...this.walls.map(w => ({ x: w.x, y: w.y, width: w.width, height: w.height })));
        for (const d of this.decorations) {
            switch (d.type) {
                case 'table':
                    colliders.push({ x: d.x, y: d.y, width: 40, height: 30 });
                    break;
                case 'chair':
                    colliders.push({ x: d.x, y: d.y, width: 20, height: 25 });
                    break;
                case 'plant':
                    colliders.push({ x: d.x + 8, y: d.y + 8, width: 24, height: 28 });
                    break;
                case 'poster':
                    break;
                case 'arcade':
                    colliders.push({ x: d.x, y: d.y, width: 30, height: 50 });
                    break;
            }
        }
        return colliders;
    }
}

// Renderer Class
class Renderer {
    private ctx: CanvasRenderingContext2D;

    constructor(ctx: CanvasRenderingContext2D) {
        this.ctx = ctx;
    }

    public render(gameState: GameState): void {
        // Render player
        gameState.player.render(this.ctx);

        // Render enemies
        gameState.enemies.forEach(enemy => {
            enemy.render(this.ctx);
        });

        // Render power-ups
        gameState.powerUps.forEach(powerUp => {
            powerUp.render(this.ctx);
        });

        // Render UI elements
        this.renderUI(gameState);
    }

    private renderUI(gameState: GameState): void {
        // Render health bar
        this.renderHealthBar(gameState.player.health);
        
        // Render enemy count
        this.renderEnemyCount(gameState.enemies.length);
        
        // Render power-up count
        this.renderPowerUpCount(gameState.powerUps.length);
    }

    private renderHealthBar(health: number): void {
        const barWidth = 200;
        const barHeight = 20;
        const x = 10;
        const y = 10;

        // Background
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Health bar
        const healthPercentage = health / 100;
        const healthWidth = barWidth * healthPercentage;
        
        if (healthPercentage > 0.6) {
            this.ctx.fillStyle = '#27ae60'; // Green
        } else if (healthPercentage > 0.3) {
            this.ctx.fillStyle = '#f39c12'; // Orange
        } else {
            this.ctx.fillStyle = '#e74c3c'; // Red
        }
        
        this.ctx.fillRect(x, y, healthWidth, barHeight);

        // Border
        this.ctx.strokeStyle = '#e94560';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, barWidth, barHeight);

        // Health text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '14px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${health}%`, x + barWidth / 2, y + 15);
    }

    private renderEnemyCount(count: number): void {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Enemies: ${count}`, 10, 50);
    }

    private renderPowerUpCount(count: number): void {
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.font = '16px Courier New';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Power-ups: ${count}`, 10, 70);
    }
}

// Main Game Class
class Game {
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private gameState!: GameState;
    private inputHandler!: InputHandler;
    private renderer!: Renderer;
    private lastTime: number = 0;
    private rooms: Room[] = [];
    private currentRoomIndex: number = 0;
    private score: number = 0;
    private level: number = 1;
    private jumpscareImage!: HTMLImageElement;
    private jumpscareEndTime: number | null = null;
    private soundEffects: Record<string, HTMLAudioElement> = {};

    constructor() {
        console.log('Game constructor called');
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        console.log('Canvas element:', this.canvas);
        
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d')!;
        console.log('Canvas context:', this.ctx);
        
        if (!this.ctx) {
            console.error('Could not get 2D context!');
            return;
        }
        
        this.gameState = {
            player: new Player(400, 300),
            enemies: [],
            powerUps: [],
            gameOver: false,
            paused: false
        };

        this.inputHandler = new InputHandler();
        this.renderer = new Renderer(this.ctx);

        // Preload jumpscare image
        this.jumpscareImage = new Image();
        this.jumpscareImage.src = 'jumpscare.webp';
        
        this.generateRooms();
        this.setupEventListeners();
        this.setupAudio();
        this.gameLoop();
        console.log('Game initialized successfully');
    }

    private generateRooms(): void {
        // Generate 5 rooms for the first level
        for (let i = 0; i < 5; i++) {
            const room = new Room(800, 600);
            room.generateRoom();
            this.rooms.push(room);
        }
    }

    private setupEventListeners(): void {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle key events
        document.addEventListener('keydown', (e) => {
            this.inputHandler.handleKeyDown(e);
            // Restart game on 'R' key when game is over and jumpscare finished
            if ((e.key === 'r' || e.key === 'R') && this.gameState.gameOver && this.jumpscareEndTime === null) {
                e.preventDefault();
                this.restartGame();
            }
        });

        document.addEventListener('keyup', (e) => {
            this.inputHandler.handleKeyUp(e);
        });
    }

    private handleResize(): void {
        // Maintain aspect ratio and center canvas
        const container = this.canvas.parentElement;
        if (container) {
            const containerWidth = container.clientWidth - 40;
            const containerHeight = container.clientHeight - 200;
            const aspectRatio = 800 / 600;
            
            let newWidth = containerWidth;
            let newHeight = containerWidth / aspectRatio;
            
            if (newHeight > containerHeight) {
                newHeight = containerHeight;
                newWidth = containerHeight * aspectRatio;
            }
            
            this.canvas.style.width = `${newWidth}px`;
            this.canvas.style.height = `${newHeight}px`;
        }
    }

    private update(deltaTime: number): void {
        if (this.gameState.gameOver || this.gameState.paused) return;

        // Current room colliders
        const currentRoom = this.rooms[this.currentRoomIndex];
        const colliders = currentRoom ? (currentRoom as any).getColliders() as Array<{x:number,y:number,width:number,height:number}> : [];

        // Update player with colliders
        this.gameState.player.update(deltaTime, this.inputHandler, colliders);
        
        // Update enemies
        this.gameState.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.gameState.player, colliders);
        });

        // Update power-ups
        this.gameState.powerUps.forEach(powerUp => {
            powerUp.update(deltaTime);
        });

        // Check collisions
        this.checkCollisions();

        // Spawn new enemies occasionally
        if (Math.random() < 0.001) {
            this.spawnEnemy();
        }

        // Spawn power-ups occasionally
        if (Math.random() < 0.002) {
            this.spawnPowerUp();
        }

        // Update UI
        this.updateUI();
    }

    private checkCollisions(): void {
        // Player vs Power-ups
        this.gameState.powerUps = this.gameState.powerUps.filter(powerUp => {
            if (this.gameState.player.bounds.intersects(powerUp.bounds)) {
                this.score += 10;
                this.gameState.player.health = Math.min(100, this.gameState.player.health + 20);
                return false;
            }
            return true;
        });

        // Player vs Enemies
        this.gameState.enemies.forEach(enemy => {
            if (this.gameState.player.bounds.intersects(enemy.bounds)) {
                this.gameState.player.health -= 20;
                if (this.gameState.player.health <= 0) {
                    // Trigger jumpscare timer if not already active
                    if (this.jumpscareEndTime === null) {
                        this.jumpscareEndTime = performance.now() + 2000; // 2 seconds
                        this.playSound('jumpscare');
                    }
                    this.gameState.gameOver = true;
                }
            }
        });

        // Remove enemies that are off-screen
        this.gameState.enemies = this.gameState.enemies.filter(enemy => {
            return enemy.x > -50 && enemy.x < 850 && enemy.y > -50 && enemy.y < 650;
        });
    }

    private spawnEnemy(): void {
        const enemyTypes: Array<'chicken' | 'fox' | 'bear'> = ['chicken', 'fox', 'bear'];
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -50 : 850;
            y = Math.random() * 600;
        } else {
            x = Math.random() * 800;
            y = Math.random() < 0.5 ? -50 : 650;
        }

        const enemy = new Enemy(x, y, type);
        this.gameState.enemies.push(enemy);
    }

    private spawnPowerUp(): void {
        const x = Math.random() * 700 + 50;
        const y = Math.random() * 500 + 50;
        const powerUp = new PowerUp(x, y);
        this.gameState.powerUps.push(powerUp);
    }

    private updateUI(): void {
        const scoreElement = document.getElementById('score');
        const healthElement = document.getElementById('health');
        const levelElement = document.getElementById('level');

        if (scoreElement) scoreElement.textContent = `Score: ${this.score}`;
        if (healthElement) healthElement.textContent = `Health: ${this.gameState.player.health}`;
        if (levelElement) levelElement.textContent = `Level: ${this.level}`;
    }

    private render(): void {
        //console.log('Render called, canvas size:', this.canvas.width, 'x', this.canvas.height);
        
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Test drawing - draw a simple red rectangle to see if canvas is working
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.fillRect(100, 100, 100, 100);

        // Render current room
        if (this.rooms[this.currentRoomIndex]) {
            this.rooms[this.currentRoomIndex].render(this.ctx);
        }

        // Render game entities
        this.renderer.render(this.gameState);

        // If in jumpscare window, render the jumpscare image and skip game over text
        if (this.jumpscareEndTime !== null) {
            const now = performance.now();
            if (now < this.jumpscareEndTime) {
                this.renderJumpscare();
                return;
            } else {
                // Jumpscare finished
                this.jumpscareEndTime = null;
            }
        }

        // Render game over screen after jumpscare completes
        if (this.gameState.gameOver) {
            this.renderGameOver();
        }
    }

    private renderJumpscare(): void {
        // Darken background slightly
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw image covering the canvas while preserving aspect ratio
        const img = this.jumpscareImage;
        const canvasW = this.canvas.width;
        const canvasH = this.canvas.height;
        const imgW = img.width || 1;
        const imgH = img.height || 1;
        const scale = Math.max(canvasW / imgW, canvasH / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const dx = (canvasW - drawW) / 2;
        const dy = (canvasH - drawH) / 2;
        this.ctx.drawImage(img, dx, dy, drawW, drawH);
    }
    private renderGameOver(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = '#e94560';
        this.ctx.font = '48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 50);

        this.ctx.font = '24px Courier New';
        this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 50);
    }

    private gameLoop(currentTime: number = 0): void {
        try {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;

            this.update(deltaTime);
            this.render();

            requestAnimationFrame((time) => this.gameLoop(time));
        } catch (error) {
            console.error('Error in game loop:', error);
        }
    }

    private restartGame(): void {
        // Reset core state
        this.score = 0;
        this.level = 1;
        this.lastTime = 0;
        this.jumpscareEndTime = null;

        // Reset rooms
        this.rooms = [];
        this.currentRoomIndex = 0;
        this.generateRooms();

        // Reset entities and flags
        this.gameState = {
            player: new Player(400, 300),
            enemies: [],
            powerUps: [],
            gameOver: false,
            paused: false
        };

        // Clear pressed keys to avoid sticky input
        this.inputHandler.keys = {};

        // Update UI immediately
        this.updateUI();
    }

    private setupAudio(): void {
        this.soundEffects = {
            jumpscare: new Audio('foxy-jumpscare-fnaf-2.mp3')
        };
        const jumpscareAudio = this.soundEffects.jumpscare;
        jumpscareAudio.preload = 'auto';
        jumpscareAudio.volume = 1.0;
    }

    private playSound(key: string): void {
        console.log('Playing sound:', key);
        const audio = this.soundEffects[key];
        if (!audio) return;
        try {
            audio.currentTime = 0;
            const playPromise = audio.play();
            if (playPromise && typeof (playPromise as any).then === 'function') {
                (playPromise as Promise<void>).catch(() => {});
            }
        } catch {}
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});

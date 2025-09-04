export class Room {
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

    // Return all collision rectangles (walls + solid decorations)
    public getColliders(): Array<{x: number, y: number, width: number, height: number}> {
        const colliders: Array<{x: number, y: number, width: number, height: number}> = [];

        // Walls are entirely solid
        colliders.push(...this.walls.map(w => ({ x: w.x, y: w.y, width: w.width, height: w.height })));

        // Decoration bounding boxes (approximate their visual sizes)
        for (const d of this.decorations) {
            switch (d.type) {
                case 'table':
                    colliders.push({ x: d.x, y: d.y, width: 40, height: 30 });
                    break;
                case 'chair':
                    colliders.push({ x: d.x, y: d.y, width: 20, height: 25 });
                    break;
                case 'plant':
                    // Pot + foliage radius ~12, use a rectangle that covers both
                    colliders.push({ x: d.x + 8, y: d.y + 8, width: 24, height: 28 });
                    break;
                case 'poster':
                    // Flat on wall; treat as non-colliding
                    break;
                case 'arcade':
                    colliders.push({ x: d.x, y: d.y, width: 30, height: 50 });
                    break;
            }
        }

        return colliders;
    }
}

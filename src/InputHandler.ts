export class InputHandler {
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

        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) y -= 1;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) y += 1;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) x -= 1;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) x += 1;

        // Normalize diagonal movement
        if (x !== 0 && y !== 0) {
            x *= 0.707; // 1/√2
            y *= 0.707;
        }

        return { x, y };
    }
}

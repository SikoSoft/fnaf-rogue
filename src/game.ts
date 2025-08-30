import { Player } from './entities/Player';
import { Enemy } from './entities/Enemy';
import { PowerUp } from './entities/PowerUp';
import { Room } from './Room';
import { GameState } from './types/GameState';
import { InputHandler } from './InputHandler';
import { Renderer } from './Renderer';

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private gameState: GameState;
    private inputHandler: InputHandler;
    private renderer: Renderer;
    private lastTime: number = 0;
    private rooms: Room[] = [];
    private currentRoomIndex: number = 0;
    private score: number = 0;
    private level: number = 1;

    constructor() {
        this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d')!;
        
        this.gameState = {
            player: new Player(400, 300),
            enemies: [],
            powerUps: [],
            gameOver: false,
            paused: false
        };

        this.inputHandler = new InputHandler();
        this.renderer = new Renderer(this.ctx);
        
        this.generateRooms();
        this.setupEventListeners();
        this.gameLoop();
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

        // Update player
        this.gameState.player.update(deltaTime, this.inputHandler);
        
        // Update enemies
        this.gameState.enemies.forEach(enemy => {
            enemy.update(deltaTime, this.gameState.player);
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
        this.gameState.gameOver = false;
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
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Render current room
        if (this.rooms[this.currentRoomIndex]) {
            this.rooms[this.currentRoomIndex].render(this.ctx);
        }

        // Render game entities
        this.renderer.render(this.gameState);

        // Render game over screen
        if (this.gameState.gameOver) {
            this.renderGameOver();
        }
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
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
});

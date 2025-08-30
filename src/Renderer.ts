import { GameState } from './types/GameState';

export class Renderer {
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

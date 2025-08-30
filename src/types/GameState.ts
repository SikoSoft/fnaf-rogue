import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { PowerUp } from '../entities/PowerUp';

export interface GameState {
    player: Player;
    enemies: Enemy[];
    powerUps: PowerUp[];
    gameOver: boolean;
    paused: boolean;
}

export interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
    intersects(other: Bounds): boolean;
}

export interface Vector2D {
    x: number;
    y: number;
}

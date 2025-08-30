# FNAF Rogue - Five Nights at Freddy's Roguelike

A pixel art roguelike game built with TypeScript and Canvas API, featuring a Five Nights at Freddy's theme where you control a boy exploring a procedurally generated pizzeria.

## Features

- **Pixel Art Graphics**: Retro-style pixel art characters and environments
- **Procedurally Generated Rooms**: Each playthrough features different room layouts
- **FNAF Theme**: Animatronic enemies (chicken, fox, bear) that chase the player
- **Power-ups**: Collect pizza slices to restore health and gain points
- **Smooth Controls**: Arrow key movement with smooth animations
- **Dynamic Spawning**: Enemies and power-ups spawn dynamically throughout gameplay

## Gameplay

- **Objective**: Survive as long as possible while collecting pizza slices
- **Movement**: Use arrow keys (or WASD) to move your character
- **Enemies**: Avoid the animatronic enemies that constantly move toward you
- **Power-ups**: Collect pizza slices to restore health (+20) and gain points (+10)
- **Health**: You start with 100 health, enemies deal 20 damage on contact

## Controls

- **Arrow Keys** or **WASD**: Move character
- **R**: Restart game (when game over)

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Build the Game**:
   ```bash
   npm run build
   ```

3. **Start Local Server**:
   ```bash
   npm start
   ```

4. **Open Browser**: Navigate to `http://localhost:8000`

## Development

- **Watch Mode**: `npm run dev` (automatically rebuilds on file changes)
- **Source Code**: Located in `src/` directory
- **Output**: Compiled JavaScript in `dist/` directory

## Project Structure

```
src/
├── entities/          # Game entities (Player, Enemy, PowerUp)
├── types/            # TypeScript interfaces
├── game.ts           # Main game loop and logic
├── Room.ts           # Procedural room generation
├── InputHandler.ts   # Keyboard input management
└── Renderer.ts       # Canvas rendering system
```

## Technologies Used

- **TypeScript**: Type-safe JavaScript development
- **Canvas API**: 2D graphics rendering
- **HTML5**: Game container and UI
- **CSS3**: Styling and animations

## Game Mechanics

### Player
- 32x32 pixel art boy character
- Moves at 200 pixels/second
- Health bar with color-coded status

### Enemies
- **Chicken**: White animatronic with red glowing eyes
- **Fox**: Orange animatronic with yellow glowing eyes  
- **Bear**: Brown animatronic with red glowing eyes
- Move at 80 pixels/second (slower than player)
- Constantly chase the player when in the same room

### Power-ups
- Animated pizza slices with glowing effects
- Restore health and provide points
- Spawn randomly throughout the room

### Rooms
- Procedurally generated with random wall layouts
- Pizzeria-themed decorations (tables, chairs, plants, posters, arcade)
- Checkered floor pattern for atmosphere

## Future Enhancements

- Multiple room types and themes
- Sound effects and background music
- More enemy types and behaviors
- Power-up variety (speed boosts, temporary invincibility)
- Level progression system
- High score tracking

## Browser Compatibility

- Modern browsers with ES2020 support
- Chrome 80+, Firefox 75+, Safari 13+, Edge 80+

Enjoy surviving the night at Freddy's pizzeria! 🍕👻

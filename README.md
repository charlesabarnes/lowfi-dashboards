# Low-Fi LED Dashboards

Personal collection of low-resolution dashboards and animations for my dual 128x32 LED matrix displays. Built to stream via [mqtt-pixel-streamer](https://github.com/charlesabarnes/mqtt-pixel-streamer) for real-time display on physical LED panels.

## What's This?

This is my personal repository of 40+ animated dashboards designed specifically for low-resolution LED displays (128x32 pixels each, stacked for 128x64 total). These range from practical dashboards (weather, time, stocks) to fun animations and retro games - all optimized for crisp display on LED matrices.

## Setup

### Quick Start
```bash
# Install dependencies
npm install

# Run the server
npm start

# Or development mode with auto-reload
npm run dev
```

Server runs on port 3002 by default. Access dashboards at `http://localhost:3002/dashboard/[name]`

### Integration with mqtt-pixel-streamer

I use this with [mqtt-pixel-streamer](https://github.com/charlesabarnes/mqtt-pixel-streamer) to stream the browser output to my physical LED panels:

1. Run this dashboard server
2. Configure OBS with browser source (128x64 pixels)
3. Stream via mqtt-pixel-streamer to LED panels

### OBS Configuration

Browser Source settings:
- Width: 128
- Height: 64
- FPS: 1-5 (depending on dashboard)
- URL: `http://localhost:3002/dashboard/[name]`

## Available Dashboards

### Practical Dashboards
- `weather-time` - Weather display (top) with clock (bottom)
- `stock-ticker` - Scrolling stock prices
- `sports-scores` - Live sports scores
- `weather-radar` - Animated weather radar
- `clock-tower` - Analog clock display
- `scrolling-text` - Customizable text scroller

### Games & Animations
- `pacman-maze` - Pac-Man animation
- `space-invaders` - Space Invaders game
- `tetris` - Falling blocks
- `snake-game` - Classic snake
- `frogger` - Road crossing game
- `breakout-arkanoid` - Brick breaker
- `centipede` - Centipede shooter
- `maze-runner` - Maze solving animation

### Visual Effects
- `matrix-effect` - Matrix digital rain
- `fire-effect` - Animated flames
- `rain-effect` - Rain animation
- `snow-globe` - Snow falling effect
- `fireworks` - Firework explosions
- `lightning-storm` - Storm animation
- `starfield` - Moving stars
- `binary-rain` - Binary code rain
- `plasma-effect` - Plasma waves
- `lava-lamp` - Lava lamp bubbles
- `wave-pool` - Water waves

### Nature & Life
- `fish-tank` - Swimming fish
- `coral-reef` - Underwater scene
- `ant-colony` - Marching ants
- `fireflies` - Glowing fireflies
- `growing-tree` - Tree growth animation
- `game-of-life` - Conway's Game of Life
- `dna-helix` - Rotating DNA strand

### Seasonal & Holiday
- `christmas-tree` - Animated Christmas tree
- `halloween-pumpkins` - Spooky pumpkins
- `easter-eggs` - Easter egg hunt

### Creative
- `mandala-generator` - Geometric patterns
- `particle-fountain` - Particle effects
- `heart-beat` - Pulsing heart
- `bouncing-balls` - Physics simulation
- `audio-visualizer` - Music reactive

### Control Pages
- `control` - Dashboard control interface
- `live` - Live streaming control

## Display Specs

- **Resolution**: 128x64 pixels (two 128x32 panels stacked)
- **Style**: Monospace fonts, no anti-aliasing
- **Colors**: High contrast for LED clarity
- **Optimization**: Designed for low frame rates (1-5 FPS)

## Configuration

Optional `.env` file for weather dashboard:
```
WEATHER_API_KEY=your_openweathermap_api_key
WEATHER_LOCATION=Your City,State
```

## Project Structure

```
lowfi-dashboards/
├── pages/           # All dashboard HTML files
├── public/
│   ├── css/        # LED-optimized styles
│   └── js/         # Dashboard scripts
├── lib/            # Backend libraries
├── server.ts       # Express server
└── config.ts       # Configuration
```

## Development Notes

- All dashboards are pure HTML/CSS/JS for simplicity
- Optimized for pixel-perfect display on LED matrices
- Low CPU usage important for Raspberry Pi deployment
- Designed to run 24/7 with minimal resources

---

*Personal project for streaming animations to my LED displays via [mqtt-pixel-streamer](https://github.com/charlesabarnes/mqtt-pixel-streamer)*
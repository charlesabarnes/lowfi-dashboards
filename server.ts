import express from 'express';
import path from 'path';
import { config } from './config';

const app = express();
const DASHBOARD_PORT = config.dashboard.port;

// Middleware for CORS (needed for OBS Browser Source)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  next();
});

// Serve static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Dashboard routes
app.get('/dashboard/weather-time', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'weather-time.html'));
});

app.get('/dashboard/sports-scores', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'sports-scores.html'));
});

app.get('/dashboard/matrix-effect', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'matrix-effect.html'));
});

app.get('/dashboard/stock-ticker', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'stock-ticker.html'));
});

app.get('/dashboard/fish-tank', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'fish-tank.html'));
});

app.get('/dashboard/space-invaders', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'space-invaders.html'));
});

app.get('/dashboard/pacman-maze', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'pacman-maze.html'));
});

app.get('/dashboard/bouncing-balls', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'bouncing-balls.html'));
});

app.get('/dashboard/fire-effect', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'fire-effect.html'));
});
 
app.get('/dashboard/starfield', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'starfield.html'));
});

// Animation & Visual Effects Dashboards
app.get('/dashboard/rain-effect', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'rain-effect.html'));
});

app.get('/dashboard/snow-globe', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'snow-globe.html'));
});

app.get('/dashboard/lava-lamp', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'lava-lamp.html'));
});

app.get('/dashboard/lightning-storm', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'lightning-storm.html'));
});

app.get('/dashboard/dna-helix', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'dna-helix.html'));
});

// Retro Gaming Dashboards
app.get('/dashboard/breakout-arkanoid', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'breakout-arkanoid.html'));
});

app.get('/dashboard/centipede', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'centipede.html'));
});

app.get('/dashboard/frogger', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'frogger.html'));
});

app.get('/dashboard/tetris', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'tetris.html'));
});

app.get('/dashboard/snake-game', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'snake-game.html'));
});

// Nature & Organic Dashboards
app.get('/dashboard/growing-tree', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'growing-tree.html'));
});

app.get('/dashboard/ant-colony', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'ant-colony.html'));
});

app.get('/dashboard/wave-pool', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'wave-pool.html'));
});

app.get('/dashboard/coral-reef', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'coral-reef.html'));
});

app.get('/dashboard/fireflies', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'fireflies.html'));
});

// Abstract & Geometric Dashboards
app.get('/dashboard/mandala-generator', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'mandala-generator.html'));
});

app.get('/dashboard/particle-fountain', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'particle-fountain.html'));
});

app.get('/dashboard/maze-runner', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'maze-runner.html'));
});

app.get('/dashboard/game-of-life', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'game-of-life.html'));
});

app.get('/dashboard/plasma-effect', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'plasma-effect.html'));
});

// Interactive/Reactive Dashboards
app.get('/dashboard/audio-visualizer', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'audio-visualizer.html'));
});

app.get('/dashboard/clock-tower', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'clock-tower.html'));
});

app.get('/dashboard/binary-rain', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'binary-rain.html'));
});

app.get('/dashboard/scrolling-text', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'scrolling-text.html'));
});

app.get('/dashboard/weather-radar', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'weather-radar.html'));
});

// Seasonal/Holiday Dashboards
app.get('/dashboard/halloween-pumpkins', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'halloween-pumpkins.html'));
});

app.get('/dashboard/christmas-tree', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'christmas-tree.html'));
});

app.get('/dashboard/fireworks', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'fireworks.html'));
});

app.get('/dashboard/easter-eggs', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'easter-eggs.html'));
});

app.get('/dashboard/heart-beat', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'heart-beat.html'));
});

// Weather API endpoint
app.get('/api/weather', async (req, res) => {
  try {
    // Get weather data from OpenWeatherMap or similar service
    const weatherData = await getWeatherData();
    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({
      error: 'Failed to fetch weather data',
      temperature: 0,
      condition: 'unknown',
      description: 'ERROR'
    });
  }
});

// Sports API endpoint
app.get('/api/sports/events', async (req, res) => {
  try {
    const sportsData = await getSportsData();
    res.json(sportsData);
  } catch (error) {
    console.error('Sports API error:', error);
    res.status(500).json({
      error: 'Failed to fetch sports data',
      nfl: [],
      nba: [],
      nhl: [],
      mlb: []
    });
  }
});

// Health check for dashboard server
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'dashboard-server',
    timestamp: new Date().toISOString()
  });
});

// Default route - list available dashboards
app.get('/', (req, res) => {
  res.json({
    service: 'LED Dashboard Server',
    version: '1.0.0',
    dashboards: [
      {
        name: 'Weather & Time',
        url: `/dashboard/weather-time`,
        description: 'Weather info (top) and current time (bottom)'
      },
      {
        name: 'Sports Scores',
        url: `/dashboard/sports-scores`,
        description: 'Live sports scores cycling through active games'
      },
      {
        name: 'Matrix Effect',
        url: `/dashboard/matrix-effect`,
        description: 'Animated matrix-style digital rain effect'
      },
      {
        name: 'Stock Ticker',
        url: `/dashboard/stock-ticker`,
        description: 'Scrolling stock prices with live updates and colors'
      },
      {
        name: 'Fish Tank',
        url: `/dashboard/fish-tank`,
        description: 'Animated aquarium with swimming fish, bubbles, and plants at 75fps'
      },
      {
        name: 'Space Invaders',
        url: `/dashboard/space-invaders`,
        description: 'Retro arcade game with animated aliens and starfield background'
      },
      {
        name: 'Pac-Man Maze',
        url: `/dashboard/pacman-maze`,
        description: 'Animated Pac-Man eating dots through a randomly generated maze'
      },
      {
        name: 'Bouncing Balls',
        url: `/dashboard/bouncing-balls`,
        description: 'Colorful physics simulation with bouncing balls and trails'
      },
      {
        name: 'Fire Effect',
        url: `/dashboard/fire-effect`,
        description: 'Realistic fire animation using solid colors for LED display'
      },
      {
        name: 'Starfield',
        url: `/dashboard/starfield`,
        description: '3D starfield effect with moving stars and hyperspace jumps'
      },
      // Animation & Visual Effects
      {
        name: 'Rain Effect',
        url: `/dashboard/rain-effect`,
        description: 'Animated falling raindrops with puddle ripples and lightning'
      },
      {
        name: 'Snow Globe',
        url: `/dashboard/snow-globe`,
        description: 'Swirling snow particles in a winter scene with trees and house'
      },
      {
        name: 'Lava Lamp',
        url: `/dashboard/lava-lamp`,
        description: 'Blob-like shapes rising and falling with heat effects'
      },
      {
        name: 'Lightning Storm',
        url: `/dashboard/lightning-storm`,
        description: 'Dark clouds with occasional lightning flashes and rain'
      },
      {
        name: 'DNA Helix',
        url: `/dashboard/dna-helix`,
        description: 'Rotating double helix with particle effects and base pairs'
      },
      // Retro Gaming
      {
        name: 'Breakout/Arkanoid',
        url: `/dashboard/breakout-arkanoid`,
        description: 'Ball bouncing and breaking blocks with particle effects'
      },
      {
        name: 'Centipede',
        url: `/dashboard/centipede`,
        description: 'Segmented creature moving through obstacles and mushrooms'
      },
      {
        name: 'Frogger',
        url: `/dashboard/frogger`,
        description: 'Cars and logs moving across lanes with animated frogs'
      },
      {
        name: 'Tetris',
        url: `/dashboard/tetris`,
        description: 'Falling blocks with line clearing and AI gameplay'
      },
      {
        name: 'Snake Game',
        url: `/dashboard/snake-game`,
        description: 'Classic snake growing as it eats food with AI control'
      },
      // Nature & Organic
      {
        name: 'Growing Tree',
        url: `/dashboard/growing-tree`,
        description: 'Branches slowly growing and leaves falling in seasons'
      },
      {
        name: 'Ant Colony',
        url: `/dashboard/ant-colony`,
        description: 'Ants following pheromone trails between food and anthill'
      },
      {
        name: 'Wave Pool',
        url: `/dashboard/wave-pool`,
        description: 'Water waves with floating objects and particle effects'
      },
      {
        name: 'Coral Reef',
        url: `/dashboard/coral-reef`,
        description: 'Swaying coral and swimming tropical fish with bubbles'
      },
      {
        name: 'Fireflies',
        url: `/dashboard/fireflies`,
        description: 'Glowing insects floating in darkness with nature sounds'
      },
      // Abstract & Geometric
      {
        name: 'Mandala Generator',
        url: `/dashboard/mandala-generator`,
        description: 'Rotating geometric patterns with evolving sacred geometry'
      },
      {
        name: 'Particle Fountain',
        url: `/dashboard/particle-fountain`,
        description: 'Particles spraying up and falling with physics simulation'
      },
      {
        name: 'Maze Runner',
        url: `/dashboard/maze-runner`,
        description: 'Automatically solving mazes with pathfinding algorithms'
      },
      {
        name: 'Game of Life',
        url: `/dashboard/game-of-life`,
        description: 'Cellular automaton with evolving patterns and generations'
      },
      {
        name: 'Plasma Effect',
        url: `/dashboard/plasma-effect`,
        description: 'Smooth color waves using solid color transitions'
      },
      // Interactive/Reactive
      {
        name: 'Audio Visualizer',
        url: `/dashboard/audio-visualizer`,
        description: 'Bars reacting to system audio with frequency analysis'
      },
      {
        name: 'Clock Tower',
        url: `/dashboard/clock-tower`,
        description: 'Animated analog clock with moving parts and architecture'
      },
      {
        name: 'Binary Rain',
        url: `/dashboard/binary-rain`,
        description: 'Falling 1s and 0s like Matrix code with scan lines'
      },
      {
        name: 'Scrolling Text',
        url: `/dashboard/scrolling-text`,
        description: 'Customizable message banner with color effects'
      },
      {
        name: 'Weather Radar',
        url: `/dashboard/weather-radar`,
        description: 'Animated weather patterns with radar sweep'
      },
      // Seasonal/Holiday
      {
        name: 'Halloween Pumpkins',
        url: `/dashboard/halloween-pumpkins`,
        description: 'Carved pumpkins with flickering candles and spooky atmosphere'
      },
      {
        name: 'Christmas Tree',
        url: `/dashboard/christmas-tree`,
        description: 'Animated lights and falling snow with winter scene'
      },
      {
        name: 'Fireworks',
        url: `/dashboard/fireworks`,
        description: 'Exploding colorful particles with realistic physics'
      },
      {
        name: 'Easter Eggs',
        url: `/dashboard/easter-eggs`,
        description: 'Bouncing decorated eggs with spring flowers and bunny'
      },
      {
        name: 'Heart Beat',
        url: `/dashboard/heart-beat`,
        description: 'Pulsing heart for Valentine\'s Day with ECG waveform'
      }
    ],
    display: {
      width: 128,
      height: 64,
      mode: 'dual',
      sections: {
        top: '128x32 - Weather',
        bottom: '128x32 - Time'
      }
    }
  });
});

// Mock weather function - replace with real API
async function getWeatherData() {
  // For now, return mock data
  // TODO: Integrate with OpenWeatherMap API using environment variables
  const mockWeather = {
    temperature: 72,
    condition: 'clear',
    description: 'CLEAR',
    humidity: 45,
    windSpeed: 5
  };

  // If weather API key is configured, fetch real data
  if (process.env.WEATHER_API_KEY) {
    try {
      return await fetchRealWeatherData();
    } catch (error) {
      console.warn('Failed to fetch real weather, using mock data:', error instanceof Error ? error.message : String(error));
    }
  }

  return mockWeather;
}

// Real weather API integration (placeholder)
async function fetchRealWeatherData() {
  const apiKey = process.env.WEATHER_API_KEY;
  const location = process.env.WEATHER_LOCATION || 'New York,NY';

  if (!apiKey) {
    throw new Error('Weather API key not configured');
  }

  // OpenWeatherMap API example
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=imperial`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Weather API responded with status: ${response.status}`);
  }

  const data = await response.json() as any;

  return {
    temperature: data.main.temp,
    condition: data.weather[0].main.toLowerCase(),
    description: data.weather[0].description.toUpperCase(),
    humidity: data.main.humidity,
    windSpeed: data.wind.speed
  };
}

// Sports data fetching function
async function getSportsData() {
  const apiKey = process.env.SPORTS_API_KEY;

  if (!apiKey) {
    console.warn('Sports API key not configured, using mock data');
    return getMockSportsData();
  }

  try {
    const url = 'https://www.thesportsdb.com/api/v2/json/livescore/all';

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': apiKey
      }
    });

    if (response.ok) {
      const data = await response.json() as any;
      return {
        livescores: data.livescore || []
      };
    } else {
      console.warn(`Failed to fetch live scores: ${response.status}`);
      return getMockSportsData();
    }
  } catch (error) {
    console.error('Error fetching live scores:', error instanceof Error ? error.message : String(error));
    return getMockSportsData();
  }
}

// Mock sports data for testing
function getMockSportsData() {
  return {
    livescores: [
      {
        idLiveScore: '279129130',
        idEvent: '2261210',
        strSport: 'American Football',
        idLeague: '4391',
        strLeague: 'NFL',
        strHomeTeam: 'Dallas Cowboys',
        strAwayTeam: 'New York Giants',
        intHomeScore: '21',
        intAwayScore: '14',
        strProgress: 'Q3 12:45',
        strEventTime: '20:30',
        dateEvent: new Date().toISOString().split('T')[0],
        updated: new Date().toISOString().replace('T', ' ').replace('Z', '')
      }
    ]
  };
}

// Start dashboard server
const server = app.listen(DASHBOARD_PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                     LED DASHBOARD SERVER                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  🖥️ Dashboard URL:                                               ║
║     http://localhost:${DASHBOARD_PORT}/dashboard/weather-time                ║
║                                                                   ║
║  📐 Display Configuration:                                       ║
║     Canvas Size: 128x64 pixels                                   ║
║     Top Section (32px): Weather                                   ║
║     Bottom Section (32px): Time                                   ║
║                                                                   ║
║  🎥 OBS Browser Source Settings:                                 ║
║     URL: http://localhost:${DASHBOARD_PORT}/dashboard/weather-time           ║
║     Width: 128                                                    ║
║     Height: 64                                                    ║
║     FPS: 1-5 (recommended)                                        ║
║                                                                   ║
║  🌤️ Weather Configuration (optional):                            ║
║     WEATHER_API_KEY=your_openweathermap_key                       ║
║     WEATHER_LOCATION=City,State                                   ║
║                                                                   ║
╚══════════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Dashboard server shutting down...');
  server.close(() => {
    console.log('👋 Dashboard server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n🛑 Dashboard server shutting down...');
  server.close(() => {
    console.log('👋 Dashboard server closed');
    process.exit(0);
  });
});

export default app;
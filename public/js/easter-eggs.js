class EasterEggs {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // 75 fps targeting
    this.targetFPS = 75;
    this.frameTime = 1000 / this.targetFPS;
    this.lastTime = 0;

    // Animation time
    this.time = 0;

    // Bouncing eggs
    this.eggs = [];
    this.initializeEggs();

    // Grass and flowers
    this.flowers = [];
    this.initializeFlowers();

    // Easter colors
    this.colors = {
      grass: '#228B22',      // Forest Green
      grassLight: '#32CD32', // Lime Green
      sky: '#87CEEB',        // Sky Blue
      sun: '#FFD700',        // Gold
      bunnyWhite: '#FFFFFF', // White
      bunnyPink: '#FFB6C1',  // Light Pink
      carrot: '#FF8C00',     // Dark Orange
      carrotTop: '#228B22'   // Forest Green
    };

    // Egg colors and patterns
    this.eggColors = [
      { base: '#FF69B4', accent: '#FF1493' }, // Hot Pink
      { base: '#00CED1', accent: '#008B8B' }, // Dark Turquoise
      { base: '#FFD700', accent: '#FFA500' }, // Gold
      { base: '#9370DB', accent: '#6A0DAD' }, // Medium Purple
      { base: '#32CD32', accent: '#228B22' }, // Lime Green
      { base: '#FF6347', accent: '#DC143C' }  // Tomato
    ];

    // Bunny
    this.bunny = {
      x: 15,
      y: 45,
      hopPhase: 0
    };
  }

  init() {
    this.canvas = document.getElementById('easter-eggs-canvas');
    if (!this.canvas) {
      console.error('Easter Eggs canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Easter Eggs initialized with 75fps targeting');
  }

  initializeEggs() {
    // Create bouncing decorated eggs
    this.eggs = [
      {
        x: 40, y: 20, vx: 0.8, vy: 0.5,
        width: 8, height: 12,
        colorIndex: 0, pattern: 'stripes',
        bouncePhase: 0, rotation: 0
      },
      {
        x: 70, y: 30, vx: -0.6, vy: 0.7,
        width: 10, height: 14,
        colorIndex: 1, pattern: 'dots',
        bouncePhase: Math.PI, rotation: 0
      },
      {
        x: 90, y: 15, vx: -1.0, vy: 0.4,
        width: 9, height: 13,
        colorIndex: 2, pattern: 'zigzag',
        bouncePhase: Math.PI * 0.5, rotation: 0
      },
      {
        x: 55, y: 25, vx: 0.7, vy: -0.6,
        width: 7, height: 11,
        colorIndex: 3, pattern: 'flowers',
        bouncePhase: Math.PI * 1.5, rotation: 0
      },
      {
        x: 25, y: 35, vx: 1.1, vy: -0.3,
        width: 11, height: 15,
        colorIndex: 4, pattern: 'checkers',
        bouncePhase: Math.PI * 0.25, rotation: 0
      }
    ];
  }

  initializeFlowers() {
    // Create decorative flowers
    this.flowers = [
      { x: 20, y: 55, color: '#FF69B4', type: 'tulip' },
      { x: 35, y: 57, color: '#FFD700', type: 'daisy' },
      { x: 80, y: 56, color: '#9370DB', type: 'tulip' },
      { x: 100, y: 58, color: '#FF6347', type: 'daisy' },
      { x: 110, y: 55, color: '#32CD32', type: 'tulip' }
    ];
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

    // Control frame rate to 75fps
    if (currentTime - this.lastTime < this.frameTime) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastTime = currentTime;
    this.time += 0.016;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    // Update bouncing eggs
    this.eggs.forEach(egg => {
      egg.x += egg.vx;
      egg.y += egg.vy;
      egg.bouncePhase += 0.1;
      egg.rotation += 0.02;

      // Bounce off walls
      if (egg.x <= egg.width / 2 || egg.x >= this.width - egg.width / 2) {
        egg.vx = -egg.vx;
        egg.x = Math.max(egg.width / 2, Math.min(this.width - egg.width / 2, egg.x));
      }

      // Bounce off top/bottom (with grass area)
      if (egg.y <= egg.height / 2 || egg.y >= 50 - egg.height / 2) {
        egg.vy = -egg.vy;
        egg.y = Math.max(egg.height / 2, Math.min(50 - egg.height / 2, egg.y));
      }

      // Add slight wobble
      egg.y += Math.sin(egg.bouncePhase) * 0.3;
    });

    // Update bunny hopping
    this.bunny.hopPhase += 0.15;
    this.bunny.y = 45 + Math.abs(Math.sin(this.bunny.hopPhase)) * 3;
  }

  render() {
    // Clear canvas with sky
    this.ctx.fillStyle = this.colors.sky;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw sun
    this.drawSun();

    // Draw clouds
    this.drawClouds();

    // Draw grass
    this.drawGrass();

    // Draw flowers
    this.flowers.forEach(flower => {
      this.drawFlower(flower);
    });

    // Draw bunny
    this.drawBunny();

    // Draw bouncing eggs
    this.eggs.forEach(egg => {
      this.drawEgg(egg);
    });
  }

  drawSun() {
    const sunX = 110;
    const sunY = 15;
    const sunSize = 8;

    this.ctx.fillStyle = this.colors.sun;

    // Draw sun as circle approximation
    for (let y = -sunSize; y <= sunSize; y++) {
      for (let x = -sunSize; x <= sunSize; x++) {
        if (x * x + y * y <= sunSize * sunSize) {
          this.ctx.fillRect(sunX + x, sunY + y, 1, 1);
        }
      }
    }

    // Sun rays
    this.ctx.fillStyle = '#FFFF00';
    const rayLength = 4;
    const rayPositions = [
      { x: 0, y: -sunSize - rayLength },
      { x: sunSize + rayLength, y: 0 },
      { x: 0, y: sunSize + rayLength },
      { x: -sunSize - rayLength, y: 0 }
    ];

    rayPositions.forEach(ray => {
      this.ctx.fillRect(sunX + ray.x, sunY + ray.y, 1, 2);
      this.ctx.fillRect(sunX + ray.x, sunY + ray.y, 2, 1);
    });
  }

  drawClouds() {
    // Simple pixelated clouds
    this.ctx.fillStyle = '#FFFFFF';

    // Cloud 1
    const cloud1 = [
      { x: 30, y: 12 }, { x: 32, y: 10 }, { x: 35, y: 12 },
      { x: 38, y: 11 }, { x: 40, y: 13 }
    ];
    cloud1.forEach(point => {
      this.ctx.fillRect(point.x, point.y, 3, 2);
    });

    // Cloud 2
    const cloud2 = [
      { x: 60, y: 8 }, { x: 63, y: 6 }, { x: 66, y: 8 },
      { x: 69, y: 7 }
    ];
    cloud2.forEach(point => {
      this.ctx.fillRect(point.x, point.y, 2, 2);
    });
  }

  drawGrass() {
    // Draw grass background
    this.ctx.fillStyle = this.colors.grass;
    this.ctx.fillRect(0, 50, this.width, this.height - 50);

    // Add grass texture
    this.ctx.fillStyle = this.colors.grassLight;
    for (let x = 0; x < this.width; x += 3) {
      for (let y = 50; y < this.height; y += 2) {
        if (Math.random() > 0.6) {
          this.ctx.fillRect(x, y, 1, 2);
        }
      }
    }
  }

  drawFlower(flower) {
    const { x, y, color, type } = flower;

    // Flower stem
    this.ctx.fillStyle = this.colors.grass;
    this.ctx.fillRect(x, y - 4, 1, 4);

    // Flower petals
    this.ctx.fillStyle = color;

    if (type === 'tulip') {
      // Tulip shape
      this.ctx.fillRect(x - 1, y - 6, 3, 2);
      this.ctx.fillRect(x, y - 8, 1, 2);
    } else if (type === 'daisy') {
      // Daisy shape
      this.ctx.fillRect(x, y - 7, 1, 1); // center
      this.ctx.fillRect(x - 1, y - 7, 1, 1); // left
      this.ctx.fillRect(x + 1, y - 7, 1, 1); // right
      this.ctx.fillRect(x, y - 8, 1, 1); // top
      this.ctx.fillRect(x, y - 6, 1, 1); // bottom

      // Daisy center
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.fillRect(x, y - 7, 1, 1);
    }
  }

  drawBunny() {
    const { x, y } = this.bunny;

    // Bunny body (white)
    this.ctx.fillStyle = this.colors.bunnyWhite;
    this.ctx.fillRect(x, y, 6, 8); // body
    this.ctx.fillRect(x + 1, y - 4, 4, 4); // head

    // Bunny ears
    this.ctx.fillRect(x + 1, y - 7, 1, 3);
    this.ctx.fillRect(x + 4, y - 7, 1, 3);

    // Pink inner ears
    this.ctx.fillStyle = this.colors.bunnyPink;
    this.ctx.fillRect(x + 1, y - 6, 1, 1);
    this.ctx.fillRect(x + 4, y - 6, 1, 1);

    // Bunny eyes (black dots)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x + 2, y - 3, 1, 1);
    this.ctx.fillRect(x + 4, y - 3, 1, 1);

    // Pink nose
    this.ctx.fillStyle = this.colors.bunnyPink;
    this.ctx.fillRect(x + 3, y - 2, 1, 1);

    // Bunny tail
    this.ctx.fillStyle = this.colors.bunnyWhite;
    this.ctx.fillRect(x + 6, y + 2, 2, 2);

    // Carrot
    this.ctx.fillStyle = this.colors.carrot;
    this.ctx.fillRect(x + 7, y - 1, 3, 1);
    this.ctx.fillStyle = this.colors.carrotTop;
    this.ctx.fillRect(x + 10, y - 2, 1, 1);
  }

  drawEgg(egg) {
    const { x, y, width, height, colorIndex, pattern } = egg;
    const colors = this.eggColors[colorIndex];

    // Draw egg shape (oval)
    this.ctx.fillStyle = colors.base;

    for (let py = 0; py < height; py++) {
      // Create oval shape
      const ratio = 1 - Math.pow((py - height/2) / (height/2), 2);
      let lineWidth = Math.floor(width * Math.sqrt(Math.abs(ratio)));

      // Make top slightly narrower (egg shape)
      if (py < height / 3) {
        lineWidth = Math.floor(lineWidth * (0.7 + py / height));
      }

      const lineX = x - lineWidth / 2;
      this.ctx.fillRect(lineX, y - height/2 + py, lineWidth, 1);
    }

    // Draw pattern
    this.ctx.fillStyle = colors.accent;
    this.drawEggPattern(egg, pattern);

    // Add shine
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(x - width/4, y - height/3, 2, 3);
  }

  drawEggPattern(egg, pattern) {
    const { x, y, width, height } = egg;

    switch (pattern) {
      case 'stripes':
        for (let i = 0; i < 3; i++) {
          const stripeY = y - height/2 + (i + 1) * (height / 4);
          this.ctx.fillRect(x - width/2 + 1, stripeY, width - 2, 1);
        }
        break;

      case 'dots':
        const dots = [
          { dx: -2, dy: -3 }, { dx: 2, dy: -3 },
          { dx: 0, dy: 0 }, { dx: -2, dy: 3 }, { dx: 2, dy: 3 }
        ];
        dots.forEach(dot => {
          this.ctx.fillRect(x + dot.dx, y + dot.dy, 1, 1);
        });
        break;

      case 'zigzag':
        for (let py = -height/2 + 2; py < height/2 - 2; py += 3) {
          const zigzagPoints = [
            { dx: -2, dy: py }, { dx: 0, dy: py + 1 },
            { dx: 2, dy: py + 2 }
          ];
          zigzagPoints.forEach(point => {
            this.ctx.fillRect(x + point.dx, y + point.dy, 1, 1);
          });
        }
        break;

      case 'flowers':
        // Small flower pattern
        this.ctx.fillRect(x, y - 2, 1, 1); // center
        this.ctx.fillRect(x - 1, y - 2, 1, 1);
        this.ctx.fillRect(x + 1, y - 2, 1, 1);
        this.ctx.fillRect(x, y - 3, 1, 1);
        this.ctx.fillRect(x, y - 1, 1, 1);
        break;

      case 'checkers':
        for (let py = -height/2 + 1; py < height/2 - 1; py += 2) {
          for (let px = -width/2 + 1; px < width/2 - 1; px += 2) {
            if ((px + py) % 4 === 0) {
              this.ctx.fillRect(x + px, y + py, 1, 1);
            }
          }
        }
        break;
    }
  }

  pause() {
    this.isPaused = true;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.animate();
    }
  }

  destroy() {
    this.pause();
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}

// Initialize global easter eggs
window.easterEggs = new EasterEggs();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.easterEggs) {
    window.easterEggs.destroy();
  }
});
class BinaryRain {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Binary rain configuration
    this.fontSize = 8;
    this.columns = Math.floor(this.width / this.fontSize);
    this.drops = [];

    // Characters to display (binary digits and some Matrix-style characters)
    this.characters = ['0', '1', '0', '1', '0', '1', '0', '1', '0', '1'];

    // Matrix colors - LED optimized
    this.colors = [
      '#00FF00', // Bright green - leading character
      '#00DD00', // Medium bright green
      '#00BB00', // Medium green
      '#009900', // Dimmer green
      '#007700', // Dim green
      '#005500', // Very dim green
      '#003300', // Almost black green
      '#001100'  // Very dark
    ];

    // Animation parameters
    this.speed = 1;
    this.trailLength = 8;

    this.lastTime = 0;
    this.frameRate = 16; // ~60fps (1000ms / 60fps ≈ 16ms)
  }

  init() {
    this.canvas = document.getElementById('binary-canvas');
    if (!this.canvas) {
      console.error('Binary rain canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Set up font
    this.ctx.font = `${this.fontSize}px monospace`;
    this.ctx.textAlign = 'center';

    // Initialize drops
    this.initializeDrops();

    // Start animation
    this.animate();
    console.log('Binary Rain initialized');
  }

  initializeDrops() {
    for (let x = 0; x < this.columns; x++) {
      this.drops[x] = {
        y: Math.random() * this.height, // Start at random positions
        speed: 0.5 + Math.random() * 1.5, // Random speed
        trail: [],
        nextSpawn: Math.random() * 60 // Random delay for next drop
      };
    }
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

    // Control frame rate
    if (currentTime - this.lastTime < this.frameRate) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastTime = currentTime;
    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    for (let i = 0; i < this.columns; i++) {
      const drop = this.drops[i];

      // Move drop down
      drop.y += drop.speed;

      // Add current position to trail
      if (drop.y > 0) {
        drop.trail.unshift({
          y: drop.y,
          char: this.getRandomCharacter()
        });

        // Limit trail length
        if (drop.trail.length > this.trailLength) {
          drop.trail.pop();
        }
      }

      // Reset drop when it goes off screen
      if (drop.y > this.height + this.fontSize * this.trailLength) {
        drop.y = -this.fontSize * Math.random() * 5; // Start above screen
        drop.speed = 0.5 + Math.random() * 1.5;
        drop.trail = [];
      }

      // Occasionally change characters in the trail for dynamic effect
      if (Math.random() < 0.1) {
        drop.trail.forEach(segment => {
          if (Math.random() < 0.3) {
            segment.char = this.getRandomCharacter();
          }
        });
      }
    }
  }

  getRandomCharacter() {
    return this.characters[Math.floor(Math.random() * this.characters.length)];
  }

  render() {
    // Clear canvas with slight fade for trail effect
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw drops
    for (let i = 0; i < this.columns; i++) {
      const drop = this.drops[i];
      const x = i * this.fontSize + this.fontSize / 2;

      // Draw trail
      drop.trail.forEach((segment, index) => {
        // Calculate color based on position in trail
        const colorIndex = Math.min(index, this.colors.length - 1);
        this.ctx.fillStyle = this.colors[colorIndex];

        // Draw character
        this.ctx.fillText(segment.char, x, segment.y);
      });
    }

    // Add some glitch effects occasionally
    this.addGlitchEffects();

    // Add some horizontal scan lines for matrix effect
    this.addScanLines();
  }

  addGlitchEffects() {
    // Occasionally add random bright pixels for glitch effect
    if (Math.random() < 0.05) {
      const numGlitches = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < numGlitches; i++) {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);

        this.ctx.fillStyle = this.colors[0]; // Brightest green
        this.ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  addScanLines() {
    // Add subtle horizontal scan lines that move
    const scanLineY = (Date.now() * 0.1) % this.height;

    // Primary scan line
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
    this.ctx.fillRect(0, Math.floor(scanLineY), this.width, 1);

    // Secondary scan line
    const scanLineY2 = (Date.now() * 0.05 + this.height / 2) % this.height;
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
    this.ctx.fillRect(0, Math.floor(scanLineY2), this.width, 1);
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

// Initialize global binary rain
window.binaryRain = new BinaryRain();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.binaryRain) {
    window.binaryRain.destroy();
  }
});
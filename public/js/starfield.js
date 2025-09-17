class Starfield {
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

    // Stars array
    this.stars = [];
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    // Speed control
    this.baseSpeed = 2;
    this.speedVariation = 0;

    // Initialize stars
    this.initializeStars();
  }

  init() {
    this.canvas = document.getElementById('starfield-canvas');
    if (!this.canvas) {
      console.error('Starfield canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Starfield initialized with 75fps targeting');
  }

  initializeStars() {
    this.stars = [];
    const numStars = 100;

    for (let i = 0; i < numStars; i++) {
      this.stars.push(this.createStar());
    }
  }

  createStar() {
    // Create star at random position around center
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * Math.max(this.width, this.height);

    return {
      x: this.centerX + Math.cos(angle) * distance,
      y: this.centerY + Math.sin(angle) * distance,
      z: Math.random() * 100 + 1, // Distance from viewer
      prevX: 0,
      prevY: 0,
      size: Math.random() * 2 + 0.5,
      brightness: Math.random() * 0.8 + 0.2,
      color: this.getStarColor()
    };
  }

  getStarColor() {
    const colors = [
      '#FFFFFF', '#FFFFCC', '#FFCCCC', '#CCCCFF', '#CCFFCC',
      '#FFCCFF', '#CCFFFF', '#FFFFAA', '#FFAAAA', '#AAFFAA'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
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
    // Dynamic speed variation
    this.speedVariation = Math.sin(this.time * 0.5) * 0.5;
    const currentSpeed = this.baseSpeed + this.speedVariation;

    this.stars.forEach(star => {
      // Store previous position for trail effect
      star.prevX = star.x;
      star.prevY = star.y;

      // Move star towards viewer
      star.z -= currentSpeed;

      // If star is too close, reset it to the back
      if (star.z <= 0) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * Math.max(this.width, this.height);

        star.x = this.centerX + Math.cos(angle) * distance;
        star.y = this.centerY + Math.sin(angle) * distance;
        star.z = 100;
        star.size = Math.random() * 2 + 0.5;
        star.brightness = Math.random() * 0.8 + 0.2;
        star.color = this.getStarColor();
      }

      // Calculate screen position using 3D perspective
      const perspective = 100;
      const screenX = this.centerX + ((star.x - this.centerX) * perspective) / star.z;
      const screenY = this.centerY + ((star.y - this.centerY) * perspective) / star.z;

      star.screenX = screenX;
      star.screenY = screenY;

      // Calculate star size based on distance
      star.screenSize = (star.size * perspective) / star.z;

      // Calculate brightness based on speed and distance
      const speedBrightness = Math.min(1, currentSpeed / 5);
      star.screenBrightness = star.brightness * speedBrightness * (1 - star.z / 100);
    });

    // Add occasional "hyperspace jump" effect
    if (Math.random() < 0.003) {
      this.hyperspaceJump();
    }
  }

  hyperspaceJump() {
    // Temporarily increase speed for dramatic effect
    this.stars.forEach(star => {
      star.z -= 20;
    });
  }

  render() {
    // Clear canvas with solid black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Sort stars by z-distance for proper rendering order
    const visibleStars = this.stars.filter(star =>
      star.screenX >= -5 && star.screenX <= this.width + 5 &&
      star.screenY >= -5 && star.screenY <= this.height + 5 &&
      star.screenSize > 0.1
    );

    visibleStars.sort((a, b) => b.z - a.z);

    // Draw star trails first
    visibleStars.forEach(star => {
      this.drawStarTrail(star);
    });

    // Draw stars
    visibleStars.forEach(star => {
      this.drawStar(star);
    });

    // Draw center crosshair occasionally
    if (Math.sin(this.time * 2) > 0.8) {
      this.drawCenterCrosshair();
    }
  }

  drawStarTrail(star) {
    if (!star.prevX || !star.prevY || star.z > 50) return;

    const prevScreenX = this.centerX + ((star.prevX - this.centerX) * 100) / (star.z + 2);
    const prevScreenY = this.centerY + ((star.prevY - this.centerY) * 100) / (star.z + 2);

    // Calculate trail length based on speed
    const trailLength = Math.min(10, (this.baseSpeed + this.speedVariation) * 2);

    // Draw trail as a line
    this.ctx.strokeStyle = `rgba(255, 255, 255, ${star.screenBrightness * 0.3})`;
    this.ctx.lineWidth = Math.max(0.5, star.screenSize * 0.5);
    this.ctx.lineCap = 'round';

    this.ctx.beginPath();
    this.ctx.moveTo(prevScreenX, prevScreenY);
    this.ctx.lineTo(star.screenX, star.screenY);
    this.ctx.stroke();
  }

  drawStar(star) {
    if (star.screenSize < 0.5) {
      // Small stars - single pixel
      const alpha = Math.min(1, star.screenBrightness);
      this.ctx.fillStyle = this.addAlphaToColor(star.color, alpha);
      this.ctx.fillRect(
        Math.floor(star.screenX),
        Math.floor(star.screenY),
        1, 1
      );
    } else if (star.screenSize < 2) {
      // Medium stars - 2x2 pixels
      const alpha = Math.min(1, star.screenBrightness);
      this.ctx.fillStyle = this.addAlphaToColor(star.color, alpha);
      this.ctx.fillRect(
        Math.floor(star.screenX - 1),
        Math.floor(star.screenY - 1),
        2, 2
      );
    } else {
      // Large stars - draw as small plus sign
      const alpha = Math.min(1, star.screenBrightness);
      const size = Math.min(4, Math.floor(star.screenSize));

      this.ctx.fillStyle = this.addAlphaToColor(star.color, alpha);

      // Center
      this.ctx.fillRect(
        Math.floor(star.screenX),
        Math.floor(star.screenY),
        1, 1
      );

      // Arms of the plus
      if (size >= 2) {
        this.ctx.fillRect(Math.floor(star.screenX - 1), Math.floor(star.screenY), 1, 1);
        this.ctx.fillRect(Math.floor(star.screenX + 1), Math.floor(star.screenY), 1, 1);
        this.ctx.fillRect(Math.floor(star.screenX), Math.floor(star.screenY - 1), 1, 1);
        this.ctx.fillRect(Math.floor(star.screenX), Math.floor(star.screenY + 1), 1, 1);
      }
    }
  }

  drawCenterCrosshair() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;

    // Draw small crosshair at center
    const size = 3;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX - size, this.centerY);
    this.ctx.lineTo(this.centerX + size, this.centerY);
    this.ctx.moveTo(this.centerX, this.centerY - size);
    this.ctx.lineTo(this.centerX, this.centerY + size);
    this.ctx.stroke();
  }

  addAlphaToColor(color, alpha) {
    // Convert hex to rgba
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color; // Return as-is if not hex
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

// Initialize global starfield
window.starfield = new Starfield();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.starfield) {
    window.starfield.destroy();
  }
});
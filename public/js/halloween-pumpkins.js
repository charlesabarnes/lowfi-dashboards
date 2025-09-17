class HalloweenPumpkins {
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

    // Pumpkin objects
    this.pumpkins = [];
    this.initializePumpkins();

    // Candle flame data
    this.flames = [];
    this.initializeFlames();

    // Halloween colors
    this.colors = {
      pumpkin: '#FF4500',      // Orange Red
      pumpkinDark: '#CC3300',  // Dark Orange
      stem: '#228B22',         // Forest Green
      candleFlame: '#FFD700',  // Gold
      candleFlameHot: '#FF8C00', // Dark Orange
      eyes: '#000000',         // Black
      ground: '#1A1A1A'        // Dark Gray
    };
  }

  init() {
    this.canvas = document.getElementById('halloween-pumpkins-canvas');
    if (!this.canvas) {
      console.error('Halloween Pumpkins canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Halloween Pumpkins initialized with 75fps targeting');
  }

  initializePumpkins() {
    // Create 3 carved pumpkins
    this.pumpkins = [
      {
        x: 25,
        y: 45,
        width: 20,
        height: 15,
        stemHeight: 4,
        eyeType: 'triangle',
        mouthType: 'smile'
      },
      {
        x: 54,
        y: 40,
        width: 24,
        height: 18,
        stemHeight: 5,
        eyeType: 'square',
        mouthType: 'zigzag'
      },
      {
        x: 85,
        y: 43,
        width: 22,
        height: 16,
        stemHeight: 4,
        eyeType: 'circle',
        mouthType: 'frown'
      }
    ];
  }

  initializeFlames() {
    // Initialize candle flames for each pumpkin
    this.flames = this.pumpkins.map((pumpkin, index) => ({
      x: pumpkin.x + pumpkin.width / 2,
      y: pumpkin.y + 2,
      intensity: 0.8 + Math.random() * 0.2,
      flicker: Math.random() * Math.PI * 2,
      baseHeight: 8,
      phase: index * 2.1 // Different phase for each flame
    }));
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
    // Update flame flickering
    this.flames.forEach((flame, index) => {
      flame.flicker += 0.3 + Math.sin(this.time * 4 + flame.phase) * 0.1;
      flame.intensity = 0.6 + Math.sin(flame.flicker) * 0.3 + Math.sin(this.time * 6 + flame.phase) * 0.1;
      flame.intensity = Math.max(0.3, Math.min(1.0, flame.intensity));
    });
  }

  render() {
    // Clear canvas with night sky
    this.ctx.fillStyle = '#000814';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw ground
    this.ctx.fillStyle = this.colors.ground;
    this.ctx.fillRect(0, this.height - 8, this.width, 8);

    // Draw some stars
    this.drawStars();

    // Draw each pumpkin
    this.pumpkins.forEach((pumpkin, index) => {
      this.drawPumpkin(pumpkin, index);
    });

    // Draw flickering candle flames inside pumpkins
    this.flames.forEach((flame, index) => {
      this.drawCandleFlame(flame, index);
    });

    // Add some spooky fog effect at the bottom
    this.drawFog();
  }

  drawStars() {
    const stars = [
      { x: 10, y: 8 }, { x: 30, y: 12 }, { x: 50, y: 6 },
      { x: 75, y: 10 }, { x: 95, y: 15 }, { x: 115, y: 8 },
      { x: 20, y: 20 }, { x: 100, y: 25 }
    ];

    stars.forEach((star, index) => {
      const twinkle = Math.sin(this.time * 3 + index) * 0.5 + 0.5;
      if (twinkle > 0.3) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(star.x, star.y, 1, 1);

        // Some stars are bigger
        if (index % 3 === 0) {
          this.ctx.fillRect(star.x - 1, star.y, 1, 1);
          this.ctx.fillRect(star.x + 1, star.y, 1, 1);
          this.ctx.fillRect(star.x, star.y - 1, 1, 1);
          this.ctx.fillRect(star.x, star.y + 1, 1, 1);
        }
      }
    });
  }

  drawPumpkin(pumpkin, index) {
    const { x, y, width, height, stemHeight, eyeType, mouthType } = pumpkin;

    // Draw pumpkin stem
    this.ctx.fillStyle = this.colors.stem;
    const stemX = x + width / 2 - 2;
    this.ctx.fillRect(stemX, y - stemHeight, 4, stemHeight);

    // Draw pumpkin body (oval-ish shape)
    this.ctx.fillStyle = this.colors.pumpkin;

    // Main body
    for (let py = 0; py < height; py++) {
      const ratio = 1 - Math.pow((py - height/2) / (height/2), 2);
      const lineWidth = Math.floor(width * Math.sqrt(ratio));
      const lineX = x + (width - lineWidth) / 2;
      this.ctx.fillRect(lineX, y + py, lineWidth, 1);
    }

    // Add pumpkin ridges/sections
    this.ctx.fillStyle = this.colors.pumpkinDark;
    for (let section = 1; section < 4; section++) {
      const ridgeX = x + (width / 4) * section;
      for (let py = 2; py < height - 2; py++) {
        this.ctx.fillRect(ridgeX, y + py, 1, 1);
      }
    }

    // Draw carved face
    this.drawCarvedFace(x, y, width, height, eyeType, mouthType);
  }

  drawCarvedFace(x, y, width, height, eyeType, mouthType) {
    const eyeY = y + height * 0.3;
    const leftEyeX = x + width * 0.25;
    const rightEyeX = x + width * 0.75;
    const mouthY = y + height * 0.65;
    const mouthX = x + width / 2;

    // Draw eyes (carved out - black)
    this.ctx.fillStyle = this.colors.eyes;

    if (eyeType === 'triangle') {
      // Triangle eyes
      this.drawTriangle(leftEyeX, eyeY, 4, 4);
      this.drawTriangle(rightEyeX, eyeY, 4, 4);
    } else if (eyeType === 'square') {
      // Square eyes
      this.ctx.fillRect(leftEyeX - 2, eyeY - 2, 4, 4);
      this.ctx.fillRect(rightEyeX - 2, eyeY - 2, 4, 4);
    } else if (eyeType === 'circle') {
      // Circle eyes (diamond shape for LED)
      this.drawDiamond(leftEyeX, eyeY, 3);
      this.drawDiamond(rightEyeX, eyeY, 3);
    }

    // Draw mouth (carved out - black)
    if (mouthType === 'smile') {
      // Smiling mouth
      const mouthPoints = [
        { x: mouthX - 6, y: mouthY },
        { x: mouthX - 4, y: mouthY + 2 },
        { x: mouthX - 2, y: mouthY + 3 },
        { x: mouthX, y: mouthY + 3 },
        { x: mouthX + 2, y: mouthY + 3 },
        { x: mouthX + 4, y: mouthY + 2 },
        { x: mouthX + 6, y: mouthY }
      ];
      mouthPoints.forEach(point => {
        this.ctx.fillRect(point.x, point.y, 1, 1);
      });
    } else if (mouthType === 'zigzag') {
      // Zigzag mouth
      for (let i = -6; i <= 6; i += 2) {
        const zigY = mouthY + (i % 4 === 0 ? 0 : 2);
        this.ctx.fillRect(mouthX + i, zigY, 1, 1);
      }
    } else if (mouthType === 'frown') {
      // Frowning mouth
      const mouthPoints = [
        { x: mouthX - 6, y: mouthY + 2 },
        { x: mouthX - 4, y: mouthY + 1 },
        { x: mouthX - 2, y: mouthY },
        { x: mouthX, y: mouthY },
        { x: mouthX + 2, y: mouthY },
        { x: mouthX + 4, y: mouthY + 1 },
        { x: mouthX + 6, y: mouthY + 2 }
      ];
      mouthPoints.forEach(point => {
        this.ctx.fillRect(point.x, point.y, 1, 1);
      });
    }
  }

  drawTriangle(centerX, centerY, width, height) {
    // Draw triangle as pixels
    for (let y = 0; y < height; y++) {
      const lineWidth = Math.floor((width * (height - y)) / height);
      for (let x = 0; x < lineWidth; x++) {
        this.ctx.fillRect(centerX - lineWidth / 2 + x, centerY + y, 1, 1);
      }
    }
  }

  drawDiamond(centerX, centerY, size) {
    // Draw diamond shape
    for (let y = -size; y <= size; y++) {
      const lineWidth = size - Math.abs(y);
      for (let x = -lineWidth; x <= lineWidth; x++) {
        this.ctx.fillRect(centerX + x, centerY + y, 1, 1);
      }
    }
  }

  drawCandleFlame(flame, index) {
    const { x, y, intensity, baseHeight } = flame;
    const flameHeight = baseHeight * intensity;

    // Hot center of flame
    this.ctx.fillStyle = this.colors.candleFlameHot;
    const coreHeight = Math.floor(flameHeight * 0.6);
    const coreWidth = 2;

    for (let fy = 0; fy < coreHeight; fy++) {
      const width = Math.ceil(coreWidth * (1 - fy / coreHeight));
      this.ctx.fillRect(x - width / 2, y - fy, width, 1);
    }

    // Outer flame
    this.ctx.fillStyle = this.colors.candleFlame;
    const outerHeight = Math.floor(flameHeight);
    const outerWidth = 3;

    for (let fy = 0; fy < outerHeight; fy++) {
      const width = Math.ceil(outerWidth * (1 - fy / outerHeight));
      if (fy >= coreHeight || Math.random() > 0.3) { // Make outer flame flickery
        this.ctx.fillRect(x - width / 2, y - fy, 1, 1);
        if (width > 1) {
          this.ctx.fillRect(x + width / 2, y - fy, 1, 1);
        }
      }
    }

    // Flame tip (brightest)
    if (Math.random() > 0.2) {
      this.ctx.fillStyle = '#FFFF00'; // Bright yellow tip
      this.ctx.fillRect(x, y - outerHeight, 1, 1);
    }
  }

  drawFog() {
    // Simple fog effect at bottom
    const fogHeight = 6;
    for (let y = this.height - fogHeight; y < this.height - 8; y++) {
      for (let x = 0; x < this.width; x++) {
        const fogDensity = Math.sin(this.time * 2 + x * 0.1 + y * 0.2) * 0.5 + 0.5;
        if (fogDensity > 0.7 && Math.random() > 0.6) {
          this.ctx.fillStyle = '#333333';
          this.ctx.fillRect(x, y, 1, 1);
        }
      }
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

// Initialize global halloween pumpkins
window.halloweenPumpkins = new HalloweenPumpkins();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.halloweenPumpkins) {
    window.halloweenPumpkins.destroy();
  }
});
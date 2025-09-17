class HeartBeat {
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

    // Heart beat parameters
    this.heartRate = 75; // BPM
    this.beatPhase = 0;
    this.lastBeatTime = 0;
    this.beatInterval = 60 / this.heartRate; // seconds between beats

    // Heart parameters
    this.heartX = 64;
    this.heartY = 32;
    this.heartSize = 1.0;
    this.targetSize = 1.0;
    this.isBeating = false;
    this.beatIntensity = 0;

    // Pulse wave
    this.pulseWave = [];
    this.initializePulseWave();

    // Heart particles
    this.heartParticles = [];

    // Valentine's colors
    this.colors = {
      heartRed: '#FF0066',       // Bright Pink-Red
      heartLight: '#FF3399',     // Light Pink
      heartDark: '#CC0033',      // Dark Red
      heartCore: '#FFFFFF',      // White
      pulse: '#FF6666',          // Light Red
      background: '#000011',      // Very Dark Blue
      text: '#FFCCDD',          // Light Pink
      sparkle: '#FFFF99'        // Light Yellow
    };

    // ECG-style waveform points
    this.ecgPattern = this.generateECGPattern();
  }

  init() {
    this.canvas = document.getElementById('heart-beat-canvas');
    if (!this.canvas) {
      console.error('Heart Beat canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Heart Beat initialized with 75fps targeting');
  }

  initializePulseWave() {
    // Initialize circular pulse wave
    for (let i = 0; i < 8; i++) {
      this.pulseWave.push({
        radius: i * 5,
        opacity: 1 - (i * 0.125),
        active: false
      });
    }
  }

  generateECGPattern() {
    // Generate realistic ECG/EKG heartbeat pattern
    const pattern = [];
    const baselineY = 45;

    // P wave (small bump before main beat)
    for (let i = 0; i < 8; i++) {
      pattern.push({ x: i, y: baselineY - Math.sin((i / 8) * Math.PI) * 2 });
    }

    // Flat segment
    for (let i = 8; i < 15; i++) {
      pattern.push({ x: i, y: baselineY });
    }

    // QRS complex (main heartbeat spike)
    pattern.push({ x: 15, y: baselineY + 2 }); // Q
    pattern.push({ x: 16, y: baselineY - 15 }); // R (main spike)
    pattern.push({ x: 17, y: baselineY + 3 }); // S

    // T wave (recovery)
    for (let i = 18; i < 28; i++) {
      const progress = (i - 18) / 10;
      pattern.push({ x: i, y: baselineY - Math.sin(progress * Math.PI) * 4 });
    }

    // Back to baseline
    for (let i = 28; i < 40; i++) {
      pattern.push({ x: i, y: baselineY });
    }

    return pattern;
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
    // Check for heartbeat timing
    if (this.time - this.lastBeatTime >= this.beatInterval) {
      this.triggerHeartbeat();
      this.lastBeatTime = this.time;
    }

    // Update heart size animation
    if (this.isBeating) {
      this.beatIntensity += 0.3;

      if (this.beatIntensity <= Math.PI) {
        // Growing phase
        this.heartSize = 1.0 + Math.sin(this.beatIntensity) * 0.4;
      } else {
        // Reset
        this.isBeating = false;
        this.beatIntensity = 0;
        this.heartSize = 1.0;
      }
    }

    // Update pulse waves
    this.pulseWave.forEach(wave => {
      if (wave.active) {
        wave.radius += 2;
        wave.opacity -= 0.02;

        if (wave.opacity <= 0) {
          wave.active = false;
          wave.radius = 0;
        }
      }
    });

    // Update heart particles
    this.heartParticles = this.heartParticles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life -= 0.02;
      particle.vy += 0.02; // gravity

      return particle.life > 0;
    });

    // Occasionally add sparkle particles
    if (Math.random() < 0.05 && this.heartParticles.length < 20) {
      this.addSparkleParticle();
    }
  }

  triggerHeartbeat() {
    this.isBeating = true;
    this.beatIntensity = 0;

    // Trigger pulse wave
    const inactiveWave = this.pulseWave.find(wave => !wave.active);
    if (inactiveWave) {
      inactiveWave.active = true;
      inactiveWave.radius = 0;
      inactiveWave.opacity = 1;
    }

    // Add heart particles on beat
    this.addHeartParticles();
  }

  addHeartParticles() {
    // Add small heart particles that float up
    for (let i = 0; i < 5; i++) {
      const angle = (Math.random() * Math.PI * 2);
      const speed = 0.5 + Math.random() * 1.0;

      this.heartParticles.push({
        x: this.heartX + (Math.random() - 0.5) * 20,
        y: this.heartY + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * speed * 0.3,
        vy: Math.sin(angle) * speed - 1,
        life: 1.0,
        size: 1 + Math.random() * 2,
        color: Math.random() > 0.5 ? this.colors.heartLight : this.colors.sparkle
      });
    }
  }

  addSparkleParticle() {
    this.heartParticles.push({
      x: this.heartX + (Math.random() - 0.5) * 30,
      y: this.heartY + (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 2,
      vy: -0.5 - Math.random(),
      life: 1.0,
      size: 1,
      color: this.colors.sparkle
    });
  }

  render() {
    // Clear canvas with romantic background
    this.ctx.fillStyle = this.colors.background;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw pulse waves
    this.pulseWave.forEach(wave => {
      if (wave.active && wave.opacity > 0) {
        this.drawPulseWave(wave);
      }
    });

    // Draw ECG line
    this.drawECGLine();

    // Draw main heart
    this.drawHeart();

    // Draw heart particles
    this.heartParticles.forEach(particle => {
      this.drawParticle(particle);
    });

    // Draw decorative elements
    this.drawDecorations();

    // Draw heartrate text
    this.drawHeartRateText();
  }

  drawPulseWave(wave) {
    const { radius, opacity } = wave;

    if (radius > 0 && radius < 50) {
      // Draw pulse ring
      const alpha = Math.floor(255 * opacity);
      this.ctx.fillStyle = this.colors.pulse;

      // Draw ring as pixels
      const numPoints = Math.floor(radius * 6);
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const x = this.heartX + Math.cos(angle) * radius;
        const y = this.heartY + Math.sin(angle) * radius;

        if (x >= 0 && x < this.width && y >= 0 && y < this.height && opacity > 0.1) {
          this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
        }
      }
    }
  }

  drawECGLine() {
    // Draw moving ECG pattern
    this.ctx.fillStyle = this.colors.pulse;

    const scrollOffset = (this.time * 30) % (this.ecgPattern.length * 2);

    for (let x = 0; x < this.width; x++) {
      const patternIndex = Math.floor((x + scrollOffset) % this.ecgPattern.length);
      const point = this.ecgPattern[patternIndex];

      if (point && x > 5 && x < this.width - 5) {
        this.ctx.fillRect(x, Math.floor(point.y), 1, 1);

        // Add glow to the current beat position
        if (Math.abs(scrollOffset - x) < 5) {
          this.ctx.fillRect(x, Math.floor(point.y - 1), 1, 1);
          this.ctx.fillRect(x, Math.floor(point.y + 1), 1, 1);
        }
      }
    }
  }

  drawHeart() {
    const size = Math.floor(12 * this.heartSize);
    const x = this.heartX;
    const y = this.heartY;

    // Draw heart shape using pixel approximation
    this.ctx.fillStyle = this.colors.heartRed;

    // Heart shape drawing
    for (let py = -size; py <= size; py++) {
      for (let px = -size; px <= size; px++) {
        if (this.isInsideHeart(px / size, py / size)) {
          const pixelX = x + px;
          const pixelY = y + py;

          if (pixelX >= 0 && pixelX < this.width && pixelY >= 0 && pixelY < this.height) {
            this.ctx.fillRect(pixelX, pixelY, 1, 1);
          }
        }
      }
    }

    // Add heart highlights
    this.ctx.fillStyle = this.colors.heartLight;
    for (let py = -size + 2; py <= size - 2; py++) {
      for (let px = -size + 2; px <= size - 2; px++) {
        if (this.isInsideHeart(px / size, py / size) && px < 0 && py < 0) {
          const pixelX = x + px;
          const pixelY = y + py;

          if (pixelX >= 0 && pixelX < this.width && pixelY >= 0 && pixelY < this.height) {
            this.ctx.fillRect(pixelX, pixelY, 1, 1);
          }
        }
      }
    }

    // Add bright core when beating
    if (this.isBeating && this.beatIntensity < Math.PI) {
      this.ctx.fillStyle = this.colors.heartCore;
      const coreSize = Math.floor(size * 0.3);

      for (let py = -coreSize; py <= coreSize; py++) {
        for (let px = -coreSize; px <= coreSize; px++) {
          if (this.isInsideHeart(px / size, py / size)) {
            this.ctx.fillRect(x + px, y + py, 1, 1);
          }
        }
      }
    }
  }

  isInsideHeart(x, y) {
    // Mathematical heart shape: ((x^2 + y^2 - 1)^3) <= x^2 * y^3
    const xx = x * x;
    const yy = y * y;
    const left = Math.pow(xx + yy - 1, 3);
    const right = xx * yy * yy;

    return left <= right;
  }

  drawParticle(particle) {
    const { x, y, life, size, color } = particle;

    if (life > 0) {
      this.ctx.fillStyle = color;
      const pixelX = Math.floor(x);
      const pixelY = Math.floor(y);

      if (pixelX >= 0 && pixelX < this.width && pixelY >= 0 && pixelY < this.height) {
        this.ctx.fillRect(pixelX, pixelY, Math.floor(size), Math.floor(size));

        // Add sparkle effect
        if (color === this.colors.sparkle) {
          this.ctx.fillRect(pixelX - 1, pixelY, 1, 1);
          this.ctx.fillRect(pixelX + 1, pixelY, 1, 1);
          this.ctx.fillRect(pixelX, pixelY - 1, 1, 1);
          this.ctx.fillRect(pixelX, pixelY + 1, 1, 1);
        }
      }
    }
  }

  drawDecorations() {
    // Draw small hearts in corners
    const smallHearts = [
      { x: 15, y: 15 }, { x: 113, y: 15 },
      { x: 15, y: 49 }, { x: 113, y: 49 }
    ];

    this.ctx.fillStyle = this.colors.heartLight;
    smallHearts.forEach((heart, index) => {
      const twinkle = Math.sin(this.time * 3 + index) * 0.3 + 0.7;
      if (twinkle > 0.5) {
        // Draw small heart
        this.ctx.fillRect(heart.x, heart.y, 1, 1);
        this.ctx.fillRect(heart.x - 1, heart.y - 1, 1, 1);
        this.ctx.fillRect(heart.x + 1, heart.y - 1, 1, 1);
        this.ctx.fillRect(heart.x, heart.y - 2, 1, 1);
        this.ctx.fillRect(heart.x, heart.y + 1, 1, 1);
      }
    });
  }

  drawHeartRateText() {
    // Draw BPM text at bottom
    this.ctx.fillStyle = this.colors.text;

    const bpmText = `${this.heartRate} BPM`;
    const startX = 45;
    const y = 10;

    // Simple pixel font for BPM display
    this.drawPixelText(bpmText, startX, y);
  }

  drawPixelText(text, startX, y) {
    // Very simple pixel text renderer
    const chars = {
      '7': [[1,1,1], [0,0,1], [0,0,1], [0,0,1], [0,0,1]],
      '5': [[1,1,1], [1,0,0], [1,1,1], [0,0,1], [1,1,1]],
      'B': [[1,1,0], [1,0,1], [1,1,0], [1,0,1], [1,1,0]],
      'P': [[1,1,0], [1,0,1], [1,1,0], [1,0,0], [1,0,0]],
      'M': [[1,0,1], [1,1,1], [1,1,1], [1,0,1], [1,0,1]],
      ' ': [[0,0,0], [0,0,0], [0,0,0], [0,0,0], [0,0,0]]
    };

    let x = startX;
    for (let char of text) {
      if (chars[char]) {
        const pattern = chars[char];
        for (let row = 0; row < pattern.length; row++) {
          for (let col = 0; col < pattern[row].length; col++) {
            if (pattern[row][col]) {
              this.ctx.fillRect(x + col, y + row, 1, 1);
            }
          }
        }
        x += 4; // Character spacing
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

// Initialize global heart beat
window.heartBeat = new HeartBeat();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.heartBeat) {
    window.heartBeat.destroy();
  }
});
class WavePool {
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

    // Wave parameters
    this.waves = [
      { amplitude: 4, frequency: 0.02, phase: 0, speed: 0.05, baseY: 45 },
      { amplitude: 3, frequency: 0.035, phase: Math.PI, speed: 0.03, baseY: 47 },
      { amplitude: 2, frequency: 0.05, phase: Math.PI * 0.5, speed: 0.07, baseY: 49 }
    ];

    // Floating objects
    this.floatingObjects = [];
    this.maxObjects = 8;

    // Water particles (droplets/foam)
    this.particles = [];
    this.maxParticles = 20;

    this.initializeObjects();
  }

  init() {
    this.canvas = document.getElementById('wave-pool-canvas');
    if (!this.canvas) {
      console.error('Wave Pool canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Wave Pool initialized with 75fps targeting');
  }

  initializeObjects() {
    const objectTypes = ['leaf', 'log', 'duck', 'bottle'];
    const colors = {
      leaf: '#32CD32',
      log: '#8B4513',
      duck: '#FFD700',
      bottle: '#4169E1'
    };

    // Create floating objects
    for (let i = 0; i < this.maxObjects; i++) {
      const type = objectTypes[Math.floor(Math.random() * objectTypes.length)];
      this.floatingObjects.push({
        x: Math.random() * this.width,
        y: 35 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 0.2,
        vy: 0,
        type: type,
        color: colors[type],
        size: type === 'log' ? 6 : type === 'duck' ? 4 : 3,
        bobPhase: Math.random() * Math.PI * 2,
        bobSpeed: 0.02 + Math.random() * 0.02
      });
    }

    // Create water particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    this.particles.push({
      x: Math.random() * this.width,
      y: 40 + Math.random() * 15,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.3,
      life: 0,
      maxLife: 30 + Math.random() * 40,
      size: Math.random() * 2 + 1
    });
  }

  calculateWaveHeight(x, time) {
    let height = 0;
    this.waves.forEach(wave => {
      height += Math.sin(x * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
    });
    return height;
  }

  getWaterSurfaceY(x) {
    const baseY = 45; // Base water level
    const waveHeight = this.calculateWaveHeight(x, this.time);
    return baseY + waveHeight;
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
    // Update wave phases
    this.waves.forEach(wave => {
      wave.phase += wave.speed;
    });

    // Update floating objects
    this.floatingObjects.forEach(obj => {
      // Horizontal drift
      obj.x += obj.vx;

      // Wrap around screen
      if (obj.x < -obj.size) obj.x = this.width + obj.size;
      if (obj.x > this.width + obj.size) obj.x = -obj.size;

      // Follow wave surface
      const surfaceY = this.getWaterSurfaceY(obj.x);
      obj.y = surfaceY - obj.size / 2;

      // Add bobbing motion
      obj.bobPhase += obj.bobSpeed;
      obj.y += Math.sin(obj.bobPhase) * 1.5;

      // Slight rotation effect for logs
      if (obj.type === 'log') {
        obj.rotation = Math.sin(obj.bobPhase * 0.5) * 0.3;
      }
    });

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;

      // Add gravity to particles above water
      if (particle.y < this.getWaterSurfaceY(particle.x)) {
        particle.vy += 0.02;
      } else {
        // Particle in water - slow down
        particle.vx *= 0.98;
        particle.vy *= 0.95;
      }

      // Remove expired particles
      if (particle.life > particle.maxLife) {
        this.particles.splice(i, 1);
        this.createParticle(); // Create new one
      }
    }
  }

  render() {
    // Clear canvas with sky blue
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw pool bottom
    this.ctx.fillStyle = '#4682B4';
    this.ctx.fillRect(0, 50, this.width, this.height - 50);

    // Draw pool walls
    this.ctx.fillStyle = '#2F4F4F';
    this.ctx.fillRect(0, 40, this.width, 2); // Top edge
    this.ctx.fillRect(0, 62, this.width, 2); // Bottom edge

    // Draw water surface with waves
    this.ctx.fillStyle = '#0077BE';

    // Draw water as horizontal scanlines following wave pattern
    for (let y = 42; y < 60; y++) {
      for (let x = 0; x < this.width; x++) {
        const surfaceY = this.getWaterSurfaceY(x);
        if (y > surfaceY) {
          // Adjust water color based on depth
          const depth = y - surfaceY;
          const alpha = Math.min(1, 0.7 + depth * 0.05);

          if (y < surfaceY + 5) {
            this.ctx.fillStyle = '#0077BE'; // Shallow water
          } else {
            this.ctx.fillStyle = '#005580'; // Deep water
          }

          this.ctx.fillRect(x, y, 1, 1);
        }
      }
    }

    // Draw wave surface highlights
    this.ctx.fillStyle = '#87CEEB';
    for (let x = 0; x < this.width; x += 2) {
      const surfaceY = this.getWaterSurfaceY(x);
      const nextSurfaceY = this.getWaterSurfaceY(x + 2);

      // Highlight wave crests
      if (surfaceY < nextSurfaceY && surfaceY < 47) {
        this.ctx.fillRect(x, Math.floor(surfaceY), 2, 1);
      }
    }

    // Draw floating objects
    this.floatingObjects.forEach(obj => {
      this.drawFloatingObject(obj);
    });

    // Draw water particles/foam
    this.particles.forEach(particle => {
      const alpha = 1 - (particle.life / particle.maxLife);
      if (alpha > 0.1) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        this.ctx.fillRect(
          Math.floor(particle.x),
          Math.floor(particle.y),
          Math.ceil(particle.size),
          Math.ceil(particle.size)
        );
      }
    });

    // Draw pool reflection effects
    this.drawReflections();
  }

  drawFloatingObject(obj) {
    const x = Math.floor(obj.x);
    const y = Math.floor(obj.y);

    this.ctx.fillStyle = obj.color;

    switch (obj.type) {
      case 'leaf':
        // Simple leaf shape
        this.ctx.fillRect(x - 1, y, 3, 2);
        this.ctx.fillRect(x, y - 1, 1, 3);
        break;

      case 'log':
        // Horizontal log
        this.ctx.fillRect(x - 3, y, 6, 2);
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x - 3, y, 1, 2);
        this.ctx.fillRect(x + 2, y, 1, 2);
        break;

      case 'duck':
        // Simple duck silhouette
        this.ctx.fillRect(x - 1, y, 3, 2); // Body
        this.ctx.fillRect(x - 2, y - 1, 2, 2); // Head
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.fillRect(x - 3, y - 1, 1, 1); // Beak
        break;

      case 'bottle':
        // Bottle shape
        this.ctx.fillRect(x, y - 1, 2, 4);
        this.ctx.fillRect(x, y - 2, 1, 2); // Neck
        break;
    }

    // Add object reflection in water
    if (y < 55) {
      this.ctx.fillStyle = `rgba(${this.hexToRgb(obj.color).r}, ${this.hexToRgb(obj.color).g}, ${this.hexToRgb(obj.color).b}, 0.3)`;
      this.ctx.fillRect(x, y + 6, obj.size, 2);
    }
  }

  drawReflections() {
    // Add shimmering reflections on water surface
    for (let i = 0; i < 5; i++) {
      const x = (this.time * 10 + i * 30) % this.width;
      const y = this.getWaterSurfaceY(x) + Math.sin(this.time * 5 + i) * 2;

      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
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
    this.floatingObjects = [];
    this.particles = [];
  }
}

// Create global instance
window.wavePool = new WavePool();
class Fireworks {
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

    // Fireworks system
    this.rockets = [];
    this.explosions = [];
    this.particles = [];

    // Launch timing
    this.nextLaunch = 0;
    this.launchInterval = 1.5; // seconds between launches

    // Firework colors
    this.colors = [
      '#FF0000', // Red
      '#00FF00', // Green
      '#0080FF', // Blue
      '#FFFF00', // Yellow
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#FF8000', // Orange
      '#8000FF', // Purple
      '#FF0080', // Pink
      '#80FF00'  // Lime
    ];
  }

  init() {
    this.canvas = document.getElementById('fireworks-canvas');
    if (!this.canvas) {
      console.error('Fireworks canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Fireworks initialized with 75fps targeting');
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
    // Launch new rockets
    if (this.time > this.nextLaunch) {
      this.launchRocket();
      this.nextLaunch = this.time + this.launchInterval + Math.random() * 2;
    }

    // Update rockets
    this.rockets = this.rockets.filter(rocket => {
      rocket.x += rocket.vx;
      rocket.y += rocket.vy;
      rocket.vy += 0.02; // gravity
      rocket.trail.unshift({ x: rocket.x, y: rocket.y, age: 0 });
      rocket.trail = rocket.trail.slice(0, 8);
      rocket.trail.forEach(point => point.age++);

      // Explode when rocket reaches peak or random chance
      if (rocket.vy > -0.5 || Math.random() < 0.02) {
        this.createExplosion(rocket.x, rocket.y, rocket.color);
        return false;
      }
      return rocket.y > -5;
    });

    // Update explosions
    this.explosions = this.explosions.filter(explosion => {
      explosion.age++;
      return explosion.age < explosion.maxAge;
    });

    // Update particles
    this.particles = this.particles.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.01; // gravity
      particle.age++;
      particle.life -= 0.02;

      return particle.life > 0 && particle.y < this.height + 5;
    });
  }

  launchRocket() {
    const x = 20 + Math.random() * (this.width - 40);
    const y = this.height - 5;
    const targetY = 15 + Math.random() * 25;
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];

    const rocket = {
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -1.2 - Math.random() * 0.8,
      color: color,
      trail: []
    };

    this.rockets.push(rocket);
  }

  createExplosion(x, y, color) {
    const explosion = {
      x: x,
      y: y,
      color: color,
      age: 0,
      maxAge: 60,
      size: 15 + Math.random() * 15
    };

    this.explosions.push(explosion);

    // Create particle burst
    const numParticles = 20 + Math.floor(Math.random() * 20);
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const speed = 0.5 + Math.random() * 1.5;

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: this.getParticleColor(color),
        life: 1.0,
        age: 0,
        maxAge: 30 + Math.random() * 30
      });
    }

    // Create secondary burst for larger explosions
    if (Math.random() > 0.7) {
      setTimeout(() => {
        const secondaryParticles = 10 + Math.floor(Math.random() * 10);
        for (let i = 0; i < secondaryParticles; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 0.3 + Math.random() * 0.8;

          this.particles.push({
            x: x + (Math.random() - 0.5) * 6,
            y: y + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: '#FFFFFF', // White sparks
            life: 1.0,
            age: 0,
            maxAge: 20 + Math.random() * 20
          });
        }
      }, 200);
    }
  }

  getParticleColor(baseColor) {
    // Vary the particle colors slightly
    const variations = [baseColor, '#FFFFFF', '#FFFF80'];
    if (Math.random() > 0.7) {
      return variations[Math.floor(Math.random() * variations.length)];
    }
    return baseColor;
  }

  render() {
    // Clear with fade effect for trails
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw city silhouette
    this.drawCitySilhouette();

    // Draw rocket trails
    this.rockets.forEach(rocket => {
      this.drawRocketTrail(rocket);
    });

    // Draw rockets
    this.rockets.forEach(rocket => {
      this.drawRocket(rocket);
    });

    // Draw explosion rings
    this.explosions.forEach(explosion => {
      this.drawExplosion(explosion);
    });

    // Draw particles
    this.particles.forEach(particle => {
      this.drawParticle(particle);
    });

    // Draw stars
    this.drawStars();
  }

  drawCitySilhouette() {
    this.ctx.fillStyle = '#1a1a1a';

    // Simple city buildings silhouette
    const buildings = [
      { x: 0, height: 15 },
      { x: 15, height: 20 },
      { x: 30, height: 12 },
      { x: 45, height: 25 },
      { x: 65, height: 18 },
      { x: 80, height: 22 },
      { x: 100, height: 16 },
      { x: 115, height: 19 }
    ];

    buildings.forEach(building => {
      const width = 15;
      const height = building.height;
      this.ctx.fillRect(building.x, this.height - height, width, height);

      // Add some windows
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < Math.floor(height / 6); j++) {
          if (Math.random() > 0.7) {
            this.ctx.fillStyle = '#FFFF80';
            this.ctx.fillRect(building.x + 2 + i * 4, this.height - height + 3 + j * 6, 2, 2);
            this.ctx.fillStyle = '#1a1a1a';
          }
        }
      }
    });
  }

  drawRocketTrail(rocket) {
    rocket.trail.forEach((point, index) => {
      if (index < rocket.trail.length - 1) {
        const alpha = 1 - (point.age / 8);
        const size = Math.max(1, 3 - index);

        this.ctx.fillStyle = rocket.color;
        if (alpha > 0) {
          this.ctx.fillRect(Math.floor(point.x), Math.floor(point.y), size, size);
        }
      }
    });
  }

  drawRocket(rocket) {
    this.ctx.fillStyle = rocket.color;
    this.ctx.fillRect(Math.floor(rocket.x), Math.floor(rocket.y), 2, 2);

    // Bright core
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(Math.floor(rocket.x), Math.floor(rocket.y), 1, 1);
  }

  drawExplosion(explosion) {
    const { x, y, color, age, maxAge, size } = explosion;
    const progress = age / maxAge;
    const radius = size * (1 - progress);

    if (radius > 1) {
      // Draw explosion ring
      this.ctx.fillStyle = color;

      const numPoints = Math.floor(radius * 8);
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;

        if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
          this.ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
        }
      }

      // Inner ring
      if (radius > 3) {
        this.ctx.fillStyle = '#FFFFFF';
        const innerRadius = radius * 0.6;
        const innerPoints = Math.floor(innerRadius * 6);

        for (let i = 0; i < innerPoints; i++) {
          const angle = (i / innerPoints) * Math.PI * 2;
          const px = x + Math.cos(angle) * innerRadius;
          const py = y + Math.sin(angle) * innerRadius;

          if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
            this.ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
          }
        }
      }
    }
  }

  drawParticle(particle) {
    if (particle.life > 0) {
      this.ctx.fillStyle = particle.color;
      const x = Math.floor(particle.x);
      const y = Math.floor(particle.y);

      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.ctx.fillRect(x, y, 1, 1);

        // Bright particles get extra glow
        if (particle.color === '#FFFFFF' && particle.life > 0.5) {
          this.ctx.fillRect(x - 1, y, 1, 1);
          this.ctx.fillRect(x + 1, y, 1, 1);
          this.ctx.fillRect(x, y - 1, 1, 1);
          this.ctx.fillRect(x, y + 1, 1, 1);
        }
      }
    }
  }

  drawStars() {
    // Static stars in background
    const stars = [
      { x: 10, y: 8 }, { x: 25, y: 12 }, { x: 40, y: 6 },
      { x: 60, y: 10 }, { x: 85, y: 15 }, { x: 110, y: 8 },
      { x: 35, y: 25 }, { x: 70, y: 20 }, { x: 95, y: 22 }
    ];

    stars.forEach((star, index) => {
      const twinkle = Math.sin(this.time * 2 + index) * 0.3 + 0.7;
      if (twinkle > 0.5) {
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(star.x, star.y, 1, 1);
      }
    });
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

// Initialize global fireworks
window.fireworks = new Fireworks();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.fireworks) {
    window.fireworks.destroy();
  }
});
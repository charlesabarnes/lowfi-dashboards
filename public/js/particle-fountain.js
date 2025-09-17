class ParticleFountain {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    // Fountain configuration
    this.fountainX = this.width / 2;
    this.fountainY = this.height - 5;
    this.particles = [];
    this.maxParticles = 50;
    this.spawnRate = 3; // particles per frame

    // Physics
    this.gravity = 0.15;
    this.initialVelocity = 4;

    // LED-optimized colors
    this.colors = [
      '#00FFFF', // Cyan
      '#0080FF', // Light Blue
      '#0040FF', // Medium Blue
      '#0020FF', // Blue
      '#0000FF', // Dark Blue
      '#4000FF', // Purple-Blue
      '#8000FF'  // Purple
    ];

    this.time = 0;
    this.lastTime = 0;
    this.frameRate = 13; // ~75fps (1000ms / 75fps ≈ 13ms)
  }

  init() {
    this.canvas = document.getElementById('fountain-canvas');
    if (!this.canvas) {
      console.error('Fountain canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Particle Fountain initialized');
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
    this.time += 0.05;

    // Spawn new particles
    for (let i = 0; i < this.spawnRate; i++) {
      if (this.particles.length < this.maxParticles) {
        this.spawnParticle();
      }
    }

    // Update existing particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Apply physics
      particle.velocityY += this.gravity;
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;

      // Age the particle
      particle.age++;
      particle.life -= 0.02;

      // Remove dead particles or ones that fell off screen
      if (particle.life <= 0 || particle.y > this.height + 10) {
        this.particles.splice(i, 1);
      }
    }
  }

  spawnParticle() {
    // Vary the fountain angle slightly over time
    const angleVariation = Math.sin(this.time) * 0.3;
    const baseAngle = -Math.PI/2 + angleVariation; // Straight up with variation
    const spreadAngle = (Math.random() - 0.5) * Math.PI/3; // ±30 degree spread
    const angle = baseAngle + spreadAngle;

    // Vary velocity
    const velocity = this.initialVelocity * (0.7 + Math.random() * 0.6);

    const particle = {
      x: this.fountainX + (Math.random() - 0.5) * 4, // Small spawn area
      y: this.fountainY,
      velocityX: Math.cos(angle) * velocity,
      velocityY: Math.sin(angle) * velocity,
      life: 1.0,
      age: 0,
      color: this.colors[Math.floor(Math.random() * this.colors.length)],
      size: 1 + Math.random()
    };

    this.particles.push(particle);
  }

  render() {
    // Clear canvas with slight fade for trails
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw fountain base
    this.ctx.fillStyle = '#444444';
    this.ctx.fillRect(
      Math.floor(this.fountainX - 6),
      Math.floor(this.fountainY),
      12,
      4
    );

    // Draw fountain spout
    this.ctx.fillStyle = '#666666';
    this.ctx.fillRect(
      Math.floor(this.fountainX - 1),
      Math.floor(this.fountainY - 3),
      2,
      3
    );

    // Draw particles
    this.particles.forEach(particle => {
      // Calculate alpha based on particle life
      const alpha = Math.max(0, particle.life);

      // Create color with life-based brightness
      const r = parseInt(particle.color.slice(1, 3), 16);
      const g = parseInt(particle.color.slice(3, 5), 16);
      const b = parseInt(particle.color.slice(5, 7), 16);

      const brightness = alpha;
      this.ctx.fillStyle = `rgb(${Math.floor(r * brightness)}, ${Math.floor(g * brightness)}, ${Math.floor(b * brightness)})`;

      // Draw particle
      const size = Math.ceil(particle.size * alpha);
      if (size > 0) {
        this.ctx.fillRect(
          Math.floor(particle.x),
          Math.floor(particle.y),
          size,
          size
        );
      }
    });

    // Draw water droplets hitting the ground
    this.drawWaterSplashes();
  }

  drawWaterSplashes() {
    // Simple water splash effects at the bottom
    for (let i = 0; i < 5; i++) {
      const x = 20 + i * 20 + Math.sin(this.time * 2 + i) * 10;
      const splashHeight = 2 + Math.sin(this.time * 3 + i * 2) * 1;

      if (splashHeight > 1) {
        this.ctx.fillStyle = '#004080';
        this.ctx.fillRect(
          Math.floor(x),
          Math.floor(this.height - splashHeight),
          1,
          Math.floor(splashHeight)
        );
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

// Initialize global particle fountain
window.particleFountain = new ParticleFountain();

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.particleFountain) {
    window.particleFountain.destroy();
  }
});
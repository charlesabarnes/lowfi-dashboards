class DNAHelix {
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

    // DNA helix parameters
    this.rotation = 0;
    this.rotationSpeed = 0.05;
    this.helixRadius = 20;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;

    // Base pairs and particles
    this.basePairs = [];
    this.particles = [];
    this.backgroundParticles = [];

    this.initializeHelix();
    this.initializeParticles();
  }

  init() {
    this.canvas = document.getElementById('dna-helix-canvas');
    if (!this.canvas) {
      console.error('DNA Helix canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('DNA Helix initialized with 75fps targeting');
  }

  initializeHelix() {
    // Create base pairs along the helix
    this.basePairs = [];
    for (let i = 0; i < 20; i++) {
      this.basePairs.push({
        z: i * 3.2,
        baseType: Math.random() < 0.5 ? 'AT' : 'GC', // Adenine-Thymine or Guanine-Cytosine
        brightness: Math.random() * 0.5 + 0.5
      });
    }
  }

  initializeParticles() {
    // Floating energy particles around DNA
    this.particles = [];
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 15 + 25,
        speed: Math.random() * 0.02 + 0.01,
        life: Math.random() * 100,
        maxLife: 100,
        size: Math.random() * 2 + 1
      });
    }

    // Background energy field
    this.backgroundParticles = [];
    for (let i = 0; i < 15; i++) {
      this.backgroundParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: Math.random() * 0.5 + 0.2,
        life: Math.random() * 200,
        maxLife: 200,
        brightness: Math.random() * 0.3 + 0.1
      });
    }
  }

  getHelixPoint(z, strand) {
    const angle = (z * 0.3) + (strand * Math.PI) + this.rotation;
    return {
      x: this.centerX + Math.cos(angle) * this.helixRadius,
      y: this.centerY + Math.sin(angle) * (this.helixRadius * 0.3) + (z * 0.5) - 30
    };
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

    // Control frame rate to 75fps
    if (currentTime - this.lastTime < this.frameTime) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastTime = currentTime;

    this.update();
    this.render();

    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  update() {
    // Rotate the helix
    this.rotation += this.rotationSpeed;

    // Update floating particles
    this.particles.forEach(particle => {
      particle.angle += particle.speed;
      particle.life++;

      if (particle.life > particle.maxLife) {
        particle.life = 0;
        particle.angle = Math.random() * Math.PI * 2;
        particle.radius = Math.random() * 15 + 25;
        particle.speed = Math.random() * 0.02 + 0.01;
      }
    });

    // Update background particles
    this.backgroundParticles.forEach(particle => {
      particle.y += particle.speed;
      particle.life++;

      if (particle.y > this.height || particle.life > particle.maxLife) {
        particle.x = Math.random() * this.width;
        particle.y = -5;
        particle.life = 0;
        particle.speed = Math.random() * 0.5 + 0.2;
        particle.brightness = Math.random() * 0.3 + 0.1;
      }
    });

    // Recycle base pairs that move off screen
    this.basePairs.forEach(pair => {
      const testPoint = this.getHelixPoint(pair.z, 0);
      if (testPoint.y > this.height + 10) {
        pair.z -= 64; // Move to top
        pair.baseType = Math.random() < 0.5 ? 'AT' : 'GC';
        pair.brightness = Math.random() * 0.5 + 0.5;
      }
    });
  }

  render() {
    // Dark background with subtle glow
    this.ctx.fillStyle = '#0a0a15';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw background energy particles
    this.backgroundParticles.forEach(particle => {
      this.ctx.globalAlpha = particle.brightness;
      this.ctx.fillStyle = '#2a4a8a';
      this.ctx.fillRect(Math.floor(particle.x), Math.floor(particle.y), 1, 1);
    });
    this.ctx.globalAlpha = 1;

    // Sort base pairs by depth for proper rendering
    const sortedPairs = [...this.basePairs].sort((a, b) => {
      const pointA = this.getHelixPoint(a.z, 0);
      const pointB = this.getHelixPoint(b.z, 0);
      return pointA.y - pointB.y;
    });

    // Draw DNA helix strands and base pairs
    sortedPairs.forEach(pair => {
      if (pair.z > -30 && pair.z < 50) { // Only draw visible pairs
        const point1 = this.getHelixPoint(pair.z, 0);
        const point2 = this.getHelixPoint(pair.z, 1);

        if (point1.y >= 0 && point1.y < this.height && point2.y >= 0 && point2.y < this.height) {
          // Draw connecting base pair
          this.ctx.globalAlpha = pair.brightness;

          // Base pair colors
          if (pair.baseType === 'AT') {
            this.ctx.fillStyle = '#ff4444'; // Red for A-T
          } else {
            this.ctx.fillStyle = '#4444ff'; // Blue for G-C
          }

          // Draw connection line between strands
          const steps = Math.abs(point2.x - point1.x);
          for (let i = 0; i <= steps; i++) {
            const x = point1.x + (point2.x - point1.x) * (i / steps);
            const y = point1.y + (point2.y - point1.y) * (i / steps);
            this.ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
          }

          // Draw strand points (backbone)
          this.ctx.fillStyle = '#66ff66'; // Green for backbone
          this.ctx.fillRect(Math.floor(point1.x), Math.floor(point1.y), 2, 2);
          this.ctx.fillRect(Math.floor(point2.x), Math.floor(point2.y), 2, 2);
        }
      }
    });
    this.ctx.globalAlpha = 1;

    // Draw floating energy particles
    this.particles.forEach(particle => {
      const x = this.centerX + Math.cos(particle.angle) * particle.radius;
      const y = this.centerY + Math.sin(particle.angle) * particle.radius * 0.3;

      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        const alpha = 1 - (particle.life / particle.maxLife);
        this.ctx.globalAlpha = alpha * 0.8;
        this.ctx.fillStyle = '#ffff88';
        this.ctx.fillRect(Math.floor(x), Math.floor(y), particle.size, particle.size);
      }
    });
    this.ctx.globalAlpha = 1;

    // Draw title
    this.ctx.fillStyle = '#888888';
    this.ctx.font = '8px monospace';
    const titleText = 'DNA';
    this.ctx.fillText(titleText, 4, 10);
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
    this.basePairs = [];
    this.particles = [];
    this.backgroundParticles = [];
  }
}

// Create global instance
window.dnaHelix = new DNAHelix();
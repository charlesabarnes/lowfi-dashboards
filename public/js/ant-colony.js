class AntColony {
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

    // Ants
    this.ants = [];
    this.maxAnts = 12;

    // Food sources
    this.foodSources = [];
    this.maxFood = 4;

    // Pheromone trails
    this.pheromoneGrid = [];
    this.gridWidth = 32;
    this.gridHeight = 16;

    // Anthill
    this.anthill = { x: 20, y: 45, radius: 8 };

    this.initializeColony();
  }

  init() {
    this.canvas = document.getElementById('ant-colony-canvas');
    if (!this.canvas) {
      console.error('Ant Colony canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false; // Crisp pixels

    // Start animation
    this.animate();
    console.log('Ant Colony initialized with 75fps targeting');
  }

  initializeColony() {
    // Initialize pheromone grid
    for (let x = 0; x < this.gridWidth; x++) {
      this.pheromoneGrid[x] = [];
      for (let y = 0; y < this.gridHeight; y++) {
        this.pheromoneGrid[x][y] = 0;
      }
    }

    // Create food sources
    for (let i = 0; i < this.maxFood; i++) {
      this.foodSources.push({
        x: 30 + Math.random() * 80,
        y: 10 + Math.random() * 40,
        amount: 50 + Math.random() * 100,
        maxAmount: 150
      });
    }

    // Create ants
    for (let i = 0; i < this.maxAnts; i++) {
      this.createAnt();
    }
  }

  createAnt() {
    this.ants.push({
      x: this.anthill.x + (Math.random() - 0.5) * 10,
      y: this.anthill.y + (Math.random() - 0.5) * 10,
      angle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5,
      hasFood: false,
      targetFood: null,
      state: 'searching', // 'searching', 'carrying', 'returning'
      wanderTimer: 0,
      color: '#8B4513',
      trailTimer: 0
    });
  }

  gridToWorld(gx, gy) {
    return {
      x: gx * (this.width / this.gridWidth),
      y: gy * (this.height / this.gridHeight)
    };
  }

  worldToGrid(x, y) {
    return {
      x: Math.floor(x / (this.width / this.gridWidth)),
      y: Math.floor(y / (this.height / this.gridHeight))
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
    // Update pheromone decay
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        this.pheromoneGrid[x][y] *= 0.995; // Gradual decay
        if (this.pheromoneGrid[x][y] < 0.01) {
          this.pheromoneGrid[x][y] = 0;
        }
      }
    }

    // Update ants
    this.ants.forEach(ant => {
      this.updateAnt(ant);
    });

    // Respawn food occasionally
    if (Math.random() < 0.003) {
      this.foodSources.forEach(food => {
        if (food.amount < 10) {
          food.amount = 50 + Math.random() * 100;
        }
      });
    }
  }

  updateAnt(ant) {
    const gridPos = this.worldToGrid(ant.x, ant.y);

    // Leave pheromone trail
    ant.trailTimer++;
    if (ant.trailTimer > 5) {
      if (gridPos.x >= 0 && gridPos.x < this.gridWidth && gridPos.y >= 0 && gridPos.y < this.gridHeight) {
        if (ant.hasFood) {
          // Leave "food trail" pheromone
          this.pheromoneGrid[gridPos.x][gridPos.y] = Math.min(1, this.pheromoneGrid[gridPos.x][gridPos.y] + 0.3);
        }
      }
      ant.trailTimer = 0;
    }

    if (ant.state === 'searching') {
      // Look for food
      let closestFood = null;
      let closestDistance = Infinity;

      this.foodSources.forEach(food => {
        if (food.amount > 0) {
          const distance = Math.sqrt((ant.x - food.x) ** 2 + (ant.y - food.y) ** 2);
          if (distance < closestDistance && distance < 20) {
            closestDistance = distance;
            closestFood = food;
          }
        }
      });

      if (closestFood) {
        // Move toward food
        const angle = Math.atan2(closestFood.y - ant.y, closestFood.x - ant.x);
        ant.angle = angle;
        ant.targetFood = closestFood;

        // Pick up food if close enough
        if (closestDistance < 3) {
          ant.hasFood = true;
          ant.state = 'returning';
          ant.color = '#FF4500';
          closestFood.amount = Math.max(0, closestFood.amount - 5);
        }
      } else {
        // Follow pheromone trail or wander
        this.followPheromoneTrail(ant) || this.wanderBehavior(ant);
      }
    } else if (ant.state === 'returning') {
      // Return to anthill
      const anthillDistance = Math.sqrt((ant.x - this.anthill.x) ** 2 + (ant.y - this.anthill.y) ** 2);

      if (anthillDistance > 5) {
        // Move toward anthill
        const angle = Math.atan2(this.anthill.y - ant.y, this.anthill.x - ant.x);
        ant.angle = angle;
      } else {
        // Reached anthill - drop food and start searching again
        ant.hasFood = false;
        ant.state = 'searching';
        ant.color = '#8B4513';
        ant.targetFood = null;
      }
    }

    // Move ant
    ant.x += Math.cos(ant.angle) * ant.speed;
    ant.y += Math.sin(ant.angle) * ant.speed;

    // Keep ant within bounds
    if (ant.x < 0) {
      ant.x = 0;
      ant.angle = Math.PI - ant.angle;
    }
    if (ant.x > this.width) {
      ant.x = this.width;
      ant.angle = Math.PI - ant.angle;
    }
    if (ant.y < 0) {
      ant.y = 0;
      ant.angle = -ant.angle;
    }
    if (ant.y > this.height) {
      ant.y = this.height;
      ant.angle = -ant.angle;
    }
  }

  followPheromoneTrail(ant) {
    const gridPos = this.worldToGrid(ant.x, ant.y);
    let bestDirection = null;
    let bestStrength = 0;

    // Check surrounding cells for pheromone
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkX = gridPos.x + dx;
        const checkY = gridPos.y + dy;

        if (checkX >= 0 && checkX < this.gridWidth && checkY >= 0 && checkY < this.gridHeight) {
          const strength = this.pheromoneGrid[checkX][checkY];
          if (strength > bestStrength) {
            bestStrength = strength;
            const worldPos = this.gridToWorld(checkX, checkY);
            bestDirection = Math.atan2(worldPos.y - ant.y, worldPos.x - ant.x);
          }
        }
      }
    }

    if (bestDirection !== null && bestStrength > 0.1) {
      ant.angle = bestDirection + (Math.random() - 0.5) * 0.5; // Add some randomness
      return true;
    }
    return false;
  }

  wanderBehavior(ant) {
    ant.wanderTimer++;
    if (ant.wanderTimer > 30 + Math.random() * 60) {
      ant.angle += (Math.random() - 0.5) * Math.PI / 2;
      ant.wanderTimer = 0;
    }
  }

  render() {
    // Clear canvas with earthy background
    this.ctx.fillStyle = '#2F4F2F';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw pheromone trails
    for (let x = 0; x < this.gridWidth; x++) {
      for (let y = 0; y < this.gridHeight; y++) {
        const strength = this.pheromoneGrid[x][y];
        if (strength > 0.1) {
          const worldPos = this.gridToWorld(x, y);
          const alpha = Math.min(1, strength);

          this.ctx.fillStyle = `rgba(255, 255, 0, ${alpha * 0.6})`;
          this.ctx.fillRect(Math.floor(worldPos.x), Math.floor(worldPos.y), 4, 4);
        }
      }
    }

    // Draw anthill
    this.ctx.fillStyle = '#8B4513';
    for (let r = this.anthill.radius; r > 0; r -= 2) {
      this.drawCircle(this.anthill.x, this.anthill.y, r);
    }

    // Draw entrance
    this.ctx.fillStyle = '#000000';
    this.drawCircle(this.anthill.x, this.anthill.y, 3);

    // Draw food sources
    this.foodSources.forEach(food => {
      if (food.amount > 0) {
        const size = Math.ceil((food.amount / food.maxAmount) * 6);
        this.ctx.fillStyle = '#32CD32';
        this.drawCircle(food.x, food.y, size);

        // Food particles
        this.ctx.fillStyle = '#90EE90';
        for (let i = 0; i < Math.ceil(size / 2); i++) {
          const angle = (i / (size / 2)) * Math.PI * 2;
          const px = food.x + Math.cos(angle) * (size - 1);
          const py = food.y + Math.sin(angle) * (size - 1);
          this.ctx.fillRect(Math.floor(px), Math.floor(py), 1, 1);
        }
      }
    });

    // Draw ants
    this.ants.forEach(ant => {
      // Ant body
      this.ctx.fillStyle = ant.color;
      this.ctx.fillRect(Math.floor(ant.x - 1), Math.floor(ant.y - 1), 3, 2);

      // Ant head (direction indicator)
      const headX = ant.x + Math.cos(ant.angle) * 2;
      const headY = ant.y + Math.sin(ant.angle) * 2;
      this.ctx.fillRect(Math.floor(headX), Math.floor(headY), 1, 1);

      // Food indicator
      if (ant.hasFood) {
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(Math.floor(ant.x), Math.floor(ant.y - 2), 1, 1);
      }
    });
  }

  drawCircle(x, y, radius) {
    // Draw circle using rectangles
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          this.ctx.fillRect(Math.floor(x + dx), Math.floor(y + dy), 1, 1);
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
    this.ants = [];
    this.foodSources = [];
    this.pheromoneGrid = [];
  }
}

// Create global instance
window.antColony = new AntColony();
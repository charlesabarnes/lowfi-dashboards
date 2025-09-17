class GrowingTree {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.width = 128;
    this.height = 64;
    this.animationId = null;
    this.isPaused = false;

    this.targetFPS = 75;
    this.frameTime = 1000 / this.targetFPS;
    this.lastTime = 0;

    this.branches = [];
    this.leaves = [];
    this.fallingLeaves = [];
    this.growthTimer = 0;

    this.initializeTree();
  }

  init() {
    this.canvas = document.getElementById('growing-tree-canvas');
    if (!this.canvas) {
      console.error('Growing Tree canvas not found');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    this.animate();
    console.log('Growing Tree initialized with 75fps targeting');
  }

  initializeTree() {
    // Start with trunk
    this.branches = [{
      x1: this.width/2, y1: this.height,
      x2: this.width/2, y2: this.height - 15,
      width: 3, age: 0, maxAge: 100, growing: true
    }];
  }

  growBranch() {
    if (this.branches.length < 25) {
      const parent = this.branches[Math.floor(Math.random() * this.branches.length)];
      if (parent.age > 20) {
        const angle = (Math.random() - 0.5) * 1.5;
        const length = Math.random() * 12 + 8;
        const dx = Math.sin(angle) * length;
        const dy = -Math.cos(angle) * length;

        this.branches.push({
          x1: parent.x2, y1: parent.y2,
          x2: parent.x2 + dx, y2: parent.y2 + dy,
          width: Math.max(1, parent.width - 1), age: 0, maxAge: 80, growing: true
        });
      }
    }

    // Add leaves to mature branches
    if (Math.random() < 0.1) {
      for (let branch of this.branches) {
        if (branch.age > 30 && this.leaves.length < 40) {
          this.leaves.push({
            x: branch.x2 + (Math.random() - 0.5) * 6,
            y: branch.y2 + (Math.random() - 0.5) * 6,
            color: ['#228B22', '#32CD32', '#00FF00'][Math.floor(Math.random() * 3)],
            life: 0, maxLife: 200 + Math.random() * 100
          });
        }
      }
    }
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

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
    this.growthTimer++;

    // Grow tree
    if (this.growthTimer % 60 === 0) {
      this.growBranch();
    }

    // Update branches
    this.branches.forEach(branch => {
      if (branch.growing && branch.age < branch.maxAge) {
        branch.age++;
      }
    });

    // Update leaves
    for (let i = this.leaves.length - 1; i >= 0; i--) {
      const leaf = this.leaves[i];
      leaf.life++;

      if (leaf.life > leaf.maxLife) {
        this.fallingLeaves.push({
          x: leaf.x, y: leaf.y, vx: (Math.random() - 0.5) * 2, vy: 0.5,
          color: ['#8B4513', '#CD853F', '#DEB887'][Math.floor(Math.random() * 3)],
          life: 0, maxLife: 100
        });
        this.leaves.splice(i, 1);
      }
    }

    // Update falling leaves
    for (let i = this.fallingLeaves.length - 1; i >= 0; i--) {
      const leaf = this.fallingLeaves[i];
      leaf.x += leaf.vx;
      leaf.y += leaf.vy;
      leaf.vy += 0.02; // gravity
      leaf.life++;

      if (leaf.y > this.height || leaf.life > leaf.maxLife) {
        this.fallingLeaves.splice(i, 1);
      }
    }

    // Reset tree occasionally
    if (this.branches.length > 30) {
      this.branches = this.branches.slice(0, 1);
      this.leaves = [];
      this.fallingLeaves = [];
    }
  }

  render() {
    this.ctx.fillStyle = '#001122';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Ground
    this.ctx.fillStyle = '#654321';
    this.ctx.fillRect(0, this.height - 3, this.width, 3);

    // Branches
    this.branches.forEach(branch => {
      this.ctx.fillStyle = '#8B4513';
      const steps = Math.abs(branch.x2 - branch.x1) + Math.abs(branch.y2 - branch.y1);
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const x = branch.x1 + (branch.x2 - branch.x1) * t;
        const y = branch.y1 + (branch.y2 - branch.y1) * t;
        this.ctx.fillRect(Math.floor(x), Math.floor(y), branch.width, branch.width);
      }
    });

    // Leaves
    this.leaves.forEach(leaf => {
      this.ctx.fillStyle = leaf.color;
      this.ctx.fillRect(Math.floor(leaf.x), Math.floor(leaf.y), 2, 2);
    });

    // Falling leaves
    this.fallingLeaves.forEach(leaf => {
      this.ctx.fillStyle = leaf.color;
      this.ctx.fillRect(Math.floor(leaf.x), Math.floor(leaf.y), 1, 1);
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
    this.branches = [];
    this.leaves = [];
    this.fallingLeaves = [];
  }
}

window.growingTree = new GrowingTree();
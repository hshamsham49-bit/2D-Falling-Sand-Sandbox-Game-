class SandboxGame {
    constructor() {
        this.canvas = document.getElementById('sandbox');
        this.ctx = this.canvas.getContext('2d');
        this.width = 200;
        this.height = 150;
        this.scale = 4;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = (this.width * this.scale) + 'px';
        this.canvas.style.height = (this.height * this.scale) + 'px';
        
        this.grid = new Array(this.width * this.height).fill(null);
        this.nextGrid = new Array(this.width * this.height).fill(null);
        
        this.currentMaterial = 'sand';
        this.brushSize = 3;
        this.isRunning = true;
        this.simSpeed = 1;
        this.frameCount = 0;
        this.particleCount = 0;
        
        this.init();
    }
    
    init() {
        this.renderer = new Renderer(this);
        this.input = new InputHandler(this);
        this.audio = new AudioManager();
        
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
    }
    
    getIndex(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return -1;
        return y * this.width + x;
    }
    
    getParticle(x, y) {
        const idx = this.getIndex(x, y);
        return idx >= 0 ? this.grid[idx] : null;
    }
    
    setParticle(x, y, particle) {
        const idx = this.getIndex(x, y);
        if (idx >= 0) this.grid[idx] = particle;
    }
    
    isEmpty(x, y) {
        return this.getParticle(x, y) === null;
    }
    
    canMoveInto(x, y, currentDensity) {
        const p = this.getParticle(x, y);
        if (!p) return true;
        const targetDensity = MATERIALS[p.mat].density;
        return currentDensity > targetDensity;
    }
    
    spawnParticles(x, y, material, size) {
        const half = Math.floor(size / 2);
        let spawned = 0;
        
        for (let dy = -half; dy <= half; dy++) {
            for (let dx = -half; dx <= half; dx++) {
                const px = x + dx;
                const py = y + dy;
                if (px >= 0 && px < this.width && py >= 0 && py < this.height) {
                    if (this.isEmpty(px, py)) {
                        this.setParticle(px, py, new Particle(material, px, py));
                        spawned++;
                    }
                }
            }
        }
        
        if (spawned > 0) this.audio.playPlace();
    }
    
    update() {
        if (!this.isRunning) return;
        
        this.particleCount = 0;
        
        // Mark all as not updated
        for (let i = 0; i < this.grid.length; i++) {
            if (this.grid[i]) this.grid[i].updated = false;
        }
        
        // Update from bottom to top for gravity
        for (let y = this.height - 1; y >= 0; y--) {
            // Alternate direction each row for fairness
            const startX = (this.height - y) % 2 === 0 ? 0 : this.width - 1;
            const endX = (this.height - y) % 2 === 0 ? this.width : -1;
            const step = startX < endX ? 1 : -1;
            
            for (let x = startX; x !== endX; x += step) {
                const p = this.getParticle(x, y);
                if (!p || p.updated) continue;
                
                this.particleCount++;
                p.updated = true;
                
                if (p.life > 0) {
                    p.life--;
                    if (p.life <= 0) {
                        this.setParticle(x, y, null);
                        continue;
                    }
                }
                
                this.updateParticle(p, x, y);
            }
        }
        
        this.updateUI();
    }
    
    updateParticle(p, x, y) {
        const mat = MATERIALS[p.mat];
        const below = y + 1;
        const left = x - 1;
        const right = x + 1;
        const above = y - 1;
        
        switch (mat.type) {
            case 'powder':
                this.updatePowder(p, x, y, mat);
                break;
            case 'liquid':
                this.updateLiquid(p, x, y, mat);
                break;
            case 'gas':
                this.updateGas(p, x, y, mat);
                break;
            case 'solid':
                // Solids don't move unless pushed
                break;
        }
        
        this.handleReactions(p, x, y);
    }
    
    updatePowder(p, x, y, mat) {
        const below = y + 1;
        
        // Try move down
        if (below < this.height && this.canMoveInto(x, below, mat.density)) {
            this.moveParticle(x, y, x, below);
            return;
        }
        
        // Try diagonal down
        const dir = Math.random() > 0.5 ? 1 : -1;
        if (below < this.height && x + dir >= 0 && x + dir < this.width && 
            this.canMoveInto(x + dir, below, mat.density)) {
            this.moveParticle(x, y, x + dir, below);
            return;
        }
        
        const otherDir = -dir;
        if (below < this.height && x + otherDir >= 0 && x + otherDir < this.width && 
            this.canMoveInto(x + otherDir, below, mat.density)) {
            this.moveParticle(x, y, x + otherDir, below);
        }
    }
    
    updateLiquid(p, x, y, mat) {
        const below = y + 1;
        
        // Try move down
        if (below < this.height && this.canMoveInto(x, below, mat.density)) {
            this.moveParticle(x, y, x, below);
            return;
        }
        
        // Try diagonal down
        const dir = Math.random() > 0.5 ? 1 : -1;
        if (below < this.height && x + dir >= 0 && x + dir < this.width && 
            this.canMoveInto(x + dir, below, mat.density)) {
            this.moveParticle(x, y, x + dir, below);
            return;
        }
        
        const otherDir = -dir;
        if (below < this.height && x + otherDir >= 0 && x + otherDir < this.width && 
            this.canMoveInto(x + otherDir, below, mat.density)) {
            this.moveParticle(x, y, x + otherDir, below);
            return;
        }
        
        // Flow sideways
        const flowDir = Math.random() > 0.5 ? 1 : -1;
        if (x + flowDir >= 0 && x + flowDir < this.width && 
            this.canMoveInto(x + flowDir, y, mat.density)) {
            this.moveParticle(x, y, x + flowDir

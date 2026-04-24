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
            this.moveParticle(x, y, x + flowDir, y);
            return;
        }
        
        const otherFlow = -flowDir;
        if (x + otherFlow >= 0 && x + otherFlow < this.width && 
            this.canMoveInto(x + otherFlow, y, mat.density)) {
            this.moveParticle(x, y, x + otherFlow, y);
        }
    }
    
    updateGas(p, x, y, mat) {
        const above = y - 1;
        
        // Try move up
        if (above >= 0 && this.canMoveInto(x, above, mat.density)) {
            this.moveParticle(x, y, x, above);
            return;
        }
        
        // Try diagonal up
        const dir = Math.random() > 0.5 ? 1 : -1;
        if (above >= 0 && x + dir >= 0 && x + dir < this.width && 
            this.canMoveInto(x + dir, above, mat.density)) {
            this.moveParticle(x, y, x + dir, above);
            return;
        }
        
        // Drift sideways
        if (x + dir >= 0 && x + dir < this.width && 
            this.canMoveInto(x + dir, y, mat.density)) {
            this.moveParticle(x, y, x + dir, y);
        }
    }
    
    moveParticle(fromX, fromY, toX, toY) {
        const p = this.getParticle(fromX, fromY);
        const target = this.getParticle(toX, toY);
        
        this.setParticle(toX, toY, p);
        this.setParticle(fromX, fromY, target);
        
        if (p) {
            p.x = toX;
            p.y = toY;
        }
        if (target) {
            target.x = fromX;
            target.y = fromY;
        }
    }
    
    handleReactions(p, x, y) {
        const neighbors = [
            this.getParticle(x, y - 1),
            this.getParticle(x, y + 1),
            this.getParticle(x - 1, y),
            this.getParticle(x + 1, y)
        ].filter(n => n !== null);
        
        for (const neighbor of neighbors) {
            this.react(p, neighbor, x, y);
        }
    }
    
    react(p, other, x, y) {
        // Fire + Wood = Fire spreads
        if (p.mat === 'fire' && other.mat === 'wood') {
            if (Math.random() < 0.1) {
                this.setParticle(other.x, other.y, new Particle('fire', other.x, other.y));
            }
        }
        
        // Fire + Oil = Big fire
        if (p.mat === 'fire' && other.mat === 'oil') {
            if (Math.random() < 0.3) {
                this.setParticle(other.x, other.y, new Particle('fire', other.x, other.y));
            }
        }
        
        // Fire + Plant = Fire
        if (p.mat === 'fire' && other.mat === 'plant') {
            if (Math.random() < 0.15) {
                this.setParticle(other.x, other.y, new Particle('fire', other.x, other.y));
            }
        }
        
        // Water + Fire = Steam
        if ((p.mat === 'water' && other.mat === 'fire') || (p.mat === 'fire' && other.mat === 'water')) {
            this.setParticle(x, y, new Particle('steam', x, y));
            this.setParticle(other.x, other.y, null);
            this.audio.playSteam();
        }
        
        // Water + Lava (not implemented but could add)
        
        // Acid + anything = dissolves
        if (p.mat === 'acid' && other.mat !== 'acid' && other.mat !== 'stone') {
            if (Math.random() < 0.05) {
                this.setParticle(other.x, other.y, null);
                if (Math.random() < 0.3) {
                    this.setParticle(x, y, null);
                }
            }
        }
        
        // Salt + Water = salt water (just visual mix for now)
        
        // Plant + Water = grows (simple)
        if (p.mat === 'plant' && other.mat === 'water') {
            const above = y - 1;
            if (above >= 0 && this.isEmpty(x, above) && Math.random() < 0.02) {
                this.setParticle(x, above, new Particle('plant', x, above));
            }
        }
    }
    
    clear() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = null;
        }
        this.audio.playClear();
    }
    
    updateUI() {
        document.getElementById('particle-count').textContent = this.particleCount;
    }
    
    loop() {
        this.frameCount++;
        
        const steps = this.simSpeed >= 1 ? Math.floor(this.simSpeed) : 1;
        for (let i = 0; i < steps; i++) {
            if (this.isRunning) this.update();
        }
        
        this.renderer.render();
        
        // FPS counter
        if (this.frameCount % 30 === 0) {
            const now = performance.now();
            if (this.lastTime) {
                const fps = Math.round(30000 / (now - this.lastTime));
                document.getElementById('fps').textContent = fps;
            }
            this.lastTime = now;
        }
        
        requestAnimationFrame(this.loop);
    }
}

// Start the game
window.addEventListener('load', () => {
    window.game = new SandboxGame();
});

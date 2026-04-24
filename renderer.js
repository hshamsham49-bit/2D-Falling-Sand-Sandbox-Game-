class Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.width = game.width;
        this.height = game.height;
        
        // Offscreen canvas for pixel manipulation
        this.offCanvas = document.createElement('canvas');
        this.offCanvas.width = this.width;
        this.offCanvas.height = this.height;
        this.offCtx = this.offCanvas.getContext('2d');
        this.imageData = this.offCtx.createImageData(this.width, this.height);
        this.pixels = this.imageData.data;
    }
    
    render() {
        const grid = this.game.grid;
        const pixels = this.pixels;
        
        for (let i = 0; i < grid.length; i++) {
            const p = grid[i];
            const idx = i * 4;
            
            if (p) {
                const mat = MATERIALS[p.mat];
                const color = this.hexToRgb(mat.color);
                
                // Add slight variation for texture
                const variation = (Math.random() - 0.5) * 20;
                
                pixels[idx] = Math.max(0, Math.min(255, color.r + variation));
                pixels[idx + 1] = Math.max(0, Math.min(255, color.g + variation));
                pixels[idx + 2] = Math.max(0, Math.min(255, color.b + variation));
                pixels[idx + 3] = 255;
            } else {
                pixels[idx] = 15;
                pixels[idx + 1] = 15;
                pixels[idx + 2] = 26;
                pixels[idx + 3] = 255;
            }
        }
        
        this.offCtx.putImageData(this.imageData, 0, 0);
        
        // Scale up to main canvas
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.ctx.drawImage(this.offCanvas, 0, 0, this.width, this.height);
    }
    
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    }
}

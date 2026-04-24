class InputHandler {
    constructor(game) {
        this.game = game;
        this.isDrawing = false;
        this.setupListeners();
    }
    
    setupListeners() {
        const canvas = this.game.canvas;
        
        canvas.addEventListener('mousedown', (e) => {
            this.isDrawing = true;
            this.draw(e);
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (this.isDrawing) this.draw(e);
        });
        
        canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
        });
        
        canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
        });
        
        // Touch support
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.isDrawing = true;
            this.draw(e.touches[0]);
        });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.isDrawing) this.draw(e.touches[0]);
        });
        
        canvas.addEventListener('touchend', () => {
            this.isDrawing = false;
        });
    }
    
    draw(e) {
        const rect = this.game.canvas.getBoundingClientRect();
        const scaleX = this.game.canvas.width / rect.width;
        const scaleY = this.game.canvas.height / rect.height;
        
        const x = Math.floor((e.clientX - rect.left) * scaleX);
        const y = Math.floor((e.clientY - rect.top) * scaleY);
        
        this.game.spawnParticles(x, y, this.game.currentMaterial, this.game.brushSize);
    }
}

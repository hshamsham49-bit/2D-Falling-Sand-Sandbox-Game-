class AudioManager {
    constructor() {
        this.enabled = true;
        this.ctx = null;
    }
    
    getContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.ctx;
    }
    
    playTone(freq, duration, type = 'sine') {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio not supported
        }
    }
    
    playPlace() {
        this.playTone(400 + Math.random() * 200, 0.05, 'sine');
    }
    
    playClear() {
        this.playTone(200, 0.3, 'sawtooth');
    }
    
    playSteam() {
        this.playTone(800, 0.1, 'triangle');
    }
}class AudioManager {
    constructor() {
        this.enabled = true;
        this.ctx = null;
    }
    
    getContext() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return this.ctx;
    }
    
    playTone(freq, duration, type = 'sine') {
        if (!this.enabled) return;
        try {
            const ctx = this.getContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = type;
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio not supported
        }
    }
    
    playPlace() {
        this.playTone(400 + Math.random() * 200, 0.05, 'sine');
    }
    
    playClear() {
        this.playTone(200, 0.3, 'sawtooth');
    }
    
    playSteam() {
        this.playTone(800, 0.1, 'triangle');
    }
}

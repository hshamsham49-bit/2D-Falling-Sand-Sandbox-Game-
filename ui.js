document.addEventListener('DOMContentLoaded', () => {
    // Material buttons
    const matButtons = document.querySelectorAll('.mat-btn');
    matButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            matButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (window.game) {
                window.game.currentMaterial = btn.dataset.mat;
            }
        });
    });
    
    // Brush size
    const brushSlider = document.getElementById('brush-size');
    const brushVal = document.getElementById('brush-val');
    brushSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        brushVal.textContent = val;
        if (window.game) window.game.brushSize = parseInt(val);
    });
    
    // Clear button
    document.getElementById('clear-btn').addEventListener('click', () => {
        if (window.game) window.game.clear();
    });
    
    // Pause button
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.addEventListener('click', () => {
        if (window.game) {
            window.game.isRunning = !window.game.isRunning;
            pauseBtn.textContent = window.game.isRunning ? '⏸️ Pause' : '▶️ Resume';
        }
    });
    
    // Settings modal
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettings = document.getElementById('close-settings');
    
    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('hidden');
    });
    
    closeSettings.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });
    
    // Settings controls
    document.getElementById('show-fps').addEventListener('change', (e) => {
        document.querySelector('.stats').style.display = e.target.checked ? 'flex' : 'none';
    });
    
    document.getElementById('sound-enabled').addEventListener('change', (e) => {
        if (window.game && window.game.audio) {
            window.game.audio.enabled = e.target.checked;
        }
    });
    
    document.getElementById('sim-speed').addEventListener('change', (e) => {
        if (window.game) window.game.simSpeed = parseFloat(e.target.value);
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            if (window.game) {
                window.game.isRunning = !window.game.isRunning;
                pauseBtn.textContent = window.game.isRunning ? '⏸️ Pause' : '▶️ Resume';
            }
        }
        if (e.key === 'c' || e.key === 'C') {
            if (window.game) window.game.clear();
        }
    });
});

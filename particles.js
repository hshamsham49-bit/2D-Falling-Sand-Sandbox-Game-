const MATERIALS = {
    empty: { id: 0, color: '#0f0f1a', density: 0 },
    sand: { id: 1, color: '#e6c288', density: 10, type: 'powder' },
    water: { id: 2, color: '#4fa4f4', density: 5, type: 'liquid' },
    fire: { id: 3, color: '#ff6b35', density: 1, type: 'gas', life: 30 },
    stone: { id: 4, color: '#7a7a7a', density: 20, type: 'solid' },
    wood: { id: 5, color: '#8b6914', density: 15, type: 'solid' },
    steam: { id: 6, color: '#cccccc', density: 0.5, type: 'gas', life: 60 },
    oil: { id: 7, color: '#3d2817', density: 4, type: 'liquid' },
    plant: { id: 8, color: '#228b22', density: 12, type: 'solid' },
    acid: { id: 9, color: '#39ff14', density: 6, type: 'liquid' },
    salt: { id: 10, color: '#f5f5f5', density: 9, type: 'powder' },
    ember: { id: 11, color: '#ff4500', density: 2, type: 'gas', life: 20 }
};

class Particle {
    constructor(material, x, y) {
        this.mat = material;
        this.x = x;
        this.y = y;
        this.life = MATERIALS[material].life || -1;
        this.updated = false;
        this.vx = 0;
        this.vy = 0;
    }
}

const getMatId = (name) => MATERIALS[name]?.id || 0;
const getMatById = (id) => Object.values(MATERIALS).find(m => m.id === id);

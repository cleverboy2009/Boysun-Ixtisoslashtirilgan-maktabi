/**
 * iOS 26 Advanced Liquid Effects - Pure JavaScript
 * GPU-accelerated liquid glass animations without WebAssembly
 */

class iOS26LiquidEngine {
    constructor() {
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.mouseX = 0;
        this.mouseY = 0;

        this.init();
    }

    init() {
        // Create canvas for liquid ripple effects
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'liquid-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9999;
            mix-blend-mode: screen;
        `;
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createRipple(x, y, intensity = 1) {
        const particleCount = Math.floor(30 * intensity);

        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 100 + Math.random() * 50;

            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                size: 20 + Math.random() * 30,
                hue: 210 + Math.random() * 60, // Blue to purple
                alpha: 0.6 * intensity
            });
        }
    }

    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // Update position
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;

            // Apply drag
            p.vx *= 0.98;
            p.vy *= 0.98;

            // Decay
            p.life -= deltaTime * 1.2;
            p.alpha = p.life * 0.6;
            p.size += deltaTime * 40;

            // Remove dead particles
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(p => {
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            gradient.addColorStop(0, `hsla(${p.hue}, 80%, 60%, ${p.alpha})`);
            gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, ${p.alpha * 0.5})`);
            gradient.addColorStop(1, `hsla(${p.hue}, 60%, 40%, 0)`);

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.canvas.style.display = 'none';
        this.isRunning = false;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.canvas.style.display = 'block';
            this.animate();
        }
    }

    animate(currentTime = 0) {
        if (!this.isRunning) return;
        const deltaTime = Math.min((currentTime - (this.lastTime || currentTime)) / 1000, 0.1);
        this.lastTime = currentTime;

        this.updateParticles(deltaTime);
        this.render();

        this.animationFrame = requestAnimationFrame((t) => this.animate(t));
    }
}

// Initialize liquid engine
document.addEventListener('DOMContentLoaded', () => {
    window.iOS26LiquidEngineInstance = new iOS26LiquidEngine();
    window.iOS26LiquidEngineInstance.isRunning = true;

    // Auto-stop if 3D is disabled initially
    if (typeof window.is3DEnabled === 'function' && !window.is3DEnabled()) {
        window.iOS26LiquidEngineInstance.stop();
    }

    // Add ripple effects to interactive elements
    document.querySelectorAll('.nav-link, .btn, .glass-card').forEach(el => {
        el.addEventListener('click', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX || rect.left + rect.width / 2;
            const y = e.clientY || rect.top + rect.height / 2;
            window.iOS26LiquidEngineInstance.createRipple(x, y, 1.5);
        });
    });
});

// Export for external use
window.iOS26Liquid = {
    createRipple: (x, y, intensity) => {
        if (window.iOS26LiquidEngineInstance) {
            window.iOS26LiquidEngineInstance.createRipple(x, y, intensity);
        }
    }
};

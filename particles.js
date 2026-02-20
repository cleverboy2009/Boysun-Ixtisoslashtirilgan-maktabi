/**
 * HYPERMODE PARTICLES ENGINE
 * A lightweight, high-performance particle mesh system.
 * Creates a living network of nodes and connections.
 */

(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'hyper-particles';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Configuration
    const config = {
        particleCount: 80,
        connectionDistance: 150,
        mouseDistance: 200,
        color: '0, 242, 255', // Neon Blue
        speed: 1.5
    };

    // Resize Handler
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * config.speed;
            this.vy = (Math.random() - 0.5) * config.speed;
            this.size = Math.random() * 2 + 1;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${config.color}, 0.5)`;
            ctx.fill();
        }
    }

    // Initialize
    for (let i = 0; i < config.particleCount; i++) {
        particles.push(new Particle());
    }

    // Mouse Interaction
    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and Draw Particles
        for (let i = 0; i < particles.length; i++) {
            let p = particles[i];
            p.update();
            p.draw();

            // Connections within range
            for (let j = i + 1; j < particles.length; j++) {
                let q = particles[j];
                const dx = p.x - q.x;
                const dy = p.y - q.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < config.connectionDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${config.color}, ${1 - dist / config.connectionDistance})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }

            // Mouse Connections
            if (mouse.x) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < config.mouseDistance) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${config.color}, ${1 - dist / config.mouseDistance})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    // Start
    animate();

    // CSS Injection for Canvas
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        pointer-events: none;
        opacity: 0.4;
    `;
})();

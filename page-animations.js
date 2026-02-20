// Page Animations - Theme Toggle Only
// Navigation is handled by page-loader.js

// Theme Toggle with Animation
function toggleThemeWithAnimation(x, y) {
    const isLight = document.body.classList.contains('light-mode');
    const bg = isLight ? '#0f172a' : '#f8fafc';
    const circle = document.createElement('div');
    circle.style.cssText = `position: fixed; left: ${x}px; top: ${y}px; width: 0; height: 0; border-radius: 50%; background: ${bg}; transform: translate(-50%, -50%); z-index: 99999; pointer-events: none;`;
    document.body.appendChild(circle);
    const maxRadius = Math.max(window.innerWidth, window.innerHeight) * 1.5;
    const anim = circle.animate(
        [{ width: '0px', height: '0px' }, { width: `${maxRadius * 2}px`, height: `${maxRadius * 2}px` }],
        { duration: 500, easing: 'ease-in-out', fill: 'forwards' }
    );
    anim.onfinish = () => {
        if (isLight) document.body.classList.remove('light-mode');
        else document.body.classList.add('light-mode');
        localStorage.setItem('theme', isLight ? 'dark' : 'light');
        circle.remove();
    };
}

// Apply theme toggle animation to existing theme buttons
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle') || document.querySelector('.theme-toggle');
    if (themeBtn && !themeBtn.onclick) {
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const rect = themeBtn.getBoundingClientRect();
            toggleThemeWithAnimation(rect.left + rect.width / 2, rect.top + rect.height / 2);
        });
    }
});

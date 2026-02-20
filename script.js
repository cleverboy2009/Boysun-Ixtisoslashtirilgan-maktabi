/**
 * Boysun IM Website - iOS 26 Liquid Glass Effects
 * Advanced interactivity with fluid animations and depth
 */


// ============================================
// UTILITY FUNCTIONS
// ============================================

// Spring easing function (iOS-like)
const springEasing = (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 :
        Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
};

// Smooth easing (Apple's default)
const smoothEasing = (t) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

// ============================================
// MAIN INITIALIZATION
// ============================================

// Mobile Bottom Navigation
function initMobileNav() {
    if (window.innerWidth <= 768) {
        // Force cleanup of any existing nav to ensure a fresh render
        const existingNavs = document.querySelectorAll('.mobile-bottom-nav');
        existingNavs.forEach(nav => nav.remove());

        const nav = document.createElement('div');
        nav.className = 'mobile-bottom-nav';
        nav.style.display = 'flex'; // Ensure it's never hidden by other logic
        nav.id = 'mobileBottomNav';

        const href = window.location.href.toLowerCase();

        // Detect specific pages robustly
        const isUpdates = href.includes('updates.html');
        const isContact = href.includes('contact.html');
        const isSpecialPage = isUpdates || isContact;

        if (isSpecialPage) {
            // Only 'Bosh Sahifa' button for these pages as per user request
            nav.innerHTML = `
                <a href="index.html" class="mobile-nav-item active" style="flex: 1; gap: 12px; font-weight: 800; color: var(--primary) !important;">
                    <i class="fas fa-home" style="font-size: 1.8rem;"></i> 
                    <span style="font-size: 1.1rem; text-transform: uppercase;">Bosh Sahifaga Qaytish</span>
                </a>
            `;
            console.log("📱 Special Bottom Nav: Home Only");
        } else {
            // Full navigation for other pages
            const isHome = href.endsWith('index.html') || href.endsWith('/') || (!href.includes('.html') && href.length < 50);
            const isAchievements = href.includes('achievements.html');
            const isTeachers = href.includes('teachers.html');
            const isAdmission = href.includes('admission.html');

            nav.innerHTML = `
                <a href="index.html" class="mobile-nav-item ${isHome ? 'active' : ''}">
                    <i class="fas fa-home"></i> <span>Bosh</span>
                </a>
                <a href="achievements.html" class="mobile-nav-item ${isAchievements ? 'active' : ''}">
                    <i class="fas fa-trophy"></i> <span>Yutuq</span>
                </a>
                <a href="teachers.html" class="mobile-nav-item ${isTeachers ? 'active' : ''}">
                    <i class="fas fa-chalkboard-teacher"></i> <span>Ustoz</span>
                </a>
                <a href="admission.html" class="mobile-nav-item ${isAdmission ? 'active' : ''}">
                    <i class="fas fa-user-plus"></i> <span>Qabul</span>
                </a>
                <a href="contact.html" class="mobile-nav-item">
                    <i class="fas fa-envelope"></i> <span>Aloqa</span>
                </a>
            `;
            console.log("📱 Full Bottom Nav: All Items including Yutuqlar");
        }
        document.body.appendChild(nav);
    } else {
        const existingNav = document.querySelector('.mobile-bottom-nav');
        if (existingNav) existingNav.remove();
    }
}

// Run on load and resize
window.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    // Re-check after a small delay to handle dynamic content or slow loading
    setTimeout(initMobileNav, 500);
});
window.addEventListener('resize', initMobileNav);

document.addEventListener('DOMContentLoaded', () => {
    console.log('🍎 iOS 26 Liquid Glass Effects Loaded');

    // Initialize all features
    initThemeToggle();
    initPerfToggle();
    initMobileMenu();
    initScrollEffects();
    initAdminAuth();
    initCosmicEffects(); // NEW: Cosmic Animations
    init3DCardEffects(); // NEW: 3D Tilt

    // Log current state
    logCurrentState();
});

// ============================================
// COSMIC EFFECTS (Scroll, Magnetic, Loader)
// ============================================

function initCosmicEffects() {
    // 1. Scroll Reveal
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.glass-card, .section-title, .feature-icon, .btn');
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1)';
        observer.observe(el);
    });

    // Add visible class style dynamically if not in CSS
    const style = document.createElement('style');
    style.innerHTML = `
        .visible {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Magnetic Buttons
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0) scale(1)';
        });
    });

    // 3. Preloader Simulation (Cosmic Fade)
    const overlay = document.createElement('div');
    overlay.className = 'cosmic-loader';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: #050510; z-index: 99999;
        display: flex; align-items: center; justify-content: center;
        transition: opacity 0.8s ease;
    `;
    overlay.innerHTML = '<div style="color: #00f2ff; font-family: serif; font-size: 2rem;">Boysun IM</div>';
    document.body.appendChild(overlay);

    window.addEventListener('load', () => {
        setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 800);
        }, 500);
    });

    console.log('🌌 Cosmic Effects Initialized');
}

// ============================================
// MOBILE HAMBURGER MENU
// ============================================

function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Create overlay if it doesn't exist
    let overlay = document.querySelector('.menu-overlay');
    if (!overlay && window.innerWidth <= 768) {
        overlay = document.createElement('div');
        overlay.className = 'menu-overlay';
        document.body.appendChild(overlay);
    }

    if (!mobileToggle || !navLinks) return;

    const toggleMenu = (forceClose = false) => {
        const isActive = forceClose ? false : !navLinks.classList.contains('active');

        if (isActive) {
            navLinks.classList.add('active');
            mobileToggle.classList.add('active');
            if (overlay) overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Icon animation
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
            document.body.style.overflow = '';

            // Icon animation
            const icon = mobileToggle.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    };

    // Toggle menu on click
    mobileToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking overlay
    if (overlay) {
        overlay.addEventListener('click', () => toggleMenu(true));
    }

    // Close menu when clicking on a link
    const links = navLinks.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.addEventListener('click', () => toggleMenu(true));
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') &&
            !navLinks.contains(e.target) &&
            !mobileToggle.contains(e.target)) {
            toggleMenu(true);
        }
    });

    console.log('✅ Mobile menu initialized with overlay and enhanced z-index');

    // Safety check: ensure mobile toggle is visible on mobile
    if (window.innerWidth <= 768) {
        mobileToggle.style.display = 'flex';
        mobileToggle.style.visibility = 'visible';
        mobileToggle.style.opacity = '1';
        mobileToggle.style.zIndex = '10005';
    }
}

// ============================================
// PERFORMANCE MODE TOGGLE
// ============================================

function initPerfToggle() {
    const perfToggle = document.querySelector('.perf-toggle');
    const body = document.body;

    if (!perfToggle) return;

    const icon = perfToggle.querySelector('i');

    // Detect mobile for auto-stability
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;

    // Load saved preference or auto-enable on mobile
    let isPerfMode;
    const savedPreference = localStorage.getItem('isPerfMode');

    if (savedPreference !== null) {
        isPerfMode = savedPreference === 'true';
    } else {
        isPerfMode = isMobile; // Auto-enable on mobile
        localStorage.setItem('isPerfMode', isPerfMode);
    }

    if (isPerfMode) {
        body.classList.add('perf-mode');
        if (icon) {
            icon.classList.remove('fa-bolt');
            icon.classList.add('fa-tachometer-alt');
        }
    }

    perfToggle.addEventListener('click', () => {
        const active = body.classList.toggle('perf-mode');
        localStorage.setItem('isPerfMode', active);

        if (icon) {
            if (active) {
                icon.classList.remove('fa-bolt');
                icon.classList.add('fa-tachometer-alt');
            } else {
                icon.classList.remove('fa-tachometer-alt');
                icon.classList.add('fa-bolt');
            }

            // Subtle rotation
            icon.style.transform = 'rotate(360deg)';
            setTimeout(() => icon.style.transform = '', 400);
        }

        createRippleEffect(perfToggle);
    });

    console.log('✅ Performance toggle initialized');
}

// ============================================
// THEME TOGGLE (Light/Dark Mode)
// ============================================

function initThemeToggle() {
    const themeToggles = document.querySelectorAll('.theme-toggle');
    const body = document.body;

    if (themeToggles.length === 0) return;

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-mode');
        updateIcons(true);
    } else {
        updateIcons(false);
    }

    // Helper to update all icons
    function updateIcons(isLight) {
        themeToggles.forEach(btn => {
            const icon = btn.querySelector('i');
            if (icon) {
                if (isLight) {
                    icon.classList.remove('fa-sun');
                    icon.classList.add('fa-moon');
                } else {
                    icon.classList.remove('fa-moon');
                    icon.classList.add('fa-sun');
                }
                // Reset transform/animation
                icon.style.transform = 'rotate(0deg) scale(1)';
            }
        });
    }

    // Attach event listeners to all buttons
    themeToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default if it's a link

            // Add transition class
            body.style.transition = 'background-color 0.6s cubic-bezier(0.2, 0.8, 0.2, 1), color 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';

            body.classList.toggle('light-mode');
            const isLight = body.classList.contains('light-mode');

            // Save preference
            localStorage.setItem('theme', isLight ? 'light' : 'dark');

            // Animate all icons
            themeToggles.forEach(btn => {
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.style.transform = 'rotate(360deg) scale(0.8)';
                }
            });

            // Update icons after delay for animation
            setTimeout(() => {
                updateIcons(isLight);
            }, 300);

            // Create ripple effect
            createRippleEffect(toggle);

            // Remove transition after animation
            setTimeout(() => {
                body.style.transition = '';
            }, 600);
        });
    });

    console.log(`✅ Theme toggle initialized (${themeToggles.length} buttons)`);
}

// ============================================
// 3D EFFECTS TOGGLE
// ============================================

function init3DToggle() {
    const threeDToggle = document.querySelector('.three-d-toggle');

    if (!threeDToggle) return;

    const icon = threeDToggle.querySelector('i');

    // Detect mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth <= 768;

    // Load saved preference or auto-disable on mobile
    let is3DEnabled;
    const savedPreference = localStorage.getItem('is3DEnabled');

    if (savedPreference !== null) {
        is3DEnabled = savedPreference === 'true';
    } else {
        is3DEnabled = !isMobile;
        localStorage.setItem('is3DEnabled', is3DEnabled);
    }

    // Update UI
    update3DIcon();

    // Toggle on click
    threeDToggle.addEventListener('click', () => {
        is3DEnabled = !is3DEnabled;
        localStorage.setItem('is3DEnabled', is3DEnabled);
        update3DIcon();

        // Animate icon
        icon.style.transform = 'rotate(180deg) scale(0.8)';
        setTimeout(() => {
            icon.style.transform = 'rotate(0deg) scale(1)';
        }, 300);

        // Create ripple effect
        createRippleEffect(threeDToggle);

        // Reset all 3D transforms if disabled
        if (!is3DEnabled) {
            document.querySelectorAll('.glass-card, .menu-card, .btn').forEach(el => {
                el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        }
    });

    function update3DIcon() {
        if (is3DEnabled) {
            icon.classList.remove('fa-ban');
            icon.classList.add('fa-cube');
            threeDToggle.style.opacity = '1';
            threeDToggle.setAttribute('aria-label', 'Disable 3D Effects');
            document.body.classList.remove('static-mode');

            // Sync with Liquid Glass Effects
            if (window.iOS26LiquidEngineInstance) {
                window.iOS26LiquidEngineInstance.start();
            }
        } else {
            icon.classList.remove('fa-cube');
            icon.classList.add('fa-ban');
            threeDToggle.style.opacity = '0.7';
            threeDToggle.setAttribute('aria-label', 'Enable 3D Effects');
            document.body.classList.add('static-mode');

            // Sync with Liquid Glass Effects
            if (window.iOS26LiquidEngineInstance) {
                window.iOS26LiquidEngineInstance.stop();
            }
        }
    }

    // Expose to global scope for card effects
    window.is3DEnabled = () => is3DEnabled;

    console.log('✅ 3D toggle initialized:', is3DEnabled ? 'enabled' : 'disabled');
}

// ============================================
// MOBILE MENU
// ============================================

// The initMobileMenu is already defined above, removing this duplicate simplicity version
// to prevent conflicts and ensure consistent behavior with the overlay and body freezing.
console.log('Using unified initMobileMenu with overlay');

// ============================================
// SCROLL EFFECTS
// ============================================

function initScrollEffects() {
    const header = document.querySelector('.header');

    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 20) {
            header.classList.add('scrolled');

            // Add extra blur on scroll
            header.style.backdropFilter = 'blur(60px) saturate(200%)';
        } else {
            header.classList.remove('scrolled');
            header.style.backdropFilter = 'blur(50px) saturate(180%)';
        }

        lastScroll = currentScroll;
    });

    console.log('✅ Scroll effects initialized');
}

// ============================================
// 3D CARD TILT EFFECTS
// ============================================

function init3DCardEffects() {
    const cards = document.querySelectorAll('.glass-card, .feature-card, .news-card, .menu-card, .btn');

    cards.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            // Check if 3D is enabled
            if (typeof window.is3DEnabled === 'function' && !window.is3DEnabled()) {
                return;
            }

            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (max 10deg for subtle effect)
            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            // Apply 3D transform with spring physics
            this.style.transform = `
                perspective(1000px) 
                rotateX(${rotateX}deg) 
                rotateY(${rotateY}deg) 
                scale3d(1.02, 1.02, 1.02)
                translateZ(10px)
            `;

            // Add dynamic shine based on cursor position
            const shine = this.querySelector('.glass-card::before, .feature-card::before');
            if (shine) {
                const shineX = (x / rect.width) * 100;
                const shineY = (y / rect.height) * 100;
                this.style.setProperty('--shine-x', `${shineX}%`);
                this.style.setProperty('--shine-y', `${shineY}%`);
            }
        });

        card.addEventListener('mouseleave', function () {
            // Smooth return to original position
            this.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1) translateZ(0)';

            setTimeout(() => {
                this.style.transition = '';
            }, 600);
        });
    });

    console.log('✅ 3D card effects initialized');
}

// ============================================
// BACKGROUND PARALLAX
// ============================================

function initBackgroundParallax() {
    const blobContainer = document.querySelector('.blob-container');

    if (!blobContainer) return;

    let ticking = false;

    window.addEventListener('mousemove', (e) => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const mouseX = e.clientX / window.innerWidth;
                const mouseY = e.clientY / window.innerHeight;

                // Move container with parallax
                const moveX = (mouseX - 0.5) * 30;
                const moveY = (mouseY - 0.5) * 30;

                blobContainer.style.transform = `translate(${moveX}px, ${moveY}px)`;

                ticking = false;
            });

            ticking = true;
        }
    });

    console.log('✅ Background parallax initialized');
}

// ============================================
// RIPPLE EFFECT (iOS 26 Style)
// ============================================

function createRippleEffect(element, event) {
    const ripple = document.createElement('div');

    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);

    // Position at click point or center
    let x, y;
    if (event) {
        x = event.clientX - rect.left - size / 2;
        y = event.clientY - rect.top - size / 2;
    } else {
        x = rect.width / 2 - size / 2;
        y = rect.height / 2 - size / 2;
    }

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.6), transparent 70%);
        top: ${y}px;
        left: ${x}px;
        pointer-events: none;
        transform: scale(0);
        opacity: 1;
        animation: ripple-animation 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
        z-index: 1000;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);

    // Remove after animation
    setTimeout(() => {
        ripple.remove();
    }, 800);
}

// Add ripple animation to stylesheet
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple-animation {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2.5);
            opacity: 0;
        }
    }
    
    /* Smooth icon transitions */
    .theme-toggle i,
    .three-d-toggle i {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    
    /* Enhanced menu link positioning */
    .nav-link {
        z-index: 1;
        overflow: hidden;
    }
    
    /* Active state for menu */
    .nav-link.active .liquid-bg {
        opacity: 1 !important;
        transform: scale(1) !important;
        filter: blur(0px) !important;
    }
`;
document.head.appendChild(style);

// ============================================
// DEBUG & LOGGING
// ============================================

function logCurrentState() {
    console.log('📊 Current State:');
    console.log('  Theme:', document.body.classList.contains('light-mode') ? 'Light' : 'Dark');
    console.log('  3D Effects:', localStorage.getItem('is3DEnabled') === 'true' ? 'Enabled' : 'Disabled');
    console.log('  Performance Mode:', document.body.classList.contains('static-mode') ? 'On' : 'Off');
}

// ============================================
// ADMIN AUTHENTICATION
// ============================================

function initAdminAuth() {
    const adminBtn = document.querySelector('.admin-access-btn');
    if (!adminBtn) return;

    adminBtn.addEventListener('click', () => {
        // Create dynamic iOS-style login modal
        const modal = document.createElement('div');
        modal.className = 'admin-modal-overlay';
        modal.innerHTML = `
            <div class="admin-modal glass-card">
                <h3><i class="fas fa-shield-alt"></i> Admin Login</h3>
                <div class="input-group">
                    <label>Login</label>
                    <input type="text" id="admin-login" placeholder="Kiriting...">
                </div>
                <div class="input-group">
                    <label>Parol</label>
                    <input type="password" id="admin-password" placeholder="Kiriting...">
                </div>
                <div class="modal-actions">
                    <button class="btn btn-secondary" id="modal-cancel">Bekor qilish</button>
                    <button class="btn btn-primary" id="modal-login">Kirish</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Styles for modal
        const style = document.createElement('style');
        style.id = 'admin-modal-styles';
        style.textContent = `
            .admin-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.4);
                backdrop-filter: blur(8px);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                animation: fadeIn 0.3s ease;
            }
            .admin-modal {
                width: 100%;
                max-width: 400px;
                padding: 2rem;
                display: flex;
                flex-direction: column;
                gap: 1.5rem;
                animation: slideUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            }
            .admin-modal h3 { text-align: center; font-size: 1.5rem; color: var(--accent-color); }
            .input-group { display: flex; flex-direction: column; gap: 0.5rem; }
            .input-group label { font-size: 0.9rem; color: var(--text-light); }
            .input-group input {
                padding: 12px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: var(--white);
                outline: none;
                transition: border-color 0.3s;
            }
            .input-group input:focus { border-color: var(--accent-color); }
            .modal-actions { display: flex; gap: 1rem; margin-top: 1rem; }
            .modal-actions button { flex: 1; }
            
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            
            body.light-mode .input-group input {
                background: rgba(0, 0, 0, 0.05);
                border-color: rgba(0, 0, 0, 0.1);
                color: var(--primary-color);
            }
        `;
        document.head.appendChild(style);

        // Modal Logic
        const closeBtn = modal.querySelector('#modal-cancel');
        const loginBtn = modal.querySelector('#modal-login');
        const loginInp = modal.querySelector('#admin-login');
        const passInp = modal.querySelector('#admin-password');

        const closeModal = () => {
            modal.remove();
            style.remove();
        };

        closeBtn.addEventListener('click', closeModal);

        loginBtn.addEventListener('click', async () => {
            const login = loginInp.value;
            const password = passInp.value;

            // Simple validation before sending to server
            if (login === 'boysun' && password === 'boysun2026.09') {
                try {
                    // Call backend to establish session
                    const response = await fetch('/api/admin/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ login, password })
                    });

                    if (response.ok) {
                        window.location.href = '/admin.html';
                    } else {
                        const err = await response.json();
                        alert(err.error || 'Xatolik yuz berdi');
                    }
                } catch (e) {
                    // Fallback for development/static testing: redirect if server isn't running
                    window.location.href = 'admin.html';
                }
            } else {
                alert('Login yoki parol noto\'g\'ri!');
            }
        });
    });
}

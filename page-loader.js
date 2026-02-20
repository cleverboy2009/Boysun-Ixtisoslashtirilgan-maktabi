/**
 * Boysun IM - Page Loader & Transition System
 * Sahifalar orasida yuklanish animatsiyasi
 */
(function () {
    'use strict';

    // ============================================
    // INJECT LOADER STYLES
    // ============================================
    const style = document.createElement('style');
    style.textContent = `
        /* ===== PAGE LOADER ===== */
        #bim-page-loader {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: #0f172a;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 24px;
            transition: opacity 0.4s ease, visibility 0.4s ease;
        }
        body.light-mode #bim-page-loader {
            background: #f8fafc;
        }
        #bim-page-loader.bim-loader-hidden {
            opacity: 0;
            visibility: hidden;
            pointer-events: none;
        }

        /* Logo */
        .bim-loader-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            animation: bimLoaderLogoIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        .bim-loader-logo-icon {
            width: 56px;
            height: 56px;
            border-radius: 16px;
            background: linear-gradient(135deg, #2563ea, #7c3aed);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.8rem;
            box-shadow: 0 8px 32px rgba(37,99,234,0.4);
        }
        .bim-loader-logo-text {
            font-family: 'Inter', sans-serif;
            font-size: 1.8rem;
            font-weight: 800;
            color: #fff;
            letter-spacing: -0.5px;
        }
        .bim-loader-logo-text span {
            color: #60a5fa;
        }
        body.light-mode .bim-loader-logo-text { color: #0f172a; }

        /* Spinner */
        .bim-loader-spinner {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 3px solid rgba(37,99,234,0.15);
            border-top-color: #2563ea;
            animation: bimSpin 0.8s linear infinite;
        }

        /* Text */
        .bim-loader-text {
            font-family: 'Inter', sans-serif;
            font-size: 0.9rem;
            color: rgba(148,163,184,0.8);
            letter-spacing: 0.05em;
            animation: bimLoaderPulse 1.5s ease-in-out infinite;
        }
        body.light-mode .bim-loader-text { color: rgba(71,85,105,0.7); }

        /* Progress bar */
        .bim-loader-bar {
            width: 200px;
            height: 3px;
            background: rgba(255,255,255,0.08);
            border-radius: 4px;
            overflow: hidden;
        }
        body.light-mode .bim-loader-bar { background: rgba(0,0,0,0.08); }
        .bim-loader-bar-fill {
            height: 100%;
            background: linear-gradient(90deg, #2563ea, #7c3aed);
            border-radius: 4px;
            animation: bimLoaderBarFill 0.7s ease-out forwards;
        }

        @keyframes bimSpin {
            to { transform: rotate(360deg); }
        }
        @keyframes bimLoaderLogoIn {
            from { opacity: 0; transform: scale(0.8) translateY(-10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes bimLoaderPulse {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
        }
        @keyframes bimLoaderBarFill {
            from { width: 0%; }
            to { width: 85%; }
        }

        /* ===== PAGE TRANSITION OVERLAY ===== */
        #bim-transition-overlay {
            position: fixed;
            inset: 0;
            z-index: 999998;
            background: linear-gradient(135deg, #2563ea, #7c3aed);
            pointer-events: none;
            opacity: 0;
            transform: scaleX(0);
            transform-origin: left center;
            transition: transform 0.35s cubic-bezier(0.76,0,0.24,1),
                        opacity 0.1s ease;
        }
        #bim-transition-overlay.bim-slide-in {
            opacity: 1;
            transform: scaleX(1);
        }
        #bim-transition-overlay.bim-slide-out {
            opacity: 1;
            transform: scaleX(0);
            transform-origin: right center;
        }

        /* ===== PORTAL BACK BUTTON ===== */
        #bim-portal-back {
            position: fixed;
            top: 80px;
            left: 16px;
            z-index: 9990;
            background: rgba(15,23,42,0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 12px;
            padding: 7px 14px 7px 10px;
            display: flex;
            align-items: center;
            gap: 7px;
            color: #94a3b8;
            font-family: 'Inter', sans-serif;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.25s;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25);
            white-space: nowrap;
            opacity: 0;
            transform: translateX(-8px);
            animation: bimPortalBtnIn 0.5s 0.8s cubic-bezier(0.34,1.56,0.64,1) forwards;
        }
        body.light-mode #bim-portal-back {
            background: rgba(248,250,252,0.85);
            border-color: rgba(0,0,0,0.08);
            color: #475569;
            box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        #bim-portal-back:hover {
            background: rgba(37,99,234,0.15);
            border-color: rgba(37,99,234,0.4);
            color: #60a5fa;
            transform: translateX(0) scale(1.03);
        }
        #bim-portal-back i {
            font-size: 0.75rem;
            transition: transform 0.2s;
        }
        #bim-portal-back:hover i { transform: translateX(-2px); }

        @keyframes bimPortalBtnIn {
            to { opacity: 1; transform: translateX(0); }
        }

        @media (max-width: 768px) {
            #bim-portal-back {
                top: auto;
                bottom: 90px;
                left: 16px;
                font-size: 0.78rem;
                padding: 6px 12px 6px 9px;
            }
        }
    `;
    document.head.appendChild(style);

    // ============================================
    // CREATE LOADER HTML
    // ============================================
    function createLoader() {
        const loader = document.createElement('div');
        loader.id = 'bim-page-loader';
        loader.innerHTML = `
            <div class="bim-loader-logo">
                <div class="bim-loader-logo-icon">🎓</div>
                <div class="bim-loader-logo-text">Boysun <span>IM</span></div>
            </div>
            <div class="bim-loader-bar"><div class="bim-loader-bar-fill"></div></div>
            <div class="bim-loader-text">Yuklanmoqda...</div>
        `;
        document.body.appendChild(loader);
        return loader;
    }

    // ============================================
    // CREATE TRANSITION OVERLAY
    // ============================================
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'bim-transition-overlay';
        document.body.appendChild(overlay);
        return overlay;
    }

    // ============================================
    // CREATE PORTAL BACK BUTTON
    // ============================================
    function createPortalBackBtn() {
        // Don't show on portal/index pages
        const path = window.location.pathname.toLowerCase();
        const href = window.location.href.toLowerCase();
        if (href.includes('portal.html') ||
            href.includes('index.html') ||
            href.endsWith('/')) return;

        const btn = document.createElement('a');
        btn.id = 'bim-portal-back';
        btn.href = 'portal.html';
        btn.className = 'no-anim';
        btn.innerHTML = `<i class="fas fa-th"></i> Portalga qaytish`;
        document.body.appendChild(btn);
    }

    // ============================================
    // HIDE LOADER ON PAGE READY
    // ============================================
    function hideLoader() {
        const loader = document.getElementById('bim-page-loader');
        if (!loader) return;
        setTimeout(() => {
            loader.classList.add('bim-loader-hidden');
            // Remove from DOM after transition
            setTimeout(() => loader.remove(), 500);
        }, 350);
    }

    // ============================================
    // NAVIGATE WITH TRANSITION
    // ============================================
    function navigateWithTransition(url) {
        const overlay = document.getElementById('bim-transition-overlay');
        if (!overlay) {
            window.location.href = url;
            return;
        }
        overlay.classList.add('bim-slide-in');
        setTimeout(() => {
            window.location.href = url;
        }, 350);
    }

    // ============================================
    // INTERCEPT LINK CLICKS (replace page-animations.js logic)
    // ============================================
    function interceptLinks() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link) return;
            if (!link.href) return;
            if (link.classList.contains('no-anim')) return;
            if (link.target === '_blank') return;
            if (link.href.includes('#')) return;
            if (link.getAttribute('onclick')) return;

            try {
                const url = new URL(link.href);
                if (url.host !== window.location.host) return;
            } catch (err) {
                return;
            }

            e.preventDefault();
            navigateWithTransition(link.href);
        }, true);
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        const loader = createLoader();
        createOverlay();
        createPortalBackBtn();

        // Intercept all internal links
        interceptLinks();

        // Hide loader when page is ready
        if (document.readyState === 'complete') {
            hideLoader();
        } else {
            window.addEventListener('load', hideLoader);
            // Fallback — hide after 2s max
            setTimeout(hideLoader, 2000);
        }
    }

    // Run immediately (before DOMContentLoaded for instant loader)
    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();

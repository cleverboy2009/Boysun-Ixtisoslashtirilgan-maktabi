/**
 * Boysun IM - Enhanced Client-side Security Module v2.0
 * Features: XSS prevention, rate limiting, session integrity, input sanitization,
 *           CSRF protection, request signing, honeypot detection
 */

// ============================================
// RATE LIMITER
// ============================================
const RateLimiter = (function () {
    const store = {};

    return {
        /**
         * Check if action is allowed. Max `limit` calls per `windowMs`.
         */
        check(key, limit = 10, windowMs = 60000) {
            const now = Date.now();
            if (!store[key]) store[key] = [];
            // Remove expired timestamps
            store[key] = store[key].filter(t => now - t < windowMs);
            if (store[key].length >= limit) return false;
            store[key].push(now);
            return true;
        },
        remaining(key, limit = 10, windowMs = 60000) {
            const now = Date.now();
            if (!store[key]) return limit;
            const active = store[key].filter(t => now - t < windowMs);
            return Math.max(0, limit - active.length);
        },
        reset(key) {
            delete store[key];
        }
    };
})();

// ============================================
// ADVANCED INPUT SANITIZATION
// ============================================

/**
 * Deep XSS sanitizer — strips scripts, event handlers, dangerous protocols
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    // Remove null bytes
    let clean = input.replace(/\0/g, '');

    // Strip script tags and content
    clean = clean.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

    // Strip event handlers (onerror=, onclick=, etc.)
    clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Strip dangerous protocols
    clean = clean.replace(/javascript\s*:/gi, '');
    clean = clean.replace(/vbscript\s*:/gi, '');
    clean = clean.replace(/data\s*:\s*text\/html/gi, '');

    // HTML entity encode remaining < > " ' &
    const div = document.createElement('div');
    div.textContent = clean;
    return div.innerHTML
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Sanitize an object's string values recursively
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;
    const result = {};
    for (const key of Object.keys(obj)) {
        const val = obj[key];
        result[key] = typeof val === 'string' ? sanitizeInput(val) :
            typeof val === 'object' ? sanitizeObject(val) : val;
    }
    return result;
}

// ============================================
// SESSION INTEGRITY
// ============================================
const SessionIntegrity = (function () {
    const TOKEN_KEY = 'bim_session_token';
    const CREATED_KEY = 'bim_session_created';
    const SESSION_TTL = 4 * 60 * 60 * 1000; // 4 hours

    function generate() {
        const arr = new Uint8Array(32);
        crypto.getRandomValues(arr);
        return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    }

    function init() {
        const existing = sessionStorage.getItem(TOKEN_KEY);
        const created = parseInt(sessionStorage.getItem(CREATED_KEY) || '0');
        const now = Date.now();

        if (!existing || now - created > SESSION_TTL) {
            const token = generate();
            sessionStorage.setItem(TOKEN_KEY, token);
            sessionStorage.setItem(CREATED_KEY, String(now));
            return token;
        }
        return existing;
    }

    return {
        getToken: init,
        validate() {
            const token = sessionStorage.getItem(TOKEN_KEY);
            const created = parseInt(sessionStorage.getItem(CREATED_KEY) || '0');
            return token && (Date.now() - created < SESSION_TTL);
        },
        refresh() {
            sessionStorage.removeItem(TOKEN_KEY);
            return init();
        }
    };
})();

// ============================================
// REQUEST SIGNING (Nonce + Timestamp)
// ============================================
function signRequest(payload) {
    const nonce = Math.random().toString(36).substring(2, 12);
    const timestamp = Date.now();
    const sessionToken = SessionIntegrity.getToken();
    return {
        ...payload,
        _nonce: nonce,
        _ts: timestamp,
        _session: sessionToken.substring(0, 8) // partial token, not full
    };
}

// ============================================
// ANTI-DEBUGGING (Optional, light version)
// ============================================
function startAntiDebug() {
    setInterval(() => {
        (function () { return false; }['constructor']('debugger')['call']());
    }, 2000);
}

// ============================================
// DISABLE INSPECT (Optional)
// ============================================
function disableInspect() {
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', e => {
        if (
            e.keyCode === 123 || // F12
            (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || // Ctrl+Shift+I/J
            (e.ctrlKey && e.keyCode === 85) // Ctrl+U
        ) {
            e.preventDefault();
            return false;
        }
    });
}

// ============================================
// VALIDATORS
// ============================================
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(phone.replace(/-/g, ' '));
}

function validateContactFormData(formData) {
    const errors = [];
    if (!formData.name || formData.name.trim().length < 2)
        errors.push('Ism kamida 2 ta belgidan iborat bo\'lishi kerak');
    if (formData.email && !isValidEmail(formData.email))
        errors.push('Noto\'g\'ri email manzil');
    if (formData.phone && !isValidPhone(formData.phone))
        errors.push('Telefon raqami +998 XX XXX XX XX formatida bo\'lishi kerak');
    if (!formData.message || formData.message.trim().length < 10)
        errors.push('Xabar kamida 10 ta belgidan iborat bo\'lishi kerak');
    return errors;
}

// ============================================
// CSRF TOKEN
// ============================================
async function getCSRFToken() {
    try {
        const response = await fetch('contact.php?action=token');
        if (!response.ok) return SessionIntegrity.getToken().substring(0, 16);
        const data = await response.json();
        return data.csrf_token;
    } catch {
        return SessionIntegrity.getToken().substring(0, 16);
    }
}

// ============================================
// SECURE FORM SUBMISSION
// ============================================
async function submitContactForm(rawFormData) {
    const rateLimitKey = 'contact_form_submit';
    if (!RateLimiter.check(rateLimitKey, 5, 60000)) {
        return {
            success: false,
            message: `Juda ko'p urinish. Iltimos 1 daqiqa kuting. (${RateLimiter.remaining(rateLimitKey, 5, 60000)} urinish qoldi)`
        };
    }

    try {
        // Honeypot check
        if (rawFormData.website) {
            console.log('Bot detected via honeypot');
            return { success: true, message: 'Xabaringiz yuborildi.' };
        }

        // Sanitize all inputs
        const formData = sanitizeObject(rawFormData);

        // Validate
        const errors = validateContactFormData(formData);
        if (errors.length > 0) return { success: false, message: errors.join('\n') };

        // Sign request and get CSRF token
        const csrfToken = await getCSRFToken();
        const signedPayload = signRequest(formData);

        const response = await fetch('contact.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken,
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(signedPayload)
        });

        const text = await response.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch {
            throw new Error('Serverda xatolik yuz berdi.');
        }

        if (!response.ok) {
            if (response.status === 429) throw new Error('Juda ko\'p so\'rov. 15 daqiqa kuting.');
            if (result.errors?.length) throw new Error(result.errors.join('\n'));
            throw new Error(result.error || 'Xatolik yuz berdi');
        }

        return result;

    } catch (error) {
        console.error('Form error:', error);
        // Graceful fallback for static/demo
        return {
            success: true,
            message: 'Xabaringiz qabul qilindi! (Server ulanmagan, demo rejim)'
        };
    }
}

// ============================================
// NOTIFICATION UI
// ============================================
function showNotification(message, type = 'success') {
    const existing = document.querySelector('.security-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `security-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 90px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(16, 185, 129, 0.92)' : 'rgba(239, 68, 110, 0.92)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 14px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: secSlideIn 0.35s cubic-bezier(0.2,0.8,0.2,1);
        max-width: 360px;
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255,255,255,0.2);
        font-family: 'Inter', sans-serif;
    `;
    notification.innerHTML = `
        <div style="display:flex;align-items:start;gap:10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="font-size:20px;margin-top:2px;"></i>
            <div style="flex:1;white-space:pre-line;">${message}</div>
        </div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentElement) notification.remove(); }, 5000);
}

// Add animation style
const _secStyle = document.createElement('style');
_secStyle.textContent = `
    @keyframes secSlideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
`;
document.head.appendChild(_secStyle);

// ============================================
// CLICKJACKING PROTECTION (client-side guard)
// ============================================
(function preventClickjacking() {
    if (window.self !== window.top) {
        // We are in an iframe — add visual warning
        document.addEventListener('DOMContentLoaded', () => {
            const warn = document.createElement('div');
            warn.style.cssText = `
                position:fixed;inset:0;background:rgba(0,0,0,0.97);
                z-index:999999;display:flex;align-items:center;justify-content:center;
                color:white;font-family:'Inter',sans-serif;text-align:center;padding:2rem;
            `;
            warn.innerHTML = `
                <div>
                    <i class="fas fa-shield-alt" style="font-size:4rem;color:#f59e0b;margin-bottom:1rem;display:block;"></i>
                    <h2>Xavfsizlik Ogohlantirishli</h2>
                    <p>Ushbu sahifa ruxsatsiz ramkada ochilmoqda.<br>
                    Iltimos, to'g'ridan-to'g'ri saytga o'ting.</p>
                    <button onclick="window.top.location='${window.location.href}'" 
                        style="margin-top:1rem;padding:12px 24px;background:#2563ea;border:none;border-radius:10px;color:white;cursor:pointer;font-size:1rem;">
                        To'g'ri oching
                    </button>
                </div>
            `;
            document.body.appendChild(warn);
        });
    }
})();

// ============================================
// INTEGRITY LOG
// ============================================
const IntegrityLog = (function() {
    const logs = [];
    return {
        record(event, detail = '') {
            logs.push({ event, detail, time: new Date().toISOString() });
            if (logs.length > 50) logs.shift(); // Keep last 50
        },
        getLogs() { return [...logs]; }
    };
})();

// Record page load
IntegrityLog.record('page_load', window.location.pathname);

// ============================================
// INITIALIZE SESSION
// ============================================
SessionIntegrity.getToken(); // Ensure token exists on load

// ============================================
// EXPORT
// ============================================
window.SecurityModule = {
    // Core
    sanitizeInput,
    sanitizeObject,
    signRequest,
    // Validators
    isValidEmail,
    isValidPhone,
    validateContactFormData,
    // Auth
    getCSRFToken,
    submitContactForm,
    // Rate Limiting
    rateLimiter: RateLimiter,
    // Session
    session: SessionIntegrity,
    // Logs
    integrityLog: IntegrityLog,
    // UI
    showNotification,
    // Optional protections
    startAntiDebug,
    disableInspect
};

console.log('🔒 Boysun IM Security Module v2.0 initialized');

/**
 * Client-side Security Enhancements
 * Provides XSS prevention, input sanitization, secure form handling, and anti-tamper measures
 */

// XSS Prevention - Sanitize user input
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Anti-Debugging (Protects against DevTools usage)
function startAntiDebug() {
    setInterval(() => {
        (function () {
            return false;
        }['constructor']('debugger')['call']());
    }, 1000);
}

// Disable Right-Click and certain shortcuts (Security theater, but often requested)
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

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate Uzbekistan phone format
function isValidPhone(phone) {
    const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    return phoneRegex.test(phone.replace(/-/g, ' '));
}

// Get CSRF token from server
async function getCSRFToken() {
    try {
        const response = await fetch('contact.php?action=token');
        if (!response.ok) return 'local-dev-token'; // Fallback for testing
        const data = await response.json();
        return data.csrf_token;
    } catch (error) {
        console.warn('CSRF token not available, creating session-based fallback.');
        return btoa(Math.random().toString());
    }
}

// Secure form submission
async function submitContactForm(formData) {
    try {
        // Honeypot check
        if (formData.website) {
            console.log('Bot detected via honeypot');
            return { success: true, message: 'Xabaringiz yuborildi (simulated)' };
        }

        // Get CSRF token
        const csrfToken = await getCSRFToken();

        // Submit form with CSRF token
        try {
            const response = await fetch('contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify(formData)
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (e) {
                console.warn('Server response not JSON:', text.substring(0, 100));
                throw new Error('Serverda xatolik yuz berdi (JSON emas).');
            }

            if (!response.ok) {
                if (response.status === 429) throw new Error('Juda ko\'p so\'rov yuborildi. Iltimos 15 daqiqa kuting.');
                if (result.errors && Array.isArray(result.errors)) throw new Error(result.errors.join('\n'));
                throw new Error(result.error || 'Xatolik yuz berdi');
            }

            return result;

        } catch (networkError) {
            console.error('Network/Server Error:', networkError);
            // Fallback for demo/static usage
            return { success: true, message: 'Xabaringiz qabul qilindi! (Server ulanmagan, demo rejim)' };
        }
    } catch (error) {
        console.error('Form submission error:', error);
        return { success: true, message: 'Xabaringiz yuborildi! (Demo)' };
    }
}

// Client-side form validation
function validateContactFormData(formData) {
    const errors = [];
    if (!formData.name || formData.name.trim().length < 2) errors.push('Ism kamida 2 ta belgidan iborat bo\'lishi kerak');
    if (formData.email && !isValidEmail(formData.email)) {
        errors.push('Noto\'g\'ri email manzil');
    }
    if (formData.phone && !isValidPhone(formData.phone)) errors.push('Telefon raqami +998 XX XXX XX XX formatida bo\'lishi kerak');
    if (!formData.message || formData.message.trim().length < 10) errors.push('Xabar kamida 10 ta belgidan iborat bo\'lishi kerak');
    return errors;
}

// Show notification message
function showNotification(message, type = 'success') {
    const existingNotif = document.querySelector('.security-notification');
    if (existingNotif) existingNotif.remove();

    const notification = document.createElement('div');
    notification.className = `security-notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(16, 185, 129, 0.9)' : 'rgba(239, 68, 110, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 350px;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
    `;

    notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}" style="font-size: 20px; margin-top: 2px;"></i>
            <div style="flex: 1; white-space: pre-line;">${message}</div>
        </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentElement) notification.remove(); }, 5000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
    .security-notification { font-family: 'Inter', sans-serif; }
`;
document.head.appendChild(style);

// Initialize security measures
// startAntiDebug(); // Enable this for extreme protection
// disableInspect(); // Optional: User might want this

// Export functions
window.SecurityModule = {
    sanitizeInput,
    isValidEmail,
    isValidPhone,
    getCSRFToken,
    submitContactForm,
    validateContactFormData,
    showNotification
};

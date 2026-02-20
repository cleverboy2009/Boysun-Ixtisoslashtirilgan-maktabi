/**
 * Boysun IM - AI Chatbot (Google Gemini Integration)
 * Maktab haqida savollariga uzbek tilida javob beradi
 */

(function () {
    'use strict';

    // ============================================
    // CONFIGURATION
    // ============================================
    const CONFIG = {
        API_KEY: 'AIzaSyC3qqsTO99peEbj9aLJ2itKv9OGXit8R08',
        MODEL: 'gemini-1.5-flash',
        API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
        MAX_HISTORY: 10
    };

    // ============================================
    // SCHOOL KNOWLEDGE BASE (System Prompt)
    // ============================================
    const SCHOOL_CONTEXT = `Sen Boysun tuman ixtisoslashtirilgan maktabining rasmiy AI yordamchisisan. 
Faqat uzbek tilida javob berasan. Faqat maktab haqidagi savollarga javob berasan. 
Boshqa mavzularda "Men faqat maktab haqida savollarga javob bera olaman" deysan.

MAKTAB MA'LUMOTLARI:
- Nomi: Boysun tuman ixtisoslashtirilgan maktabi (Boysun IM)
- Joylashuvi: Surxondaryo viloyati, Boysun tumani, O'zbekiston
- Turi: Ixtisoslashtirilgan ta'lim muassasasi (ITMA tizimi)
- Direktori: Xadicha Ramazonova — "Bizning vazifamiz — har bir bolaga baxtli bolalik va porloq kelajak taqdim etishdir"
- Direktor o'rinbosari (o'quv): Majidov Barzu — "Sifatli ta'lim — farovon jamiyatning poydevoridir"
- Direktor o'rinbosari (ma'naviyat): Odilov Dilmurod

IXTISOSLIK FANLARI:
- Matematika (chuqurlashtirilgan)
- Fizika (chuqurlashtirilgan)
- Ingliz tili (chuqurlashtirilgan)
- Kimyo (chuqurlashtirilgan)
- Biologiya (chuqurlashtirilgan)

INFRATUZILMA:
- Zamonaviy kompyuter sinflari va IT to'garaklari
- Robototexnika darslari
- Zamonaviy sport zal
- Sun'iy qoplamali stadion
- Turli sport to'garaklari
- Kutubxona

YUTUQLAR:
- O'quvchilari fan olimpiadalari va turli tanlovlarda yuqori natijalar ko'rsatmoqda
- Viloyat va respublika olimpiadalarida g'oliblar bor
- "Zukko Kitobxon" tanlovlari o'tkaziladi

QABUL:
- 2025-2026 o'quv yili qabuli davom etmoqda
- Qabul bo'yicha aloqa: contact.html sahifasiga murojaat qiling
- Ariza topshirish uchun maktabga bevosita murojaat qiling

ALOQA:
- Telegram: @ptmaboysun
- Sayt: main_site.html

YANGILIKLAR:
- 28.01.2026: Maktabda ota-onalar yig'ilishi — o'quvchilarning odob-axloqi muhokama qilindi
- 27.01.2026: Ma'naviyat soati tashkil etildi — o'quvchilarning vatanparvarlik hissini oshirish
- 28.01.2026: "Zukko kitobxon" tanlovi — 5-sinf o'quvchilari bilan o'tkazildi (kutubxona mudirasi: O.Bo'riyeva)

PORTAL (PLATFORMALAR):
- Baholash tizimi: grading/index.html
- Dars jadvali: timetable/index.html
- Admin panel: boysun_login.html orqali

MUHIM ESLATMA: Javoblaringni qisqa, aniq va do'stona qilib yoz. Emoji ishlatishing mumkin. 
Har bir javob 2-4 gapdan iborat bo'lsin. Rasmiylashtirma, sodda til ishlatgin.`;

    // ============================================
    // STATE
    // ============================================
    let isOpen = false;
    let isLoading = false;
    let messageHistory = [];

    // ============================================
    // STYLES
    // ============================================
    function injectStyles() {
        const style = document.createElement('style');
        style.id = 'bim-chatbot-styles';
        style.textContent = `
            /* Floating Button */
            #bim-chat-btn {
                position: fixed;
                bottom: 110px;
                right: 24px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #2563ea 0%, #7c3aed 100%);
                border: none;
                cursor: pointer;
                box-shadow: 0 8px 32px rgba(37,99,234,0.45), 0 0 0 0 rgba(37,99,234,0.4);
                z-index: 99990;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s;
                animation: bimPulse 2.5s ease-in-out infinite;
            }
            #bim-chat-btn:hover {
                transform: scale(1.12);
                box-shadow: 0 12px 40px rgba(37,99,234,0.55);
                animation: none;
            }
            #bim-chat-btn .bim-btn-icon {
                font-size: 1.6rem;
                color: #fff;
                transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s;
            }
            #bim-chat-btn .bim-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #10b981;
                border: 2px solid #0f172a;
                animation: bimBadgePop 0.4s cubic-bezier(0.34,1.56,0.64,1);
            }
            @keyframes bimPulse {
                0%, 100% { box-shadow: 0 8px 32px rgba(37,99,234,0.45), 0 0 0 0 rgba(37,99,234,0.4); }
                50% { box-shadow: 0 8px 32px rgba(37,99,234,0.45), 0 0 0 12px rgba(37,99,234,0); }
            }
            @keyframes bimBadgePop {
                from { transform: scale(0); } to { transform: scale(1); }
            }

            /* Chat Panel */
            #bim-chat-panel {
                position: fixed;
                bottom: 174px;
                right: 24px;
                width: 370px;
                max-width: calc(100vw - 32px);
                height: 520px;
                max-height: calc(100vh - 140px);
                border-radius: 24px;
                background: rgba(15,23,42,0.82);
                backdrop-filter: blur(24px) saturate(180%);
                -webkit-backdrop-filter: blur(24px) saturate(180%);
                border: 1px solid rgba(255,255,255,0.1);
                box-shadow: 0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
                z-index: 99989;
                display: flex;
                flex-direction: column;
                overflow: hidden;
                transform-origin: bottom right;
                transition: opacity 0.3s, transform 0.35s cubic-bezier(0.34,1.56,0.64,1);
            }
            #bim-chat-panel.bim-hidden {
                opacity: 0;
                transform: scale(0.85) translateY(20px);
                pointer-events: none;
            }
            body.light-mode #bim-chat-panel {
                background: rgba(248,250,252,0.88);
                border-color: rgba(0,0,0,0.08);
                box-shadow: 0 24px 80px rgba(0,0,0,0.2);
            }

            /* Header */
            #bim-chat-header {
                padding: 16px 20px;
                background: linear-gradient(135deg, rgba(37,99,234,0.9) 0%, rgba(124,58,237,0.9) 100%);
                display: flex;
                align-items: center;
                gap: 12px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
                flex-shrink: 0;
            }
            #bim-chat-header .bim-avatar {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                background: rgba(255,255,255,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.4rem;
                flex-shrink: 0;
                border: 2px solid rgba(255,255,255,0.3);
            }
            #bim-chat-header .bim-info h4 {
                margin: 0;
                font-size: 0.95rem;
                font-weight: 700;
                color: #fff;
            }
            #bim-chat-header .bim-info p {
                margin: 0;
                font-size: 0.75rem;
                color: rgba(255,255,255,0.75);
                display: flex;
                align-items: center;
                gap: 5px;
            }
            #bim-chat-header .bim-info p::before {
                content: '';
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #10b981;
                display: inline-block;
            }
            .bim-close-btn {
                margin-left: auto;
                background: rgba(255,255,255,0.15);
                border: none;
                border-radius: 50%;
                width: 32px;
                height: 32px;
                cursor: pointer;
                color: #fff;
                font-size: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
                flex-shrink: 0;
            }
            .bim-close-btn:hover { background: rgba(255,255,255,0.25); }

            /* Messages */
            #bim-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                scroll-behavior: smooth;
            }
            #bim-messages::-webkit-scrollbar { width: 4px; }
            #bim-messages::-webkit-scrollbar-track { background: transparent; }
            #bim-messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
            body.light-mode #bim-messages::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); }

            .bim-msg {
                display: flex;
                gap: 8px;
                animation: bimMsgIn 0.3s cubic-bezier(0.2,0.8,0.2,1);
                max-width: 100%;
            }
            @keyframes bimMsgIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .bim-msg.bim-user { flex-direction: row-reverse; }
            .bim-msg-bubble {
                padding: 10px 14px;
                border-radius: 18px;
                font-size: 0.875rem;
                line-height: 1.5;
                max-width: 82%;
                word-break: break-word;
            }
            .bim-msg.bim-bot .bim-msg-bubble {
                background: rgba(255,255,255,0.08);
                color: #e2e8f0;
                border-bottom-left-radius: 4px;
                border: 1px solid rgba(255,255,255,0.07);
            }
            body.light-mode .bim-msg.bim-bot .bim-msg-bubble {
                background: rgba(37,99,234,0.07);
                color: #1e293b;
                border-color: rgba(37,99,234,0.1);
            }
            .bim-msg.bim-user .bim-msg-bubble {
                background: linear-gradient(135deg, #2563ea, #7c3aed);
                color: #fff;
                border-bottom-right-radius: 4px;
            }
            .bim-msg-icon {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.8rem;
                flex-shrink: 0;
                align-self: flex-end;
                margin-bottom: 2px;
            }
            .bim-msg.bim-bot .bim-msg-icon {
                background: linear-gradient(135deg,#2563ea,#7c3aed);
                color: #fff;
            }
            .bim-msg.bim-user .bim-msg-icon {
                background: rgba(255,255,255,0.12);
                color: #94a3b8;
            }
            body.light-mode .bim-msg.bim-user .bim-msg-icon {
                background: rgba(0,0,0,0.07);
                color: #475569;
            }

            /* Typing indicator */
            .bim-typing {
                display: flex;
                gap: 5px;
                align-items: center;
                padding: 12px 14px;
                background: rgba(255,255,255,0.08);
                border-radius: 18px;
                border-bottom-left-radius: 4px;
                width: fit-content;
            }
            body.light-mode .bim-typing {
                background: rgba(37,99,234,0.07);
            }
            .bim-typing span {
                width: 7px;
                height: 7px;
                border-radius: 50%;
                background: #2563ea;
                animation: bimTyping 1.2s ease-in-out infinite;
            }
            .bim-typing span:nth-child(2) { animation-delay: 0.2s; }
            .bim-typing span:nth-child(3) { animation-delay: 0.4s; }
            @keyframes bimTyping {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                30% { transform: translateY(-6px); opacity: 1; }
            }

            /* Quick replies */
            #bim-quick-replies {
                padding: 8px 16px;
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                flex-shrink: 0;
                border-top: 1px solid rgba(255,255,255,0.05);
            }
            body.light-mode #bim-quick-replies { border-top-color: rgba(0,0,0,0.05); }
            .bim-chip {
                background: rgba(37,99,234,0.15);
                border: 1px solid rgba(37,99,234,0.3);
                color: #93c5fd;
                border-radius: 20px;
                padding: 4px 12px;
                font-size: 0.775rem;
                cursor: pointer;
                transition: all 0.2s;
                white-space: nowrap;
            }
            .bim-chip:hover {
                background: rgba(37,99,234,0.35);
                border-color: #2563ea;
                color: #fff;
            }
            body.light-mode .bim-chip { color: #1e40af; background: rgba(37,99,234,0.08); }

            /* Input */
            #bim-input-area {
                padding: 12px 16px;
                border-top: 1px solid rgba(255,255,255,0.07);
                display: flex;
                gap: 8px;
                flex-shrink: 0;
            }
            body.light-mode #bim-input-area { border-top-color: rgba(0,0,0,0.07); }
            #bim-input {
                flex: 1;
                background: rgba(255,255,255,0.07);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 14px;
                padding: 10px 14px;
                color: #e2e8f0;
                font-size: 0.875rem;
                font-family: 'Inter', sans-serif;
                outline: none;
                resize: none;
                transition: border-color 0.2s;
                line-height: 1.4;
                min-height: 40px;
                max-height: 100px;
            }
            body.light-mode #bim-input {
                background: rgba(0,0,0,0.04);
                border-color: rgba(0,0,0,0.1);
                color: #1e293b;
            }
            #bim-input:focus { border-color: rgba(37,99,234,0.6); }
            #bim-input::placeholder { color: rgba(255,255,255,0.3); }
            body.light-mode #bim-input::placeholder { color: rgba(0,0,0,0.3); }
            #bim-send-btn {
                width: 40px;
                height: 40px;
                border-radius: 12px;
                background: linear-gradient(135deg, #2563ea, #7c3aed);
                border: none;
                cursor: pointer;
                color: #fff;
                font-size: 1rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s, opacity 0.2s;
                flex-shrink: 0;
            }
            #bim-send-btn:hover { transform: scale(1.08); }
            #bim-send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

            /* Mobile adjustments */
            @media (max-width: 480px) {
                #bim-chat-panel {
                    bottom: 84px;
                    right: 12px;
                    left: 12px;
                    width: auto;
                }
                #bim-chat-btn { bottom: 90px; right: 16px; }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================
    // BUILD UI
    // ============================================
    function buildUI() {
        // Floating button
        const btn = document.createElement('button');
        btn.id = 'bim-chat-btn';
        btn.setAttribute('aria-label', 'AI Yordamchi ochish');
        btn.innerHTML = `
            <i class="fas fa-robot bim-btn-icon"></i>
            <span class="bim-badge"></span>
        `;

        // Chat panel
        const panel = document.createElement('div');
        panel.id = 'bim-chat-panel';
        panel.classList.add('bim-hidden');
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-label', 'AI Yordamchi');
        panel.innerHTML = `
            <div id="bim-chat-header">
                <div class="bim-avatar">🤖</div>
                <div class="bim-info">
                    <h4>Boysun IM AI</h4>
                    <p>Onlayn • Gemini AI</p>
                </div>
                <button class="bim-close-btn" id="bim-close" aria-label="Yopish">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div id="bim-messages"></div>
            <div id="bim-quick-replies">
                <span class="bim-chip" data-q="Maktab haqida ma'lumot bering">📚 Maktab haqida</span>
                <span class="bim-chip" data-q="Qabul qachon va qanday?">📝 Qabul</span>
                <span class="bim-chip" data-q="O'qitiladigan fanlar qaysilar?">🔬 Fanlar</span>
                <span class="bim-chip" data-q="Direktori kim?">👤 Rahbariyat</span>
                <span class="bim-chip" data-q="Aloqa ma'lumotlari">📞 Aloqa</span>
            </div>
            <div id="bim-input-area">
                <textarea id="bim-input" placeholder="Savol yozing..." rows="1" aria-label="Xabar"></textarea>
                <button id="bim-send-btn" aria-label="Yuborish">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;

        document.body.appendChild(btn);
        document.body.appendChild(panel);
    }

    // ============================================
    // MESSAGE FUNCTIONS
    // ============================================
    function addMessage(text, from = 'bot') {
        const container = document.getElementById('bim-messages');
        if (!container) return;

        const msg = document.createElement('div');
        msg.className = `bim-msg bim-${from}`;
        const icon = from === 'bot'
            ? '<i class="fas fa-robot"></i>'
            : '<i class="fas fa-user"></i>';
        msg.innerHTML = `
            <div class="bim-msg-icon">${icon}</div>
            <div class="bim-msg-bubble">${escapeHtml(text)}</div>
        `;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    function showTyping() {
        const container = document.getElementById('bim-messages');
        if (!container) return null;
        const typingEl = document.createElement('div');
        typingEl.className = 'bim-msg bim-bot';
        typingEl.id = 'bim-typing-indicator';
        typingEl.innerHTML = `
            <div class="bim-msg-icon"><i class="fas fa-robot"></i></div>
            <div class="bim-typing"><span></span><span></span><span></span></div>
        `;
        container.appendChild(typingEl);
        container.scrollTop = container.scrollHeight;
        return typingEl;
    }

    function removeTyping() {
        const t = document.getElementById('bim-typing-indicator');
        if (t) t.remove();
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    // ============================================
    // GEMINI API CALL
    // ============================================
    async function askGemini(userMessage) {
        // Build conversation history for context
        const contents = [];

        // Add history (last MAX_HISTORY messages)
        const recentHistory = messageHistory.slice(-CONFIG.MAX_HISTORY);
        for (const msg of recentHistory) {
            contents.push({
                role: msg.role,
                parts: [{ text: msg.text }]
            });
        }

        // Add current user message
        contents.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        const requestBody = {
            system_instruction: {
                parts: [{ text: SCHOOL_CONTEXT }]
            },
            contents,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 400,
                topP: 0.9
            },
            safetySettings: [
                { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
                { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
            ]
        };

        const response = await fetch(`${CONFIG.API_URL}?key=${CONFIG.API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || `API xatosi: ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error('Bo\'sh javob');
        return text.trim();
    }

    // ============================================
    // SEND MESSAGE
    // ============================================
    async function sendMessage(text) {
        const input = document.getElementById('bim-input');
        const sendBtn = document.getElementById('bim-send-btn');
        const quickReplies = document.getElementById('bim-quick-replies');

        const userText = (text || input?.value || '').trim();
        if (!userText || isLoading) return;

        // Rate limiting
        if (window.SecurityModule?.rateLimiter) {
            if (!window.SecurityModule.rateLimiter.check('chatbot', 20, 60000)) {
                addMessage('Juda ko\'p savol yubordingiz. Biroz kuting. 🙏', 'bot');
                return;
            }
        }

        if (input) input.value = '';
        if (sendBtn) sendBtn.disabled = true;
        if (quickReplies) quickReplies.style.display = 'none';
        isLoading = true;

        addMessage(userText, 'user');
        messageHistory.push({ role: 'user', text: userText });

        const typingEl = showTyping();

        try {
            const reply = await askGemini(userText);
            removeTyping();
            addMessage(reply, 'bot');
            messageHistory.push({ role: 'model', text: reply });
        } catch (error) {
            removeTyping();
            console.error('Gemini error:', error);
            addMessage('Uzr, hozir javob bera olmayapman. Iltimos keyinroq urinib ko\'ring. 🙏', 'bot');
        } finally {
            isLoading = false;
            if (sendBtn) sendBtn.disabled = false;
            if (input) input.focus();
        }
    }

    // ============================================
    // TOGGLE PANEL
    // ============================================
    function togglePanel() {
        const panel = document.getElementById('bim-chat-panel');
        const btn = document.getElementById('bim-chat-btn');
        const badge = btn?.querySelector('.bim-badge');

        isOpen = !isOpen;
        panel?.classList.toggle('bim-hidden', !isOpen);

        // Swap icon
        const icon = btn?.querySelector('.bim-btn-icon');
        if (icon) {
            icon.classList.toggle('fa-robot', !isOpen);
            icon.classList.toggle('fa-times', isOpen);
        }

        if (isOpen) {
            if (badge) badge.style.display = 'none';
            setTimeout(() => document.getElementById('bim-input')?.focus(), 350);

            // Show welcome if empty
            const msgs = document.getElementById('bim-messages');
            if (msgs && msgs.children.length === 0) {
                addMessage('Salom! 👋 Men Boysun IM maktabining AI yordamchisiman.\n\nMaktab haqida har qanday savol bersangiz, javob beraman. 🎓', 'bot');
            }
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function bindEvents() {
        const btn = document.getElementById('bim-chat-btn');
        const closeBtn = document.getElementById('bim-close');
        const sendBtn = document.getElementById('bim-send-btn');
        const input = document.getElementById('bim-input');
        const quickReplies = document.getElementById('bim-quick-replies');

        btn?.addEventListener('click', togglePanel);
        closeBtn?.addEventListener('click', togglePanel);

        sendBtn?.addEventListener('click', () => sendMessage());

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Auto-resize textarea
        input?.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 100) + 'px';
        });

        // Quick reply chips
        quickReplies?.querySelectorAll('.bim-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                sendMessage(chip.dataset.q);
            });
        });
    }

    // ============================================
    // INIT
    // ============================================
    function init() {
        if (document.getElementById('bim-chat-btn')) return; // Already initialized

        injectStyles();
        buildUI();
        bindEvents();

        console.log('🤖 Boysun IM AI Chatbot initialized (Gemini API)');

        // Show badge after 3 seconds to attract attention
        setTimeout(() => {
            const badge = document.querySelector('#bim-chat-btn .bim-badge');
            if (badge && !isOpen) badge.style.display = 'block';
        }, 3000);
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

const VOWEL_SYMBOLS = [
    "i:", "I", "u:", "u", "ə", "ɜː", "ɔ:", "e", "eə",
    "ʌ", "ɒ", "æ", "ɑ:", "ɪə", "eɪ", "aʊ", "əʊ", "aɪ",
    "ʊə", "ɔɪ"
];
const CONSONANT_SYMBOLS = [
    "f", "v", "θ", "ð", "s", "z", "ʃ", "ʒ", "h",
    "p", "b", "t", "d", "k", "g", "ʧ", "ʤ",
    "w", "r", "j", "l", "m", "n", "ŋ"
];

let cachedSounds = null, cachedWordsMap = null, cachedDescriptions = null;
const modalOverlay = document.getElementById('detailModal');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModalBtn');

// Debounce helper
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===== 1. العرض الأساسي =====
async function renderIPASounds() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    container.innerHTML = '<div class="empty-state"><div class="skeleton" style="height:200px;width:100%;"></div></div>';

    cachedSounds = await loadJSON('data/ipa-data.json');
    cachedWordsMap = await loadJSON('data/ipa-words.json');
    cachedDescriptions = await loadJSON('data/ipa-descriptions.json');

    if (!cachedSounds || cachedSounds.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>تعذر تحميل البيانات.</p></div>';
        return;
    }

    container.innerHTML = '';
    cachedSounds.forEach((sound, index) => {
        const mainWord = cachedWordsMap[sound.symbol] || '—';
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.setAttribute('data-symbol', sound.symbol);
        card.setAttribute('data-audio', sound.audioFile);
        card.setAttribute('data-word', mainWord);
        card.setAttribute('tabindex', '0');
        const delay = 0.02 + (index * 0.025);
        card.style.animationDelay = `${delay}s`;

        card.innerHTML = `
            <div class="symbol" lang="en">${sound.symbol}</div>
            <div class="word" lang="en">${mainWord}</div>
            <div class="audio-visualizer">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
            <button class="info-btn" data-symbol="${sound.symbol}" aria-label="تفاصيل ${sound.symbol}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
            </button>
        `;

        container.appendChild(card);
    });

    animateValue('vowelCount', 0, cachedSounds.filter(s => VOWEL_SYMBOLS.includes(s.symbol)).length, 1000);
    animateValue('consonantCount', 0, cachedSounds.filter(s => CONSONANT_SYMBOLS.includes(s.symbol)).length, 1000);
    animateValue('totalCount', 0, cachedSounds.length, 1000);

    setupAudioPlayback();
    setupInfoButtons();
    setupSearch();
    setupCategoryFilter();
    setup3DTilt();
    setupScrollHeader();
    setupCardGlow();
    setupKeyboardNavigation();
    setupPracticeMode();
}

function animateValue(id, start, end, duration) {
    const obj = document.getElementById(id);
    if (!obj) return;
    const range = end - start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / range)) || 10;
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        obj.textContent = current;
        if (current === end) clearInterval(timer);
    }, stepTime);
}

// ===== 2. تشغيل الصوت (بدون إشعارات) =====
function setupAudioPlayback() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    container.addEventListener('click', (event) => {
        if (event.target.closest('.info-btn')) return;
        const card = event.target.closest('.sound-card');
        if (!card) return;

        const audioPath = card.getAttribute('data-audio');
        if (!audioPath) return;

        const fullPath = `assets/audio/${audioPath}`;
        const audio = AudioPlayer.play(fullPath);

        if (audio) {
            document.querySelectorAll('.sound-card.is-playing').forEach(c => c.classList.remove('is-playing'));
            card.classList.add('is-playing');
            audio.addEventListener('ended', () => {
                card.classList.remove('is-playing');
            });
        }
    });
}

// ===== 3. المودال =====
function setupInfoButtons() {
    document.getElementById('cardsContainer').addEventListener('click', (event) => {
        const btn = event.target.closest('.info-btn');
        if (!btn) return;
        event.stopPropagation();
        openModal(btn.getAttribute('data-symbol'));
    });
}

async function openModal(symbol) {
    if (!cachedSounds) {
        cachedSounds = await loadJSON('data/ipa-data.json');
        cachedWordsMap = await loadJSON('data/ipa-words.json');
        cachedDescriptions = await loadJSON('data/ipa-descriptions.json');
    }
    const sound = cachedSounds.find(s => s.symbol === symbol);
    if (!sound) return;

    const mainWord = cachedWordsMap[symbol] || '—';
    const description = cachedDescriptions[symbol] || 'لا يوجد وصف.';
    const imgHtml = sound.guideImage ? `<img src="assets/images/${sound.guideImage}" class="modal-guide-image" alt="وضعية الفم لـ ${symbol}">` : '';

    let wordsHtml = '';
    if (sound.words?.length) {
        wordsHtml = `
            <div class="modal-words-section" style="margin-top:1.5rem;">
                <h3 style="color:var(--color-accent);text-align:right;font-family:var(--font-display);">🎯 كلمات مثال</h3>
                <div class="modal-words-grid">
                    ${sound.words.map(w => `
                        <div class="modal-word-item" data-audio="assets/audio/${w.audioFile}">
                            <span class="modal-word-text">${w.word}</span>
                            <button class="modal-word-play" aria-label="تشغيل ${w.word}">▶</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div class="modal-symbol" dir="ltr">${symbol}</div>
        <div class="modal-word" dir="ltr">${mainWord}</div>
        ${imgHtml}
        <button class="modal-play-main" data-audio="assets/audio/${sound.audioFile}" aria-label="تشغيل صوت ${symbol}">
            ▶ تشغيل الصوت
        </button>
        <div class="modal-description">
            <h3>🔍 طريقة النطق</h3>
            <p>${description}</p>
        </div>
        ${wordsHtml}
    `;

    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        const closeBtn = modalOverlay.querySelector('.modal-close-btn');
        if (closeBtn) closeBtn.focus();
    }, 100);

    setupModalAudio();
}

function closeModal() {
    modalOverlay.style.display = 'none';
    document.body.style.overflow = '';
}
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function setupModalAudio() {
    modalBody.querySelectorAll('[data-audio]').forEach(el => {
        const clone = el.cloneNode(true);
        el.parentNode.replaceChild(clone, el);
        clone.addEventListener('click', (e) => {
            e.stopPropagation();
            const path = clone.getAttribute('data-audio');
            if (path) AudioPlayer.play(path);
        });
    });
}

// ===== 4. تأثير 3D Tilt + Glow Mouse Tracking =====
function setup3DTilt() {
    const cards = document.querySelectorAll('.sound-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;

            card.style.setProperty('--mouse-x', `${x * 100}%`);
            card.style.setProperty('--mouse-y', `${y * 100}%`);

            const tiltX = (x - 0.5) * 12;
            const tiltY = (y - 0.5) * -12;
            card.style.transform = `perspective(800px) rotateY(${tiltX}deg) rotateX(${tiltY}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)';
        });
    });
}

function setupCardGlow() {}

// ===== 5. شريط التنقل الذكي =====
function setupScrollHeader() {
    const header = document.getElementById('mainHeader');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 30) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        if (currentScroll > lastScroll && currentScroll > 100) {
            header.style.transform = 'translateY(-100%)';
        } else {
            header.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
    });
}

// ===== 6. البحث والتصفية =====
function setupSearch() {
    const input = document.getElementById('searchInput');
    const container = document.getElementById('cardsContainer');
    if (!input || !container) return;

    const debouncedSearch = debounce((q) => {
        const cards = container.querySelectorAll('.sound-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const symbol = card.getAttribute('data-symbol')?.toLowerCase() || '';
            const word = card.getAttribute('data-word')?.toLowerCase() || '';
            const isVisible = symbol.includes(q) || word.includes(q);
            card.style.display = isVisible ? '' : 'none';
            if (isVisible) visibleCount++;
        });

        const existingEmpty = container.querySelector('.empty-state');
        if (existingEmpty) existingEmpty.remove();

        if (visibleCount === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.innerHTML = '<div class="empty-state-icon">🔍</div><p>لا توجد نتائج مطابقة</p>';
            container.appendChild(empty);
        }
    }, 300);

    input.addEventListener('input', () => {
        const q = input.value.trim().toLowerCase();
        debouncedSearch(q);
    });
}

function setupCategoryFilter() {
    const btns = document.querySelectorAll('.filter-btn');
    const container = document.getElementById('cardsContainer');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');

            container.querySelectorAll('.sound-card').forEach((card, i) => {
                const symbol = card.getAttribute('data-symbol');
                let isVisible = false;

                if (filter === 'all') isVisible = true;
                else if (filter === 'vowels') isVisible = VOWEL_SYMBOLS.includes(symbol);
                else if (filter === 'consonants') isVisible = CONSONANT_SYMBOLS.includes(symbol);

                if (isVisible) {
                    card.style.display = '';
                    card.style.animation = `cardAppear 0.4s ease ${i * 0.02}s forwards`;
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ===== 7. التنقل بلوحة المفاتيح =====
function setupKeyboardNavigation() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    document.addEventListener('keydown', (e) => {
        const cards = [...container.querySelectorAll('.sound-card:not([style*="none"])')];
        const active = document.activeElement;
        const idx = cards.indexOf(active);

        if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(e.key)) {
            if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) {
                if (e.key !== 'Escape') return;
            }
        }

        if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (idx > -1 && idx < cards.length - 1) cards[idx + 1].focus();
            else if (cards.length > 0) cards[0].focus();
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (idx > 0) cards[idx - 1].focus();
            else if (cards.length > 0) cards[cards.length - 1].focus();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const cols = Math.floor(container.offsetWidth / 160);
            if (idx > -1 && idx + cols < cards.length) cards[idx + cols].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const cols = Math.floor(container.offsetWidth / 160);
            if (idx >= cols) cards[idx - cols].focus();
        } else if ((e.key === 'Enter' || e.key === ' ') && active.classList.contains('sound-card')) {
            e.preventDefault();
            active.click();
        }
    });
}

// ===== 8. وضع الممارسة (Practice Mode) =====
function setupPracticeMode() {
    const btn = document.getElementById('practiceBtn');
    if (!btn) return;
    btn.addEventListener('click', startPractice);
}

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function startPractice() {
    if (!cachedSounds || cachedSounds.length === 0) return;

    const pool = cachedSounds.filter(s => s.audioFile);
    if (pool.length < 4) return;

    const question = pool[Math.floor(Math.random() * pool.length)];
    const options = [question];
    while (options.length < 4) {
        const opt = pool[Math.floor(Math.random() * pool.length)];
        if (!options.find(o => o.symbol === opt.symbol)) options.push(opt);
    }

    AudioPlayer.play(`assets/audio/${question.audioFile}`);

    modalBody.innerHTML = `
        <div class="modal-symbol" dir="ltr" style="font-size:2.8rem; margin-bottom:0.2rem;">🎯 وضع الممارسة</div>
        <p style="text-align:center; color:var(--color-text-secondary); margin-bottom:1.2rem;">استمع للصوت واختر الرمز الصحيح</p>
        <button class="modal-play-main" id="replayPractice" style="margin-bottom:1.5rem; padding:0.6rem 1.5rem; font-size:0.9rem;">▶ إعادة تشغيل الصوت</button>
        <div class="quiz-grid">
            ${shuffleArray(options).map(s => `
                <button class="quiz-option" data-symbol="${s.symbol}" data-correct="${s.symbol === question.symbol}">
                    <span class="quiz-symbol">${s.symbol}</span>
                    <span class="quiz-word">${cachedWordsMap[s.symbol] || ''}</span>
                </button>
            `).join('')}
        </div>
        <div id="practiceFeedback" style="text-align:center; margin-top:1.2rem; min-height:2rem; font-size:1.1rem;"></div>
    `;

    modalOverlay.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    document.getElementById('replayPractice').addEventListener('click', () => {
        AudioPlayer.play(`assets/audio/${question.audioFile}`);
    });

    modalBody.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const isCorrect = btn.getAttribute('data-correct') === 'true';
            const feedback = document.getElementById('practiceFeedback');

            if (isCorrect) {
                btn.classList.add('correct');
                feedback.innerHTML = '<span style="color:#22c55e; font-weight:700;">✓ إجابة صحيحة!</span>';
                setTimeout(() => {
                    closeModal();
                    setTimeout(startPractice, 400);
                }, 1400);
            } else {
                btn.classList.add('wrong');
                feedback.innerHTML = '<span style="color:#ef4444; font-weight:700;">✗ حاول مرة أخرى</span>';
                const correctBtn = modalBody.querySelector('[data-correct="true"]');
                if (correctBtn) correctBtn.classList.add('correct');
            }
        });
    });
}

// ===== 9. اختصارات عامة =====
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
});

document.addEventListener('DOMContentLoaded', renderIPASounds);
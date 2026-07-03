/**
 * SPELLINGS
 * ---------
 * التهجئات الشائعة (Spelling Patterns) لكل رمز IPA.
 * تُعرض داخل نافذة التفاصيل عند الضغط على زر ℹ️.
 */
const SPELLINGS = {
    "i:": [
        { pattern: "ee", examples: "see, green, meet" },
        { pattern: "ea", examples: "eat, teacher, team" },
        { pattern: "e", examples: "he, she, me" },
        { pattern: "ie", examples: "field, piece, chief" },
        { pattern: "ei", examples: "receive, ceiling" },
        { pattern: "ey", examples: "key" },
        { pattern: "y", examples: "happy, baby, city" }
    ],
    "I": [
        { pattern: "i", examples: "sit, fish, big" },
        { pattern: "y", examples: "gym, myth, system" },
        { pattern: "e", examples: "pretty, England" },
        { pattern: "ui", examples: "build, guilt" },
        { pattern: "u", examples: "busy, business" }
    ],
    "e": [
        { pattern: "e", examples: "bed, pen, red" },
        { pattern: "ea", examples: "head, bread, heavy" },
        { pattern: "a", examples: "many, any" },
        { pattern: "ai", examples: "said" },
        { pattern: "ie", examples: "friend" }
    ],
    "æ": [
        { pattern: "a", examples: "cat, map, black" },
        { pattern: "ai", examples: "plaid" },
        { pattern: "au", examples: "laugh" }
    ],
    "ɑ:": [
        { pattern: "ar", examples: "car, park, hard" },
        { pattern: "a", examples: "father, drama" },
        { pattern: "ear", examples: "heart" },
        { pattern: "al", examples: "calm, palm, half" }
    ],
    "ɒ": [
        { pattern: "o", examples: "hot, dog, box" },
        { pattern: "a", examples: "wash, want, watch" }
    ],
    "ɔ:": [
        { pattern: "or", examples: "fork, short, sport" },
        { pattern: "ore", examples: "more, before" },
        { pattern: "aw", examples: "saw, draw" },
        { pattern: "au", examples: "author, August" },
        { pattern: "oor", examples: "door, floor" },
        { pattern: "our", examples: "four" },
        { pattern: "a", examples: "all, call, wall" },
        { pattern: "al", examples: "walk, talk, chalk" }
    ],
    "u": [
        { pattern: "oo", examples: "book, look, foot" },
        { pattern: "u", examples: "put, push, pull" },
        { pattern: "oul", examples: "could, should, would" }
    ],
    "u:": [
        { pattern: "oo", examples: "food, moon, school" },
        { pattern: "u-e", examples: "rule, June" },
        { pattern: "ue", examples: "blue, true" },
        { pattern: "ew", examples: "new, few, grew" },
        { pattern: "ou", examples: "group, soup" },
        { pattern: "ui", examples: "fruit, juice" },
        { pattern: "oe", examples: "shoe" },
        { pattern: "o", examples: "do, who, move" }
    ],
    "ʌ": [
        { pattern: "u", examples: "cup, sun, run" },
        { pattern: "o", examples: "love, come, money" },
        { pattern: "oo", examples: "blood, flood" },
        { pattern: "ou", examples: "young, touch, enough" }
    ],
    "ɜː": [
        { pattern: "ir", examples: "bird, first, shirt" },
        { pattern: "er", examples: "her, term, person" },
        { pattern: "ur", examples: "turn, burn, nurse" },
        { pattern: "ear", examples: "learn, earth, heard" },
        { pattern: "or", examples: "word, work, world" }
    ],
    "ə": [
        { pattern: "a", examples: "about, ago" },
        { pattern: "e", examples: "problem, taken" },
        { pattern: "i", examples: "pencil, possible" },
        { pattern: "o", examples: "doctor, memory" },
        { pattern: "u", examples: "supply, support" },
        { pattern: "er", examples: "teacher, father" },
        { pattern: "or", examples: "actor" },
        { pattern: "ar", examples: "dollar" },
        { pattern: "our", examples: "colour" }
    ],
    "eɪ": [
        { pattern: "a-e", examples: "make, name" },
        { pattern: "ai", examples: "rain, train" },
        { pattern: "ay", examples: "day, play" },
        { pattern: "ea", examples: "break, steak" },
        { pattern: "ei", examples: "eight, vein" },
        { pattern: "ey", examples: "they, obey" }
    ],
    "aɪ": [
        { pattern: "i-e", examples: "time, like" },
        { pattern: "igh", examples: "night, light" },
        { pattern: "y", examples: "my, fly" },
        { pattern: "ie", examples: "pie, tie" },
        { pattern: "i", examples: "find, kind" },
        { pattern: "uy", examples: "buy, guy" }
    ],
    "ɔɪ": [
        { pattern: "oi", examples: "coin, join" },
        { pattern: "oy", examples: "boy, toy" }
    ],
    "aʊ": [
        { pattern: "ou", examples: "house, mouth" },
        { pattern: "ow", examples: "cow, town" }
    ],
    "əʊ": [
        { pattern: "o-e", examples: "home, nose" },
        { pattern: "oa", examples: "boat, road" },
        { pattern: "ow", examples: "snow, know" },
        { pattern: "oe", examples: "toe" },
        { pattern: "o", examples: "go, open" },
        { pattern: "ou", examples: "soul, shoulder" }
    ],
    "ɪə": [
        { pattern: "ear", examples: "near, hear" },
        { pattern: "eer", examples: "deer, cheer" },
        { pattern: "ere", examples: "here, severe" }
    ],
    "eə": [
        { pattern: "air", examples: "fair, chair" },
        { pattern: "are", examples: "care, share" },
        { pattern: "ear", examples: "bear, wear" },
        { pattern: "ere", examples: "there, where" }
    ],
    "ʊə": [
        { pattern: "ure", examples: "pure, cure" },
        { pattern: "our", examples: "tour" },
        { pattern: "oor", examples: "poor" }
    ],
    "p": [
        { pattern: "p", examples: "" },
        { pattern: "pp", examples: "" }
    ],
    "b": [
        { pattern: "b", examples: "" },
        { pattern: "bb", examples: "" }
    ],
    "t": [
        { pattern: "t", examples: "" },
        { pattern: "tt", examples: "" },
        { pattern: "ed", examples: "الماضي المنتظم" }
    ],
    "d": [
        { pattern: "d", examples: "" },
        { pattern: "dd", examples: "" },
        { pattern: "ed", examples: "" }
    ],
    "k": [
        { pattern: "k", examples: "" },
        { pattern: "c", examples: "" },
        { pattern: "ck", examples: "" },
        { pattern: "ch", examples: "" },
        { pattern: "q", examples: "" },
        { pattern: "que", examples: "" }
    ],
    "g": [
        { pattern: "g", examples: "" },
        { pattern: "gg", examples: "" },
        { pattern: "gh", examples: "" },
        { pattern: "gu", examples: "" }
    ],
    "f": [
        { pattern: "f", examples: "" },
        { pattern: "ff", examples: "" },
        { pattern: "ph", examples: "" },
        { pattern: "gh", examples: "" }
    ],
    "v": [
        { pattern: "v", examples: "" },
        { pattern: "ve", examples: "" },
        { pattern: "f", examples: "نادرًا" }
    ],
    "θ": [
        { pattern: "th", examples: "" }
    ],
    "ð": [
        { pattern: "th", examples: "" }
    ],
    "s": [
        { pattern: "s", examples: "" },
        { pattern: "ss", examples: "" },
        { pattern: "c", examples: "" },
        { pattern: "ce", examples: "" },
        { pattern: "sc", examples: "" },
        { pattern: "ps", examples: "" },
        { pattern: "st", examples: "" }
    ],
    "z": [
        { pattern: "z", examples: "" },
        { pattern: "zz", examples: "" },
        { pattern: "s", examples: "" },
        { pattern: "se", examples: "" },
        { pattern: "x", examples: "" }
    ],
    "ʃ": [
        { pattern: "sh", examples: "" },
        { pattern: "ch", examples: "" },
        { pattern: "ti", examples: "" },
        { pattern: "ci", examples: "" },
        { pattern: "si", examples: "" },
        { pattern: "ssi", examples: "" }
    ],
    "ʒ": [
        { pattern: "si", examples: "" },
        { pattern: "s", examples: "" },
        { pattern: "ge", examples: "" },
        { pattern: "g", examples: "" },
        { pattern: "z", examples: "" }
    ],
    "h": [
        { pattern: "h", examples: "" },
        { pattern: "wh", examples: "" }
    ],
    "ʧ": [
        { pattern: "ch", examples: "" },
        { pattern: "tch", examples: "" },
        { pattern: "t", examples: "" }
    ],
    "ʤ": [
        { pattern: "j", examples: "" },
        { pattern: "g", examples: "" },
        { pattern: "ge", examples: "" },
        { pattern: "dge", examples: "" },
        { pattern: "dg", examples: "" }
    ],
    "m": [
        { pattern: "m", examples: "" },
        { pattern: "mm", examples: "" },
        { pattern: "mb", examples: "" }
    ],
    "n": [
        { pattern: "n", examples: "" },
        { pattern: "nn", examples: "" },
        { pattern: "kn", examples: "" },
        { pattern: "gn", examples: "" }
    ],
    "ŋ": [
        { pattern: "ng", examples: "" },
        { pattern: "n", examples: "" }
    ],
    "l": [
        { pattern: "l", examples: "" },
        { pattern: "ll", examples: "" }
    ],
    "r": [
        { pattern: "r", examples: "" },
        { pattern: "rr", examples: "" },
        { pattern: "wr", examples: "" },
        { pattern: "rh", examples: "" }
    ],
    "j": [
        { pattern: "y", examples: "" },
        { pattern: "u", examples: "" },
        { pattern: "ew", examples: "" }
    ],
    "w": [
        { pattern: "w", examples: "" },
        { pattern: "wh", examples: "" },
        { pattern: "u", examples: "" },
        { pattern: "o", examples: "" }
    ]
};

/**
 * HomePage
 * --------
 * وحدة تحكم صفحة index.html (الشبكة الكاملة + الفلترة + البحث + المودال +
 * وضع الممارسة). هذه إعادة هيكلة لملف ipa-chart.js الأصلي.
 *
 * التغييرات البنيوية الرئيسية عن النسخة الأصلية:
 * 1. إزالة الاعتماد على مصفوفتي VOWEL_SYMBOLS/CONSONANT_SYMBOLS المحليتين
 *    واستبدالهما بـ CONFIG.symbolCategories (مصدر واحد للحقيقة).
 * 2. استبدال بناء innerHTML اليدوي بـ SoundCardFactory.buildIPACard.
 * 3. استبدال فحص "display:none" الهش عبر [style*="none"] بكلاس CSS
 *    صريح is-hidden، وهذا أكثر أمانًا من الاعتماد على نص CSS داخلي.
 * 4. تجميع كل الحالة المشتركة (sounds/wordsMap/descriptions) داخل كائن
 *    state واحد بدل متغيرات cached* منفصلة معلّقة في النطاق العام.
 * 5. إزالة setupCardGlow() الفارغة (كود ميت 100%، كانت موجودة بلا أي تأثير).
 */
const HomePage = (() => {
    const state = {
        sounds: [],
        wordsMap: {},
        descriptions: {},
    };

    let elements = {};

    function cacheElements() {
        elements = {
            container: document.getElementById('cardsContainer'),
            modalOverlay: document.getElementById('detailModal'),
            modalBody: document.getElementById('modalBody'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            header: document.getElementById('mainHeader'),
            searchInput: document.getElementById('searchInput'),
            practiceBtn: document.getElementById('practiceBtn'),
        };
    }

    // ===== 1. تحميل البيانات وبناء الشبكة =====
    async function init() {
        cacheElements();
        if (!elements.container) return;

        elements.container.innerHTML =
            '<div class="empty-state"><div class="skeleton" style="height:200px;width:100%;"></div></div>';

        const [sounds, wordsMap, descriptions] = await DataService.loadMany([
            CONFIG.paths.ipaData,
            CONFIG.paths.ipaWords,
            CONFIG.paths.ipaDescriptions,
        ]);

        if (!sounds || sounds.length === 0) {
            elements.container.innerHTML =
                '<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>تعذر تحميل البيانات. تأكد من تشغيل خادم محلي.</p></div>';
            return;
        }

        state.sounds = sounds;
        state.wordsMap = wordsMap || {};
        state.descriptions = descriptions || {};

        renderGrid();
        updateStats();

        bindGridClicks();
        bindSearch();
        bindCategoryFilter();
        bind3DTilt();
        bindScrollHeader();
        bindKeyboardNavigation();
        bindPracticeMode();
        bindModalClose();
        bindGlobalShortcuts();
    }

    function renderGrid() {
        elements.container.innerHTML = '';
        state.sounds.forEach((sound, index) => {
            const exampleWord = state.wordsMap[sound.symbol] || '—';
            const card = SoundCardFactory.buildIPACard(sound, exampleWord);
            card.style.animationDelay = `${0.02 + index * CONFIG.animation.cardStaggerSeconds}s`;
            elements.container.appendChild(card);
        });
    }

    function updateStats() {
        const { vowels, consonants } = CONFIG.symbolCategories;
        animateValue('vowelCount', state.sounds.filter((s) => vowels.includes(s.symbol)).length);
        animateValue('consonantCount', state.sounds.filter((s) => consonants.includes(s.symbol)).length);
        animateValue('totalCount', state.sounds.length);
    }

    function animateValue(elementId, target) {
        const el = document.getElementById(elementId);
        if (!el) return;
        const duration = CONFIG.animation.countUpDurationMs;
        const stepTime = Math.max(1, Math.floor(duration / Math.max(target, 1)));
        let current = 0;
        const timer = setInterval(() => {
            current += 1;
            el.textContent = current;
            if (current >= target) clearInterval(timer);
        }, stepTime);
    }

    // ===== 2. تشغيل الصوت من الشبكة =====
    function bindGridClicks() {
        elements.container.addEventListener('click', (event) => {
            const infoBtn = event.target.closest('.info-btn');
            if (infoBtn) {
                event.stopPropagation();
                openModal(infoBtn.dataset.symbol);
                return;
            }

            const card = event.target.closest('.sound-card');
            if (!card) return;

            const audio = AudioService.play(resolveAudioPath(card.dataset.audio));
            if (!audio) return;

            document.querySelectorAll('.sound-card.is-playing').forEach((c) => c.classList.remove('is-playing'));
            card.classList.add('is-playing');
            audio.addEventListener('ended', () => card.classList.remove('is-playing'));
        });
    }

    // ===== 3. المودال (تفاصيل الصوت) =====
    function openModal(symbol) {
        const sound = state.sounds.find((s) => s.symbol === symbol);
        if (!sound) return;

        const exampleWord = state.wordsMap[symbol] || '—';
        const description = state.descriptions[symbol] || 'لا يوجد وصف.';
        const imagePath = resolveImagePath(sound.guideImage);
        const imgHtml = imagePath
            ? `<img src="${imagePath}" class="modal-guide-image" alt="وضعية الفم لـ ${symbol}">`
            : '';

        const wordsHtml = sound.words?.length
            ? `
                <div class="modal-words-section" style="margin-top:1.5rem;">
                    <h3 style="color:var(--color-accent);text-align:right;font-family:var(--font-display);">🎯 كلمات مثال</h3>
                    <div class="modal-words-grid">
                        ${sound.words
                            .map(
                                (w) => `
                            <div class="modal-word-item" data-audio="${resolveAudioPath(w.audioFile)}">
                                <span class="modal-word-text">${w.word}</span>
                                <button class="modal-word-play" aria-label="تشغيل ${w.word}">▶</button>
                            </div>`
                            )
                            .join('')}
                    </div>
                </div>`
            : '';

        // ===== قسم التهجئات الشائعة =====
        const spellings = SPELLINGS[sound.symbol];
        const spellingsHtml = spellings && spellings.length > 0
            ? `
                <div class="modal-spellings-section" dir="rtl">
                    <h3 style="color:var(--color-accent);text-align:right;font-family:var(--font-display);">📝 التهجئات الشائعة</h3>
                    <div class="modal-spellings-grid">
                        ${spellings
                            .map(
                                (sp) => `
                            <div class="modal-spelling-item" dir="rtl">
                                <span class="spelling-pattern" dir="ltr">${sp.pattern}</span>
                                ${sp.examples ? `<span class="spelling-examples" dir="ltr">${sp.examples}</span>` : ''}
                            </div>`
                            )
                            .join('')}
                    </div>
                </div>`
            : '';

        elements.modalBody.innerHTML = `
            <div class="modal-symbol" dir="ltr">${symbol}</div>
            <div class="modal-word" dir="ltr">${exampleWord}</div>
            ${imgHtml}
            <button class="modal-play-main" data-audio="${resolveAudioPath(sound.audioFile)}" aria-label="تشغيل صوت ${symbol}">
                ▶ تشغيل الصوت
            </button>
            <div class="modal-description">
                <h3>🔍 طريقة النطق</h3>
                <p>${description}</p>
            </div>
            ${spellingsHtml}
            ${wordsHtml}
        `;

        showModal();
        bindModalAudioButtons();
    }

    function showModal() {
        elements.modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        setTimeout(() => elements.modalOverlay.querySelector('.modal-close-btn')?.focus(), 100);
    }

    function closeModal() {
        elements.modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
    }

    function bindModalClose() {
        elements.closeModalBtn.addEventListener('click', closeModal);
        elements.modalOverlay.addEventListener('click', (e) => {
            if (e.target === elements.modalOverlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    }

    function bindModalAudioButtons() {
        // نستبدل العنصر بنسخة منه لإزالة أي مستمعين سابقين (منع تراكم event listeners
        // عند فتح المودال أكثر من مرة لنفس المحتوى) — نفس تقنية الأصل لكن موثّقة الآن.
        elements.modalBody.querySelectorAll('[data-audio]').forEach((el) => {
            const clone = el.cloneNode(true);
            el.parentNode.replaceChild(clone, el);
            clone.addEventListener('click', (e) => {
                e.stopPropagation();
                if (clone.dataset.audio) AudioService.play(clone.dataset.audio);
            });
        });
    }

    // ===== 4. تأثير 3D Tilt =====
    function bind3DTilt() {
        elements.container.querySelectorAll('.sound-card').forEach((card) => {
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

    // ===== 5. شريط التنقل الذكي =====
    function bindScrollHeader() {
        if (!elements.header) return;
        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.scrollY;
            elements.header.classList.toggle('scrolled', currentScroll > 30);
            elements.header.style.transform =
                currentScroll > lastScroll && currentScroll > 100 ? 'translateY(-100%)' : 'translateY(0)';
            lastScroll = currentScroll;
        });
    }

    // ===== 6. البحث والفلترة =====
    function debounce(fn, wait) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), wait);
        };
    }

    function bindSearch() {
        if (!elements.searchInput) return;

        const runSearch = debounce((query) => {
            const cards = elements.container.querySelectorAll('.sound-card');
            let visibleCount = 0;

            cards.forEach((card) => {
                const matches =
                    (card.dataset.symbol || '').toLowerCase().includes(query) ||
                    (card.dataset.word || '').toLowerCase().includes(query);
                card.classList.toggle('is-hidden', !matches);
                if (matches) visibleCount += 1;
            });

            elements.container.querySelector('.empty-state')?.remove();
            if (visibleCount === 0) {
                const empty = document.createElement('div');
                empty.className = 'empty-state';
                empty.innerHTML = '<div class="empty-state-icon">🔍</div><p>لا توجد نتائج مطابقة</p>';
                elements.container.appendChild(empty);
            }
        }, CONFIG.animation.searchDebounceMs);

        elements.searchInput.addEventListener('input', () => {
            runSearch(elements.searchInput.value.trim().toLowerCase());
        });
    }

    function bindCategoryFilter() {
        const buttons = document.querySelectorAll('.filter-btn');
        const { vowels, consonants } = CONFIG.symbolCategories;

        buttons.forEach((btn) => {
            btn.addEventListener('click', () => {
                buttons.forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.dataset.filter;

                elements.container.querySelectorAll('.sound-card').forEach((card, i) => {
                    const symbol = card.dataset.symbol;
                    const isVisible =
                        filter === 'all' ||
                        (filter === 'vowels' && vowels.includes(symbol)) ||
                        (filter === 'consonants' && consonants.includes(symbol));

                    card.classList.toggle('is-hidden', !isVisible);
                    if (isVisible) {
                        card.style.animation = `cardAppear 0.4s ease ${i * 0.02}s forwards`;
                    }
                });
            });
        });
    }

    // ===== 7. التنقل بلوحة المفاتيح =====
    function bindKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const isFormField = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName);
            const navigationKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'Enter', ' '];
            if (isFormField && navigationKeys.includes(e.key)) return;

            const cards = [...elements.container.querySelectorAll('.sound-card:not(.is-hidden)')];
            const active = document.activeElement;
            const idx = cards.indexOf(active);
            const cols = Math.max(1, Math.floor(elements.container.offsetWidth / 160));

            switch (e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    (idx > -1 && idx < cards.length - 1 ? cards[idx + 1] : cards[0])?.focus();
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    (idx > 0 ? cards[idx - 1] : cards[cards.length - 1])?.focus();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (idx > -1 && idx + cols < cards.length) cards[idx + cols].focus();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    if (idx >= cols) cards[idx - cols].focus();
                    break;
                case 'Enter':
                case ' ':
                    if (active.classList.contains('sound-card')) {
                        e.preventDefault();
                        active.click();
                    }
                    break;
            }
        });
    }

    // ===== 8. وضع الممارسة =====
    function shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    function bindPracticeMode() {
        elements.practiceBtn?.addEventListener('click', startPractice);
    }

    function startPractice() {
        const pool = state.sounds.filter((s) => s.audioFile);
        if (pool.length < 4) return;

        const question = pool[Math.floor(Math.random() * pool.length)];
        const options = [question];
        while (options.length < 4) {
            const candidate = pool[Math.floor(Math.random() * pool.length)];
            if (!options.some((o) => o.symbol === candidate.symbol)) options.push(candidate);
        }

        AudioService.play(resolveAudioPath(question.audioFile));

        elements.modalBody.innerHTML = `
            <div class="modal-symbol" dir="ltr" style="font-size:2.8rem; margin-bottom:0.2rem;">🎯 وضع الممارسة</div>
            <p style="text-align:center; color:var(--color-text-secondary); margin-bottom:1.2rem;">استمع للصوت واختر الرمز الصحيح</p>
            <button class="modal-play-main" id="replayPractice" style="margin-bottom:1.5rem; padding:0.6rem 1.5rem; font-size:0.9rem;">▶ إعادة تشغيل الصوت</button>
            <div class="quiz-grid">
                ${shuffle(options)
                    .map(
                        (s) => `
                    <button class="quiz-option" data-symbol="${s.symbol}" data-correct="${s.symbol === question.symbol}">
                        <span class="quiz-symbol">${s.symbol}</span>
                        <span class="quiz-word">${state.wordsMap[s.symbol] || ''}</span>
                    </button>`
                    )
                    .join('')}
            </div>
            <div id="practiceFeedback" style="text-align:center; margin-top:1.2rem; min-height:2rem; font-size:1.1rem;"></div>
        `;

        showModal();

        document.getElementById('replayPractice').addEventListener('click', () => {
            AudioService.play(resolveAudioPath(question.audioFile));
        });

        elements.modalBody.querySelectorAll('.quiz-option').forEach((btn) => {
            btn.addEventListener('click', () => handlePracticeAnswer(btn));
        });
    }

    function handlePracticeAnswer(btn) {
        const isCorrect = btn.dataset.correct === 'true';
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
            elements.modalBody.querySelector('[data-correct="true"]')?.classList.add('correct');
        }
    }

    // ===== 9. اختصارات عامة =====
    function bindGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                elements.searchInput?.focus();
            }
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', HomePage.init);
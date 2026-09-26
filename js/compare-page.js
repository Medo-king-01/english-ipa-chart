/**
 * ComparePage
 * -----------
 * إعادة هيكرة لملف compare.js الأصلي.
 * التغيير الجوهري: إزالة تكرار مصفوفات VOWEL_SYMBOLS / VOICED_CONSONANTS /
 * VOICELESS_CONSONANTS المحلية غير المستخدمة فعليًا في المنطق (كانت معرّفة
 * في الملف الأصلي دون أي استدعاء لها — كود ميت تم حذفه بالكامل هنا).
 *
 * الميزة الجديدة: أزواج مشهورة (Famous Pairs) جاهزة للمقارنة السريعة.
 */
const ComparePage = (() => {
    const state = {
        sounds: [],
        wordsMap: {},
        compareData: {},
        descriptions: {},
    };

    let elements = {};

    async function init() {
        elements = {
            select1: document.getElementById('sound1Select'),
            select2: document.getElementById('sound2Select'),
            container: document.getElementById('comparisonContainer'),
        };
        if (!elements.container) return;

        const [sounds, wordsMap, compareData, descriptions] = await DataService.loadMany([
            CONFIG.paths.ipaData,
            CONFIG.paths.ipaWords,
            CONFIG.paths.compareData,
            CONFIG.paths.ipaDescriptions,
        ]);

        if (!sounds || !wordsMap || !compareData || !descriptions) {
            elements.container.innerHTML = '<p class="error-message" dir="rtl">تعذر تحميل البيانات اللازمة للمقارنة.</p>';
            return;
        }

        state.sounds = sounds;
        state.wordsMap = wordsMap;
        state.compareData = compareData;
        state.descriptions = descriptions;

        populateFamousPairs();
        populateSelectors();
        elements.select1.addEventListener('change', updateComparison);
        elements.select2.addEventListener('change', updateComparison);
    }

    /**
     * أزواج مشهورة من أصوات متشابهة تسبب خلط للمتعلمين العرب.
     * تُعرض كأزرار سريعة للمقارنة المباشرة.
     */
    function populateFamousPairs() {
        const famousPairs = [
            { s1: 'ɪ', s2: 'i:', label: 'ɪ vs i:' },
            { s1: 'ʌ', s2: 'ɑ:', label: 'ʌ vs ɑ:' },
            { s1: 'ɒ', s2: 'ɔ:', label: 'ɒ vs ɔ:' },
            { s1: 'ə', s2: 'ɜ:', label: 'ə vs ɜ:' },
            { s1: 'θ', s2: 'ð', label: 'θ vs ð' },
            { s1: 'ʃ', s2: 'ʒ', label: 'ʃ vs ʒ' },
            { s1: 'ʧ', s2: 'ʤ', label: 'ʧ vs ʤ' },
            { s1: 'ɪə', s2: 'eə', label: 'ɪə vs eə' },
            { s1: 'eɪ', s2: 'aɪ', label: 'eɪ vs aɪ' },
            { s1: 'əʊ', s2: 'aʊ', label: 'əʊ vs aʊ' },
            { s1: 'æ', s2: 'ʌ', label: 'æ vs ʌ' },
            { s1: 'e', s2: 'ɪ', label: 'e vs ɪ' },
        ];

        // إنشاء حاوية الأزواج المشهورة إذا لم تكن موجودة
        let pairsContainer = document.getElementById('famousPairs');
        if (!pairsContainer) {
            pairsContainer = document.createElement('div');
            pairsContainer.id = 'famousPairs';
            pairsContainer.className = 'famous-pairs-container';
            
            const title = document.createElement('h3');
            title.className = 'famous-pairs-title';
            title.textContent = '⚡ أزواج مشهورة (Minimal Pairs)';
            title.setAttribute('dir', 'rtl');
            pairsContainer.appendChild(title);

            const grid = document.createElement('div');
            grid.className = 'famous-pairs-grid';
            grid.id = 'famousPairsGrid';
            pairsContainer.appendChild(grid);

            // إدراج الحاوية قبل حاوية المقارنة
            elements.container.parentNode.insertBefore(pairsContainer, elements.container);
        }

        const grid = document.getElementById('famousPairsGrid');
        grid.innerHTML = '';

        famousPairs.forEach((pair) => {
            // تحقق من وجود الصوتين في البيانات
            const sound1 = state.sounds.find((s) => s.symbol === pair.s1);
            const sound2 = state.sounds.find((s) => s.symbol === pair.s2);
            if (!sound1 || !sound2) return;

            const btn = document.createElement('button');
            btn.className = 'famous-pair-btn';
            btn.innerHTML = `<span>${pair.label}</span>`;
            btn.addEventListener('click', () => {
                elements.select1.value = pair.s1;
                elements.select2.value = pair.s2;
                updateComparison();
                // التمرير إلى منطقة المقارنة
                elements.container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
            grid.appendChild(btn);
        });
    }

    function populateSelectors() {
        const options = state.sounds
            .map((sound) => {
                const word = state.wordsMap[sound.symbol] || '';
                return { text: `${sound.symbol} (${word})`, value: sound.symbol };
            });

        [elements.select1, elements.select2].forEach((select) => {
            select.innerHTML = '<option value="">-- اختر صوتًا --</option>';
            options.forEach((opt) => select.add(new Option(opt.text, opt.value)));
        });
    }

    function findExplanation(symbol1, symbol2) {
        return state.compareData[`${symbol1}-${symbol2}`] || state.compareData[`${symbol2}-${symbol1}`] || null;
    }

    function updateComparison() {
        const symbol1 = elements.select1.value;
        const symbol2 = elements.select2.value;

        if (!symbol1 || !symbol2) {
            elements.container.innerHTML = '<p class="hint" dir="rtl">الرجاء اختيار صوتين للمقارنة.</p>';
            return;
        }

        const sound1 = state.sounds.find((s) => s.symbol === symbol1);
        const sound2 = state.sounds.find((s) => s.symbol === symbol2);
        if (!sound1 || !sound2) return;

        const desc1 = state.descriptions[symbol1] || 'لا يوجد وصف.';
        const desc2 = state.descriptions[symbol2] || 'لا يوجد وصف.';
        const customExplanation = findExplanation(symbol1, symbol2);

        const explanationHtml = `
            ${customExplanation ? `<p dir="rtl">${customExplanation}</p>` : ''}
            <div class="description-compare">
                <div class="desc-item" dir="rtl"><strong dir="ltr">${symbol1}</strong>: ${desc1}</div>
                <div class="desc-item" dir="rtl"><strong dir="ltr">${symbol2}</strong>: ${desc2}</div>
            </div>
        `;

        elements.container.innerHTML = `
            <div class="compare-cards" id="compareCardsSlot"></div>
            <div class="explanation-box" dir="rtl">
                <h3 dir="rtl">الفرق بين ${symbol1} و ${symbol2}</h3>
                ${explanationHtml}
            </div>
        `;

        const cardsSlot = document.getElementById('compareCardsSlot');
        cardsSlot.appendChild(SoundCardFactory.buildCompareCard(sound1, state.wordsMap[symbol1] || '', 'sound1'));
        cardsSlot.appendChild(SoundCardFactory.buildCompareCard(sound2, state.wordsMap[symbol2] || '', 'sound2'));

        bindCardAudio();
    }

    function bindCardAudio() {
        elements.container.addEventListener('click', (event) => {
            const card = event.target.closest('.sound-card');
            if (!card) return;

            const audio = AudioService.play(resolveAudioPath(card.dataset.audio));
            if (!audio) return;

            card.classList.add('playing');
            setTimeout(() => card.classList.remove('playing'), 200);
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', ComparePage.init);

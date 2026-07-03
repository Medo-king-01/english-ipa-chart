/**
 * ComparePage
 * -----------
 * إعادة هيكرة لملف compare.js الأصلي.
 * التغيير الجوهري: إزالة تكرار مصفوفات VOWEL_SYMBOLS / VOICED_CONSONANTS /
 * VOICELESS_CONSONANTS المحلية غير المستخدمة فعليًا في المنطق (كانت معرّفة
 * في الملف الأصلي دون أي استدعاء لها — كود ميت تم حذفه بالكامل هنا).
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

        populateSelectors();
        elements.select1.addEventListener('change', updateComparison);
        elements.select2.addEventListener('change', updateComparison);
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
/**
 * AlphabetPage
 * ------------
 * إعادة هيكلة لملف alphabet.js الأصلي. المنطق نفسه، لكن:
 * - استخدام DataService بدل loadJSON مباشرة (استفادة من التخزين المؤقت).
 * - استخدام SoundCardFactory بدل بناء innerHTML يدويًا هنا.
 * - دمج setupCardMouseTracking داخل نفس مرحلة الربط بدل مرور إضافي على DOM.
 */
const AlphabetPage = (() => {
    async function init() {
        const container = document.getElementById('cardsContainer');
        if (!container) {
            console.error('AlphabetPage: العنصر #cardsContainer غير موجود');
            return;
        }

        const letters = await DataService.load(CONFIG.paths.alphabetData);
        if (!letters || letters.length === 0) {
            container.innerHTML = '<p class="error-message">تعذر تحميل بيانات الأبجدية. تأكد من تشغيل خادم محلي.</p>';
            return;
        }

        container.innerHTML = '';
        letters.forEach((letter) => {
            const card = SoundCardFactory.buildAlphabetCard(letter);
            bindMouseGlow(card);
            container.appendChild(card);
        });

        bindAudioClicks(container);
        bindSearch(container);
    }

    function bindMouseGlow(card) {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
            card.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
        });
    }

    function bindAudioClicks(container) {
        container.addEventListener('click', (event) => {
            const card = event.target.closest('.sound-card');
            if (!card) return;

            const audio = AudioService.play(resolveAudioPath(card.dataset.audio));
            if (!audio) return;

            card.classList.add('playing');
            setTimeout(() => card.classList.remove('playing'), 200);
        });
    }

    function bindSearch(container) {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('input', () => {
            const query = searchInput.value.trim().toLowerCase();
            container.querySelectorAll('.sound-card').forEach((card) => {
                const matches =
                    (card.dataset.letter || '').toLowerCase().includes(query) ||
                    (card.dataset.word || '').toLowerCase().includes(query);
                card.classList.toggle('is-hidden', !matches);
            });
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', AlphabetPage.init);

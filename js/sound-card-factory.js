/**
 * SoundCardFactory
 * ----------------
 * مسؤولية واحدة (SRP): تحويل كائن بيانات (صوت / حرف) إلى عنصر DOM جاهز.
 * لا تتعامل هذه الطبقة مع الأحداث (click) ولا مع الشبكة — فقط "بناء الواجهة".
 * هذا يفصل "شكل البطاقة" عن "سلوك البطاقة"، فيسهل تعديل أحدهما دون الآخر.
 *
 * ملاحظة أمان: القيم القادمة من ملفات JSON (رموز IPA، كلمات) تُدرَج مباشرة
 * داخل innerHTML. بما أن هذه الملفات ثابتة (Static) ويملكها المطوّر نفسه،
 * الخطر منخفض حاليًا. لكن إن أصبح المحتوى قابلاً للتعديل من مصدر خارجي
 * (مثلاً لوحة تحكم لاحقًا) يجب عندها تمرير القيم عبر textContent بدل
 * innerHTML، أو دالة escapeHtml، لمنع هجمات XSS تخزينية.
 */
const SoundCardFactory = (() => {
    function buildIPACard(sound, exampleWord) {
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.dataset.symbol = sound.symbol;
        card.dataset.audio = sound.audioFile;
        card.dataset.word = exampleWord;
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play ${sound.symbol} as in ${exampleWord}`);

        card.innerHTML = `
            <div class="symbol" lang="en">${sound.symbol}</div>
            <div class="word" lang="en">${exampleWord}</div>
            <div class="audio-visualizer">
                <span class="bar"></span><span class="bar"></span><span class="bar"></span>
            </div>
            <button class="info-btn" data-symbol="${sound.symbol}" aria-label="تفاصيل ${sound.symbol}">ℹ️</button>
        `;
        return card;
    }

    function buildAlphabetCard(letter) {
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.dataset.letter = letter.letter;
        card.dataset.word = letter.sampleWord;
        card.dataset.audio = letter.audioFile;
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play letter ${letter.letter} as in ${letter.sampleWord}`);

        card.innerHTML = `
            <div class="symbol" lang="en">${letter.letter}</div>
            <div class="small-letter" lang="en">${letter.smallLetter}</div>
            <div class="word" lang="en">${letter.sampleWord}</div>
            <div class="phonetic" lang="en">${letter.letterPhonetic}</div>
        `;
        return card;
    }

    function buildCompareCard(sound, exampleWord, sideClass) {
        const card = document.createElement('div');
        card.className = `sound-card compare-card ${sideClass}`;
        card.dataset.audio = sound.audioFile;
        card.tabIndex = 0;
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play ${sound.symbol}`);

        const imagePath = resolveImagePath(sound.guideImage);
        const imageHtml = imagePath
            ? `<img src="${imagePath}" alt="وضعية الفم لـ ${sound.symbol}" class="guide-image" loading="lazy">`
            : '';

        card.innerHTML = `
            ${imageHtml}
            <div class="symbol" lang="en">${sound.symbol}</div>
            <div class="word" lang="en">${exampleWord}</div>
            <button class="play-btn" aria-label="تشغيل الصوت">▶</button>
        `;
        return card;
    }

    return { buildIPACard, buildAlphabetCard, buildCompareCard };
})();

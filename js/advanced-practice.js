/**
 * AdvancedPractice
 * ----------------
 * أوضاع ممارسة متقدمة تتجاوز الاختيار من 4 خيارات:
 * - TYPE_SYMBOL: سماع الصوت وكتابة رمز IPA
 * - HEAR_WORD: نطق كلمة واختيار الصوت الصحيح
 * - SIMILAR_SOUNDS: تمييز بين صوتين متشابهين فقط
 * - SPELLING_PATTERN: اختيار التهجئة الصحيحة لصوت معين
 */

const PracticeModes = Object.freeze({
    MULTIPLE_CHOICE: 'multiple_choice',
    TYPE_SYMBOL: 'type_symbol',
    HEAR_WORD: 'hear_word',
    SIMILAR_SOUNDS: 'similar_sounds',
    SPEAKING: 'speaking',
});

const AdvancedPractice = (() => {
    let currentMode = PracticeModes.MULTIPLE_CHOICE;
    let currentQuestion = null;
    let stats = { correct: 0, wrong: 0, streak: 0 };

    function setMode(mode) {
        currentMode = mode;
    }

    function getMode() {
        return currentMode;
    }

    /**
     * يبني سؤالاً حسب المستوى والوضع المحدد.
     * @param {Array} sounds - مصفوفة الأصوات المتاحة (مفلترة حسب المستوى)
     * @param {Object} wordsMap - خريطة الكلمات { symbol: word }
     * @returns {Object} كائن السؤال الجاهز للعرض
     */
    function generateQuestion(sounds, wordsMap) {
        if (!sounds || sounds.length === 0) return null;

        const pool = sounds.filter((s) => s.audioFile && wordsMap[s.symbol]);

        // الأوضاع التي تحتاج 4 خيارات تفشل إن قل المخزون — نرجع رسالة واضحة
        // بدل loop لا ينتهي في build*Options.
        const needs4 = currentMode !== PracticeModes.TYPE_SYMBOL && currentMode !== PracticeModes.SPEAKING;
        if (needs4 && pool.length < 4) return null;
        if (pool.length === 0) return null;

        switch (currentMode) {
            case PracticeModes.TYPE_SYMBOL:
                return buildTypeSymbolQuestion(pool, wordsMap);
            case PracticeModes.HEAR_WORD:
                return buildHearWordQuestion(pool, wordsMap);
            case PracticeModes.SIMILAR_SOUNDS:
                return buildSimilarSoundsQuestion(pool, wordsMap);
            case PracticeModes.SPEAKING:
                return buildSpeakingQuestion(pool, wordsMap);
            case PracticeModes.MULTIPLE_CHOICE:
            default:
                return buildMultipleChoiceQuestion(pool, wordsMap);
        }
    }

    /**
     * وضع النطق: تظهر كلمة حقيقية (من كلمات الصوت في ipa-data.json) مع نسخها IPA،
     * المستخدم يسمع نموذج الكلمة ثم ينطقها.
     */
    function buildSpeakingQuestion(pool, wordsMap) {
        // اختار صوت فيه كلمات بملفات صوتية حقيقية عشان نموذج النطق يكون كلمة
        const candidates = pool.filter((s) => (s.words || []).some((w) => w.audioFile && w.word));
        const source = candidates.length ? candidates : pool;
        const sound = source[Math.floor(Math.random() * source.length)];
        const wordEntry =
            (sound.words || []).find((w) => w.audioFile && w.word) || null;

        currentQuestion = {
            mode: PracticeModes.SPEAKING,
            audioFile: wordEntry ? wordEntry.audioFile : sound.audioFile,
            correctSymbol: sound.symbol,
            correctWord: wordEntry ? wordEntry.word : wordsMap[sound.symbol],
            targetWord: wordEntry ? wordEntry.word : wordsMap[sound.symbol],
            targetIpa: (wordEntry && wordEntry.ipa) || sound.symbol,
            instruction: '🎙️ اسمع الكلمة ثم انطقها بصوتك',
        };
        return currentQuestion;
    }

    function buildMultipleChoiceQuestion(pool, wordsMap) {
        const correct = pool[Math.floor(Math.random() * pool.length)];
        const options = [correct];
        while (options.length < 4) {
            const candidate = pool[Math.floor(Math.random() * pool.length)];
            if (!options.some((o) => o.symbol === candidate.symbol)) {
                options.push(candidate);
            }
        }
        shuffleArray(options);

        currentQuestion = {
            mode: PracticeModes.MULTIPLE_CHOICE,
            audioFile: correct.audioFile,
            correctSymbol: correct.symbol,
            correctWord: wordsMap[correct.symbol],
            options: options.map((o) => ({
                symbol: o.symbol,
                word: wordsMap[o.symbol],
                isCorrect: o.symbol === correct.symbol,
            })),
            instruction: '🎯 استمع للصوت واختر الرمز الصحيح',
        };
        return currentQuestion;
    }

    function buildTypeSymbolQuestion(pool, wordsMap) {
        const correct = pool[Math.floor(Math.random() * pool.length)];
        currentQuestion = {
            mode: PracticeModes.TYPE_SYMBOL,
            audioFile: correct.audioFile,
            correctSymbol: correct.symbol,
            correctWord: wordsMap[correct.symbol],
            instruction: '✍️ استمع للصوت واكتب رمز IPA الصحيح',
            hint: `الكلمة: ${wordsMap[correct.symbol]}`,
        };
        return currentQuestion;
    }

    function buildHearWordQuestion(pool, wordsMap) {
        // نختار كلمة حقيقية لها ملف صوتي من مصفوفة words في ipa-data.json —
        // وضع "استمع للكلمة" يجب أن يسمع المستخدم كلمة، لا الصوت نفسه.
        const withWordAudio = pool.filter(
            (s) => (s.words || []).some((w) => w.audioFile && w.word)
        );
        const source = withWordAudio.length ? withWordAudio : pool;
        const correctWord = source[Math.floor(Math.random() * source.length)];
        const correctSymbol = correctWord.symbol;

        const audioEntry = (correctWord.words || []).find((w) => w.audioFile && w.word);
        const spokenWord = audioEntry ? audioEntry.word : wordsMap[correctSymbol];
        const playFile = audioEntry ? audioEntry.audioFile : correctWord.audioFile;

        const options = [correctWord];
        while (options.length < 4) {
            const candidate = pool[Math.floor(Math.random() * pool.length)];
            if (!options.some((o) => o.symbol === candidate.symbol)) {
                options.push(candidate);
            }
        }
        shuffleArray(options);

        currentQuestion = {
            mode: PracticeModes.HEAR_WORD,
            spokenWord,
            audioFile: playFile,
            correctSymbol,
            correctWord: wordsMap[correctSymbol],
            options: options.map((o) => ({
                symbol: o.symbol,
                word: wordsMap[o.symbol],
                isCorrect: o.symbol === correctSymbol,
            })),
            instruction: `🔊 استمع للكلمة "${spokenWord}" واختر رمز الصوت المميز لها`,
        };
        return currentQuestion;
    }

    function buildSimilarSoundsQuestion(pool, wordsMap) {
        // أزواج معروفة من الأصوات المتشابهة — يجب أن تُكتب الرموز بنفس الشكل
        // الموجود في ipa-data.json حرفيًا (الرمز 'I' هنا حرف لاتيني كبير وليس ɪ،
        // و'ɜː' بعلامة طول ː وليس :) وإلا لن يتطابق أي زوج مع pool وسيفشل الوضع.
        const similarPairs = [
            ['I', 'i:'], ['ʌ', 'ɑ:'], ['ɒ', 'ɔ:'], ['ə', 'ɜː'],
            ['θ', 'ð'], ['ʃ', 'ʒ'], ['ʧ', 'ʤ'], ['ɪə', 'eə'],
            ['eɪ', 'aɪ'], ['əʊ', 'aʊ'], ['æ', 'ʌ'], ['e', 'I'],
            ['u', 'u:'], ['ʊə', 'ɪə'], ['ɒ', 'ʌ'], ['ɑ:', 'ʌ'],
        ];

        // فلترة الأزواج اللي موجودة في الـ pool الحالي
        const available = similarPairs.filter(
            ([a, b]) => pool.some((s) => s.symbol === a) && pool.some((s) => s.symbol === b)
        );

        if (available.length === 0) {
            // fallback للاختيار العشوائي العادي
            return buildMultipleChoiceQuestion(pool, wordsMap);
        }

        const pair = available[Math.floor(Math.random() * available.length)];
        const correctSymbol = Math.random() < 0.5 ? pair[0] : pair[1];
        const correct = pool.find((s) => s.symbol === correctSymbol);
        const other = pool.find((s) => s.symbol === (correctSymbol === pair[0] ? pair[1] : pair[0]));

        const options = [correct, other];
        shuffleArray(options);

        currentQuestion = {
            mode: PracticeModes.SIMILAR_SOUNDS,
            audioFile: correct.audioFile,
            correctSymbol: correctSymbol,
            correctWord: wordsMap[correctSymbol],
            options: options.map((o) => ({
                symbol: o.symbol,
                word: wordsMap[o.symbol],
                isCorrect: o.symbol === correctSymbol,
            })),
            instruction: '🆚 استمع واختر الصوت الصحيح (صوتان متشابهان فقط)',
        };
        return currentQuestion;
    }

    /**
     * يتحقق من الإجابة المُختارة ويرجع نتيجة + إحصائيات محدّثة.
     */
    function checkAnswer(selectedSymbol) {
        if (!currentQuestion) return null;
        const isCorrect = selectedSymbol === currentQuestion.correctSymbol;
        if (isCorrect) {
            stats.correct++;
            stats.streak++;
        } else {
            stats.wrong++;
            stats.streak = 0;
        }
        return { isCorrect, stats: { ...stats } };
    }

    /**
     * يقارن النص المكتوب في وضع TYPE_SYMBOL.
     * يتسامح مع فرق علامة الطول: المستخدم يكتب ':' العادية بينما البيانات
     * تستخدم 'ː' (و العكس) — بدون هذا التطابق لن يستطيع أحد كتابة ɜː صحيحاً.
     */
    function checkTypedAnswer(input) {
        if (!currentQuestion || currentQuestion.mode !== PracticeModes.TYPE_SYMBOL) return null;
        const normalize = (s) => String(s || '').trim().replace(/\u02D0/g, ':');
        const isCorrect = normalize(input) === normalize(currentQuestion.correctSymbol);
        if (isCorrect) {
            stats.correct++;
            stats.streak++;
        } else {
            stats.wrong++;
            stats.streak = 0;
        }
        return { isCorrect, stats: { ...stats } };
    }

    function getStats() {
        return { ...stats };
    }

    function resetStats() {
        stats = { correct: 0, wrong: 0, streak: 0 };
    }

    function shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    return {
        PracticeModes,
        setMode,
        getMode,
        generateQuestion,
        checkAnswer,
        checkTypedAnswer,
        getStats,
        resetStats,
    };
})();

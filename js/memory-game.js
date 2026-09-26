/**
 * MemoryGame
 * ----------
 * لعبة ذاكرة: 4 بطاقات، صوت، وقت محدد، نقاط.
 *
 * التصميم (بعد الإصلاح):
 * - الـ MemoryGame هو مصدر الحقيقة الوحيد لكل جولة: يولّد البطاقات الأربعة
 *   والصوت الصحيح في كائن round واحد ويمرره للصفحة عبر window.displayMemoryQuestion.
 *   الصفحة تعرض وتُشغّل الصوت من نفس الكائن — لا يوجد توليد مزدوج.
 * - جولة واحدة = إجابة واحدة (حارس answered) — النقر المزدوج لا يُحتسب.
 * - اللعبة تنتهي بعد MAX_ROUNDS جولات ثم تستدعي onGameOver.
 */

const MemoryGame = (() => {
    let round = 0;
    let score = 0;
    let timer = null;
    let timeLeft = 15;
    let currentRound = null;
    let onGameOver = null;
    let isPlaying = false;

    const ROUND_TIME = 15;   // ثانية لكل جولة
    const MAX_ROUNDS = 10;   // طول اللعبة كاملاً
    const POINTS_BASE = 100;
    const TIME_BONUS_MAX = 50;

    function start(options) {
        round = 0;
        score = 0;
        isPlaying = true;
        onGameOver = (options && options.onGameOver) || (() => {});
        nextRound();
    }

    function stop() {
        isPlaying = false;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        AudioService.stop();
    }

    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function nextRound() {
        if (!isPlaying) return;

        if (round >= MAX_ROUNDS) {
            endGame();
            return;
        }
        round++;

        const wordsMap = window.memoryGameWords || {};
        const pool = (window.memoryGamePool || []).filter((s) => s.audioFile && wordsMap[s.symbol]);
        if (pool.length < 4) {
            endGame();
            return;
        }

        const cards = shuffle(pool).slice(0, 4);
        const correct = cards[Math.floor(Math.random() * cards.length)];

        currentRound = {
            round,
            maxRounds: MAX_ROUNDS,
            score,
            correctSymbol: correct.symbol,
            audioFile: correct.audioFile,
            options: shuffle(cards).map((s) => ({ symbol: s.symbol, word: wordsMap[s.symbol] })),
            answered: false,
        };

        // الصفحة مسؤولة عن العرض + الصوت — من نفس الكائن، لا توليد مزدوج
        if (window.displayMemoryQuestion) {
            window.displayMemoryQuestion(currentRound);
        }
        startTimer();
    }

    function startTimer() {
        timeLeft = ROUND_TIME;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            timeLeft--;
            if (window.updateMemoryTimer) {
                window.updateMemoryTimer(timeLeft);
            }
            if (timeLeft <= 0) {
                clearInterval(timer);
                timer = null;
                handleTimeout();
            }
        }, 1000);
    }

    function handleTimeout() {
        if (!isPlaying || !currentRound || currentRound.answered) return;
        currentRound.answered = true;
        score = Math.max(0, score - 20);
        if (window.showMemoryResult) {
            window.showMemoryResult({
                correct: false,
                correctSymbol: currentRound.correctSymbol,
                score,
                message: '⏰ انتهى الوقت!',
            });
        }
        setTimeout(() => {
            if (isPlaying) nextRound();
        }, 1600);
    }

    /**
     * تُستدعى من الصفحة عند اختيار بطاقة. ترجع true لو الجولة ما زالت صالحة.
     */
    function selectAnswer(symbol) {
        if (!isPlaying || !currentRound || currentRound.answered) return false;
        currentRound.answered = true;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }

        const isCorrect = symbol === currentRound.correctSymbol;
        const timeBonus = Math.round((Math.max(0, timeLeft) / ROUND_TIME) * TIME_BONUS_MAX);
        let gained = 0;

        if (isCorrect) {
            gained = POINTS_BASE + timeBonus;
            score += gained;
        } else {
            gained = -20;
            score = Math.max(0, score - 20);
        }

        if (window.showMemoryResult) {
            window.showMemoryResult({
                correct: isCorrect,
                correctSymbol: currentRound.correctSymbol,
                score,
                message: isCorrect ? `✅ صحيح! +${gained}` : `❌ خطأ! الإجابة: ${currentRound.correctSymbol} (${gained})`,
            });
        }

        setTimeout(() => {
            if (isPlaying) nextRound();
        }, 1600);
        return true;
    }

    function endGame() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        const finished = isPlaying;
        isPlaying = false;
        if (finished && onGameOver) {
            onGameOver({ roundsPlayed: round, score });
        }
    }

    return {
        start,
        stop,
        selectAnswer,
        getScore: () => score,
        getRound: () => round,
        isPlaying: () => isPlaying,
    };
})();

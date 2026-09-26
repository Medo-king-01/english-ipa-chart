/**
 * ProgressTracker
 * ----------------
 * نظام تتبع التقدم عبر localStorage.
 * يحفظ: الأصوات المتقنة، الإحصائيات، المستوى الحالي، تاريخ الجلسات.
 */

const ProgressTracker = (() => {
    const STORAGE_KEY = 'english_ipa_progress';

    const defaultData = {
        mastered: {},        // { symbol: { correctCount, lastPracticed } }
        totalCorrect: 0,
        totalWrong: 0,
        sessions: [],       // [{ date, correct, wrong, duration }]
        currentLevel: 'beginner',
        streakBest: 0,
        streakCurrent: 0,
        lastSessionDate: null,
    };

    let data = null;

    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            data = raw ? JSON.parse(raw) : { ...defaultData };
            // تأكد من وجود كل الحقول (للترقية من نسخة قديمة)
            data = { ...defaultData, ...data };
        } catch (e) {
            data = { ...defaultData };
        }
        return data;
    }

    function save() {
        if (!data) load();
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('ProgressTracker: فشل حفظ البيانات', e);
        }
    }

    function recordAnswer(symbol, isCorrect) {
        if (!data) load();

        if (isCorrect) {
            data.totalCorrect++;
            data.streakCurrent++;
            if (data.streakCurrent > data.streakBest) {
                data.streakBest = data.streakCurrent;
            }
        } else {
            data.totalWrong++;
            data.streakCurrent = 0;
        }

        if (!data.mastered[symbol]) {
            data.mastered[symbol] = { correctCount: 0, lastPracticed: null };
        }
        const m = data.mastered[symbol];
        if (isCorrect) {
            m.correctCount++;
            m.lastPracticed = new Date().toISOString();
        }

        save();
    }

    function getMastery(symbol) {
        if (!data) load();
        return data.mastered[symbol] || { correctCount: 0, lastPracticed: null };
    }

    function isMastered(symbol) {
        const m = getMastery(symbol);
        return m.correctCount >= 3; // 3 إجابات صحيحة = متقن
    }

    function getMasteredCount(symbols) {
        if (!symbols) return 0;
        return symbols.filter(isMastered).length;
    }

    function getAccuracy() {
        if (!data) load();
        const total = data.totalCorrect + data.totalWrong;
        if (total === 0) return 0;
        return Math.round((data.totalCorrect / total) * 100);
    }

    function getStats() {
        if (!data) load();
        return {
            totalCorrect: data.totalCorrect,
            totalWrong: data.totalWrong,
            accuracy: getAccuracy(),
            streakCurrent: data.streakCurrent,
            streakBest: data.streakBest,
            masteredCount: Object.keys(data.mastered).filter((s) => isMastered(s)).length,
        };
    }

    function reset() {
        data = { ...defaultData };
        save();
    }

    function getCurrentLevel() {
        if (!data) load();
        return data.currentLevel;
    }

    function setCurrentLevel(level) {
        if (!data) load();
        data.currentLevel = level;
        save();
    }

    return {
        load,
        save,
        recordAnswer,
        getMastery,
        isMastered,
        getMasteredCount,
        getAccuracy,
        getStats,
        reset,
        getCurrentLevel,
        setCurrentLevel,
    };
})();

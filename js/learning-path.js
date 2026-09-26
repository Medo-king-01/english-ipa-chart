/**
 * LearningPath
 * ------------
 * تقسيم الأصوات لـ 3 مستويات:
 * - مبتدئ (Beginner): 16 صوت أساسي
 * - متوسط (Intermediate): 16 صوت
 * - متقدم (Advanced): 12 صوت
 *
 * كل مستوى يظهر في تبويب منفصل في الصفحة الرئيسية.
 */
const LEARNING_PATHS = Object.freeze({
    beginner: {
        id: 'beginner',
        label: 'مبتدئ',
        labelEn: 'Beginner',
        description: 'الأصوات الأساسية التي يحتاجها كل متعلم',
        icon: '🌱',
        symbols: [
            'i:', 'I', 'u:', 'ʌ', 'e', 'æ', 'ɑ:', 'ɒ', 'ɔ:', 'ə',
            'p', 'b', 't', 'd', 'k', 'g'
        ],
    },
    intermediate: {
        id: 'intermediate',
        label: 'متوسط',
        labelEn: 'Intermediate',
        description: 'أصوات أكثر تعقيداً للمحادثات اليومية',
        icon: '📈',
        symbols: [
            'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h',
            'm', 'n', 'ŋ', 'l', 'r', 'w', 'j', 'ʤ'
        ],
    },
    advanced: {
        id: 'advanced',
        label: 'متقدم',
        labelEn: 'Advanced',
        description: 'الأصوات الدقيقة والنطق الاحترافي',
        icon: '🎯',
        symbols: [
            'eɪ', 'aɪ', 'ɔɪ', 'aʊ', 'əʊ', 'ɪə', 'eə', 'ʊə',
            'ɜː', 'u', 'ʧ'
        ],
    },
});

const LearningPath = (() => {
    /**
     * يرجع الصوت حسب المستوى المطلوب.
     * @param {Array} soundsArray - مصفوفـة الأصوات الكاملة من DataService
     * @param {string} levelId - معرّف المستوى (beginner | intermediate | advanced)
     * @returns {Array} الأصوات المطابقة للمستوى
     */
    function getSoundsByLevel(soundsArray, levelId) {
        const path = Object.values(LEARNING_PATHS).find((p) => p.id === levelId);
        if (!path) return [];
        const set = new Set(path.symbols);
        return soundsArray.filter((s) => set.has(s.symbol));
    }

    /**
     * يرجع عدد الأصوات في كل مستوى.
     */
    function getCounts(soundsArray) {
        const counts = {};
        Object.values(LEARNING_PATHS).forEach((path) => {
            counts[path.id] = getSoundsByLevel(soundsArray, path.id).length;
        });
        return counts;
    }

    return { LEARNING_PATHS, getSoundsByLevel, getCounts };
})();

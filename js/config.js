/**
 * CONFIG
 * ------
 * مصدر واحد للحقيقة (Single Source of Truth) لكل المسارات والثوابت المستخدمة
 * عبر صفحات المشروع. أي تغيير في اسم مجلد أو ملف بيانات يتم هنا فقط،
 * بدل البحث عنه متكررًا داخل alphabet.js / compare.js / ipa-chart.js كما كان سابقًا.
 *
 * لماذا Object.freeze؟
 * لمنع أي كود لاحق (خصوصًا بعد أن يكبر المشروع) من تعديل الإعدادات في وقت التشغيل
 * بالخطأ، وهو خطأ شائع عندما تتشارك عدة صفحات نفس الكائن العام.
 */
const CONFIG = Object.freeze({
    paths: {
        alphabetData: 'data/alphabet-data.json',
        ipaData: 'data/ipa-data.json',
        ipaWords: 'data/ipa-words.json',
        ipaDescriptions: 'data/ipa-descriptions.json',
        compareData: 'data/compare-data.json',
        audioDir: 'assets/audio/',
        imagesDir: 'assets/images/',
    },

    // تصنيف الرموز الصوتية. كان مكررًا حرفيًا في compare.js و ipa-chart.js.
    // الآن يُقرأ من مكان واحد فقط، فأي إضافة صوت جديد تُحدَّث مرة واحدة.
    symbolCategories: {
        vowels: [
            'i:', 'I', 'u:', 'u', 'ə', 'ɜː', 'ɔ:', 'e', 'eə',
            'ʌ', 'ɒ', 'æ', 'ɑ:', 'ɪə', 'eɪ', 'aʊ', 'əʊ', 'aɪ',
            'ʊə', 'ɔɪ',
        ],
        consonants: [
            'f', 'v', 'θ', 'ð', 's', 'z', 'ʃ', 'ʒ', 'h',
            'p', 'b', 't', 'd', 'k', 'g', 'ʧ', 'ʤ',
            'w', 'r', 'j', 'l', 'm', 'n', 'ŋ',
        ],
    },

    animation: {
        cardStaggerSeconds: 0.025,
        countUpDurationMs: 1000,
        searchDebounceMs: 300,
    },
});

/**
 * دالة مساعدة صغيرة: تبني مسار ملف صوتي كامل من اسم ملف نسبي.
 * توحّد النمط `assets/audio/${file}` الذي كان مكتوبًا يدويًا في 4 أماكن مختلفة.
 */
function resolveAudioPath(fileName) {
    return fileName ? `${CONFIG.paths.audioDir}${fileName}` : null;
}

function resolveImagePath(fileName) {
    return fileName ? `${CONFIG.paths.imagesDir}${fileName}` : null;
}

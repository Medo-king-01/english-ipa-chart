/**
 * DataService
 * -----------
 * مسؤولية واحدة فقط (SRP): جلب ملفات JSON وتخزينها مؤقتًا في الذاكرة.
 *
 * المشكلة التي يحلّها:
 * في الكود الأصلي، كانت صفحة المقارنة (compare.js) وصفحة الرئيسية (ipa-chart.js)
 * تجلب كل واحدة منهما ipa-data.json / ipa-words.json / ipa-descriptions.json
 * بشكل مستقل تمامًا. لو انتقل المستخدم بين الصفحتين، أو لو استدعى openModal
 * أكثر من مرة، يتكرر الطلب دون داعٍ (لا يوجد HTTP cache-control موثوق به على
 * خادم تطوير محلي بسيط). هذه الطبقة تحل المشكلة بتخزين النتيجة أول مرة فقط.
 */
const DataService = (() => {
    const cache = new Map();
    const inFlight = new Map(); // يمنع سباق الطلبات لو استُدعيت نفس الدالة مرتين في نفس اللحظة

    async function fetchAndCache(path) {
        if (cache.has(path)) {
            return cache.get(path);
        }

        if (inFlight.has(path)) {
            return inFlight.get(path);
        }

        const request = (async () => {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status} أثناء تحميل: ${path}`);
            }
            const data = await response.json();
            cache.set(path, data);
            inFlight.delete(path);
            return data;
        })();

        inFlight.set(path, request);
        return request;
    }

    /**
     * تحميل آمن: لا يرمي استثناء للخارج، بل يعيد null ويسجّل الخطأ.
     * هذا يحافظ على نفس سلوك loadJSON الأصلي حتى لا تنكسر الصفحات التي تعتمد
     * على فحص `if (!data)`.
     */
    async function load(path) {
        try {
            return await fetchAndCache(path);
        } catch (error) {
            console.error('DataService:', error.message);
            return null;
        }
    }

    /**
     * تحميل عدة ملفات دفعة واحدة، بالتوازي بدل التتابع (Promise.all
     * بدل سلسلة await متتالية كما كانت في compare.js و ipa-chart.js).
     * @param {string[]} paths
     * @returns {Promise<Object[]>}
     */
    async function loadMany(paths) {
        return Promise.all(paths.map(load));
    }

    function clearCache() {
        cache.clear();
    }

    return { load, loadMany, clearCache };
})();

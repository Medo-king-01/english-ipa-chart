/**
 * دالة عامة لجلب بيانات JSON من مسار معين.
 * تُستخدم في كل الصفحات لتجنب تكرار منطق fetch / async.
 * @param {string} url - مسار ملف JSON.
 * @returns {Promise<Object>} البيانات المُسترجعة.
 */
async function loadJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Failed to load ${url}:`, error);
        return null;
    }
}
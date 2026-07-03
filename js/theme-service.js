/**
 * ThemeService
 * ------------
 * المشكلة الأصلية: نفس 20 سطرًا لتبديل الوضع الليلي كانت منسوخة حرفيًا (Copy-Paste)
 * داخل <script> في index.html و alphabet.html و compare.html.
 * هذا يخالف مبدأ DRY (Don't Repeat Yourself) مباشرة: أي تعديل مستقبلي (مثلاً
 * إضافة وضع "تلقائي حسب النظام" عبر prefers-color-scheme) كان سيتطلب تعديل
 * 3 ملفات منفصلة والمخاطرة بنسيان أحدها.
 *
 * الحل: ملف واحد يُستورد في كل الصفحات، يبحث عن كل عناصر .theme-toggle
 * الموجودة في الصفحة الحالية (0 أو 1 أو أكثر) ويربطها تلقائيًا.
 */
const ThemeService = (() => {
    const STORAGE_KEY = 'theme';
    const root = document.documentElement;

    function syncToggleButtons(theme) {
        document.querySelectorAll('.theme-toggle').forEach((btn) => {
            btn.textContent = theme === 'dark' ? '☀️' : '🌙';
            btn.setAttribute(
                'aria-label',
                theme === 'dark' ? 'تبديل الوضع النهاري' : 'تبديل الوضع الليلي'
            );
        });
    }

    function apply(theme) {
        root.setAttribute('data-theme', theme);
        syncToggleButtons(theme);
    }

    function toggle() {
        const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        localStorage.setItem(STORAGE_KEY, next);
        apply(next);
    }

    function init() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) apply(saved);

        document.querySelectorAll('.theme-toggle').forEach((btn) => {
            btn.addEventListener('click', toggle);
        });
    }

    return { init, toggle };
})();

document.addEventListener('DOMContentLoaded', ThemeService.init);

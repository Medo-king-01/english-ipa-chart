/**
 * AudioPlayer - مشغل صوتي موحد للتعامل مع ملفات الصوت في التطبيق
 * مع حماية من أخطاء التشغيل المتداخلة والتجميد
 */
const AudioPlayer = (function () {
    let currentAudio = null;

    /**
     * تشغيل ملف صوتي
     * @param {string} audioPath - مسار الملف الصوتي
     * @returns {HTMLAudioElement|null} - عنصر الصوت الذي تم تشغيله أو null في حالة الخطأ
     */
    function play(audioPath) {
        if (!audioPath) {
            console.warn('AudioPlayer: مسار الصوت غير صحيح');
            return null;
        }

        // إيقاف الصوت الحالي إن وجد
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }

        const audio = new Audio(audioPath);
        currentAudio = audio;

        // محاولة التشغيل مع حماية من الأخطاء
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // تجاهل الأخطاء الشائعة الناتجة عن التفاعل السريع أو سياسة المتصفح
                if (error.name === 'AbortError') {
                    // يتم إلغاء التشغيل عندما يبدأ صوت آخر قبل انتهاء هذا
                    console.debug('AudioPlayer: تم إلغاء تشغيل الصوت (AbortError)');
                } else if (error.name === 'NotAllowedError') {
                    // يحدث عندما يمنع المتصفح التشغيل التلقائي بدون تفاعل المستخدم
                    console.warn('AudioPlayer: التشغيل التلقائي محظور بواسطة المتصفح');
                } else {
                    console.error('AudioPlayer: فشل تشغيل الصوت:', error);
                }
            });
        }

        // تنظيف المرجع عند انتهاء التشغيل الطبيعي
        audio.addEventListener('ended', () => {
            if (currentAudio === audio) {
                currentAudio = null;
            }
        });

        // تنظيف المرجع في حالة حدوث خطأ أثناء التشغيل
        audio.addEventListener('error', (e) => {
            console.error('AudioPlayer: خطأ في تشغيل الصوت:', audioPath, e);
            if (currentAudio === audio) {
                currentAudio = null;
            }
        });

        return audio;
    }

    /**
     * إيقاف الصوت الحالي فوراً
     */
    function stop() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    }

    /**
     * الحصول على حالة التشغيل الحالية (هل يوجد صوت قيد التشغيل؟)
     * @returns {boolean}
     */
    function isPlaying() {
        return currentAudio !== null && !currentAudio.paused;
    }

    return {
        play,
        stop,
        isPlaying
    };
})();
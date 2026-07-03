/**
 * AudioService
 * ------------
 * كان اسمها AudioPlayer في الملف الأصلي. أُعيدت تسميتها لتتبع نمط تسمية
 * موحّد (كل الطبقات المشتركة تنتهي بـ *Service) — قرار تسمية دلالي فقط،
 * المنطق الداخلي هنا هو نفس منطق audio-player.js الأصلي لأنه كان سليمًا
 * ومحكمًا بالفعل (معالجة AbortError و NotAllowedError بشكل صحيح).
 *
 * التحسين الوحيد المضاف: منع محاولة تشغيل نفس المسار مرتين بسرعة شديدة
 * (debounce بسيط) لتفادي رمي أخطاء AbortError متتالية عند النقر السريع
 * المتكرر على نفس البطاقة.
 */
const AudioService = (function () {
    let currentAudio = null;
    let lastPlayedPath = null;
    let lastPlayedAt = 0;
    const MIN_REPLAY_INTERVAL_MS = 80;

    function play(audioPath) {
        if (!audioPath) {
            console.warn('AudioService: مسار الصوت غير صحيح');
            return null;
        }

        const now = Date.now();
        if (audioPath === lastPlayedPath && now - lastPlayedAt < MIN_REPLAY_INTERVAL_MS) {
            return currentAudio; // تجاهل نقرة مزدوجة عرضية على نفس الصوت
        }
        lastPlayedPath = audioPath;
        lastPlayedAt = now;

        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }

        const audio = new Audio(audioPath);
        currentAudio = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                if (error.name === 'AbortError') {
                    console.debug('AudioService: تم إلغاء التشغيل (AbortError) — سلوك متوقع عند التبديل السريع');
                } else if (error.name === 'NotAllowedError') {
                    console.warn('AudioService: التشغيل التلقائي محظور قبل أول تفاعل من المستخدم');
                } else {
                    console.error('AudioService: فشل تشغيل الصوت:', error);
                }
            });
        }

        audio.addEventListener('ended', () => {
            if (currentAudio === audio) currentAudio = null;
        });

        audio.addEventListener('error', (e) => {
            console.error('AudioService: خطأ أثناء التحميل/التشغيل:', audioPath, e);
            if (currentAudio === audio) currentAudio = null;
        });

        return audio;
    }

    function stop() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    }

    function isPlaying() {
        return currentAudio !== null && !currentAudio.paused;
    }

    return { play, stop, isPlaying };
})();

/**
 * SpeechService
 * -------------
 * وضع الاختبار بالنطق عبر Web Speech API (SpeechRecognition).
 * يعمل في Chrome / Edge على ويندوز — لا يحتاج سيرفر ولا مفتاح API.
 *
 * سبب التوقف الفوري القديم: الكود كان يبتلع خطأ المتصفح (onerror → null)
 * فتظهر رسالة "لم أسمع شيئاً" لأي سبب: إذن ميكروفون مرفوض، صفحة مفتوحة
 * كملف محلي (file:// يمنع الميكروفون صامتاً)، شبكة، أو لا صوت.
 *
 * النسخة الحالية:
 * 1) تفقد مسبق للميكروفون عبر getUserMedia — يظهر dialog الإذن بوضوح ويكشف
 *    السبب الحقيقي قبل بدء التعرف، ويكشف حالة file:// المحظورة.
 * 2) إرجاع نتيجة منظمة {status:'ok'|'error', code, alternatives} بدل null مبهم.
 * 3) رسائل عربية دقيقة لكل كود خطأ (not-allowed / audio-capture / network / no-speech).
 * 4) مهلة أمان 12 ثانية: لو لم تبدأ أي نتيجة تُقاطع الجلسة كـ no-speech.
 */
const SpeechService = (() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

    function supported() {
        return !!SR;
    }

    const ERROR_HINTS = {
        'unsupported': 'متصفحك لا يدعم التعرف على الصوت — استخدم Chrome أو Edge.',
        'insecure-context': '⚠️ الصفحة مفتوحة كملف محلي (file://) — المتصفح يمنع الميكروفون تماماً في هذه الحالة. افتح الموقع عبر http://localhost:8090.',
        'not-allowed': 'تم رفض إذن الميكروفون لهذا الموقع. اضغط على أيقونة القفل/الإعدادات بجوار شريط العنوان → الميكروفون → "السماح"، ثم أعد تحميل الصفحة.',
        'service-not-allowed': 'خدمة التعرف على الصوت محظورة من إعدادات المتصفح (الخصوصية → الأذن بالأجهزة/الإدخال الصوتي).',
        'audio-capture': 'لا يوجد ميكروفون متاح للمتكصفح — تحقق من إعدادات الصوت في ويندوز ومن أن التطبيق يسمح باستخدامه.',
        'not-readable': 'قراءة الميكروفون محظورة — اسمح بإذن الميكروفون لهذا الموقع.',
        'network': 'خدمة نطق Chrome تحتاج اتصال إنترنت (تعمل عبر خوادم المتصفح) — تحقق من الشبكة وأعد المحاولة.',
        'no-speech': 'لم يلتقط الميكروفون صوتاً — اضغط الزر وانتظر عبارة "أستمع..." ثم انطق الكلمة بوضوح وقرباً من الميكروفون.',
        'aborted': 'مقاطعة غير متوقعة — اضغط وحاول مرة أخرى.',
        'mic-denied': 'الميكروفون محجوب من إعدادات الخصوصية في ويندوز (الإعدادات → الخصوصية → الميكروفون).',
    };

    function errorHint(code) {
        return ERROR_HINTS[code] || 'حدث خطأ غير متوقع في جلسة الصوت — حاول مرة أخرى.';
    }

    /**
     * طلب الميكروفون صراحةً: يضمن ظهور نافذة الإذن بشكل مفهوم، ويكشف
     * الرفض/غياب الجهاز/حالة file:// قبل أن يفشل التعرف بشكل غامض.
     */
    async function ensureMicPermission() {
        if (location.protocol === 'file:') {
            return { ok: false, code: 'insecure-context' };
        }
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            return { ok: true }; // متصفح قديم بلا mediaDevices — نجرّب الحظ مباشرة
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const live = stream.getAudioTracks().some((t) => t.readyState === 'live');
            // إيقاف المسار فوراً — تركه مفتوحاً يعارض SpeechRecognition على بعض الأنظمة
            stream.getTracks().forEach((t) => t.stop());
            return live ? { ok: true } : { ok: false, code: 'audio-capture' };
        } catch (e) {
            const name = (e && e.name) || '';
            if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
                return { ok: false, code: 'not-allowed' };
            }
            if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
                return { ok: false, code: 'audio-capture' };
            }
            if (name === 'NotReadableError' || name === 'TrackStartError') {
                return { ok: false, code: 'not-readable' };
            }
            return { ok: false, code: name ? name.toLowerCase() : 'mic-denied' };
        }
    }

    /**
     * جلسة نطق واحدة.
     * @returns {Promise<{status:'ok', alternatives:string[]} | {status:'error', code:string}>}
     */
    async function recognizeOnce() {
        if (!SR) return { status: 'error', code: 'unsupported' };

        const mic = await ensureMicPermission();
        if (!mic.ok) return { status: 'error', code: mic.code };

        // مهلة قصيرة لتحرير الميكروفون من stream فحص الإذن قبل بدء SR
        await new Promise((r) => setTimeout(r, 250));

        return new Promise((resolve) => {
            const rec = new SR();
            rec.lang = 'en-US';
            rec.interimResults = false;
            rec.maxAlternatives = 3;
            rec.continuous = false;

            let settled = false;
            let lastError = null;

            const finish = (result) => {
                if (settled) return;
                settled = true;
                clearTimeout(guard);
                try { rec.abort(); } catch (e) { /* ignore */ }
                resolve(result);
            };

            // مهلة أمان: لا نتيجة ولا خطأ خلال 12 ثانية → نعتبرها لا-صوت
            const guard = setTimeout(() => {
                finish({ status: 'error', code: 'no-speech' });
            }, 12000);

            rec.onresult = (event) => {
                const alternatives = [];
                try {
                    for (let i = 0; i < event.results[0].length; i++) {
                        alternatives.push(event.results[i][0].transcript);
                    }
                } catch (e) {
                    // بنية نتيجة غير متوقعة — ننتظر onend
                }
                if (alternatives.length) finish({ status: 'ok', alternatives });
            };

            rec.onerror = (event) => {
                lastError = (event && event.error) || 'unknown';
            };

            rec.onend = () => {
                // onend قد تسبقها onresult (نجحت) أو onerror (نفشل بسبب محدد)
                if (lastError) finish({ status: 'error', code: lastError });
                else finish({ status: 'error', code: 'no-speech' });
            };

            try {
                rec.start();
            } catch (e) {
                // "already started" — جلسة سابقة لم تنتهِ بعد؛ أعد المحاولة بعد لحظة
                setTimeout(() => {
                    try { rec.start(); } catch (e2) {
                        finish({ status: 'error', code: 'aborted' });
                    }
                }, 300);
            }
        });
    }

    /**
     * مقارنة متسامحة: يتجاهل حالة الأحرف والمسافات والعلامات الفاصلة.
     * يرجع أفضل بديل مطابق من قائمة النتائج.
     */
    function matchSpoken(alternatives, targetWord) {
        const norm = (s) => String(s || '').toLowerCase().trim().replace(/[^a-z0-9\s']/g, '');
        const target = norm(targetWord);
        const alts = Array.isArray(alternatives) ? alternatives : [alternatives];
        for (const alt of alts) {
            const spoken = norm(alt);
            if (!spoken) continue;
            if (spoken === target) return { matched: true, spoken: alt, exact: true };
            if (spoken.split(/\s+/).includes(target)) return { matched: true, spoken: alt, exact: false };
        }
        return { matched: false, spoken: alts[0] || '', exact: false };
    }

    return { supported, recognizeOnce, matchSpoken, errorHint };
})();

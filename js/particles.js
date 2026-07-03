// ============================================================
//  تأثير الفقاعات العائمة على خلفية شفافة (أحادية اللون: أسود/أبيض حسب الوضع)
// ============================================================
(function() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let particles = [];
    let mouse = { x: null, y: null, radius: 150 };
    const CONNECTION_DISTANCE = 100;

    /**
     * كثافة الفقاعات معايرة نسبةً لمساحة شاشة ديسكتوب قياسية (1920×1080)،
     * حيث كانت القيمة الأصلية 40 تبدو متوازنة بصريًا. أي شاشة أخرى تُحسب
     * نسبةً إلى هذا المرجع بدل رقم مطلق.
     *
     * لماذا حدّان (MIN/MAX) وليس المعادلة وحدها؟
     * - بلا حدّ أدنى: شاشة موبايل صغيرة جدًا (مثلاً 320×480) قد تُنتج
     *   6-7 فقاعات فقط → التأثير يصبح متقطعًا وغير مقنع بصريًا.
     * - بلا حدّ أقصى: شاشة 4K أو نافذة مكبّرة على شاشتين قد تُنتج 150+
     *   فقاعة. المشكلة ليست بصرية فقط بل أداء — drawConnections() تعقيدها
     *   O(n²)، أي أن مضاعفة العدد تُربّع تكلفة الحساب لكل إطار (frame).
     */
    const REFERENCE_AREA = 1920 * 1080;
    const REFERENCE_COUNT = 40;
    const MIN_PARTICLES = 14;
    const MAX_PARTICLES = 70;

    function computeParticleCount() {
        const currentArea = width * height;
        const scaled = Math.round((currentArea / REFERENCE_AREA) * REFERENCE_COUNT);
        return Math.min(MAX_PARTICLES, Math.max(MIN_PARTICLES, scaled));
    }

    /**
     * لون الفقاعات يُحسب حسب الوضع الحالي (فاتح/داكن) في كل إطار،
     * وليس مرة واحدة عند إنشاء الجسيم. هذا مهم: لو ثبّتنا اللون عند
     * الإنشاء، وبدّل المستخدم الوضع الليلي أثناء التشغيل، ستبقى
     * الفقاعات بلونها القديم إلى أن تُعاد الصفحة — وهو خطأ شائع
     * عند خلط "حالة تُحسب مرة" مع "حالة تتغيّر باستمرار".
     */
    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    // تتبع الماوس
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.radius = 25 + Math.random() * 60;
            this.baseOpacity = 0.02 + Math.random() * 0.05;
            this.opacity = this.baseOpacity;
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.40 + Math.random() * 0.50;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        }

        update() {
            // حركة طبيعية
            this.x += this.vx;
            this.y += this.vy;

            // تفاعل مع الماوس
            if (mouse.x != null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= dx * force * 0.05;
                    this.y -= dy * force * 0.05;
                    this.opacity = Math.min(this.baseOpacity + force * 0.1, 0.15);
                } else {
                    this.opacity += (this.baseOpacity - this.opacity) * 0.05;
                }
            }

            // ارتداد عند الحواف
            if (this.x < -this.radius) this.x = width + this.radius;
            if (this.x > width + this.radius) this.x = -this.radius;
            if (this.y < -this.radius) this.y = height + this.radius;
            if (this.y > height + this.radius) this.y = -this.radius;
        }

        draw() {
            const isDark = isDarkMode();
            // أسود في النهاري (طلب صريح)، أبيض في الليلي (وإلا تختفي الفقاعات
            // فوق خلفية داكنة أصلًا). alpha أعلى قليلًا في النهاري لأن الأسود
            // على أبيض يحتاج تباينًا أقوى ليكون مرئيًا كـ"وميض" وليس بقعة باهتة.
            const rgb = isDark ? '255, 255, 255' : '0, 0, 0';
            const alpha = isDark ? this.opacity * 1.8 : this.opacity * 2.4;

            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius
            );
            gradient.addColorStop(0, `rgba(${rgb}, ${alpha * 1.5})`);
            gradient.addColorStop(0.5, `rgba(${rgb}, ${alpha * 0.6})`);
            gradient.addColorStop(1, `rgba(${rgb}, 0)`);

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = computeParticleCount();
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function drawConnections() {
        const isDark = isDarkMode();
        const rgb = isDark ? '255, 255, 255' : '0, 0, 0';

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < CONNECTION_DISTANCE) {
                    const opacity = (1 - distance / CONNECTION_DISTANCE) * 0.04;
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(${rgb}, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        // الفرق الجوهري عن النسخة السابقة: بدل fillRect بلون معتم يطمس كل شيء
        // تحت الـ Canvas، نستخدم غسلة (wash) شبه شفافة بنفس لون الخلفية.
        // النتيجة: تأثير "ذيل ضوئي" خفيف خلف كل فقاعة (وميض حقيقي)، بينما
        // تبقى الخلفية الأصلية (تدرج CSS أو لون body) مرئية تحتها بشفافية.
        const isDark = isDarkMode();
        ctx.fillStyle = isDark ? 'rgba(9, 10, 15, 0.18)' : 'rgba(255, 255, 255, 0.16)';
        ctx.fillRect(0, 0, width, height);

        drawConnections();

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animate);
    }

    resize();
    initParticles();
    animate();

})();
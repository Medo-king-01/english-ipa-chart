/**
 * PracticePage
 * ------------
 * وحدة تحكم صفحة practice.html.
 * تربط بين LearningPath + AdvancedPractice + ProgressTracker + MemoryGame.
 *
 * ملاحظات البنية (بعد الإصلاح):
 * - MemoryGame هو صاحب الكلمة الأولى في لعبة الذاكرة: يولّد الجولة كاملة
 *   (بطاقات + الصوت الصحيح) ويمررها عبر window.displayMemoryQuestion.
 *   الصفحة تعرض من نفس الكائن — لا يوجد توليد سؤال مستقل كان يسبب اختلاف
 *   الصوت المعروض عن الصوت المُتحقق منه.
 * - رقم جلسة (sessionSeq): كل setTimeout/صوت يتحقق أن جلسته ما زالت حية،
 *   فلا تستمر أسئلة شبحية بعد الإيقاف أو تبديل الوضع/المستوى.
 * - حارس answered يمنع العد المزدوج عند النقر السريع.
 */
const PracticePage = (() => {
    let currentLevel = 'beginner';
    let currentMode = 'multiple_choice';
    let allSounds = [];
    let wordsMap = {};
    let currentQuestion = null;
    let memoryGameActive = false;
    let sessionSeq = 0;
    let answered = false;

    let elements = {};

    async function init() {
        cacheElements();
        setupEventListeners();
        updateDashboard();

        const [sounds, words] = await DataService.loadMany([
            CONFIG.paths.ipaData,
            CONFIG.paths.ipaWords,
        ]);

        if (!sounds) {
            elements.practiceArea.innerHTML = '<p class="error-message">تعذر تحميل البيانات.</p>';
            return;
        }

        allSounds = sounds;
        wordsMap = words || {};

        // مخزون اللعبة: الأصوات التي لها ملفات صوتية وكلمات
        window.memoryGamePool = allSounds;
        window.memoryGameWords = wordsMap;
        updateTabProgress();
    }

    function cacheElements() {
        elements = {
            startScreen: document.getElementById('startScreen'),
            questionArea: document.getElementById('questionArea'),
            questionContent: document.getElementById('questionContent'),
            practiceArea: document.getElementById('practiceArea'),
            roundNumber: document.getElementById('roundNumber'),
            correctCount: document.getElementById('correctCount'),
            wrongCount: document.getElementById('wrongCount'),
            streakDisplay: document.getElementById('streakDisplay'),
            streakCount: document.getElementById('streakCount'),
            dashAccuracy: document.getElementById('dashAccuracy'),
            dashStreak: document.getElementById('dashStreak'),
            dashBest: document.getElementById('dashBest'),
            dashMastered: document.getElementById('dashMastered'),
            btnStartPractice: document.getElementById('btnStartPractice'),
        };
    }

    function setupEventListeners() {
        // تبديل المستويات — يشتغل حتى أثناء الممارسة
        document.querySelectorAll('.practice-tab').forEach((tab) => {
            tab.addEventListener('click', () => {
                if (currentLevel === tab.dataset.level) return;
                document.querySelectorAll('.practice-tab').forEach((t) => t.classList.remove('active'));
                tab.classList.add('active');
                currentLevel = tab.dataset.level;
                if (isPracticeActive()) {
                    stopCurrentSession();
                    startPractice();
                }
            });
        });

        // تبديل الأوضاع — يشتغل حتى أثناء الممارسة
        document.querySelectorAll('.mode-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (currentMode === btn.dataset.mode) return;
                document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                currentMode = btn.dataset.mode;
                if (isPracticeActive()) {
                    stopCurrentSession();
                    startPractice();
                }
            });
        });

        if (elements.btnStartPractice) {
            elements.btnStartPractice.addEventListener('click', startPractice);
        }
    }

    function isPracticeActive() {
        return elements.questionArea && elements.questionArea.style.display === 'block';
    }

    /** يبطل الجلسة الحالية: مؤجلات + صوت + لعبة ذاكرة */
    function stopCurrentSession() {
        sessionSeq++;
        AudioService.stop();
        if (memoryGameActive) {
            MemoryGame.stop();
            memoryGameActive = false;
        }
    }

    function showStartScreen() {
        stopCurrentSession();
        elements.questionArea.style.display = 'none';
        elements.startScreen.style.display = 'block';
        updateDashboard();
        updateTabProgress();
    }

    function startPractice() {
        sessionSeq++;
        answered = false;
        AdvancedPractice.resetStats();

        if (currentMode === 'memory_game') {
            startMemoryGame();
        } else {
            AdvancedPractice.setMode(currentMode);
            showQuestion();
        }
    }

    function getLevelSounds() {
        return LearningPath.getSoundsByLevel(allSounds, currentLevel);
    }

    // ===== الأسئلة العادية (كل الأوضاع ما عدا لعبة الذاكرة) =====
    function showQuestion() {
        const mySession = sessionSeq;
        const levelSounds = getLevelSounds();
        currentQuestion = AdvancedPractice.generateQuestion(levelSounds, wordsMap);
        if (!currentQuestion) {
            elements.questionContent.innerHTML =
                '<div class="empty-state"><div class="empty-state-icon">⚠️</div><p>لا توجد أصوات كافية لهذا المستوى — جرّب مستوى آخر.</p></div>';
            return;
        }

        elements.startScreen.style.display = 'none';
        elements.questionArea.style.display = 'block';

        answered = false;
        renderQuestion(currentQuestion);
        updateQuestionStats();

        if (currentQuestion.audioFile) {
            setTimeout(() => {
                if (mySession === sessionSeq) {
                    AudioService.play(resolveAudioPath(currentQuestion.audioFile));
                }
            }, 300);
        }
    }

    function renderQuestion(question) {
        let html = `<div class="question-instruction" dir="rtl">${question.instruction}</div>`;

        if (question.mode === 'type_symbol') {
            html += `
                <div class="type-answer-container">
                    <p class="type-hint" dir="rtl">${question.hint}</p>
                    <button class="btn-replay-audio" id="replayAudio">▶ إعادة تشغيل الصوت</button>
                    <input type="text" id="typeAnswerInput" class="type-answer-input" placeholder="اكتب رمز IPA هنا..." autocomplete="off" spellcheck="false" dir="ltr">
                    <button class="btn-submit-answer" id="submitTypeAnswer">تحقق</button>
                    <button class="btn-stop-practice" id="stopPracticeBtn">⏹ إيقاف</button>
                </div>
            `;
        } else if (question.mode === 'speaking') {
            const speechOk = SpeechService.supported();
            html += `
                <div class="speaking-container">
                    <div class="speaking-word" dir="ltr">${question.targetWord}</div>
                    <div class="speaking-ipa" dir="ltr">/${question.targetIpa}/</div>
                    <div class="speaking-buttons">
                        <button class="btn-replay-audio" id="replayAudio">🔊 اسمع النموذج</button>
                        ${speechOk
                            ? `<button class="btn-mic" id="micBtn">🎙️ انطق الكلمة</button>`
                            : `<p class="speech-unsupported">⚠️ متصفحك لا يدعم التعرف على الصوت — استخدم Chrome أو Edge.</p>`}
                    </div>
                    <div class="speaking-result" id="speakingResult"></div>
                    <button class="btn-stop-practice" id="stopPracticeBtn">⏹ إيقاف</button>
                </div>
            `;
        } else {
            html += `
                <button class="btn-replay-audio" id="replayAudio">▶ إعادة تشغيل الصوت</button>
                <div class="quiz-grid practice-quiz">
                    ${question.options
                        .map(
                            (opt) => `
                        <button class="quiz-option" data-symbol="${opt.symbol}">
                            <span class="quiz-symbol">${opt.symbol}</span>
                            <span class="quiz-word">${opt.word}</span>
                        </button>
                    `
                        )
                        .join('')}
                </div>
                <button class="btn-stop-practice" id="stopPracticeBtn">⏹ إيقاف</button>
            `;
        }

        elements.questionContent.innerHTML = html;
        bindQuestionEvents(question);
    }

    function bindQuestionEvents(question) {
        const stopBtn = document.getElementById('stopPracticeBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', showStartScreen);
        }

        const replayBtn = document.getElementById('replayAudio');
        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                if (question.audioFile) {
                    AudioService.play(resolveAudioPath(question.audioFile));
                }
            });
        }

        // وضع الكتابة
        const submitBtn = document.getElementById('submitTypeAnswer');
        const input = document.getElementById('typeAnswerInput');
        if (submitBtn && input) {
            submitBtn.addEventListener('click', () => checkTypedAnswer(input));
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') checkTypedAnswer(input);
            });
            setTimeout(() => input.focus(), 100);
        }

        // وضع النطق
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            micBtn.addEventListener('click', () => handleSpeakingAttempt(micBtn));
        }

        // أوضاع الاختيار
        elements.questionContent.querySelectorAll('.quiz-option').forEach((btn) => {
            btn.addEventListener('click', () => handleChoice(btn.dataset.symbol));
        });
    }

    function checkTypedAnswer(input) {
        if (answered) return;
        answered = true;

        const mySession = sessionSeq;
        const result = AdvancedPractice.checkTypedAnswer(input.value);
        if (!result) {
            answered = false;
            return;
        }

        const symbol = currentQuestion.correctSymbol;
        ProgressTracker.recordAnswer(symbol, result.isCorrect);

        if (result.isCorrect) {
            input.classList.add('correct');
            showFeedback(true, `✓ صحيح! ${symbol}`);
        } else {
            input.classList.add('wrong');
            showFeedback(false, `✗ الإجابة الصحيحة: ${symbol}`);
        }

        updateDashboard();
        updateTabProgress();
        setTimeout(() => {
            if (mySession !== sessionSeq) return;
            input.value = '';
            input.classList.remove('correct', 'wrong');
            showQuestion();
        }, 1800);
    }

    async function handleSpeakingAttempt(micBtn) {
        if (!currentQuestion || currentQuestion.mode !== 'speaking' || answered) return;
        answered = true;
        micBtn.disabled = true;
        micBtn.textContent = '🎙️ أستمع...';

        const mySession = sessionSeq;
        const resultEl = document.getElementById('speakingResult');
        const outcome = await SpeechService.recognizeOnce();

        if (mySession !== sessionSeq) return; // الجلسة أُبطِلت أثناء الاستماع

        const restoreBtn = () => {
            micBtn.disabled = false;
            micBtn.textContent = '🎙️ انطق الكلمة';
        };

        // أي فشل تقني/صوتي → رسالة دقيقة حسب السبب + السماح بإعادة المحاولة
        if (!outcome || outcome.status !== 'ok') {
            const code = (outcome && outcome.code) || 'unknown';
            if (resultEl) {
                resultEl.innerHTML =
                    `<span style="color:#f59e0b; font-weight:600;">${SpeechService.errorHint(code)}</span>`;
            }
            restoreBtn();
            answered = false; // ليست إجابة خاطئة — سماح بمحاولة جديدة
            return;
        }

        // تأخير مئوي للسماح بإغلاق stream الميكروفون من فحص الإذن قبل بدء SR
        const match = SpeechService.matchSpoken(outcome.alternatives, currentQuestion.targetWord);
        ProgressTracker.recordAnswer(currentQuestion.correctSymbol, match.matched);

        const spokenText = (outcome.alternatives[0] || '').trim();
        if (resultEl) {
            resultEl.innerHTML = match.matched
                ? `<span style="color:#22c55e; font-weight:700;">✓ أحسنت! سمعتك تقول: "${spokenText}"</span>`
                : `<span style="color:#ef4444; font-weight:700;">✗ سمعت: "${spokenText}" — الكلمة المطلوبة: ${currentQuestion.targetWord}</span>`;
        }
        micBtn.classList.add(match.matched ? 'correct' : 'wrong');

        updateDashboard();
        updateTabProgress();
        setTimeout(() => {
            if (mySession === sessionSeq) showQuestion();
        }, 2200);
    }

    function handleChoice(symbol) {
        if (answered || memoryGameActive) return;
        answered = true;

        const mySession = sessionSeq;
        const result = AdvancedPractice.checkAnswer(symbol);
        if (!result) {
            answered = false;
            return;
        }

        ProgressTracker.recordAnswer(symbol, result.isCorrect);

        elements.questionContent.querySelectorAll('.quiz-option').forEach((opt) => {
            if (opt.dataset.symbol === currentQuestion.correctSymbol) {
                opt.classList.add('correct');
            } else if (opt.dataset.symbol === symbol && !result.isCorrect) {
                opt.classList.add('wrong');
            }
            opt.style.pointerEvents = 'none';
        });

        showFeedback(result.isCorrect, result.isCorrect ? '✓ صحيح!' : `✗ الإجابة: ${currentQuestion.correctSymbol}`);

        updateDashboard();
        updateTabProgress();
        setTimeout(() => {
            if (mySession === sessionSeq) showQuestion();
        }, 1500);
    }

    function showFeedback(isCorrect, message) {
        let feedback = document.getElementById('practiceFeedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'practiceFeedback';
            feedback.style.cssText = 'text-align:center; margin-top:1.2rem; min-height:2rem; font-size:1.1rem; font-weight:700;';
            elements.questionContent.appendChild(feedback);
        }
        feedback.innerHTML = `<span style="color:${isCorrect ? '#22c55e' : '#ef4444'}">${message}</span>`;
    }

    function updateQuestionStats() {
        const stats = AdvancedPractice.getStats();
        if (elements.roundNumber) elements.roundNumber.textContent = stats.correct + stats.wrong + 1;
        if (elements.correctCount) elements.correctCount.textContent = stats.correct;
        if (elements.wrongCount) elements.wrongCount.textContent = stats.wrong;
        if (elements.streakDisplay) {
            elements.streakDisplay.style.display = stats.streak > 0 ? 'inline' : 'none';
            elements.streakCount.textContent = stats.streak;
        }
    }

    function updateDashboard() {
        const stats = ProgressTracker.getStats();
        if (elements.dashAccuracy) elements.dashAccuracy.textContent = stats.accuracy + '%';
        if (elements.dashStreak) elements.dashStreak.textContent = stats.streakCurrent;
        if (elements.dashBest) elements.dashBest.textContent = stats.streakBest;
        if (elements.dashMastered) elements.dashMastered.textContent = stats.masteredCount;
    }

    function updateTabProgress() {
        const counts = LearningPath.getCounts(allSounds);
        Object.keys(counts).forEach((levelId) => {
            const el = document.getElementById(`tabProgress-${levelId}`);
            if (el) {
                const mastered = ProgressTracker.getMasteredCount(
                    LearningPath.getSoundsByLevel(allSounds, levelId).map((s) => s.symbol)
                );
                el.textContent = `${mastered}/${counts[levelId]}`;
            }
        });
    }

    // ===== لعبة الذاكرة =====
    function startMemoryGame() {
        memoryGameActive = true;
        // احترم المستوى المختار في بطاقات اللعبة
        window.memoryGamePool = getLevelSounds();
        elements.startScreen.style.display = 'none';
        elements.questionArea.style.display = 'block';

        MemoryGame.start({
            onGameOver: (data) => {
                memoryGameActive = false;
                elements.questionContent.innerHTML = `
                    <div class="game-over-screen">
                        <h2>🎮 انتهت اللعبة!</h2>
                        <p>النقاط: <strong>${data.score}</strong> في <strong>${data.roundsPlayed}</strong> جولة</p>
                        <button class="btn-start-practice" id="restartMemory">🔄 العب مرة أخرى</button>
                        <button class="btn-stop-practice" id="exitMemory">⏹ رجوع</button>
                    </div>
                `;
                document.getElementById('restartMemory').addEventListener('click', startMemoryGame);
                document.getElementById('exitMemory').addEventListener('click', showStartScreen);
                updateDashboard();
                updateTabProgress();
            },
        });
    }

    /**
     * يستدعيه MemoryGame لكل جولة بكائن كامل — العرض هنا هو مصدر الحقيقة الوحيد:
     * نفس audioFile الذي يُعرض ويُشغّل هو نفسه الذي سيُحكم عليه.
     */
    window.displayMemoryQuestion = (roundData) => {
        const cards = roundData.options
            .map(
                (opt) => `
            <div class="memory-card" data-symbol="${opt.symbol}">
                <div class="memory-card-symbol">${opt.symbol}</div>
                <div class="memory-card-word">${opt.word}</div>
            </div>
            `
            )
            .join('');

        elements.questionContent.innerHTML = `
            <div class="memory-game-container">
                <div class="memory-round-info">الجولة ${roundData.round} من ${roundData.maxRounds} &nbsp;•&nbsp; النقاط: ${roundData.score}</div>
                <div class="memory-timer" id="memoryTimer">15</div>
                <button class="btn-replay-audio" id="replayAudio">▶ إعادة تشغيل الصوت</button>
                <div class="memory-cards-grid">${cards}</div>
                <button class="btn-stop-practice" id="stopPracticeBtn">⏹ إيقاف</button>
            </div>
        `;

        document.getElementById('stopPracticeBtn').addEventListener('click', showStartScreen);
        document.getElementById('replayAudio').addEventListener('click', () => {
            AudioService.play(resolveAudioPath(roundData.audioFile));
        });

        elements.questionContent.querySelectorAll('.memory-card').forEach((card) => {
            card.addEventListener('click', () => {
                MemoryGame.selectAnswer(card.dataset.symbol);
            });
        });

        setTimeout(() => {
            if (memoryGameActive) {
                AudioService.play(resolveAudioPath(roundData.audioFile));
            }
        }, 250);
    };

    window.updateMemoryTimer = (time) => {
        const timer = document.getElementById('memoryTimer');
        if (timer) {
            timer.textContent = time;
            timer.style.color = time <= 5 ? '#ef4444' : '';
        }
    };

    window.showMemoryResult = (data) => {
        elements.questionContent.querySelectorAll('.memory-card').forEach((card) => {
            if (card.dataset.symbol === data.correctSymbol) {
                card.classList.add('correct');
            }
            card.style.pointerEvents = 'none';
        });
        showFeedback(data.correct, data.message);
    };

    return { init };
})();

document.addEventListener('DOMContentLoaded', PracticePage.init);

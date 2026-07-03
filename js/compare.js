// تصنيف الرموز (للحالة الاحتياطية فقط)
const VOWEL_SYMBOLS = [
    "i:", "I", "u:", "u", "ə", "ɜː", "ɔ:", "e", "eə",
    "ʌ", "ɒ", "æ", "ɑ:", "ɪə", "eɪ", "aʊ", "əʊ", "aɪ",
    "ʊə", "ɔɪ"
];
const VOICED_CONSONANTS = ["v", "ð", "z", "ʒ", "b", "d", "g", "ʤ", "m", "n", "ŋ", "l", "r", "w", "j"];
const VOICELESS_CONSONANTS = ["f", "θ", "s", "ʃ", "h", "p", "t", "k", "ʧ"];

let soundsData = [];
let wordsMap = {};
let compareData = {};
let descriptionsData = {};

async function initCompare() {
    soundsData = await loadJSON('data/ipa-data.json');
    wordsMap = await loadJSON('data/ipa-words.json');
    compareData = await loadJSON('data/compare-data.json');
    descriptionsData = await loadJSON('data/ipa-descriptions.json');

    if (!soundsData || !wordsMap || !compareData || !descriptionsData) {
        document.getElementById('comparisonContainer').innerHTML =
            '<p class="error-message">تعذر تحميل البيانات اللازمة للمقارنة.</p>';
        return;
    }

    populateSelectors();
    setupSelectListeners();
}

function populateSelectors() {
    const select1 = document.getElementById('sound1Select');
    const select2 = document.getElementById('sound2Select');

    select1.innerHTML = '<option value="">-- اختر صوتًا --</option>';
    select2.innerHTML = '<option value="">-- اختر صوتًا --</option>';

    soundsData.forEach(sound => {
        const word = wordsMap[sound.symbol] || '';
        const optionText = `${sound.symbol} (${word})`;
        select1.add(new Option(optionText, sound.symbol));
        select2.add(new Option(optionText, sound.symbol));
    });
}

function setupSelectListeners() {
    document.getElementById('sound1Select').addEventListener('change', updateComparison);
    document.getElementById('sound2Select').addEventListener('change', updateComparison);
}

function updateComparison() {
    const symbol1 = document.getElementById('sound1Select').value;
    const symbol2 = document.getElementById('sound2Select').value;
    const container = document.getElementById('comparisonContainer');

    if (!symbol1 || !symbol2) {
        container.innerHTML = '<p class="hint">الرجاء اختيار صوتين للمقارنة.</p>';
        return;
    }

    const sound1 = soundsData.find(s => s.symbol === symbol1);
    const sound2 = soundsData.find(s => s.symbol === symbol2);
    if (!sound1 || !sound2) return;

    const desc1 = descriptionsData[symbol1] || 'لا يوجد وصف.';
    const desc2 = descriptionsData[symbol2] || 'لا يوجد وصف.';

    let explanationKey = `${symbol1}-${symbol2}`;
    let customExplanation = compareData[explanationKey];
    if (!customExplanation) {
        explanationKey = `${symbol2}-${symbol1}`;
        customExplanation = compareData[explanationKey] || null;
    }

    let explanationHtml = '';
    if (customExplanation) {
        explanationHtml = `<p>${customExplanation}</p>`;
    }

    explanationHtml += `
        <div class="description-compare">
            <div class="desc-item">
                <strong>${symbol1}</strong>: ${desc1}
            </div>
            <div class="desc-item">
                <strong>${symbol2}</strong>: ${desc2}
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="compare-cards">
            ${buildSoundCard(sound1, 'sound1')}
            ${buildSoundCard(sound2, 'sound2')}
        </div>
        <div class="explanation-box">
            <h3>الفرق بين ${symbol1} و ${symbol2}</h3>
            ${explanationHtml}
        </div>
    `;

    setupCardAudio();
}

function buildSoundCard(sound, sideClass) {
    const word = wordsMap[sound.symbol] || '';
    const imageHtml = sound.guideImage
        ? `<img src="assets/images/${sound.guideImage}" alt="وضعية الفم لـ ${sound.symbol}" class="guide-image" loading="lazy">`
        : '';

    return `
        <div class="sound-card compare-card ${sideClass}" data-audio="${sound.audioFile}" tabindex="0" role="button" aria-label="Play ${sound.symbol}">
            ${imageHtml}
            <div class="symbol" lang="en">${sound.symbol}</div>
            <div class="word" lang="en">${word}</div>
            <button class="play-btn" aria-label="تشغيل الصوت">▶</button>
        </div>
    `;
}

function setupCardAudio() {
    const container = document.getElementById('comparisonContainer');
    if (!container) return;

    container.addEventListener('click', (event) => {
        const card = event.target.closest('.sound-card');
        if (!card) return;

        const audioPath = card.getAttribute('data-audio');
        if (audioPath) {
            const fullPath = `assets/audio/${audioPath}`;
            AudioPlayer.play(fullPath);

            card.classList.add('playing');
            setTimeout(() => {
                card.classList.remove('playing');
            }, 200);
        }
    });
}

document.addEventListener('DOMContentLoaded', initCompare);
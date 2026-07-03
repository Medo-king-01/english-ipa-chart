async function renderAlphabet() {
    const container = document.getElementById('cardsContainer');
    if (!container) {
        console.error('Container #cardsContainer not found!');
        return;
    }

    const letters = await loadJSON('data/alphabet-data.json');

    if (!letters || letters.length === 0) {
        container.innerHTML = '<p class="error-message">تعذر تحميل بيانات الأبجدية. تأكد من تشغيل خادم محلي.</p>';
        return;
    }

    container.innerHTML = '';

    letters.forEach(letter => {
        const card = document.createElement('div');
        card.className = 'sound-card';
        card.setAttribute('data-letter', letter.letter);
        card.setAttribute('data-word', letter.sampleWord);
        card.setAttribute('data-audio', letter.audioFile);
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Play letter ${letter.letter} as in ${letter.sampleWord}`);

        card.innerHTML = `
            <div class="symbol" lang="en">${letter.letter}</div>
            <div class="small-letter" lang="en">${letter.smallLetter}</div>
            <div class="word" lang="en">${letter.sampleWord}</div>
            <div class="phonetic" lang="en">${letter.letterPhonetic}</div>
        `;

        container.appendChild(card);
    });

    setupAlphabetAudio();
    setupAlphabetSearch();
    setupCardMouseTracking();  // <-- التأثير الجديد

    console.log(`✅ تم عرض ${letters.length} حرفًا بنجاح.`);
}

// ===== دالة تتبع الماوس للتوهج الزجاجي =====
function setupCardMouseTracking() {
    const container = document.getElementById('cardsContainer');
    if (!container) return;

    container.querySelectorAll('.sound-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });
    });
}

function setupAlphabetAudio() {
    const container = document.getElementById('cardsContainer');
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

function setupAlphabetSearch() {
    const searchInput = document.getElementById('searchInput');
    const container = document.getElementById('cardsContainer');
    if (!searchInput || !container) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        const cards = container.querySelectorAll('.sound-card');

        cards.forEach(card => {
            const letter = card.getAttribute('data-letter')?.toLowerCase() || '';
            const word = card.getAttribute('data-word')?.toLowerCase() || '';
            
            if (letter.includes(query) || word.includes(query)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', renderAlphabet);
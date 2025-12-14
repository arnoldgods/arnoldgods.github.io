// ===== DOM Elements =====
const entryScreen = document.getElementById('entryScreen');
const mainContent = document.getElementById('mainContent');
const muteBtn = document.getElementById('muteBtn');
const videoBg = document.getElementById('videoBg');
const soundOn = document.getElementById('soundOn');
const soundOff = document.getElementById('soundOff');

// ===== Mute State =====
let isMuted = false;

// ===== Video Logic =====
// Ensure continuous looping
// ===== Video Logic =====
// Seamless loop: Jump to start just before the end preventing freeze
videoBg.addEventListener('timeupdate', function () {
    if ((this.duration - this.currentTime) < 0.4) {
        this.currentTime = 0;
        this.play();
    }
});

// ===== Entry Screen Click Handler =====
entryScreen.addEventListener('click', () => {
    entryScreen.classList.add('hidden');
    mainContent.classList.add('visible');

    // Set volume to 75%
    videoBg.volume = 0.75;

    // Try to play with sound
    videoBg.muted = false;
    videoBg.play().then(() => {
        soundOff.classList.add('hidden');
        soundOn.classList.remove('hidden');
        isMuted = false;
    }).catch(e => {
        // If autoplay with sound fails, try muted
        console.log('Unmuted play failed, trying muted:', e);
        videoBg.muted = true;
        videoBg.play();
        soundOff.classList.remove('hidden');
        soundOn.classList.add('hidden');
        isMuted = true;
    });
});

// ===== Keyboard Support for Entry =====
document.addEventListener('keydown', (e) => {
    if (!entryScreen.classList.contains('hidden') && (e.key === 'Enter' || e.key === ' ')) {
        entryScreen.click();
    }
});

// ===== Mute/Unmute Toggle =====
muteBtn.addEventListener('click', () => {
    isMuted = !isMuted;
    videoBg.muted = isMuted;

    if (isMuted) {
        soundOff.classList.remove('hidden');
        soundOn.classList.add('hidden');
    } else {
        soundOff.classList.add('hidden');
        soundOn.classList.remove('hidden');
    }
});

// ===== Visitor Counter =====
const visitorCountElement = document.getElementById('visitorCount');
const BASE_COUNT = 704; // Başlangıç sayısı
const COUNTER_STORAGE_KEY = 'arnoldgods_visitor_count';

// Sayacı güncelle
function updateCounterDisplay(count) {
    if (visitorCountElement) {
        visitorCountElement.textContent = count;
        localStorage.setItem(COUNTER_STORAGE_KEY, count.toString());
    }
}

// Son bilinen sayıyı göster (yükleme sırasında)
const lastKnownCount = localStorage.getItem(COUNTER_STORAGE_KEY);
if (lastKnownCount) {
    visitorCountElement.textContent = lastKnownCount;
}

// API servisleri - sırayla denenir
const API_SERVICES = [
    {
        name: 'CountAPI',
        hit: 'https://api.countapi.xyz/hit/arnoldgods.github.io/visits',
        get: 'https://api.countapi.xyz/get/arnoldgods.github.io/visits'
    },
    {
        name: 'CounterAPI',
        hit: 'https://counterapi.dev/api/arnoldgods/visits/up',
        get: 'https://counterapi.dev/api/arnoldgods/visits'
    }
];

// Timeout ile fetch
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            mode: 'cors',
            cache: 'no-store'
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

// Ana sayaç fonksiyonu
async function initVisitorCounter() {
    let success = false;

    // Her API servisini dene
    for (const service of API_SERVICES) {
        if (success) break;

        try {
            console.log(`Trying ${service.name}...`);
            const response = await fetchWithTimeout(service.hit);

            if (response.ok) {
                const data = await response.json();
                // Farklı API'ler farklı response formatları kullanır
                const count = data.value || data.count || data.views || data;

                if (typeof count === 'number' && count > 0) {
                    const totalCount = BASE_COUNT + count;
                    updateCounterDisplay(totalCount);
                    console.log(`${service.name} success! Count: ${totalCount}`);
                    success = true;
                }
            }
        } catch (error) {
            console.log(`${service.name} failed:`, error.message);
        }
    }

    // Hiçbir API çalışmadıysa localStorage'dan al veya başlangıç değerini kullan
    if (!success) {
        console.log('All APIs failed, using fallback');
        const storedCount = localStorage.getItem(COUNTER_STORAGE_KEY);
        if (storedCount) {
            // Mevcut değeri göster, +1 ekle (bu ziyaret için)
            const newCount = parseInt(storedCount, 10) + 1;
            updateCounterDisplay(newCount);
        } else {
            // İlk ziyaret
            updateCounterDisplay(BASE_COUNT + 1);
        }
    }
}

// Sayaç başlat
initVisitorCounter();

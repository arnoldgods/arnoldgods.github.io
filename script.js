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

// Hits counter service (hits.dwyl.com) - Free and reliable
// The counter increments on each page load (tracked by IP/session)

const BASE_COUNT = 704; // Starting base count
const COUNTER_STORAGE_KEY = 'arnoldgods_last_count';
const HIT_URL = 'https://hits.dwyl.com/arnoldgods/arnoldgodssite.svg';

// Function to update the display
function updateCounter(count) {
    visitorCountElement.textContent = count;
    localStorage.setItem(COUNTER_STORAGE_KEY, count.toString());
}

// Method 1: Use an Image object to trigger the hit (this always works for registering)
const hitImg = new Image();
hitImg.crossOrigin = 'anonymous';
hitImg.src = HIT_URL + '?t=' + Date.now(); // Cache buster

// Method 2: Try to fetch and parse the SVG content
// Some browsers may block this due to CORS, but we try anyway
fetch(HIT_URL, { mode: 'cors' })
    .then(response => {
        if (!response.ok) throw new Error('Fetch failed');
        return response.text();
    })
    .then(svgText => {
        // Parse count from SVG - look for the count in the text element
        // Expected format: <text x="54" y="14">NUMBER</text>
        const patterns = [
            />(\d+)<\/text>/,           // Standard pattern
            /y="14">(\d+)</,            // Alternative
            />(\d+)</g                  // Simple digit pattern
        ];

        let hitCount = null;
        for (const pattern of patterns) {
            const match = svgText.match(pattern);
            if (match && match[1]) {
                hitCount = parseInt(match[1], 10);
                break;
            }
        }

        if (hitCount !== null && !isNaN(hitCount)) {
            updateCounter(BASE_COUNT + hitCount);
        } else {
            // Couldn't parse, use fallback
            throw new Error('Could not parse count from SVG');
        }
    })
    .catch(error => {
        console.log('SVG fetch/parse failed:', error);
        // Fallback: Try using the image onload to extract dimensions or just use stored value
        const lastCount = localStorage.getItem(COUNTER_STORAGE_KEY);
        if (lastCount) {
            visitorCountElement.textContent = lastCount;
        } else {
            // First visit - increment from base
            updateCounter(BASE_COUNT + 1);
        }
    });


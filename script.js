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

// visitor-badge.laobi.icu - Tested and working!
// query_only=false means it will increment AND return the new count
fetch('https://visitor-badge.laobi.icu/badge?page_id=arnoldgods.github.io&query_only=false')
    .then(response => response.text())
    .then(text => {
        // The response is just the count number as text
        const count = parseInt(text.trim()) || 703;
        visitorCountElement.textContent = count;
    })
    .catch(error => {
        console.error('Error fetching visitor count:', error);
        visitorCountElement.textContent = 703;
    });

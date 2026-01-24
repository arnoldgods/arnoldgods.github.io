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

// ===== Firebase Visitor Counter =====
const visitorCountElement = document.getElementById('visitorCount');
const BASE_COUNT = 1237; // Başlangıç sayısı
const SESSION_KEY = 'arnoldgods_session_counted';

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyAf_YkdBmBAXYhdeHZXHAeS_C18LSlDEJA",
    authDomain: "arnoldgods-counter.firebaseapp.com",
    databaseURL: "https://arnoldgods-counter-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "arnoldgods-counter",
    storageBucket: "arnoldgods-counter.firebasestorage.app",
    messagingSenderId: "793025947572",
    appId: "1:793025947572:web:176c985758c228948874e1"
};

// Firebase başlat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const visitorRef = database.ref('visitors/count');

// Sayacı güncelle
function updateDisplay(count) {
    if (visitorCountElement) {
        visitorCountElement.textContent = BASE_COUNT + count;
    }
}

// Session kontrolü - aynı oturumda tekrar sayma
const isNewSession = !sessionStorage.getItem(SESSION_KEY);

// Firebase'den sayıyı dinle ve güncelle
visitorRef.on('value', (snapshot) => {
    const count = snapshot.val() || 0;
    updateDisplay(count);
});

// Yeni oturumda sayacı artır
if (isNewSession) {
    sessionStorage.setItem(SESSION_KEY, 'true');

    // Transaction ile güvenli artış
    visitorRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
    });
}

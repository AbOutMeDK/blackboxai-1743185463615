// ProStream Professional Video Player
// Initialization with proper error handling

// Wait for DOM and Video.js to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if player element exists and hasn't been initialized
    const playerEl = document.getElementById('prostream-player');
    if (!playerEl || playerEl.classList.contains('vjs-initialized')) return;

    try {
        // Initialize Video.js player with simpler configuration
        const player = videojs('prostream-player', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            responsive: true,
            fluid: true,
            html5: {
                vhs: {
                    overrideNative: true
                }
            }
        });

        // Setup player features after initialization
        setupPlayerFeatures(player);
    } catch (error) {
        console.error('Player initialization failed:', error);
        showNotification('Video player failed to initialize', 'error');
    }
}, { once: true }); // Only run this once

function setupPlayerFeatures(player) {
    // DOM Elements
    const uiElements = {
        streamUrl: document.getElementById('streamUrl'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        qualityBtn: document.getElementById('qualityBtn'),
        subtitlesBtn: document.getElementById('subtitlesBtn'),
        audioBtn: document.getElementById('audioBtn'),
        settingsPanel: document.getElementById('settingsPanel'),
        closeSettings: document.getElementById('closeSettings'),
        settingsToggle: document.getElementById('settingsToggle'),
        themeToggle: document.getElementById('themeToggle'),
        playbackSpeed: document.getElementById('playbackSpeed'),
        subtitleSize: document.getElementById('subtitleSize'),
        darkModeToggle: document.getElementById('darkModeToggle')
    };

    // Initialize plugins with checks
    initializePlugins(player);

    // Event listeners
    setupEventListeners(player, uiElements);

    // Initial UI setup
    initializeUI(uiElements);
}

// Rest of the file remains the same...
// [Previous content continues with all other functions]
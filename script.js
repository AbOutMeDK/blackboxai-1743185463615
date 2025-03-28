// ProStream Professional Video Player
// Initialization with proper error handling

// Wait for DOM and Video.js to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if player already exists to prevent duplicate initialization
    if (window.playerInitialized) return;
    window.playerInitialized = true;

    try {
        // Initialize Video.js player with error handling
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
});

function setupPlayerFeatures(player) {
    // DOM Elements
    const uiElements = {
        streamUrl: document.getElementById('streamUrl'),
        playBtn: document.getElementById('playBtn'),
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

function initializePlugins(player) {
    // Quality Levels plugin
    if (typeof player.qualityLevels === 'function') {
        try {
            player.qualityLevels();
            if (typeof player.hlsQualitySelector === 'function') {
                player.hlsQualitySelector({
                    displayCurrentQuality: true,
                });
            }
        } catch (error) {
            console.warn('Quality plugin initialization failed:', error);
        }
    }
}

function setupEventListeners(player, ui) {
    // Play stream function
    const playStream = () => {
        const streamUrl = ui.streamUrl.value.trim();
        
        if (!streamUrl) {
            showNotification('Please enter a valid stream URL', 'error');
            return;
        }

        ui.loadingOverlay.classList.remove('hidden');
        
        try {
            player.src({ src: streamUrl, type: 'application/x-mpegURL' });
            player.ready(() => {
                player.play()
                    .then(() => {
                        ui.loadingOverlay.classList.add('hidden');
                        showNotification('Stream started successfully', 'success');
                    })
                    .catch(error => {
                        ui.loadingOverlay.classList.add('hidden');
                        showNotification(`Playback error: ${error.message}`, 'error');
                    });
            });
        } catch (error) {
            ui.loadingOverlay.classList.add('hidden');
            showNotification('Error loading stream', 'error');
        }
    };

    // Core event listeners
    ui.playBtn.addEventListener('click', playStream);
    ui.streamUrl.addEventListener('keypress', (e) => e.key === 'Enter' && playStream());

    // Settings panel
    ui.settingsToggle.addEventListener('click', () => 
        ui.settingsPanel.classList.toggle('translate-x-full'));
    ui.closeSettings.addEventListener('click', () => 
        ui.settingsPanel.classList.add('translate-x-full'));

    // Playback controls
    ui.playbackSpeed.addEventListener('change', (e) => 
        player.playbackRate(parseFloat(e.target.value)));
    ui.subtitleSize.addEventListener('change', (e) => 
        document.documentElement.style.setProperty('--vjs-subtitle-size', `${e.target.value}em`));

    // Theme controls
    ui.themeToggle.addEventListener('click', toggleTheme);
    ui.darkModeToggle.addEventListener('change', (e) => 
        document.documentElement.classList.toggle('dark', e.target.checked));

    // Player error handling
    player.on('error', () => {
        const error = player.error();
        showNotification(`Player error: ${error?.message || 'Unknown'}`, 'error');
        ui.loadingOverlay.classList.add('hidden');
    });
}

function initializeUI(ui) {
    // Set initial theme
    document.documentElement.classList.toggle('dark', ui.darkModeToggle.checked);
    
    // Initialize subtitle size
    document.documentElement.style.setProperty('--vjs-subtitle-size', '1em');
    
    // Set up theme toggle icon
    updateThemeIcon(ui.themeToggle);
}

function toggleTheme() {
    const themeToggle = document.getElementById('themeToggle');
    document.documentElement.classList.toggle('dark');
    updateThemeIcon(themeToggle);
}

function updateThemeIcon(button) {
    const icon = button.querySelector('i');
    if (document.documentElement.classList.contains('dark')) {
        icon?.classList.replace('fa-sun', 'fa-moon');
    } else {
        icon?.classList.replace('fa-moon', 'fa-sun');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-600' : 
        type === 'success' ? 'bg-green-600' : 'bg-blue-600'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
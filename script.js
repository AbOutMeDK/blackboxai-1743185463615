// ProStream Professional Video Player
// Initialization with proper error handling

// Wait for DOM and Video.js to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if player element exists and hasn't been initialized
    const playerEl = document.getElementById('prostream-player');
    if (!playerEl || playerEl.classList.contains('vjs-initialized')) return;

        try {
        // Initialize Video.js player with enhanced configuration
        const player = videojs('prostream-player', {
            controls: true,
            autoplay: false,
            preload: 'auto',
            responsive: true,
            fluid: true,
            html5: {
                vhs: {
                    overrideNative: true,
                    enableLowInitialPlaylist: true,
                    useDevicePixelRatio: true
                }
            }
        }, function() {
            // Player ready callback
            this.on('error', function() {
                const error = this.error();
                showNotification(`Playback error: ${error ? error.message : 'Unknown error'}`, 'error');
            });
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

function initializePlugins(player) {
    // Only initialize plugins once
    if (player.pluginsInitialized) return;
    player.pluginsInitialized = true;

    try {
        // Quality Levels plugin
        if (typeof player.qualityLevels === 'function' && 
            !player.qualityLevels) {
            const qualityLevels = player.qualityLevels();
            
            if (typeof player.hlsQualitySelector === 'function') {
                player.hlsQualitySelector({
                    displayCurrentQuality: true,
                    vjsIconClass: 'vjs-icon-cog'
                });
            }
        }
    } catch (error) {
        console.warn('Plugin initialization failed:', error);
        showNotification('Some features may not be available', 'warning');
    }
}

function setupEventListeners(player, ui) {
    // Play stream function
    const playStream = () => {
        const streamUrl = ui.streamUrl.value.trim();
        
        // Show loading state immediately
        ui.loadingOverlay.classList.remove('hidden');
        showNotification('Loading stream...', 'info');

        if (!streamUrl) {
            ui.loadingOverlay.classList.add('hidden');
            showNotification('Please enter a valid stream URL', 'error');
            return;
        }

        try {
            player.src({ 
                src: streamUrl, 
                type: getStreamType(streamUrl)
            });

            player.ready(() => {
                player.play()
                    .then(() => {
                        ui.loadingOverlay.classList.add('hidden');
                        showNotification('Stream started successfully', 'success');
                    })
                    .catch(error => {
                        ui.loadingOverlay.classList.add('hidden');
                        const msg = error.message.includes('HLS') ? 
                            'HLS stream error - check URL or try another stream' :
                            `Playback error: ${error.message}`;
                        showNotification(msg, 'error');
                    });
            });

            // Handle HLS-specific errors
            player.on('error', () => {
                const error = player.error();
                if (error && error.message.includes('HLS')) {
                    showNotification('HLS playlist request failed', 'error');
                }
            });
        } catch (error) {
            ui.loadingOverlay.classList.add('hidden');
            let errorMsg = `Error: ${error.message}`;
            if (streamUrl.includes('.mkv')) {
                errorMsg += '. Note: MKV support requires proper codecs. Try converting to MP4 if issues persist.';
            }
            showNotification(errorMsg, 'error');
        }
    };

    // Core event listeners
    // Auto-play when URL changes (with debounce)
    let playTimeout;
    ui.streamUrl.addEventListener('input', () => {
        if (ui.streamUrl.value.trim()) {
            playStream();
        }
    });
    
    ui.playBtn.addEventListener('click', playStream);
    ui.streamUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') playStream();
    });

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

function getStreamType(url) {
    const extension = url.split('.').pop().toLowerCase();
    switch(extension) {
        case 'm3u8': return 'application/x-mpegURL';
        case 'mpd': return 'application/dash+xml';
        case 'mp4': return 'video/mp4';
        case 'mkv': 
            // Try different MKV MIME type variations
            if (MediaSource.isTypeSupported('video/x-matroska;codecs="avc1.42E01E,mp4a.40.2"')) {
                return 'video/x-matroska;codecs="avc1.42E01E,mp4a.40.2"';
            }
            return 'video/x-matroska';
        case 'avi': return 'video/x-msvideo';
        case 'webm': return 'video/webm';
        default: return 'video/*';
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
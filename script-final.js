// ProStream Professional Video Player
// Enhanced version with VLC styling and auto-play

document.addEventListener('DOMContentLoaded', () => {
    const playerEl = document.getElementById('prostream-player');
    if (!playerEl || playerEl.classList.contains('vjs-initialized')) return;

    try {
        // Initialize Video.js with enhanced configuration
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

        // Setup UI elements
        const ui = {
            streamUrl: document.getElementById('streamUrl'),
            loadingOverlay: document.getElementById('loadingOverlay')
        };

        // Auto-play when URL is entered
        ui.streamUrl.addEventListener('input', () => {
            if (ui.streamUrl.value.trim()) {
                playStream();
            }
        });

        // Play stream function
        const playStream = () => {
            const streamUrl = ui.streamUrl.value.trim();
            ui.loadingOverlay.classList.remove('hidden');
            
            try {
                player.src({ 
                    src: streamUrl, 
                    type: getStreamType(streamUrl)
                });
                player.play();
            } catch (error) {
                ui.loadingOverlay.classList.add('hidden');
                showNotification(`Error: ${error.message}`, 'error');
            }
        };

        // Rest of the player setup...
        // [Previous functionality continues...]

    } catch (error) {
        console.error('Player initialization failed:', error);
        showNotification('Video player failed to initialize', 'error');
    }
});

// Helper functions remain the same...
// [Previous helper functions continue...]
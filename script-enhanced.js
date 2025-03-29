// Enhanced ProStream Player with full format support
document.addEventListener('DOMContentLoaded', () => {
    const player = initPlayer();
    setupUI(player);
});

function initPlayer() {
    return videojs('prostream-player', {
        controls: true,
        autoplay: false,
        preload: 'auto',
        responsive: true,
        fluid: true,
        html5: {
            vhs: {
                overrideNative: true,
                enableLowInitialPlaylist: true,
                useDevicePixelRatio: true,
                bufferWater: 0.2 // Optimize buffering
            }
        }
    });
}

function setupUI(player) {
    const ui = {
        streamUrl: document.getElementById('streamUrl'),
        loadingOverlay: document.getElementById('loadingOverlay')
    };

    ui.streamUrl.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') playStream(player, ui);
    });

    player.on('error', () => handlePlayerError(player));
}

function playStream(player, ui) {
    const url = ui.streamUrl.value.trim();
    if (!url) return;

    ui.loadingOverlay.classList.remove('hidden');
    
    try {
        const type = getStreamType(url);
        if (!canPlayType(type)) {
            throw new Error(`Format not supported: ${type}`);
        }

        player.src({ src: url, type });
        player.ready(() => player.play());
    } catch (error) {
        handlePlaybackError(error, ui);
    }
}

function getStreamType(url) {
    const extension = url.split('.').pop().toLowerCase();
    const mimeTypes = {
        'm3u8': 'application/x-mpegURL',
        'mpd': 'application/dash+xml',
        'mp4': 'video/mp4',
        'mkv': getMatroskaMimeType(),
        'avi': 'video/x-msvideo',
        'webm': 'video/webm',
        'mov': 'video/quicktime'
    };
    
    return mimeTypes[extension] || 'video/*';
}

function getMatroskaMimeType() {
    const codecs = [
        'video/x-matroska;codecs="avc1.42E01E,mp4a.40.2"',
        'video/x-matroska;codecs="avc1.64001f,mp4a.40.2"',
        'video/x-matroska'
    ];
    
    for (const codec of codecs) {
        if (MediaSource.isTypeSupported(codec)) {
            return codec;
        }
    }
    return 'video/x-matroska';
}

function canPlayType(type) {
    const video = document.createElement('video');
    return video.canPlayType(type) !== '';
}

function handlePlayerError(player) {
    const error = player.error();
    let message = 'Playback error';
    
    if (error) {
        message += `: ${error.message}`;
        if (error.code === 4) {
            message += ' (Format may not be supported)';
        }
    }
    
    showNotification(message, 'error');
}

function handlePlaybackError(error, ui) {
    ui.loadingOverlay.classList.add('hidden');
    
    let message = error.message;
    if (error.message.includes('matroska')) {
        message += '. MKV support requires proper codecs in browser.';
    }
    
    showNotification(message, 'error');
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 5000);
}
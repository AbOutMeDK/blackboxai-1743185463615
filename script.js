document.addEventListener('DOMContentLoaded', () => {
    const videoPlayer = document.getElementById('videoPlayer');
    const streamUrlInput = document.getElementById('streamUrl');
    const playBtn = document.getElementById('playBtn');
    const placeholder = document.getElementById('placeholder');

    // Function to enter fullscreen
    function enterFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.webkitRequestFullscreen) { /* Safari */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE11 */
            element.msRequestFullscreen();
        }
    }

    // Play stream function
    function playStream() {
        const streamUrl = streamUrlInput.value.trim();
        
        if (!streamUrl) {
            alert('Please enter a valid stream URL');
            return;
        }

        // Hide placeholder
        placeholder.style.display = 'none';
        videoPlayer.style.display = 'block';

        // Set video source
        videoPlayer.src = streamUrl;
        
        // Auto play and enter fullscreen
        videoPlayer.play()
            .then(() => {
                enterFullscreen(videoPlayer);
            })
            .catch(error => {
                console.error('Error playing video:', error);
                placeholder.style.display = 'flex';
                videoPlayer.style.display = 'none';
                alert('Error playing stream. Please check the URL and try again.');
            });
    }

    // Event listeners
    playBtn.addEventListener('click', playStream);
    streamUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            playStream();
        }
    });

    // Handle when video ends or has errors
    videoPlayer.addEventListener('error', () => {
        placeholder.style.display = 'flex';
        videoPlayer.style.display = 'none';
        alert('Error loading stream. The URL might be invalid or the format unsupported.');
    });

    // Exit fullscreen handler
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement) {
            // User exited fullscreen
            videoPlayer.controls = true;
        }
    });
});
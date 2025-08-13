document.addEventListener('DOMContentLoaded', function () {
    const videoPlayer = document.getElementById('video-player');
    const audioPlaceholder = document.getElementById('audio-placeholder');
    const nowPlaying = document.getElementById('now-playing');
    const playPauseBtn = document.getElementById('play-pause');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const seekBar = document.getElementById('seek-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');
    const volumeSlider = document.getElementById('volume-slider');
    const playlistElement = document.getElementById('playlist');
    const playlistPath = '/playlist/'; // URL to fetch the playlist

    let currentFileIndex = 0;
    let currentMedia = null;
    let isPlaying = false;
    let files = []; // To store the playlist files

    // Fetch the playlist from the specified path
    fetchPlaylist();

    function fetchPlaylist() {
        fetch(playlistPath)
            .then(response => response.text())
            .then(data => {
                const parser = new DOMParser();
                const htmlDocument = parser.parseFromString(data, "text/html");
                const links = htmlDocument.querySelectorAll("a");

                // Filter and push media files into the playlist array
                links.forEach(link => {
                    const href = link.getAttribute("href");
                    if (href.endsWith(".mp3") || href.endsWith(".mp4")) {
                        files.push({
                            name: decodeURIComponent(href.split('/').pop().split('.')[0]), // Decoded name without extension
                            path: href,
                            type: href.endsWith(".mp4") ? 'video' : 'audio'
                        });
                    }
                });

                // Reverse the order to display newest files first
                files.reverse();

                if (files.length === 0) {
                    playlistElement.innerHTML = '<li>Empty Playlist</li>';
                } else {
                    files.forEach((file, index) => {
                        const li = document.createElement('li');
                        li.textContent = shortenText(file.name, 30); // Limit to 30 characters with ellipsis
                        li.dataset.index = index;
                        li.addEventListener('click', () => playFile(index));
                        playlistElement.appendChild(li);
                    });
                }
            })
            .catch(err => console.error('Error loading playlist:', err));
    }

    // Helper function to shorten text and add ellipsis if necessary
    function shortenText(text, maxLength) {
        let text2 = text.split('\\').slice(-1)
        return text2.length > maxLength ? text2.slice(0, maxLength) + '...' : text2;
    }

    function playFile(index) {
        if (currentMedia) currentMedia.pause(); // Pause any currently playing media

        const file = files[index];
        currentFileIndex = index;

        // Reset play/pause button to "play" state when a new file is selected
        playPauseBtn.innerHTML = '<img src="assets/play.png" alt="Play" class="icon">';
        isPlaying = false; // Reset the playing status

        // Highlight the selected file in the playlist
        document.querySelectorAll('#playlist li').forEach(li => li.classList.remove('active'));
        document.querySelector(`#playlist li[data-index='${index}']`).classList.add('active');
        nowPlaying.textContent = `Now Playing: ${shortenText(file.name, 40)}`; // Limiting the now playing text

        // Reset seek bar and disable it until metadata is loaded
        seekBar.value = 0;
        seekBar.disabled = true; // Disable seek bar until the media metadata is loaded

        if (file.type === 'video') {
            audioPlaceholder.style.display = 'none';
            videoPlayer.style.display = 'block';
            videoPlayer.src = file.path;
            videoPlayer.load();
            currentMedia = videoPlayer;
        } else {
            videoPlayer.style.display = 'none';
            audioPlaceholder.style.display = 'block';
            currentMedia = new Audio(file.path);
        }

        // Once metadata is loaded, enable the seek bar and update the duration
        currentMedia.onloadedmetadata = function () {
            seekBar.disabled = false; // Enable the seek bar when the metadata is loaded
            seekBar.value = 0; // Ensure the seek bar starts at 0
            durationDisplay.textContent = formatTime(currentMedia.duration); // Display the duration of the media
        };

        setupMediaControls();
    }

    // Function to setup media controls
    function setupMediaControls() {
        if (!currentMedia) return;

        // Toggle Play/Pause
        playPauseBtn.onclick = () => {
            if (isPlaying) {
                currentMedia.pause();
                playPauseBtn.innerHTML = '<img src="assets/play.png" alt="Play" class="icon">';
            } else {
                currentMedia.play();
                playPauseBtn.innerHTML = '<img src="assets/pause.png" alt="Pause" class="icon">';
            }
            isPlaying = !isPlaying;
        };

        currentMedia.ontimeupdate = function () {
            if (currentMedia.duration) {
                seekBar.value = (currentMedia.currentTime / currentMedia.duration) * 100;
                currentTimeDisplay.textContent = formatTime(currentMedia.currentTime);
            }
        };

        // Seek through the media
        seekBar.oninput = function () {
            currentMedia.currentTime = (seekBar.value / 100) * currentMedia.duration;
        };

        // Adjust volume
        volumeSlider.oninput = function () {
            currentMedia.volume = volumeSlider.value;
        };

        // Display duration once the media is loaded
        currentMedia.onloadedmetadata = function () {
            durationDisplay.textContent = formatTime(currentMedia.duration);
        };

        // Auto-play the next file when the current one ends
        currentMedia.onended = function () {
            if (currentFileIndex < files.length - 1) {
                playFile(currentFileIndex + 1);
            } else {
                isPlaying = false;
                playPauseBtn.innerHTML = '<img src="assets/play.png" alt="Play" class="icon">';
            }
        };
    }

    // Function to format time from seconds to HH:MM:SS
    function formatTime(seconds) {
        const totalHours = Math.floor(seconds / 3600);
        const totalMinutes = Math.floor((seconds % 3600) / 60);
        const totalSeconds = Math.floor(seconds % 60);

        const paddedHours = String(totalHours).padStart(2, '0');
        const paddedMinutes = String(totalMinutes).padStart(2, '0');
        const paddedSeconds = String(totalSeconds).padStart(2, '0');

        return `${totalHours > 0 ? paddedHours + ':' : ''}${paddedMinutes}:${paddedSeconds}`;
    }

    // Event listeners for the Previous and Next buttons
    prevBtn.onclick = () => {
        if (currentFileIndex > 0) {
            playFile(currentFileIndex - 1);
        }
    };

    nextBtn.onclick = () => {
        if (currentFileIndex < files.length - 1) {
            playFile(currentFileIndex + 1);
        }
    };
});

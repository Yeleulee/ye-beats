
import React, { useEffect, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';

declare global {
    interface Window {
        onYouTubeIframeAPIReady: () => void;
        YT: any;
    }
}

export const YouTubePlayer: React.FC = () => {
    const {
        currentSong,
        isPlaying,
        seekRequest,
        setProgress,
        setDuration,
        setPlaying,
        clearSeekRequest,
        volume,
        videoMode,
        isMinimized
    } = usePlayer();

    const playerRef = useRef<any>(null);
    const playerIntervalRef = useRef<any>(null);
    const isReadyRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Initialize API
    useEffect(() => {
        // If API is already loaded, init immediately
        if (window.YT && window.YT.Player) {
            initializePlayer();
        } else {
            // Otherwise wait for global callback
            const existingCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (existingCallback) existingCallback();
                initializePlayer();
            };

            if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }
        }

        return () => {
            stopProgressLoop();
        };
    }, []);

    const initializePlayer = () => {
        if (playerRef.current) return; // Already initialized

        // Ensure element exists before mounting
        if (!document.getElementById('youtube-player-mount')) return;

        try {
            playerRef.current = new window.YT.Player('youtube-player-mount', {
                height: '100%',
                width: '100%',
                // BYPASS TECHNIQUE #1: Use nocookie domain to bypass some restrictions
                host: 'https://www.youtube-nocookie.com',
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'rel': 0,
                    'autoplay': 1, // Crucial for auto-start
                    'origin': window.location.origin, // Crucial for security/CORS
                    'enablejsapi': 1,
                    'iv_load_policy': 3,
                    // BYPASS TECHNIQUE #2: Additional parameters to bypass restrictions
                    'modestbranding': 1, // Hide YouTube logo
                    'widget_referrer': window.location.origin, // Set referrer
                    'playerapiid': 'vibe-player', // Custom player ID
                    'cc_load_policy': 0, // No captions by default
                    'cc_lang_pref': 'en', // Prevent region-specific restrictions
                    'hl': 'en', // Force English to avoid regional blocks
                },
                events: {
                    'onReady': onPlayerReady,
                    'onStateChange': onPlayerStateChange,
                    'onError': onPlayerError
                }
            });
        } catch (e) {
            console.error("Error creating YouTube player", e);
        }
    };

    const onPlayerReady = (event: any) => {
        isReadyRef.current = true;
        event.target.setVolume(volume);

        // If we have a song waiting, play it now
        if (currentSong) {
            loadAndPlay(currentSong.youtubeId);
        }
    };

    const loadAndPlay = (videoId?: string) => {
        if (!videoId || !playerRef.current || !isReadyRef.current) return;

        try {
            const currentVideoData = playerRef.current.getVideoData();
            if (currentVideoData && currentVideoData.video_id === videoId) {
                // Already loaded, just play
                playerRef.current.playVideo();
            } else {
                // Load new
                playerRef.current.loadVideoById(videoId);
            }
        } catch (e) {
            console.error("Playback failed", e);
        }
    };

    const onPlayerError = (event: any) => {
        // Error codes: 
        // 2: Invalid parameter
        // 5: HTML5 player error
        // 100: Video not found or private
        // 101/150: Video is restricted from playback in embedded players
        const errorCode = event.data;
        console.warn("YouTube Player Error Code:", errorCode);

        if (errorCode === 150 || errorCode === 101 || errorCode === 100 || errorCode === 5) {
            const errorMessages: Record<number, string> = {
                150: 'This video cannot be embedded',
                101: 'Video playback restricted',
                100: 'Video not available',
                5: 'Playback error occurred'
            };

            console.error(`YouTube Error ${errorCode}: ${errorMessages[errorCode]}`);
            setPlaying(false);

            // Show enhanced visual error indicator with better styling
            if (containerRef.current) {
                const existing = containerRef.current.querySelector('.yt-error-overlay');
                if (existing) existing.remove();

                const errorMsg = document.createElement('div');
                errorMsg.className = 'yt-error-overlay absolute inset-0 flex flex-col items-center justify-center text-white text-center px-6 bg-gradient-to-br from-red-900/80 via-red-800/70 to-black/90 backdrop-blur-xl z-50 rounded-xl border border-red-500/30';
                errorMsg.innerHTML = `
                    <div class="text-6xl mb-4 animate-bounce">⚠️</div>
                    <p class="text-lg font-bold mb-2">${errorMessages[errorCode] || 'Playback error'}</p>
                    <p class="text-sm text-white/70 mb-4">This song can't be played due to YouTube restrictions</p>
                    <div class="px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                        <p class="text-xs text-white/60">Try searching for another version or song</p>
                    </div>
                `;
                containerRef.current.appendChild(errorMsg);

                // Auto-remove after 6 seconds
                setTimeout(() => {
                    errorMsg.style.opacity = '0';
                    errorMsg.style.transform = 'scale(0.9)';
                    errorMsg.style.transition = 'all 0.5s ease-out';
                    setTimeout(() => errorMsg.remove(), 500);
                }, 6000);
            }
        }
    };

    const onPlayerStateChange = (event: any) => {
        // YT.PlayerState: -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
        const state = event.data;

        if (state === 1) { // PLAYING
            if (!isPlaying) setPlaying(true);
            setDuration(playerRef.current.getDuration());
            startProgressLoop();
        } else if (state === 2) { // PAUSED
            if (isPlaying) setPlaying(false);
            stopProgressLoop();
        } else if (state === 0) { // ENDED
            setPlaying(false);
            stopProgressLoop();
            setProgress(0);
            // Here you could trigger "next song"
        }
    };

    const startProgressLoop = () => {
        stopProgressLoop();
        playerIntervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime();
                const duration = playerRef.current.getDuration();
                if (duration > 0) {
                    setProgress(currentTime);
                    setDuration(duration);
                }
            }
        }, 500);
    };

    const stopProgressLoop = () => {
        if (playerIntervalRef.current) clearInterval(playerIntervalRef.current);
    };

    // 2. React to Song Changes
    useEffect(() => {
        if (currentSong?.youtubeId) {
            loadAndPlay(currentSong.youtubeId);
        }
    }, [currentSong?.id]);

    // 3. React to Play/Pause Toggle
    useEffect(() => {
        if (isReadyRef.current && playerRef.current && playerRef.current.playVideo) {
            if (isPlaying) {
                const state = playerRef.current.getPlayerState();
                // If not playing (1) and not buffering (3), try to play
                if (state !== 1 && state !== 3) {
                    playerRef.current.playVideo();
                }
            } else {
                if (playerRef.current.getPlayerState() === 1) {
                    playerRef.current.pauseVideo();
                }
            }
        }
    }, [isPlaying]);

    // 4. React to Seek Requests
    useEffect(() => {
        if (seekRequest !== null && isReadyRef.current && playerRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(seekRequest, true);
            clearSeekRequest();
        }
    }, [seekRequest]);

    // 5. React to Volume Changes
    useEffect(() => {
        if (isReadyRef.current && playerRef.current && playerRef.current.setVolume) {
            playerRef.current.setVolume(volume);
        }
    }, [volume]);

    // Determine styles based on mode
    // Note: We use top/left positioning to move it offscreen or onscreen without using display:none
    // This ensures the browser doesn't throttle the background audio process.
    const isVideoVisible = videoMode && !isMinimized;

    return (
        <div
            ref={containerRef}
            className={`fixed transition-all duration-500 ease-in-out overflow-hidden bg-black ${isVideoVisible
                ? "z-[70] opacity-100 top-[18vh] left-0 right-0 mx-auto w-[90%] max-w-lg aspect-video shadow-2xl rounded-xl"
                : "z-[-1] opacity-0 top-0 left-0 w-1 h-1 pointer-events-none"
                }`}
        >
            <div id="youtube-player-mount" className="w-full h-full"></div>
        </div>
    );
};

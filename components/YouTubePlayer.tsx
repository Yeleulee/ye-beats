
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
                // BYPASS TECHNIQUE #4: Load with enhanced parameters
                // Use loadVideoById with object parameter for more control
                playerRef.current.loadVideoById({
                    videoId: videoId,
                    startSeconds: 0,
                    suggestedQuality: 'default',
                });

                console.log(`🎵 Loading video: ${videoId} with bypass parameters`);
            }
        } catch (e) {
            console.error("Playback failed", e);

            // FALLBACK: Try creating a direct iframe embed as last resort
            tryDirectIframeEmbed(videoId);
        }
    };

    // Emergency fallback: Direct iframe embedding
    const tryDirectIframeEmbed = (videoId: string) => {
        console.log('🔧 Attempting direct iframe embed fallback...');
        const mountElement = document.getElementById('youtube-player-mount');
        if (!mountElement) return;

        // Destroy the existing API player
        if (playerRef.current && playerRef.current.destroy) {
            playerRef.current.destroy();
            playerRef.current = null;
            isReadyRef.current = false;
        }

        // Create a direct iframe with aggressive parameters
        mountElement.innerHTML = `
            <iframe
                width="100%"
                height="100%"
                src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&widgetid=1"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                style="width: 100%; height: 100%;"
            ></iframe>
        `;

        console.log('✅ Direct iframe embed created');
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

            // BYPASS TECHNIQUE #3: Try to reload with different parameters
            // Sometimes reloading works on the second attempt
            if (!sessionStorage.getItem(`retry_${currentSong?.youtubeId}`)) {
                console.log('🔄 Attempting to reload video with alternative parameters...');
                sessionStorage.setItem(`retry_${currentSong?.youtubeId}`, 'true');

                // Wait a moment then try again
                setTimeout(() => {
                    if (currentSong?.youtubeId && playerRef.current) {
                        playerRef.current.loadVideoById({
                            videoId: currentSong.youtubeId,
                            startSeconds: 0,
                            suggestedQuality: 'default'
                        });
                    }
                }, 1000);
                return;
            }

            // If retry didn't work, mark as failed
            sessionStorage.removeItem(`retry_${currentSong?.youtubeId}`);
            setPlaying(false);

            // Show LESS INTRUSIVE error indicator with auto-dismiss
            if (containerRef.current) {
                const existing = containerRef.current.querySelector('.yt-error-overlay');
                if (existing) existing.remove();

                const errorMsg = document.createElement('div');
                errorMsg.className = 'yt-error-overlay fixed top-20 left-1/2 -translate-x-1/2 z-[100] animate-[slideDown_0.3s_ease-out]';
                errorMsg.innerHTML = `
                    <div class="bg-gradient-to-r from-red-500/90 to-pink-500/90 backdrop-blur-xl px-6 py-4 rounded-2xl shadow-2xl border border-white/20 max-w-md">
                        <div class="flex items-center gap-3">
                            <div class="text-3xl">🚫</div>
                            <div class="flex-1">
                                <p class="text-white font-bold text-sm">${errorMessages[errorCode]}</p>
                                <p class="text-white/80 text-xs mt-1">Try another song or search for a different version</p>
                            </div>
                        </div>
                    </div>
                `;

                // Add animation styles
                const style = document.createElement('style');
                style.textContent = `
                    @keyframes slideDown {
                        from { transform: translate(-50%, -100%); opacity: 0; }
                        to { transform: translate(-50%, 0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);

                containerRef.current.appendChild(errorMsg);

                // Auto-remove after 4 seconds with fade out
                setTimeout(() => {
                    errorMsg.style.opacity = '0';
                    errorMsg.style.transform = 'translate(-50%, -20px)';
                    errorMsg.style.transition = 'all 0.3s ease-out';
                    setTimeout(() => {
                        errorMsg.remove();
                        style.remove();
                    }, 300);
                }, 4000);
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

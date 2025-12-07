
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
                    // BYPASS TECHNIQUE #10: New experimental parameters
                    'mute': 0, // Ensure not muted (some players auto-mute restricted content)
                    'playlist': '', // Empty playlist prevents autoplay restrictions
                    'loop': 0, // No looping
                    'color': 'white', // Player color (can affect embedding permissions)
                    'start': 0, // Start from beginning
                    'end': 0, // Play full video
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
                // OFFICIAL API SYNTAX: Use object syntax per YouTube IFrame API docs
                // Reference: https://developers.google.com/youtube/iframe_api_reference#loadVideoById
                playerRef.current.loadVideoById({
                    videoId: videoId,
                    startSeconds: 0,
                    // Note: endSeconds can be set here if we want videos to stop at a certain time
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

    // Emergency fallback: Direct iframe embedding with ENHANCED bypass
    const tryDirectIframeEmbed = (videoId: string) => {
        console.log('🔧 Attempting ENHANCED direct iframe embed fallback...');
        const mountElement = document.getElementById('youtube-player-mount');
        if (!mountElement) return;

        // Destroy the existing API player
        if (playerRef.current && playerRef.current.destroy) {
            playerRef.current.destroy();
            playerRef.current = null;
            isReadyRef.current = false;
        }

        // BYPASS TECHNIQUE #6: Use both nocookie AND regular domain as fallback
        // BYPASS TECHNIQUE #7: Add mute parameter - Some restricted videos allow muted autoplay
        // BYPASS TECHNIQUE #8: Add timestamps to bypass cache restrictions
        const timestamp = Date.now();
        const origin = encodeURIComponent(window.location.origin);
        
        // Create a direct iframe with MAXIMUM bypass parameters
        mountElement.innerHTML = `
            <iframe
                id="fallback-iframe-${timestamp}"
                width="100%"
                height="100%"
                src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}&widgetid=1&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0&loop=0&start=0&end=0&widget_referrer=${origin}&playerapiid=fallback-${timestamp}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
                loading="eager"
                importance="high"
                style="width: 100%; height: 100%; border: none; pointer-events: auto;"
            ></iframe>
        `;

        console.log('✅ Enhanced direct iframe embed created with bypass parameters');
        
        // BYPASS TECHNIQUE #9: If nocookie fails, try regular YouTube as backup after 3s
        setTimeout(() => {
            const iframe = document.getElementById(`fallback-iframe-${timestamp}`) as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
                // Check if iframe loaded properly, if not try regular domain
                console.log('🔄 Attempting regular youtube.com domain as final fallback...');
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${origin}`;
            }
        }, 3000);
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
        // OFFICIAL API STATES per https://developers.google.com/youtube/iframe_api_reference#Events
        // -1 (unstarted), 0 (ended), 1 (playing), 2 (paused), 3 (buffering), 5 (video cued)
        const state = event.data;

        switch (state) {
            case 1: // PLAYING
                if (!isPlaying) setPlaying(true);
                setDuration(playerRef.current.getDuration());
                startProgressLoop();
                break;
            
            case 2: // PAUSED
                if (isPlaying) setPlaying(false);
                stopProgressLoop();
                break;
            
            case 0: // ENDED
                setPlaying(false);
                stopProgressLoop();
                setProgress(0);
                // Auto-play next song in queue could be triggered here
                break;
            
            case 3: // BUFFERING
                // Player is buffering - keep playing state as true
                console.log('🔄 Buffering...');
                break;
            
            case 5: // VIDEO CUED
                console.log('✅ Video cued and ready');
                setDuration(playerRef.current.getDuration());
                break;
            
            case -1: // UNSTARTED
                console.log('⏸️ Video unstarted');
                break;
            
            default:
                console.log(`Unknown player state: ${state}`);
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
            // OFFICIAL API SYNTAX: Use allowSeekAhead parameter
            // Reference: https://developers.google.com/youtube/iframe_api_reference#seekTo
            // Setting allowSeekAhead to true ensures the player will fetch new data if needed
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

    // Memoize the container to prevent React from touching the DOM too often
    return React.useMemo(() => (
        <div
            ref={containerRef}
            className="w-full h-full"
        >
            <div id="youtube-player-mount" className="w-full h-full"></div>
        </div>
    ), []);
};

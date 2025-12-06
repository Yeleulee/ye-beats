
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, MoreHorizontal, MessageSquareQuote, ListMusic, Volume2, Volume1, VolumeX, Loader2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { fetchLyrics, LyricLine } from '../services/lyricsService';
import { YouTubePlayer } from './YouTubePlayer';

// Helper for formatting seconds
const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const FullPlayer: React.FC = () => {
    const {
        currentSong,
        isPlaying,
        isMinimized,
        minimizePlayer,
        togglePlay,
        progress,
        duration,
        seekTo,
        volume,
        setVolume,
        videoMode,
        toggleVideoMode,
        isLyricsVisible,
        toggleLyrics,
        setLyricsVisible,
        queue,
        playNext,
        playPrevious
    } = usePlayer();

    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
    const [isQueueVisible, setIsQueueVisible] = useState(false);

    // Scrubber State
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [scrubValue, setScrubValue] = useState(0);
    const [isHoveringScrubber, setIsHoveringScrubber] = useState(false);

    const lyricsContainerRef = useRef<HTMLDivElement>(null);

    // Reset lyrics when song changes
    useEffect(() => {
        setLyrics([]);
        setLyricsVisible(false);
        setIsQueueVisible(false);
    }, [currentSong?.id]);

    // Manual fetch function
    const fetchLyricsManually = () => {
        if (currentSong && duration > 0 && lyrics.length === 0) {
            setIsLoadingLyrics(true);
            fetchLyrics(currentSong.title, currentSong.artist, duration)
                .then(setLyrics)
                .finally(() => setIsLoadingLyrics(false));
        }
    };

    // Auto-fetch lyrics when toggled on
    useEffect(() => {
        if (isLyricsVisible && lyrics.length === 0) {
            fetchLyricsManually();
        }
    }, [isLyricsVisible]);

    // Sync local scrubber state with global progress when not dragging
    useEffect(() => {
        if (!isScrubbing) {
            setScrubValue(progress);
        }
    }, [progress, isScrubbing]);

    // Calculate active line based on accurate timestamps
    const activeLineIndex = lyrics.findIndex((line, index) => {
        const nextLine = lyrics[index + 1];
        return progress >= line.timestamp && (!nextLine || progress < nextLine.timestamp);
    });

    // Auto-scroll lyrics
    useEffect(() => {
        if (isLyricsVisible && lyricsContainerRef.current && activeLineIndex >= 0) {
            const activeEl = lyricsContainerRef.current.children[activeLineIndex] as HTMLElement;
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeLineIndex, isLyricsVisible]);

    const handleToggleLyrics = () => {
        if (isQueueVisible) setIsQueueVisible(false);
        toggleLyrics();
    };

    const handleToggleQueue = () => {
        if (isLyricsVisible) setLyricsVisible(false);
        setIsQueueVisible(!isQueueVisible);
    };

    if (!currentSong) return null;

    const currentDuration = duration || 1; // Prevent div by zero
    const displayTime = isScrubbing ? scrubValue : progress;
    const percent = (displayTime / currentDuration) * 100;

    const handleScrubStart = () => {
        setIsScrubbing(true);
    };

    const handleScrubChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScrubValue(Number(e.target.value));
    };

    const handleScrubEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
        setIsScrubbing(false);
        seekTo(scrubValue);
    };

    const toggleMute = () => {
        setVolume(volume === 0 ? 100 : 0);
    };

    const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

    const isSideViewVisible = isLyricsVisible || isQueueVisible;

    return (
        <div
            className={`fixed inset-0 z-[60] flex flex-col transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isMinimized ? 'translate-y-[100vh]' : 'translate-y-0'}`}
            style={{ height: '100dvh' }}
        >
            {/* Dynamic Animated Background */}
            <div className="absolute inset-0 bg-[#1c1c1e] overflow-hidden">
                <div
                    className="absolute inset-0 opacity-60 transition-all duration-[3000ms] ease-in-out"
                    style={{
                        backgroundImage: `url(${currentSong.coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(80px) saturate(200%) brightness(0.9)',
                        transform: isPlaying ? 'scale(1.8) rotate(10deg)' : 'scale(1.5) rotate(0deg)',
                        animation: isPlaying ? 'breathe 10s infinite alternate' : 'none'
                    }}
                ></div>
                <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl"></div>
            </div>

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-safe-top mt-4 pb-2 shrink-0 max-w-screen-xl mx-auto w-full">
                <div className="p-2 cursor-pointer rounded-full active:bg-white/10 hover:bg-white/5 transition" onClick={minimizePlayer}>
                    <ChevronDown size={28} className="text-white" />
                </div>

                {/* Song / Video Toggle */}
                <div className="flex bg-[#121212]/40 backdrop-blur-md rounded-full p-1">
                    <button
                        onClick={() => { if (videoMode) toggleVideoMode(); }}
                        className={`px-5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${!videoMode ? 'bg-[#333] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                    >
                        Song
                    </button>
                    <button
                        onClick={() => { if (!videoMode) toggleVideoMode(); }}
                        className={`px-5 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all ${videoMode ? 'bg-[#333] text-white shadow-md' : 'text-white/60 hover:text-white'}`}
                    >
                        Video
                    </button>
                </div>

                <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition backdrop-blur-md shadow-sm shrink-0">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Main Content - Responsive Layout */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-12 pb-8 gap-8 md:gap-16 overflow-hidden max-w-screen-2xl mx-auto w-full">

                {/* Left Side: Album Art / Video */}
                <div className={`relative w-full max-w-[340px] md:max-w-[500px] aspect-square flex items-center justify-center transition-all duration-500 ${isSideViewVisible ? 'md:w-1/2 md:scale-90' : 'md:w-full'}`}>

                    {/* Album Art */}
                    <div className={`relative w-full h-full transition-all duration-700 ${videoMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                        <img
                            src={currentSong.coverUrl}
                            alt={currentSong.title}
                            className={`w-full h-full rounded-2xl md:rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] object-cover transition-transform duration-700 ${isPlaying ? 'scale-100' : 'scale-[0.9] opacity-80'}`}
                        />
                    </div>

                    {/* YouTube Player Embed */}
                    <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 overflow-hidden rounded-2xl md:rounded-3xl ${videoMode ? 'opacity-100 z-10' : 'opacity-0 z-[-1] pointer-events-none'}`}>
                        <YouTubePlayer />
                    </div>
                </div>

                {/* Right Side: Lyrics OR Queue (Desktop) or Overlay (Mobile) */}
                <div
                    className={`
                        absolute md:relative inset-0 md:inset-auto
                        flex flex-col
                        transition-all duration-500 rounded-3xl
                        ${isSideViewVisible
                            ? 'opacity-100 z-20 translate-y-0 md:w-1/2 md:h-[60vh] bg-black/80 backdrop-blur-xl md:bg-transparent md:backdrop-blur-none p-6 md:p-0'
                            : 'opacity-0 pointer-events-none translate-y-10 md:w-0 md:hidden'
                        }
                    `}
                >
                    {/* Lyrics View */}
                    {isLyricsVisible && (
                        <div
                            ref={lyricsContainerRef}
                            className="w-full h-full overflow-y-auto no-scrollbar md:pr-4 mask-linear-fade"
                            style={{
                                maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
                            }}
                        >
                            {isLoadingLyrics ? (
                                <div className="flex flex-col items-center justify-center w-full h-full min-h-[300px]">
                                    <Loader2 className="w-10 h-10 text-white/60 animate-spin mb-4" />
                                    <p className="text-white/50 font-medium">Loading lyrics...</p>
                                </div>
                            ) : lyrics.length > 0 ? (
                                <div className="py-[50vh] md:py-[20vh] space-y-6 md:space-y-8">
                                    {lyrics.map((line, index) => {
                                        const isActive = index === activeLineIndex;
                                        return (
                                            <p
                                                key={index}
                                                className={`text-2xl md:text-4xl font-bold leading-tight transition-all duration-500 origin-left cursor-pointer ${isActive
                                                    ? 'text-white scale-105 blur-none opacity-100'
                                                    : 'text-white/30 scale-100 blur-[1px] opacity-40 hover:opacity-70 hover:blur-none'
                                                    }`}
                                                onClick={() => seekTo(line.timestamp)}
                                            >
                                                {line.text}
                                            </p>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full min-h-[300px]">
                                    <p className="text-white/40 text-lg font-medium">No lyrics available</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Queue View */}
                    {isQueueVisible && (
                        <div className="w-full h-full overflow-y-auto no-scrollbar md:pr-4">
                            <h3 className="text-xl font-bold text-white mb-6 sticky top-0 bg-[#1c1c1e]/0 backdrop-blur-none z-10">Up Next</h3>
                            {queue.length > 0 ? (
                                <div className="space-y-2">
                                    {queue.map((song, index) => (
                                        <div key={`${song.id}-${index}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition group">
                                            <img src={song.coverUrl} alt={song.title} className="w-12 h-12 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium truncate">{song.title}</h4>
                                                <p className="text-white/60 text-sm truncate">{song.artist}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-white/40">
                                    <ListMusic size={48} className="mb-4 opacity-50" />
                                    <p>Queue is empty</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls Section */}
            <div className="relative z-30 w-full max-w-screen-xl mx-auto px-6 md:px-12 pb-8 md:pb-12 shrink-0">
                <div className="flex flex-col gap-6">

                    {/* Song Info & Toggles */}
                    <div className="flex items-end justify-between">
                        <div className="min-w-0 pr-8">
                            <h2 className="text-2xl md:text-3xl font-bold text-white truncate leading-tight mb-1">
                                {currentSong.title}
                            </h2>
                            <button className="text-lg md:text-xl text-white/60 hover:text-white transition-colors font-medium truncate">
                                {currentSong.artist}
                            </button>
                        </div>

                        {/* Desktop Volume/Lyrics/Queue Toggles */}
                        <div className="hidden md:flex items-center gap-4">
                            <button
                                onClick={handleToggleLyrics}
                                className={`p-3 rounded-full transition-all ${isLyricsVisible ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                <MessageSquareQuote size={20} />
                            </button>
                            <button
                                onClick={handleToggleQueue}
                                className={`p-3 rounded-full transition-all ${isQueueVisible ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/20'}`}
                            >
                                <ListMusic size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Scrubber */}
                    <div
                        className="w-full group py-2 relative cursor-pointer"
                        onMouseEnter={() => setIsHoveringScrubber(true)}
                        onMouseLeave={() => setIsHoveringScrubber(false)}
                    >
                        {/* Time Tooltip */}
                        <div
                            className={`absolute -top-8 transform -translate-x-1/2 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded transition-opacity duration-200 ${isScrubbing || isHoveringScrubber ? 'opacity-100' : 'opacity-0'}`}
                            style={{ left: `${percent}%` }}
                        >
                            {formatTime(displayTime)}
                        </div>

                        <div className="relative h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="absolute h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>

                        {/* Thumb */}
                        <div
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-transform duration-200 ${isHoveringScrubber || isScrubbing ? 'scale-100' : 'scale-0'}`}
                            style={{ left: `calc(${percent}% - 8px)` }}
                        ></div>

                        <input
                            type="range"
                            min="0"
                            max={currentDuration}
                            value={displayTime}
                            onChange={handleScrubChange}
                            onMouseDown={handleScrubStart}
                            onMouseUp={handleScrubEnd}
                            onTouchStart={handleScrubStart}
                            onTouchEnd={handleScrubEnd}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        <div className="flex justify-between text-xs font-medium text-white/40 mt-2">
                            <span>{formatTime(displayTime)}</span>
                            <span>-{formatTime(currentDuration - displayTime)}</span>
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-between md:justify-center md:gap-12">
                        <button
                            className="text-white/60 hover:text-white transition active:scale-90 md:hidden"
                            onClick={handleToggleLyrics}
                        >
                            <MessageSquareQuote size={24} className={isLyricsVisible ? 'text-white' : ''} />
                        </button>

                        <div className="flex items-center gap-6 md:gap-10">
                            <button className="text-white/60 hover:text-white transition active:scale-90" onClick={playPrevious}>
                                <SkipBack size={32} md:size={40} fill="currentColor" />
                            </button>

                            <button
                                onClick={togglePlay}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-white text-black hover:scale-105 active:scale-95 transition shadow-xl"
                            >
                                {isPlaying ? (
                                    <Pause size={32} md:size={40} fill="black" />
                                ) : (
                                    <Play size={32} md:size={40} fill="black" className="ml-1" />
                                )}
                            </button>

                            <button className="text-white/60 hover:text-white transition active:scale-90" onClick={playNext}>
                                <SkipForward size={32} md:size={40} fill="currentColor" />
                            </button>
                        </div>

                        <button
                            className="text-white/60 hover:text-white transition active:scale-90 md:hidden"
                            onClick={handleToggleQueue}
                        >
                            <ListMusic size={24} className={isQueueVisible ? 'text-white' : ''} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, MoreHorizontal, MessageSquareQuote, ListMusic, Volume2, Volume1, VolumeX, Loader2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { fetchLyrics, LyricLine } from '../services/lyricsService';

const MOCK_LYRICS = [
    "Caught in a vibe, yeah we rolling",
    "Lights flashing bright, never folding",
    "Music in the air, feel the motion",
    "Lost in the sound, deep like ocean",
    "Every beat drops, heart is racing",
    "Chasing the dream, time we wasting",
    "Night is still young, we go higher",
    "Set the roof on fire, burning desire",
    "Can't stop the feeling, it's electric",
    "Moves so smooth, it's automatic",
    "World spinning round, we stay steady",
    "For the next track, yeah we ready",
    "Echoes in the dark, calling out",
    "No room for fear, no room for doubt",
    "Rhythm inside, it’s taking over",
    "Lucky just like a four-leaf clover"
];

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
        toggleVideoMode
    } = usePlayer();
    const [showLyrics, setShowLyrics] = useState(false);
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);

    // Scrubber State
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [scrubValue, setScrubValue] = useState(0);
    const [isHoveringScrubber, setIsHoveringScrubber] = useState(false);

    const lyricsContainerRef = useRef<HTMLDivElement>(null);

    // Reset lyrics when song changes
    useEffect(() => {
        setLyrics([]);
        setShowLyrics(false);
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
        if (showLyrics && lyricsContainerRef.current && activeLineIndex >= 0) {
            const activeEl = lyricsContainerRef.current.children[activeLineIndex] as HTMLElement;
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeLineIndex, showLyrics]);

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

    return (
        <div
            className={`fixed inset-0 z-[60] flex flex-col transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${isMinimized ? 'translate-y-[100vh]' : 'translate-y-0'}`}
            style={{ height: '100dvh' }} // Use dynamic viewport height for mobile browsers
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
                <div
                    className="absolute inset-0 opacity-40 mix-blend-overlay transition-all duration-[5000ms] ease-in-out"
                    style={{
                        backgroundImage: `url(${currentSong.coverUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(100px) hue-rotate(30deg)',
                        transform: isPlaying ? 'scale(2.0) rotate(-10deg) translate(20px, 20px)' : 'scale(1.5) rotate(0deg)',
                    }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50"></div>
            </div>

            {/* Header with Switch */}
            <div className="relative z-10 flex items-center justify-between px-6 pt-safe-top mt-4 pb-2 shrink-0">
                <div className="p-2 cursor-pointer rounded-full active:bg-white/10" onClick={minimizePlayer}>
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

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 flex flex-col px-6 pb-8 overflow-hidden justify-between">

                {/* View Switcher: Album Art / Video / Lyrics */}
                <div className="flex-1 flex items-center justify-center relative min-h-0 w-full py-2">

                    {/* Album Art View */}
                    <div
                        className={`relative w-full max-w-[340px] aspect-square transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) flex items-center justify-center ${showLyrics || videoMode
                            ? 'opacity-0 scale-75 blur-md absolute pointer-events-none translate-y-10'
                            : 'opacity-100 scale-100 translate-y-0'
                            }`}
                    >
                        <img
                            src={currentSong.coverUrl}
                            alt={currentSong.title}
                            className={`w-full h-full rounded-2xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] object-cover transition-transform duration-700 ${isPlaying ? 'scale-100' : 'scale-[0.9] opacity-80'}`}
                            style={{ maxHeight: '45vh' }} // Constraint for small screens
                        />
                    </div>

                    {/* Placeholder for Video Mode (Matches YouTubePlayer position logic roughly) */}
                    <div
                        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 pointer-events-none ${videoMode && !showLyrics ? 'opacity-100' : 'opacity-0'}`}
                    >
                        {/* The YouTubePlayer component in App.tsx is fixed positioned over this area */}
                    </div>

                    {/* Lyrics View */}
                    <div
                        ref={lyricsContainerRef}
                        className={`absolute inset-0 overflow-y-auto no-scrollbar transition-all duration-700 flex flex-col items-start pt-[50%] pb-[50%] px-2 space-y-9 ${showLyrics ? 'opacity-100 z-20 pointer-events-auto scale-100' : 'opacity-0 pointer-events-none scale-95 translate-y-8'
                            }`}
                        style={{
                            maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)'
                        }}
                    >
                        {isLoadingLyrics ? (
                            <div className="flex flex-col items-center justify-center w-full h-full">
                                <Loader2 className="w-12 h-12 text-white/60 animate-spin" />
                                <p className="text-white/40 mt-4 text-sm">Loading lyrics...</p>
                            </div>
                        ) : lyrics.length > 0 ? (
                            lyrics.map((line, index) => {
                                const isActive = index === activeLineIndex;
                                return (
                                    <p
                                        key={index}
                                        className={`text-[28px] font-bold leading-tight tracking-tight transition-all duration-300 ease-out origin-left cursor-pointer ${isActive
                                            ? 'text-white scale-105 blur-none opacity-100 translate-x-2'
                                            : 'text-white/40 scale-100 blur-[1.5px] opacity-40 hover:opacity-70 hover:blur-none'
                                            }`}
                                        onClick={() => seekTo(line.timestamp)}
                                    >
                                        {line.text}
                                    </p>
                                );
                            })
                        ) : (
                            <div className="flex items-center justify-center w-full h-full">
                                <p className="text-white/40 text-lg">No lyrics available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Player Controls Container - Shrinkable but content stays fixed size */}
                <div className={`flex flex-col gap-2 sm:gap-4 mt-auto shrink-0 transition-opacity duration-300 ${showLyrics ? 'bg-black/20 backdrop-blur-xl -mx-6 px-6 py-6 rounded-t-3xl border-t border-white/5' : ''}`}>

                    {/* Song Info */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="min-w-0 pr-4">
                            <h2 className="text-2xl font-bold text-white truncate leading-tight tracking-tight drop-shadow-md">
                                {currentSong.title}
                            </h2>
                            <button className="text-lg text-white/70 truncate hover:text-white transition-colors font-medium">
                                {currentSong.artist}
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Scrubber */}
                    <div
                        className="w-full group py-3 relative"
                        onMouseEnter={() => setIsHoveringScrubber(true)}
                        onMouseLeave={() => setIsHoveringScrubber(false)}
                    >
                        {/* Time Tooltip */}
                        <div
                            className={`absolute -top-6 transform -translate-x-1/2 bg-white/10 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded transition-opacity duration-200 ${isScrubbing || isHoveringScrubber ? 'opacity-100' : 'opacity-0'}`}
                            style={{ left: `${percent}%` }}
                        >
                            {formatTime(displayTime)}
                        </div>

                        {/* Progress Bar Track */}
                        <div className="relative h-1 w-full bg-white/20 rounded-full overflow-hidden transition-all duration-300 group-hover:h-2">
                            <div
                                className="absolute h-full bg-white/90 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>

                        {/* Thumb (Only visible on hover/drag) */}
                        <div
                            className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg pointer-events-none transition-transform duration-200 ease-out ${isHoveringScrubber || isScrubbing ? 'scale-100' : 'scale-0'}`}
                            style={{ left: `calc(${percent}% - 8px)` }}
                        ></div>

                        {/* Input Range (Invisible interaction layer) */}
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
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />

                        {/* Time Labels */}
                        <div className="flex justify-between text-[11px] font-medium text-white/40 mt-1 font-sans tracking-wide">
                            <span>{formatTime(displayTime)}</span>
                            <span>-{formatTime(currentDuration - displayTime)}</span>
                        </div>
                    </div>

                    {/* Transport Controls */}
                    <div className="flex items-center justify-between px-2 sm:px-8 py-1">
                        <button className="text-white/60 hover:text-white transition active:scale-90" onClick={() => seekTo(Math.max(0, progress - 10))}>
                            <SkipBack size={32} fill="currentColor" />
                        </button>

                        <button
                            onClick={togglePlay}
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition hover:scale-105 active:scale-95 bg-white/20 backdrop-blur-md shadow-lg border border-white/10"
                        >
                            {isPlaying ? (
                                <Pause size={32} fill="white" className="text-white" />
                            ) : (
                                <Play size={32} fill="white" className="text-white ml-1.5" />
                            )}
                        </button>

                        <button className="text-white/60 hover:text-white transition active:scale-90" onClick={() => seekTo(Math.min(currentDuration, progress + 10))}>
                            <SkipForward size={32} fill="currentColor" />
                        </button>
                    </div>

                    {/* Volume & Accessories */}
                    <div className="flex items-center justify-between pt-2">
                        <button
                            onClick={() => {
                                if (!showLyrics) fetchLyricsManually();
                                setShowLyrics(!showLyrics);
                            }}
                            className={`p-3 rounded-xl transition duration-300 ${showLyrics
                                ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110'
                                : 'text-white/60 hover:text-white hover:bg-white/10'
                                }`}
                            disabled={videoMode}
                            style={{ opacity: videoMode ? 0.3 : 1 }}
                        >
                            <MessageSquareQuote size={22} strokeWidth={showLyrics ? 2.5 : 2} />
                        </button>

                        {/* Animated Volume Pill */}
                        <div className="group flex items-center bg-white/10 hover:bg-white/20 rounded-full p-1.5 pr-2 backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] w-10 hover:w-36 overflow-hidden">
                            <button
                                onClick={toggleMute}
                                className="p-1.5 rounded-full text-white/80 group-hover:text-white transition shrink-0 z-10"
                            >
                                <VolumeIcon size={20} />
                            </button>

                            {/* Hidden Slider Container */}
                            <div className="w-0 group-hover:w-full transition-all duration-500 flex items-center pl-2 opacity-0 group-hover:opacity-100">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={volume}
                                    onChange={(e) => setVolume(Number(e.target.value))}
                                    className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                />
                            </div>
                        </div>

                        <button className="p-3 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition">
                            <ListMusic size={22} />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

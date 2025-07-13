import React, { useState, useRef, useEffect } from 'react';
import {
    FaLightbulb, FaCode, FaBookOpen, FaUsers, FaVideo,
    FaPlay, FaPause, FaVolumeMute, FaVolumeUp,
    FaExpand, FaCompress, FaCog, FaPauseCircle
} from 'react-icons/fa';
import { HiLightningBolt } from 'react-icons/hi';
import { useTheme } from '../../context/ThemeContext';

// Default theme for the app context. This will be merged with actual theme.
const defaultAppTheme = {
    background: 'bg-gray-900', text: 'text-white', primary: 'bg-cyan-500',
    primaryHover: 'bg-cyan-600', secondary: 'bg-blue-600', secondaryHover: 'bg-blue-700',
    cardBg: 'bg-gray-800', cardText: 'text-gray-300', border: 'border-gray-700',
    buttonText: 'text-white', highlight: 'text-cyan-400', highlightSecondary: 'text-blue-400',
    highlightTertiary: 'text-purple-400', iconBg: 'bg-cyan-500/10',
    gradientFrom: 'from-gray-900', gradientTo: 'to-gray-800',
    successColor: 'text-emerald-400',
    warningColor: 'text-amber-400',
    errorColor: 'text-red-400',
    infoColor: 'text-blue-400',
};

const isOverallThemeDark = (appTheme) => {
    const bgClass = appTheme.background;
    if (bgClass.includes('black') || bgClass.includes('zinc-9') || bgClass.includes('gray-9') ||
        bgClass.includes('slate-8') || bgClass.includes('slate-9') || bgClass.includes('purple-9') ||
        bgClass.includes('emerald-9') || bgClass.includes('indigo-9')
    ) {
        return true;
    }
    const match = bgClass.match(/-(\d{2,3})$/);
    if (match) {
        const shade = parseInt(match[1]);
        return shade >= 600;
    }
    return false;
};

const VideoSettingsMenu = ({
    isOpen,
    playbackRate,
    onPlaybackRateChange,
    videoQualities,
    currentQuality,
    onQualityChange,
    onTogglePiP,
    isPiPSupported,
    onClose
}) => {
    const { theme: appTheme } = useTheme();
    const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    const menuRef = useRef();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            ref={menuRef}
            className={`absolute bottom-12 right-2 w-48 ${appTheme.cardBg} rounded-md shadow-lg z-20 p-2 border ${appTheme.border}`}
        >
            <div className="mb-3">
                <h4 className={`text-xs font-semibold ${appTheme.cardText} mb-1 px-2`}>Playback Speed</h4>
                {speedOptions.map(speed => (
                    <button
                        key={speed}
                        onClick={() => onPlaybackRateChange(speed)}
                        className={`block w-full text-left px-3 py-1.5 text-sm rounded hover:${appTheme.primary} ${speed === playbackRate ? appTheme.primary : appTheme.cardText
                            }`}
                    >
                        {speed}x
                    </button>
                ))}
            </div>

            {videoQualities.length > 1 && (
                <div className="mb-3">
                    <h4 className={`text-xs font-semibold ${appTheme.cardText} mb-1 px-2`}>Quality</h4>
                    {videoQualities.map(quality => (
                        <button
                            key={quality.value}
                            onClick={() => onQualityChange(quality.value)}
                            className={`block w-full text-left px-3 py-1.5 text-sm rounded hover:${appTheme.primary} ${currentQuality === quality.value ? appTheme.primary : appTheme.cardText
                                }`}
                        >
                            {quality.label}
                        </button>
                    ))}
                </div>
            )}

            {isPiPSupported && (
                <button
                    onClick={onTogglePiP}
                    className={`block w-full text-left px-3 py-1.5 text-sm rounded hover:${appTheme.primary} ${appTheme.cardText}`}
                >
                    Picture-in-Picture
                </button>
            )}
        </div>
    );
};

const VideoControls = ({
    videoRef,
    isPlaying,
    isMuted,
    currentTime,
    duration,
    playbackRate,
    onPlayPause,
    onMuteUnmute,
    onTimeChange,
    onPlaybackRateChange,
    onToggleFullscreen,
    isFullscreen,
    videoQualities,
    currentQuality,
    onQualityChange,
    onTogglePiP,
    isPiPSupported
}) => {
    const { theme: appTheme } = useTheme();
    const [showSettings, setShowSettings] = useState(false);
    const [showSpeedOptions, setShowSpeedOptions] = useState(false);
    const [showQualityOptions, setShowQualityOptions] = useState(false);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const handleSettingsClick = () => {
        setShowSettings(!showSettings);
        setShowSpeedOptions(false);
        setShowQualityOptions(false);
    };

    return (
        <div className={`absolute bottom-0 left-0 right-0 p-2 ${appTheme.cardBg}/90 backdrop-blur-sm transition-opacity duration-300`}>
            {/* Progress Bar */}
            <div className="relative mb-2">
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={onTimeChange}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-gray-600"
                    style={{
                        background: `linear-gradient(to right, ${appTheme.primary} 0%, ${appTheme.primary} ${(currentTime / duration) * 100}%, ${appTheme.border} ${(currentTime / duration) * 100}%, ${appTheme.border} 100%)`
                    }}
                />
                <div className={`absolute bottom-0 left-0 right-0 h-1 ${appTheme.primary}/30`}></div>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={onPlayPause}
                        className={`p-1.5 rounded-full ${appTheme.iconBg} hover:${appTheme.primaryHover} transition-colors`}
                    >
                        {isPlaying ? (
                            <FaPause className="w-4 h-4" />
                        ) : (
                            <FaPlay className="w-4 h-4" />
                        )}
                    </button>

                    <button
                        onClick={onMuteUnmute}
                        className={`p-1.5 rounded-full ${appTheme.iconBg} hover:${appTheme.primaryHover} transition-colors`}
                    >
                        {isMuted ? (
                            <FaVolumeMute className="w-4 h-4" />
                        ) : (
                            <FaVolumeUp className="w-4 h-4" />
                        )}
                    </button>

                    <div className={`text-xs ${appTheme.cardText}`}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {videoQualities.length > 1 && (
                        <div className="relative">
                            <button
                                onClick={() => {
                                    setShowQualityOptions(!showQualityOptions);
                                    setShowSpeedOptions(false);
                                    setShowSettings(false);
                                }}
                                className={`px-2 py-1 text-xs rounded ${showQualityOptions ? appTheme.primary : appTheme.iconBg} hover:${appTheme.primaryHover} transition-colors`}
                            >
                                {videoQualities.find(q => q.value === currentQuality)?.label || 'Auto'}
                            </button>
                            {showQualityOptions && (
                                <div className={`absolute bottom-8 right-0 w-24 ${appTheme.cardBg} rounded-md shadow-lg z-10 border ${appTheme.border}`}>
                                    {videoQualities.map(quality => (
                                        <button
                                            key={quality.value}
                                            onClick={() => {
                                                onQualityChange(quality.value);
                                                setShowQualityOptions(false);
                                            }}
                                            className={`block w-full text-left px-3 py-1.5 text-sm hover:${appTheme.primary} ${currentQuality === quality.value ? appTheme.primary : appTheme.cardText
                                                }`}
                                        >
                                            {quality.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowSpeedOptions(!showSpeedOptions);
                                setShowQualityOptions(false);
                                setShowSettings(false);
                            }}
                            className={`px-2 py-1 text-xs rounded ${showSpeedOptions ? appTheme.primary : appTheme.iconBg} hover:${appTheme.primaryHover} transition-colors`}
                        >
                            {playbackRate}x
                        </button>
                        {showSpeedOptions && (
                            <div className={`absolute bottom-8 right-0 w-20 ${appTheme.cardBg} rounded-md shadow-lg z-10 border ${appTheme.border}`}>
                                {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map(speed => (
                                    <button
                                        key={speed}
                                        onClick={() => {
                                            onPlaybackRateChange(speed);
                                            setShowSpeedOptions(false);
                                        }}
                                        className={`block w-full text-left px-3 py-1.5 text-sm hover:${appTheme.primary} ${speed === playbackRate ? appTheme.primary : appTheme.cardText
                                            }`}
                                    >
                                        {speed}x
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={handleSettingsClick}
                            className={`p-1.5 rounded-full ${showSettings ? appTheme.primary : appTheme.iconBg} hover:${appTheme.primaryHover} transition-colors`}
                        >
                            <FaCog className="w-4 h-4" />
                        </button>
                        <VideoSettingsMenu
                            isOpen={showSettings}
                            playbackRate={playbackRate}
                            onPlaybackRateChange={(rate) => {
                                onPlaybackRateChange(rate);
                                setShowSettings(false);
                            }}
                            videoQualities={videoQualities}
                            currentQuality={currentQuality}
                            onQualityChange={(quality) => {
                                onQualityChange(quality);
                                setShowSettings(false);
                            }}
                            onTogglePiP={() => {
                                onTogglePiP();
                                setShowSettings(false);
                            }}
                            isPiPSupported={isPiPSupported}
                            onClose={() => setShowSettings(false)}
                        />
                    </div>

                    {isPiPSupported && (
                        <button
                            onClick={onTogglePiP}
                            className={`p-1.5 rounded-full ${appTheme.iconBg} hover:${appTheme.primaryHover} transition-colors`}
                            title="Picture-in-Picture"
                        >
                            <FaPauseCircle className="w-4 h-4" />
                        </button>
                    )}

                    <button
                        onClick={onToggleFullscreen}
                        className={`p-1.5 rounded-full ${appTheme.iconBg} hover:${appTheme.primaryHover} transition-colors`}
                    >
                        {isFullscreen ? (
                            <FaCompress className="w-4 h-4" />
                        ) : (
                            <FaExpand className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const VideoPlayer = ({ secureUrl, thumbnailUrl, duration, videoQualities = [] }) => {
    const { theme: appTheme } = useTheme();
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [durationState, setDuration] = useState(duration || 0);
    const [playbackRate, setPlaybackRate] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [controlsTimeout, setControlsTimeout] = useState(null);
    const [currentQuality, setCurrentQuality] = useState('auto');
    const [isPiPSupported, setIsPiPSupported] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Check if Picture-in-Picture is supported
    useEffect(() => {
        setIsPiPSupported(document.pictureInPictureEnabled && !videoRef.current?.disablePictureInPicture);
    }, []);

    // Initialize with default quality if available
    useEffect(() => {
        if (videoQualities.length > 0) {
            setCurrentQuality(videoQualities[0].value);
        }
    }, [videoQualities]);

    useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(error => {
                    console.error("Error attempting to play video:", error);
                });
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.muted = isMuted;
        }
    }, [isMuted]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleTimeUpdate = () => {
        setCurrentTime(videoRef.current.currentTime);
        if (!durationState && videoRef.current.duration) {
            setDuration(videoRef.current.duration);
        }
    };

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
        resetControlsTimeout();
    };

    const handleMuteUnmute = () => {
        setIsMuted(!isMuted);
        resetControlsTimeout();
    };

    const handleTimeChange = (e) => {
        const newTime = parseFloat(e.target.value);
        setCurrentTime(newTime);
        videoRef.current.currentTime = newTime;
        resetControlsTimeout();
    };

    const handlePlaybackRateChange = (rate) => {
        setPlaybackRate(rate);
        resetControlsTimeout();
    };

    const handleToggleFullscreen = () => {
        if (!isFullscreen) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
        resetControlsTimeout();
    };

    const handleTogglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (videoRef.current) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (error) {
            console.error('Picture-in-Picture error:', error);
        }
        resetControlsTimeout();
    };

    const handleQualityChange = (quality) => {
        setCurrentQuality(quality);
        // Here you would typically switch video sources based on quality
        // For this example, we're just setting the state
        resetControlsTimeout();
    };

    const handleMouseMove = () => {
        setShowControls(true);
        resetControlsTimeout();
    };

    const resetControlsTimeout = () => {
        if (controlsTimeout) clearTimeout(controlsTimeout);
        setControlsTimeout(setTimeout(() => setShowControls(false), 3000));
    };

    const handleVideoClick = () => {
        handlePlayPause();
    };

    useEffect(() => {
        return () => {
            if (controlsTimeout) clearTimeout(controlsTimeout);
        };
    }, [controlsTimeout]);

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-lg bg-black"
            style={{ paddingTop: '56.25%' }}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => {
                setIsHovering(false);
                setShowControls(false);
            }}
        >
            <video
                ref={videoRef}
                onClick={handleVideoClick}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onEnded={() => setIsPlaying(false)}
                poster={thumbnailUrl}
                src={secureUrl}
                className="absolute top-0 left-0 w-full h-full object-contain cursor-pointer"
                preload="metadata"
            />

            {(showControls || isHovering) && (
                <VideoControls
                    videoRef={videoRef}
                    isPlaying={isPlaying}
                    isMuted={isMuted}
                    currentTime={currentTime}
                    duration={durationState}
                    playbackRate={playbackRate}
                    onPlayPause={handlePlayPause}
                    onMuteUnmute={handleMuteUnmute}
                    onTimeChange={handleTimeChange}
                    onPlaybackRateChange={handlePlaybackRateChange}
                    onToggleFullscreen={handleToggleFullscreen}
                    isFullscreen={isFullscreen}
                    videoQualities={videoQualities}
                    currentQuality={currentQuality}
                    onQualityChange={handleQualityChange}
                    onTogglePiP={handleTogglePiP}
                    isPiPSupported={isPiPSupported}
                />
            )}

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <button
                        onClick={handlePlayPause}
                        className={`p-4 rounded-full ${appTheme.iconBg} backdrop-blur-sm transition-all hover:scale-110`}
                    >
                        <FaPlay className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

// Rest of the EditorialTab component remains the same...

const EditorialTab = ({ problem }) => {
    const { theme: appThemeFromContext } = useTheme();
    const appTheme = { ...defaultAppTheme, ...(appThemeFromContext) };

    const hasEditorialContent = problem.editorial && (problem.editorial.approach || problem.editorial.solutionCode || problem.editorial.complexityAnalysis || problem.editorial.communitySolutions);
    const hasVideoSolution = problem.secureUrl;

    // Mock video qualities - in a real app, these would come from your video source
    const videoQualities = [
        { value: 'auto', label: 'Auto' },
        { value: '1080', label: '1080p' },
        { value: '720', label: '720p' },
        { value: '480', label: '480p' },
    ];

    if (!hasEditorialContent && !hasVideoSolution) {
        return (
            <div className="p-6 text-center">
                <div className={`inline-block p-4 mb-4 rounded-full ${appTheme.cardBg}/50 border ${appTheme.border}/50`}>
                    <FaLightbulb className={`w-8 h-8 ${appTheme.warningColor}/50`} />
                </div>
                <h3 className={`text-lg font-semibold ${appTheme.text} mb-2`}>Editorial Coming Soon</h3>
                <p className={`${appTheme.cardText}`}>Our team is working on creating a detailed editorial for this problem.</p>
            </div>
        );
    }

    const { approach, solutionCode, complexityAnalysis, communitySolutions } = problem.editorial || {};

    return (
        <div className="p-4 space-y-8">
            {/* Video Solution Section */}
            {hasVideoSolution && (
                <div className={`${appTheme.cardBg}/50 rounded-xl p-6 border ${appTheme.border}/30`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FaVideo className={`w-5 h-5 ${appTheme.highlight}`} />
                        <h3 className={`text-lg font-semibold ${appTheme.text}`}>Video Solution</h3>
                    </div>
                    <VideoPlayer
                        secureUrl={problem.secureUrl}
                        thumbnailUrl={problem.thumbnailUrl}
                        duration={problem.duration}
                        videoQualities={videoQualities}
                    />
                    {problem.duration && (
                        <p className={`text-sm ${appTheme.cardText} mt-3 text-right`}>
                            Duration: {Math.floor(problem.duration / 60)}m {Math.round(problem.duration % 60)}s
                        </p>
                    )}
                </div>
            )}

            {/* Approach Section */}
            {approach && (
                <div className={`${appTheme.cardBg}/50 rounded-xl p-6 border ${appTheme.border}/30`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FaLightbulb className={`w-5 h-5 ${appTheme.highlightSecondary}`} />
                        <h3 className={`text-lg font-semibold ${appTheme.text}`}>Approach</h3>
                    </div>
                    <div className={`prose max-w-none ${isOverallThemeDark(appTheme) ? 'prose-invert' : ''} ${appTheme.cardText}`}>
                        {approach.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Solution Code Section */}
            {solutionCode && (
                <div className={`${appTheme.cardBg}/50 rounded-xl p-6 border ${appTheme.border}/30`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FaCode className={`w-5 h-5 ${appTheme.highlightTertiary}`} />
                        <h3 className={`text-lg font-semibold ${appTheme.text}`}>Solution Code</h3>
                    </div>
                    <pre className={`${appTheme.background}/80 p-4 rounded-lg overflow-x-auto text-sm font-mono ${appTheme.cardText} border ${appTheme.border}/50`}>
                        <code>{solutionCode}</code>
                    </pre>
                </div>
            )}

            {/* Complexity Analysis */}
            {complexityAnalysis && (
                <div className={`${appTheme.cardBg}/50 rounded-xl p-6 border ${appTheme.border}/30`}>
                    <div className="flex items-center gap-3 mb-4">
                        <HiLightningBolt className={`w-5 h-5 ${appTheme.highlight}`} />
                        <h3 className={`text-lg font-semibold ${appTheme.text}`}>Complexity Analysis</h3>
                    </div>
                    <div className={`prose max-w-none ${isOverallThemeDark(appTheme) ? 'prose-invert' : ''} ${appTheme.cardText}`}>
                        {complexityAnalysis.split('\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 last:mb-0">{paragraph}</p>
                        ))}
                    </div>
                </div>
            )}

            {/* Community Solutions */}
            {communitySolutions && communitySolutions.length > 0 && (
                <div className={`${appTheme.cardBg}/50 rounded-xl p-6 border ${appTheme.border}/30`}>
                    <div className="flex items-center gap-3 mb-4">
                        <FaUsers className={`w-5 h-5 ${appTheme.highlightSecondary}`} />
                        <h3 className={`text-lg font-semibold ${appTheme.text}`}>Community Solutions</h3>
                    </div>
                    <div className="space-y-4">
                        {communitySolutions.map((solution, i) => (
                            <div key={i} className={`${appTheme.background}/40 p-4 rounded-lg border ${appTheme.border}/30`}>
                                <div className="flex justify-between items-start mb-3">
                                    <h4 className={`font-medium ${appTheme.text}`}>{solution.language}</h4>
                                    <span className={`text-xs px-2 py-1 ${appTheme.cardBg} rounded-full ${appTheme.cardText}`}>
                                        {solution.upvotes} upvotes
                                    </span>
                                </div>
                                <pre className={`text-sm font-mono ${appTheme.cardText} overflow-x-auto`}>
                                    <code>{solution.code}</code>
                                </pre>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditorialTab;
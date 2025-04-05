import { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { motion } from 'framer-motion'; // Ensure motion is imported

// Add onAutoPlayComplete to props destructuring
const AudioPlayer = ({ track, onEnded, autoPlay = false, onAutoPlayComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false); // Start paused, autoplay handled in onLoadedMetadata
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [audioFrequencyData, setAudioFrequencyData] = useState([]);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const isSourceConnected = useRef(false);
  const autoPlayHandled = useRef(!autoPlay); // Initialize based on initial prop

  // Effect for initializing AudioContext and Analyser (runs once)
  useEffect(() => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new AudioContext();
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 64;
        } catch (e) {
            console.error("Error creating AudioContext or Analyser:", e);
            setError("오디오 분석기를 초기화할 수 없습니다.");
        }
    }
    return () => {
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
            audioContextRef.current = null;
        }
    };
  }, []);

  // Effect for connecting the audio source to the analyser (runs when track changes)
   useEffect(() => {
    // Reset state when track changes, except isPlaying which is handled by autoPlay logic
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    autoPlayHandled.current = !autoPlay; // Reset handled flag based on prop for the new track

    if (track && track.audioFile && audioRef.current && audioContextRef.current && analyserRef.current) {
        if (sourceRef.current && isSourceConnected.current) {
            try { sourceRef.current.disconnect(); } catch {}
            sourceRef.current = null;
            isSourceConnected.current = false;
        }
         if (analyserRef.current) {
             try { analyserRef.current.disconnect(); } catch {}
         }

        if (audioContextRef.current.state === 'closed') {
             console.warn("AudioContext is closed, cannot create media element source.");
             setError("오디오 컨텍스트가 닫혔습니다.");
             return;
        }

        if (!isSourceConnected.current) {
            try {
                if (audioRef.current.readyState >= 1 || !isSourceConnected.current) {
                    sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                    sourceRef.current.connect(analyserRef.current);
                    analyserRef.current.connect(audioContextRef.current.destination);
                    isSourceConnected.current = true;
                } else {
                     console.warn("Audio element not ready, delaying connection attempt.");
                     const connectWhenReady = () => {
                         if (audioRef.current && audioContextRef.current && analyserRef.current && !isSourceConnected.current && audioContextRef.current.state !== 'closed') {
                            try {
                                sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
                                sourceRef.current.connect(analyserRef.current);
                                analyserRef.current.connect(audioContextRef.current.destination);
                                isSourceConnected.current = true;
                            } catch(e) {
                                console.error("Error connecting audio source (on event):", e);
                                if (e.name !== 'InvalidStateError') {
                                    setError("오디오 소스를 연결할 수 없습니다.");
                                }
                                isSourceConnected.current = false;
                            }
                         }
                         audioRef.current?.removeEventListener('canplay', connectWhenReady);
                         audioRef.current?.removeEventListener('loadedmetadata', connectWhenReady);
                     };
                     audioRef.current?.addEventListener('canplay', connectWhenReady);
                     audioRef.current?.addEventListener('loadedmetadata', connectWhenReady);
                }
            } catch (e) {
                console.error("Error connecting audio source:", e);
                if (e.name !== 'InvalidStateError') {
                   setError("오디오 소스를 연결할 수 없습니다.");
                }
                isSourceConnected.current = false;
            }
        }
    }

    return () => {
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch {}
        sourceRef.current = null;
        isSourceConnected.current = false;
      }
       if (analyserRef.current) {
         try { analyserRef.current.disconnect(); } catch {}
       }
    };
   }, [track]); // Re-run only when track changes

  // Update audio frequency data for visualization
  const updateAudioData = () => {
    if (analyserRef.current && isPlaying && isSourceConnected.current) {
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      try {
        analyserRef.current.getByteFrequencyData(dataArray);
        const normalizedData = Array.from(dataArray).map(value => value / 255);
        setAudioFrequencyData(normalizedData);
        animationRef.current = requestAnimationFrame(updateAudioData);
      } catch (e) {
         console.error("Error getting frequency data:", e);
         if (animationRef.current) cancelAnimationFrame(animationRef.current);
         animationRef.current = null;
      }
    } else {
       if (animationRef.current) cancelAnimationFrame(animationRef.current);
       animationRef.current = null;
    }
  };

  // Removed the useEffect hook that handled autoplay based on track prop change

  // Play/Pause useEffect
  useEffect(() => {
    const playAudio = async () => {
      if (!audioRef.current) return;

      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        try {
          await audioContextRef.current.resume();
        } catch (resumeError) {
          setError(`AudioContext 재개 실패: ${resumeError.message}`);
          console.error("AudioContext resume error:", resumeError);
          setIsPlaying(false);
          return;
        }
      }

      try {
        setError(null);
        await audioRef.current.play();
        if (analyserRef.current && isSourceConnected.current && !animationRef.current) {
           animationRef.current = requestAnimationFrame(updateAudioData);
        }
      } catch (playError) {
        if (playError.name !== 'AbortError') {
            setError(`오디오 재생 오류: ${playError.message}`);
            console.error("Audio play error:", playError);
            setIsPlaying(false);
        } else {
             console.warn("Audio play() interrupted:", playError.message);
        }
        if (animationRef.current) {
           cancelAnimationFrame(animationRef.current);
           animationRef.current = null;
        }
      }
    };

    if (isPlaying) {
      // Play only if duration is loaded OR readyState indicates it's safe
      if (duration > 0 || audioRef.current?.readyState >= 2) {
          playAudio();
      }
    } else {
      audioRef.current?.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isPlaying, duration]); // Depend on isPlaying and duration

  // Cleanup animation frame on component unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Set volume
  useEffect(() => {
    if (audioRef.current) {
       audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle audio metadata loaded - Added autoplay logic here
  const onLoadedMetadata = () => {
    if (audioRef.current) {
        const newDuration = audioRef.current.duration;
        if (isFinite(newDuration)) {
            setDuration(newDuration);
            setError(null);
            // Trigger autoplay if prop is set and not already handled for this load
            if (autoPlay && !autoPlayHandled.current) {
                setIsPlaying(true); // This will trigger the play/pause useEffect
                autoPlayHandled.current = true;
                if (typeof onAutoPlayComplete === 'function') {
                    onAutoPlayComplete(); // Notify parent
                }
            }
        } else {
            setError("오디오 길이를 가져올 수 없습니다.");
            setDuration(0);
        }
    }
  };

  // Handle time update
  const onTimeUpdate = () => {
     if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
     }
  };

  // Toggle play/pause
  const togglePlay = () => {
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
       audioContextRef.current.resume().catch(e => {
           console.error("Error resuming AudioContext:", e);
           setError("오디오 컨텍스트 재개 실패");
       });
    }
    setIsPlaying(!isPlaying);
    setError(null);
    // User interaction overrides autoplay intent
    autoPlayHandled.current = true; // Mark as handled even if pausing
    if (typeof onAutoPlayComplete === 'function') {
        onAutoPlayComplete(); // Notify parent
    }
  };

  // Handle seek
  const handleSeek = (e) => {
    if (!audioRef.current || isNaN(duration) || duration <= 0) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const seekTime = ((e.clientX - rect.left) / rect.width) * duration;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Format time (seconds to MM:SS)
  const formatTime = (time) => {
    if (isNaN(time) || time === Infinity || time < 0) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-primary bg-opacity-30 backdrop-blur-sm p-4 rounded-lg">
      <audio
        key={track?.audioFile} // Force re-render when track changes
        ref={audioRef}
        src={track?.audioFile}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onError={(e) => {
            console.error("Audio Element Error:", e.target.error);
            setError("오디오 파일을 로드하거나 재생할 수 없습니다.");
            setIsPlaying(false);
        }}
        crossOrigin="anonymous" // Important for MediaElementSourceNode
      />

      {error && (
        <div className="bg-accent-magenta/20 border border-accent-magenta text-accent-magenta p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}

      <div className={`flex items-center mb-4 ${error ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          onClick={togglePlay}
          className="bg-accent-magenta hover:bg-opacity-80 text-white rounded-full w-10 h-10 flex items-center justify-center mr-4 focus:outline-none shadow-md hover:shadow-neon-magenta"
          disabled={!!error || (!track?.audioFile)}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <div className="flex-1">
          <h3 className="text-white font-blender text-lg">{track?.title}</h3>
          <p className="text-gray-400 text-sm">{track?.theme}</p>
        </div>
      </div>

      {/* Restored Audio visualization section */}
       <div className={`h-20 mb-4 flex items-end justify-center space-x-1 overflow-hidden ${error ? 'opacity-30' : ''}`}>
         {(audioFrequencyData.length > 0 && !error) ? (
           audioFrequencyData.map((value, index) => (
             <motion.div
               key={index}
               className="w-1.5 rounded-t"
               style={{
                 background: `linear-gradient(to top, var(--color-accent-magenta), var(--color-accent-blue))`,
                 boxShadow: `0 0 2px rgba(33, 93, 255, 0.6), 0 0 5px rgba(180, 60, 255, 0.4)`,
                 height: `${Math.max(2, value * 80)}%`, // Use percentage height, ensure min height
                 transformOrigin: 'bottom',
                 transition: 'height 0.05s ease-out' // Animate height directly
               }}
             />
           ))
         ) : (
           Array.from({ length: 32 }).map((_, index) => (
             <div key={index} className="w-1.5 h-1 bg-gray-700 rounded-t opacity-50"></div>
           ))
         )}
       </div>

      {/* Progress bar */}
      <div className={`mb-2 ${error ? 'opacity-50 pointer-events-none' : ''}`}>
        <div
          className="h-2 bg-gray-700 rounded-full cursor-pointer relative overflow-hidden group"
          onClick={!error ? handleSeek : undefined}
        >
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-accent-magenta to-accent-blue transition-all duration-100 ease-linear"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
           <div className="absolute top-0 left-0 h-full bg-accent-blue blur opacity-0 group-hover:opacity-50 transition-opacity duration-200"
             style={{ width: `${(currentTime / duration) * 100}%` }}/>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume control */}
      <div className={`flex items-center ${error ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          onClick={!error ? toggleMute : undefined}
          className="text-gray-400 hover:text-accent-blue mr-2 focus:outline-none transition-colors"
          disabled={!!error}
        >
          {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-accent-magenta"
          disabled={!!error}
        />
      </div>
    </div>
  );
};

export default AudioPlayer;

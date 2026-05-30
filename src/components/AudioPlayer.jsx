import { useState, useEffect, useRef, useCallback } from 'react';
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
  const sourceConnected = useRef(false);
  const autoPlayHandled = useRef(!autoPlay);

  // Initialize AudioContext + Analyser (once)
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
      audioContextRef.current?.close().catch(() => {});
      audioContextRef.current = null;
    };
  }, []);

  // Connect <audio> → analyser → destination.
  // Because <audio key={track?.audioFile}> remounts on track change,
  // createMediaElementSource is effectively called once per audio element.
  useEffect(() => {
    // Reset connection state for the new track mount
    sourceConnected.current = false;
    setCurrentTime(0);
    setDuration(0);
    setError(null);
    autoPlayHandled.current = !autoPlay;

    const audioEl = audioRef.current;
    if (!audioEl || !track?.audioFile) return;

    // Wait for metadata before connecting (createMediaElementSource
    // may throw if called before the element is ready).
    const connect = () => {
      // Guard: skip if already connected or component unmounted
      if (sourceConnected.current) return;
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;

      try {
        const src = audioContextRef.current.createMediaElementSource(audioEl);
        src.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
        sourceConnected.current = true;
      } catch (e) {
        if (e.name !== 'InvalidStateError') {
          setError("오디오 소스를 연결할 수 없습니다.");
        }
      }
    };

    if (audioEl.readyState >= 1) {
      connect();
    } else {
      audioEl.addEventListener('loadedmetadata', connect, { once: true });
      audioEl.addEventListener('canplay', connect, { once: true });
    }

    // preload="none" won't fetch metadata on its own. When autoplay is
    // requested, kick off loading so `loadedmetadata` fires and the autoplay
    // handler in onLoadedMetadata can run (manual playback doesn't need this —
    // the play() call triggers loading on its own).
    if (autoPlay) {
      audioEl.load();
    }

    return () => {
      // No cleanup needed — the <audio key> element is destroyed on
      // track change, which invalidates its source node automatically.
      sourceConnected.current = false;
    };
  }, [track?.audioFile, autoPlay]);

  // Update audio frequency data for visualization — memoized to satisfy exhaustive-deps
  const updateAudioData = useCallback(() => {
    if (analyserRef.current && isPlaying && sourceConnected.current) {
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
  }, [isPlaying]);

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
        if (analyserRef.current && sourceConnected.current && !animationRef.current) {
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
      // preload="none" keeps readyState/duration at 0 until play() kicks off
      // the network fetch, so we can't gate on them — that would deadlock the
      // very first tap (no play() → no load → no metadata → never plays).
      // Call play() directly; the browser loads on demand and an interrupted
      // load surfaces as AbortError, which the catch above intentionally ignores.
      playAudio();
    } else {
      audioRef.current?.pause();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }
  }, [isPlaying, updateAudioData]); // Depend on isPlaying and updateAudioData

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
        key={track?.audioFile} // Force remount when track changes
        ref={audioRef}
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
        onError={(e) => {
            console.error("Audio Element Error:", e.target.error);
            setError("오디오 파일을 로드하거나 재생할 수 없습니다.");
            setIsPlaying(false);
        }}
        crossOrigin="anonymous"
        // preload="none" stops Chrome/Safari from prefetching the entire
        // file the moment a track page mounts. The file is fetched on
        // the first play() call instead, which is what mobile users
        // expect when they tap ▶. AAC (.m4a) at 128kbps is preferred —
        // it's roughly 40% the size of the original 320kbps mp3 — and
        // every browser falls back to the original mp3 if for some
        // reason it can't decode AAC.
        preload="none"
      >
        {track?.audioFile && (
          <>
            <source src={track.audioFile.replace(/\.mp3$/i, '.m4a')} type="audio/mp4" />
            <source src={track.audioFile} type="audio/mpeg" />
          </>
        )}
      </audio>

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

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  StopIcon,
  ArrowPathIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { ttsAPI } from '../services/api';
import toast from 'react-hot-toast';

/**
 * TextToSpeech Component - Sử dụng Murf.ai API
 * Đọc văn bản tiếng Việt với chất lượng cao
 */
const TextToSpeech = ({ text, className = '', compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('vi-VN-hoa');
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  // Load available voices
  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      const response = await ttsAPI.getVoices();
      if (response.data.success) {
        setVoices(response.data.voices);
        setSelectedVoice(response.data.defaultVoice || 'vi-VN-hoa');
      }
    } catch (error) {
      console.error('Error loading voices:', error);
    }
  };

  // Generate audio
  const generateAudio = async () => {
    if (!text || text.trim().length === 0) {
      toast.error('Không có nội dung để đọc');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ttsAPI.generate({
        text: text,
        voiceId: selectedVoice,
        style: 'Conversational'
      });

      if (response.data.success) {
        const url = ttsAPI.getAudioUrl(response.data.audio.id);
        setAudioUrl(url);
        
        // Auto play after generation
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.load();
          await audioRef.current.play();
          setIsPlaying(true);
          setIsPaused(false);
        }
      }
    } catch (error) {
      console.error('TTS Error:', error);
      toast.error(error.response?.data?.error || 'Lỗi khi tạo audio');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick read aloud (no save)
  const readAloud = async () => {
    if (!text || text.trim().length === 0) {
      toast.error('Không có nội dung để đọc');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ttsAPI.readAloud(text);
      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.load();
        await audioRef.current.play();
        setIsPlaying(true);
        setIsPaused(false);
      }
    } catch (error) {
      console.error('Read aloud error:', error);
      toast.error('Lỗi khi đọc văn bản');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying && !isPaused) {
      audioRef.current.pause();
      setIsPaused(true);
    } else if (isPaused) {
      audioRef.current.play();
      setIsPaused(false);
    } else {
      generateAudio();
    }
  };

  // Stop playback
  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  // Handle audio events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Compact version (just a play button)
  if (compact) {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <button
          onClick={isPlaying ? togglePlayPause : readAloud}
          disabled={isLoading}
          className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 text-indigo-600 transition-colors disabled:opacity-50"
          title="Đọc văn bản"
        >
          {isLoading ? (
            <ArrowPathIcon className="w-5 h-5 animate-spin" />
          ) : isPlaying && !isPaused ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <SpeakerWaveIcon className="w-5 h-5" />
          )}
        </button>
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
        />
      </div>
    );
  }

  // Full version with controls
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SpeakerWaveIcon className="w-5 h-5 text-indigo-600" />
          <span className="font-medium text-gray-700">Nghe bài học</span>
        </div>
        
        {/* Voice selector */}
        <div className="relative">
          <button
            onClick={() => setShowVoiceSelector(!showVoiceSelector)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded border border-gray-200 hover:border-gray-300"
          >
            <span>Giọng đọc</span>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {showVoiceSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
              >
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => {
                      setSelectedVoice(voice.id);
                      setShowVoiceSelector(false);
                      setAudioUrl(null); // Reset audio when voice changes
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                      selectedVoice === voice.id ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                    }`}
                  >
                    <div className="font-medium">{voice.name}</div>
                    <div className="text-xs text-gray-500">{voice.description}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        {duration > 0 && (
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Stop button */}
        {(isPlaying || isPaused) && (
          <button
            onClick={stopPlayback}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            title="Dừng"
          >
            <StopIcon className="w-5 h-5" />
          </button>
        )}

        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading}
          className={`p-3 rounded-full ${
            isPlaying 
              ? 'bg-indigo-600 hover:bg-indigo-700' 
              : 'bg-indigo-500 hover:bg-indigo-600'
          } text-white transition-colors disabled:opacity-50 shadow-md`}
          title={isPlaying && !isPaused ? 'Tạm dừng' : 'Phát'}
        >
          {isLoading ? (
            <ArrowPathIcon className="w-6 h-6 animate-spin" />
          ) : isPlaying && !isPaused ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>

        {/* Mute toggle (placeholder for future) */}
        <button
          className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          title="Tắt/Bật tiếng"
        >
          <SpeakerWaveIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Text preview */}
      {text && (
        <div className="mt-3 text-sm text-gray-500 line-clamp-2">
          {text.substring(0, 150)}...
        </div>
      )}

      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
      />
    </div>
  );
};

export default TextToSpeech;

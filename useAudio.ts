
import { useState, useEffect, useRef, useCallback } from 'react';
import { AUDIO_SOURCES } from './constants';

export const useAudio = (isAuthenticated: boolean) => {
  const [isMuted, setIsMuted] = useState<boolean>(() => 
    localStorage.getItem('is_muted') === 'true'
  );
  const [audioStatus, setAudioStatus] = useState<'loading' | 'ready' | 'error' | 'blocked'>('loading');
  const sourceIndexRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio object once
  if (!audioRef.current) {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.3;
    audio.preload = "auto";
    audio.muted = isMuted;
    audio.src = AUDIO_SOURCES[sourceIndexRef.current];
    audioRef.current = audio;
  }

  const tryPlayCurrent = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !isAuthenticated || isMuted) return;
    audio.play().catch((e) => {
      if (e?.name === 'NotAllowedError') {
        setAudioStatus('blocked');
        return;
      }
      if (e?.name === 'NotSupportedError') {
        if (sourceIndexRef.current < AUDIO_SOURCES.length - 1) {
          sourceIndexRef.current++;
          setAudioStatus('loading');
          audio.src = AUDIO_SOURCES[sourceIndexRef.current];
          audio.load();
          tryPlayCurrent();
        } else {
          setAudioStatus('error');
        }
      }
    });
  }, [isAuthenticated, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleError = () => {
      console.warn(`Audio Source ${sourceIndexRef.current} failed to load.`);
      if (sourceIndexRef.current < AUDIO_SOURCES.length - 1) {
        sourceIndexRef.current++;
        setAudioStatus('loading');
        audio.src = AUDIO_SOURCES[sourceIndexRef.current];
        audio.load();
        tryPlayCurrent();
      } else {
        setAudioStatus('error');
      }
    };

    const handleCanPlay = () => {
      setAudioStatus('ready');
    };

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);
    
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [tryPlayCurrent]);

  // Sync play state with authentication and mute status
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
      if (isAuthenticated && !isMuted) {
        tryPlayCurrent();
      } else {
        audio.pause();
      }
    }
  }, [isAuthenticated, isMuted, tryPlayCurrent]);

  const playManual = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.muted = isMuted;
      // Force play() call inside user interaction handler
      const promise = audio.play();
      if (promise !== undefined) {
        promise.then(() => {
          setAudioStatus('ready');
        }).catch(e => {
          console.warn("Manual play failed:", e.name);
          if (e?.name === 'NotSupportedError' && sourceIndexRef.current < AUDIO_SOURCES.length - 1) {
            sourceIndexRef.current++;
            setAudioStatus('loading');
            audio.src = AUDIO_SOURCES[sourceIndexRef.current];
            audio.load();
            tryPlayCurrent();
            return;
          }
          setAudioStatus(e?.name === 'NotAllowedError' ? 'blocked' : 'error');
        });
      }
    }
  }, [isMuted, tryPlayCurrent]);

  const toggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    localStorage.setItem('is_muted', String(nextMute));
    
    const audio = audioRef.current;
    if (audio) {
      audio.muted = nextMute;
      if (!nextMute && isAuthenticated) {
        tryPlayCurrent();
      } else {
        audio.pause();
      }
    }
  }, [isMuted, isAuthenticated, tryPlayCurrent]);

  const retryAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setAudioStatus('loading');
      sourceIndexRef.current = 0;
      audio.src = AUDIO_SOURCES[0];
      audio.load();
      tryPlayCurrent();
    }
  }, [tryPlayCurrent]);

  return { audioStatus, isMuted, toggleMute, retryAudio, playManual };
};

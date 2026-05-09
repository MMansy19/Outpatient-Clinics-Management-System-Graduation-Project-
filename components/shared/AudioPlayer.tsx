'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface AudioPlayerProps {
  src: string;
  className?: string;
  compact?: boolean;
}

const BAR_COUNT = 40;
const COMPACT_BAR_COUNT = 24;

export function AudioPlayer({ src, className, compact = false }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const barCount = compact ? COMPACT_BAR_COUNT : BAR_COUNT;

  useEffect(() => {
    const heights = Array.from({ length: barCount }, (_, i) => {
      const position = i / barCount;
      const base = Math.sin(position * Math.PI) * 0.6 + 0.2;
      const noise = Math.random() * 0.3;
      return Math.min(1, base + noise);
    });
    setBarHeights(heights);
  }, [barCount]);

  const setupAudioContext = useCallback(() => {
    if (audioContextRef.current || !audioRef.current) return;
    try {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch {
      // AudioContext not supported, use static bars
    }
  }, []);

  const updateVisualization = useCallback(() => {
    if (!analyserRef.current || !isPlaying) return;
    const data = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(data);

    const step = Math.floor(data.length / barCount);
    const newHeights = Array.from({ length: barCount }, (_, i) => {
      const value = data[i * step] || 0;
      return Math.max(0.08, value / 255);
    });
    setBarHeights(newHeights);
    animationRef.current = requestAnimationFrame(updateVisualization);
  }, [isPlaying, barCount]);

  useEffect(() => {
    if (isPlaying && analyserRef.current) {
      animationRef.current = requestAnimationFrame(updateVisualization);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, updateVisualization]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    setupAudioContext();
    // Resume AudioContext if suspended (browsers require user gesture)
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      await audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // Reset to static waveform
    const heights = Array.from({ length: barCount }, (_, i) => {
      const position = i / barCount;
      const base = Math.sin(position * Math.PI) * 0.6 + 0.2;
      const noise = Math.random() * 0.3;
      return Math.min(1, base + noise);
    });
    setBarHeights(heights);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm transition-colors',
        compact ? 'p-2 gap-2' : 'p-3 gap-3',
        className
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        preload="metadata"
      />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className={cn(
          'flex-shrink-0 rounded-full bg-medical-primary text-white transition-all hover:bg-medical-primary/90 active:scale-95',
          'flex items-center justify-center shadow-md',
          compact ? 'h-8 w-8' : 'h-10 w-10'
        )}
        type="button"
      >
        {isPlaying ? (
          <Pause className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4')} fill="currentColor" />
        ) : (
          <Play className={cn(compact ? 'h-3.5 w-3.5' : 'h-4 w-4', 'ml-0.5')} fill="currentColor" />
        )}
      </button>

      {/* Waveform + Progress */}
      <div className="flex-1 min-w-0">
        <div
          className="relative cursor-pointer group"
          onClick={handleSeek}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          tabIndex={0}
        >
          {/* Waveform Bars */}
          <div className={cn('flex items-center gap-[2px]', compact ? 'h-6' : 'h-8')}>
            {barHeights.map((height, i) => {
              const barProgress = (i / barCount) * 100;
              const isPast = barProgress <= progress;
              return (
                <div
                  key={i}
                  className={cn(
                    'flex-1 rounded-full transition-all duration-150',
                    isPast
                      ? 'bg-medical-primary'
                      : 'bg-muted-foreground/20 group-hover:bg-muted-foreground/30'
                  )}
                  style={{
                    height: `${Math.max(8, height * (compact ? 24 : 32))}%`,
                    minHeight: '3px',
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Time Display */}
        <div className={cn('flex justify-between mt-1', compact ? 'text-[10px]' : 'text-xs')}>
          <span className="text-muted-foreground font-medium tabular-nums">
            {formatTime(currentTime)}
          </span>
          <span className="text-muted-foreground/60 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Volume Icon */}
      {!compact && (
        <Volume2 className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
      )}
    </div>
  );
}

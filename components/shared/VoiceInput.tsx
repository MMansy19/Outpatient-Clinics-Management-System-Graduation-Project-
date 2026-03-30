'use client';

import { useState } from 'react';
import { Mic, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceRecorderDialog } from '@/components/doctor/VoiceRecorderDialog';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { cn } from '@/lib/utils/cn';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  id?: string;
  name?: string;
  onAudioCaptured?: (file: File | null) => void;
}

export function VoiceInput({
  value,
  onChange,
  placeholder,
  className,
  disabled,
  multiline = true,
  rows = 4,
  id,
  name,
  onAudioCaptured,
}: VoiceInputProps) {
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);

  const handleAudioCaptured = (file: File) => {
    setAudioFile(file);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(URL.createObjectURL(file));
    onAudioCaptured?.(file);
  };

  const handleRemoveAudio = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioFile(null);
    setAudioPreviewUrl(null);
    onAudioCaptured?.(null);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        {multiline ? (
          <textarea
            id={id}
            name={name}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={cn(
              'w-full px-3 py-2 pr-12 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
          />
        ) : (
          <input
            id={id}
            name={name}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'w-full px-3 py-2 pr-12 border border-input rounded-md bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              className
            )}
          />
        )}

        <Button
          type="button"
          onClick={() => setIsVoiceRecorderOpen(true)}
          disabled={disabled}
          size="icon"
          variant="ghost"
          className="absolute right-2 bottom-2 h-8 w-8 hover:bg-medical-primary/10"
          title="Record Audio"
        >
          <Mic className="h-4 w-4 text-medical-primary" />
        </Button>
      </div>

      {/* Audio Preview */}
      {audioFile && audioPreviewUrl && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <AudioPlayer src={audioPreviewUrl} compact />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRemoveAudio}
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <VoiceRecorderDialog
        open={isVoiceRecorderOpen}
        onOpenChange={setIsVoiceRecorderOpen}
        onAudioCaptured={handleAudioCaptured}
      />
    </div>
  );
}

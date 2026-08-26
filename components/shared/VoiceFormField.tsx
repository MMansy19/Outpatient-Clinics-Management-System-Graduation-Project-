'use client';

import { useState, useRef, ElementRef } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { Mic, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceRecorderDialog } from '@/components/doctor/VoiceRecorderDialog';
import { AudioPlayer } from '@/components/shared/AudioPlayer';
import { asrApi } from '@/lib/api/asr.service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

interface VoiceFormFieldProps<T extends FieldValues> {
  field: ControllerRenderProps<T>;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  multiline?: boolean;
  rows?: number;
  label?: string;
  description?: string;
  onAudioCaptured?: (file: File | null) => void;
  onTranscriptionComplete?: (text: string) => void;
  isSuperAdminVoiceEnabled?: boolean;
}

export function VoiceFormField<T extends FieldValues>({
  field,
  placeholder,
  className,
  disabled,
  multiline = true,
  rows = 4,
  label,
  description,
  onAudioCaptured,
  onTranscriptionComplete,
  isSuperAdminVoiceEnabled = false,
}: VoiceFormFieldProps<T>) {
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const textareaRef = useRef<ElementRef<'textarea'>>(null);
  const inputRef = useRef<ElementRef<'input'>>(null);

  const handleAudioCaptured = async (file: File) => {
    setAudioFile(file);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(URL.createObjectURL(file));
    onAudioCaptured?.(file);

    if (isSuperAdminVoiceEnabled) {
      setIsTranscribing(true);
      try {
        const ext = file.name.split('.').pop() || 'mp3';
        const namedFile = new File([file], `file.${ext}`, { type: file.type });
        const result = await asrApi.transcribe(namedFile);
        field.onChange(field.value ? `${field.value} ${result.transcription}` : result.transcription);
        onTranscriptionComplete?.(result.transcription);
      } catch (error) {
        toast.error('Failed to transcribe audio');
      } finally {
        setIsTranscribing(false);
      }
    }
  };

  const handleRemoveAudio = () => {
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioFile(null);
    setAudioPreviewUrl(null);
    onAudioCaptured?.(null);
  };

  // Get the value, defaulting to empty string if undefined
  const fieldValue = field.value ?? '';

  return (
    <div className="space-y-2">
      <div className="relative">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1 block">
            {label}
          </label>
        )}
        {description && (
          <p className="text-sm text-muted-foreground mb-1">{description}</p>
        )}

        {multiline ? (
          <textarea
            ref={textareaRef}
            name={field.name}
            value={fieldValue}
            onChange={field.onChange}
            onBlur={field.onBlur}
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
            ref={inputRef}
            type="text"
            name={field.name}
            value={fieldValue}
            onChange={field.onChange}
            onBlur={field.onBlur}
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
          disabled={disabled || isTranscribing}
          size="icon"
          variant="ghost"
          className="absolute right-2 bottom-2 h-8 w-8 hover:bg-medical-primary/10"
          title="Record Audio"
        >
          {isTranscribing ? (
            <Loader2 className="h-4 w-4 text-medical-primary animate-spin" />
          ) : (
            <Mic className="h-4 w-4 text-medical-primary" />
          )}
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

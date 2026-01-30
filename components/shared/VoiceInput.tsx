'use client';

import { useState } from 'react';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceRecorderDialog } from '@/components/doctor/VoiceRecorderDialog';
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
}: VoiceInputProps) {
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);

  const handleTranscriptionComplete = (transcription: string) => {
    // If there's existing text, append with a space
    const newValue = value ? `${value} ${transcription}` : transcription;
    onChange(newValue);
  };

  return (
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
        title="Voice to Text"
      >
        <Mic className="h-4 w-4 text-medical-primary" />
      </Button>

      <VoiceRecorderDialog
        open={isVoiceRecorderOpen}
        onOpenChange={setIsVoiceRecorderOpen}
        onTranscriptionComplete={handleTranscriptionComplete}
      />
    </div>
  );
}

'use client';

import { useState, useRef, ElementRef } from 'react';
import { ControllerRenderProps, FieldValues } from 'react-hook-form';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VoiceRecorderDialog } from '@/components/doctor/VoiceRecorderDialog';
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
}: VoiceFormFieldProps<T>) {
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const textareaRef = useRef<ElementRef<'textarea'>>(null);
  const inputRef = useRef<ElementRef<'input'>>(null);

  const handleTranscriptionComplete = (transcription: string) => {
    // If there's existing text, append with a space
    const newValue = field.value ? `${field.value} ${transcription}` : transcription;
    field.onChange(newValue);

    // Focus back on the input after transcription
    setTimeout(() => {
      if (multiline && textareaRef.current) {
        textareaRef.current.focus();
      } else if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Get the value, defaulting to empty string if undefined
  const fieldValue = field.value ?? '';

  return (
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

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Mic,
  MicOff,
  Loader2,
  Upload,
  FileAudio,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { asrApi } from '@/lib/api/asr.service';

interface VoiceRecorderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTranscriptionComplete: (text: string) => void;
}

export function VoiceRecorderDialog({
  open,
  onOpenChange,
  onTranscriptionComplete,
}: VoiceRecorderDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('voiceRecorder');

  const [activeTab, setActiveTab] = useState<'record' | 'upload'>('record');
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Recording timer
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [audioUrl, isRecording]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4',
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setError(t('microphoneAccessDenied'));
      toast.error(t('microphoneError'));
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const discardRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setTranscription(null);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/m4a',
      'video/mp4',
      'video/webm',
    ];

    if (!validTypes.some((type) => file.type.startsWith(type.split('/')[0]))) {
      setError(t('invalidFileType'));
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(t('fileTooLarge'));
      return;
    }

    setError(null);
    setSelectedFile(file);
    setTranscription(null);
  };

  const handleTranscribe = async () => {
    const fileToTranscribe = activeTab === 'record' ? audioBlob : selectedFile;

    if (!fileToTranscribe) {
      toast.error(t('noAudioToTranscribe'));
      return;
    }

    try {
      setIsTranscribing(true);
      setError(null);

      // Convert blob to file if needed
      const file =
        fileToTranscribe instanceof Blob && !(fileToTranscribe instanceof File)
          ? new File([fileToTranscribe], 'recording.webm', {
              type: fileToTranscribe.type,
            })
          : (fileToTranscribe as File);

      const result = await asrApi.transcribe(file);

      setTranscription(result.transcription);
      toast.success(t('transcriptionComplete'));
    } catch (err) {
      console.error('Transcription error:', err);
      const errorMessage =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        t('transcriptionFailed');
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleUseTranscription = () => {
    if (transcription) {
      onTranscriptionComplete(transcription);
      handleClose();
    }
  };

  const handleClose = () => {
    discardRecording();
    setSelectedFile(null);
    setError(null);
    setTranscription(null);
    setActiveTab('record');
    onOpenChange(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'record' | 'upload')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="record">
              <Mic className="mr-2 h-4 w-4" />
              {t('recordTab')}
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              {t('uploadTab')}
            </TabsTrigger>
          </TabsList>

          {/* Record Tab */}
          <TabsContent value="record" className="space-y-4">
            <div className="flex flex-col items-center space-y-6">
              {!audioBlob ? (
                <>
                  {/* Microphone Icon with Recording Animation */}
                  <div className="relative">
                    <div
                      className={`rounded-full p-8 transition-all ${
                        isRecording
                          ? 'bg-red-500/20 animate-pulse'
                          : 'bg-medical-primary/10'
                      }`}
                    >
                      <Mic
                        className={`h-16 w-16 ${
                          isRecording ? 'text-red-500' : 'text-medical-primary'
                        }`}
                      />
                    </div>
                    {isRecording && (
                      <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        {formatTime(recordingTime)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {!isRecording ? (
                      <Button
                        onClick={startRecording}
                        className="bg-medical-primary hover:bg-medical-primary/90"
                        size="lg"
                      >
                        <Mic className="mr-2 h-5 w-5" />
                        {t('startRecording')}
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={isPaused ? resumeRecording : pauseRecording}
                          variant="outline"
                          size="lg"
                        >
                          {isPaused
                            ? t('resumeRecording')
                            : t('pauseRecording')}
                        </Button>
                        <Button
                          onClick={stopRecording}
                          variant="destructive"
                          size="lg"
                        >
                          <MicOff className="mr-2 h-5 w-5" />
                          {t('stopRecording')}
                        </Button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Audio Player */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <FileAudio className="h-8 w-8 text-medical-primary" />
                        <div>
                          <p className="font-medium">{t('recording')}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatTime(recordingTime)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={discardRecording}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    {audioUrl && (
                      <audio controls className="w-full">
                        <source src={audioUrl} />
                      </audio>
                    )}

                    {transcription && (
                      <Alert>
                        <Check className="h-4 w-4" />
                        <AlertDescription>
                          <p className="font-medium mb-2">
                            {t('transcription')}
                          </p>
                          <p className="text-sm">{transcription}</p>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="flex gap-3 w-full">
                    <Button
                      onClick={discardRecording}
                      variant="outline"
                      className="flex-1"
                    >
                      {t('recordAgain')}
                    </Button>
                    {!transcription ? (
                      <Button
                        onClick={handleTranscribe}
                        disabled={isTranscribing}
                        className="flex-1 bg-medical-primary hover:bg-medical-primary/90"
                      >
                        {isTranscribing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('transcribing')}
                          </>
                        ) : (
                          t('transcribe')
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleUseTranscription}
                        className="flex-1 bg-medical-primary hover:bg-medical-primary/90"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {t('useText')}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <div className="space-y-4">
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="font-medium mb-2">{t('uploadAudioOrVideo')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('clickToBrowse')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {t('supportedFormats')}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileAudio className="h-8 w-8 text-medical-primary shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {transcription && (
                    <Alert>
                      <Check className="h-4 w-4" />
                      <AlertDescription>
                        <p className="font-medium mb-2">{t('transcription')}</p>
                        <p className="text-sm">{transcription}</p>
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-3">
                    {!transcription ? (
                      <Button
                        onClick={handleTranscribe}
                        disabled={isTranscribing}
                        className="flex-1 bg-medical-primary hover:bg-medical-primary/90"
                      >
                        {isTranscribing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('transcribing')}
                          </>
                        ) : (
                          t('transcribe')
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleUseTranscription}
                        className="flex-1 bg-medical-primary hover:bg-medical-primary/90"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        {t('useText')}
                      </Button>
                    )}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={handleClose}>
            {tCommon('cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

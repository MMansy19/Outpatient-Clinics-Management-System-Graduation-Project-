import { apiClient } from './client';

export interface TranscriptionResponse {
  transcription: string;
}

// Define interfaces for status responses
export interface ASRStatusResponse {
  status: string;
  // add other properties based on your API response
}

export interface WhisperStatusResponse {
  model: string;
  status: string;
  // add other properties based on your API response
}

export const asrApi = {
  /**
   * Get ASR service status
   */
  getStatus: async (): Promise<ASRStatusResponse> => {
    const response = await apiClient.get<ASRStatusResponse>('/asr');
    return response.data;
  },

  /**
   * Get Whisper model status
   */
  getWhisperStatus: async (): Promise<WhisperStatusResponse> => {
    const response = await apiClient.get<WhisperStatusResponse>('/asr/whisper');
    return response.data;
  },

  /**
   * Transcribe audio/video file to text
   * @param file - Audio or video file to transcribe
   * @returns Transcription result
   */
  transcribe: async (file: File): Promise<TranscriptionResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<TranscriptionResponse>(
      '/asr/transcribe',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  },
};
import { Mp3Encoder } from '@breezystack/lamejs';

/**
 * Convert an audio Blob (any browser-supported format like webm, mp4, ogg)
 * to MP3 using lamejs. Returns a new Blob with type 'audio/mpeg'.
 */
export async function convertBlobToMp3(blob: Blob): Promise<Blob> {
  const audioContext = new AudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.getChannelData(0); // mono (first channel)

  // Convert Float32 samples to Int16
  const int16Samples = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    int16Samples[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Encode to MP3 (mono, 128 kbps)
  const mp3Encoder = new Mp3Encoder(1, sampleRate, 128);
  const mp3Data: Uint8Array[] = [];

  const blockSize = 1152; // lamejs processes in blocks of 1152 samples
  for (let i = 0; i < int16Samples.length; i += blockSize) {
    const chunk = int16Samples.subarray(i, i + blockSize);
    const encoded = mp3Encoder.encodeBuffer(chunk);
    if (encoded.length > 0) {
      mp3Data.push(encoded);
    }
  }

  const tail = mp3Encoder.flush();
  if (tail.length > 0) {
    mp3Data.push(tail);
  }

  await audioContext.close();

  return new Blob(mp3Data as BlobPart[], { type: 'audio/mpeg' });
}

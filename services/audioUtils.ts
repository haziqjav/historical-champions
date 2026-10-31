// Utilities for decoding raw 16-bit PCM audio from base64, as returned by Gemini TTS.

export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  // DataView avoids the alignment/odd-length crashes `new Int16Array(data.buffer)` can cause.
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength - (data.byteLength % 2));
  const sampleCount = view.byteLength / 2;
  const frameCount = Math.floor(sampleCount / numChannels);
  const buffer = ctx.createBuffer(numChannels, Math.max(1, frameCount), sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = view.getInt16((i * numChannels + channel) * 2, true) / 32768.0;
  }
  return buffer;
}

export interface GeneratedAsset {
  id: string;
  url: string;
}

export interface VideoGenerationInput {
  prompt: string;
  durationSeconds: number;
  aspectRatio: string;
  referenceImageId?: string;
}

export interface GenerationHandle {
  providerJobId: string;
}

export interface GenerationStatus {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  assetUrl?: string;
}

export interface VideoProvider {
  generateClip(input: VideoGenerationInput): Promise<GenerationHandle>;
  getStatus(handle: GenerationHandle): Promise<GenerationStatus>;
  download(handle: GenerationHandle): Promise<Buffer>;
}

export interface ImageGenerationInput {
  prompt: string;
  aspectRatio: string;
}

export interface ImageProvider {
  generateImage(input: ImageGenerationInput): Promise<GeneratedAsset>;
}

export interface VoiceInput {
  text: string;
  voiceId?: string;
}

export interface VoiceProvider {
  generateSpeech(input: VoiceInput): Promise<GeneratedAsset>;
}

export interface AssemblyInput {
  clips: string[]; // local paths to clips
  voiceover?: string; // local path to audio
  music?: string;
  outputAspectRatio: string;
}

export interface GeneratedVideo {
  url: string;
  path: string;
}

export interface VideoAssembler {
  assemble(input: AssemblyInput): Promise<GeneratedVideo>;
}

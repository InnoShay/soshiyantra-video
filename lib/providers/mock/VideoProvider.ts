import { VideoProvider, VideoGenerationInput, GenerationHandle, GenerationStatus } from '../interfaces';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import os from 'os';

const execAsync = promisify(exec);

export class MockVideoProvider implements VideoProvider {
  private jobs = new Map<string, VideoGenerationInput>();

  async generateClip(input: VideoGenerationInput): Promise<GenerationHandle> {
    const providerJobId = 'mock_job_' + crypto.randomBytes(4).toString('hex');
    this.jobs.set(providerJobId, input);
    // Simulate slight network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return { providerJobId };
  }

  async getStatus(handle: GenerationHandle): Promise<GenerationStatus> {
    if (!this.jobs.has(handle.providerJobId)) {
      return { status: 'failed', error: 'Job not found' };
    }
    // Simulate it taking a moment
    return { status: 'completed' };
  }

  async download(handle: GenerationHandle): Promise<Buffer> {
    const input = this.jobs.get(handle.providerJobId);
    if (!input) throw new Error('Job not found');

    const duration = input.durationSeconds || 5;
    const isVertical = input.aspectRatio === '9:16';
    const width = isVertical ? 1080 : 1920;
    const height = isVertical ? 1920 : 1080;
    
    // Create a temporary file path
    const tmpFile = join(os.tmpdir(), `${handle.providerJobId}.mp4`);

    // Clean up prompt for drawing text (remove quotes, newlines, limit length)
    const safeText = input.prompt.substring(0, 50).replace(/['"]/g, '') + '...';

    // FFmpeg command to generate a solid color video with some text
    const cmd = `ffmpeg -f lavfi -i color=c=blue:s=${width}x${height}:d=${duration} -vf "drawtext=fontfile=/Library/Fonts/Arial.ttf:text='${safeText}':fontcolor=white:fontsize=48:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -preset ultrafast -y ${tmpFile}`;

    try {
      await execAsync(cmd);
      const buffer = readFileSync(tmpFile);
      // Clean up temp file
      try { unlinkSync(tmpFile); } catch (e) {}
      return buffer;
    } catch (error) {
      console.error("FFmpeg error:", error);
      throw new Error("Failed to generate mock video clip");
    }
  }
}

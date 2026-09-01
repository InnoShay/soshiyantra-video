import { VideoAssembler, AssemblyInput, GeneratedVideo } from '../interfaces';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';
import os from 'os';

const execAsync = promisify(exec);

export class MockVideoAssembler implements VideoAssembler {
  async assemble(input: AssemblyInput): Promise<GeneratedVideo> {
    if (input.clips.length === 0) {
      throw new Error("No clips provided for assembly");
    }

    const jobId = 'assembly_' + crypto.randomBytes(4).toString('hex');
    const listFile = join(os.tmpdir(), `${jobId}_list.txt`);
    const outputFile = join(os.tmpdir(), `${jobId}_final.mp4`);

    // Create a concat list file for FFmpeg
    const listContent = input.clips.map(clip => `file '${clip}'`).join('\n');
    writeFileSync(listFile, listContent);

    // Assembly using concat demuxer
    const cmd = `ffmpeg -f concat -safe 0 -i ${listFile} -c copy -y ${outputFile}`;

    try {
      await execAsync(cmd);
      // Clean up the list file
      try { unlinkSync(listFile); } catch(e) {}
      
      // In a real implementation, we'd upload to S3 here and return the URL.
      // For MVP, we can return the local path or serve it directly.
      return { url: outputFile, path: outputFile };
    } catch (error) {
      console.error("FFmpeg assembly error:", error);
      throw new Error("Failed to assemble final video");
    }
  }
}

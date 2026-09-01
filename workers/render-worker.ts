import 'dotenv/config'
import { Worker, Queue } from 'bullmq'
import IORedis from 'ioredis'
import { prisma } from '../lib/db'
import { MockVideoProvider } from '../lib/providers/mock/VideoProvider'
import { MockVideoAssembler } from '../lib/providers/mock/VideoAssembler'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')
const videoProvider = new MockVideoProvider()
const assembler = new MockVideoAssembler()

export const renderQueue = new Queue('render-jobs', { connection })

console.log("Worker started, waiting for jobs...")

const worker = new Worker('render-jobs', async job => {
  const { projectId } = job.data
  console.log(`Processing render job for project: ${projectId}`)

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { scenes: { orderBy: { order: 'asc' } } }
    })

    if (!project) throw new Error("Project not found")

    let renderJob = await prisma.renderJob.create({
      data: {
        projectId,
        status: 'PROCESSING',
        progress: 0,
        currentScene: 0,
        startedAt: new Date()
      }
    })

    const clipPaths: string[] = []

    for (let i = 0; i < project.scenes.length; i++) {
      const scene = project.scenes[i]
      
      await prisma.renderJob.update({
        where: { id: renderJob.id },
        data: { currentScene: i + 1, progress: Math.floor((i / project.scenes.length) * 80) }
      })

      await prisma.scene.update({
        where: { id: scene.id },
        data: { status: 'GENERATING' }
      })

      // Generate clip
      const handle = await videoProvider.generateClip({
        prompt: scene.prompt,
        durationSeconds: scene.durationSeconds,
        aspectRatio: '16:9'
      })

      // Normally we'd poll status here
      const buffer = await videoProvider.download(handle)
      
      // Save locally for assembly
      const fs = require('fs')
      const path = require('path')
      const os = require('os')
      const clipPath = path.join(os.tmpdir(), `clip_${scene.id}.mp4`)
      fs.writeFileSync(clipPath, buffer)
      clipPaths.push(clipPath)

      await prisma.scene.update({
        where: { id: scene.id },
        data: { status: 'COMPLETED', assetUrl: clipPath }
      })
    }

    await prisma.renderJob.update({
      where: { id: renderJob.id },
      data: { status: 'ASSEMBLING', progress: 85 }
    })

    const finalVideo = await assembler.assemble({
      clips: clipPaths,
      outputAspectRatio: '16:9'
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'COMPLETED', outputUrl: finalVideo.url }
    })

    await prisma.renderJob.update({
      where: { id: renderJob.id },
      data: { status: 'COMPLETED', progress: 100, completedAt: new Date() }
    })

    console.log(`Render complete for project: ${projectId}`)
  } catch (error: any) {
    console.error("Render failed:", error)
    await prisma.project.update({
      where: { id: projectId },
      data: { status: 'RENDER_FAILED' }
    })
  }
}, { connection })

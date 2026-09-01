import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

// In a real app we might want to abstract this or use a singleton
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')
const renderQueue = new Queue('render-jobs', { connection })

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.project.update({
      where: { id },
      data: { status: 'RENDERING' }
    })

    await renderQueue.add('render', { projectId: id })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to start render' }, { status: 500 })
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        renderJobs: {
          orderBy: { startedAt: 'desc' },
          take: 1
        },
        scenes: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch status' }, { status: 500 })
  }
}

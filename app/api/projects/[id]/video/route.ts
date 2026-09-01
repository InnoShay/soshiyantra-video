import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { readFileSync, existsSync } from 'fs'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project || !project.outputUrl) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    const filePath = project.outputUrl
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const videoBuffer = readFileSync(filePath)

    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': videoBuffer.length.toString()
      }
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to serve video' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const scene = await prisma.scene.update({
      where: { id },
      data: {
        prompt: body.prompt,
        voiceover: body.voiceover,
        durationSeconds: body.durationSeconds
      }
    })

    return NextResponse.json(scene)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to update scene' }, { status: 500 })
  }
}

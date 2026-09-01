import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    
    // Quick validation, in a real scenario we'd use Zod for this payload
    if (!body.idea) {
      return NextResponse.json({ error: 'Idea is required' }, { status: 400 })
    }

    const project = await prisma.project.create({
      data: {
        title: "Untitled Project",
        status: 'DRAFT',
        inputBrief: JSON.stringify(body)
      }
    })
    
    return NextResponse.json(project)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { MockStoryPlanner } from '@/lib/ai/planner'
import { UserBrief } from '@/lib/validation/schemas'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const project = await prisma.project.findUnique({
      where: { id }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // In a real app we'd parse this safely
    const rawInput = JSON.parse(project.inputBrief)
    const userBrief: UserBrief = {
      topic: rawInput.idea || "Untitled",
      objective: "Motivate",
      durationSeconds: rawInput.duration || 60,
      platform: rawInput.platform || "linkedin",
      style: rawInput.style || "cinematic",
      tone: rawInput.tone || "motivational"
    }

    // Update status to planning
    await prisma.project.update({
      where: { id },
      data: { status: 'PLANNING' }
    })

    const planner = new MockStoryPlanner()
    const plan = await planner.createProductionPlan(userBrief)

    // In a real system, you'd insert characters, locations, scenes to the DB here.
    // For MVP phase 4, we might just store it all on the project as JSON for simplicity,
    // or properly map it. The SRD has Project.productionPlan JSON AND relations.
    // Let's store the raw JSON first.
    
    await prisma.project.update({
      where: { id },
      data: {
        title: plan.title,
        status: 'PLAN_READY',
        productionPlan: plan as any
      }
    })

    // Let's seed the relational tables for storyboard to work properly (Phase 5)
    // We clear existing first in case it's a regenerate
    await prisma.scene.deleteMany({ where: { projectId: id } })
    await prisma.character.deleteMany({ where: { projectId: id } })
    await prisma.location.deleteMany({ where: { projectId: id } })

    // Create Characters
    for (const char of plan.characters) {
      await prisma.character.create({
        data: {
          projectId: id,
          name: char.name,
          description: char.personality || '',
          visualBible: char as any
        }
      })
    }

    // Create Locations
    for (const loc of plan.locations) {
      await prisma.location.create({
        data: {
          projectId: id,
          name: loc.name,
          description: loc.architecture || '',
          visualBible: loc as any
        }
      })
    }

    // Create Scenes
    for (const scene of plan.scenes) {
      await prisma.scene.create({
        data: {
          projectId: id,
          order: scene.order,
          durationSeconds: scene.durationSeconds,
          prompt: scene.visualPrompt,
          negativePrompt: scene.negativePrompt,
          dialogue: scene.dialogue,
          voiceover: scene.voiceover,
          status: 'PENDING'
        }
      })
    }

    return NextResponse.json({ success: true, plan })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}

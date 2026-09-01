import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function StoryboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      scenes: { orderBy: { order: 'asc' } },
      characters: true,
      locations: true
    }
  })

  if (!project) return notFound()

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-10 flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-3">{project.title}</h1>
          <p className="text-neutral-400 max-w-2xl text-lg">
            {(project.productionPlan as any)?.hook || "A story unfolding..."}
          </p>
        </div>
        <Link href={`/projects/${project.id}/render`}>
          <Button size="lg" className="bg-white text-black hover:bg-neutral-200">
            Render Video
          </Button>
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Characters</h2>
          {project.characters.map((char) => (
            <Card key={char.id} className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-5">
                <h3 className="font-medium text-white text-lg">{char.name}</h3>
                <p className="text-sm text-neutral-400 mt-2">{char.description}</p>
              </CardContent>
            </Card>
          ))}
          
          <h2 className="text-xl font-semibold text-white mb-4 mt-8">Locations</h2>
          {project.locations.map((loc) => (
            <Card key={loc.id} className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-5">
                <h3 className="font-medium text-white text-lg">{loc.name}</h3>
                <p className="text-sm text-neutral-400 mt-2">{loc.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-semibold text-white mb-4">Scenes</h2>
          {project.scenes.map((scene) => (
            <Card key={scene.id} className="bg-neutral-900 border-neutral-800">
              <CardContent className="p-6">
                <div className="flex justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-neutral-800 text-neutral-300 w-8 h-8 flex items-center justify-center rounded-full font-medium text-sm">
                      {scene.order}
                    </span>
                    <span className="text-neutral-500 text-sm">{scene.durationSeconds}s</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800">Edit</Button>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Visual Prompt</h4>
                    <p className="text-neutral-300 text-sm leading-relaxed">{scene.prompt}</p>
                  </div>
                  {scene.voiceover && (
                    <div>
                      <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-1">Voiceover</h4>
                      <p className="text-neutral-300 text-sm italic">"{scene.voiceover}"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

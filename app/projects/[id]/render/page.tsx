"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RenderPage() {
  const { id } = useParams()
  const [project, setProject] = useState<any>(null)
  const [error, setError] = useState("")

  const fetchStatus = async () => {
    try {
      const res = await fetch(`/api/projects/${id}/render`)
      const data = await res.json()
      setProject(data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleStartRender = async () => {
    try {
      await fetch(`/api/projects/${id}/render`, { method: 'POST' })
      fetchStatus()
    } catch (e) {
      setError("Failed to start render")
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(() => {
      fetchStatus()
    }, 3000)
    return () => clearInterval(interval)
  }, [id])

  if (!project) return <div className="p-12 text-center text-white">Loading...</div>

  const isRendering = project.status === 'RENDERING' || project.status === 'ASSEMBLING'
  const isCompleted = project.status === 'COMPLETED'
  const renderJob = project.renderJobs?.[0]

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Studio Render</h1>
        <p className="text-neutral-400">Project: {project.title}</p>
      </header>

      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-xl mb-6">
          {error}
        </div>
      )}

      {isCompleted && project.outputUrl ? (
        <Card className="bg-neutral-900 border-neutral-800 overflow-hidden shadow-2xl">
          <CardContent className="p-0">
            <video 
              src={`/api/projects/${id}/video`} 
              controls 
              className="w-full aspect-video bg-black"
              autoPlay
            />
            <div className="p-6 text-center">
              <Button size="lg" className="bg-white text-black hover:bg-neutral-200">
                Download MP4
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-neutral-900/50 border-neutral-800">
          <CardContent className="p-8">
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-neutral-400">Overall Progress</span>
                <span className="text-white font-medium">{renderJob?.progress || 0}%</span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-white h-3 transition-all duration-500" 
                  style={{ width: `${renderJob?.progress || 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-semibold mb-4">Scene Status</h3>
              {project.scenes?.map((scene: any) => (
                <div key={scene.id} className="flex justify-between items-center bg-neutral-800/50 p-4 rounded-lg">
                  <div className="flex gap-4 items-center">
                    <span className="text-neutral-500 font-mono">{scene.order}</span>
                    <span className="text-neutral-300 text-sm truncate max-w-xs">{scene.prompt}</span>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      scene.status === 'COMPLETED' ? 'bg-green-500/20 text-green-300' :
                      scene.status === 'GENERATING' ? 'bg-yellow-500/20 text-yellow-300' :
                      scene.status === 'FAILED' ? 'bg-red-500/20 text-red-300' :
                      'bg-neutral-700 text-neutral-400'
                    }`}>
                      {scene.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {!isRendering && project.status !== 'COMPLETED' && (
              <div className="mt-10 text-center">
                <Button size="lg" onClick={handleStartRender} className="bg-white text-black hover:bg-neutral-200">
                  Start Render
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

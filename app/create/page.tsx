"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"

export default function CreatePage() {
  const [idea, setIdea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!idea) return
    setIsGenerating(true)
    try {
      // 1. Create project
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      })
      const project = await res.json()
      
      // 2. Generate plan
      await fetch(`/api/projects/${project.id}/plan`, {
        method: 'POST'
      })
      
      // 3. Navigate to storyboard
      router.push(`/projects/${project.id}/storyboard`)
    } catch (error) {
      console.error(error)
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-4">Turn an idea into a video.</h1>
        <p className="text-lg md:text-xl text-neutral-400">Describe it. We’ll direct the rest.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="bg-neutral-900/50 border-neutral-800 shadow-xl overflow-hidden group focus-within:ring-1 focus-within:ring-neutral-700 transition-all">
            <CardContent className="p-0">
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Example: A 60-second motivational story about a student who fails his first startup but keeps building."
                className="min-h-[280px] w-full resize-none bg-transparent border-0 text-lg leading-relaxed focus-visible:ring-0 p-8 placeholder:text-neutral-600"
              />
            </CardContent>
          </Card>

          <Button 
            size="lg" 
            onClick={handleGenerate}
            disabled={idea.trim().length === 0 || isGenerating}
            className="w-full bg-white text-black hover:bg-neutral-200 text-lg py-7 font-medium rounded-xl transition-all"
          >
            {isGenerating ? "Generating..." : "Build Storyboard"}
          </Button>
        </div>

        <div className="space-y-6">
          <Card className="bg-neutral-900/50 border-neutral-800">
            <CardContent className="p-6 space-y-8">
              
              <div className="space-y-4">
                <Label className="text-neutral-400 font-medium uppercase tracking-wider text-xs">Content Type</Label>
                <Select defaultValue="story">
                  <SelectTrigger className="bg-neutral-900 border-neutral-800 h-12">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="explainer">Explainer</SelectItem>
                    <SelectItem value="promo">Promo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-neutral-400 font-medium uppercase tracking-wider text-xs">Tone</Label>
                <Select defaultValue="motivational">
                  <SelectTrigger className="bg-neutral-900 border-neutral-800 h-12">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="motivational">Motivational</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="funny">Funny</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-neutral-400 font-medium uppercase tracking-wider text-xs">Visual Style</Label>
                <Select defaultValue="cinematic">
                  <SelectTrigger className="bg-neutral-900 border-neutral-800 h-12">
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border-neutral-700 text-white">
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="3d">3D Render</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-neutral-400 font-medium uppercase tracking-wider text-xs">Platform & Ratio</Label>
                <RadioGroup defaultValue="linkedin" className="grid grid-cols-2 gap-3">
                  <div>
                    <RadioGroupItem value="linkedin" id="linkedin" className="peer sr-only" />
                    <Label
                      htmlFor="linkedin"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-neutral-800 bg-neutral-900 p-4 hover:bg-neutral-800 hover:text-white peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 cursor-pointer transition-all"
                    >
                      <span className="font-medium">LinkedIn</span>
                      <span className="text-xs text-neutral-500 mt-1">16:9</span>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem value="shorts" id="shorts" className="peer sr-only" />
                    <Label
                      htmlFor="shorts"
                      className="flex flex-col items-center justify-between rounded-xl border-2 border-neutral-800 bg-neutral-900 p-4 hover:bg-neutral-800 hover:text-white peer-data-[state=checked]:border-white peer-data-[state=checked]:bg-white/10 cursor-pointer transition-all"
                    >
                      <span className="font-medium">Shorts</span>
                      <span className="text-xs text-neutral-500 mt-1">9:16</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
        Sociantra AI Video Studio
      </h1>
      <p className="text-xl text-neutral-400 max-w-2xl mb-10">
        Give us an idea. We turn it into a directed short video. No prompt engineering required.
      </p>
      <Link href="/create">
        <Button size="lg" className="bg-white text-black hover:bg-neutral-200 text-lg px-8 py-6 rounded-xl">
          Start Creating
        </Button>
      </Link>
    </main>
  )
}

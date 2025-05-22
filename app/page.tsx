import { MemoryGame } from "@/components/memory-game"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-starry-night">
      <div className="max-w-5xl w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <h1 className="text-4xl tracking-wide fluffy-title text-slate-800 sm:text-5xl">HRM Systems Team Memory</h1>
          </div>
          <p className="text-slate-800 max-w-md mx-auto font-medium fluffy-subtitle">
            Lerne unsere Teammitglieder kennen, indem du ihre Fotos in diesem unterhaltsamen Memory-Spiel zusammenfügst!
          </p>
        </div>
        <MemoryGame />
      </div>
    </main>
  )
}

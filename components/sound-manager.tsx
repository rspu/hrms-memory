"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type SoundType = "cardFlip" | "match" | "mismatch" | "gameComplete"

interface SoundContextType {
  playSound: (sound: SoundType) => void
  isMuted: boolean
  toggleMute: () => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(false)
  const [sounds, setSounds] = useState<Record<SoundType, HTMLAudioElement | null>>({
    cardFlip: null,
    match: null,
    mismatch: null,
    gameComplete: null,
  })

  // Initialize sounds
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSounds({
        cardFlip: new Audio("/card-flip.mp3"),
        match: new Audio("/match.mp3"),
        mismatch: new Audio("/mismatch.mp3"),
        gameComplete: new Audio("/trumpet-fanfare.mp3"),
      })
    }
  }, [])

  // Load mute state from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("memoryGameMuted")
      if (savedMute !== null) {
        setIsMuted(savedMute === "true")
      }
    }
  }, [])

  // Save mute state to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("memoryGameMuted", isMuted.toString())
    }
  }, [isMuted])

  const playSound = (sound: SoundType) => {
    if (isMuted || !sounds[sound]) return

    // Stop and reset the sound before playing
    const audioElement = sounds[sound]
    if (audioElement) {
      audioElement.currentTime = 0
      audioElement.play().catch((error) => {
        console.error("Error playing sound:", error)
      })
    }
  }

  const toggleMute = () => {
    setIsMuted((prev) => !prev)
  }

  return <SoundContext.Provider value={{ playSound, isMuted, toggleMute }}>{children}</SoundContext.Provider>
}

export function useSound() {
  const context = useContext(SoundContext)
  if (context === undefined) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}

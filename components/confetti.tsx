"use client"

import { useEffect, useState } from "react"
import type { JSX } from "react/jsx-runtime"

export function Confetti() {
  const [particles, setParticles] = useState<JSX.Element[]>([])

  useEffect(() => {
    // Create confetti particles
    const colors = ["#f94144", "#f3722c", "#f8961e", "#f9c74f", "#90be6d", "#43aa8b", "#4d908e", "#577590", "#277da1"]

    const newParticles: JSX.Element[] = []

    for (let i = 0; i < 100; i++) {
      const left = Math.random() * 100
      const top = Math.random() * 100
      const size = Math.random() * 10 + 5
      const color = colors[Math.floor(Math.random() * colors.length)]
      const animationDuration = Math.random() * 3 + 2
      const animationDelay = Math.random() * 0.5

      newParticles.push(
        <div
          key={i}
          className="absolute rounded-sm"
          style={{
            left: `${left}%`,
            top: `${top}%`,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: color,
            animation: `fall ${animationDuration}s ease-in ${animationDelay}s`,
          }}
        />,
      )
    }

    setParticles(newParticles)

    // Add keyframes for the fall animation
    const style = document.createElement("style")
    style.innerHTML = `
      @keyframes fall {
        0% {
          transform: translateY(-100vh) rotate(0deg);
          opacity: 1;
        }
        100% {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
      
      .perspective-1000 {
        perspective: 1000px;
      }
      
      .transform-style-3d {
        transform-style: preserve-3d;
      }
      
      .backface-hidden {
        backface-visibility: hidden;
      }
      
      .rotate-y-180 {
        transform: rotateY(180deg);
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return <div className="fixed inset-0 pointer-events-none overflow-hidden">{particles}</div>
}

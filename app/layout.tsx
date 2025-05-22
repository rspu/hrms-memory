import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { SoundProvider } from "../components/sound-manager"

// Importiere eine verspieltere Schriftart für die Titel
import { Baloo_2 } from "next/font/google"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

// Definiere die flauschige Schriftart
const baloo = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo",
  weight: ["400", "500", "600", "700", "800"],
})

export const metadata = {
  title: "HRM Systems Team Memory",
  description: "Ein Memory-Spiel, um das HRM Systems Team kennenzulernen",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} ${baloo.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SoundProvider>{children}</SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

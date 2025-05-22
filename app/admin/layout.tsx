import type React from "react"
import Link from "next/link"
import { Users, Grid } from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Memory Game Admin</h1>
          <nav className="flex gap-4">
            <Link href="/admin" className="flex items-center gap-1 hover:underline">
              <Users className="h-4 w-4" />
              Team Members
            </Link>
            <Link href="/admin/teams" className="flex items-center gap-1 hover:underline">
              <Grid className="h-4 w-4" />
              Teams
            </Link>
            <Link href="/" className="hover:underline">
              Back to Game
            </Link>
          </nav>
        </div>
      </header>
      <main className="py-6">{children}</main>
    </div>
  )
}

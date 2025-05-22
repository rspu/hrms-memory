"use client"

import { useState, useEffect } from "react"
import { Trophy } from "lucide-react"
import { getLeaderboard, type LeaderboardEntry } from "@/lib/supabase"
import type { Team } from "@/types/team"

type LeaderboardProps = {
  teamId: number | string
  difficulty: string
  teams: Team[]
}

export function Leaderboard({ teamId, difficulty, teams }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch leaderboard data
  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      try {
        const data = await getLeaderboard(teamId, difficulty)
        setEntries(data)
      } catch (error) {
        console.error("Error fetching leaderboard:", error)
        setEntries([])
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [teamId, difficulty])

  // Get team name by ID
  const getTeamName = (teamId: number | string) => {
    const numericTeamId = typeof teamId === "string" ? Number.parseInt(teamId, 10) : teamId

    if (numericTeamId === -1) {
      return "Alle Teams"
    }

    return teams.find((team) => team.id === numericTeamId)?.name || `Team ${teamId}`
  }

  // Format difficulty for display
  const formatDifficulty = (diff: string) => {
    switch (diff) {
      case "easy":
        return "Leicht"
      case "medium":
        return "Mittel"
      case "hard":
        return "Schwer"
      default:
        return diff
    }
  }

  // Render medal based on rank
  const renderMedal = (rank: number) => {
    if (rank === 0) {
      return <Trophy className="h-4 w-4 text-yellow-500" />
    } else if (rank === 1) {
      return <Trophy className="h-4 w-4 text-gray-400" />
    } else if (rank === 2) {
      return <Trophy className="h-4 w-4 text-amber-700" />
    }
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mt-4">
      <div className="p-3 bg-primary/10 border-b border-primary/20">
        <h3 className="font-bold text-slate-700 text-center">
          Bestenliste: {getTeamName(teamId)} - {formatDifficulty(difficulty)}
        </h3>
      </div>

      <div className="p-3 bg-primary/5 border-b border-primary/10 flex items-center text-sm">
        <div className="w-10 text-center font-bold text-slate-700">#</div>
        <div className="w-10 text-center font-bold text-slate-700"></div>
        <div className="flex-1 font-bold text-slate-700">Spieler</div>
        <div className="w-20 text-center font-bold text-slate-700">Züge</div>
      </div>

      {loading ? (
        <div className="p-4 text-center text-slate-500">Lade Bestenliste...</div>
      ) : entries.length === 0 ? (
        <div className="p-4 text-center text-slate-500">Noch keine Einträge</div>
      ) : (
        <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
          {entries.map((entry, index) => (
            <div key={entry.id} className="flex items-center p-2 hover:bg-gray-50">
              <div className="w-10 text-center font-medium text-gray-500">{index + 1}</div>
              <div className="w-10 flex justify-center">{renderMedal(index)}</div>
              <div className="flex-1 font-medium text-sm">{entry.player_name}</div>
              <div className="w-20 text-center font-mono text-sm">{entry.moves}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

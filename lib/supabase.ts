import { createClient } from "@supabase/supabase-js"
import { mockSaveScore, mockGetLeaderboard } from "./mock-leaderboard"

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if environment variables are set
const isSupabaseConfigured = supabaseUrl && supabaseAnonKey

// Create a single supabase client for interacting with your database
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

export type LeaderboardEntry = {
  id?: string
  player_name: string
  team_id: number
  difficulty: string
  moves: number
  created_at?: string
}

export async function saveScore(entry: Omit<LeaderboardEntry, "id" | "created_at">) {
  // Use mock implementation if Supabase is not configured
  if (!supabase) {
    console.warn("Using mock implementation for saveScore because Supabase is not configured")
    return mockSaveScore(entry)
  }

  try {
    const { data, error } = await supabase.from("memory_leaderboard").insert([entry]).select()

    if (error) {
      console.error("Error saving score:", error)
      return null
    }

    return data?.[0] || null
  } catch (error) {
    console.error("Error saving score:", error)
    return null
  }
}

export async function getLeaderboard(teamId: number | string, difficulty: string) {
  // Convert teamId to number if it's a string
  const numericTeamId = typeof teamId === "string" ? Number.parseInt(teamId, 10) : teamId

  // Use mock implementation if Supabase is not configured
  if (!supabase) {
    console.warn("Using mock implementation for getLeaderboard because Supabase is not configured")
    return mockGetLeaderboard(numericTeamId, difficulty)
  }

  try {
    // Get all entries for the team and difficulty
    const { data: allEntries, error: entriesError } = await supabase
      .from("memory_leaderboard")
      .select("*")
      .eq("team_id", numericTeamId)
      .eq("difficulty", difficulty)

    if (entriesError) {
      console.error("Error fetching entries:", entriesError)
      return []
    }

    if (!allEntries || allEntries.length === 0) {
      return []
    }

    // Process the data in JavaScript to get the best score for each player
    const playerBestScores = new Map<string, LeaderboardEntry>()

    // Find the best score for each player
    allEntries.forEach((entry) => {
      if (!playerBestScores.has(entry.player_name) || entry.moves < playerBestScores.get(entry.player_name)!.moves) {
        playerBestScores.set(entry.player_name, entry)
      }
    })

    // Convert the map values to an array, sort by moves, and limit to top 10
    const bestEntries = Array.from(playerBestScores.values())
      .sort((a, b) => a.moves - b.moves)
      .slice(0, 10)

    return bestEntries
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    return []
  }
}

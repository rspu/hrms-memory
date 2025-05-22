import type { LeaderboardEntry } from "./supabase"

// Mock data for local development
const mockLeaderboard: Record<number, Record<string, LeaderboardEntry[]>> = {
  [-1]: {
    easy: [
      { player_name: "Max", team_id: -1, difficulty: "easy", moves: 12, created_at: new Date().toISOString() },
      { player_name: "Anna", team_id: -1, difficulty: "easy", moves: 15, created_at: new Date().toISOString() },
      { player_name: "Tom", team_id: -1, difficulty: "easy", moves: 18, created_at: new Date().toISOString() },
      // Add a duplicate player with a worse score to test filtering
      { player_name: "Max", team_id: -1, difficulty: "easy", moves: 20, created_at: new Date().toISOString() },
    ],
    medium: [
      { player_name: "Lisa", team_id: -1, difficulty: "medium", moves: 20, created_at: new Date().toISOString() },
      { player_name: "Jan", team_id: -1, difficulty: "medium", moves: 22, created_at: new Date().toISOString() },
    ],
    hard: [{ player_name: "Sarah", team_id: -1, difficulty: "hard", moves: 35, created_at: new Date().toISOString() }],
  },
  6: {
    easy: [
      {
        player_name: "Felix",
        team_id: 6,
        difficulty: "easy",
        moves: 10,
        created_at: new Date().toISOString(),
      },
    ],
    medium: [],
    hard: [],
  },
  7: {
    easy: [],
    medium: [],
    hard: [],
  },
  8: {
    easy: [],
    medium: [],
    hard: [],
  },
}

// Mock save score function
export async function mockSaveScore(
  entry: Omit<LeaderboardEntry, "id" | "created_at">,
): Promise<LeaderboardEntry | null> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    // Create a new entry with ID and timestamp
    const newEntry: LeaderboardEntry = {
      ...entry,
      id: Math.random().toString(36).substring(2, 15),
      created_at: new Date().toISOString(),
    }

    // Initialize team and difficulty arrays if they don't exist
    if (!mockLeaderboard[entry.team_id]) {
      mockLeaderboard[entry.team_id] = { easy: [], medium: [], hard: [] }
    }

    if (!mockLeaderboard[entry.team_id][entry.difficulty]) {
      mockLeaderboard[entry.team_id][entry.difficulty] = []
    }

    // Add the new entry
    mockLeaderboard[entry.team_id][entry.difficulty].push(newEntry)

    // Sort by moves (ascending)
    mockLeaderboard[entry.team_id][entry.difficulty].sort((a, b) => a.moves - b.moves)

    return newEntry
  } catch (error) {
    console.error("Error in mock save:", error)
    return null
  }
}

// Mock get leaderboard function
export async function mockGetLeaderboard(teamId: number, difficulty: string): Promise<LeaderboardEntry[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  try {
    // Return empty array if team or difficulty doesn't exist in mock data
    if (!mockLeaderboard[teamId] || !mockLeaderboard[teamId][difficulty]) {
      return []
    }

    // Get all entries for the team and difficulty
    const allEntries = [...mockLeaderboard[teamId][difficulty]]

    // Create a map to store the best score for each player
    const bestScores = new Map<string, LeaderboardEntry>()

    // Find the best score for each player
    allEntries.forEach((entry) => {
      if (!bestScores.has(entry.player_name) || entry.moves < bestScores.get(entry.player_name)!.moves) {
        bestScores.set(entry.player_name, entry)
      }
    })

    // Convert the map values to an array, sort by moves, and limit to top 10
    return Array.from(bestScores.values())
      .sort((a, b) => a.moves - b.moves)
      .slice(0, 10)
  } catch (error) {
    console.error("Error in mock get:", error)
    return []
  }
}

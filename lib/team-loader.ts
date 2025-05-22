import { supabase } from "./supabase"
import type { TeamMember, Team } from "@/types/team"

// Mock data for local development or when Supabase is not configured
const mockTeams: Team[] = [
  { id: 1, name: "Verwaltungsrat" },
  { id: 2, name: "Geschäftsleitung" },
  { id: 3, name: "Entwicklung" },
  { id: 4, name: "Produktmanagement" },
  { id: 5, name: "Marketing" },
  { id: 6, name: "Dienstleistungen KTG" },
  { id: 7, name: "Produktentwicklung CAREMA" },
  { id: 8, name: "Produktentwicklung USO" },
]

const mockTeamMembers: Record<number, TeamMember[]> = {
  1: [
    {
      id: 1,
      name: "Georg Hartmann",
      image: "https://www.hrm-systems.ch/content/uploads/2020/10/Georg-Hartmann_crop-e1602310944567-944x944.jpg",
      title: "Chair of the Administrative board",
      teamIds: [1],
    },
    {
      id: 2,
      name: "Annamaria Hartmann-Floridia",
      image: "https://www.hrm-systems.ch/content/uploads/2021/05/Annamaria-Hartmann_quadrat-944x944.jpg",
      title: "",
      teamIds: [1],
    },
    // More mock data...
  ],
}

// Mock data for all team members
const mockAllTeamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Georg Hartmann",
    image: "https://www.hrm-systems.ch/content/uploads/2020/10/Georg-Hartmann_crop-e1602310944567-944x944.jpg",
    title: "Chair of the Administrative board",
    teamIds: [1],
  },
  {
    id: 2,
    name: "Annamaria Hartmann-Floridia",
    image: "https://www.hrm-systems.ch/content/uploads/2021/05/Annamaria-Hartmann_quadrat-944x944.jpg",
    title: "",
    teamIds: [1],
  },
  {
    id: 3,
    name: "John Doe",
    image: "/placeholder.svg",
    title: "Developer",
    teamIds: [3],
  },
  {
    id: 4,
    name: "Jane Smith",
    image: "/placeholder.svg",
    title: "Product Manager",
    teamIds: [4],
  },
  // More mock data...
]

// Function to load team data from Supabase
export const loadTeamData = async (teamId: number): Promise<TeamMember[]> => {
  try {
    // Use mock data if Supabase is not configured
    if (!supabase) {
      console.warn("Using mock team data because Supabase is not configured")
      return mockTeamMembers[teamId] || []
    }

    // Fetch team members from Supabase that belong to the specified team
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .contains("team_ids", [teamId])
      .order("full_name")

    if (error) {
      console.error("Error fetching team members:", error)
      return mockTeamMembers[teamId] || []
    }

    // Map the Supabase data to our TeamMember format
    return data.map((member, index) => ({
      id: index + 1, // Generate sequential IDs for the game logic
      name: member.full_name,
      image: member.profile_image,
      title: member.job_title || "",
      teamIds: member.team_ids || [],
    }))
  } catch (error) {
    console.error(`Error loading team data for team ID ${teamId}:`, error)
    return mockTeamMembers[teamId] || []
  }
}

// Function to load all team members from Supabase
export const loadAllTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    // Use mock data if Supabase is not configured
    if (!supabase) {
      console.warn("Using mock all team members because Supabase is not configured")
      return mockAllTeamMembers
    }

    // Fetch all team members from Supabase
    const { data, error } = await supabase.from("team_members").select("*").order("full_name")

    if (error) {
      console.error("Error fetching all team members:", error)
      return mockAllTeamMembers
    }

    // Map the Supabase data to our TeamMember format
    return data.map((member, index) => ({
      id: index + 1, // Generate sequential IDs for the game logic
      name: member.full_name,
      image: member.profile_image,
      title: member.job_title || "",
      teamIds: member.team_ids || [],
    }))
  } catch (error) {
    console.error("Error loading all team members:", error)
    return mockAllTeamMembers
  }
}

// Function to load all available teams from Supabase
export const loadAllTeams = async (): Promise<Team[]> => {
  try {
    // Use mock data if Supabase is not configured
    if (!supabase) {
      console.warn("Using mock teams because Supabase is not configured")
      return mockTeams
    }

    // Fetch teams from Supabase
    const { data, error } = await supabase.from("teams").select("*")

    if (error) {
      console.error("Error fetching teams:", error)
      return mockTeams
    }

    return data.map((team) => ({
      id: team.id,
      name: team.name,
    }))
  } catch (error) {
    console.error("Error loading teams:", error)
    return mockTeams
  }
}

// Function to get team by ID
export const getTeamById = async (teamId: number): Promise<Team | null> => {
  try {
    // Use mock data if Supabase is not configured
    if (!supabase) {
      const team = mockTeams.find((t) => t.id === teamId)
      return team || null
    }

    // Fetch team from Supabase
    const { data, error } = await supabase.from("teams").select("*").eq("id", teamId).single()

    if (error) {
      console.error(`Error fetching team with ID ${teamId}:`, error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
    }
  } catch (error) {
    console.error(`Error getting team with ID ${teamId}:`, error)
    return null
  }
}

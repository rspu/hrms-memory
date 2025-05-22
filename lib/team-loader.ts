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
      title: "Board Member",
      teamIds: [1],
    },
    {
      id: 3,
      name: "Stephan Heuberger",
      image: "https://www.hrm-systems.ch/content/uploads/2020/10/Stephan-Heuberger_2-scaled-e1602316675849-944x944.jpg",
      title: "Board Member",
      teamIds: [1],
    },
    {
      id: 4,
      name: "Olivier Steiger",
      image: "https://www.hrm-systems.ch/content/uploads/2024/07/Oliver-Steiger.jpg",
      title: "Board Member",
      teamIds: [1],
    },
    {
      id: 5,
      name: "Benedikt Unold",
      image: "https://www.hrm-systems.ch/content/uploads/2024/07/Benedikt-Unold_800_Px.jpg",
      title: "Board Member",
      teamIds: [1],
    },
    {
      id: 6,
      name: "Cornelia Flury",
      image: "https://www.hrm-systems.ch/content/uploads/2022/05/800pxOriginal-JPG-Cornelia-Flury_HRM_Systems23968.jpg",
      title: "Assistant to the Administrative board",
      teamIds: [1],
    },
  ],
  2: [
    {
      id: 7,
      name: "Michael Schmidt",
      image: "/professional-man-glasses.png",
      title: "CEO",
      teamIds: [2],
    },
    {
      id: 8,
      name: "Sarah Johnson",
      image: "/professional-woman-smiling.png",
      title: "CFO",
      teamIds: [2],
    },
    {
      id: 9,
      name: "Thomas Weber",
      image: "/businessman-suit.png",
      title: "CTO",
      teamIds: [2],
    },
    {
      id: 10,
      name: "Laura Müller",
      image: "/professional-woman-short-hair.png",
      title: "COO",
      teamIds: [2],
    },
    {
      id: 11,
      name: "Daniel Fischer",
      image: "/bearded-businessman.png",
      title: "CMO",
      teamIds: [2],
    },
    {
      id: 12,
      name: "Julia Schneider",
      image: "/professional-woman-long-hair.png",
      title: "CHRO",
      teamIds: [2],
    },
  ],
  3: [
    {
      id: 13,
      name: "Markus Bauer",
      image: "/software-developer-man.png",
      title: "Lead Developer",
      teamIds: [3],
    },
    {
      id: 14,
      name: "Nina Hoffmann",
      image: "/images/team/brigitte-rohner.png",
      title: "Senior Developer",
      teamIds: [3],
    },
    {
      id: 15,
      name: "Felix Wagner",
      image: "/images/team/lucas-von-niederhausern.png",
      title: "Backend Developer",
      teamIds: [3],
    },
    {
      id: 16,
      name: "Sophia Richter",
      image: "/images/team/leon-kussner.png",
      title: "Frontend Developer",
      teamIds: [3],
    },
    {
      id: 17,
      name: "Lukas Becker",
      image: "/images/team/david-schrag.png",
      title: "DevOps Engineer",
      teamIds: [3],
    },
    {
      id: 18,
      name: "Emma Klein",
      image: "/images/team/trisha-steiner.png",
      title: "QA Engineer",
      teamIds: [3],
    },
    {
      id: 19,
      name: "Jonas Schäfer",
      image: "/images/team/barbara-hemmi.png",
      title: "Mobile Developer",
      teamIds: [3],
    },
    {
      id: 20,
      name: "Lena Huber",
      image: "/images/team/francois-thomasset.png",
      title: "UX/UI Designer",
      teamIds: [3, 4],
    },
  ],
  4: [
    {
      id: 21,
      name: "Tobias Wolf",
      image: "/images/team/nadine-isler.png",
      title: "Head of Product",
      teamIds: [4],
    },
    {
      id: 22,
      name: "Anna Zimmermann",
      image: "/images/team/ivan-fazzolari.png",
      title: "Product Owner",
      teamIds: [4],
    },
    {
      id: 23,
      name: "Max Schulz",
      image: "/images/team/simon-zeltner.png",
      title: "Business Analyst",
      teamIds: [4],
    },
    {
      id: 24,
      name: "Sophie Neumann",
      image: "/images/team/produktentwicklung-carema/matthias-kutil.webp",
      title: "Scrum Master",
      teamIds: [4],
    },
    {
      id: 25,
      name: "David Krause",
      image: "/images/team/produktentwicklung-carema/zsuzsanna-vasas.webp",
      title: "Product Manager",
      teamIds: [4],
    },
    {
      id: 26,
      name: "Hannah Schwarz",
      image: "/images/team/produktentwicklung-carema/martin-saegesser.webp",
      title: "Requirements Engineer",
      teamIds: [4],
    },
  ],
  5: [
    {
      id: 27,
      name: "Christian Braun",
      image: "/images/team/produktentwicklung-carema/isabel-ringgenberg.webp",
      title: "Marketing Director",
      teamIds: [5],
    },
    {
      id: 28,
      name: "Lisa Hofmann",
      image: "/images/team/produktentwicklung-uso/patrick-ponti.webp",
      title: "Content Manager",
      teamIds: [5],
    },
    {
      id: 29,
      name: "Tim Schuster",
      image: "/images/team/produktentwicklung-uso/rolf-spuler.webp",
      title: "Social Media Manager",
      teamIds: [5],
    },
    {
      id: 30,
      name: "Mia Vogel",
      image: "/images/team/produktentwicklung-uso/simon-zeltner.webp",
      title: "Graphic Designer",
      teamIds: [5],
    },
    {
      id: 31,
      name: "Philipp Keller",
      image: "/images/team/produktentwicklung-uso/leon-kuessner.webp",
      title: "SEO Specialist",
      teamIds: [5],
    },
    {
      id: 32,
      name: "Katharina Maier",
      image: "/images/team/produktentwicklung-uso/ramona-ernst.webp",
      title: "Event Manager",
      teamIds: [5],
    },
  ],
  6: [
    {
      id: 33,
      name: "Aurora Ajvazaj",
      image: "/professional-woman-smiling.png",
      title: "Team Lead KTG",
      teamIds: [6],
    },
    {
      id: 34,
      name: "Karina Duss",
      image: "/images/team/dienstleistungen-ktg/karina-duss.webp",
      title: "Senior Consultant",
      teamIds: [6],
    },
    {
      id: 35,
      name: "Brigitte Bacher",
      image: "/images/team/dienstleistungen-ktg/brigitte-bacher.webp",
      title: "Consultant",
      teamIds: [6],
    },
    {
      id: 36,
      name: "Dario Flumini",
      image: "/images/team/dienstleistungen-ktg/dario-flumini.jpg",
      title: "Consultant",
      teamIds: [6],
    },
    {
      id: 37,
      name: "Judith Kehrli",
      image: "/images/team/dienstleistungen-ktg/judith-kehrli.jpg",
      title: "Junior Consultant",
      teamIds: [6],
    },
    {
      id: 38,
      name: "Alessia Singer",
      image: "/images/team/dienstleistungen-ktg/alessia-singer.webp",
      title: "Junior Consultant",
      teamIds: [6],
    },
    {
      id: 39,
      name: "Sophie Schiess",
      image: "/images/team/dienstleistungen-ktg/sophie-schiess.webp",
      title: "Consultant",
      teamIds: [6],
    },
  ],
  7: [
    {
      id: 40,
      name: "Matthias Kutil",
      image: "/images/team/produktentwicklung-carema/matthias-kutil.webp",
      title: "Team Lead CAREMA",
      teamIds: [7],
    },
    {
      id: 41,
      name: "Melanie Müller",
      image: "/images/team/produktentwicklung-carema/melanie-mueller.jpg",
      title: "Product Specialist",
      teamIds: [7],
    },
    {
      id: 42,
      name: "Zsuzsanna Vasas",
      image: "/images/team/produktentwicklung-carema/zsuzsanna-vasas.webp",
      title: "Developer",
      teamIds: [7],
    },
    {
      id: 43,
      name: "Vivianne Monti",
      image: "/images/team/produktentwicklung-carema/vivianne-monti.jpg",
      title: "System Architect",
      teamIds: [7],
    },
    {
      id: 44,
      name: "Ruchika Singla",
      image: "/images/team/produktentwicklung-carema/ruchika-singla.jpg",
      title: "Software Engineer",
      teamIds: [7],
    },
    {
      id: 45,
      name: "Martin Sägesser",
      image: "/images/team/produktentwicklung-carema/martin-saegesser.webp",
      title: "IT Specialist",
      teamIds: [7],
    },
    {
      id: 46,
      name: "Isabel Ringgenberg",
      image: "/images/team/produktentwicklung-carema/isabel-ringgenberg.webp",
      title: "Project Manager",
      teamIds: [7],
    },
    {
      id: 47,
      name: "Isabelle Holbein",
      image: "/images/team/produktentwicklung-carema/isabelle-holbein.jpg",
      title: "Business Analyst",
      teamIds: [7],
    },
    {
      id: 48,
      name: "Erol Uenala",
      image: "/images/team/produktentwicklung-carema/erol-uenala.jpg",
      title: "Software Developer",
      teamIds: [7],
    },
    {
      id: 49,
      name: "Ivan Fazzolari",
      image: "/images/team/produktentwicklung-carema/ivan-fazzolari.jpg",
      title: "System Engineer",
      teamIds: [7],
    },
  ],
  8: [
    {
      id: 50,
      name: "Patrick Ponti",
      image: "/images/team/produktentwicklung-uso/patrick-ponti.webp",
      title: "Team Lead USO",
      teamIds: [8],
    },
    {
      id: 51,
      name: "Rolf Spüler",
      image: "/images/team/produktentwicklung-uso/rolf-spuler.webp",
      title: "Senior Developer",
      teamIds: [8],
    },
    {
      id: 52,
      name: "Simon Zeltner",
      image: "/images/team/produktentwicklung-uso/simon-zeltner.webp",
      title: "Software Architect",
      teamIds: [8],
    },
    {
      id: 53,
      name: "Leon Küssner",
      image: "/images/team/produktentwicklung-uso/leon-kuessner.webp",
      title: "Developer",
      teamIds: [8],
    },
    {
      id: 54,
      name: "Ramona Ernst",
      image: "/images/team/produktentwicklung-uso/ramona-ernst.webp",
      title: "Software Developer",
      teamIds: [8],
    },
    {
      id: 55,
      name: "Kevin Sandtner",
      image: "/images/team/produktentwicklung-uso/kevin-sandtner.webp",
      title: "Frontend Developer",
      teamIds: [8],
    },
    {
      id: 56,
      name: "David Schrag",
      image: "/images/team/produktentwicklung-uso/david-schrag.webp",
      title: "Backend Developer",
      teamIds: [8],
    },
    {
      id: 57,
      name: "Florian Rey",
      image: "/images/team/produktentwicklung-uso/florian-rey.webp",
      title: "QA Engineer",
      teamIds: [8],
    },
    {
      id: 58,
      name: "Cedric Mühlebach",
      image: "/images/team/produktentwicklung-uso/cedric-muehlebach.webp",
      title: "DevOps Engineer",
      teamIds: [8],
    },
  ],
}

// Create a flattened array of all team members
const mockAllTeamMembers: TeamMember[] = [
  // Verwaltungsrat (Team 1)
  ...mockTeamMembers[1],
  // Geschäftsleitung (Team 2)
  ...mockTeamMembers[2],
  // Entwicklung (Team 3)
  ...mockTeamMembers[3],
  // Produktmanagement (Team 4)
  ...mockTeamMembers[4],
  // Marketing (Team 5)
  ...mockTeamMembers[5],
  // Dienstleistungen KTG (Team 6)
  ...mockTeamMembers[6],
  // Produktentwicklung CAREMA (Team 7)
  ...mockTeamMembers[7],
  // Produktentwicklung USO (Team 8)
  ...mockTeamMembers[8],
  // Additional cross-team members
  {
    id: 59,
    name: "Maria Kowalski",
    image: "/images/team/dienstleistungen-ktg/mia-schaffner.webp",
    title: "Project Coordinator",
    teamIds: [3, 7],
  },
  {
    id: 60,
    name: "Robert Meier",
    image: "/images/team/dienstleistungen-ktg/francois-thomasset.webp",
    title: "Business Development Manager",
    teamIds: [2, 5],
  },
  {
    id: 61,
    name: "Claudia Berger",
    image: "/images/team/dienstleistungen-ktg/tatjana-rickenbach.webp",
    title: "HR Specialist",
    teamIds: [2, 6],
  },
  {
    id: 62,
    name: "Andreas Lehmann",
    image: "/images/team/dienstleistungen-ktg/karin-naegeli.webp",
    title: "IT Consultant",
    teamIds: [3, 8],
  },
]

// Function to filter out team members with placeholder images
const filterOutPlaceholderImages = (members: TeamMember[]): TeamMember[] => {
  return members.filter((member) => {
    console.log(member);
    const imageLower = member.image.toLowerCase()
    return !imageLower.includes("platzhalter")
  })
}

// Function to load team data from Supabase
export const loadTeamData = async (teamId: number): Promise<TeamMember[]> => {
  try {
    // Use mock data if Supabase is not configured
    if (!supabase) {
      console.warn("Using mock team data because Supabase is not configured")
      const teamMembers = mockTeamMembers[teamId] || []
      // Filter out members with placeholder images
      return filterOutPlaceholderImages(teamMembers)
    }

    // Fetch team members from Supabase that belong to the specified team
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .contains("team_ids", [teamId])
      .order("full_name")

    if (error) {
      console.error("Error fetching team members:", error)
      const teamMembers = mockTeamMembers[teamId] || []
      return filterOutPlaceholderImages(teamMembers)
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
    const teamMembers = mockTeamMembers[teamId] || []
    return filterOutPlaceholderImages(teamMembers)
  }
}

// Function to load all team members from Supabase
export const loadAllTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    // Use mock data if Supabase is not configured
    if (!supabase) {
      console.warn("Using mock all team members because Supabase is not configured")
      // Filter out members with placeholder images
      return filterOutPlaceholderImages(mockAllTeamMembers)
    }

    // Fetch all team members from Supabase
    const { data, error } = await supabase.from("team_members").select("*").order("full_name")

    if (error) {
      console.error("Error fetching all team members:", error)
      return filterOutPlaceholderImages(mockAllTeamMembers)
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
    return filterOutPlaceholderImages(mockAllTeamMembers)
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

// Function to get the number of members in a team
export const getTeamMemberCount = async (teamId: number): Promise<number> => {
  try {
    // Use mock data if Supabase is not configured
    if (!supabase) {
      const teamMembers = mockTeamMembers[teamId] || []
      const filteredMembers = filterOutPlaceholderImages(teamMembers)
      return filteredMembers.length
    }

    // Count team members from Supabase
    const { count, error } = await supabase
      .from("team_members")
      .select("*", { count: "exact", head: true })
      .contains("team_ids", [teamId])
      .not('profile_image', 'ilike', '%Platzhalter%');

    if (error) {
      console.error(`Error counting members for team ID ${teamId}:`, error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error(`Error getting member count for team ID ${teamId}:`, error)
    return 0
  }
}

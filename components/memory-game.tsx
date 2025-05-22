"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Trophy, Users, Volume2, VolumeX } from "lucide-react"
import Image from "next/image"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useSound } from "./sound-manager"
import { Confetti } from "@/components/confetti"
import { Leaderboard } from "./leaderboard"
import { saveScore } from "@/lib/supabase"
import { loadTeamData, loadAllTeams, getTeamById, loadAllTeamMembers } from "@/lib/team-loader"
import type { TeamMember, Team } from "@/types/team"

type CardType = {
  id: number
  memberId: number
  isFlipped: boolean
  isMatched: boolean
  cardType: "full" | "name" | "image"
}

type GameState = "start" | "playing" | "completed"

// Special value for "All Teams" option
const ALL_TEAMS_ID = -1

// Minimum number of members required for a team to be selectable
const MIN_TEAM_MEMBERS = 5

export function MemoryGame() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [cards, setCards] = useState<CardType[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState<number>(0)
  const [moves, setMoves] = useState<number>(0)
  const [gameState, setGameState] = useState<GameState>("start")
  const [difficulty, setDifficulty] = useState<"easy" | "medium">("easy")
  const [showMemberInfo, setShowMemberInfo] = useState<number | null>(null)
  const [showConfetti, setShowConfetti] = useState<boolean>(false)
  const [playerName, setPlayerName] = useState<string>("")
  const [teams, setTeams] = useState<Team[]>([])
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedTeamName, setSelectedTeamName] = useState<string>("")
  const [memberTeamNames, setMemberTeamNames] = useState<Record<number, string[]>>({})

  // Get sound context
  const { playSound, isMuted, toggleMute } = useSound()

  // Load teams and initial team members
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Load all available teams
        const availableTeams = await loadAllTeams()

        // Sort teams alphabetically by name
        const sortedTeams = [...availableTeams].sort((a, b) => a.name.localeCompare(b.name))

        setTeams(sortedTeams)

        // Load members from all teams
        const allMembers = await loadAllTeamMembers()
        setTeamMembers(allMembers)

        // Create a mapping of member IDs to their team names
        const teamNamesMap: Record<number, string[]> = {}

        // Create a map of team IDs to team names for quick lookup
        const teamIdToName = new Map(availableTeams.map((team) => [team.id, team.name]))

        // For each member, map their team IDs to team names
        allMembers.forEach((member) => {
          teamNamesMap[member.id] = member.teamIds.map((teamId) => teamIdToName.get(teamId) || `Team ${teamId}`)
        })

        setMemberTeamNames(teamNamesMap)

        // Count members per team and filter out teams with fewer than MIN_TEAM_MEMBERS
        const teamMemberCounts = new Map<number, number>()

        // Count members for each team
        allMembers.forEach((member) => {
          member.teamIds.forEach((teamId) => {
            teamMemberCounts.set(teamId, (teamMemberCounts.get(teamId) || 0) + 1)
          })
        })

        // Filter teams with at least MIN_TEAM_MEMBERS members
        const teamsWithEnoughMembers = sortedTeams.filter(
          (team) => (teamMemberCounts.get(team.id) || 0) >= MIN_TEAM_MEMBERS,
        )

        // Add "All Teams" option at the top if there are enough members overall
        const teamsWithAll =
          allMembers.length >= MIN_TEAM_MEMBERS
            ? [{ id: ALL_TEAMS_ID, name: "Alle Teams" }, ...teamsWithEnoughMembers]
            : teamsWithEnoughMembers

        setFilteredTeams(teamsWithAll)

        // Set "All Teams" as the default selection if available
        if (teamsWithAll.length > 0) {
          const defaultTeam = teamsWithAll[0]
          setSelectedTeamId(defaultTeam.id)
          setSelectedTeamName(defaultTeam.name)
        }
      } catch (error) {
        console.error("Error loading initial data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Load team members when selected team changes
  useEffect(() => {
    const loadMembers = async () => {
      if (selectedTeamId === null) return

      setLoading(true)
      try {
        let members: TeamMember[] = []

        if (selectedTeamId === ALL_TEAMS_ID) {
          // Load members from all teams
          members = await loadAllTeamMembers()
          setSelectedTeamName("Alle Teams")
        } else {
          // Load members from the selected team
          members = await loadTeamData(selectedTeamId)

          // Update the selected team name
          const team = await getTeamById(selectedTeamId)
          if (team) {
            setSelectedTeamName(team.name)
          }
        }

        if (members.length === 0) {
          console.warn(`No team members found for team ID ${selectedTeamId}`)
        }

        setTeamMembers(members)

        // Update the member team names mapping
        if (selectedTeamId === ALL_TEAMS_ID) {
          // Create a mapping of member IDs to their team names
          const teamNamesMap: Record<number, string[]> = {}

          // Create a map of team IDs to team names for quick lookup
          const teamIdToName = new Map(
            teams.filter((team) => team.id !== ALL_TEAMS_ID).map((team) => [team.id, team.name]),
          )

          // For each member, map their team IDs to team names
          members.forEach((member) => {
            teamNamesMap[member.id] = member.teamIds.map((teamId) => teamIdToName.get(teamId) || `Team ${teamId}`)
          })

          setMemberTeamNames(teamNamesMap)
        }
      } catch (error) {
        console.error(`Error loading members for team ID ${selectedTeamId}:`, error)
        setTeamMembers([])
      } finally {
        setLoading(false)
      }
    }

    if (selectedTeamId !== null) {
      loadMembers()
    }
  }, [selectedTeamId, teams])

  // Get filtered team members based on selected team
  const getFilteredTeamMembers = () => {
    return teamMembers
  }

  // Get number of pairs based on difficulty and available team members
  const getPairsCount = () => {
    const filteredMembers = getFilteredTeamMembers()
    const maxPairs = filteredMembers.length

    // Return 5 pairs for easy mode, 10 pairs for medium mode
    return Math.min(difficulty === "easy" ? 5 : 10, maxPairs)
  }

  // Initialize game
  const initializeGame = () => {
    if (!playerName.trim()) {
      alert("Bitte gib deinen Namen ein, um zu spielen!")
      return
    }

    if (selectedTeamId === null) {
      alert("Bitte wähle ein Team aus!")
      return
    }

    const filteredMembers = getFilteredTeamMembers()
    const pairsCount = getPairsCount()

    // Check if we have enough team members for the selected difficulty
    if (filteredMembers.length < pairsCount) {
      alert(
        `Nicht genügend Teammitglieder für die ausgewählte Schwierigkeit. Maximal ${filteredMembers.length} Paare verfügbar.`,
      )
      return
    }

    // Shuffle the members array to get random members each time
    const shuffledMembers = [...filteredMembers].sort(() => Math.random() - 0.5)
    const selectedMembers = shuffledMembers.slice(0, pairsCount)

    // Create pairs of cards based on difficulty
    let initialCards: CardType[] = []

    // Both easy and medium modes: Both cards show the full info (image and name)
    selectedMembers.forEach((member) => {
      initialCards.push(
        { id: member.id * 2 - 1, memberId: member.id, isFlipped: false, isMatched: false, cardType: "full" },
        { id: member.id * 2, memberId: member.id, isFlipped: false, isMatched: false, cardType: "full" },
      )
    })

    // Shuffle cards
    initialCards = shuffleCards(initialCards)

    setCards(initialCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setGameState("playing")
    setShowMemberInfo(null)
    setShowConfetti(false)
  }

  // Shuffle cards using Fisher-Yates algorithm
  const shuffleCards = (cardsArray: CardType[]) => {
    const shuffled = [...cardsArray]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Handle card click
  const handleCardClick = (id: number) => {
    // Ignore if already flipped or matched, or if two cards are already flipped
    if (
      cards.find((card) => card.id === id)?.isFlipped ||
      cards.find((card) => card.id === id)?.isMatched ||
      flippedCards.length >= 2
    ) {
      return
    }

    // Flip the card
    const newCards = cards.map((card) => (card.id === id ? { ...card, isFlipped: true } : card))
    setCards(newCards)

    // Add to flipped cards
    const newFlippedCards = [...flippedCards, id]
    setFlippedCards(newFlippedCards)

    // If two cards are flipped, check for match
    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)

      const firstCard = cards.find((card) => card.id === newFlippedCards[0])
      const secondCard = cards.find((card) => card.id === newFlippedCards[1])

      if (firstCard?.memberId === secondCard?.memberId) {
        // Match found
        setTimeout(() => {
          // Play match sound
          playSound("match")

          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === newFlippedCards[0] || card.id === newFlippedCards[1]
                ? { ...card, isMatched: true, isFlipped: false }
                : card,
            ),
          )
          setFlippedCards([])
          setMatchedPairs((prev) => prev + 1)
          setShowMemberInfo(firstCard?.memberId || null)
        }, 500)
      } else {
        // No match
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === newFlippedCards[0] || card.id === newFlippedCards[1] ? { ...card, isFlipped: false } : card,
            ),
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  // Check for game completion and save score automatically
  useEffect(() => {
    const pairsCount = getPairsCount()
    if (matchedPairs === pairsCount && gameState === "playing" && pairsCount > 0) {
      setGameState("completed")
      setShowMemberInfo(null)

      // Play game complete sound
      playSound("gameComplete")

      // Show confetti
      setShowConfetti(true)

      // Hide confetti after 5 seconds
      setTimeout(() => {
        setShowConfetti(false)
      }, 7000)

      // Automatically save score to Supabase
      if (selectedTeamId !== null) {
        saveScore({
          player_name: playerName,
          team_id: selectedTeamId, // Now using numeric team_id
          difficulty: difficulty,
          moves: moves,
        }).catch((error) => {
          console.error("Error saving score:", error)
        })
      }
    }
  }, [matchedPairs, gameState, playerName, selectedTeamId, difficulty, moves, playSound])

  // Calculate grid columns based on card count
  const getGridColumns = () => {
    const cardCount = cards.length

    if (cardCount <= 10) return "grid-cols-2 sm:grid-cols-5 gap-3 md:gap-4"
    if (cardCount <= 16) return "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4"
    return "grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4"
  }

  // Get team member by ID
  const getTeamMember = (id: number) => {
    return teamMembers.find((member) => member.id === id)
  }

  // Get team names for a member
  const getMemberTeamNames = (memberId: number): string => {
    const teamNames = memberTeamNames[memberId] || []

    if (teamNames.length === 0) {
      return "Kein Team"
    } else if (teamNames.length === 1) {
      return teamNames[0]
    } else {
      // Format multiple team names
      return teamNames.join(", ")
    }
  }

  // Update difficulty options based on available team members
  const getDifficultyOptions = () => {
    const filteredMembers = getFilteredTeamMembers()
    const maxPairs = filteredMembers.length

    return (
      <div className="w-full max-w-xs mx-auto">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-slate-800 mb-2">Schwierigkeitsgrad:</legend>
          <div className="flex flex-col gap-2">
            <label
              className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                difficulty === "easy"
                  ? "bg-primary/20 border border-primary/30"
                  : "bg-white/40 border border-white/40 hover:bg-white/50"
              } ${maxPairs < 5 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-center">
                <input
                  type="radio"
                  value="easy"
                  name="difficulty"
                  checked={difficulty === "easy"}
                  onChange={() => setDifficulty("easy")}
                  disabled={maxPairs < 5}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    difficulty === "easy" ? "border-primary" : "border-slate-400"
                  }`}
                >
                  {difficulty === "easy" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
              <div className="text-sm font-fluffy">Leicht (5 Paare)</div>
            </label>

            <label
              className={`flex items-center space-x-3 p-2 rounded-md transition-colors ${
                difficulty === "medium"
                  ? "bg-primary/20 border border-primary/30"
                  : "bg-white/40 border border-white/40 hover:bg-white/50"
              } ${maxPairs < 10 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <div className="flex items-center justify-center">
                <input
                  type="radio"
                  value="medium"
                  name="difficulty"
                  checked={difficulty === "medium"}
                  onChange={() => setDifficulty("medium")}
                  disabled={maxPairs < 10}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    difficulty === "medium" ? "border-primary" : "border-slate-400"
                  }`}
                >
                  {difficulty === "medium" && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
              <div className="text-sm font-fluffy">Schwer (10 Paare)</div>
            </label>
          </div>
        </fieldset>
      </div>
    )
  }

  // Check if the name field is empty
  const isNameEmpty = !playerName.trim()

  // Render card content based on card type and state
  const renderCardContent = (card: CardType) => {
    const member = getTeamMember(card.memberId)

    if (!member) return null

    if (card.isFlipped) {
      // Flipped card content based on card type
      if (card.cardType === "full") {
        // Full card with image and name (for both difficulty levels)
        return (
          <div className="absolute inset-0 rotate-y-180 backface-hidden flex flex-col rounded-md border border-black overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-white"></div>
            <div className="relative flex-1 overflow-hidden">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                  className="scale-100"
                />
              </div>
            </div>
            <div className="relative z-10 bg-white p-1 border-t border-gray-200">
              <h3 className="font-bold text-center text-xs truncate fluffy-subtitle">{member.name.split(" ")[0]}</h3>
            </div>
          </div>
        )
      } else if (card.cardType === "name") {
        // Name-only card (Medium mode) - Now showing only the name, not the role
        return (
          <div className="absolute inset-0 rotate-y-180 backface-hidden flex items-center justify-center rounded-md border border-black overflow-hidden shadow-md bg-white">
            <div className="p-4 text-center">
              <h3 className="font-bold text-lg">{member.name}</h3>
            </div>
          </div>
        )
      } else {
        // Image-only card (Medium mode)
        return (
          <div className="absolute inset-0 rotate-y-180 backface-hidden flex flex-col rounded-md border border-black overflow-hidden shadow-md">
            <div className="absolute inset-0 bg-white"></div>
            <div className="relative flex-1 overflow-hidden">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                  className="scale-100"
                />
              </div>
            </div>
          </div>
        )
      }
    } else {
      // Back of card (same for all types)
      return (
        <div className="absolute inset-0 backface-hidden flex items-center justify-center rounded-md border border-black overflow-hidden shadow-md bg-white">
          <div className="absolute inset-0 flex items-center justify-center p-2 z-10">
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative w-[80%] h-[40%]">
                <Image
                  src="/images/hrm-logo.png"
                  alt="HRM Systems Logo"
                  fill
                  className="object-contain drop-shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  // Show loading state if data is still loading
  if (loading && gameState === "start") {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-800">Lade Teammitglieder...</p>
        </div>
      </div>
    )
  }

  // Show message if no teams have enough members
  if (filteredTeams.length === 0 && !loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 p-6 max-w-md">
          <h2 className="text-xl fluffy-title text-slate-800 mb-4">Keine Teams verfügbar</h2>
          <p className="text-slate-800 mb-4">
            Es gibt derzeit keine Teams mit mindestens {MIN_TEAM_MEMBERS} Mitgliedern, die für das Spiel benötigt
            werden.
          </p>
          <p className="text-slate-800">
            Bitte füge mehr Teammitglieder hinzu oder reduziere die Mindestanzahl an Teammitgliedern.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showConfetti && <Confetti />}

      {gameState === "start" ? (
        <div className="flex flex-col items-center space-y-4 p-4 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg border border-white/30">
          <div className="flex items-center justify-center">
            <h2 className="text-xl fluffy-title text-slate-800">Lerne unser Team kennen - Memory-Spiel</h2>
          </div>
          <p className="text-slate-800 text-center text-sm font-medium fluffy-subtitle">
            Lerne das Team spielerisch kennen – finde die passenden Fotos und entdecke, wer wer ist!
          </p>

          <div className="w-full max-w-xs">
            <label className="block text-sm font-medium text-slate-800 mb-1">Dein Name:</label>
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Gib deinen Namen ein"
              className="bg-white/50 border-white/40"
              required
            />
          </div>

          <div className="w-full max-w-xs">
            <label className="block text-sm font-medium text-slate-800 mb-1">Team auswählen:</label>
            <Select
              value={selectedTeamId?.toString()}
              onValueChange={(value) => setSelectedTeamId(Number.parseInt(value))}
            >
              <SelectTrigger className="w-full bg-white/50 border-white/40">
                <SelectValue placeholder="Team auswählen" />
              </SelectTrigger>
              <SelectContent>
                {filteredTeams.map((team) => (
                  <SelectItem key={team.id} value={team.id.toString()}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-600 mt-1">
              Nur Teams mit mindestens {MIN_TEAM_MEMBERS} Mitgliedern werden angezeigt.
            </p>
          </div>

          {getDifficultyOptions()}

          <div className="flex gap-2 items-center">
            <Button onClick={initializeGame} size="sm" className="mt-2 font-fluffy" disabled={isNameEmpty}>
              Spiel starten
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="mt-2 bg-white/50 border-white/40"
              onClick={toggleMute}
              title={isMuted ? "Ton einschalten" : "Ton ausschalten"}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-between items-center gap-2 p-2 bg-white/20 backdrop-blur-sm rounded-xl shadow-sm border border-white/30">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs py-1 bg-white/50 text-slate-800 border-white/40 font-medium"
              >
                <Trophy className="w-3 h-3" />
                {moves} Züge
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs py-1 bg-white/50 text-slate-800 border-white/40 font-medium"
              >
                Paare: {matchedPairs}/{getPairsCount()}
              </Badge>
              <Badge
                variant="outline"
                className="flex items-center gap-1 text-xs py-1 bg-white/50 text-slate-800 border-white/40 font-medium"
              >
                <Users className="w-3 h-3" />
                {selectedTeamName}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGameState("start")}
                className="flex items-center gap-1 bg-white/50 text-slate-800 border-white/40 hover:bg-white/60 text-xs py-1 h-7 font-medium font-fluffy"
              >
                Zurück
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={initializeGame}
                className="flex items-center gap-1 bg-white/50 text-slate-800 border-white/40 hover:bg-white/60 text-xs py-1 h-7 font-medium font-fluffy"
              >
                <RefreshCw className="w-3 h-3" />
                Neustart
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleMute}
                className="flex items-center justify-center bg-white/50 text-slate-800 border-white/40 hover:bg-white/60 h-7 w-7"
                title={isMuted ? "Ton einschalten" : "Ton ausschalten"}
              >
                {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {gameState === "completed" && (
            <div className="p-4 bg-white rounded-xl shadow-md mb-2">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 animate-bounce-slow">
                    <Image
                      src="/images/fluffy_unicorn_final.png"
                      alt="Fluffy Unicorn"
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                  <h2 className="text-xl font-bold fluffy-title text-primary">Glückwunsch!</h2>
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 animate-bounce-slow">
                    <Image
                      src="/images/fluffy_unicorn_final.png"
                      alt="Fluffy Unicorn"
                      fill
                      className="object-contain drop-shadow-md"
                    />
                  </div>
                </div>
                <p className="text-gray-700 mb-3">
                  Du hast alle {getPairsCount()} Paare mit {moves} Zügen gefunden!
                </p>
                <div className="flex justify-center">
                  <Button onClick={initializeGame} className="font-fluffy">
                    Nochmal spielen
                  </Button>
                </div>
              </div>

              {/* Embed the leaderboard directly */}
              {selectedTeamId && <Leaderboard teamId={selectedTeamId} difficulty={difficulty} teams={teams} />}
            </div>
          )}

          {showMemberInfo && (
            <div className="p-5 bg-white rounded-xl shadow-md mb-3 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-primary">
                <Image
                  src={getTeamMember(showMemberInfo)?.image || ""}
                  alt={getTeamMember(showMemberInfo)?.name || ""}
                  fill
                  style={{ objectFit: "cover", objectPosition: "center 30%" }}
                />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="font-bold text-lg fluffy-subtitle">{getTeamMember(showMemberInfo)?.name}</h3>
                <p className="text-gray-600 text-base">{getTeamMember(showMemberInfo)?.title}</p>
                <p className="text-gray-500 text-sm mt-1">Team: {getMemberTeamNames(showMemberInfo)}</p>
              </div>
            </div>
          )}

          <div className={`grid ${getGridColumns()} gap-3 md:gap-4 max-w-5xl mx-auto`}>
            {cards.map((card) => (
              <div
                key={card.id}
                className="perspective-1000 w-full min-w-[120px] sm:min-w-[140px] md:min-w-[160px]"
                onClick={() => handleCardClick(card.id)}
              >
                <div
                  className={`
                    cursor-pointer w-full aspect-[3/4] flex items-center justify-center
                    transition-transform duration-500 transform-style-3d
                    ${card.isFlipped ? "rotate-y-180" : ""}
                    ${card.isMatched ? "opacity-0 pointer-events-none" : ""}
                  `}
                >
                  {renderCardContent(card)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

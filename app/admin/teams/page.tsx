"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"
import { Trash2, Plus, Save, Loader2 } from "lucide-react"
import Link from "next/link"

interface Team {
  id: number
  name: string
}

export default function TeamsAdminPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newTeam, setNewTeam] = useState<Partial<Team>>({
    id: undefined,
    name: "",
  })

  // Fetch teams
  useEffect(() => {
    async function fetchTeams() {
      setLoading(true)
      try {
        if (!supabase) {
          console.error("Supabase client not initialized")
          setLoading(false)
          return
        }

        const { data, error } = await supabase.from("teams").select("*").order("name")

        if (error) {
          throw error
        }

        setTeams(data || [])
      } catch (error) {
        console.error("Error fetching teams:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeams()
  }, [])

  // Add new team
  const handleAddTeam = async () => {
    if (!newTeam.id || !newTeam.name) {
      alert("Please fill in all required fields")
      return
    }

    // Check if ID already exists
    if (teams.some((team) => team.id === newTeam.id)) {
      alert("A team with this ID already exists. Please use a different ID.")
      return
    }

    setSaving(true)
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { data, error } = await supabase.from("teams").insert([newTeam]).select()

      if (error) {
        throw error
      }

      setTeams([...teams, data[0]])
      setNewTeam({
        id: undefined,
        name: "",
      })
    } catch (error) {
      console.error("Error adding team:", error)
      alert("Failed to add team")
    } finally {
      setSaving(false)
    }
  }

  // Delete team
  const handleDeleteTeam = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team? This will NOT remove team members.")) {
      return
    }

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { error } = await supabase.from("teams").delete().eq("id", id)

      if (error) {
        throw error
      }

      setTeams(teams.filter((team) => team.id !== id))
    } catch (error) {
      console.error("Error deleting team:", error)
      alert("Failed to delete team")
    }
  }

  // Update team field
  const handleUpdateTeam = (id: number, field: keyof Team, value: any) => {
    setTeams(teams.map((team) => (team.id === id ? { ...team, [field]: value } : team)))
  }

  // Save team changes
  const handleSaveTeam = async (team: Team) => {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { error } = await supabase
        .from("teams")
        .update({
          name: team.name,
        })
        .eq("id", team.id)

      if (error) {
        throw error
      }

      alert("Team updated successfully")
    } catch (error) {
      console.error("Error updating team:", error)
      alert("Failed to update team")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Teams Admin</h1>
        <Link href="/admin">
          <Button variant="outline">Back to Team Members</Button>
        </Link>
      </div>

      {/* Add new team form */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Team ID*</label>
            <Input
              type="number"
              value={newTeam.id || ""}
              onChange={(e) => setNewTeam({ ...newTeam, id: Number.parseInt(e.target.value) || undefined })}
              placeholder="1"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Enter a unique numeric ID for the team</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Team Name*</label>
            <Input
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
              placeholder="Development Team"
            />
          </div>
        </div>
        <Button onClick={handleAddTeam} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Team
        </Button>
      </div>

      {/* Teams list */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-4 border-b">Teams ({teams.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Team Name</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teams.map((team) => (
                <tr key={team.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{team.id}</td>
                  <td className="px-4 py-2">
                    <Input
                      value={team.name}
                      onChange={(e) => handleUpdateTeam(team.id, "name", e.target.value)}
                      className="border-gray-200"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveTeam(team)}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTeam(team.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

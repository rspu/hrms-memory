"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { Trash2, Plus, Save, Loader2 } from "lucide-react"
import Image from "next/image"

interface TeamMember {
  id: string
  full_name: string
  profile_image: string
  job_title: string
  team_ids: number[]
}

interface Team {
  id: number
  name: string
  slug: string
}

export default function AdminPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newMember, setNewMember] = useState<Partial<TeamMember>>({
    full_name: "",
    profile_image: "",
    job_title: "",
    team_ids: [],
  })

  // Fetch teams and team members
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        if (!supabase) {
          console.error("Supabase client not initialized")
          setLoading(false)
          return
        }

        // Fetch teams
        const { data: teamsData, error: teamsError } = await supabase.from("teams").select("*").order("name")

        if (teamsError) {
          throw teamsError
        }

        setTeams(teamsData || [])

        // Fetch team members
        const { data: membersData, error: membersError } = await supabase
          .from("team_members")
          .select("*")
          .order("full_name")

        if (membersError) {
          throw membersError
        }

        setTeamMembers(membersData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Add new team member
  const handleAddMember = async () => {
    if (!newMember.full_name || !newMember.profile_image || !newMember.team_ids?.length) {
      alert("Please fill in all required fields and select at least one team")
      return
    }

    setSaving(true)
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { data, error } = await supabase.from("team_members").insert([newMember]).select()

      if (error) {
        throw error
      }

      setTeamMembers([...teamMembers, data[0]])
      setNewMember({
        full_name: "",
        profile_image: "",
        job_title: "",
        team_ids: [],
      })
    } catch (error) {
      console.error("Error adding team member:", error)
      alert("Failed to add team member")
    } finally {
      setSaving(false)
    }
  }

  // Delete team member
  const handleDeleteMember = async (id: string) => {
    if (!confirm("Are you sure you want to delete this team member?")) {
      return
    }

    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { error } = await supabase.from("team_members").delete().eq("id", id)

      if (error) {
        throw error
      }

      setTeamMembers(teamMembers.filter((member) => member.id !== id))
    } catch (error) {
      console.error("Error deleting team member:", error)
      alert("Failed to delete team member")
    }
  }

  // Update team member field
  const handleUpdateMember = (id: string, field: keyof TeamMember, value: any) => {
    setTeamMembers(teamMembers.map((member) => (member.id === id ? { ...member, [field]: value } : member)))
  }

  // Toggle team membership
  const toggleTeamMembership = (memberId: string, teamId: number) => {
    setTeamMembers(
      teamMembers.map((member) => {
        if (member.id === memberId) {
          const teamIds = [...(member.team_ids || [])]
          if (teamIds.includes(teamId)) {
            return { ...member, team_ids: teamIds.filter((id) => id !== teamId) }
          } else {
            return { ...member, team_ids: [...teamIds, teamId] }
          }
        }
        return member
      }),
    )
  }

  // Toggle team for new member
  const toggleTeamForNewMember = (teamId: number) => {
    const teamIds = [...(newMember.team_ids || [])]
    if (teamIds.includes(teamId)) {
      setNewMember({ ...newMember, team_ids: teamIds.filter((id) => id !== teamId) })
    } else {
      setNewMember({ ...newMember, team_ids: [...teamIds, teamId] })
    }
  }

  // Save team member changes
  const handleSaveMember = async (member: TeamMember) => {
    try {
      if (!supabase) {
        throw new Error("Supabase client not initialized")
      }

      const { error } = await supabase
        .from("team_members")
        .update({
          full_name: member.full_name,
          profile_image: member.profile_image,
          job_title: member.job_title,
          team_ids: member.team_ids,
        })
        .eq("id", member.id)

      if (error) {
        throw error
      }

      alert("Team member updated successfully")
    } catch (error) {
      console.error("Error updating team member:", error)
      alert("Failed to update team member")
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
      <h1 className="text-2xl font-bold mb-6">Team Members Admin</h1>

      {/* Add new team member form */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-lg font-semibold mb-4">Add New Team Member</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name*</label>
            <Input
              value={newMember.full_name}
              onChange={(e) => setNewMember({ ...newMember, full_name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profile Image URL*</label>
            <Input
              value={newMember.profile_image}
              onChange={(e) => setNewMember({ ...newMember, profile_image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Title</label>
            <Input
              value={newMember.job_title}
              onChange={(e) => setNewMember({ ...newMember, job_title: e.target.value })}
              placeholder="Software Engineer"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teams*</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {teams.map((team) => (
                <div key={team.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`new-member-team-${team.id}`}
                    checked={(newMember.team_ids || []).includes(team.id)}
                    onCheckedChange={() => toggleTeamForNewMember(team.id)}
                  />
                  <label
                    htmlFor={`new-member-team-${team.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {team.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={handleAddMember} disabled={saving} className="flex items-center gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Team Member
        </Button>
      </div>

      {/* Team members list */}
      <div className="bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold p-4 border-b">Team Members ({teamMembers.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Image</th>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Job Title</th>
                <th className="px-4 py-2 text-left">Teams</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className="relative h-10 w-10 rounded-full overflow-hidden">
                      <Image
                        src={member.profile_image || "/placeholder.svg"}
                        alt={member.full_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      value={member.full_name}
                      onChange={(e) => handleUpdateMember(member.id, "full_name", e.target.value)}
                      className="border-gray-200"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      value={member.job_title || ""}
                      onChange={(e) => handleUpdateMember(member.id, "job_title", e.target.value)}
                      className="border-gray-200"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="grid grid-cols-2 gap-2">
                      {teams.map((team) => (
                        <div key={team.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${member.id}-team-${team.id}`}
                            checked={(member.team_ids || []).includes(team.id)}
                            onCheckedChange={() => toggleTeamMembership(member.id, team.id)}
                          />
                          <label
                            htmlFor={`member-${member.id}-team-${team.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {team.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveMember(member)}
                        className="flex items-center gap-1"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteMember(member.id)}
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

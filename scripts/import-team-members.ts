import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

// This script helps import team members from JSON files into Supabase
// Usage: ts-node import-team-members.ts

// Replace with your Supabase URL and service role key
const supabaseUrl = process.env.SUPABASE_URL || ""
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Missing Supabase URL or service role key. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function importTeamMembers() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), "public", "teams", "Verwaltungsrat.json")
    const fileContent = fs.readFileSync(filePath, "utf8")
    const members = JSON.parse(fileContent)

    console.log(`Found ${members.length} members to import`)

    // Process each member
    for (const member of members) {
      // Extract the image URL from the stringified JSON array
      let imageUrl = ""
      try {
        const imageUrls = JSON.parse(member["Profile Image"])
        imageUrl = imageUrls[0] || ""
      } catch (error) {
        console.error("Error parsing image URL:", error)
      }

      // Prepare the data for insertion
      const teamMember = {
        full_name: member["Full Name"],
        profile_image: imageUrl,
        job_title: member["Job Title"] || "",
        team_id: "verwaltungsrat", // Convert to lowercase and use as ID
        team_name: "Verwaltungsrat",
      }

      // Insert into Supabase
      const { error } = await supabase.from("team_members").insert(teamMember)

      if (error) {
        console.error(`Error inserting ${teamMember.full_name}:`, error)
      } else {
        console.log(`Imported: ${teamMember.full_name}`)
      }
    }

    console.log("Import completed")
  } catch (error) {
    console.error("Import failed:", error)
  }
}

importTeamMembers()

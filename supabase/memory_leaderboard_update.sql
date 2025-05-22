-- Create a temporary column to store the numeric team_id
ALTER TABLE memory_leaderboard ADD COLUMN temp_team_id INTEGER;

-- Update the temporary column with the numeric value of the text team_id
UPDATE memory_leaderboard SET temp_team_id = CAST(team_id AS INTEGER);

-- Drop the old team_id column
ALTER TABLE memory_leaderboard DROP COLUMN team_id;

-- Rename the temporary column to team_id
ALTER TABLE memory_leaderboard RENAME COLUMN temp_team_id TO team_id;

-- Create an index for faster queries on team_id
CREATE INDEX IF NOT EXISTS idx_memory_leaderboard_team_id ON memory_leaderboard (team_id);

-- Create the memory_leaderboard table
CREATE TABLE IF NOT EXISTS memory_leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_name TEXT NOT NULL,
  team_id TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  moves INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create an index for faster queries on team_id and difficulty
CREATE INDEX IF NOT EXISTS idx_memory_leaderboard_team_difficulty ON memory_leaderboard (team_id, difficulty);

-- Create an index for player_name to help with filtering
CREATE INDEX IF NOT EXISTS idx_memory_leaderboard_player_name ON memory_leaderboard (player_name);

-- Create a policy to allow anyone to read the leaderboard
CREATE POLICY "Allow anyone to read leaderboard" 
  ON memory_leaderboard 
  FOR SELECT 
  USING (true);

-- Create a policy to allow anyone to insert into the leaderboard
CREATE POLICY "Allow anyone to insert into leaderboard" 
  ON memory_leaderboard 
  FOR INSERT 
  WITH CHECK (true);

-- Enable RLS on the table
ALTER TABLE memory_leaderboard ENABLE ROW LEVEL SECURITY;

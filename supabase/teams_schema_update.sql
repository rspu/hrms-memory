-- Create the teams table with numeric primary key (not auto-generated)
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a policy to allow anyone to read teams
CREATE POLICY "Allow anyone to read teams" 
  ON teams 
  FOR SELECT 
  USING (true);

-- Enable RLS on the teams table
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Insert sample teams with manually assigned IDs
INSERT INTO teams (id, name)
VALUES 
  (1, 'Verwaltungsrat'),
  (2, 'Geschäftsleitung'),
  (3, 'Entwicklung'),
  (4, 'Produktmanagement'),
  (5, 'Marketing')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Alter the team_members table to use an array of team IDs
-- First, create a temporary column to store the current team_ids
ALTER TABLE team_members ADD COLUMN temp_team_ids INTEGER[] DEFAULT '{}';

-- Update the temporary column with the team IDs based on the current team_ids (text array)
-- This requires a function to convert text team_ids to numeric IDs
CREATE OR REPLACE FUNCTION convert_team_ids() RETURNS VOID AS $$
DECLARE
  member_record RECORD;
  team_id INTEGER;
  text_team_id TEXT;
  numeric_team_ids INTEGER[];
BEGIN
  FOR member_record IN SELECT id, team_ids FROM team_members LOOP
    numeric_team_ids := '{}';
    
    IF member_record.team_ids IS NOT NULL THEN
      FOREACH text_team_id IN ARRAY member_record.team_ids
      LOOP
        -- Map old text IDs to new numeric IDs
        IF text_team_id = 'verwaltungsrat' THEN
          team_id := 1;
        ELSIF text_team_id = 'geschaeftsleitung' THEN
          team_id := 2;
        ELSIF text_team_id = 'entwicklung' THEN
          team_id := 3;
        ELSIF text_team_id = 'produktmanagement' THEN
          team_id := 4;
        ELSIF text_team_id = 'marketing' THEN
          team_id := 5;
        ELSIF text_team_id = 'dienstleistungen-ktg' THEN
          team_id := 6;
        ELSIF text_team_id = 'produktentwicklung-carema' THEN
          team_id := 7;
        ELSIF text_team_id = 'produktentwicklung-uso' THEN
          team_id := 8;
        ELSE
          team_id := NULL;
        END IF;
        
        IF team_id IS NOT NULL THEN
          numeric_team_ids := array_append(numeric_team_ids, team_id);
        END IF;
      END LOOP;
    END IF;
    
    UPDATE team_members SET temp_team_ids = numeric_team_ids WHERE id = member_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to convert team_ids
SELECT convert_team_ids();

-- Drop the function as it's no longer needed
DROP FUNCTION convert_team_ids();

-- Drop the old team_ids column
ALTER TABLE team_members DROP COLUMN team_ids;

-- Rename the temporary column to team_ids
ALTER TABLE team_members RENAME COLUMN temp_team_ids TO team_ids;

-- Create an index for faster queries on team_ids
CREATE INDEX IF NOT EXISTS idx_team_members_team_ids ON team_members USING GIN (team_ids);

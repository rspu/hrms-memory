-- Create the team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  profile_image TEXT NOT NULL,
  job_title TEXT,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members (team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_name ON team_members (team_name);

-- Create a policy to allow anyone to read team members
CREATE POLICY "Allow anyone to read team members" 
  ON team_members 
  FOR SELECT 
  USING (true);

-- Enable RLS on the table
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Insert sample data for Verwaltungsrat team
INSERT INTO team_members (full_name, profile_image, job_title, team_id, team_name)
VALUES 
  ('Georg Hartmann', 'https://www.hrm-systems.ch/content/uploads/2020/10/Georg-Hartmann_crop-e1602310944567-944x944.jpg', 'Chair of the Administrative board', 'verwaltungsrat', 'Verwaltungsrat'),
  ('Annamaria Hartmann-Floridia', 'https://www.hrm-systems.ch/content/uploads/2021/05/Annamaria-Hartmann_quadrat-944x944.jpg', '', 'verwaltungsrat', 'Verwaltungsrat'),
  ('Stephan Heuberger', 'https://www.hrm-systems.ch/content/uploads/2020/10/Stephan-Heuberger_2-scaled-e1602316675849-944x944.jpg', '', 'verwaltungsrat', 'Verwaltungsrat'),
  ('Olivier Steiger', 'https://www.hrm-systems.ch/content/uploads/2024/07/Oliver-Steiger.jpg', '', 'verwaltungsrat', 'Verwaltungsrat'),
  ('Benedikt Unold', 'https://www.hrm-systems.ch/content/uploads/2024/07/Benedikt-Unold_800_Px.jpg', '', 'verwaltungsrat', 'Verwaltungsrat'),
  ('Cornelia Flury', 'https://www.hrm-systems.ch/content/uploads/2022/05/800pxOriginal-JPG-Cornelia-Flury_HRM_Systems23968.jpg', 'Assistant to the Administrative board', 'verwaltungsrat', 'Verwaltungsrat');

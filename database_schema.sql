-- Enable Row Level Security
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create custom users table
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT CHECK (role IN ('coach', 'athlete', 'admin')) DEFAULT 'athlete',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teams table
CREATE TABLE public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    description TEXT,
    coach_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'basic', 'premium', 'enterprise')) DEFAULT 'free',
    max_athletes INTEGER DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_members table (junction table)
CREATE TABLE public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT CHECK (role IN ('coach', 'athlete')) DEFAULT 'athlete',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    points INTEGER NOT NULL DEFAULT 0,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    due_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create achievements table
CREATE TABLE public.achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified BOOLEAN DEFAULT FALSE,
    proof_url TEXT,
    proof_text TEXT,
    verified_by UUID REFERENCES public.users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    points_earned INTEGER NOT NULL DEFAULT 0,
    UNIQUE(user_id, task_id)
);

-- Create badges table
CREATE TABLE public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    points_required INTEGER,
    is_active BOOLEAN DEFAULT TRUE
);

-- Create user_badges table (junction table)
CREATE TABLE public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    UNIQUE(user_id, badge_id, team_id)
);

-- Create activity_feed table
CREATE TABLE public.activity_feed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
    activity_type TEXT CHECK (activity_type IN ('achievement_completed', 'badge_earned', 'task_assigned', 'team_joined')),
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX idx_tasks_team_id ON public.tasks(team_id);
CREATE INDEX idx_achievements_user_id ON public.achievements(user_id);
CREATE INDEX idx_achievements_task_id ON public.achievements(task_id);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_activity_feed_team_id ON public.activity_feed(team_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default badges
INSERT INTO public.badges (name, icon, description, requirements, points_required, is_active) VALUES
('First Achievement', '🥇', 'Complete your first task', 'Complete 1 task', 0, TRUE),
('Speed Demon', '⚡', 'Complete 5K run under 25 minutes', 'Complete 5K under 25min', 100, TRUE),
('Strength Master', '💪', 'Complete 100 push-ups', 'Complete 100 push-ups', 50, TRUE),
('Team Player', '🤝', 'Complete 5 team tasks', 'Complete 5 tasks', 250, TRUE),
('Consistent Performer', '🎯', 'Complete tasks for 7 consecutive days', 'Daily completion streak', 350, TRUE),
('Point Collector', '💎', 'Earn 500 total points', 'Accumulate 500 points', 500, TRUE),
('Overachiever', '🌟', 'Complete 10 tasks in one week', 'Weekly completion rate', 500, TRUE),
('Marathon Runner', '🏃', 'Complete a marathon distance', 'Run 26.2 miles', 200, TRUE);

-- Row Level Security Policies

-- Users can read their own data and team members can see each other
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Teams: Members can view their teams, coaches can manage
CREATE POLICY "Team members can view their teams" ON public.teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can manage their teams" ON public.teams
    FOR ALL USING (coach_id = auth.uid());

-- Team members: Can view team members, coaches can manage
CREATE POLICY "View team members" ON public.team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can manage team members" ON public.team_members
    FOR ALL USING (
        team_id IN (
            SELECT id FROM public.teams 
            WHERE coach_id = auth.uid()
        )
    );

-- Tasks: Team members can view, coaches can manage
CREATE POLICY "Team members can view tasks" ON public.tasks
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Coaches can manage tasks" ON public.tasks
    FOR ALL USING (
        team_id IN (
            SELECT id FROM public.teams 
            WHERE coach_id = auth.uid()
        )
    );

-- Achievements: Users can manage their own, coaches can verify team achievements
CREATE POLICY "Users can manage own achievements" ON public.achievements
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Coaches can verify team achievements" ON public.achievements
    FOR UPDATE USING (
        task_id IN (
            SELECT id FROM public.tasks 
            WHERE team_id IN (
                SELECT id FROM public.teams 
                WHERE coach_id = auth.uid()
            )
        )
    );

-- Badges: Everyone can read
CREATE POLICY "Everyone can view badges" ON public.badges
    FOR SELECT USING (TRUE);

-- User badges: Users can view their own and team members
CREATE POLICY "View user badges" ON public.user_badges
    FOR SELECT USING (
        user_id = auth.uid() OR 
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Activity feed: Team members can view team activity
CREATE POLICY "Team members can view activity feed" ON public.activity_feed
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id = auth.uid()
        )
    );

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
import { supabase } from '@/lib/supabase';
import { Achievement, User, Team, Task, TeamMember, LeaderboardEntry } from '@/types';

export interface CreateAchievementData {
  user_id: string;
  task_id: string;
  proof_text?: string;
  points_earned: number;
  verified: boolean;
}

export interface CreateTeamData {
  name: string;
  sport: string;
  description?: string;
  coach_id: string;
}

// Team code generation
export function generateTeamCode(teamName: string, teamId: string): string {
  const namePrefix = teamName.substring(0, 3).toUpperCase();
  const idSuffix = teamId.substring(0, 4).toUpperCase();
  return `${namePrefix}${idSuffix}`;
}

export async function createAchievement(data: CreateAchievementData): Promise<Achievement | null> {
  try {
    const { data: achievement, error } = await supabase
      .from('achievements')
      .insert([{
        user_id: data.user_id,
        task_id: data.task_id,
        proof_text: data.proof_text,
        points_earned: data.points_earned,
        verified: data.verified,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating achievement:', error);
      return null;
    }

    return achievement;
  } catch (error) {
    console.error('Error creating achievement:', error);
    return null;
  }
}

export async function getUser(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function getUserTeams(userId: string): Promise<Team[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        teams (
          id,
          name,
          sport,
          description,
          coach_id,
          subscription_tier,
          max_athletes,
          logo_url,
          created_at,
          updated_at
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user teams:', error);
      return [];
    }

    return data?.map(item => item.teams).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching user teams:', error);
    return [];
  }
}

export async function getTeamMembers(teamId: string): Promise<User[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        users (
          id,
          name,
          email,
          role,
          avatar_url,
          created_at,
          updated_at
        )
      `)
      .eq('team_id', teamId);

    if (error) {
      console.error('Error fetching team members:', error);
      return [];
    }

  return data?.map(item => item.users).filter(Boolean) || [];
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}

export async function getTeamTasks(teamId: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team tasks:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching team tasks:', error);
    return [];
  }
}

export async function getAllTeams(): Promise<Team[]> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching all teams:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching all teams:', error);
    return [];
  }
}

export async function createTeam(teamData: CreateTeamData): Promise<Team | null> {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert([{
        name: teamData.name,
        sport: teamData.sport,
        description: teamData.description || null,
        coach_id: teamData.coach_id,
        subscription_tier: 'free',
        max_athletes: 50
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error creating team:', error);
    return null;
  }
}

export async function addTeamMember(teamId: string, userId: string, role: 'coach' | 'athlete'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userId,
        role: role
      }]);

    if (error) {
      console.error('Error adding team member:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error adding team member:', error);
    return false;
  }
}

export async function joinTeamById(teamId: string, userId: string): Promise<boolean> {
  try {
    // Check if already a member
    const { data: existing } = await supabase
      .from('team_members')
      .select('id')
      .eq('team_id', teamId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      throw new Error('You are already a member of this team');
    }

    // Add as team member
    const { error } = await supabase
      .from('team_members')
      .insert([{
        team_id: teamId,
        user_id: userId,
        role: 'athlete'
      }]);

    if (error) {
      console.error('Error joining team:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error joining team:', error);
    return false;
  }
}

export async function joinTeamByCode(teamCode: string, userId: string): Promise<boolean> {
  try {
    // Find team by code
    const allTeams = await getAllTeams();
    const team = allTeams.find(t => generateTeamCode(t.name, t.id) === teamCode.toUpperCase());

    if (!team) {
      throw new Error('Invalid team code');
    }

    return await joinTeamById(team.id, userId);
  } catch (error) {
    console.error('Error joining team by code:', error);
    return false;
  }
}

export async function getUserAchievements(userId: string, teamId?: string): Promise<Achievement[]> {
  try {
    let query = supabase
      .from('achievements')
      .select('*')
      .order('completed_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (teamId) {
      query = query.select(`
        *,
        tasks!inner (team_id)
      `).eq('tasks.team_id', teamId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }
}

export async function getTeamAchievements(teamId: string): Promise<Achievement[]> {
  try {
    const { data, error } = await supabase
      .from('achievements')
      .select(`
        *,
        tasks!inner (team_id)
      `)
      .eq('tasks.team_id', teamId)
      .order('completed_at', { ascending: false });

    if (error) {
      console.error('Error fetching team achievements:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching team achievements:', error);
    return [];
  }
}
export async function getTeamLeaderboard(teamId: string): Promise<LeaderboardEntry[]> {
  try {
    // Get all team members
    const teamMembers = await getTeamMembers(teamId);
    
    // Get all team achievements
    const teamAchievements = await getTeamAchievements(teamId);
    
    // Calculate points and stats for each user
    const userStats = teamMembers.map(user => {
      const userAchievements = teamAchievements.filter(a => a.user_id === user.id && a.verified);
      const totalPoints = userAchievements.reduce((sum, a) => sum + a.points_earned, 0);
      
      return {
        user,
        points: totalPoints,
        achievements_count: userAchievements.length,
        badges_count: 0, // You can implement badge counting later
        rank: 0 // Will be set after sorting
      };
    });
    
    // Sort by points and assign ranks
    const sortedStats = userStats
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
    
    return sortedStats;
  } catch (error) {
    console.error('Error getting team leaderboard:', error);
    return [];
  }
}
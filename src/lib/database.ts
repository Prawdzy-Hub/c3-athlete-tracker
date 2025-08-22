import { supabase } from './supabase'
import type { User, Team, Task, Achievement, Badge, LeaderboardEntry } from '@/types'

// User operations
export const getUser = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  return data
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
  return data
}

export const createUser = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert([userData])
    .select('*')
    .single()
  
  if (error) {
    console.error('Error creating user:', error)
    return null
  }
  return data
}

// Team operations
export const getUserTeams = async (userId: string): Promise<Team[]> => {
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
        created_at,
        updated_at
      )
    `)
    .eq('user_id', userId)
  
  if (error) {
    console.error('Error fetching user teams:', error)
    return []
  }
  return data?.map(item => item.teams).filter(Boolean) as Team[]
}

export const getTeamMembers = async (teamId: string): Promise<User[]> => {
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
    .eq('team_id', teamId)
  
  if (error) {
    console.error('Error fetching team members:', error)
    return []
  }
  return data?.map(item => item.users).filter(Boolean) as User[]
}

export const createTeam = async (teamData: Omit<Team, 'id' | 'created_at' | 'updated_at'>): Promise<Team | null> => {
  const { data, error } = await supabase
    .from('teams')
    .insert([teamData])
    .select('*')
    .single()
  
  if (error) {
    console.error('Error creating team:', error)
    return null
  }
  return data
}

// Task operations
export const getTeamTasks = async (teamId: string): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('team_id', teamId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching team tasks:', error)
    return []
  }
  return data || []
}

export const createTask = async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task | null> => {
  const { data, error } = await supabase
    .from('tasks')
    .insert([taskData])
    .select('*')
    .single()
  
  if (error) {
    console.error('Error creating task:', error)
    return null
  }
  return data
}

// Achievement operations
export const getUserAchievements = async (userId: string, teamId?: string): Promise<Achievement[]> => {
  let query = supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
  
  if (teamId) {
    // Join with tasks to filter by team
    query = supabase
      .from('achievements')
      .select(`
        *,
        tasks!inner (team_id)
      `)
      .eq('user_id', userId)
      .eq('tasks.team_id', teamId)
  }
  
  const { data, error } = await query.order('completed_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching achievements:', error)
    return []
  }
  return data || []
}

export const createAchievement = async (achievementData: Omit<Achievement, 'id'>): Promise<Achievement | null> => {
  const { data, error } = await supabase
    .from('achievements')
    .insert([achievementData])
    .select('*')
    .single()
  
  if (error) {
    console.error('Error creating achievement:', error)
    return null
  }
  return data
}

export const verifyAchievement = async (achievementId: string, verifiedBy: string): Promise<boolean> => {
  const { error } = await supabase
    .from('achievements')
    .update({
      verified: true,
      verified_by: verifiedBy,
      verified_at: new Date().toISOString()
    })
    .eq('id', achievementId)
  
  if (error) {
    console.error('Error verifying achievement:', error)
    return false
  }
  return true
}

// Leaderboard operations
export const getTeamLeaderboard = async (teamId: string): Promise<LeaderboardEntry[]> => {
  // This is a complex query that requires joins and aggregations
  // For now, we'll implement a simplified version
  const { data: achievements, error } = await supabase
    .from('achievements')
    .select(`
      user_id,
      points_earned,
      users (
        id,
        name,
        email,
        role,
        avatar_url,
        created_at,
        updated_at
      ),
      tasks!inner (team_id)
    `)
    .eq('verified', true)
    .eq('tasks.team_id', teamId)
  
  if (error) {
    console.error('Error fetching leaderboard:', error)
    return []
  }
  
  // Aggregate points by user
  const userPoints: Record<string, { user: User; points: number; achievements_count: number }> = {}
  
  achievements?.forEach(achievement => {
    const userId = achievement.user_id
    if (!userPoints[userId]) {
      userPoints[userId] = {
        user: achievement.users as User,
        points: 0,
        achievements_count: 0
      }
    }
    userPoints[userId].points += achievement.points_earned
    userPoints[userId].achievements_count += 1
  })
  
  // Convert to array and sort
  const leaderboard = Object.values(userPoints)
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      badges_count: 0, // TODO: Implement badge counting
      rank: index + 1
    }))
  
  return leaderboard
}

// Badge operations
export const getActiveBadges = async (): Promise<Badge[]> => {
  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching badges:', error)
    return []
  }
  return data || []
}

export const getUserBadges = async (userId: string, teamId?: string): Promise<Badge[]> => {
  let query = supabase
    .from('user_badges')
    .select(`
      badges (
        id,
        name,
        icon,
        description,
        requirements,
        points_required,
        is_active
      )
    `)
    .eq('user_id', userId)
  
  if (teamId) {
    query = query.eq('team_id', teamId)
  }
  
  const { data, error } = await query.order('earned_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user badges:', error)
    return []
  }
  return data?.map(item => item.badges).filter(Boolean) as Badge[]
}
export type Role = "coach" | "athlete" | "admin";

export type SubscriptionTier = "free" | "basic" | "premium" | "enterprise";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  name: string;
  sport: string;
  description?: string;
  coach_id: string;
  subscription_tier: SubscriptionTier;
  max_athletes: number;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: Role;
  joined_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  points: number;
  team_id: string;
  assigned_by: string;
  due_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
  verified: boolean;
  proof_url?: string;
  proof_text?: string;
  verified_by?: string;
  verified_at?: string;
  points_earned: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  requirements: string;
  points_required?: number;
  is_active: boolean;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  team_id: string;
}

export interface LeaderboardEntry {
  user: User;
  points: number;
  achievements_count: number;
  badges_count: number;
  rank: number;
}

export interface ActivityFeed {
  id: string;
  user_id: string;
  team_id: string;
  activity_type: 'achievement_completed' | 'badge_earned' | 'task_assigned' | 'team_joined';
  description: string;
  metadata?: Record<string, any>;
  created_at: string;
}
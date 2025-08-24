'use client'
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Trophy, 
  Medal, 
  Target, 
  Calendar,
  TrendingUp,
  Award,
  Star,
  Clock,
  CheckCircle,
  User,
  Mail,
  Crown,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';
import { User as UserType, Achievement, Task, Badge, Team } from '@/types';
import { getUserAchievements, getUser } from '@/lib/database';

interface ProfileStats {
  totalPoints: number;
  totalAchievements: number;
  completedTasks: number;
  badges: Badge[];
  rank: number;
  recentActivity: Achievement[];
  taskProgress: { [taskId: string]: number };
}

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const { currentTeam, tasks, achievements, users, generateTeamCode } = useTeam();
  
  const [profileUser, setProfileUser] = useState<UserType | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats>({
    totalPoints: 0,
    totalAchievements: 0,
    completedTasks: 0,
    badges: [],
    rank: 0,
    recentActivity: [],
    taskProgress: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'progress'>('overview');

  const userId = searchParams.get('userId') || currentUser?.id;

  useEffect(() => {
    if (userId) {
      loadProfileData(userId);
    }
  }, [userId, currentTeam]);

  const loadProfileData = async (targetUserId: string) => {
    setLoading(true);
    try {
// Load user data
let user = users.find(u => u.id === targetUserId);
if (!user && targetUserId === currentUser?.id) {
  user = currentUser;
}
// if (!user) {
//   const userData = await getUser(targetUserId);
//   user = userData;
// }

if (!user) {
  router.push('/dashboard');
  return;
}
      
      setProfileUser(user);

      // Load user achievements
      const userAchievements = currentTeam 
        ? await getUserAchievements(targetUserId, currentTeam.id)
        : achievements.filter(a => a.user_id === targetUserId);

      // Calculate stats
      const verifiedAchievements = userAchievements.filter(a => a.verified);
      const totalPoints = verifiedAchievements.reduce((sum, a) => sum + a.points_earned, 0);
      const completedTasks = [...new Set(verifiedAchievements.map(a => a.task_id))].length;
      
      // Get user badges (mock for now)
      const userBadges = getUserBadges(targetUserId);
      
      // Calculate rank
      const allUsers = users.filter(u => u.role === 'athlete');
      const userPointsMap = allUsers.map(u => ({
        userId: u.id,
        points: achievements
          .filter(a => a.user_id === u.id && a.verified)
          .reduce((sum, a) => sum + a.points_earned, 0)
      })).sort((a, b) => b.points - a.points);
      
      const rank = userPointsMap.findIndex(u => u.userId === targetUserId) + 1;
      
      // Recent activity (last 30 days)
      const recentActivity = verifiedAchievements
        .filter(a => new Date(a.completed_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
        .slice(0, 10);

      setProfileStats({
        totalPoints,
        totalAchievements: verifiedAchievements.length,
        completedTasks,
        badges: userBadges,
        rank,
        recentActivity,
        taskProgress: {}
      });

    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserBadges = (targetUserId: string): Badge[] => {
    const userAchievements = achievements.filter(a => a.user_id === targetUserId && a.verified);
    const earned: Badge[] = [];
    
    // Mock badge system - replace with actual badge logic
    if (userAchievements.length >= 1) {
  earned.push({ 
    id: '1', 
    name: 'First Achievement', 
    icon: '🏅', 
    description: 'Earned your first achievement', 
    requirements: 'Complete your first task',
    is_active: true 
  });
}
if (userAchievements.length >= 5) {
  earned.push({ 
    id: '2', 
    name: 'Achiever', 
    icon: '🌟', 
    description: 'Earned 5 achievements', 
    requirements: 'Complete 5 tasks',
    is_active: true 
  });
}
if (userAchievements.length >= 10) {
  earned.push({ 
    id: '3', 
    name: 'Champion', 
    icon: '👑', 
    description: 'Earned 10 achievements', 
    requirements: 'Complete 10 tasks',
    is_active: true 
  });
}
if (userAchievements.length >= 20) {
  earned.push({ 
    id: '4', 
    name: 'Legend', 
    icon: '🔥', 
    description: 'Earned 20 achievements', 
    requirements: 'Complete 20 tasks',
    is_active: true 
  });
}
if (profileStats.totalPoints >= 500) {
  earned.push({ 
    id: '5', 
    name: 'Point Master', 
    icon: '💎', 
    description: 'Earned 500+ points', 
    requirements: 'Earn 500+ points',
    is_active: true 
  });
}
    
    return earned;
  };

  const isOwnProfile = currentUser?.id === profileUser?.id;
  const isCoach = currentUser?.role === 'coach' || currentUser?.id === currentTeam?.coach_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser || !currentTeam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Profile not found</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isOwnProfile ? 'Your Profile' : `${profileUser.name}'s Profile`}
              </h1>
              <p className="text-gray-600">{currentTeam.name} • {currentTeam.sport}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Profile Info */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                {profileUser.avatar_url ? (
                  <img 
                    src={profileUser.avatar_url} 
                    alt={profileUser.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-blue-600">
                    {profileUser.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {profileUser.name}
              </h2>
              
              <div className="flex items-center justify-center space-x-2 mb-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  profileUser.role === 'coach' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {profileUser.role.charAt(0).toUpperCase() + profileUser.role.slice(1)}
                </span>
                {profileStats.rank <= 3 && profileStats.rank > 0 && (
                  <Crown className={`w-4 h-4 ${
                    profileStats.rank === 1 ? 'text-yellow-500' : 
                    profileStats.rank === 2 ? 'text-gray-400' : 
                    'text-orange-400'
                  }`} />
                )}
              </div>

              <div className="flex items-center justify-center text-gray-600 text-sm mb-4">
                <Mail className="w-4 h-4 mr-2" />
                {isOwnProfile || isCoach ? profileUser.email : 'Email hidden'}
              </div>

              {profileStats.rank > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 mb-4">
                  <div className="text-2xl font-bold text-blue-600">#{profileStats.rank}</div>
                  <div className="text-sm text-blue-700">Team Ranking</div>
                </div>
              )}

              <div className="text-center text-sm text-gray-500">
                Member since {new Date(profileUser.created_at).toLocaleDateString()}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-gray-700">Total Points</span>
                  </div>
                  <span className="font-bold text-yellow-600">{profileStats.totalPoints}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-blue-500" />
                    <span className="text-gray-700">Achievements</span>
                  </div>
                  <span className="font-bold text-blue-600">{profileStats.totalAchievements}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-gray-700">Tasks Completed</span>
                  </div>
                  <span className="font-bold text-green-600">{profileStats.completedTasks}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Medal className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-700">Badges</span>
                  </div>
                  <span className="font-bold text-purple-600">{profileStats.badges.length}</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Medal className="w-5 h-5 mr-2 text-purple-600" />
                Badges Earned
              </h3>
              {profileStats.badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {profileStats.badges.map((badge) => (
                    <div key={badge.id} className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">{badge.icon}</div>
                      <div className="text-xs font-medium text-purple-800">{badge.name}</div>
                      <div className="text-xs text-purple-600 mt-1">{badge.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Medal className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No badges earned yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  {[
                    { id: 'overview', label: 'Overview', icon: BarChart3 },
                    { id: 'achievements', label: 'Achievements', icon: Trophy },
                    { id: 'progress', label: 'Progress', icon: TrendingUp }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Performance Chart Placeholder */}
                    <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
                      <div className="text-center">
                        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Performance Chart</h3>
                        <p className="text-gray-500">Chart showing points earned over time will be displayed here</p>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-green-600" />
                        Recent Activity
                      </h3>
                      {profileStats.recentActivity.length > 0 ? (
                        <div className="space-y-3">
                          {profileStats.recentActivity.slice(0, 5).map((achievement) => {
                            const task = tasks.find(t => t.id === achievement.task_id);
                            return (
                              <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900">
                                    Completed: {task?.title || 'Unknown Task'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Earned {achievement.points_earned} points
                                  </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {new Date(achievement.completed_at).toLocaleDateString()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No recent activity</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'achievements' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                      All Achievements ({profileStats.totalAchievements})
                    </h3>
                    {achievements
                      .filter(a => a.user_id === profileUser.id && a.verified)
                      .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime())
                      .map((achievement) => {
                        const task = tasks.find(t => t.id === achievement.task_id);
                        return (
                          <div key={achievement.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {task?.title || 'Unknown Task'}
                              </h4>
                              <div className="flex items-center space-x-2">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                  {achievement.points_earned} pts
                                </span>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              </div>
                            </div>
                            {achievement.proof_text && (
                              <p className="text-gray-600 text-sm mb-2">{achievement.proof_text}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(achievement.completed_at).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(achievement.completed_at).toLocaleTimeString()}</span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}

                {activeTab === 'progress' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                      Task Progress
                    </h3>
                    
                    {/* Active Tasks */}
                    <div className="space-y-4">
                      {tasks
                        .filter(t => t.is_active)
                        .map((task) => {
                          const userAchievement = achievements.find(
                            a => a.task_id === task.id && a.user_id === profileUser.id && a.verified
                          );
                          const isCompleted = !!userAchievement;
                          
                          return (
                            <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                                    {task.points} pts
                                  </span>
                                  {isCompleted && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                </div>
                              </div>
                              
                              {task.description && (
                                <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                              )}
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">
                                  {isCompleted ? 'Completed' : 'In Progress'}
                                </span>
                                {task.due_date && (
                                  <span className="text-gray-500 flex items-center space-x-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
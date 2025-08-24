'use client'
import React from 'react';
import { 
  Users, 
  Trophy, 
  Target, 
  Medal, 
  Calendar, 
  TrendingUp, 
  Award,
  Star,
  Clock
} from 'lucide-react';
import { Team, User, Task, Achievement, Badge } from '@/types';

interface TeamOverviewProps {
  team: Team;
  teamMembers: User[];
  tasks: Task[];
  achievements: Achievement[];
  getUserBadges?: (userId: string) => Badge[];
  currentUser?: User;
}

export default function TeamOverview({ 
  team, 
  teamMembers, 
  tasks, 
  achievements,
  getUserBadges,
  currentUser
}: TeamOverviewProps) {
  // Calculate stats
  const completedAchievements = achievements.filter((a) => a.verified).length;
  const totalBadges = getUserBadges 
    ? teamMembers.reduce((total, user) => total + getUserBadges(user.id).length, 0)
    : 0;
  
  const totalPoints = achievements
    .filter(a => a.verified)
    .reduce((sum, a) => sum + a.points_earned, 0);

  const activeTasks = tasks.filter(t => t.is_active).length;
  const upcomingDeadlines = tasks.filter(t => 
    t.due_date && new Date(t.due_date) > new Date() && 
    new Date(t.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
  ).length;

  // Recent activity (last 7 days)
  const recentAchievements = achievements.filter(a => 
    a.verified && 
    new Date(a.completed_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const stats = [
    {
      title: 'Active Athletes',
      value: teamMembers.filter(u => u.role === 'athlete').length,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      textColor: 'text-blue-600',
      subtitle: 'team members'
    },
    {
      title: 'Active Tasks',
      value: activeTasks,
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      textColor: 'text-green-600',
      subtitle: 'challenges available'
    },
    {
      title: 'Completed',
      value: completedAchievements,
      icon: Trophy,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      textColor: 'text-yellow-600',
      subtitle: 'achievements earned'
    },
    {
      title: 'Total Points',
      value: totalPoints,
      icon: Star,
      color: 'purple',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600',
      subtitle: 'points earned'
    },
  ];

  const additionalStats = [
    {
      title: 'Badges Earned',
      value: totalBadges,
      icon: Medal,
      color: 'text-orange-600'
    },
    {
      title: 'Recent Activity',
      value: recentAchievements,
      icon: TrendingUp,
      color: 'text-green-600',
      subtitle: 'this week'
    },
    {
      title: 'Upcoming Deadlines',
      value: upcomingDeadlines,
      icon: Clock,
      color: 'text-red-600',
      subtitle: 'next 7 days'
    },
  ];

  // Team performance calculation
  const avgPointsPerAthlete = teamMembers.length > 0 
    ? Math.round(totalPoints / teamMembers.filter(u => u.role === 'athlete').length) || 0
    : 0;

  const completionRate = tasks.length > 0 
    ? Math.round((completedAchievements / (tasks.length * teamMembers.filter(u => u.role === 'athlete').length)) * 100) || 0
    : 0;

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {team.logo_url ? (
              <img 
                src={team.logo_url} 
                alt={`${team.name} logo`}
                className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-100 flex items-center justify-center border-2 border-gray-200">
                <span className="text-2xl font-bold text-blue-600">
                  {team.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{team.name}</h1>
              <p className="text-gray-600">{team.sport}</p>
              {team.description && (
                <p className="text-gray-500 text-sm mt-1 max-w-md">{team.description}</p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-500">Team created</p>
            <p className="text-gray-700 font-medium">
              {new Date(team.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Team Overview</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`${stat.bgColor} rounded-lg p-6 text-center relative overflow-hidden`}>
                <div className="relative z-10">
                  <Icon className={`w-8 h-8 ${stat.iconColor} mx-auto mb-3`} />
                  <div className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm font-medium text-gray-700 mb-1">{stat.title}</div>
                  <div className="text-xs text-gray-500">{stat.subtitle}</div>
                </div>
                {/* Background decoration */}
                <div className={`absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10`}>
                  <Icon className="w-20 h-20" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Team Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <Award className="w-5 h-5 mr-2 text-blue-600" />
            Team Performance
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="font-medium text-gray-700">Avg Points per Athlete</span>
              <span className="text-xl font-bold text-blue-600">{avgPointsPerAthlete}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="font-medium text-gray-700">Task Completion Rate</span>
              <span className="text-xl font-bold text-green-600">{completionRate}%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="font-medium text-gray-700">Total Team Points</span>
              <span className="text-xl font-bold text-purple-600">{totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
            Activity Summary
          </h3>
          
          <div className="space-y-4">
            {additionalStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <div>
                      <span className="font-medium text-gray-700">{stat.title}</span>
                      {stat.subtitle && (
                        <p className="text-xs text-gray-500">{stat.subtitle}</p>
                      )}
                    </div>
                  </div>
                  <span className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Health Indicator */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Team Health</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className={`text-2xl font-bold mb-2 ${
              completionRate >= 75 ? 'text-green-600' : 
              completionRate >= 50 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {completionRate >= 75 ? '🟢' : completionRate >= 50 ? '🟡' : '🔴'}
            </div>
            <p className="text-sm font-medium text-gray-700">Task Completion</p>
            <p className="text-xs text-gray-500">{completionRate}% complete</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className={`text-2xl font-bold mb-2 ${
              recentAchievements >= 5 ? 'text-green-600' : 
              recentAchievements >= 2 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {recentAchievements >= 5 ? '🟢' : recentAchievements >= 2 ? '🟡' : '🔴'}
            </div>
            <p className="text-sm font-medium text-gray-700">Activity Level</p>
            <p className="text-xs text-gray-500">{recentAchievements} this week</p>
          </div>
          
          <div className="text-center p-4 border border-gray-200 rounded-lg">
            <div className={`text-2xl font-bold mb-2 ${
              teamMembers.length >= 10 ? 'text-green-600' : 
              teamMembers.length >= 5 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {teamMembers.length >= 10 ? '🟢' : teamMembers.length >= 5 ? '🟡' : '🔴'}
            </div>
            <p className="text-sm font-medium text-gray-700">Team Size</p>
            <p className="text-xs text-gray-500">{teamMembers.length} members</p>
          </div>
        </div>
      </div>
    </div>
  );
}
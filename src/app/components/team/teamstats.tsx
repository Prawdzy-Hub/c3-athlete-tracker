'use client'
import React from 'react';
import { Users, Target, Trophy, Medal } from 'lucide-react';
import { User, Task, Achievement, Badge } from '@/types';

interface TeamStatsProps {
  teamMembers: User[];
  tasks: Task[];
  achievements: Achievement[];
  badges?: Badge[];
  getUserBadges?: (userId: string) => Badge[];
}

export default function TeamStats({ 
  teamMembers, 
  tasks, 
  achievements, 
  badges = [],
  getUserBadges 
}: TeamStatsProps) {
  const completedAchievements = achievements.filter((a) => a.verified).length;
  
  // Calculate total badges earned by all users
  const totalBadges = getUserBadges 
    ? teamMembers.reduce((total, user) => total + getUserBadges(user.id).length, 0)
    : badges.length;

  const stats = [
    {
      title: 'Active Athletes',
      value: teamMembers.length,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Tasks',
      value: tasks.length,
      icon: Target,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Completed',
      value: completedAchievements,
      icon: Trophy,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Total Badges',
      value: totalBadges,
      icon: Medal,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Team Overview</h2>
      <div className="grid md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`${stat.bgColor} rounded-lg p-4 text-center`}>
              <Icon className={`w-8 h-8 ${stat.textColor} mx-auto mb-2`} />
              <div className={`text-2xl font-bold ${stat.textColor}`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
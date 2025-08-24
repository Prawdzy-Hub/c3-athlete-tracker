'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { Users, Crown, Award, Medal } from 'lucide-react';
import { User, Achievement, Badge, LeaderboardEntry } from '@/app/types';

interface MemberListProps {
  teamMembers: User[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  getUserBadges: (userId: string) => Badge[];
  currentUserRole?: string;
  teamCoachId?: string;
}

export default function MemberList({ 
  teamMembers, 
  achievements, 
  leaderboard,
  getUserBadges,
  currentUserRole,
  teamCoachId
}: MemberListProps) {
  const router = useRouter();

  if (teamMembers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Team Members</h2>
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {currentUserRole === 'coach' || currentUserRole === teamCoachId
              ? 'No team members yet. Share your team code to invite athletes!' 
              : 'No other team members yet.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Team Members</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {teamMembers.map((member) => {
          const entry = leaderboard.find((l) => l.user?.id === member.id);
          const pts = entry?.points || 0;
          const memberBadges = getUserBadges(member.id);
          const memberAchievements = achievements.filter(a => a.user_id === member.id && a.verified).length;
          
          return (
            <div
              key={member.id}
              className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => router.push(`/profile?userId=${member.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="font-medium text-blue-600">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                </div>
                <div className="flex items-center space-x-2">
                  {entry?.rank && entry.rank <= 3 && (
                    <Crown className={`w-4 h-4 ${
                      entry.rank === 1 ? 'text-yellow-500' : 
                      entry.rank === 2 ? 'text-gray-400' : 
                      'text-orange-400'
                    }`} />
                  )}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    {pts} pts
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                <div className="flex items-center space-x-1">
                  <Award className="w-4 h-4" />
                  <span>{memberAchievements} achievements</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Medal className="w-4 h-4" />
                  <span>{memberBadges.length} badges</span>
                </div>
              </div>
              
              {/* Badge Display */}
              <div className="flex space-x-1">
                {memberBadges.slice(0, 4).map((badge) => (
                  <span key={badge.id} className="text-lg" title={badge.name}>
                    {badge.icon}
                  </span>
                ))}
                {memberBadges.length > 4 && (
                  <span className="text-sm text-gray-500">+{memberBadges.length - 4}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
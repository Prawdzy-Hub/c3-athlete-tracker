'use client'
import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';
import { LeaderboardEntry } from '@/types';

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  maxEntries?: number;
  showFullStats?: boolean;
}

export default function Leaderboard({ 
  leaderboard, 
  maxEntries = 5,
  showFullStats = false 
}: LeaderboardProps) {
  const displayedEntries = leaderboard.slice(0, maxEntries);

  if (leaderboard.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
          Leaderboard
        </h2>
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No achievements yet</p>
          <p className="text-gray-400 text-sm">Complete tasks to start earning points!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
        Leaderboard
        {leaderboard.length > maxEntries && (
          <span className="text-sm text-gray-500 ml-2">
            (Top {maxEntries})
          </span>
        )}
      </h2>
      
      <div className="space-y-3">
        {displayedEntries.map((entry, index) => (
          <div key={entry.user?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center space-x-3">
              {/* Rank Badge */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold relative ${
                  index === 0
                    ? "bg-yellow-400 text-yellow-900"
                    : index === 1
                    ? "bg-gray-300 text-gray-700"
                    : index === 2
                    ? "bg-orange-300 text-orange-900"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {index < 3 && (
                  <Crown className={`w-3 h-3 absolute -top-1 -right-1 ${
                    index === 0 ? 'text-yellow-600' :
                    index === 1 ? 'text-gray-500' :
                    'text-orange-600'
                  }`} />
                )}
                {index + 1}
              </div>
              
              {/* User Info */}
              <div>
                <span className="font-medium text-gray-900">{entry.user?.name}</span>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-3 h-3" />
                    <span>{entry.achievements_count} achievements</span>
                  </div>
                  {showFullStats && (
                    <div className="flex items-center space-x-1">
                      <Medal className="w-3 h-3" />
                      <span>{entry.badges_count} badges</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Points */}
            <div className="text-right">
              <span className="font-bold text-blue-600 text-lg">{entry.points}</span>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </div>
        ))}
      </div>
      
      {leaderboard.length > maxEntries && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            And {leaderboard.length - maxEntries} more athletes
          </p>
        </div>
      )}
    </div>
  );
}
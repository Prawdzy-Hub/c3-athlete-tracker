'use client'
import React from 'react';
import { Trophy, Users, Target } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            C³ <span className="text-yellow-400">Athlete Tracker</span>
          </h1>
          <p className="text-2xl text-yellow-400 mb-2 font-semibold">Counter Culture Collective</p>
          <p className="text-lg text-gray-300">Track. Achieve. Excel.</p>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Achievement Tracking</h3>
            <p className="text-gray-300">Track progress and earn badges for completing challenges and reaching milestones</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all">
            <Users className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Team Management</h3>
            <p className="text-gray-300">Coaches manage teams, assign tasks, and track athlete performance in real-time</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20 hover:bg-white/15 transition-all">
            <Target className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Goal Setting</h3>
            <p className="text-gray-300">Set measurable goals with competitive leaderboards and performance analytics</p>
          </div>
        </div>

        {/* Simple Auth Placeholder */}
        <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Getting Started</h2>
          <div className="text-center">
            <p className="text-gray-300 mb-4">Organized structure migration in progress...</p>
            <button className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-colors">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
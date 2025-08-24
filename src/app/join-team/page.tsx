'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Code, Search, Trophy, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';

export default function JoinTeamPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { 
    availableTeams, 
    loading, 
    generateTeamCode, 
    loadAvailableTeams, 
    joinTeamByCode, 
    joinTeam 
  } = useTeam();

  const [joinTeamCode, setJoinTeamCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'code' | 'browse'>('code');

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  // Load available teams when component mounts or when browse tab is selected
  useEffect(() => {
    if (activeTab === 'browse') {
      loadAvailableTeams();
    }
  }, [activeTab, loadAvailableTeams]);

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError('');
    setSuccess('');

    if (!joinTeamCode.trim()) {
      setError('Please enter a team code');
      return;
    }

    try {
      await joinTeamByCode(joinTeamCode.trim(), currentUser.id);
      setSuccess('Successfully joined the team! Redirecting to dashboard...');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError((err as Error).message);
      console.error('Join team by code error:', err);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!currentUser) return;

    setError('');
    setSuccess('');

    try {
      await joinTeam(teamId, currentUser.id);
      setSuccess('Successfully joined the team! Redirecting to dashboard...');
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (err) {
      setError((err as Error).message);
      console.error('Join team error:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Join a Team</h1>
              <p className="text-gray-600">Connect with your coach and teammates</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900">Welcome, {currentUser.name}!</h2>
              <p className="text-blue-700">Choose how you'd like to join a team</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <Trophy className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Success!</p>
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('code')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === 'code'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>Join by Team Code</span>
              </button>
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === 'browse'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>Browse Teams</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'code' ? (
              <div className="max-w-md mx-auto">
                <div className="text-center mb-6">
                  <Code className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Enter Team Code</h3>
                  <p className="text-gray-600">
                    Your coach should have provided you with a team code like "SAI1A2B"
                  </p>
                </div>

                <form onSubmit={handleJoinByCode} className="space-y-4">
                  <div>
                    <label htmlFor="teamCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Team Code
                    </label>
                    <input
                      id="teamCode"
                      type="text"
                      placeholder="e.g., SAI1A2B"
                      value={joinTeamCode}
                      onChange={(e) => setJoinTeamCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg tracking-widest"
                      maxLength={7}
                      style={{ letterSpacing: '0.1em' }}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Code format: 3 letters + 4 characters (e.g., SAI1A2B)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !joinTeamCode.trim()}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Joining Team...</span>
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4" />
                        <span>Join Team</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Don't have a team code?</h4>
                  <p className="text-sm text-gray-600">
                    Ask your coach for the team code, or browse available teams in the other tab.
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="text-center mb-6">
                  <Search className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Browse Available Teams</h3>
                  <p className="text-gray-600">
                    Find and join teams that are open for new members
                  </p>
                </div>

                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading available teams...</p>
                  </div>
                ) : availableTeams.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No teams available to join at the moment.</p>
                  </div>
                ) : (
                  <div className="grid gap-4 max-h-96 overflow-y-auto">
                    {availableTeams.map((team) => (
                      <div
                        key={team.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              {team.logo_url ? (
                                <img 
                                  src={team.logo_url} 
                                  alt={`${team.name} logo`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-bold">
                                    {team.name.charAt(0)}
                                  </span>
                                </div>
                              )}
                              <div>
                                <h4 className="font-semibold text-gray-900">{team.name}</h4>
                                <p className="text-sm text-gray-600">{team.sport}</p>
                              </div>
                            </div>
                            
                            {team.description && (
                              <p className="text-sm text-gray-600 mb-2">{team.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                                Code: {generateTeamCode(team.name, team.id)}
                              </span>
                              {team.max_athletes && (
                                <span>Max: {team.max_athletes} athletes</span>
                              )}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleJoinTeam(team.id)}
                            disabled={loading}
                            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                          >
                            {loading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Users className="w-4 h-4" />
                                <span>Join</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Alternative Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Can't find your team? You might need to create a new one.
          </p>
          <button
            onClick={() => router.push('/create-team')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Create New Team
          </button>
        </div>
      </div>
    </div>
  );
}
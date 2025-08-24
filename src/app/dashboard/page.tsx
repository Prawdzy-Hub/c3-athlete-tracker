'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Trophy, 
  Target, 
  Medal, 
  Plus, 
  Settings, 
  LogOut, 
  Crown, 
  Calendar, 
  Award,
  CheckCircle,
  Upload,
  Eye,
  EyeOff,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { Badge, LeaderboardEntry, Task } from '@/types';
import { getTeamLeaderboard } from '@/lib/database';

// Import all modals
import AddTaskModal from '../components/modals/AddTaskModal';
import UploadProofModal from '../components/modals/UploadProofModal';
import ProgressModal from '../components/modals/ProgressModal';
import TeamSettingsModal from '../components/modals/TeamSettingsModal';

export default function DashboardPage() {
  const router = useRouter();
  const { currentUser, handleLogout } = useAuth();
  const { 
    currentTeam, 
    teams, 
    users, 
    tasks, 
    achievements, 
    loading,
    generateTeamCode, 
    loadUserTeams,
    loadTeamData
  } = useTeam();

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [showTeamCode, setShowTeamCode] = useState(false);

  // Modal states
  const [showAddTask, setShowAddTask] = useState(false);
  const [showUploadProof, setShowUploadProof] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showTeamSettings, setShowTeamSettings] = useState(false);
  
  // Modal data
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  // Load user teams when user is available
  useEffect(() => {
    if (currentUser) {
      loadUserTeams(currentUser.id);
    }
  }, [currentUser, loadUserTeams]);

  // Load leaderboard when team changes
  useEffect(() => {
    if (currentTeam) {
      loadLeaderboard();
    }
  }, [currentTeam, achievements]);

  // Redirect to join team if no teams
  useEffect(() => {
    if (currentUser && teams.length === 0 && !loading) {
      router.push('/join-team');
    }
  }, [currentUser, teams, loading, router]);

  const loadLeaderboard = async () => {
    if (!currentTeam) return;
    
    try {
      const leaderboardData = await getTeamLeaderboard(currentTeam.id);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getUserBadges = (userId: string): Badge[] => {
    // Mock badge system - replace with actual badge logic later
    const userAchievements = achievements.filter((a) => a.user_id === userId && a.verified);
    const earned: Badge[] = [];
    
    if (userAchievements.length >= 1) {
      earned.push({ id: '1', name: 'First Achievement', icon: '🏅', description: 'Earned your first achievement', is_active: true });
    }
    if (userAchievements.length >= 5) {
      earned.push({ id: '2', name: 'Achiever', icon: '🌟', description: 'Earned 5 achievements', is_active: true });
    }
    if (userAchievements.length >= 10) {
      earned.push({ id: '3', name: 'Champion', icon: '👑', description: 'Earned 10 achievements', is_active: true });
    }
    
    return earned;
  };

  // Modal handlers
  const handleTaskCreated = async (newTask: Task) => {
    console.log('New task created:', newTask);
    if (currentTeam) {
      await loadTeamData(currentTeam.id);
    }
  };

  const handleProofSubmitted = async () => {
    console.log('Proof submitted');
    if (currentTeam) {
      await loadTeamData(currentTeam.id);
      await loadLeaderboard();
    }
  };

  const handleProgressAdded = async () => {
    console.log('Progress added');
    if (currentTeam) {
      await loadTeamData(currentTeam.id);
      await loadLeaderboard();
    }
  };

  const handleTeamUpdated = (updatedTeam: any) => {
    console.log('Team updated:', updatedTeam);
    // Force a page refresh to update team data
    if (currentUser) {
      loadUserTeams(currentUser.id);
    }
  };

  const openUploadModal = (task: Task) => {
    setSelectedTask(task);
    setShowUploadProof(true);
  };

  const openProgressModal = (task: Task) => {
    setSelectedTask(task);
    setShowProgress(true);
  };

  const teamMembers = users.filter((u) => u.role === "athlete");
  const teamTasks = tasks.filter((t) => t.team_id === currentTeam?.id);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (loading || !currentTeam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-gray-900 to-black shadow-sm border-b border-gray-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {/* Team Logo */}
              {currentTeam?.logo_url ? (
                <img 
                  src={currentTeam.logo_url} 
                  alt={`${currentTeam.name} logo`}
                  className="w-10 h-10 rounded-full object-cover border-2 border-yellow-400"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                  {currentTeam?.name.charAt(0) || 'T'}
                </div>
              )}
              
              <h1 className="text-xl font-bold text-yellow-400">C³ Athlete Tracker</h1>
              <span className="text-gray-400">|</span>
              <span className="text-white">{currentTeam.name}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300 text-sm">{currentTeam.sport}</span>
              
              {/* Team Code Display for Coaches */}
              {currentUser?.role === "coach" && currentTeam && (
                <div className="bg-yellow-400/20 px-3 py-1 rounded-lg border border-yellow-400/30">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 text-xs font-medium">
                      Team Code: {showTeamCode ? generateTeamCode(currentTeam.name, currentTeam.id) : '•••••••'}
                    </span>
                    <button
                      onClick={() => setShowTeamCode(!showTeamCode)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      {showTeamCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-white">Welcome, {currentUser.name}</span>
              <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold uppercase">
                {currentUser.role}
              </span>
              
              {/* Team Settings for Coaches */}
              {(currentUser?.role === "coach" || currentUser?.id === currentTeam?.coach_id) && (
                <button 
                  onClick={() => setShowTeamSettings(true)}
                  className="text-gray-300 hover:text-white"
                  title="Team Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              
              <button 
                onClick={handleLogout} 
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Team Overview</h2>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{teamMembers.length}</div>
                  <div className="text-sm text-gray-600">Active Athletes</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{teamTasks.length}</div>
                  <div className="text-sm text-gray-600">Active Tasks</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">
                    {achievements.filter((a) => a.verified).length}
                  </div>
                  <div className="text-sm text-gray-600">Completed</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Medal className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">
                    {users.reduce((total, user) => total + getUserBadges(user.id).length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Badges</div>
                </div>
              </div>
            </div>

            {/* Current Tasks */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Current Tasks</h2>
                {(currentUser.role === "coach" || currentUser.id === currentTeam.coach_id) && (
                  <button 
                    onClick={() => setShowAddTask(true)}
                    className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {teamTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No tasks yet. {(currentUser.role === 'coach' || currentUser.id === currentTeam.coach_id) ? 'Create some tasks to get started!' : 'Your coach will add tasks soon!'}
                    </p>
                  </div>
                ) : (
                  teamTasks.map((task) => (
                    <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{task.title}</h3>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            {task.points} pts
                          </span>
                          {task.due_date && (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                          {task.target_value && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs flex items-center">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              {task.target_value} {task.progress_unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-3">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Assigned by {users.find((u) => u.id === task.assigned_by)?.name || 'Coach'}
                        </span>
                        <div className="flex items-center space-x-2">
                          {achievements
                            .filter((a) => a.task_id === task.id && a.verified)
                            .slice(0, 3)
                            .map((a) => (
                              <div 
                                key={a.id} 
                                className="flex items-center text-green-600" 
                                title={`Completed by ${users.find(u => u.id === a.user_id)?.name}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </div>
                            ))}
                          {achievements.filter((a) => a.task_id === task.id && a.verified).length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{achievements.filter((a) => a.task_id === task.id && a.verified).length - 3} more
                            </span>
                          )}
                          {currentUser.role === 'athlete' && (
                            <div className="flex space-x-2">
                              {task.target_value ? (
                                <button 
                                  onClick={() => openProgressModal(task)}
                                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                                >
                                  <TrendingUp className="w-3 h-3" />
                                  <span>Progress</span>
                                </button>
                              ) : (
                                <button 
                                  onClick={() => openUploadModal(task)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                                >
                                  <Upload className="w-3 h-3" />
                                  <span>Upload</span>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Team Members</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {teamMembers.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {(currentUser.role === 'coach' || currentUser.id === currentTeam.coach_id)
                        ? 'No team members yet. Share your team code to invite athletes!' 
                        : 'No other team members yet.'}
                    </p>
                  </div>
                ) : (
                  teamMembers.map((member) => {
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
                          <h3 className="font-semibold text-gray-900">{member.name}</h3>
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
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Award className="w-4 h-4" />
                            <span>{memberAchievements} achievements</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Medal className="w-4 h-4" />
                            <span>{memberBadges.length} badges</span>
                          </div>
                        </div>
                        <div className="flex space-x-1 mt-2">
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
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-600" />
                Leaderboard
              </h2>
              <div className="space-y-3">
                {leaderboard.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No achievements yet</p>
                ) : (
                  leaderboard.slice(0, 5).map((entry, index) => (
                    <div key={entry.user?.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-400 text-yellow-900"
                              : index === 1
                              ? "bg-gray-300 text-gray-700"
                              : index === 2
                              ? "bg-orange-300 text-orange-900"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">{entry.user?.name}</span>
                          <div className="text-xs text-gray-500">{entry.achievements_count} achievements</div>
                        </div>
                      </div>
                      <span className="font-bold text-blue-600">{entry.points}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">Quick Actions</h2>
              <div className="space-y-2">
                {currentUser.role === "athlete" && teamTasks.length > 0 && (
                  <button 
                    onClick={() => {
                      const firstTask = teamTasks[0];
                      if (firstTask) {
                        if (firstTask.target_value) {
                          openProgressModal(firstTask);
                        } else {
                          openUploadModal(firstTask);
                        }
                      }
                    }}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span>Submit Progress</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowTeamSettings(true)}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors"
                >
                  <Settings className="w-5 h-5 text-gray-600" />
                  <span>Team Settings</span>
                </button>
                <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors">
                  <Medal className="w-5 h-5 text-purple-600" />
                  <span>View All Badges</span>
                </button>
                {(currentUser.role === "coach" || currentUser.id === currentTeam.coach_id) && (
                  <button 
                    onClick={() => router.push('/create-team')}
                    className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors"
                  >
                    <Plus className="w-5 h-5 text-green-600" />
                    <span>Create Another Team</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Modals */}
      {currentTeam && currentUser && (
        <>
          <AddTaskModal
            isOpen={showAddTask}
            onClose={() => setShowAddTask(false)}
            onTaskCreated={handleTaskCreated}
            teamId={currentTeam.id}
            currentUserId={currentUser.id}
          />

          {selectedTask && (
            <>
              <UploadProofModal
                isOpen={showUploadProof}
                onClose={() => {
                  setShowUploadProof(false);
                  setSelectedTask(null);
                }}
                onProofSubmitted={handleProofSubmitted}
                task={selectedTask}
                user={currentUser}
              />

              <ProgressModal
                isOpen={showProgress}
                onClose={() => {
                  setShowProgress(false);
                  setSelectedTask(null);
                }}
                onProgressAdded={handleProgressAdded}
                task={selectedTask}
                user={currentUser}
              />
            </>
          )}

          <TeamSettingsModal
            isOpen={showTeamSettings}
            onClose={() => setShowTeamSettings(false)}
            onTeamUpdated={handleTeamUpdated}
            team={currentTeam}
            currentUser={currentUser}
            generateTeamCode={generateTeamCode}
          />
        </>
      )}
    </div>
  );
}
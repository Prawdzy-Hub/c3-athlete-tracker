'use client'

import React, { useEffect, useState } from "react";
import {
  User,
  Trophy,
  Target,
  Upload,
  Medal,
  Users,
  Settings,
  LogOut,
  Home,
  Plus,
  Star,
  CheckCircle,
  X,
  Crown,
  Calendar,
  Award,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from '@/lib/supabase';

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  role: 'athlete' | 'coach';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface Team {
  id: string;
  name: string;
  sport: string;
  description?: string;
  coach_id: string;
  subscription_tier?: string;
  max_athletes?: number;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  points: number;
  team_id: string;
  assigned_by: string;
  due_date?: string;
  target_value?: number;
  progress_unit?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  user_id: string;
  task_id: string;
  proof_text?: string;
  points_earned: number;
  verified: boolean;
  completed_at: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description?: string;
  is_active: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  max_athletes: number;
  features?: string;
  is_active: boolean;
}

interface LeaderboardEntry {
  user?: User;
  points: number;
  achievements_count: number;
  badges_count: number;
  rank: number;
}

interface UploadTarget {
  userId: string;
  taskId: string;
}

interface ProgressTarget {
  userId: string;
  taskId: string;
}

export default function C3AthleteTracker() {
  // State management
  const [users, setUsers] = useState<User[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [currentView, setCurrentView] = useState<string>("home");
  const [selectedAthlete, setSelectedAthlete] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", showPassword: false });
  const [signupForm, setSignupForm] = useState({ 
    name: "", 
    email: "", 
    password: "", 
    role: "athlete" as "athlete" | "coach", 
    showPassword: false 
  });
  const [isSignup, setIsSignup] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<any>(null);

  // UI State
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", points: 50, due_date: "" });
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [uploadTarget, setUploadTarget] = useState<UploadTarget | null>(null);
  const [proofText, setProofText] = useState<string>("");
  const [showCreateTeam, setShowCreateTeam] = useState<boolean>(false);
  const [newTeam, setNewTeam] = useState({ name: "", sport: "", description: "" });

  // Add these new state variables here:
  const [showProgressModal, setShowProgressModal] = useState<boolean>(false);
  const [progressTarget, setProgressTarget] = useState<ProgressTarget | null>(null);
  const [dailyProgress, setDailyProgress] = useState<number>(0);
  const [progressNotes, setProgressNotes] = useState<string>("");

  // Load initial data and check auth state
  useEffect(() => {
    loadInitialData();
    checkAuthState();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load badges
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (badgesData) setBadges(badgesData);

      // Load subscription plans
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');
      
      if (plansData) setSubscriptionPlans(plansData);

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  const checkAuthState = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      setAuthUser(session.user);
      await loadUserData(session.user.id);
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setAuthUser(session.user);
        await loadUserData(session.user.id);
      } else {
        setAuthUser(null);
        setCurrentUser(null);
        setCurrentTeam(null);
        setCurrentView("home");
      }
    });

    return () => subscription.unsubscribe();
  };

  const loadUserData = async (userId: string) => {
    try {
      // Load user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userData) {
        setCurrentUser(userData);
        await loadUserTeams(userId);
        setCurrentView("dashboard");
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserTeams = async (userId: string) => {
    try {
      // Load user's teams
      const { data: teamMembersData } = await supabase
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
            logo_url,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId);

      if (teamMembersData && teamMembersData.length > 0) {
        const userTeams = teamMembersData
          .map(tm => tm.teams)
          .filter(Boolean)
          .flat() as Team[];
        setTeams(userTeams);
        
        // Set first team as current team
        if (userTeams.length > 0) {
          setCurrentTeam(userTeams[0]);
          await loadTeamData(userTeams[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading user teams:', error);
    }
  };

  const loadTeamData = async (teamId: string) => {
    try {
      // Load team members
      const { data: teamMembersData } = await supabase
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
        .eq('team_id', teamId);

      if (teamMembersData) {
        const teamUsers = teamMembersData
          .map(tm => tm.users)
          .filter(Boolean)
          .flat() as User[];
        setUsers(teamUsers);
      }

      // Load team tasks
      const { data: tasksData } = await supabase
        .from('tasks')
        .select('*')
        .eq('team_id', teamId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (tasksData) setTasks(tasksData);

      // Load team achievements
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select(`
          *,
          tasks!inner (team_id)
        `)
        .eq('tasks.team_id', teamId)
        .order('completed_at', { ascending: false });

      if (achievementsData) setAchievements(achievementsData);

    } catch (error) {
      console.error('Error loading team data:', error);
    }
  };

  // Helper function
  const getUserBadges = (userId: string): Badge[] => {
    // For now, return demo badges - will implement real badge checking later
    const userAchievements = achievements.filter((a) => a.user_id === userId && a.verified);
    const earned: Badge[] = [];
    if (userAchievements.length > 0 && badges.length > 0) earned.push(badges[0]);
    if (userAchievements.some((a) => a.task_id === "2") && badges.length > 1) earned.push(badges[1]);
    if (userAchievements.some((a) => a.task_id === "1") && badges.length > 2) earned.push(badges[2]);
    return earned;
  };

  // Function to get cumulative progress for a task
  const getCumulativeProgress = async (taskId: string, userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('task_progress')
      .select('value_added')
      .eq('task_id', taskId)
      .eq('user_id', userId);
    
    if (error) return 0;
    return data.reduce((total, entry) => total + entry.value_added, 0);
  };

  // Function to add daily progress
  const addDailyProgress = async () => {
    if (!progressTarget || !dailyProgress) return;
    
    try {
      const { error } = await supabase
        .from('task_progress')
        .insert([{
          task_id: progressTarget.taskId,
          user_id: progressTarget.userId,
          value_added: dailyProgress,
          notes: progressNotes.trim() || null
        }]);

      if (error) {
        alert('Error adding progress: ' + error.message);
        return;
      }

      // Check if task is now complete
      const totalProgress = await getCumulativeProgress(progressTarget.taskId, progressTarget.userId);
      const task = tasks.find(t => t.id === progressTarget.taskId);
      
      if (task && task.target_value && totalProgress >= task.target_value) {
        // Award achievement
        await markComplete(progressTarget.userId, progressTarget.taskId, `Completed ${totalProgress}/${task.target_value} ${task.progress_unit}`);
      }

      setShowProgressModal(false);
      setDailyProgress(0);
      setProgressNotes("");
      
      // Reload data
      if (currentTeam) {
        await loadTeamData(currentTeam.id);
      }
      
    } catch (error) {
      alert('Error adding progress: ' + (error as Error).message);
    }
  };

  const openProgressTracker = (userId: string, taskId: string) => {
    setProgressTarget({ userId, taskId });
    setDailyProgress(0);
    setProgressNotes("");
    setShowProgressModal(true);
  };

  // Derived data
  const leaderboard = React.useMemo((): LeaderboardEntry[] => {
    const userPoints: { [key: string]: number } = {};
    const userAchievements: { [key: string]: number } = {};
    
    for (const a of achievements) {
      const t = tasks.find((t) => t.id === a.task_id);
      if (a.verified && t) {
        userPoints[a.user_id] = (userPoints[a.user_id] || 0) + a.points_earned;
        userAchievements[a.user_id] = (userAchievements[a.user_id] || 0) + 1;
      }
    }
    
    return Object.entries(userPoints)
      .map(([userId, points]) => ({
        user: users.find((u) => u.id === userId),
        points,
        achievements_count: userAchievements[userId] || 0,
        badges_count: getUserBadges(userId).length,
        rank: 0
      }))
      .sort((a, b) => b.points - a.points)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));
  }, [achievements, tasks, users, badges]);

  // Auth functions
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: {
            name: signupForm.name,
            role: signupForm.role,
          }
        }
      });

      if (error) {
        alert('Signup error: ' + error.message);
        return;
      }

      if (data.user) {
        alert('Signup successful! Please check your email to verify your account.');
        setIsSignup(false);
      }
    } catch (error) {
      alert('Signup error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        alert('Login error: ' + error.message);
        return;
      }

      // User data will be loaded automatically by the auth state change listener
    } catch (error) {
      alert('Login error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Team functions
  const createTeam = async () => {
    if (!currentUser || !newTeam.name.trim() || !newTeam.sport.trim()) {
      alert('Please fill in team name and sport');
      return;
    }

    setLoading(true);
    try {
      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{
          name: newTeam.name.trim(),
          sport: newTeam.sport.trim(),
          description: newTeam.description.trim(),
          coach_id: currentUser.id,
        }])
        .select()
        .single();

      if (teamError) {
        alert('Error creating team: ' + teamError.message);
        return;
      }

      // Add creator as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamData.id,
          user_id: currentUser.id,
          role: 'coach'
        }]);

      if (memberError) {
        alert('Error adding team member: ' + memberError.message);
        return;
      }

      // Reload user teams
      await loadUserTeams(currentUser.id);
      setShowCreateTeam(false);
      setNewTeam({ name: "", sport: "", description: "" });
      
    } catch (error) {
      alert('Error creating team: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Task functions
  const addTask = async () => {
    if (!currentUser || !currentTeam || !newTask.title.trim()) {
      alert('Please add a task title');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: newTask.title.trim(),
          description: newTask.description.trim(),
          points: Math.max(1, Number(newTask.points)),
          team_id: currentTeam.id,
          assigned_by: currentUser.id,
          due_date: newTask.due_date || null,
        }]);

      if (error) {
        alert('Error creating task: ' + error.message);
        return;
      }

      // Reload team data
      await loadTeamData(currentTeam.id);
      setShowAddTask(false);
      setNewTask({ title: "", description: "", points: 50, due_date: "" });
      
    } catch (error) {
      alert('Error creating task: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (userId: string, taskId: string, proof: string) => {
    setLoading(true);
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const { error } = await supabase
        .from('achievements')
        .insert([{
          user_id: userId,
          task_id: taskId,
          proof_text: proof,
          points_earned: task.points,
          verified: true, // Auto-verify for demo
        }]);

      if (error) {
        alert('Error marking complete: ' + error.message);
        return;
      }

      // Reload team data
      if (currentTeam) {
        await loadTeamData(currentTeam.id);
      }
      
    } catch (error) {
      alert('Error marking complete: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openUpload = (userId: string, taskId: string) => {
    setUploadTarget({ userId, taskId });
    setProofText("");
    setShowUploadModal(true);
  };

  const submitUpload = () => {
    if (!uploadTarget) return;
    markComplete(uploadTarget.userId, uploadTarget.taskId, proofText.trim() || 'No proof provided');
    setShowUploadModal(false);
  };

  // Team filtering
  const teamMembers = users.filter((u) => u.role === "athlete");
  const teamTasks = tasks.filter((t) => t.team_id === currentTeam?.id);

  // Render login/home page
  if (currentView === "home" && !currentUser) {
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

          {/* Subscription Tiers Preview */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-8">Choose Your Plan</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {subscriptionPlans.map((plan, index) => (
                <div 
                  key={plan.id} 
                  className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border ${
                    plan.name === 'Basic' ? 'border-yellow-400/50 relative' : 'border-white/20'
                  }`}
                >
                  {plan.name === 'Basic' && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">POPULAR</span>
                    </div>
                  )}
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-3xl font-bold text-yellow-400 mb-4">
                    ${plan.price_monthly}<span className="text-lg">/mo</span>
                  </p>
                  <ul className="text-gray-300 text-sm space-y-2">
                    {plan.features && (() => {
                      try {
                        // Try to parse as JSON first
                        const features = JSON.parse(plan.features);
                        return Array.isArray(features) ? features.map((feature: string, idx: number) => (
                          <li key={idx}>• {feature}</li>
                        )) : null;
                      } catch {
                        // If parsing fails, treat as plain text and split by common delimiters
                        // First check if it's actually a string
                        if (typeof plan.features === 'string') {
                          const features = plan.features.split(/[,;|\n]/).map(f => f.trim()).filter(f => f);
                          return features.map((feature: string, idx: number) => (
                            <li key={idx}>• {feature}</li>
                          ));
                        }
                        return null;
                      }
                    })()}
                    <li>• Up to {plan.max_athletes} athletes</li>
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Auth Form */}
          <div className="max-w-md mx-auto bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            {!isSignup ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Login to Your Team</h2>
                <form className="space-y-4" onSubmit={handleLogin}>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={loginForm.showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setLoginForm({ ...loginForm, showPassword: !loginForm.showPassword })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                    >
                      {loginForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setIsSignup(true)}
                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-6 text-center">Create Your Account</h2>
                <form className="space-y-4" onSubmit={handleSignup}>
                  <div>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={signupForm.showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setSignupForm({ ...signupForm, showPassword: !signupForm.showPassword })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white"
                    >
                      {signupForm.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <div>
                    <select
                      value={signupForm.role}
                      onChange={(e) => setSignupForm({ ...signupForm, role: e.target.value as "athlete" | "coach" })}
                      className="w-full px-4 py-3 rounded-lg bg-white/20 text-white border border-white/30 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                    >
                      <option value="athlete" className="bg-gray-800">Athlete</option>
                      <option value="coach" className="bg-gray-800">Coach</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </button>
                </form>
                <div className="mt-4 text-center">
                  <button 
                    onClick={() => setIsSignup(false)}
                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                  >
                    Already have an account? Login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show create team if user has no teams
  if (currentUser && teams.length === 0 && currentView === "dashboard") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <div className="text-center mb-6">
              <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Welcome to C³ Athlete Tracker!</h2>
              <p className="text-gray-600 mt-2">Get started by creating your first team</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); createTeam(); }} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Team Name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Sport (e.g., Basketball, Soccer, etc.)"
                  value={newTeam.sport}
                  onChange={(e) => setNewTeam({ ...newTeam, sport: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Team Description (optional)"
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating Team...' : 'Create Team'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render main dashboard (similar to before but with real data)
  if (currentView === "dashboard" && currentUser && currentTeam) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-black shadow-sm border-b border-gray-300">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-yellow-400">C³ Athlete Tracker</h1>
                <span className="text-gray-400">|</span>
                <span className="text-white">{currentTeam.name}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-300 text-sm">{currentTeam.sport}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white">Welcome, {currentUser.name}</span>
                <span className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold uppercase">
                  {currentUser.role}
                </span>
                <button onClick={handleLogout} className="flex items-center space-x-2 text-gray-300 hover:text-white">
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
                    <div className="text-2xl font-bold text-yellow-600">{achievements.filter((a) => a.verified).length}</div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Medal className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">{badges.length}</div>
                    <div className="text-sm text-gray-600">Available Badges</div>
                  </div>
                </div>
              </div>

              {/* Current Tasks */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Current Tasks</h2>
                  {currentUser.role === "coach" && (
                    <button
                      className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                      onClick={() => setShowAddTask(true)}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Task</span>
                    </button>
                  )}
                </div>
                <div className="space-y-4">
                  {teamTasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No tasks yet. Coach can add tasks to get started!</p>
                  ) : (
                    teamTasks.map((task) => (
                      <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{task.points} pts</span>
                            {task.due_date && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(task.due_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 mb-3">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">
                            Assigned by {users.find((u) => u.id === task.assigned_by)?.name || 'Coach'}
                          </span>
                          <div className="flex space-x-2">
                            {achievements
                              .filter((a) => a.task_id === task.id && a.verified)
                              .slice(0, 3)
                              .map((a) => (
                                <div key={a.id} className="flex items-center text-green-600" title={`Completed by ${users.find(u => u.id === a.user_id)?.name}`}>
                                  <CheckCircle className="w-4 h-4" />
                                </div>
                              ))}
                            {achievements.filter((a) => a.task_id === task.id && a.verified).length > 3 && (
                              <span className="text-xs text-gray-500">
                                +{achievements.filter((a) => a.task_id === task.id && a.verified).length - 3} more
                              </span>
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
                      <p className="text-gray-500">No team members yet. Invite athletes to join your team!</p>
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
                          onClick={() => {
                            setSelectedAthlete(member);
                            setCurrentView("profile");
                          }}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900">{member.name}</h3>
                            <div className="flex items-center space-x-2">
                              {entry?.rank && entry.rank <= 3 && (
                                <Crown className={`w-4 h-4 ${entry.rank === 1 ? 'text-yellow-500' : entry.rank === 2 ? 'text-gray-400' : 'text-orange-400'}`} />
                              )}
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">{pts} pts</span>
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
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors"
                      onClick={() => {
                        const firstTask = teamTasks[0];
                        if (firstTask) openUpload(currentUser.id, firstTask.id);
                      }}
                    >
                      <Upload className="w-5 h-5 text-blue-600" />
                      <span>Upload Proof</span>
                    </button>
                  )}
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors">
                    <Settings className="w-5 h-5 text-gray-600" />
                    <span>Team Settings</span>
                  </button>
                  <button className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center space-x-3 transition-colors">
                    <Medal className="w-5 h-5 text-purple-600" />
                    <span>View All Badges</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Add New Task</h3>
                <button onClick={() => setShowAddTask(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task Title"
                  value={newTask.title}
                  onChange={(e) => setNewTask((t) => ({ ...t, title: e.target.value }))}
                />
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Task Description"
                  rows={3}
                  value={newTask.description}
                  onChange={(e) => setNewTask((t) => ({ ...t, description: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Points"
                    value={newTask.points}
                    onChange={(e) => setNewTask((t) => ({ ...t, points: Number(e.target.value) }))}
                  />
                  <input
                    type="date"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask((t) => ({ ...t, due_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setShowAddTask(false)} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
                <button 
                  onClick={addTask}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Upload Proof of Completion</h3>
                <button onClick={() => setShowUploadModal(false)} className="p-2 rounded hover:bg-gray-100">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Provide a link or description of your proof (e.g., Strava link, photo description, video filename). 
                File upload functionality will be added soon.
              </p>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., https://strava.com/activities/12345 or 'Completed 100 push-ups video.mp4'"
                rows={3}
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
              />
              <div className="mt-6 flex justify-end gap-2">
                <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-50">
                  Cancel
                </button>
                <button 
                  onClick={submitUpload}
                  disabled={loading}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Proof'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
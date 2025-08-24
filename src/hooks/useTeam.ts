'use client'
import { useState, useEffect } from 'react';
import { Team, User, Task, Achievement } from '@/types';
import {
  getUserTeams,
  getTeamMembers,
  getTeamTasks,
  getUserAchievements,
  createTeam as dbCreateTeam,
  getAllTeams,
  joinTeamByCode as dbJoinTeamByCode,
  joinTeamById as dbJoinTeamById,
  generateTeamCode,
  addTeamMember
} from '@/lib/database';

export function useTeam() {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUserTeams = async (userId: string) => {
    try {
      console.log('📂 Loading teams for user:', userId);
      const userTeams = await getUserTeams(userId);
      console.log('✅ User teams loaded:', userTeams.length);
      
      setTeams(userTeams);
      
      if (userTeams.length > 0) {
        setCurrentTeam(userTeams[0]);
        await loadTeamData(userTeams[0].id);
      }
    } catch (error) {
      console.error('❌ Error loading user teams:', error);
    }
  };

  const loadTeamData = async (teamId: string) => {
    try {
      console.log('📊 Loading data for team:', teamId);
      
      // Load team members
      const teamMembers = await getTeamMembers(teamId);
      console.log('👥 Team members loaded:', teamMembers.length);
      setUsers(teamMembers);

      // Load team tasks
      const teamTasks = await getTeamTasks(teamId);
      console.log('📋 Team tasks loaded:', teamTasks.length);
      setTasks(teamTasks);

      // Load team achievements
      const teamAchievements = await getUserAchievements('', teamId);
      console.log('🏆 Team achievements loaded:', teamAchievements.length);
      setAchievements(teamAchievements);

    } catch (error) {
      console.error('❌ Error loading team data:', error);
    }
  };

  const loadAvailableTeams = async () => {
    try {
      console.log('🔍 Loading all available teams...');
      const allTeams = await getAllTeams();
      console.log('📋 Available teams loaded:', allTeams.length);
      setAvailableTeams(allTeams);
      
      // Debug: Show all team codes
      console.log('🏷️ Team codes:');
      allTeams.forEach(team => {
        const code = generateTeamCode(team.name, team.id);
        console.log(`"${team.name}": ${code}`);
      });
      
    } catch (error) {
      console.error('❌ Error loading available teams:', error);
    }
  };

  const createTeam = async (teamData: { name: string; sport: string; description: string }, currentUserId: string) => {
    setLoading(true);
    try {
      console.log('🆕 Creating team:', teamData);
      
      const newTeam = await dbCreateTeam({
        name: teamData.name.trim(),
        sport: teamData.sport.trim(),
        description: teamData.description.trim(),
        coach_id: currentUserId,
      });

      if (!newTeam) {
        throw new Error('Failed to create team');
      }

      console.log('✅ Team created:', newTeam);

      // Add creator as team member
      await addTeamMember(newTeam.id, currentUserId, 'coach');
      console.log('✅ Creator added as coach');

      // Reload user teams
      await loadUserTeams(currentUserId);
      return newTeam;
    } catch (error) {
      console.error('❌ Error creating team:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (teamId: string, currentUserId: string) => {
    setLoading(true);
    try {
      console.log('🤝 Joining team by ID:', teamId);
      await dbJoinTeamById(teamId, currentUserId);
      console.log('✅ Successfully joined team');
      
      await loadUserTeams(currentUserId);
      return true;
    } catch (error) {
      console.error('❌ Error joining team:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const joinTeamByCode = async (teamCode: string, currentUserId: string) => {
    setLoading(true);
    try {
      console.log('🏷️ Joining team by code:', teamCode);
      await dbJoinTeamByCode(teamCode, currentUserId);
      console.log('✅ Successfully joined team by code');
      
      await loadUserTeams(currentUserId);
      return true;
    } catch (error) {
      console.error('❌ Error joining team by code:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    currentTeam,
    teams,
    users,
    tasks,
    achievements,
    availableTeams,
    loading,
    generateTeamCode,
    loadUserTeams,
    loadTeamData,
    loadAvailableTeams,
    createTeam,
    joinTeam,
    joinTeamByCode,
  };
}
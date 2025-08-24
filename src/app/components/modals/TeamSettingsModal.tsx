'use client'
import React, { useState, useEffect } from 'react';
import { X, Settings, Users, Eye, EyeOff, Loader2, CheckCircle, Copy, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Team, User } from '@/types';

interface TeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamUpdated: (updatedTeam: Team) => void;
  team: Team;
  currentUser: User;
  generateTeamCode: (name: string, id: string) => string;
}

export default function TeamSettingsModal({ 
  isOpen, 
  onClose, 
  onTeamUpdated, 
  team, 
  currentUser,
  generateTeamCode 
}: TeamSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'members' | 'danger'>('general');
  const [formData, setFormData] = useState({
    name: team.name,
    sport: team.sport,
    description: team.description || '',
    logo_url: team.logo_url || ''
  });
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [showTeamCode, setShowTeamCode] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTeamMembers();
      setFormData({
        name: team.name,
        sport: team.sport,
        description: team.description || '',
        logo_url: team.logo_url || ''
      });
    }
  }, [isOpen, team]);

  if (!isOpen) return null;

  const loadTeamMembers = async () => {
    setLoadingMembers(true);
    try {
      const { data, error } = await supabase
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
          ),
          role,
          joined_at
        `)
        .eq('team_id', team.id);

      if (error) throw error;

      if (data) {
        const members = data.map((item: any) => ({
          ...item.users,
          team_role: item.role,
          joined_at: item.joined_at
        }));
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    }

    if (!formData.sport.trim()) {
      newErrors.sport = 'Sport is required';
    }

    if (formData.logo_url && !isValidUrl(formData.logo_url)) {
      newErrors.logo_url = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({
          name: formData.name.trim(),
          sport: formData.sport.trim(),
          description: formData.description.trim() || null,
          logo_url: formData.logo_url.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', team.id)
        .select()
        .single();

      if (error) throw error;

      onTeamUpdated(data);
      setSuccess('Team settings updated successfully!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating team:', error);
      setErrors({ submit: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;

    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', team.id)
        .eq('user_id', userId);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(member => member.id !== userId));
      setSuccess('Member removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing member:', error);
      setErrors({ member: (error as Error).message });
    }
  };

  const copyTeamCode = async () => {
    const teamCode = generateTeamCode(team.name, team.id);
    try {
      await navigator.clipboard.writeText(teamCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (error) {
      console.error('Error copying code:', error);
    }
  };

  const handleClose = () => {
    setActiveTab('general');
    setErrors({});
    setLoading(false);
    setSuccess('');
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isCoach = currentUser.role === 'coach' || currentUser.id === team.coach_id;
  const teamCode = generateTeamCode(team.name, team.id);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Team Settings</h3>
            <p className="text-sm text-gray-600 mt-1">{team.name} • {team.sport}</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <p className="text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(errors.submit || errors.member) && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{errors.submit || errors.member}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>General</span>
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'members'
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Members</span>
            </button>
            {isCoach && (
              <button
                onClick={() => setActiveTab('danger')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors flex items-center space-x-2 ${
                  activeTab === 'danger'
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Danger Zone</span>
              </button>
            )}
          </nav>
        </div>

        <div className="overflow-y-auto max-h-[60vh]">
          {/* General Tab */}
          {activeTab === 'general' && (
            <form onSubmit={handleUpdateTeam} className="p-6 space-y-6">
              {/* Team Code */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Team Join Code</h4>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-white px-4 py-2 rounded-lg border border-blue-200">
                    <span className="font-mono text-lg">
                      {showTeamCode ? teamCode : '•••••••'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTeamCode(!showTeamCode)}
                    className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 transition-colors"
                  >
                    {showTeamCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={copyTeamCode}
                    className={`p-2 rounded-lg transition-colors ${
                      codeCopied ? 'bg-green-100 text-green-600' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  Share this code with athletes so they can join your team
                </p>
                {codeCopied && (
                  <p className="text-green-600 text-sm mt-1">✓ Copied to clipboard!</p>
                )}
              </div>

              {/* Team Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!isCoach}
                  />
                  {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                    Sport *
                  </label>
                  <input
                    id="sport"
                    type="text"
                    value={formData.sport}
                    onChange={(e) => handleInputChange('sport', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.sport ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={!isCoach}
                  />
                  {errors.sport && <p className="text-red-600 text-sm mt-1">{errors.sport}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!isCoach}
                />
              </div>

              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Team Logo URL
                </label>
                <input
                  id="logo_url"
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo_url}
                  onChange={(e) => handleInputChange('logo_url', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.logo_url ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={!isCoach}
                />
                {errors.logo_url && <p className="text-red-600 text-sm mt-1">{errors.logo_url}</p>}
                {formData.logo_url && isValidUrl(formData.logo_url) && (
                  <div className="mt-2">
                    <img 
                      src={formData.logo_url} 
                      alt="Logo preview"
                      className="w-16 h-16 rounded-lg object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {isCoach && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4" />
                        <span>Update Team</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="p-6">
              <h4 className="font-medium text-gray-900 mb-4">Team Members</h4>
              
              {loadingMembers ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Loading members...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="font-medium text-blue-600">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{member.name}</h5>
                          <p className="text-sm text-gray-600">{member.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            (member as any).team_role === 'coach' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {(member as any).team_role || member.role}
                          </span>
                          {member.id === team.coach_id && (
                            <span className="text-xs text-gray-500">(Owner)</span>
                          )}
                        </div>
                        
                        {isCoach && member.id !== team.coach_id && member.id !== currentUser.id && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            title="Remove member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && isCoach && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h4 className="font-medium text-red-900 mb-4 flex items-center space-x-2">
                  <Trash2 className="w-5 h-5" />
                  <span>Danger Zone</span>
                </h4>
                
                <div className="space-y-4">
                  <div className="border border-red-200 rounded-lg p-4">
                    <h5 className="font-medium text-red-900 mb-2">Delete Team</h5>
                    <p className="text-red-700 text-sm mb-4">
                      Once you delete a team, there is no going back. This will permanently delete the team, 
                      all tasks, achievements, and remove all members.
                    </p>
                    <button
                      onClick={() => {
                        if (confirm('Are you absolutely sure? This action cannot be undone.')) {
                          const userInput = prompt('Type "DELETE" to confirm deletion:');
                          if (userInput === 'DELETE') {
                            alert('Team deletion functionality will be implemented in a future update.');
                          }
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Team</span>
                    </button>
                  </div>

                  <div className="border border-red-200 rounded-lg p-4">
                    <h5 className="font-medium text-red-900 mb-2">Transfer Ownership</h5>
                    <p className="text-red-700 text-sm mb-4">
                      Transfer ownership of this team to another coach or member.
                    </p>
                    <button
                      onClick={() => {
                        alert('Transfer ownership functionality will be implemented in a future update.');
                      }}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors flex items-center space-x-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Transfer Ownership</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
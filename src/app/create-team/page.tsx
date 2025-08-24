'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Trophy, Target, ArrowLeft, Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTeam } from '@/hooks/useTeam';

export default function CreateTeamPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { loading, createTeam, generateTeamCode } = useTeam();

  const [formData, setFormData] = useState({
    name: '',
    sport: '',
    description: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [success, setSuccess] = useState('');
  const [previewCode, setPreviewCode] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  // Generate preview team code when name changes
  useEffect(() => {
    if (formData.name.length >= 3) {
      // Generate preview with dummy ID for demonstration
      const preview = generateTeamCode(formData.name, 'ABCD');
      setPreviewCode(preview);
    } else {
      setPreviewCode('');
    }
  }, [formData.name, generateTeamCode]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Team name must be at least 3 characters';
    }

    if (!formData.sport.trim()) {
      newErrors.sport = 'Sport is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !validateForm()) return;

    setSuccess('');
    setErrors({});

    try {
      const newTeam = await createTeam(formData, currentUser.id);
      const teamCode = generateTeamCode(newTeam.name, newTeam.id);
      
      setSuccess(`Team created successfully! Your team code is: ${teamCode}`);
      
      // Reset form
      setFormData({ name: '', sport: '', description: '' });
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
    } catch (err) {
      setErrors({ submit: (err as Error).message });
      console.error('Create team error:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const commonSports = [
    'Basketball', 'Soccer', 'Football', 'Baseball', 'Volleyball', 
    'Tennis', 'Swimming', 'Track & Field', 'Wrestling', 'Cross Country',
    'Lacrosse', 'Hockey', 'Softball', 'Golf', 'Gymnastics'
  ];

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
              <h1 className="text-2xl font-bold text-gray-900">Create Your Team</h1>
              <p className="text-gray-600">Set up your team and start tracking achievements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-blue-900">Welcome, Coach {currentUser.name}!</h2>
              <p className="text-blue-700">Let's create your team and get started</p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-800 font-medium">Team Created Successfully!</p>
              <p className="text-green-700">{success}</p>
              <p className="text-green-600 text-sm mt-1">Redirecting to your dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-800 font-medium">Error Creating Team</p>
              <p className="text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Team Name */}
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                id="teamName"
                type="text"
                placeholder="e.g., Saints Basketball, Warriors FC"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={50}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
              {previewCode && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <Info className="w-4 h-4 inline mr-1" />
                    Your team code will be: <span className="font-mono font-bold">{previewCode.slice(0, -4)}****</span>
                  </p>
                </div>
              )}
            </div>

            {/* Sport */}
            <div>
              <label htmlFor="sport" className="block text-sm font-medium text-gray-700 mb-2">
                Sport *
              </label>
              <div className="space-y-3">
                <input
                  id="sport"
                  type="text"
                  placeholder="Enter sport name or select from suggestions below"
                  value={formData.sport}
                  onChange={(e) => handleInputChange('sport', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.sport ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                
                {/* Sport Suggestions */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {commonSports.map((sport) => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => handleInputChange('sport', sport)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        formData.sport === sport
                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>
              {errors.sport && (
                <p className="text-red-600 text-sm mt-1">{errors.sport}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Team Description <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                placeholder="Describe your team's goals, training style, or any other details..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.name.trim() || !formData.sport.trim()}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Team...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Create Team</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">What's Next?</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Get your unique team code</li>
              <li>• Share code with athletes</li>
              <li>• Create tasks and challenges</li>
              <li>• Track team progress</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Team Features</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Unlimited athletes</li>
              <li>• Achievement tracking</li>
              <li>• Leaderboards</li>
              <li>• Progress analytics</li>
            </ul>
          </div>
        </div>

        {/* Alternative Action */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Already have a team? Join an existing one instead.
          </p>
          <button
            onClick={() => router.push('/join-team')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Join Existing Team
          </button>
        </div>
      </div>
    </div>
  );
}
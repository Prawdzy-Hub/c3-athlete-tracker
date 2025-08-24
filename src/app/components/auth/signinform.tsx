'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, User, UserCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface SignupFormProps {
  onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { loading, handleSignup } = useAuth();
  const [formData, setFormData] = useState({ 
    name: '',
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'athlete' as 'athlete' | 'coach',
    showPassword: false,
    showConfirmPassword: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await handleSignup(formData.email, formData.password, formData.name, formData.role);
      // Success feedback will be handled by the parent component
    } catch (error) {
      setErrors({ submit: (error as Error).message });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-gray-300">Join C³ Athlete Tracker and start achieving</p>
      </div>

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-200 text-sm">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
              errors.name 
                ? 'border-red-400 focus:border-red-400' 
                : 'border-white/30 focus:border-yellow-400'
            }`}
            disabled={loading}
            maxLength={50}
          />
          {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-gray-300 border transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
              errors.email 
                ? 'border-red-400 focus:border-red-400' 
                : 'border-white/30 focus:border-yellow-400'
            }`}
            disabled={loading}
          />
          {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={formData.showPassword ? "text" : "password"}
              placeholder="Create a secure password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={`w-full px-4 py-3 pr-12 rounded-lg bg-white/20 text-white placeholder-gray-300 border transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
                errors.password 
                  ? 'border-red-400 focus:border-red-400' 
                  : 'border-white/30 focus:border-yellow-400'
              }`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleInputChange('showPassword', !formData.showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
              disabled={loading}
            >
              {formData.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
          <p className="text-gray-400 text-xs mt-1">Must be at least 6 characters</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={formData.showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className={`w-full px-4 py-3 pr-12 rounded-lg bg-white/20 text-white placeholder-gray-300 border transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400/50 ${
                errors.confirmPassword 
                  ? 'border-red-400 focus:border-red-400' 
                  : 'border-white/30 focus:border-yellow-400'
              }`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => handleInputChange('showConfirmPassword', !formData.showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-white transition-colors"
              disabled={loading}
            >
              {formData.showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            I am a...
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleInputChange('role', 'athlete')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                formData.role === 'athlete'
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                  : 'border-white/30 bg-white/10 text-gray-300 hover:border-white/50'
              }`}
              disabled={loading}
            >
              <User className="w-6 h-6" />
              <span className="font-medium">Athlete</span>
            </button>
            
            <button
              type="button"
              onClick={() => handleInputChange('role', 'coach')}
              className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center space-y-2 ${
                formData.role === 'coach'
                  ? 'border-yellow-400 bg-yellow-400/20 text-yellow-400'
                  : 'border-white/30 bg-white/10 text-gray-300 hover:border-white/50'
              }`}
              disabled={loading}
            >
              <UserCheck className="w-6 h-6" />
              <span className="font-medium">Coach</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      {onSwitchToLogin && (
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Already have an account?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              Login here
            </button>
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
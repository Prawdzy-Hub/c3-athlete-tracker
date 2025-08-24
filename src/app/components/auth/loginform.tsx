'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LoginFormProps {
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { loading, handleLogin } = useAuth();
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    showPassword: false 
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await handleLogin(formData.email, formData.password);
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
        <h2 className="text-2xl font-bold text-white mb-2">Login to Your Team</h2>
        <p className="text-gray-300">Access your team dashboard and track progress</p>
      </div>

      {errors.submit && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-200 text-sm">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            placeholder="coach@example.com"
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
              placeholder="Enter your password"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>
      </form>

      {onSwitchToSignup && (
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            Don't have an account?{' '}
            <button 
              onClick={onSwitchToSignup}
              className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
            >
              Sign up here
            </button>
          </p>
        </div>
      )}

      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          Secure login with email verification
        </p>
      </div>
    </div>
  );
}
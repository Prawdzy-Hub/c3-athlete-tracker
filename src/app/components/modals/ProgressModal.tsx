'use client'
import React, { useState, useEffect } from 'react';
import { X, Plus, TrendingUp, Calendar, Target, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Task, User } from '@/types';
import { createAchievement } from '@/lib/database';

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgressAdded: () => void;
  task: Task;
  user: User;
}

interface ProgressEntry {
  id: string;
  value_added: number;
  notes?: string;
  created_at: string;
}

export default function ProgressModal({ 
  isOpen, 
  onClose, 
  onProgressAdded, 
  task, 
  user 
}: ProgressModalProps) {
  const [dailyProgress, setDailyProgress] = useState<number>(0);
  const [progressNotes, setProgressNotes] = useState('');
  const [currentProgress, setCurrentProgress] = useState(0);
  const [progressHistory, setProgressHistory] = useState<ProgressEntry[]>([]);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProgressHistory();
    }
  }, [isOpen, task.id, user.id]);

  if (!isOpen) return null;

  const loadProgressHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('task_progress')
        .select('id, value_added, notes, created_at')
        .eq('task_id', task.id)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setProgressHistory(data);
        const total = data.reduce((sum, entry) => sum + entry.value_added, 0);
        setCurrentProgress(total);
      }
    } catch (error) {
      console.error('Error loading progress history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!dailyProgress || dailyProgress <= 0) {
      newErrors.dailyProgress = 'Progress value must be greater than 0';
    }

    if (task.target_value && (currentProgress + dailyProgress) > task.target_value) {
      newErrors.dailyProgress = `Adding ${dailyProgress} would exceed the target of ${task.target_value} ${task.progress_unit}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Add progress entry
      const { error: progressError } = await supabase
        .from('task_progress')
        .insert([{
          task_id: task.id,
          user_id: user.id,
          value_added: dailyProgress,
          notes: progressNotes.trim() || null
        }]);

      if (progressError) throw progressError;

      const newTotal = currentProgress + dailyProgress;
      const isComplete = task.target_value ? newTotal >= task.target_value : false;

      // If task is now complete, create achievement
      if (isComplete && task.target_value) {
        await createAchievement({
          user_id: user.id,
          task_id: task.id,
          proof_text: `Completed ${newTotal}/${task.target_value} ${task.progress_unit}`,
          points_earned: task.points,
          verified: true
        });
      }

      setSuccess(true);
      setTimeout(() => {
        onProgressAdded();
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Error adding progress:', error);
      setErrors({ submit: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDailyProgress(0);
    setProgressNotes('');
    setErrors({});
    setLoading(false);
    setSuccess(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field === 'dailyProgress') {
      setDailyProgress(Number(value));
    } else {
      setProgressNotes(value as string);
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const progressPercentage = task.target_value 
    ? Math.min((currentProgress / task.target_value) * 100, 100)
    : 0;

  const newProgressPercentage = task.target_value 
    ? Math.min(((currentProgress + dailyProgress) / task.target_value) * 100, 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Track Progress</h3>
            <p className="text-sm text-gray-600 mt-1">For: {task.title}</p>
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
              <div>
                <p className="text-green-800 font-medium">Progress Added Successfully!</p>
                <p className="text-green-700 text-sm">
                  {task.target_value && (currentProgress + dailyProgress) >= task.target_value
                    ? `Task completed! You've earned ${task.points} points!`
                    : 'Keep up the great work!'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error adding progress</p>
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Task Overview */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">{task.title}</h4>
            {task.description && (
              <p className="text-blue-700 text-sm mb-3">{task.description}</p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600">
                Target: {task.target_value} {task.progress_unit}
              </span>
              <span className="text-blue-600">Reward: {task.points} points</span>
            </div>
          </div>

          {/* Current Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Current Progress</h4>
              <span className="text-sm text-gray-600">
                {currentProgress} / {task.target_value || '∞'} {task.progress_unit}
              </span>
            </div>
            
            {task.target_value && (
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                  {dailyProgress > 0 && (
                    <div 
                      className="bg-green-400 h-3 rounded-full absolute top-0 transition-all duration-300"
                      style={{ 
                        left: `${progressPercentage}%`, 
                        width: `${newProgressPercentage - progressPercentage}%` 
                      }}
                    ></div>
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                  <span>{task.target_value}</span>
                </div>
              </div>
            )}
          </div>

          {/* Add Progress Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label htmlFor="dailyProgress" className="block text-sm font-medium text-gray-700 mb-2">
                  Add Progress *
                </label>
                <div className="relative">
                  <input
                    id="dailyProgress"
                    type="number"
                    placeholder="e.g., 5"
                    value={dailyProgress || ''}
                    onChange={(e) => handleInputChange('dailyProgress', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.dailyProgress ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="0.1"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {task.progress_unit}
                  </span>
                </div>
                {errors.dailyProgress && <p className="text-red-600 text-sm mt-1">{errors.dailyProgress}</p>}
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || success || !dailyProgress}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="progressNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Notes <span className="text-gray-500">(optional)</span>
              </label>
              <textarea
                id="progressNotes"
                rows={2}
                placeholder="Add notes about today's progress..."
                value={progressNotes}
                onChange={(e) => handleInputChange('progressNotes', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{progressNotes.length}/200 characters</p>
            </div>
          </form>

          {/* Progress History */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Recent Progress</span>
            </h4>
            
            {loadingHistory ? (
              <div className="text-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500 text-sm mt-2">Loading history...</p>
              </div>
            ) : progressHistory.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <Target className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No progress recorded yet</p>
                <p className="text-gray-400 text-sm">Add your first entry above!</p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {progressHistory.map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900">
                        +{entry.value_added} {task.progress_unit}
                      </span>
                      {entry.notes && (
                        <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(entry.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
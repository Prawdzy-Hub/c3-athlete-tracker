'use client'
import React, { useState } from 'react';
import { X, Plus, Calendar, Target, Info, Loader2 } from 'lucide-react';
import { createTask } from '@/lib/database';
import { Task } from '@/types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: (task: Task) => void;
  teamId: string;
  currentUserId: string;
}

export default function AddTaskModal({ 
  isOpen, 
  onClose, 
  onTaskCreated, 
  teamId, 
  currentUserId 
}: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    points: 50,
    due_date: '',
    target_value: '',
    progress_unit: ''
  });
  const [taskType, setTaskType] = useState<'completion' | 'progress'>('completion');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (formData.points < 1 || formData.points > 1000) {
      newErrors.points = 'Points must be between 1 and 1000';
    }

    if (taskType === 'progress') {
      if (!formData.target_value || Number(formData.target_value) <= 0) {
        newErrors.target_value = 'Target value must be greater than 0';
      }
      if (!formData.progress_unit.trim()) {
        newErrors.progress_unit = 'Progress unit is required (e.g., miles, reps, minutes)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        points: Number(formData.points),
        team_id: teamId,
        assigned_by: currentUserId,
        due_date: formData.due_date || undefined,
        target_value: taskType === 'progress' ? Number(formData.target_value) : undefined,
        progress_unit: taskType === 'progress' ? formData.progress_unit.trim() : undefined,
        is_active: true
      };

      const newTask = await createTask(taskData);
      if (newTask) {
        onTaskCreated(newTask);
        handleClose();
      }
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ submit: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      points: 50,
      due_date: '',
      target_value: '',
      progress_unit: ''
    });
    setTaskType('completion');
    setErrors({});
    setLoading(false);
    onClose();
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const taskTypeExamples = {
    completion: [
      'Complete 5km run',
      'Attend team practice',
      'Submit workout video',
      'Complete nutrition log'
    ],
    progress: [
      'Run 100 miles total',
      'Complete 500 push-ups',
      'Practice 10 hours',
      'Attend 20 training sessions'
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Create New Task</h3>
            <p className="text-sm text-gray-600 mt-1">Assign a challenge for your team</p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error creating task</p>
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Task Type</label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  taskType === 'completion' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setTaskType('completion')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h4 className="font-medium">One-Time Completion</h4>
                </div>
                <p className="text-sm text-gray-600">Task is complete when submitted once</p>
              </div>
              
              <div 
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  taskType === 'progress' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setTaskType('progress')}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium">Progress Tracking</h4>
                </div>
                <p className="text-sm text-gray-600">Track cumulative progress over time</p>
              </div>
            </div>
          </div>

          {/* Task Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Complete 5km run"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              maxLength={100}
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          {/* Task Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Provide details about what athletes need to do..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
          </div>

          {/* Progress Tracking Fields */}
          {taskType === 'progress' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="target_value" className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value *
                </label>
                <input
                  id="target_value"
                  type="number"
                  placeholder="e.g., 100"
                  value={formData.target_value}
                  onChange={(e) => handleInputChange('target_value', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.target_value ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="1"
                />
                {errors.target_value && <p className="text-red-600 text-sm mt-1">{errors.target_value}</p>}
              </div>

              <div>
                <label htmlFor="progress_unit" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit *
                </label>
                <input
                  id="progress_unit"
                  type="text"
                  placeholder="e.g., miles, reps, minutes"
                  value={formData.progress_unit}
                  onChange={(e) => handleInputChange('progress_unit', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.progress_unit ? 'border-red-300' : 'border-gray-300'
                  }`}
                  maxLength={20}
                />
                {errors.progress_unit && <p className="text-red-600 text-sm mt-1">{errors.progress_unit}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Points */}
            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
                Points Reward *
              </label>
              <input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) => handleInputChange('points', Number(e.target.value))}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.points ? 'border-red-300' : 'border-gray-300'
                }`}
                min="1"
                max="1000"
              />
              {errors.points && <p className="text-red-600 text-sm mt-1">{errors.points}</p>}
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-gray-500">(optional)</span>
              </label>
              <input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange('due_date', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Examples */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Example {taskType === 'completion' ? 'Completion' : 'Progress'} Tasks</h4>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              {taskTypeExamples[taskType].map((example, index) => (
                <li key={index}>• {example}</li>
              ))}
            </ul>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Create Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
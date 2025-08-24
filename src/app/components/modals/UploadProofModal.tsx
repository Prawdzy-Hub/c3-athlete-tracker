'use client'
import React, { useState } from 'react';
import { X, Upload, Link2, FileText, Camera, Loader2, CheckCircle } from 'lucide-react';
import { createAchievement } from '@/lib/database';
import { Task, User } from '@/types';

interface UploadProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProofSubmitted: () => void;
  task: Task;
  user: User;
}

export default function UploadProofModal({ 
  isOpen, 
  onClose, 
  onProofSubmitted, 
  task, 
  user 
}: UploadProofModalProps) {
  const [proofType, setProofType] = useState<'link' | 'description'>('description');
  const [proofText, setProofText] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!proofText.trim()) {
      newErrors.proofText = proofType === 'link' 
        ? 'Please provide a valid link' 
        : 'Please describe your proof of completion';
    }

    if (proofType === 'link' && !isValidUrl(proofText.trim())) {
      newErrors.proofText = 'Please enter a valid URL (including http:// or https://)';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const achievementData = {
        user_id: user.id,
        task_id: task.id,
        proof_text: proofText.trim(),
        points_earned: task.points,
        verified: true // Auto-verify for now, can add manual verification later
      };

      const newAchievement = await createAchievement(achievementData);
      if (newAchievement) {
        setSuccess(true);
        setTimeout(() => {
          onProofSubmitted();
          handleClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error submitting proof:', error);
      setErrors({ submit: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setProofText('');
    setProofType('description');
    setErrors({});
    setLoading(false);
    setSuccess(false);
    onClose();
  };

  const handleInputChange = (value: string) => {
    setProofText(value);
    if (errors.proofText) {
      setErrors(prev => ({ ...prev, proofText: '' }));
    }
  };

  const exampleLinks = [
    'https://www.strava.com/activities/12345',
    'https://www.youtube.com/watch?v=example',
    'https://drive.google.com/file/d/example',
    'https://photos.app.goo.gl/example'
  ];

  const exampleDescriptions = [
    'Completed 5km run in 25:30 at Central Park',
    'Uploaded workout video to team drive - bench press 3x8 @ 185lbs',
    'Attended full team practice on 12/15, worked on defensive drills',
    'Submitted nutrition log for this week showing 2500 cal/day average'
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Submit Proof</h3>
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
                <p className="text-green-800 font-medium">Proof Submitted Successfully!</p>
                <p className="text-green-700 text-sm">You've earned {task.points} points. Great work!</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error submitting proof</p>
            <p className="text-red-700">{errors.submit}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Task Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">{task.title}</h4>
            {task.description && (
              <p className="text-blue-700 text-sm mb-2">{task.description}</p>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-600">Reward: {task.points} points</span>
              {task.due_date && (
                <span className="text-blue-600">Due: {new Date(task.due_date).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Proof Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">How would you like to submit proof?</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  proofType === 'description' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setProofType('description')}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-sm">Description</h4>
                </div>
                <p className="text-xs text-gray-600">Describe what you did</p>
              </div>
              
              <div 
                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                  proofType === 'link' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setProofType('link')}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <Link2 className="w-4 h-4 text-gray-600" />
                  <h4 className="font-medium text-sm">Link/URL</h4>
                </div>
                <p className="text-xs text-gray-600">Share a link to proof</p>
              </div>
            </div>
          </div>

          {/* Proof Input */}
          <div>
            <label htmlFor="proofText" className="block text-sm font-medium text-gray-700 mb-2">
              {proofType === 'link' ? 'Proof Link *' : 'Proof Description *'}
            </label>
            {proofType === 'link' ? (
              <input
                id="proofText"
                type="url"
                placeholder="https://www.strava.com/activities/12345"
                value={proofText}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.proofText ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            ) : (
              <textarea
                id="proofText"
                rows={4}
                placeholder="Describe what you did to complete this task..."
                value={proofText}
                onChange={(e) => handleInputChange(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.proofText ? 'border-red-300' : 'border-gray-300'
                }`}
                maxLength={1000}
              />
            )}
            {errors.proofText && <p className="text-red-600 text-sm mt-1">{errors.proofText}</p>}
            {proofType === 'description' && (
              <p className="text-xs text-gray-500 mt-1">{proofText.length}/1000 characters</p>
            )}
          </div>

          {/* Examples */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center space-x-2">
              {proofType === 'link' ? <Link2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              <span>Examples</span>
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {(proofType === 'link' ? exampleLinks : exampleDescriptions).map((example, index) => (
                <li key={index} className="flex items-start">
                  <span className="mr-2">•</span>
                  <span className={proofType === 'link' ? 'font-mono text-xs break-all' : ''}>{example}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* File Upload Note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Camera className="w-4 h-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium text-sm">File Upload Coming Soon</p>
                <p className="text-yellow-700 text-xs">Direct photo/video upload will be available in a future update. For now, please upload files to Google Drive, Dropbox, or similar and share the link.</p>
              </div>
            </div>
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
              disabled={loading || success}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submitted!</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Submit Proof</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
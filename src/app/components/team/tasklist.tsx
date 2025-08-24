'use client'
import React from 'react';
import { Plus, Target, Calendar, CheckCircle, Upload, TrendingUp } from 'lucide-react';
import { Task, Achievement, User } from '@/types';

interface TaskListProps {
  tasks: Task[];
  achievements: Achievement[];
  users: User[];
  currentUserRole?: string;
  currentUserId?: string;
  teamCoachId?: string;
  onAddTask?: () => void;
  onUploadProof?: (task: Task) => void;
  onTrackProgress?: (task: Task) => void;
}

export default function TaskList({ 
  tasks, 
  achievements, 
  users, 
  currentUserRole,
  currentUserId,
  teamCoachId,
  onAddTask,
  onUploadProof,
  onTrackProgress
}: TaskListProps) {
  const isCoach = currentUserRole === 'coach' || currentUserId === teamCoachId;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Current Tasks</h2>
        {isCoach && onAddTask && (
          <button 
            onClick={onAddTask}
            className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        )}
      </div>
      
      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No tasks yet. {isCoach ? 'Create some tasks to get started!' : 'Your coach will add tasks soon!'}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
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
              
              {task.description && (
                <p className="text-gray-600 mb-3">{task.description}</p>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Assigned by {users.find((u) => u.id === task.assigned_by)?.name || 'Coach'}
                </span>
                
                <div className="flex items-center space-x-2">
                  {/* Completion indicators */}
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
                  
                  {/* Action buttons for athletes */}
                  {currentUserRole === 'athlete' && (
                    <div className="flex space-x-2">
                      {task.target_value ? (
                        onTrackProgress && (
                          <button 
                            onClick={() => onTrackProgress(task)}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>Progress</span>
                          </button>
                        )
                      ) : (
                        onUploadProof && (
                          <button 
                            onClick={() => onUploadProof(task)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                          >
                            <Upload className="w-3 h-3" />
                            <span>Upload</span>
                          </button>
                        )
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
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/components/DashboardLayout';
import GoalForm from '@/components/GoalForm';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Target, Plus, Briefcase, Heart, Star, Calendar, Edit2, Trash2, Loader2, AlertCircle } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: 'work' | 'health' | 'personal';
  targetDate: string | null;
  createdAt: string;
  _count?: {
    tasks: number;
  };
  tasks?: Array<{
    id: string;
    title: string;
    completed: boolean;
  }>;
}

export default function GoalsPage() {
  const router = useRouter();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await fetch('/api/goals?includeTasks=true');
      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }
      const data = await response.json();
      setGoals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (goalData: {
    title: string;
    description: string;
    category: 'work' | 'health' | 'personal';
    targetDate: string;
  }) => {
    const response = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });

    if (!response.ok) {
      throw new Error('Failed to create goal');
    }

    await fetchGoals();
    setShowForm(false);
  };

  const handleUpdateGoal = async (goalData: {
    title: string;
    description: string;
    category: 'work' | 'health' | 'personal';
    targetDate: string;
  }) => {
    if (!editingGoal) return;

    const response = await fetch(`/api/goals/${editingGoal.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goalData),
    });

    if (!response.ok) {
      throw new Error('Failed to update goal');
    }

    await fetchGoals();
    setEditingGoal(null);
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;

    try {
      const response = await fetch(`/api/goals/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      await fetchGoals();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'work':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'health':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'personal':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return <Briefcase className="w-5 h-5" />;
      case 'health':
        return <Heart className="w-5 h-5" />;
      case 'personal':
        return <Star className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const calculateProgress = (goal: Goal) => {
    if (!goal.tasks || goal.tasks.length === 0) {
      return { percentage: 0, completed: 0, total: 0 };
    }
    const completed = goal.tasks.filter(t => t.completed).length;
    const total = goal.tasks.length;
    const percentage = Math.round((completed / total) * 100);
    return { percentage, completed, total };
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" text="Loading your goals..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Goals</h1>
          <p className="text-gray-600">
            Set and track your year-start goals
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Create Goal Button */}
        {!showForm && !editingGoal && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="w-full mb-6 py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Goal</span>
          </motion.button>
        )}

        {/* Goal Form */}
        <AnimatePresence>
          {(showForm || editingGoal) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6"
            >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h2>
            <GoalForm
              onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal}
              onCancel={() => {
                setShowForm(false);
                setEditingGoal(null);
              }}
              initialData={
                editingGoal
                  ? {
                      title: editingGoal.title,
                      description: editingGoal.description || '',
                      category: editingGoal.category,
                      targetDate: editingGoal.targetDate
                        ? new Date(editingGoal.targetDate)
                            .toISOString()
                            .split('T')[0]
                        : '',
                    }
                  : undefined
              }
              isEditing={!!editingGoal}
            />
          </motion.div>
        )}
      </AnimatePresence>

        {/* Goals List */}
        {goals.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-200 rounded-full mb-6">
              <Target className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No goals yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first goal to start tracking your progress
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-emerald-200 transition-all"
                >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${getCategoryColor(goal.category)}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {goal.title}
                        </h3>
                        <span
                          className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(
                            goal.category
                          )}`}
                        >
                          {goal.category.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    {goal.description && (
                      <p className="text-gray-600 mb-3 ml-12">{goal.description}</p>
                    )}
                    {goal.targetDate && (
                      <div className="flex items-center text-sm text-gray-500 ml-12">
                        <Calendar className="w-4 h-4 mr-2" />
                        Target: {new Date(goal.targetDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                    {/* Progress Tracking */}
                    {goal.tasks && goal.tasks.length > 0 && (
                      <div className="ml-12 mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            Progress: {calculateProgress(goal).completed} / {calculateProgress(goal).total} tasks
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {calculateProgress(goal).percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressColor(calculateProgress(goal).percentage)}`}
                            style={{ width: `${calculateProgress(goal).percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setEditingGoal(goal)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="Edit goal"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

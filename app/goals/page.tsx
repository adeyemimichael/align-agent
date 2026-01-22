'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import GoalForm from '@/components/GoalForm';

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: 'work' | 'health' | 'personal';
  targetDate: string | null;
  createdAt: string;
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
      const response = await fetch('/api/goals');
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
        return 'bg-blue-100 text-blue-800';
      case 'health':
        return 'bg-green-100 text-green-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return '💼';
      case 'health':
        return '💪';
      case 'personal':
        return '🌟';
      default:
        return '📌';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-gray-600">Loading goals...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Goals</h1>
              <p className="text-gray-600">
                Set and track your year-start goals
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Create Goal Button */}
          {!showForm && !editingGoal && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mb-6 py-4 px-6 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Create New Goal</span>
            </button>
          )}

          {/* Goal Form */}
          {(showForm || editingGoal) && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
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
            </div>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No goals yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create your first goal to start tracking your progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">
                          {getCategoryIcon(goal.category)}
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">
                          {goal.title}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            goal.category
                          )}`}
                        >
                          {goal.category}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="text-gray-600 mb-3">{goal.description}</p>
                      )}
                      {goal.targetDate && (
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          Target: {new Date(goal.targetDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => setEditingGoal(goal)}
                        className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                        title="Edit goal"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete goal"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

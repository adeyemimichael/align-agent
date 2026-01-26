'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import AIReasoningDisplay from '@/components/AIReasoningDisplay';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Sparkles,
  TrendingUp,
  Trash2,
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: number;
  estimatedMinutes: number;
  scheduledStart?: Date;
  scheduledEnd?: Date;
  completed: boolean;
  goalId?: string;
}

interface Plan {
  id: string;
  date: Date;
  capacityScore: number;
  mode: string;
  reasoning: string;
  tasks: Task[];
}

export default function PlanPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/plan/current');

      if (response.status === 404) {
        // No plan exists yet
        setPlan(null);
        setError(null);
      } else if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
        setError(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to load plan');
      }
    } catch (err) {
      setError('Failed to load plan');
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/plan/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          syncToCalendar: false, // Can be made configurable
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate plan');
      }

      const data = await response.json();
      setPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate plan');
    } finally {
      setGenerating(false);
    }
  };

  const toggleTaskCompletion = async (taskId: string, completed: boolean) => {
    if (!plan) return;

    try {
      const response = await fetch(`/api/plan/${plan.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tasks: [{ id: taskId, completed }],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPlan(data.plan);
      }
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!plan) return;
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/integrations/todoist/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove task from local state
        setPlan({
          ...plan,
          tasks: plan.tasks.filter(t => t.id !== taskId),
        });
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete task');
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
      alert('Failed to delete task');
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-600 bg-red-50 border-red-200';
      case 2:
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 3:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 4:
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'recovery':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'balanced':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'deep_work':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Today's Plan
            </h1>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI
            </span>
          </div>
          <p className="text-gray-600">
            Personalized daily schedule based on your capacity and goals
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-800">{error}</p>
              {error.includes('check-in') && (
                <button
                  onClick={() => router.push('/checkin')}
                  className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
                >
                  Complete check-in now
                </button>
              )}
            </div>
          </div>
        )}

        {!plan && !error && (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
              <Sparkles className="w-10 h-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Plan Your Day?
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Our AI will analyze your capacity, goals, and tasks to create a personalized schedule that works for you.
            </p>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Your Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate AI Plan
                </>
              )}
            </button>
          </div>
        )}

        {plan && (
          <>
            {/* Plan Header */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <p className="text-sm font-medium text-gray-600">
                      {new Date(plan.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span className="text-2xl font-bold text-gray-900">
                        {plan.capacityScore.toFixed(0)}%
                      </span>
                      <span className="text-sm text-gray-500">capacity</span>
                    </div>
                    <span
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${getModeColor(plan.mode)}`}
                    >
                      {plan.mode.replace('_', ' ').toUpperCase()} MODE
                    </span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </span>
                  </div>
                </div>
                <button
                  onClick={generatePlan}
                  disabled={generating}
                  className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Regenerating...
                    </span>
                  ) : (
                    'Regenerate'
                  )}
                </button>
              </div>
            </div>

            {/* AI Reasoning */}
            <AIReasoningDisplay overallReasoning={plan.reasoning} />

            {/* Tasks List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Scheduled Tasks
                </h2>
                <span className="text-sm text-gray-500">
                  {plan.tasks.filter(t => t.completed).length} of {plan.tasks.length} completed
                </span>
              </div>
              <div className="space-y-3">
                {plan.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border-2 rounded-xl p-4 transition-all ${
                      task.completed
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() =>
                          toggleTaskCompletion(task.id, !task.completed)
                        }
                        className="mt-1 flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 hover:text-emerald-600" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3
                              className={`font-medium ${
                                task.completed
                                  ? 'text-gray-500 line-through'
                                  : 'text-gray-900'
                              }`}
                            >
                              {task.title}
                            </h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {task.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}
                            >
                              P{task.priority}
                            </span>
                            <button
                              onClick={() => deleteTask(task.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {task.scheduledStart && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(task.scheduledStart).toLocaleTimeString(
                                  'en-US',
                                  {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                  }
                                )}
                                {' - '}
                                {task.scheduledEnd &&
                                  new Date(task.scheduledEnd).toLocaleTimeString(
                                    'en-US',
                                    {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    }
                                  )}
                              </span>
                            </div>
                          )}
                          <span>{task.estimatedMinutes} min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

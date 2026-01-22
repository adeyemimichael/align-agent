'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AIReasoningDisplay from '@/components/AIReasoningDisplay';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
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
        return 'bg-blue-100 text-blue-800';
      case 'balanced':
        return 'bg-green-100 text-green-800';
      case 'deep_work':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Today's Plan
          </h1>
          <p className="text-gray-600">
            AI-powered daily schedule based on your capacity
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
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Plan Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Generate your AI-powered daily plan to get started
            </p>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                'Generate Plan'
              )}
            </button>
          </div>
        )}

        {plan && (
          <>
            {/* Plan Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {new Date(plan.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-2xl font-bold text-gray-900">
                      Capacity: {plan.capacityScore.toFixed(0)}%
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getModeColor(plan.mode)}`}
                    >
                      {plan.mode.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={generatePlan}
                  disabled={generating}
                  className="text-sm text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                >
                  {generating ? 'Regenerating...' : 'Regenerate Plan'}
                </button>
              </div>
            </div>

            {/* AI Reasoning */}
            <AIReasoningDisplay overallReasoning={plan.reasoning} />

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Scheduled Tasks
              </h2>
              <div className="space-y-3">
                {plan.tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`border rounded-lg p-4 transition-all ${
                      task.completed
                        ? 'bg-gray-50 border-gray-200 opacity-60'
                        : 'bg-white border-gray-200 hover:border-emerald-300'
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
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(task.priority)}`}
                          >
                            P{task.priority}
                          </span>
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
    </div>
  );
}

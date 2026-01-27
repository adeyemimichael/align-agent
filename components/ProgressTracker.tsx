'use client';

import { useEffect, useState } from 'react';
import { MomentumIndicator } from './MomentumIndicator';
import { SkipRiskWarning } from './SkipRiskWarning';
import type { MomentumState } from '@/lib/momentum-tracker';

interface ProgressSnapshot {
  planId: string;
  userId: string;
  currentTime: string;
  totalTasks: number;
  completedTasks: number;
  skippedTasks: number;
  inProgressTasks: number;
  upcomingTasks: number;
  minutesAheadBehind: number;
  currentTask: TaskProgress | null;
  nextTask: TaskProgress | null;
  momentumState: MomentumState;
  overallProgress: number;
}

interface TaskProgress {
  id: string;
  title: string;
  priority: number;
  estimatedMinutes: number;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  actualMinutes: number | null;
  completed: boolean;
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped' | 'delayed';
  minutesAheadBehind: number;
  skipRisk: {
    level: 'low' | 'medium' | 'high';
    percentage: number;
    reasoning: string;
  } | null;
}

interface ProgressSummary {
  status: 'ahead' | 'on_track' | 'behind' | 'at_risk';
  message: string;
  progress: ProgressSnapshot;
}

interface ProgressTrackerProps {
  planId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export function ProgressTracker({
  planId,
  autoRefresh = true,
  refreshInterval = 60000, // 1 minute default
}: ProgressTrackerProps) {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const fetchProgress = async () => {
    try {
      const response = await fetch(`/api/progress/current?planId=${planId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch progress');
      }
      const data = await response.json();
      setSummary(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const syncWithTaskApp = async () => {
    try {
      const response = await fetch('/api/progress/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        throw new Error('Failed to sync with task app');
      }

      const data = await response.json();
      setLastSynced(new Date());

      // Refresh progress after sync
      await fetchProgress();

      return data;
    } catch (err) {
      console.error('Sync error:', err);
      setError(err instanceof Error ? err.message : 'Sync failed');
    }
  };

  useEffect(() => {
    fetchProgress();

    if (autoRefresh) {
      const interval = setInterval(fetchProgress, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [planId, autoRefresh, refreshInterval]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading progress: {error}</p>
        <button
          onClick={fetchProgress}
          className="mt-2 text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const { status, message, progress } = summary;

  // Status colors
  const statusColors = {
    ahead: 'bg-green-50 border-green-200 text-green-800',
    on_track: 'bg-blue-50 border-blue-200 text-blue-800',
    behind: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    at_risk: 'bg-red-50 border-red-200 text-red-800',
  };

  const statusIcons = {
    ahead: '🎉',
    on_track: '✅',
    behind: '⚠️',
    at_risk: '🚨',
  };

  return (
    <div className="space-y-4">
      {/* Overall Progress Status */}
      <div className={`rounded-lg border p-4 ${statusColors[status]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{statusIcons[status]}</span>
            <div>
              <h3 className="font-semibold text-lg">
                {status === 'ahead' && 'Ahead of Schedule'}
                {status === 'on_track' && 'On Track'}
                {status === 'behind' && 'Behind Schedule'}
                {status === 'at_risk' && 'At Risk'}
              </h3>
              <p className="text-sm">{message}</p>
            </div>
          </div>
          <button
            onClick={syncWithTaskApp}
            className="px-3 py-1 text-sm bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
            title="Sync with Todoist"
          >
            🔄 Sync
          </button>
        </div>

        {lastSynced && (
          <p className="text-xs mt-2 opacity-75">
            Last synced: {lastSynced.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {progress.overallProgress}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress.overallProgress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{progress.completedTasks} completed</span>
          <span>{progress.skippedTasks} skipped</span>
          <span>{progress.upcomingTasks} remaining</span>
        </div>
      </div>

      {/* Momentum Indicator */}
      <MomentumIndicator
        state={progress.momentumState}
        showDetails={true}
      />

      {/* Current Task */}
      {progress.currentTask && (
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Current Task</h4>
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  {progress.currentTask.title}
                </p>
                <p className="text-sm text-gray-600">
                  Estimated: {progress.currentTask.estimatedMinutes} min
                </p>
                {progress.currentTask.actualStartTime && (
                  <p className="text-xs text-gray-500">
                    Started:{' '}
                    {new Date(
                      progress.currentTask.actualStartTime
                    ).toLocaleTimeString()}
                  </p>
                )}
              </div>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  progress.currentTask.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800'
                    : progress.currentTask.status === 'delayed'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {progress.currentTask.status.replace('_', ' ')}
              </span>
            </div>

            {progress.currentTask.skipRisk && (
              <SkipRiskWarning
                level={progress.currentTask.skipRisk.level}
                percentage={progress.currentTask.skipRisk.percentage}
                reasoning={progress.currentTask.skipRisk.reasoning}
              />
            )}
          </div>
        </div>
      )}

      {/* Next Task Preview */}
      {progress.nextTask && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">
            Up Next
          </h4>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {progress.nextTask.title}
              </p>
              <p className="text-sm text-gray-600">
                {progress.nextTask.estimatedMinutes} min
                {progress.nextTask.scheduledStart &&
                  ` • ${new Date(
                    progress.nextTask.scheduledStart
                  ).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}`}
              </p>
            </div>
            {progress.nextTask.skipRisk && (
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  progress.nextTask.skipRisk.level === 'high'
                    ? 'bg-red-100 text-red-800'
                    : progress.nextTask.skipRisk.level === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {progress.nextTask.skipRisk.percentage}% skip risk
              </span>
            )}
          </div>
        </div>
      )}

      {/* Task Summary */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Task Summary</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {progress.completedTasks}
            </p>
            <p className="text-sm text-gray-600">Completed</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {progress.inProgressTasks}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {progress.skippedTasks}
            </p>
            <p className="text-sm text-gray-600">Skipped</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">
              {progress.upcomingTasks}
            </p>
            <p className="text-sm text-gray-600">Upcoming</p>
          </div>
        </div>
      </div>
    </div>
  );
}

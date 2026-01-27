'use client';

import { useEffect, useState } from 'react';

interface ProgressDisplayProps {
  planId: string;
  compact?: boolean;
}

interface ProgressSummary {
  status: 'ahead' | 'on_track' | 'behind' | 'at_risk';
  message: string;
  progress: {
    totalTasks: number;
    completedTasks: number;
    skippedTasks: number;
    minutesAheadBehind: number;
    overallProgress: number;
    momentumState: string;
  };
}

export function ProgressDisplay({ planId, compact = false }: ProgressDisplayProps) {
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/progress/current?planId=${planId}`);
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [planId]);

  if (loading || !summary) {
    return null;
  }

  const { status, message, progress } = summary;

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                status === 'ahead'
                  ? 'bg-green-500'
                  : status === 'on_track'
                  ? 'bg-blue-500'
                  : status === 'behind'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${progress.overallProgress}%` }}
            ></div>
          </div>
        </div>
        <span className="text-sm font-medium text-gray-700">
          {progress.completedTasks}/{progress.totalTasks}
        </span>
      </div>
    );
  }

  const statusColors = {
    ahead: 'text-green-600',
    on_track: 'text-blue-600',
    behind: 'text-yellow-600',
    at_risk: 'text-red-600',
  };

  const statusIcons = {
    ahead: '🎉',
    on_track: '✅',
    behind: '⚠️',
    at_risk: '🚨',
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center space-x-2 mb-3">
        <span className="text-xl">{statusIcons[status]}</span>
        <h3 className={`font-semibold ${statusColors[status]}`}>
          {message}
        </h3>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progress.overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress.overallProgress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="text-center">
            <p className="font-semibold text-green-600">
              {progress.completedTasks}
            </p>
            <p className="text-gray-600">Done</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-yellow-600">
              {progress.skippedTasks}
            </p>
            <p className="text-gray-600">Skipped</p>
          </div>
          <div className="text-center">
            <p className={`font-semibold ${
              progress.minutesAheadBehind > 0
                ? 'text-green-600'
                : progress.minutesAheadBehind < 0
                ? 'text-red-600'
                : 'text-gray-600'
            }`}>
              {progress.minutesAheadBehind > 0 ? '+' : ''}
              {progress.minutesAheadBehind}m
            </p>
            <p className="text-gray-600">
              {progress.minutesAheadBehind >= 0 ? 'Ahead' : 'Behind'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

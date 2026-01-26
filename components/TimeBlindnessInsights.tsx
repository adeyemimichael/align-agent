'use client';

import { useEffect, useState } from 'react';
import { Clock, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TimeTrackingData {
  taskTitle: string;
  estimatedMinutes: number;
  actualMinutes: number;
  difference: number;
  accuracyRate: number;
  buffer: number;
}

interface TimeBlindnessInsight {
  averageBuffer: number;
  totalTasks: number;
  underestimatedTasks: number;
  overestimatedTasks: number;
  accurateTasks: number;
  recommendation: string;
  confidence: 'low' | 'medium' | 'high';
}

interface TimeTrackingComparison {
  tasks: TimeTrackingData[];
  summary: {
    averageEstimate: number;
    averageActual: number;
    averageDifference: number;
    averageAccuracy: number;
  };
}

export default function TimeBlindnessInsights() {
  const [insights, setInsights] = useState<TimeBlindnessInsight | null>(null);
  const [comparison, setComparison] = useState<TimeTrackingComparison | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeTrackingData();
  }, []);

  const fetchTimeTrackingData = async () => {
    try {
      setLoading(true);
      
      // Fetch insights
      const insightsRes = await fetch('/api/time-tracking/insights');
      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data.insights);
      }

      // Fetch comparison data
      const comparisonRes = await fetch('/api/time-tracking/comparison');
      if (comparisonRes.ok) {
        const data = await comparisonRes.json();
        setComparison(data);
      }
    } catch (error) {
      console.error('Failed to fetch time tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getBufferIcon = (buffer: number) => {
    if (buffer > 1.2) return <TrendingUp className="w-5 h-5 text-red-600" />;
    if (buffer < 0.8) return <TrendingDown className="w-5 h-5 text-blue-600" />;
    return <Target className="w-5 h-5 text-emerald-600" />;
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!insights || insights.totalTasks === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Time Tracking Learning
            </h3>
            <p className="text-sm text-gray-700">
              Complete more tasks to see how accurate your time estimates are. The AI will learn your patterns and automatically adjust future estimates.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Insight Card */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Time Blindness Learning
              </h3>
              <p className="text-sm text-gray-600">
                Based on {insights.totalTasks} completed tasks
              </p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getConfidenceColor(insights.confidence)}`}
          >
            {insights.confidence.toUpperCase()} CONFIDENCE
          </span>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-2">
            {getBufferIcon(insights.averageBuffer)}
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {insights.averageBuffer.toFixed(2)}x
              </p>
              <p className="text-sm text-gray-600">Average Time Buffer</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-3">
            {insights.recommendation}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-red-600">
              {insights.underestimatedTasks}
            </p>
            <p className="text-xs text-gray-600 mt-1">Underestimated</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {insights.accurateTasks}
            </p>
            <p className="text-xs text-gray-600 mt-1">Accurate</p>
          </div>
          <div className="bg-white rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {insights.overestimatedTasks}
            </p>
            <p className="text-xs text-gray-600 mt-1">Overestimated</p>
          </div>
        </div>
      </div>

      {/* Recent Tasks Comparison */}
      {comparison && comparison.tasks.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Task Comparisons
          </h3>
          <div className="space-y-3">
            {comparison.tasks.slice(0, 5).map((task, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">
                    {task.taskTitle}
                  </h4>
                  {task.accuracyRate >= 80 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Estimated:</span>
                    <span className="ml-1 font-medium text-gray-700">
                      {formatMinutes(task.estimatedMinutes)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Actual:</span>
                    <span className="ml-1 font-medium text-gray-900">
                      {formatMinutes(task.actualMinutes)}
                    </span>
                  </div>
                  <div className="ml-auto">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        task.difference > 0
                          ? 'bg-red-50 text-red-700'
                          : task.difference < 0
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {task.difference > 0 ? '+' : ''}
                      {formatMinutes(Math.abs(task.difference))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          {comparison.summary && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Avg Estimated</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMinutes(Math.round(comparison.summary.averageEstimate))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Avg Actual</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatMinutes(Math.round(comparison.summary.averageActual))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Agent Learning Indicator */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm mb-1">
              🤖 Agent is Learning
            </h4>
            <p className="text-xs text-gray-700">
              The AI automatically adjusts future task estimates based on your actual completion times. 
              {insights.averageBuffer > 1.2 && ` Future estimates will be increased by ${Math.round((insights.averageBuffer - 1) * 100)}%.`}
              {insights.averageBuffer < 0.8 && ` Future estimates will be reduced by ${Math.round((1 - insights.averageBuffer) * 100)}%.`}
              {insights.averageBuffer >= 0.8 && insights.averageBuffer <= 1.2 && ' Your estimates are accurate!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

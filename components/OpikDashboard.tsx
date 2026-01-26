'use client';

import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Activity, ExternalLink } from 'lucide-react';

interface OpikStats {
  totalPlans: number;
  totalTasks: number;
  completedTasks: number;
  avgCompletionRate: number;
  avgCapacity: number;
  modeDistribution: Record<string, number>;
}

export default function OpikDashboard() {
  const [stats, setStats] = useState<OpikStats | null>(null);
  const [opikUrl, setOpikUrl] = useState<string>('');
  const [opikEnabled, setOpikEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/opik/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setOpikUrl(data.opikDashboardUrl);
        setOpikEnabled(data.opikEnabled);
      }
    } catch (error) {
      console.error('Failed to fetch Opik stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          AI Performance Metrics
        </h2>
        {/* Opik cloud link hidden - using local analytics */}
      </div>

      {!opikEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            Opik tracking is not enabled. Set OPIK_API_KEY in your environment to enable detailed AI performance tracking.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-900">Total Plans</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.totalPlans}</p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
            <p className="text-sm font-medium text-blue-900">Tasks Completed</p>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {stats.completedTasks}/{stats.totalTasks}
          </p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <p className="text-sm font-medium text-purple-900">Completion Rate</p>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {stats.avgCompletionRate}%
          </p>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-orange-600" />
            <p className="text-sm font-medium text-orange-900">Avg Capacity</p>
          </div>
          <p className="text-2xl font-bold text-orange-600">{stats.avgCapacity}%</p>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Mode Distribution</h3>
        <div className="space-y-2">
          {Object.entries(stats.modeDistribution).map(([mode, count]) => {
            const total = Object.values(stats.modeDistribution).reduce(
              (sum, c) => sum + c,
              0
            );
            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={mode} className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getModeColor(mode)} min-w-[100px]`}
                >
                  {mode.replace('_', ' ').toUpperCase()}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 min-w-[60px] text-right">
                  {count} days ({Math.round(percentage)}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {opikEnabled && (
        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600">
            AI decision tracking is enabled. Detailed traces are being logged to Opik for analysis.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            💡 To view detailed traces in Opik Cloud, log in to{' '}
            <a
              href="https://www.comet.com/opik"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 hover:underline"
            >
              comet.com/opik
            </a>
            {' '}and navigate to your workspace.
          </p>
        </div>
      )}
    </div>
  );
}

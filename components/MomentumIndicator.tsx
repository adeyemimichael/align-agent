'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Momentum Indicator Component
 * Displays current momentum state to the user
 * Requirement 20.8: Display momentum state to user with appropriate messaging
 */

interface MomentumMetrics {
  state: 'strong' | 'normal' | 'weak' | 'collapsed';
  morningStartStrength: number;
  completionAfterEarlyWinRate: number;
  afternoonFalloff: number;
  consecutiveSkips: number;
  consecutiveEarlyCompletions: number;
  confidence: 'low' | 'medium' | 'high';
}

interface MomentumDisplay {
  emoji: string;
  title: string;
  description: string;
  color: string;
}

interface MomentumData {
  metrics: MomentumMetrics;
  display: MomentumDisplay;
}

export default function MomentumIndicator() {
  const [momentum, setMomentum] = useState<MomentumData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMomentum();
  }, []);

  const fetchMomentum = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/momentum/current');

      if (!response.ok) {
        throw new Error('Failed to fetch momentum');
      }

      const data = await response.json();
      setMomentum(data);
    } catch (err) {
      console.error('Error fetching momentum:', err);
      setError('Unable to load momentum data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error || !momentum) {
    return null; // Silently fail - momentum is optional
  }

  const { metrics, display } = momentum;

  // Color mapping
  const colorClasses = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      badge: 'bg-green-100 text-green-800',
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      badge: 'bg-blue-100 text-blue-800',
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      badge: 'bg-yellow-100 text-yellow-800',
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      badge: 'bg-red-100 text-red-800',
    },
  };

  const colors = colorClasses[display.color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${colors.bg} ${colors.border} border-2 rounded-lg p-6`}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl">{display.emoji}</div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className={`text-lg font-semibold ${colors.text}`}>
              {display.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${colors.badge}`}>
              {metrics.state.toUpperCase()}
            </span>
          </div>
          <p className={`text-sm ${colors.text} mb-4`}>
            {display.description}
          </p>

          {/* Momentum Metrics */}
          {metrics.confidence !== 'low' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {metrics.morningStartStrength > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Morning Start Rate</div>
                  <div className={`text-lg font-semibold ${colors.text}`}>
                    {Math.round(metrics.morningStartStrength)}%
                  </div>
                </div>
              )}
              {metrics.completionAfterEarlyWinRate > 0 && (
                <div>
                  <div className="text-xs text-gray-600 mb-1">Win Streak Rate</div>
                  <div className={`text-lg font-semibold ${colors.text}`}>
                    {Math.round(metrics.completionAfterEarlyWinRate)}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Consecutive Stats */}
          {(metrics.consecutiveEarlyCompletions > 0 || metrics.consecutiveSkips > 0) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              {metrics.consecutiveEarlyCompletions > 0 && (
                <div className="text-sm text-gray-700">
                  🔥 <strong>{metrics.consecutiveEarlyCompletions}</strong> task
                  {metrics.consecutiveEarlyCompletions > 1 ? 's' : ''} completed early in a row!
                </div>
              )}
              {metrics.consecutiveSkips > 0 && (
                <div className="text-sm text-gray-700">
                  ⚠️ <strong>{metrics.consecutiveSkips}</strong> task
                  {metrics.consecutiveSkips > 1 ? 's' : ''} skipped recently
                </div>
              )}
            </div>
          )}

          {/* Confidence Indicator */}
          {metrics.confidence === 'low' && (
            <div className="mt-4 text-xs text-gray-500">
              💡 Complete more tasks to improve momentum tracking accuracy
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

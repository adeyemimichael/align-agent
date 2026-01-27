'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProgressAnalysis, RescheduleResult } from '@/lib/reschedule-engine';

interface RescheduleProposalProps {
  planId: string;
  analysis: ProgressAnalysis;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

/**
 * Re-scheduling Proposal UI Component
 * Requirements: 19.3, 19.4, 19.8
 */
export default function RescheduleProposal({
  planId,
  analysis,
  onAccept,
  onReject,
  onClose,
}: RescheduleProposalProps) {
  const [loading, setLoading] = useState(false);
  const [reschedule, setReschedule] = useState<RescheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load reschedule proposal
  const loadProposal = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plan/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          useAI: true,
          apply: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate reschedule');
      }

      const data = await response.json();
      setReschedule(data.reschedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Apply reschedule
  const handleAccept = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/plan/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          useAI: true,
          apply: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply reschedule');
      }

      onAccept();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Load proposal on mount
  useState(() => {
    loadProposal();
  });

  // Get status color and icon
  const getStatusDisplay = () => {
    if (analysis.rescheduleType === 'ahead') {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        icon: '🎉',
        title: 'Ahead of Schedule',
      };
    } else if (analysis.rescheduleType === 'at_risk') {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        icon: '🛑',
        title: 'Rescue Schedule Needed',
      };
    } else if (analysis.rescheduleType === 'behind') {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        icon: '⚠️',
        title: 'Behind Schedule',
      };
    }
    return {
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: '✅',
      title: 'On Track',
    };
  };

  const status = getStatusDisplay();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="w-full max-w-2xl rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`rounded-t-lg border-b ${status.borderColor} ${status.bgColor} p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{status.icon}</span>
                <div>
                  <h2 className={`text-2xl font-bold ${status.color}`}>
                    {status.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    {analysis.rescheduleReason}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">
                Analyzing your schedule...
              </span>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-600">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {reschedule && !loading && (
            <div className="space-y-6">
              {/* Progress Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysis.completedTasks}/{analysis.totalTasks}
                  </p>
                  <p className="text-xs text-gray-500">tasks completed</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Time Status</p>
                  <p className={`text-2xl font-bold ${
                    analysis.minutesAheadBehind >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analysis.minutesAheadBehind >= 0 ? '+' : ''}
                    {analysis.minutesAheadBehind}m
                  </p>
                  <p className="text-xs text-gray-500">
                    {analysis.minutesAheadBehind >= 0 ? 'ahead' : 'behind'}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Momentum</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysis.momentumState.state === 'strong' && '🚀'}
                    {analysis.momentumState.state === 'normal' && '✅'}
                    {analysis.momentumState.state === 'weak' && '⚠️'}
                    {analysis.momentumState.state === 'collapsed' && '🛑'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {analysis.momentumState.state}
                  </p>
                </div>
              </div>

              {/* AI Reasoning */}
              <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="mb-2 font-semibold text-blue-900">
                  AI Analysis
                </h3>
                <p className="text-sm text-blue-800">{reschedule.reasoning}</p>
              </div>

              {/* Scheduled Tasks */}
              {reschedule.newSchedule.scheduledTasks.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Scheduled Tasks ({reschedule.newSchedule.scheduledTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {reschedule.newSchedule.scheduledTasks.map((task) => (
                      <div
                        key={task.taskId}
                        className={`rounded-lg border p-3 ${
                          task.isProtected
                            ? 'border-green-200 bg-green-50'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {task.isProtected && (
                                <span className="text-xs font-medium text-green-600">
                                  🛡️ Protected
                                </span>
                              )}
                              <span className="text-xs text-gray-500">
                                P{task.priority}
                              </span>
                            </div>
                            <p className="font-medium text-gray-900">
                              {task.title}
                            </p>
                            <p className="text-sm text-gray-600">
                              {task.scheduledStart.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {task.scheduledEnd.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              ({task.estimatedMinutes}min)
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deferred Tasks */}
              {reschedule.newSchedule.deferredTasks.length > 0 && (
                <div>
                  <h3 className="mb-3 font-semibold text-gray-900">
                    Deferred Tasks ({reschedule.newSchedule.deferredTasks.length})
                  </h3>
                  <div className="space-y-2">
                    {reschedule.newSchedule.deferredTasks.map((task) => (
                      <div
                        key={task.taskId}
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-gray-700">
                              {task.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {task.reason}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            P{task.priority}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Summary */}
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Scheduled</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(reschedule.totalScheduledMinutes / 60)}h{' '}
                      {reschedule.totalScheduledMinutes % 60}m
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available Time</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(reschedule.availableMinutes / 60)}h{' '}
                      {reschedule.availableMinutes % 60}m
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Utilization</p>
                    <p className="text-lg font-bold text-gray-900">
                      {Math.round(
                        (reschedule.totalScheduledMinutes /
                          reschedule.availableMinutes) *
                          100
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
          <button
            onClick={onReject}
            disabled={loading}
            className="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Keep Current Plan
          </button>
          <button
            onClick={handleAccept}
            disabled={loading || !reschedule}
            className="rounded-lg bg-green-600 px-6 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Applying...' : 'Accept Reschedule'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

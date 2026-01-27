'use client';

/**
 * Check-In Modal Component
 * 
 * Displays check-in notifications and handles user responses
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CheckInNotification, CheckInResponse } from '@/lib/intelligent-checkin';

interface CheckInModalProps {
  checkIn: CheckInNotification;
  onRespond: (response: CheckInResponse) => Promise<void>;
  onClose: () => void;
}

export default function CheckInModal({ checkIn, onRespond, onClose }: CheckInModalProps) {
  const [responding, setResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  const handleResponse = async (response: CheckInResponse) => {
    setResponding(true);
    try {
      await onRespond(response);
      // Show success message briefly before closing
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to respond to check-in:', error);
      setResponseMessage('Failed to submit response. Please try again.');
      setResponding(false);
    }
  };

  const { message, context } = checkIn.message;
  const taskRef = message.taskReference;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white">
            <h2 className="text-2xl font-bold mb-2">{message.title}</h2>
            <p className="text-emerald-50">{message.body}</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Task Reference */}
            {taskRef && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {taskRef.taskTitle}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      taskRef.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : taskRef.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : taskRef.status === 'overdue'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}
                  >
                    {taskRef.status.replace('_', ' ')}
                  </span>
                </div>
                {taskRef.todoistStatus && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Todoist: {taskRef.todoistStatus === 'complete' ? '✓ Complete' : '○ Incomplete'}
                  </p>
                )}
              </div>
            )}

            {/* Context */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {context.tasksCompleted}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {context.tasksRemaining}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Remaining</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {context.minutesBehind > 0 ? `-${context.minutesBehind}` : '0'}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Min Behind</div>
              </div>
            </div>

            {/* Momentum State */}
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Momentum:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  context.momentumState === 'strong'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : context.momentumState === 'normal'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : context.momentumState === 'weak'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {context.momentumState}
              </span>
            </div>

            {/* Response Message */}
            {responseMessage && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm text-blue-800 dark:text-blue-200">{responseMessage}</p>
              </div>
            )}

            {/* Response Options */}
            {!responding && !responseMessage && (
              <div className="space-y-2">
                {message.responseOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleResponse(option.value)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${
                      option.value === 'done'
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                        : option.value === 'still_working'
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : option.value === 'stuck'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      <span className="text-sm opacity-75">{option.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {responding && (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              disabled={responding}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

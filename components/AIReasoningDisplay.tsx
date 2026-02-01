'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Clock, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

interface AIReasoningDisplayProps {
  overallReasoning: string;
  modeRecommendation?: string;
  taskReasonings?: Array<{
    taskTitle: string;
    reasoning: string;
  }>;
  // Adaptive insights
  adaptiveInsights?: {
    timeBlindnessApplied?: string;
    productivityWindowsUsed?: string;
    skipRiskMitigation?: string;
    momentumConsideration?: string;
  };
  // Additional context for display
  rescheduleReason?: string;
  interventionType?: 'supportive_checkin' | 'rescue_schedule' | 'momentum_boost' | 'none';
}

export default function AIReasoningDisplay({
  overallReasoning,
  modeRecommendation,
  taskReasonings,
  adaptiveInsights,
  rescheduleReason,
  interventionType,
}: AIReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasAdaptiveInsights = adaptiveInsights && (
    adaptiveInsights.timeBlindnessApplied ||
    adaptiveInsights.productivityWindowsUsed ||
    adaptiveInsights.skipRiskMitigation ||
    adaptiveInsights.momentumConsideration
  );

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">AI Planning Insights</h3>
          {hasAdaptiveInsights && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              Adaptive Learning Active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Reschedule Reason (if applicable) */}
          {rescheduleReason && (
            <div className={`rounded-md p-3 border ${
              interventionType === 'rescue_schedule'
                ? 'bg-amber-50 border-amber-200'
                : interventionType === 'momentum_boost'
                ? 'bg-green-50 border-green-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start gap-2">
                {interventionType === 'rescue_schedule' && (
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                )}
                {interventionType === 'momentum_boost' && (
                  <Zap className="w-4 h-4 text-green-600 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-1">
                    {interventionType === 'rescue_schedule' && 'Rescue Schedule Activated'}
                    {interventionType === 'momentum_boost' && 'Momentum Boost'}
                    {interventionType === 'supportive_checkin' && 'Schedule Adjustment'}
                    {!interventionType && 'Re-Schedule Reason'}
                  </h4>
                  <p className="text-sm text-gray-600">{rescheduleReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Overall Reasoning */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Planning Strategy
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {overallReasoning}
            </p>
          </div>

          {/* Adaptive Insights Section */}
          {hasAdaptiveInsights && (
            <div className="bg-white rounded-lg p-4 border border-emerald-200">
              <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Adaptive Learning Applied
              </h4>
              <div className="space-y-3">
                {/* Time Blindness */}
                {adaptiveInsights?.timeBlindnessApplied && (
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Time Blindness Compensation</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {adaptiveInsights.timeBlindnessApplied}
                      </p>
                    </div>
                  </div>
                )}

                {/* Productivity Windows */}
                {adaptiveInsights?.productivityWindowsUsed && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Productivity Windows</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {adaptiveInsights.productivityWindowsUsed}
                      </p>
                    </div>
                  </div>
                )}

                {/* Skip Risk Mitigation */}
                {adaptiveInsights?.skipRiskMitigation && (
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Skip Risk Mitigation</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {adaptiveInsights.skipRiskMitigation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Momentum Consideration */}
                {adaptiveInsights?.momentumConsideration && (
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-gray-700">Momentum State</p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {adaptiveInsights.momentumConsideration}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode Recommendation */}
          {modeRecommendation && (
            <div className="bg-white rounded-md p-3 border border-emerald-100">
              <h4 className="text-sm font-medium text-gray-700 mb-1">
                Capacity Recommendation
              </h4>
              <p className="text-sm text-gray-600">{modeRecommendation}</p>
            </div>
          )}

          {/* Task-specific Reasoning */}
          {taskReasonings && taskReasonings.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Task Scheduling Rationale
              </h4>
              <div className="space-y-2">
                {taskReasonings.map((task, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-md p-3 border border-emerald-100"
                  >
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      {task.taskTitle}
                    </p>
                    <p className="text-xs text-gray-600">{task.reasoning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

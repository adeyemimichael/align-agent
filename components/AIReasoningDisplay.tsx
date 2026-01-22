'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

interface AIReasoningDisplayProps {
  overallReasoning: string;
  modeRecommendation?: string;
  taskReasonings?: Array<{
    taskTitle: string;
    reasoning: string;
  }>;
}

export default function AIReasoningDisplay({
  overallReasoning,
  modeRecommendation,
  taskReasonings,
}: AIReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4 mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">AI Planning Insights</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Overall Reasoning */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Planning Strategy
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {overallReasoning}
            </p>
          </div>

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

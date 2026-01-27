'use client';

import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface SkipRiskWarningProps {
  riskLevel: 'low' | 'medium' | 'high';
  riskPercentage: number;
  reasoning?: string;
  interventionMessage?: string;
  showDetails?: boolean;
}

/**
 * Skip Risk Warning Component
 * Displays skip risk level and intervention suggestions
 * Requirements: 17.7
 */
export default function SkipRiskWarning({
  riskLevel,
  riskPercentage,
  reasoning,
  interventionMessage,
  showDetails = true,
}: SkipRiskWarningProps) {
  // Don't show anything for low risk unless details are requested
  if (riskLevel === 'low' && !showDetails) {
    return null;
  }

  const getRiskColor = () => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  const getRiskIcon = () => {
    switch (riskLevel) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-green-600" />;
    }
  };

  const getRiskLabel = () => {
    switch (riskLevel) {
      case 'high':
        return 'High Skip Risk';
      case 'medium':
        return 'Medium Skip Risk';
      case 'low':
        return 'Low Skip Risk';
    }
  };

  return (
    <div className={`rounded-lg border p-3 ${getRiskColor()}`}>
      <div className="flex items-start gap-2">
        <div className="flex-shrink-0 mt-0.5">{getRiskIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-sm">{getRiskLabel()}</span>
            <span className="text-xs font-semibold">{riskPercentage}%</span>
          </div>
          
          {reasoning && showDetails && (
            <p className="text-xs opacity-90 mb-2">{reasoning}</p>
          )}
          
          {interventionMessage && (
            <div className="mt-2 pt-2 border-t border-current/20">
              <p className="text-xs font-medium">{interventionMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact Skip Risk Badge
 * For displaying in task lists
 */
export function SkipRiskBadge({
  riskLevel,
  riskPercentage,
}: {
  riskLevel: 'low' | 'medium' | 'high';
  riskPercentage: number;
}) {
  if (riskLevel === 'low') {
    return null; // Don't show badge for low risk
  }

  const getBadgeColor = () => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor()}`}
      title={`${riskPercentage}% skip risk`}
    >
      <AlertTriangle className="w-3 h-3" />
      {riskLevel === 'high' ? 'High Risk' : 'Medium Risk'}
    </span>
  );
}

/**
 * Skip Risk Progress Bar
 * Visual representation of skip risk percentage
 */
export function SkipRiskProgressBar({
  riskPercentage,
}: {
  riskPercentage: number;
}) {
  const getBarColor = () => {
    if (riskPercentage >= 60) return 'bg-red-500';
    if (riskPercentage >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">Skip Risk</span>
        <span className="text-xs font-semibold text-gray-900">
          {riskPercentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getBarColor()}`}
          style={{ width: `${Math.min(100, riskPercentage)}%` }}
        />
      </div>
    </div>
  );
}

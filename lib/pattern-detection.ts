/**
 * Pattern Detection for Historical Capacity Analysis
 * Analyzes 7-day check-in history to detect trends and patterns
 */

export interface CheckInHistory {
  date: Date;
  capacityScore: number;
  energy: number;
  sleep: number;
  stress: number;
  mood: string;
}

export interface PatternAnalysis {
  trend: 'declining' | 'improving' | 'stable';
  averageCapacity: number;
  recommendation: string;
  details: {
    decliningDays: number;
    highCapacityDays: number;
    lowCapacityDays: number;
    consistencyScore: number; // 0-100, how consistent the capacity is
  };
}

/**
 * Analyzes 7-day history for capacity patterns
 * Requirements: 7.2, 7.3, 7.4
 */
export function detectCapacityPatterns(
  history: CheckInHistory[]
): PatternAnalysis {
  if (history.length === 0) {
    return {
      trend: 'stable',
      averageCapacity: 50,
      recommendation: 'Complete more check-ins to enable pattern detection.',
      details: {
        decliningDays: 0,
        highCapacityDays: 0,
        lowCapacityDays: 0,
        consistencyScore: 0,
      },
    };
  }

  // Sort by date (oldest first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate average capacity
  const averageCapacity =
    sortedHistory.reduce((sum, h) => sum + h.capacityScore, 0) /
    sortedHistory.length;

  // Count days below 50 (low capacity)
  const lowCapacityDays = sortedHistory.filter(
    (h) => h.capacityScore < 50
  ).length;

  // Count days above 70 (high capacity)
  const highCapacityDays = sortedHistory.filter(
    (h) => h.capacityScore >= 70
  ).length;

  // Detect declining pattern: 3+ consecutive days below 50
  let decliningDays = 0;
  let maxDecliningStreak = 0;
  let currentStreak = 0;

  for (const entry of sortedHistory) {
    if (entry.capacityScore < 50) {
      currentStreak++;
      decliningDays++;
      maxDecliningStreak = Math.max(maxDecliningStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Calculate consistency score (lower variance = higher consistency)
  const variance =
    sortedHistory.reduce(
      (sum, h) => sum + Math.pow(h.capacityScore - averageCapacity, 2),
      0
    ) / sortedHistory.length;
  const standardDeviation = Math.sqrt(variance);
  const consistencyScore = Math.max(0, 100 - standardDeviation * 2);

  // Determine trend
  let trend: 'declining' | 'improving' | 'stable' = 'stable';

  if (maxDecliningStreak >= 3) {
    trend = 'declining';
  } else if (highCapacityDays >= 3) {
    trend = 'improving';
  } else {
    // Check if recent days are better than earlier days
    const recentAvg =
      sortedHistory
        .slice(-3)
        .reduce((sum, h) => sum + h.capacityScore, 0) / Math.min(3, sortedHistory.length);
    const earlierAvg =
      sortedHistory
        .slice(0, 3)
        .reduce((sum, h) => sum + h.capacityScore, 0) / Math.min(3, sortedHistory.length);

    if (recentAvg > earlierAvg + 10) {
      trend = 'improving';
    } else if (recentAvg < earlierAvg - 10) {
      trend = 'declining';
    }
  }

  // Generate recommendation
  const recommendation = generateRecommendation(
    trend,
    averageCapacity,
    lowCapacityDays,
    highCapacityDays,
    consistencyScore
  );

  return {
    trend,
    averageCapacity,
    recommendation,
    details: {
      decliningDays,
      highCapacityDays,
      lowCapacityDays,
      consistencyScore,
    },
  };
}

function generateRecommendation(
  trend: 'declining' | 'improving' | 'stable',
  averageCapacity: number,
  lowCapacityDays: number,
  highCapacityDays: number,
  consistencyScore: number
): string {
  if (trend === 'declining') {
    return `Your capacity has been declining. Consider reducing workload and prioritizing recovery activities. You've had ${lowCapacityDays} low-capacity days recently.`;
  }

  if (trend === 'improving') {
    return `Great progress! Your capacity is improving. You've had ${highCapacityDays} high-capacity days. Keep up the good habits!`;
  }

  // Stable trend
  if (averageCapacity < 40) {
    return 'Your capacity is consistently low. Focus on recovery mode tasks and consider what might be affecting your energy levels.';
  }

  if (averageCapacity >= 70) {
    return 'Your capacity is consistently high! This is a great time to tackle challenging deep work tasks.';
  }

  if (consistencyScore < 50) {
    return 'Your capacity varies significantly day-to-day. Try to identify patterns in what affects your energy, sleep, and stress levels.';
  }

  return 'Your capacity is stable. Continue with balanced mode tasks and maintain your current habits.';
}

/**
 * Predicts tomorrow's capacity based on historical patterns
 * Requirements: 7.5, 7.6
 */
export function predictCapacity(history: CheckInHistory[]): {
  predicted: number;
  confidence: 'low' | 'medium' | 'high';
} {
  if (history.length < 3) {
    return { predicted: 50, confidence: 'low' };
  }

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Use weighted average (recent days have more weight)
  const weights = [0.4, 0.3, 0.2, 0.1]; // Most recent to oldest
  let weightedSum = 0;
  let totalWeight = 0;

  for (let i = 0; i < Math.min(4, sortedHistory.length); i++) {
    const weight = weights[i] || 0.05;
    weightedSum += sortedHistory[i].capacityScore * weight;
    totalWeight += weight;
  }

  const predicted = Math.round(weightedSum / totalWeight);

  // Determine confidence based on consistency
  const recentScores = sortedHistory.slice(0, 3).map((h) => h.capacityScore);
  const variance =
    recentScores.reduce((sum, score) => {
      const diff = score - predicted;
      return sum + diff * diff;
    }, 0) / recentScores.length;

  const standardDeviation = Math.sqrt(variance);

  let confidence: 'low' | 'medium' | 'high';
  if (standardDeviation < 10) {
    confidence = 'high';
  } else if (standardDeviation < 20) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return { predicted, confidence };
}

/**
 * Analyzes specific factors affecting capacity
 * Requirements: 7.4
 */
export function analyzeCapacityFactors(history: CheckInHistory[]): {
  primaryFactor: 'energy' | 'sleep' | 'stress' | 'mood';
  insight: string;
} {
  if (history.length < 3) {
    return {
      primaryFactor: 'energy',
      insight: 'Not enough data to analyze factors yet.',
    };
  }

  // Calculate correlations between factors and capacity
  const avgCapacity =
    history.reduce((sum, h) => sum + h.capacityScore, 0) / history.length;
  const avgEnergy =
    history.reduce((sum, h) => sum + h.energy, 0) / history.length;
  const avgSleep =
    history.reduce((sum, h) => sum + h.sleep, 0) / history.length;
  const avgStress =
    history.reduce((sum, h) => sum + h.stress, 0) / history.length;

  // Find which factor varies most with capacity
  const energyVariance = Math.abs(
    history.reduce(
      (sum, h) =>
        sum + (h.energy - avgEnergy) * (h.capacityScore - avgCapacity),
      0
    )
  );
  const sleepVariance = Math.abs(
    history.reduce(
      (sum, h) =>
        sum + (h.sleep - avgSleep) * (h.capacityScore - avgCapacity),
      0
    )
  );
  const stressVariance = Math.abs(
    history.reduce(
      (sum, h) =>
        sum + (h.stress - avgStress) * (h.capacityScore - avgCapacity),
      0
    )
  );

  const variances = {
    energy: energyVariance,
    sleep: sleepVariance,
    stress: stressVariance,
    mood: 0, // Mood is categorical, harder to correlate
  };

  const primaryFactor = (
    Object.keys(variances) as Array<keyof typeof variances>
  ).reduce((a, b) => (variances[a] > variances[b] ? a : b));

  const insights = {
    energy: `Your energy levels have the strongest impact on your capacity. Focus on activities that boost your energy.`,
    sleep: `Sleep quality significantly affects your capacity. Prioritize getting consistent, quality sleep.`,
    stress: `Stress levels are your primary capacity factor. Consider stress management techniques.`,
    mood: `Your mood patterns affect your capacity. Focus on activities that improve your emotional well-being.`,
  };

  return {
    primaryFactor,
    insight: insights[primaryFactor],
  };
}

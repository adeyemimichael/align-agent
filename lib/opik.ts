/**
 * Opik Tracking Integration
 * Tracks AI model performance and decisions for demo purposes
 * Requirements: 13.1, 13.2, 13.3
 */

import { Opik } from 'opik';

let opikClient: Opik | null = null;

/**
 * Initialize Opik client
 * Requirements: 13.1
 */
export function getOpikClient(): Opik | null {
  // Only initialize if API key is provided
  if (!process.env.OPIK_API_KEY) {
    console.warn('OPIK_API_KEY not set - tracking disabled');
    return null;
  }

  if (!opikClient) {
    try {
      opikClient = new Opik({
        apiKey: process.env.OPIK_API_KEY,
        projectName: process.env.OPIK_PROJECT_NAME || 'adaptive-productivity-agent',
      });
      console.log('Opik client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Opik client:', error);
      return null;
    }
  }

  return opikClient;
}

/**
 * Log Gemini AI request and response
 * Requirements: 13.1, 13.2
 */
export async function logAIRequest(data: {
  userId: string;
  capacityScore: number;
  mode: string;
  taskCount: number;
  prompt: string;
  response: string;
  reasoning: string;
  duration: number;
  timestamp: Date;
}): Promise<void> {
  const client = getOpikClient();
  if (!client) return;

  try {
    await client.log({
      projectName: 'adaptive-productivity-agent',
      name: 'gemini_plan_generation',
      input: {
        userId: data.userId,
        capacityScore: data.capacityScore,
        mode: data.mode,
        taskCount: data.taskCount,
        prompt: data.prompt,
      },
      output: {
        response: data.response,
        reasoning: data.reasoning,
      },
      metadata: {
        model: 'gemini-1.5-flash',
        duration_ms: data.duration,
        timestamp: data.timestamp.toISOString(),
      },
      tags: ['ai-planning', 'gemini', data.mode],
    });

    console.log('AI request logged to Opik');
  } catch (error) {
    console.error('Failed to log AI request to Opik:', error);
  }
}

/**
 * Track capacity score accuracy
 * Requirements: 13.3
 */
export async function trackCapacityAccuracy(data: {
  userId: string;
  predictedCapacity: number;
  actualCompletionRate: number;
  date: Date;
  mode: string;
}): Promise<void> {
  const client = getOpikClient();
  if (!client) return;

  try {
    // Calculate accuracy score (how well capacity predicted completion)
    const expectedCompletion = data.predictedCapacity;
    const actualCompletion = data.actualCompletionRate;
    const accuracyScore = 100 - Math.abs(expectedCompletion - actualCompletion);

    await client.log({
      projectName: 'adaptive-productivity-agent',
      name: 'capacity_accuracy',
      input: {
        userId: data.userId,
        predictedCapacity: data.predictedCapacity,
        mode: data.mode,
        date: data.date.toISOString(),
      },
      output: {
        actualCompletionRate: data.actualCompletionRate,
        accuracyScore,
      },
      metadata: {
        error: Math.abs(expectedCompletion - actualCompletion),
        timestamp: new Date().toISOString(),
      },
      tags: ['capacity-tracking', data.mode],
      feedbackScores: [
        {
          name: 'accuracy',
          value: accuracyScore / 100,
          reason: `Predicted ${expectedCompletion}%, actual ${actualCompletion}%`,
        },
      ],
    });

    console.log('Capacity accuracy tracked in Opik');
  } catch (error) {
    console.error('Failed to track capacity accuracy in Opik:', error);
  }
}

/**
 * Track reasoning chain quality
 * Requirements: 13.2
 */
export async function trackReasoningQuality(data: {
  userId: string;
  reasoning: string;
  taskCount: number;
  userFeedback?: 'helpful' | 'not_helpful';
  completionRate?: number;
}): Promise<void> {
  const client = getOpikClient();
  if (!client) return;

  try {
    const qualityScore = calculateReasoningQuality(data.reasoning);

    await client.log({
      projectName: 'adaptive-productivity-agent',
      name: 'reasoning_quality',
      input: {
        userId: data.userId,
        taskCount: data.taskCount,
        reasoningLength: data.reasoning.length,
      },
      output: {
        reasoning: data.reasoning,
        qualityScore,
      },
      metadata: {
        userFeedback: data.userFeedback,
        completionRate: data.completionRate,
        timestamp: new Date().toISOString(),
      },
      tags: ['reasoning-quality', 'gemini'],
      feedbackScores: data.userFeedback
        ? [
            {
              name: 'user_satisfaction',
              value: data.userFeedback === 'helpful' ? 1 : 0,
            },
          ]
        : undefined,
    });

    console.log('Reasoning quality tracked in Opik');
  } catch (error) {
    console.error('Failed to track reasoning quality in Opik:', error);
  }
}

/**
 * Calculate reasoning quality score based on heuristics
 */
function calculateReasoningQuality(reasoning: string): number {
  let score = 50; // Base score

  // Check for key elements of good reasoning
  if (reasoning.includes('capacity')) score += 10;
  if (reasoning.includes('priority') || reasoning.includes('prioritize'))
    score += 10;
  if (reasoning.includes('energy') || reasoning.includes('focus')) score += 10;
  if (reasoning.includes('balance') || reasoning.includes('recovery'))
    score += 10;
  if (reasoning.length > 100) score += 10; // Detailed explanation

  return Math.min(100, score);
}

/**
 * Get Opik dashboard URL for viewing metrics
 * Requirements: 13.4
 */
export function getOpikDashboardUrl(): string {
  const projectName =
    process.env.OPIK_PROJECT_NAME || 'adaptive-productivity-agent';
  return `https://www.comet.com/opik/projects/${projectName}`;
}

/**
 * Export Opik data for analysis
 * Requirements: 13.5
 */
export async function exportOpikData(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<any[]> {
  const client = getOpikClient();
  if (!client) {
    console.warn('Opik client not available for export');
    return [];
  }

  try {
    // In a real implementation, this would query Opik's API
    // For now, return a placeholder
    console.log('Exporting Opik data for user:', userId);
    return [];
  } catch (error) {
    console.error('Failed to export Opik data:', error);
    return [];
  }
}

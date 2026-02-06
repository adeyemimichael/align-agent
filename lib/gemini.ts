import { GoogleGenAI } from '@google/genai';
import { AIServiceError } from './errors';
import type { MomentumState } from './momentum-tracker';
import type { SkipRiskLevel } from './skip-risk';

// Dynamic imports for Opik to avoid build issues
let trackGemini: any = null;
let getOpikClient: any = null;
let logAIRequest: any = null;
let trackReasoningQuality: any = null;

async function loadOpikFunctions() {
  if (!getOpikClient) {
    try {
      const opikModule = await import('./opik');
      getOpikClient = opikModule.getOpikClient;
      logAIRequest = opikModule.logAIRequest;
      trackReasoningQuality = opikModule.trackReasoningQuality;
    } catch (error) {
      console.warn('Opik module not available:', error);
    }
  }
}

async function loadTrackGemini() {
  if (!trackGemini) {
    try {
      const opikGeminiModule = await import('opik-gemini');
      trackGemini = opikGeminiModule.trackGemini;
    } catch (error) {
      console.warn('opik-gemini module not available:', error);
    }
  }
  return trackGemini;
}

export interface PlanningContext {
  capacityScore: number;
  mode: 'recovery' | 'balanced' | 'deep_work';
  tasks: Array<{
    id: string;
    title: string;
    description?: string;
    priority: number;
    estimatedMinutes: number;
    dueDate?: Date;
    project?: string;
  }>;
  history: Array<{
    date: Date;
    capacityScore: number;
    completedTasks: number;
    totalTasks: number;
  }>;
  goals?: Array<{
    title: string;
    category: string;
  }>;
  // Adaptive features context
  adaptiveContext?: {
    // Time blindness compensation
    timeBlindness?: {
      averageBuffer: number;
      confidence: 'low' | 'medium' | 'high';
      recommendation: string;
    };
    // Productivity windows
    productivityWindows?: {
      peakHours: Array<{ hour: number; completionRate: number; label: string }>;
      lowHours: Array<{ hour: number; completionRate: number; label: string }>;
      recommendation: string;
    };
    // Skip risk prediction
    skipRisk?: {
      overallLevel: SkipRiskLevel;
      taskRisks: Array<{
        taskId: string;
        riskLevel: SkipRiskLevel;
        riskPercentage: number;
        reasoning: string;
      }>;
    };
    // Momentum tracking
    momentum?: {
      state: MomentumState;
      morningStartStrength: number;
      completionAfterEarlyWinRate: number;
      consecutiveSkips: number;
      consecutiveEarlyCompletions: number;
    };
    // Current progress (for re-scheduling)
    currentProgress?: {
      minutesAheadBehind: number;
      completedTasks: number;
      skippedTasks: number;
      remainingTasks: number;
    };
  };
}

export interface PlanningResponse {
  orderedTasks: Array<{
    taskId: string;
    scheduledStart: Date;
    scheduledEnd: Date;
    reasoning: string;
  }>;
  overallReasoning: string;
  modeRecommendation?: string;
  // Adaptive insights from AI
  adaptiveInsights?: {
    timeBlindnessApplied?: string;
    productivityWindowsUsed?: string;
    skipRiskMitigation?: string;
    momentumConsideration?: string;
  };
}

/**
 * Gemini AI client for intelligent planning with Opik tracking
 */
export class GeminiClient {
  private genAI: any; // Tracked Gemini client
  private model: any;
  private isTracked: boolean = false;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new AIServiceError('GEMINI_API_KEY not configured');
    }

    // Initialize Google GenAI client
    const originalGenAI = new GoogleGenAI({
      apiKey: key,
    });

    // Store original client (will be wrapped with tracking in async init)
    this.genAI = originalGenAI;
    this.model = this.genAI.models;

    // Initialize tracking asynchronously
    this.initializeTracking();
  }

  /**
   * Initialize Opik tracking (async)
   */
  private async initializeTracking() {
    try {
      await loadOpikFunctions();
      const opikClient = getOpikClient ? await getOpikClient() : null;
      const trackGeminiFunc = await loadTrackGemini();

      if (opikClient && trackGeminiFunc) {
        this.genAI = trackGeminiFunc(this.genAI, {
          client: opikClient,
          traceMetadata: {
            tags: ['adaptive-productivity-agent', 'gemini', 'production'],
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
            component: 'ai-planning',
          },
          generationName: 'AdaptiveProductivityAgent',
        });
        this.model = this.genAI.models;
        this.isTracked = true;
        console.log('✅ Gemini client wrapped with Opik tracking');
      } else {
        console.warn('⚠️ Opik tracking disabled - OPIK_API_KEY not set or opik-gemini not available');
      }
    } catch (error) {
      console.warn('Failed to initialize Opik tracking:', error);
    }
  }

  /**
   * Generate an intelligent daily plan based on capacity and context
   */
  async generateDailyPlan(
    context: PlanningContext,
    startTime: Date = new Date(),
    userId?: string
  ): Promise<PlanningResponse> {
    const prompt = this.buildPlanningPrompt(context, startTime);
    const startTimestamp = Date.now();

    try {
      const result = await this.model.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const text = result.text;
      const duration = Date.now() - startTimestamp;

      const planningResponse = this.parsePlanningResponse(text, context.tasks, startTime);

      // Track AI request in Opik (if userId provided)
      if (userId && logAIRequest) {
        await logAIRequest({
          userId,
          capacityScore: context.capacityScore,
          mode: context.mode,
          taskCount: context.tasks.length,
          prompt,
          response: text,
          reasoning: planningResponse.overallReasoning,
          duration,
          timestamp: new Date(),
        }).catch((err: any) => console.error('Opik logging failed:', err));

        // Track reasoning quality
        if (trackReasoningQuality) {
          await trackReasoningQuality({
            userId,
            reasoning: planningResponse.overallReasoning,
            taskCount: context.tasks.length,
          }).catch((err: any) => console.error('Opik reasoning tracking failed:', err));
        }
      }

      // Flush Opik traces
      await this.genAI.flush?.();

      return planningResponse;
    } catch (error) {
      console.error('Gemini AI error:', error);
      throw new AIServiceError(
        error instanceof Error ? error.message : 'Unknown error',
        { operation: 'generateDailyPlan', context }
      );
    }
  }

  /**
   * Build the prompt for daily planning with full adaptive context
   */
  private buildPlanningPrompt(context: PlanningContext, startTime: Date): string {
    const { capacityScore, mode, tasks, history, goals, adaptiveContext } = context;

    // Format history
    const historyText = history
      .map(
        (h) =>
          `- ${h.date.toLocaleDateString()}: Capacity ${h.capacityScore.toFixed(0)}, Completed ${h.completedTasks}/${h.totalTasks} tasks`
      )
      .join('\n');

    // Format tasks
    const tasksText = tasks
      .map(
        (t) =>
          `- [${t.id}] ${t.title} (Priority: ${t.priority}, Est: ${t.estimatedMinutes}min${t.dueDate ? `, Due: ${t.dueDate.toLocaleDateString()}` : ''})`
      )
      .join('\n');

    // Format goals
    const goalsText = goals
      ? goals.map((g) => `- ${g.title} (${g.category})`).join('\n')
      : 'No goals set';

    // Build adaptive context sections
    let adaptiveContextText = '';

    // Time blindness compensation
    if (adaptiveContext?.timeBlindness) {
      const tb = adaptiveContext.timeBlindness;
      adaptiveContextText += `\n**Time Blindness Compensation:**
- Average Buffer: ${tb.averageBuffer.toFixed(2)}x (user typically takes ${Math.round((tb.averageBuffer - 1) * 100)}% ${tb.averageBuffer > 1 ? 'longer' : 'less time'} than estimated)
- Confidence: ${tb.confidence}
- Recommendation: ${tb.recommendation}
- **IMPORTANT**: Apply this buffer to all time estimates when scheduling tasks`;
    }

    // Productivity windows
    if (adaptiveContext?.productivityWindows) {
      const pw = adaptiveContext.productivityWindows;
      const peakHoursText = pw.peakHours
        .map((h) => `  - ${h.label}: ${Math.round(h.completionRate)}% completion rate`)
        .join('\n');
      const lowHoursText = pw.lowHours
        .map((h) => `  - ${h.label}: ${Math.round(h.completionRate)}% completion rate`)
        .join('\n');

      adaptiveContextText += `\n\n**Productivity Windows:**
Peak Hours (schedule high-priority tasks here):
${peakHoursText}

Low Hours (avoid scheduling demanding tasks):
${lowHoursText}

Recommendation: ${pw.recommendation}`;
    }

    // Skip risk prediction
    if (adaptiveContext?.skipRisk) {
      const sr = adaptiveContext.skipRisk;
      adaptiveContextText += `\n\n**Skip Risk Analysis:**
- Overall Risk Level: ${sr.overallLevel.toUpperCase()}
- Task-Specific Risks:`;

      sr.taskRisks.forEach((risk) => {
        const task = tasks.find((t) => t.id === risk.taskId);
        if (task) {
          adaptiveContextText += `\n  - "${task.title}": ${risk.riskLevel.toUpperCase()} (${risk.riskPercentage}%) - ${risk.reasoning}`;
        }
      });

      adaptiveContextText += `\n- **IMPORTANT**: Consider skip risk when scheduling. High-risk tasks may need intervention or re-scheduling.`;
    }

    // Momentum tracking
    if (adaptiveContext?.momentum) {
      const m = adaptiveContext.momentum;
      let momentumAdvice = '';

      if (m.state === 'strong') {
        momentumAdvice = 'User has strong momentum! Consider suggesting additional tasks or pulling forward tomorrow\'s work.';
      } else if (m.state === 'weak') {
        momentumAdvice = 'Momentum is weak. Add buffer time and suggest breaks.';
      } else if (m.state === 'collapsed') {
        momentumAdvice = 'Momentum has collapsed! Simplify the plan drastically - focus on just 1-2 achievable wins.';
      } else {
        momentumAdvice = 'Normal momentum. Proceed with standard planning.';
      }

      adaptiveContextText += `\n\n**Momentum State:**
- Current State: ${m.state.toUpperCase()}
- Morning Start Strength: ${Math.round(m.morningStartStrength)}%
- Completion After Early Win Rate: ${Math.round(m.completionAfterEarlyWinRate)}%
- Consecutive Skips: ${m.consecutiveSkips}
- Consecutive Early Completions: ${m.consecutiveEarlyCompletions}
- **AI Guidance**: ${momentumAdvice}`;
    }

    // Current progress (for re-scheduling scenarios)
    if (adaptiveContext?.currentProgress) {
      const cp = adaptiveContext.currentProgress;
      const status = cp.minutesAheadBehind > 0 ? 'AHEAD' : cp.minutesAheadBehind < 0 ? 'BEHIND' : 'ON TRACK';

      adaptiveContextText += `\n\n**Current Progress (Real-Time):**
- Status: ${status} by ${Math.abs(cp.minutesAheadBehind)} minutes
- Completed: ${cp.completedTasks} tasks
- Skipped: ${cp.skippedTasks} tasks
- Remaining: ${cp.remainingTasks} tasks
- **IMPORTANT**: This is a mid-day re-schedule. Adjust the plan based on actual progress.`;
    }

    const prompt = `You are an AI productivity assistant helping a user plan their day based on their current capacity, historical patterns, and real-time adaptive data.

**Current Context:**
- Date: ${startTime.toLocaleDateString()}
- Time: ${startTime.toLocaleTimeString()}
- Capacity Score: ${capacityScore.toFixed(0)}/100
- Mode: ${mode.toUpperCase()}

**Mode Guidelines:**
- RECOVERY (score < 40): Prioritize rest, light tasks, and self-care. Limit work to 2-3 hours max.
- BALANCED (score 40-69): Mix of focused work and breaks. Standard 4-6 hour workday.
- DEEP_WORK (score ≥ 70): Tackle demanding tasks. Can handle 6-8 hours of focused work.

**Recent History (Last 7 Days):**
${historyText || 'No history available'}

**User's Goals:**
${goalsText}

**Available Tasks:**
${tasksText}
${adaptiveContextText}

**Instructions:**
1. Analyze the user's capacity score and recent patterns
2. **CRITICAL**: Apply time blindness buffer to ALL task estimates
3. **CRITICAL**: Schedule high-priority tasks during peak productivity windows
4. **CRITICAL**: Consider skip risk - high-risk tasks may need intervention
5. **CRITICAL**: Respect momentum state - adjust plan complexity accordingly
6. Consider their goals and how today's work contributes to them
7. Prioritize tasks based on:
   - Current capacity and mode
   - Task priority and due dates
   - Recent completion patterns
   - Goal alignment
   - Productivity windows
   - Skip risk levels
   - Momentum state
8. Schedule tasks with realistic time blocks (including learned buffers)
9. Include breaks and recovery time based on capacity
10. Provide clear reasoning for your decisions, referencing adaptive data

**Output Format (JSON):**
{
  "overallReasoning": "Brief explanation of your planning strategy for today, referencing adaptive insights",
  "modeRecommendation": "Any suggestions about the current mode or capacity",
  "adaptiveInsights": {
    "timeBlindnessApplied": "How you applied time blindness buffers",
    "productivityWindowsUsed": "How you used productivity windows",
    "skipRiskMitigation": "How you addressed skip risk",
    "momentumConsideration": "How momentum state influenced the plan"
  },
  "tasks": [
    {
      "taskId": "task-id",
      "startTime": "HH:MM",
      "duration": minutes (with buffer applied),
      "reasoning": "Why this task at this time, referencing adaptive data"
    }
  ]
}

Generate the plan now:`;

    return prompt;
  }

  /**
   * Parse Gemini's response into structured format with adaptive insights
   */
  private parsePlanningResponse(
    text: string,
    tasks: PlanningContext['tasks'],
    startTime: Date
  ): PlanningResponse {
    try {
      // Extract JSON from response (Gemini sometimes wraps it in markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Convert to our format
      const orderedTasks = parsed.tasks.map((t: any) => {
        const task = tasks.find((task) => task.id === t.taskId);
        if (!task) {
          throw new Error(`Task ${t.taskId} not found`);
        }

        // Parse start time
        const [hours, minutes] = t.startTime.split(':').map(Number);
        const scheduledStart = new Date(startTime);
        scheduledStart.setHours(hours, minutes, 0, 0);

        // Calculate end time
        const scheduledEnd = new Date(scheduledStart);
        scheduledEnd.setMinutes(scheduledEnd.getMinutes() + t.duration);

        return {
          taskId: t.taskId,
          scheduledStart,
          scheduledEnd,
          reasoning: t.reasoning,
        };
      });

      return {
        orderedTasks,
        overallReasoning: parsed.overallReasoning,
        modeRecommendation: parsed.modeRecommendation,
        adaptiveInsights: parsed.adaptiveInsights || undefined,
      };
    } catch (error) {
      console.error('Failed to parse Gemini response:', error);
      console.error('Raw response:', text);

      // Fallback: simple priority-based ordering
      return this.fallbackPlanning(tasks, startTime);
    }
  }

  /**
   * Fallback planning when AI fails
   */
  private fallbackPlanning(
    tasks: PlanningContext['tasks'],
    startTime: Date
  ): PlanningResponse {
    console.warn('Using fallback planning due to AI parsing error');

    // Sort by priority and due date
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority; // Lower number = higher priority
      }
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

    // Schedule tasks sequentially
    let currentTime = new Date(startTime);
    const orderedTasks = sortedTasks.map((task) => {
      const scheduledStart = new Date(currentTime);
      const scheduledEnd = new Date(currentTime);
      scheduledEnd.setMinutes(scheduledEnd.getMinutes() + task.estimatedMinutes);

      currentTime = new Date(scheduledEnd);
      currentTime.setMinutes(currentTime.getMinutes() + 15); // 15 min break

      return {
        taskId: task.id,
        scheduledStart,
        scheduledEnd,
        reasoning: `Priority ${task.priority} task${task.dueDate ? ' with upcoming due date' : ''}`,
      };
    });

    return {
      orderedTasks,
      overallReasoning:
        'Using simple priority-based scheduling (AI planning temporarily unavailable)',
      modeRecommendation: undefined,
    };
  }

  /**
   * AI-DRIVEN SCHEDULING: Let AI make the actual scheduling decisions with full adaptive context
   * This is the REAL AI agent behavior with time blindness, productivity windows, skip risk, and momentum
   */
  async scheduleTasksWithAI(context: {
    userId: string;
    tasks: Array<{
      id: string;
      title: string;
      description?: string;
      priority: number;
      estimatedMinutes: number;
      dueDate?: Date;
      project?: string;
    }>;
    capacityScore: number;
    mode: string;
    availableMinutes: number;
    historicalData: {
      averageBuffer: number;
      completionRatesByHour: Record<number, number>;
      taskTypeBuffers: Record<string, number>;
    };
    goals?: Array<{ title: string; category: string }>;
    scheduleDate: Date;
    // Adaptive features context
    adaptiveContext?: {
      skipRisk?: {
        overallLevel: SkipRiskLevel;
        taskRisks: Array<{
          taskId: string;
          riskLevel: SkipRiskLevel;
          riskPercentage: number;
          reasoning: string;
        }>;
      };
      momentum?: {
        state: MomentumState;
        morningStartStrength: number;
        completionAfterEarlyWinRate: number;
        consecutiveSkips: number;
        consecutiveEarlyCompletions: number;
      };
      currentProgress?: {
        minutesAheadBehind: number;
        completedTasks: number;
        skippedTasks: number;
        remainingTasks: number;
      };
    };
  }): Promise<{
    scheduledTasks: Array<{
      taskId: string;
      title: string;
      scheduledStart: Date;
      scheduledEnd: Date;
      adjustedMinutes: number;
      originalMinutes: number;
      reason: string;
    }>;
    skippedTasks: any[];
    reasoning: string;
    totalScheduledMinutes: number;
    availableMinutes: number;
    adaptiveInsights?: {
      timeBlindnessApplied: string;
      productivityWindowsUsed: string;
      skipRiskMitigation: string;
      momentumConsideration: string;
    };
  }> {
    const {
      tasks,
      capacityScore,
      mode,
      availableMinutes,
      historicalData,
      goals,
      scheduleDate,
      adaptiveContext,
    } = context;

    // Format historical data for AI
    const productivityWindows = Object.entries(historicalData.completionRatesByHour)
      .map(([hour, rate]) => `${hour}:00 - ${Math.round(rate * 100)}% completion rate`)
      .join('\n');

    const goalsText = goals
      ? goals.map((g) => `- ${g.title} (${g.category})`).join('\n')
      : 'No specific goals set';

    const tasksText = tasks
      .map(
        (t) =>
          `{
  "id": "${t.id}",
  "title": "${t.title}",
  "description": "${t.description || 'No description'}",
  "priority": ${t.priority},
  "estimatedMinutes": ${t.estimatedMinutes},
  "dueDate": ${t.dueDate ? `"${t.dueDate.toISOString()}"` : 'null'}
}`
      )
      .join(',\n');

    // Build adaptive context sections
    let adaptiveContextText = '';

    // Skip risk context
    if (adaptiveContext?.skipRisk) {
      const sr = adaptiveContext.skipRisk;
      adaptiveContextText += `\n\n**SKIP RISK ANALYSIS:**
- Overall Risk Level: ${sr.overallLevel.toUpperCase()}
- Task-Specific Risks:`;

      sr.taskRisks.forEach((risk) => {
        const task = tasks.find((t) => t.id === risk.taskId);
        if (task) {
          adaptiveContextText += `\n  - "${task.title}": ${risk.riskLevel.toUpperCase()} (${risk.riskPercentage}%) - ${risk.reasoning}`;
        }
      });

      adaptiveContextText += `\n\n**SKIP RISK MITIGATION STRATEGIES:**
- High-risk tasks (>60%): Consider deferring or simplifying
- Medium-risk tasks (40-60%): Add extra buffer time, schedule during peak hours
- Low-risk tasks (<40%): Schedule normally`;
    }

    // Momentum context
    if (adaptiveContext?.momentum) {
      const m = adaptiveContext.momentum;
      let momentumGuidance = '';

      if (m.state === 'strong') {
        momentumGuidance = `User has STRONG momentum (${m.consecutiveEarlyCompletions} early completions)! 
- Boost predictions by 15%
- Consider adding more tasks or pulling forward tomorrow's work
- Capitalize on this energy`;
      } else if (m.state === 'weak') {
        momentumGuidance = `Momentum is WEAK (${m.consecutiveSkips} skip${m.consecutiveSkips > 1 ? 's' : ''}). 
- Reduce predictions by 20%
- Add extra buffer time
- Simplify remaining tasks
- Suggest breaks`;
      } else if (m.state === 'collapsed') {
        momentumGuidance = `Momentum has COLLAPSED (${m.consecutiveSkips} consecutive skips)! 
- CRITICAL: Drastically simplify the plan
- Focus on just 1-2 achievable wins
- Defer all non-essential tasks
- Provide encouragement and support`;
      } else {
        momentumGuidance = 'Normal momentum. Proceed with standard planning.';
      }

      adaptiveContextText += `\n\n**MOMENTUM STATE:**
- Current State: ${m.state.toUpperCase()}
- Morning Start Strength: ${Math.round(m.morningStartStrength)}%
- Completion After Early Win Rate: ${Math.round(m.completionAfterEarlyWinRate)}%
- Consecutive Skips: ${m.consecutiveSkips}
- Consecutive Early Completions: ${m.consecutiveEarlyCompletions}

**MOMENTUM GUIDANCE:**
${momentumGuidance}`;
    }

    // Current progress context (for re-scheduling)
    if (adaptiveContext?.currentProgress) {
      const cp = adaptiveContext.currentProgress;
      const status = cp.minutesAheadBehind > 0 ? 'AHEAD' : cp.minutesAheadBehind < 0 ? 'BEHIND' : 'ON TRACK';

      adaptiveContextText += `\n\n**CURRENT PROGRESS (REAL-TIME):**
- Status: ${status} by ${Math.abs(cp.minutesAheadBehind)} minutes
- Completed: ${cp.completedTasks} tasks
- Skipped: ${cp.skippedTasks} tasks
- Remaining: ${cp.remainingTasks} tasks

**RE-SCHEDULING GUIDANCE:**
${cp.minutesAheadBehind < -30 ? '- User is significantly behind - simplify the plan!' : ''}
${cp.minutesAheadBehind > 30 ? '- User is ahead - consider adding tasks or suggesting a break' : ''}
${cp.skippedTasks >= 2 ? '- Multiple skips detected - focus on achievable wins only' : ''}
- This is a mid-day adjustment - be realistic about remaining time`;
    }

    const prompt = `You are a senior task manager and proficient scheduling AI with access to advanced adaptive learning data. Schedule tasks for a user based on their complete context including time blindness patterns, productivity windows, skip risk, and momentum state.

**USER CONTEXT:**
- Date: ${scheduleDate.toLocaleDateString()}
- Capacity Score: ${capacityScore.toFixed(0)}/100
- Mode: ${mode.toUpperCase()}
- Available Time: ${Math.round(availableMinutes / 60)} hours (${availableMinutes} minutes)

**HISTORICAL PATTERNS:**
- Average Time Buffer: ${historicalData.averageBuffer.toFixed(2)}x (user typically takes ${Math.round((historicalData.averageBuffer - 1) * 100)}% ${historicalData.averageBuffer > 1 ? 'longer' : 'less time'} than estimated)
- Productivity Windows:
${productivityWindows}

**USER'S GOALS:**
${goalsText}

**TASKS TO SCHEDULE:**
[${tasksText}]
${adaptiveContextText}

**YOUR JOB:**
1. **CRITICAL**: Apply the ${historicalData.averageBuffer.toFixed(2)}x time buffer to ALL task estimates
2. **CRITICAL**: Schedule high-priority tasks during peak productivity hours (high completion rate)
3. **CRITICAL**: Consider skip risk - defer or simplify high-risk tasks
4. **CRITICAL**: Respect momentum state - adjust plan complexity accordingly
5. Decide which tasks to schedule today (don't overcommit)
6. Consider task dependencies and due dates
7. Provide clear reasoning for each decision, referencing adaptive data
8. **CRITICAL**: ONLY use task IDs from the provided task list - DO NOT invent or hallucinate task IDs

**RULES:**
- Total scheduled time must NOT exceed ${availableMinutes} minutes
- High priority (1-2) tasks should get peak hours (high completion rate)
- Apply the ${historicalData.averageBuffer.toFixed(2)}x buffer to time estimates
- If mode is RECOVERY, schedule fewer, lighter tasks
- If mode is DEEP_WORK, prioritize demanding tasks
- If momentum is COLLAPSED, schedule only 1-2 achievable wins
- If skip risk is HIGH, consider deferring or simplifying tasks
- Avoid scheduling demanding tasks during low productivity hours
- **CRITICAL**: You MUST ONLY schedule tasks from the provided list - DO NOT create new tasks or use task IDs not in the list

**OUTPUT FORMAT (JSON):**
{
  "scheduledTasks": [
    {
      "taskId": "task-id",
      "scheduledStart": "2024-01-27T09:00:00Z",
      "scheduledEnd": "2024-01-27T11:00:00Z",
      "adjustedMinutes": 120,
      "reason": "Scheduled at 9am (85% completion rate). Added ${Math.round((historicalData.averageBuffer - 1) * 100)}% buffer based on history. High priority task aligned with 'Launch MVP' goal. Low skip risk."
    }
  ],
  "skippedTasks": ["task-id-2", "task-id-3"],
  "overallReasoning": "Scheduled 5 high-priority tasks during peak hours. Skipped 3 tasks due to capacity limits. Applied time blindness buffer. Considered momentum state and skip risk. Total: 5 hours of 6 available.",
  "adaptiveInsights": {
    "timeBlindnessApplied": "Applied ${historicalData.averageBuffer.toFixed(2)}x buffer to all estimates based on historical accuracy",
    "productivityWindowsUsed": "Scheduled high-priority tasks at 9am and 10am (peak hours with 85%+ completion rate)",
    "skipRiskMitigation": "Deferred high-risk tasks, added buffer to medium-risk tasks",
    "momentumConsideration": "Adjusted plan complexity based on ${adaptiveContext?.momentum?.state || 'normal'} momentum state"
  }
}

Generate the schedule now:`;

    try {
      const result = await this.model.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const text = result.text;

      // Parse AI response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Convert to our format
      const scheduledTasks = parsed.scheduledTasks.map((t: any) => {
        const task = tasks.find((task) => task.id === t.taskId);
        return {
          taskId: t.taskId,
          title: task?.title || t.title || 'Unknown Task',
          scheduledStart: new Date(t.scheduledStart),
          scheduledEnd: new Date(t.scheduledEnd),
          adjustedMinutes: t.adjustedMinutes,
          originalMinutes: task?.estimatedMinutes || 0,
          reason: t.reason,
        };
      });

      const skippedTasks = parsed.skippedTasks.map((id: string) =>
        tasks.find((t) => t.id === id)
      ).filter(Boolean);

      const totalScheduledMinutes = scheduledTasks.reduce(
        (sum: number, t: any) => sum + t.adjustedMinutes,
        0
      );

      // Flush Opik traces
      await this.genAI.flush?.();

      return {
        scheduledTasks,
        skippedTasks,
        reasoning: parsed.overallReasoning,
        totalScheduledMinutes,
        availableMinutes,
        adaptiveInsights: parsed.adaptiveInsights,
      };
    } catch (error) {
      console.error('AI scheduling error:', error);
      // Fallback to simple scheduling
      return this.fallbackScheduling(tasks, availableMinutes, scheduleDate);
    }
  }

  /**
   * Fallback scheduling if AI fails
   */
  private fallbackScheduling(
    tasks: any[],
    availableMinutes: number,
    scheduleDate: Date
  ): any {
    const sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);
    const scheduledTasks = [];
    let totalMinutes = 0;
    let currentTime = new Date(scheduleDate);
    currentTime.setHours(9, 0, 0, 0);

    for (const task of sortedTasks) {
      if (totalMinutes + task.estimatedMinutes > availableMinutes) break;

      const scheduledStart = new Date(currentTime);
      const scheduledEnd = new Date(currentTime.getTime() + task.estimatedMinutes * 60 * 1000);

      scheduledTasks.push({
        taskId: task.id,
        title: task.title,
        scheduledStart,
        scheduledEnd,
        adjustedMinutes: task.estimatedMinutes,
        originalMinutes: task.estimatedMinutes,
        reason: `Priority ${task.priority} task (fallback scheduling)`,
      });

      totalMinutes += task.estimatedMinutes;
      currentTime = new Date(scheduledEnd.getTime() + 15 * 60 * 1000);
    }

    return {
      scheduledTasks,
      skippedTasks: sortedTasks.slice(scheduledTasks.length),
      reasoning: 'Using fallback scheduling (AI temporarily unavailable)',
      totalScheduledMinutes: totalMinutes,
      availableMinutes,
    };
  }

  /**
   * Get AI suggestions for capacity adjustment
   */
  async getCapacityInsights(
    currentScore: number,
    history: Array<{ date: Date; capacityScore: number }>
  ): Promise<string> {
    const historyText = history
      .map((h) => `${h.date.toLocaleDateString()}: ${h.capacityScore.toFixed(0)}`)
      .join(', ');

    const prompt = `Analyze this user's capacity trend and provide brief insights:

Current capacity score: ${currentScore.toFixed(0)}/100
Recent history: ${historyText}

Provide 2-3 sentences of insight about their capacity trend and any recommendations.`;

    try {
      const result = await this.model.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const text = result.text;
      
      // Flush Opik traces
      await this.genAI.flush?.();
      
      return text;
    } catch (error) {
      console.error('Gemini insights error:', error);
      return 'Unable to generate insights at this time.';
    }
  }

  /**
   * Generate AI-driven check-in notification message
   * Requirement 18.3: Generate context-aware check-in messages
   */
  async generateCheckInNotification(context: {
    userId: string;
    taskTitle: string;
    taskStatus: 'not_started' | 'in_progress' | 'completed' | 'overdue';
    todoistStatus?: 'complete' | 'incomplete';
    minutesBehind: number;
    tasksCompleted: number;
    tasksRemaining: number;
    momentumState: MomentumState;
    tone: 'gentle' | 'direct' | 'minimal';
  }): Promise<{
    title: string;
    body: string;
    suggestedActions: string[];
  }> {
    const {
      taskTitle,
      taskStatus,
      todoistStatus,
      minutesBehind,
      tasksCompleted,
      tasksRemaining,
      momentumState,
      tone,
    } = context;

    const todoistRef = todoistStatus
      ? ` (Todoist shows: ${todoistStatus})`
      : '';

    const prompt = `Generate a check-in notification for a user working on a task.

**Context:**
- Task: "${taskTitle}"
- Status: ${taskStatus}${todoistRef}
- Minutes Behind Schedule: ${minutesBehind}
- Tasks Completed Today: ${tasksCompleted}
- Tasks Remaining: ${tasksRemaining}
- Momentum State: ${momentumState}
- Preferred Tone: ${tone}

**Tone Guidelines:**
- Gentle: Supportive, compassionate, uses emojis, longer messages
- Direct: Concise, clear, action-oriented, minimal fluff
- Minimal: Very brief, just the essentials

**Instructions:**
1. Generate a notification title and body appropriate for the tone
2. Reference the task and its status
3. Consider momentum state (collapsed = extra supportive, strong = celebratory)
4. If behind schedule, acknowledge it without guilt
5. Suggest 2-3 possible actions the user could take

**Output Format (JSON):**
{
  "title": "Notification title",
  "body": "Notification body text",
  "suggestedActions": ["Action 1", "Action 2", "Action 3"]
}

Generate the notification now:`;

    try {
      const result = await this.model.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const text = result.text;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Flush Opik traces
      await this.genAI.flush?.();

      return {
        title: parsed.title,
        body: parsed.body,
        suggestedActions: parsed.suggestedActions || [],
      };
    } catch (error) {
      console.error('AI check-in generation error:', error);
      // Fallback to simple message
      return {
        title: 'Quick check-in',
        body: `How's "${taskTitle}" going?`,
        suggestedActions: ['Done', 'Still working', 'Stuck'],
      };
    }
  }

  /**
   * Generate AI-driven re-scheduling recommendation
   * Requirement 19.3: Request re-schedule with updated context
   */
  async generateRescheduleRecommendation(context: {
    userId: string;
    currentTime: Date;
    minutesAheadBehind: number;
    completedTasks: number;
    skippedTasks: number;
    remainingTasks: Array<{
      id: string;
      title: string;
      priority: number;
      estimatedMinutes: number;
      isProtected: boolean;
    }>;
    remainingAvailableMinutes: number;
    momentumState: MomentumState;
    skipRiskLevel: SkipRiskLevel;
    capacityScore: number;
  }): Promise<{
    shouldReschedule: boolean;
    reasoning: string;
    recommendedActions: Array<{
      type: 'defer' | 'extend' | 'add_break' | 'simplify' | 'continue';
      taskId?: string;
      description: string;
    }>;
    encouragement: string;
  }> {
    const {
      currentTime,
      minutesAheadBehind,
      completedTasks,
      skippedTasks,
      remainingTasks,
      remainingAvailableMinutes,
      momentumState,
      skipRiskLevel,
      capacityScore,
    } = context;

    const status = minutesAheadBehind > 0 ? 'AHEAD' : minutesAheadBehind < 0 ? 'BEHIND' : 'ON TRACK';

    const tasksText = remainingTasks
      .map(
        (t) =>
          `- "${t.title}" (Priority: ${t.priority}, Est: ${t.estimatedMinutes}min, Protected: ${t.isProtected})`
      )
      .join('\n');

    const prompt = `Analyze the user's current progress and recommend whether to reschedule their afternoon.

**Current Situation:**
- Time: ${currentTime.toLocaleTimeString()}
- Status: ${status} by ${Math.abs(minutesAheadBehind)} minutes
- Completed Tasks: ${completedTasks}
- Skipped Tasks: ${skippedTasks}
- Remaining Available Time: ${Math.round(remainingAvailableMinutes / 60)} hours (${remainingAvailableMinutes} minutes)
- Momentum State: ${momentumState}
- Skip Risk Level: ${skipRiskLevel}
- Capacity Score: ${capacityScore}/100

**Remaining Tasks:**
${tasksText}

**Your Job:**
1. Analyze whether a reschedule is needed
2. Consider momentum state (collapsed = definitely reschedule)
3. Consider skip risk (high = reschedule to protect wins)
4. If ahead, suggest continuing or adding tasks
5. If behind, suggest which tasks to defer or simplify
6. Provide encouraging message appropriate to the situation

**Output Format (JSON):**
{
  "shouldReschedule": true/false,
  "reasoning": "Clear explanation of why reschedule is/isn't needed",
  "recommendedActions": [
    {
      "type": "defer",
      "taskId": "task-id",
      "description": "Defer 'Low priority task' to tomorrow"
    },
    {
      "type": "extend",
      "description": "Add 15-minute break before next task"
    }
  ],
  "encouragement": "Supportive message for the user"
}

Generate the recommendation now:`;

    try {
      const result = await this.model.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const text = result.text;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Flush Opik traces
      await this.genAI.flush?.();

      return {
        shouldReschedule: parsed.shouldReschedule,
        reasoning: parsed.reasoning,
        recommendedActions: parsed.recommendedActions || [],
        encouragement: parsed.encouragement || 'Keep going!',
      };
    } catch (error) {
      console.error('AI reschedule recommendation error:', error);
      // Fallback to simple recommendation
      return {
        shouldReschedule: Math.abs(minutesAheadBehind) > 30 || momentumState === 'collapsed',
        reasoning: 'Based on current progress and momentum state',
        recommendedActions: [],
        encouragement: 'You\'re doing great! Let\'s adjust the plan to set you up for success.',
      };
    }
  }

  /**
   * Generate AI explanation for skip risk prediction
   * Helps users understand why a task has high skip risk
   */
  async explainSkipRisk(context: {
    taskTitle: string;
    riskLevel: SkipRiskLevel;
    riskPercentage: number;
    factors: {
      scheduleDelay: number;
      skipHistory: number;
      momentum: number;
      timeOfDay: number;
      priority: number;
    };
  }): Promise<string> {
    const { taskTitle, riskLevel, riskPercentage, factors } = context;

    const prompt = `Explain to a user why a task has a certain skip risk level.

**Task:** "${taskTitle}"
**Risk Level:** ${riskLevel} (${riskPercentage}%)

**Contributing Factors:**
- Schedule Delay: ${factors.scheduleDelay}% contribution
- Skip History: ${factors.skipHistory}% contribution
- Momentum: ${factors.momentum}% contribution
- Time of Day: ${factors.timeOfDay}% contribution
- Priority: ${factors.priority}% contribution

Generate a brief, user-friendly explanation (2-3 sentences) of why this task has this risk level and what it means.`;

    try {
      const result = await this.model.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const text = result.text;
      
      // Flush Opik traces
      await this.genAI.flush?.();
      
      return text;
    } catch (error) {
      console.error('AI skip risk explanation error:', error);
      return `This task has ${riskLevel} skip risk (${riskPercentage}%) based on your current progress and patterns.`;
    }
  }

  /**
   * Generate AI explanation for momentum intervention
   * Helps users understand why the system is suggesting changes
   */
  async explainMomentumIntervention(context: {
    momentumState: MomentumState;
    consecutiveSkips: number;
    consecutiveEarlyCompletions: number;
    recommendedAction: string;
  }): Promise<string> {
    const { momentumState, consecutiveSkips, consecutiveEarlyCompletions, recommendedAction } = context;

    const prompt = `Explain to a user why the system is recommending a momentum-based intervention.

**Momentum State:** ${momentumState}
**Consecutive Skips:** ${consecutiveSkips}
**Consecutive Early Completions:** ${consecutiveEarlyCompletions}
**Recommended Action:** ${recommendedAction}

Generate a brief, supportive explanation (2-3 sentences) that helps the user understand their momentum state and why the system is making this recommendation.`;

    try {
      const result = await this.model.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
      });
      const text = result.text;
      
      // Flush Opik traces
      await this.genAI.flush?.();
      
      return text;
    } catch (error) {
      console.error('AI momentum explanation error:', error);
      return `Your momentum is ${momentumState}. ${recommendedAction}`;
    }
  }
}

/**
 * Singleton instance
 */
let geminiClient: GeminiClient | null = null;

export function getGeminiClient(): GeminiClient {
  if (!geminiClient) {
    geminiClient = new GeminiClient();
  }
  return geminiClient;
}

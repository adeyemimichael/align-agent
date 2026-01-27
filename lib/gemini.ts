import { GoogleGenerativeAI } from '@google/generative-ai';
import { logAIRequest, trackReasoningQuality } from './opik';
import { AIServiceError } from './errors';

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
}

/**
 * Gemini AI client for intelligent planning
 */
export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new AIServiceError('GEMINI_API_KEY not configured');
    }
    this.genAI = new GoogleGenerativeAI(key);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const duration = Date.now() - startTimestamp;

      const planningResponse = this.parsePlanningResponse(text, context.tasks, startTime);

      // Track AI request in Opik (if userId provided)
      if (userId) {
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
        }).catch((err) => console.error('Opik logging failed:', err));

        // Track reasoning quality
        await trackReasoningQuality({
          userId,
          reasoning: planningResponse.overallReasoning,
          taskCount: context.tasks.length,
        }).catch((err) => console.error('Opik reasoning tracking failed:', err));
      }

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
   * Build the prompt for daily planning
   */
  private buildPlanningPrompt(context: PlanningContext, startTime: Date): string {
    const { capacityScore, mode, tasks, history, goals } = context;

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

    const prompt = `You are an AI productivity assistant helping a user plan their day based on their current capacity and goals.

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

**Instructions:**
1. Analyze the user's capacity score and recent patterns
2. Consider their goals and how today's work contributes to them
3. Prioritize tasks based on:
   - Current capacity and mode
   - Task priority and due dates
   - Recent completion patterns
   - Goal alignment
4. Schedule tasks with realistic time blocks
5. Include breaks and recovery time based on capacity
6. Provide clear reasoning for your decisions

**Output Format (JSON):**
{
  "overallReasoning": "Brief explanation of your planning strategy for today",
  "modeRecommendation": "Any suggestions about the current mode or capacity",
  "tasks": [
    {
      "taskId": "task-id",
      "startTime": "HH:MM",
      "duration": minutes,
      "reasoning": "Why this task at this time"
    }
  ]
}

Generate the plan now:`;

    return prompt;
  }

  /**
   * Parse Gemini's response into structured format
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
   * AI-DRIVEN SCHEDULING: Let AI make the actual scheduling decisions
   * This is the REAL AI agent behavior
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
  }> {
    const {
      tasks,
      capacityScore,
      mode,
      availableMinutes,
      historicalData,
      goals,
      scheduleDate,
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

    const prompt = `You are a senior task manager and proficient scheduling AI. Schedule tasks for a user based on their complete context.

**USER CONTEXT:**
- Date: ${scheduleDate.toLocaleDateString()}
- Capacity Score: ${capacityScore.toFixed(0)}/100
- Mode: ${mode.toUpperCase()}
- Available Time: ${Math.round(availableMinutes / 60)} hours (${availableMinutes} minutes)

**HISTORICAL PATTERNS:**
- Average Time Buffer: ${historicalData.averageBuffer.toFixed(2)}x (user typically takes ${Math.round((historicalData.averageBuffer - 1) * 100)}% longer than estimated)
- Productivity Windows:
${productivityWindows}

**USER'S GOALS:**
${goalsText}

**TASKS TO SCHEDULE:**
[${tasksText}]

**YOUR JOB:**
1. Decide which tasks to schedule today (don't overcommit)
2. Adjust time estimates based on historical buffer
3. Schedule high-priority tasks during peak productivity hours
4. Consider task dependencies and due dates
5. Provide clear reasoning for each decision

**RULES:**
- Total scheduled time must NOT exceed ${availableMinutes} minutes
- High priority (1-2) tasks should get peak hours (high completion rate)
- Apply the ${historicalData.averageBuffer.toFixed(2)}x buffer to time estimates
- If mode is RECOVERY, schedule fewer, lighter tasks
- If mode is DEEP_WORK, prioritize demanding tasks

**OUTPUT FORMAT (JSON):**
{
  "scheduledTasks": [
    {
      "taskId": "task-id",
      "scheduledStart": "2024-01-27T09:00:00Z",
      "scheduledEnd": "2024-01-27T11:00:00Z",
      "adjustedMinutes": 120,
      "reason": "Scheduled at 9am (85% completion rate). Added 100% buffer based on history. High priority task aligned with 'Launch MVP' goal."
    }
  ],
  "skippedTasks": ["task-id-2", "task-id-3"],
  "overallReasoning": "Scheduled 5 high-priority tasks during peak hours. Skipped 3 tasks due to capacity limits. Total: 5 hours of 6 available."
}

Generate the schedule now:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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

      return {
        scheduledTasks,
        skippedTasks,
        reasoning: parsed.overallReasoning,
        totalScheduledMinutes,
        availableMinutes,
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
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini insights error:', error);
      return 'Unable to generate insights at this time.';
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

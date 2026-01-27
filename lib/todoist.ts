import { decryptToken } from './encryption';

export interface TodoistTask {
  id: string;
  content: string;
  description: string;
  priority: number; // 1-4 (4 is highest in Todoist)
  due?: {
    date: string;
    datetime?: string;
  };
  project_id: string;
  labels: string[];
  is_completed: boolean;
}

export interface TodoistProject {
  id: string;
  name: string;
}

import { ExternalAPIError } from './errors';

/**
 * Todoist API client
 */
export class TodoistClient {
  private accessToken: string;
  private baseUrl = 'https://api.todoist.com/rest/v2';

  constructor(encryptedAccessToken: string) {
    this.accessToken = decryptToken(encryptedAccessToken);
  }

  /**
   * Fetch all active tasks from Todoist
   */
  async getTasks(): Promise<TodoistTask[]> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalAPIError(
        'Todoist',
        `Failed to fetch tasks: ${response.status} ${response.statusText}`,
        { statusCode: response.status, errorText }
      );
    }

    return response.json();
  }

  /**
   * Fetch all projects from Todoist
   */
  async getProjects(): Promise<TodoistProject[]> {
    const response = await fetch(`${this.baseUrl}/projects`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalAPIError(
        'Todoist',
        `Failed to fetch projects: ${response.status} ${response.statusText}`,
        { statusCode: response.status, errorText }
      );
    }

    return response.json();
  }

  /**
   * Mark a task as complete in Todoist
   */
  async completeTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/close`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalAPIError(
        'Todoist',
        `Failed to complete task: ${response.status} ${response.statusText}`,
        { statusCode: response.status, errorText, taskId }
      );
    }
  }

  /**
   * Reopen a task in Todoist
   */
  async reopenTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/reopen`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ExternalAPIError(
        'Todoist',
        `Failed to reopen task: ${response.status} ${response.statusText}`,
        { statusCode: response.status, errorText, taskId }
      );
    }
  }
}

/**
 * Convert Todoist priority (1-4, 4 is highest) to our priority (1-4, 1 is highest)
 */
export function convertTodoistPriority(todoistPriority: number): number {
  // Todoist: 4 = highest, 3 = high, 2 = medium, 1 = low
  // Our system: 1 = highest, 2 = high, 3 = medium, 4 = low
  return 5 - todoistPriority;
}

/**
 * Estimate task duration based on priority and description
 * This is a simple heuristic - can be improved with ML later
 */
export function estimateTaskDuration(task: TodoistTask): number {
  // Base duration by priority
  const baseDuration = {
    1: 30,  // Low priority: 30 min
    2: 45,  // Medium priority: 45 min
    3: 60,  // High priority: 60 min
    4: 90,  // Highest priority: 90 min
  }[task.priority] || 45;

  // Adjust based on description length (rough heuristic)
  const descriptionLength = task.description?.length || 0;
  if (descriptionLength > 200) {
    return baseDuration + 30;
  }

  return baseDuration;
}

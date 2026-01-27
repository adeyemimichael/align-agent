/**
 * Simple in-memory cache for performance optimization
 * Reduces database queries and API calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class Cache {
  private store: Map<string, CacheEntry<any>> = new Map();

  /**
   * Set a value in the cache with TTL
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
    });
  }

  /**
   * Get a value from the cache
   * Returns null if expired or not found
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Delete a specific key
   */
  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all keys matching a pattern (regex)
   */
  deletePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    keys: string[];
  } {
    return {
      size: this.store.size,
      keys: Array.from(this.store.keys()),
    };
  }
}

// Singleton instance
export const cache = new Cache();

/**
 * Cache key generators for consistency
 */
export const CacheKeys = {
  user: (email: string) => `user:${email}`,
  userById: (userId: string) => `user:id:${userId}`,
  checkIn: (userId: string, date: string) => `checkin:${userId}:${date}`,
  checkInHistory: (userId: string) => `checkin:history:${userId}`,
  plan: (userId: string, date: string) => `plan:${userId}:${date}`,
  goals: (userId: string) => `goals:${userId}`,
  patterns: (userId: string) => `patterns:${userId}`,
  timeBlindness: (userId: string) => `time-blindness:${userId}`,
  productivityWindows: (userId: string) => `productivity-windows:${userId}`,
  integration: (userId: string, platform: string) => `integration:${userId}:${platform}`,
};

/**
 * Invalidate related cache entries when data changes
 */
export const CacheInvalidation = {
  onCheckIn: (userId: string) => {
    cache.deletePattern(`^checkin:.*${userId}`);
    cache.deletePattern(`^patterns:${userId}`);
  },
  onPlanCreate: (userId: string) => {
    cache.deletePattern(`^plan:${userId}`);
  },
  onGoalChange: (userId: string) => {
    cache.delete(CacheKeys.goals(userId));
  },
  onTaskComplete: (userId: string) => {
    cache.deletePattern(`^time-blindness:${userId}`);
    cache.deletePattern(`^productivity-windows:${userId}`);
    cache.deletePattern(`^plan:${userId}`);
  },
  onIntegrationChange: (userId: string, platform: string) => {
    cache.delete(CacheKeys.integration(userId, platform));
  },
};

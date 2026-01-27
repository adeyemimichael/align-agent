/**
 * Cache Performance Tests
 * Verifies caching functionality works correctly
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { cache, CacheKeys, CacheInvalidation } from '../lib/cache';

describe('Cache System', () => {
  beforeEach(() => {
    // Clear cache before each test
    cache.clear();
  });

  it('should store and retrieve values', () => {
    cache.set('test-key', { data: 'test' }, 60);
    const result = cache.get('test-key');
    expect(result).toEqual({ data: 'test' });
  });

  it('should return null for expired entries', async () => {
    // Set with 0 second TTL (immediately expired)
    cache.set('expired-key', { data: 'test' }, 0);
    
    // Wait a tiny bit to ensure expiration
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const result = cache.get('expired-key');
    expect(result).toBeNull();
  });

  it('should return null for non-existent keys', () => {
    const result = cache.get('non-existent');
    expect(result).toBeNull();
  });

  it('should delete specific keys', () => {
    cache.set('key1', 'value1', 60);
    cache.set('key2', 'value2', 60);
    
    cache.delete('key1');
    
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBe('value2');
  });

  it('should delete keys matching pattern', () => {
    cache.set('user:123', 'user1', 60);
    cache.set('user:456', 'user2', 60);
    cache.set('plan:123', 'plan1', 60);
    
    cache.deletePattern('user:');
    
    expect(cache.get('user:123')).toBeNull();
    expect(cache.get('user:456')).toBeNull();
    expect(cache.get('plan:123')).toBe('plan1');
  });

  it('should clear all entries', () => {
    cache.set('key1', 'value1', 60);
    cache.set('key2', 'value2', 60);
    
    cache.clear();
    
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
  });

  it('should provide cache statistics', () => {
    cache.set('key1', 'value1', 60);
    cache.set('key2', 'value2', 60);
    
    const stats = cache.getStats();
    
    expect(stats.size).toBe(2);
    expect(stats.keys).toContain('key1');
    expect(stats.keys).toContain('key2');
  });

  describe('CacheKeys', () => {
    it('should generate consistent user cache keys', () => {
      const key1 = CacheKeys.user('test@example.com');
      const key2 = CacheKeys.user('test@example.com');
      expect(key1).toBe(key2);
      expect(key1).toBe('user:test@example.com');
    });

    it('should generate consistent check-in cache keys', () => {
      const key = CacheKeys.checkIn('user123', '2024-01-27');
      expect(key).toBe('checkin:user123:2024-01-27');
    });

    it('should generate consistent pattern cache keys', () => {
      const key = CacheKeys.patterns('user123');
      expect(key).toBe('patterns:user123');
    });
  });

  describe('CacheInvalidation', () => {
    it('should invalidate check-in related caches', () => {
      cache.set('checkin:user123:2024-01-27', 'data', 60);
      cache.set('checkin:history:user123', 'history', 60);
      cache.set('patterns:user123', 'patterns', 60);
      cache.set('plan:user123:2024-01-27', 'plan', 60);
      
      CacheInvalidation.onCheckIn('user123');
      
      expect(cache.get('checkin:user123:2024-01-27')).toBeNull();
      expect(cache.get('checkin:history:user123')).toBeNull();
      expect(cache.get('patterns:user123')).toBeNull();
      expect(cache.get('plan:user123:2024-01-27')).toBe('plan'); // Not invalidated
    });

    it('should invalidate plan caches', () => {
      cache.set('plan:user123:2024-01-27', 'plan', 60);
      cache.set('checkin:user123:2024-01-27', 'checkin', 60);
      
      CacheInvalidation.onPlanCreate('user123');
      
      expect(cache.get('plan:user123:2024-01-27')).toBeNull();
      expect(cache.get('checkin:user123:2024-01-27')).toBe('checkin'); // Not invalidated
    });

    it('should invalidate goal caches', () => {
      const key = CacheKeys.goals('user123');
      cache.set(key, 'goals', 60);
      
      CacheInvalidation.onGoalChange('user123');
      
      expect(cache.get(key)).toBeNull();
    });

    it('should invalidate task completion related caches', () => {
      cache.set('time-blindness:user123', 'data', 60);
      cache.set('productivity-windows:user123', 'data', 60);
      cache.set('plan:user123:2024-01-27', 'plan', 60);
      
      CacheInvalidation.onTaskComplete('user123');
      
      expect(cache.get('time-blindness:user123')).toBeNull();
      expect(cache.get('productivity-windows:user123')).toBeNull();
      expect(cache.get('plan:user123:2024-01-27')).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should handle large number of entries', () => {
      const startTime = Date.now();
      
      // Add 1000 entries
      for (let i = 0; i < 1000; i++) {
        cache.set(`key${i}`, `value${i}`, 60);
      }
      
      const setTime = Date.now() - startTime;
      expect(setTime).toBeLessThan(100); // Should be fast
      
      // Retrieve 1000 entries
      const getStartTime = Date.now();
      for (let i = 0; i < 1000; i++) {
        cache.get(`key${i}`);
      }
      
      const getTime = Date.now() - getStartTime;
      expect(getTime).toBeLessThan(50); // Should be very fast
    });

    it('should handle pattern deletion efficiently', () => {
      // Add 100 entries with pattern
      for (let i = 0; i < 100; i++) {
        cache.set(`user:${i}`, `value${i}`, 60);
      }
      
      const startTime = Date.now();
      cache.deletePattern('user:');
      const deleteTime = Date.now() - startTime;
      
      expect(deleteTime).toBeLessThan(50); // Should be fast
      expect(cache.getStats().size).toBe(0);
    });
  });
});

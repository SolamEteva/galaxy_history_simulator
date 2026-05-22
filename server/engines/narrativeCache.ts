/**
 * Narrative Cache and Optimization Engine
 * Caches generated narratives to avoid redundant LLM calls
 * Optimizes narrative generation through smart caching and batching
 * 
 * PRINCIPLE: LLM calls are expensive; cache aggressively but invalidate intelligently
 */

import type { MultiPerspectiveEvent } from "./multiPerspectiveNarrative";
import type { CivilizationState, EventNode } from "../../types/narrative";

export interface CacheEntry {
  eventId: string;
  civilizationId: string;
  perspective: string;
  narrative: string;
  timestamp: number;
  expiresAt: number;
  hitCount: number;
  generationTime: number; // ms
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number; // 0-1
  missRate: number; // 0-1
  averageGenerationTime: number; // ms
  cacheSize: number; // bytes
  hitCount: number;
  missCount: number;
}

/**
 * In-memory narrative cache with LRU eviction
 */
export class NarrativeCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number = 1000; // Maximum entries
  private ttl: number = 86400000; // 24 hours in ms
  private hitCount: number = 0;
  private missCount: number = 0;

  /**
   * Generate cache key
   */
  private generateKey(eventId: string, civilizationId: string, perspective: string): string {
    return `${eventId}:${civilizationId}:${perspective}`;
  }

  /**
   * Get narrative from cache
   */
  get(eventId: string, civilizationId: string, perspective: string): string | null {
    const key = this.generateKey(eventId, civilizationId, perspective);
    const entry = this.cache.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    // Update hit count and move to end (LRU)
    entry.hitCount++;
    this.hitCount++;
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.narrative;
  }

  /**
   * Set narrative in cache
   */
  set(
    eventId: string,
    civilizationId: string,
    perspective: string,
    narrative: string,
    generationTime: number
  ): void {
    const key = this.generateKey(eventId, civilizationId, perspective);

    // Evict if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry = {
      eventId,
      civilizationId,
      perspective,
      narrative,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.ttl,
      hitCount: 0,
      generationTime,
    };

    this.cache.set(key, entry);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let totalGenerationTime = 0;
    let totalHits = 0;

    for (const entry of this.cache.values()) {
      totalGenerationTime += entry.generationTime;
      totalHits += entry.hitCount;
    }

    const totalRequests = this.hitCount + this.missCount;
    const hitRate = totalRequests > 0 ? this.hitCount / totalRequests : 0;
    const missRate = 1 - hitRate;

    // Estimate cache size (rough)
    let cacheSize = 0;
    for (const entry of this.cache.values()) {
      cacheSize += entry.narrative.length * 2; // UTF-16 estimate
    }

    return {
      totalEntries: this.cache.size,
      hitRate,
      missRate,
      averageGenerationTime: this.cache.size > 0 ? totalGenerationTime / this.cache.size : 0,
      cacheSize,
      hitCount: this.hitCount,
      missCount: this.missCount,
    };
  }

  /**
   * Invalidate cache entries for an event
   */
  invalidateEvent(eventId: string): number {
    let invalidated = 0;
    for (const [key] of this.cache) {
      if (key.startsWith(eventId)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  /**
   * Invalidate cache entries for a civilization
   */
  invalidateCivilization(civilizationId: string): number {
    let invalidated = 0;
    for (const [key] of this.cache) {
      if (key.includes(`:${civilizationId}:`)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  /**
   * Get most frequently accessed entries
   */
  getTopEntries(limit: number = 10): CacheEntry[] {
    const entries = Array.from(this.cache.values());
    entries.sort((a, b) => b.hitCount - a.hitCount);
    return entries.slice(0, limit);
  }

  /**
   * Get oldest entries (candidates for eviction)
   */
  getOldestEntries(limit: number = 10): CacheEntry[] {
    const entries = Array.from(this.cache.values());
    entries.sort((a, b) => a.timestamp - b.timestamp);
    return entries.slice(0, limit);
  }
}

/**
 * Narrative generation batch processor
 * Groups multiple narrative generation requests for efficiency
 */
export class NarrativeBatchProcessor {
  private queue: Array<{
    eventId: string;
    civilizationId: string;
    perspective: string;
    resolve: (narrative: string) => void;
    reject: (error: Error) => void;
  }> = [];

  private batchSize: number = 5;
  private batchDelay: number = 100; // ms
  private timer: NodeJS.Timeout | null = null;

  /**
   * Queue narrative generation request
   */
  async queueRequest(
    eventId: string,
    civilizationId: string,
    perspective: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      this.queue.push({
        eventId,
        civilizationId,
        perspective,
        resolve,
        reject,
      });

      // Start batch processing if not already running
      if (!this.timer) {
        if (this.queue.length >= this.batchSize) {
          this.processBatch();
        } else {
          this.timer = setTimeout(() => this.processBatch(), this.batchDelay);
        }
      }
    });
  }

  /**
   * Process queued requests as a batch
   */
  private async processBatch(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    const batch = this.queue.splice(0, this.batchSize);
    if (batch.length === 0) return;

    // Process batch items in parallel
    const promises = batch.map(async (item) => {
      try {
        // Placeholder: actual LLM call would go here
        // For now, return a mock narrative
        const narrative = `Generated narrative for ${item.perspective} perspective of event ${item.eventId}`;
        item.resolve(narrative);
      } catch (error) {
        item.reject(error instanceof Error ? error : new Error(String(error)));
      }
    });

    await Promise.all(promises);

    // Schedule next batch if queue is not empty
    if (this.queue.length > 0) {
      this.timer = setTimeout(() => this.processBatch(), this.batchDelay);
    }
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clear queue
   */
  clearQueue(): void {
    this.queue = [];
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/**
 * Narrative optimization engine
 * Identifies and reuses similar narratives
 */
export class NarrativeOptimizer {
  /**
   * Calculate similarity between two narratives (0-1)
   */
  static calculateSimilarity(narrative1: string, narrative2: string): number {
    const words1 = new Set(narrative1.toLowerCase().split(/\s+/));
    const words2 = new Set(narrative2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / (union.size || 1);
  }

  /**
   * Find similar narratives in cache
   */
  static findSimilarNarratives(
    narrative: string,
    cacheEntries: CacheEntry[],
    threshold: number = 0.7
  ): CacheEntry[] {
    return cacheEntries.filter(
      entry => this.calculateSimilarity(narrative, entry.narrative) >= threshold
    );
  }

  /**
   * Compress narrative by removing redundancy
   */
  static compressNarrative(narrative: string): string {
    // Remove extra whitespace
    let compressed = narrative.replace(/\s+/g, " ").trim();

    // Remove common filler phrases
    const fillers = [
      "it is said that",
      "it is believed that",
      "some say that",
      "according to",
    ];

    for (const filler of fillers) {
      compressed = compressed.replace(new RegExp(filler, "gi"), "");
    }

    return compressed;
  }

  /**
   * Estimate narrative generation cost (for prioritization)
   */
  static estimateGenerationCost(
    event: EventNode,
    civilization: CivilizationState,
    perspective: string
  ): number {
    let cost = 1.0;

    // Event importance increases cost
    cost *= 0.5 + (event.importance / 10) * 0.5;

    // Complex civilizations increase cost
    const complexity = (civilization.resources.technology || 1) + 
                      (civilization.resources.culture || 1);
    cost *= 0.5 + (complexity / 20) * 0.5;

    // Some perspectives are more expensive
    const perspectiveCosts: Record<string, number> = {
      victor: 1.0,
      loser: 1.0,
      neutral: 1.2,
      archaeologist: 1.5,
      alien: 1.8,
    };

    cost *= perspectiveCosts[perspective] || 1.0;

    return cost;
  }
}

/**
 * Global narrative cache instance
 */
export const globalNarrativeCache = new NarrativeCache();

/**
 * Global batch processor instance
 */
export const globalBatchProcessor = new NarrativeBatchProcessor();

/**
 * Progress Tracker for Galaxy Generation
 * Tracks and broadcasts generation progress in real-time
 */

export interface ProgressUpdate {
  galaxyId: number;
  stage: GenerationStage;
  progress: number; // 0-100
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

export enum GenerationStage {
  INITIALIZING = "initializing",
  CREATING_SPECIES = "creating-species",
  GENERATING_PLANETS = "generating-planets",
  ESTABLISHING_CIVILIZATIONS = "establishing-civilizations",
  GENERATING_EVENTS = "generating-events",
  FINDING_NARRATIVE_OPPORTUNITIES = "finding-narrative-opportunities",
  GENERATING_NARRATIVE_EVENTS = "generating-narrative-events",
  GENERATING_IMAGES = "generating-images",
  FINALIZING = "finalizing",
  COMPLETE = "complete",
  FAILED = "failed",
}

interface ProgressListener {
  (update: ProgressUpdate): void;
}

/**
 * In-memory progress tracker
 * In production, this would be backed by a database or message queue
 */
class ProgressTracker {
  private listeners: Map<number, Set<ProgressListener>> = new Map();
  private updates: Map<number, ProgressUpdate[]> = new Map();

  /**
   * Subscribe to progress updates for a galaxy
   */
  subscribe(galaxyId: number, listener: ProgressListener): () => void {
    if (!this.listeners.has(galaxyId)) {
      this.listeners.set(galaxyId, new Set());
    }

    this.listeners.get(galaxyId)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(galaxyId)?.delete(listener);
    };
  }

  /**
   * Emit a progress update
   */
  emit(update: ProgressUpdate): void {
    // Store update history
    if (!this.updates.has(update.galaxyId)) {
      this.updates.set(update.galaxyId, []);
    }
    this.updates.get(update.galaxyId)!.push(update);

    // Notify all listeners
    const listeners = this.listeners.get(update.galaxyId);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(update);
        } catch (error) {
          console.error("[ProgressTracker] Error in listener:", error);
        }
      });
    }

    // Log to console
    console.log(`[Progress] ${update.stage}: ${update.message} (${update.progress}%)`);
  }

  /**
   * Get progress history for a galaxy
   */
  getHistory(galaxyId: number): ProgressUpdate[] {
    return this.updates.get(galaxyId) || [];
  }

  /**
   * Get latest progress for a galaxy
   */
  getLatest(galaxyId: number): ProgressUpdate | undefined {
    const history = this.updates.get(galaxyId);
    return history?.[history.length - 1];
  }

  /**
   * Clear progress data for a galaxy
   */
  clear(galaxyId: number): void {
    this.listeners.delete(galaxyId);
    this.updates.delete(galaxyId);
  }

  /**
   * Clear all progress data
   */
  clearAll(): void {
    this.listeners.clear();
    this.updates.clear();
  }
}

export const progressTracker = new ProgressTracker();

/**
 * Helper to create progress update
 */
export function createProgressUpdate(
  galaxyId: number,
  stage: GenerationStage,
  progress: number,
  message: string,
  details?: Record<string, unknown>
): ProgressUpdate {
  return {
    galaxyId,
    stage,
    progress: Math.min(100, Math.max(0, progress)),
    message,
    timestamp: new Date(),
    details,
  };
}

/**
 * Helper to emit progress with automatic logging
 */
export function emitProgress(
  galaxyId: number,
  stage: GenerationStage,
  progress: number,
  message: string,
  details?: Record<string, unknown>
): void {
  const update = createProgressUpdate(galaxyId, stage, progress, message, details);
  progressTracker.emit(update);
}

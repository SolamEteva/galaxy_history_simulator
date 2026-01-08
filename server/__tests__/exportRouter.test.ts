import { describe, it, expect, beforeEach, vi } from "vitest";
import { exportRouter } from "../exportRouter";
import { progressTracker } from "../progressTracker";

describe("Export Router", () => {
  beforeEach(() => {
    // Clear progress data before each test
    progressTracker.clear(1);
  });

  describe("Progress Tracking", () => {
    it("should track progress updates", () => {
      const galaxyId = 1;

      // Simulate progress updates
      progressTracker.update(galaxyId, "initializing", 0, "Starting galaxy generation");
      progressTracker.update(galaxyId, "creating-species", 20, "Creating 5 species");
      progressTracker.update(galaxyId, "generating-planets", 40, "Generating 25 planets");

      const history = progressTracker.getHistory(galaxyId);
      expect(history.length).toBe(3);
      expect(history[0].stage).toBe("initializing");
      expect(history[1].stage).toBe("creating-species");
      expect(history[2].stage).toBe("generating-planets");
    });

    it("should get latest progress", () => {
      const galaxyId = 2;

      progressTracker.update(galaxyId, "initializing", 0, "Starting");
      progressTracker.update(galaxyId, "creating-species", 20, "Creating species");

      const latest = progressTracker.getLatest(galaxyId);
      expect(latest?.stage).toBe("creating-species");
      expect(latest?.progress).toBe(20);
      expect(latest?.message).toBe("Creating species");
    });

    it("should track progress with details", () => {
      const galaxyId = 3;

      progressTracker.update(
        galaxyId,
        "creating-species",
        50,
        "Created 3 of 5 species",
        {
          speciesCreated: 3,
          totalSpecies: 5,
        }
      );

      const latest = progressTracker.getLatest(galaxyId);
      expect(latest?.details?.speciesCreated).toBe(3);
      expect(latest?.details?.totalSpecies).toBe(5);
    });

    it("should clear progress history", () => {
      const galaxyId = 4;

      progressTracker.update(galaxyId, "initializing", 0, "Starting");
      progressTracker.update(galaxyId, "creating-species", 20, "Creating");

      let history = progressTracker.getHistory(galaxyId);
      expect(history.length).toBe(2);

      progressTracker.clear(galaxyId);

      history = progressTracker.getHistory(galaxyId);
      expect(history.length).toBe(0);
    });

    it("should handle multiple galaxies independently", () => {
      progressTracker.update(1, "initializing", 0, "Galaxy 1");
      progressTracker.update(2, "creating-species", 30, "Galaxy 2");
      progressTracker.update(3, "generating-planets", 60, "Galaxy 3");

      const history1 = progressTracker.getHistory(1);
      const history2 = progressTracker.getHistory(2);
      const history3 = progressTracker.getHistory(3);

      expect(history1[0].message).toBe("Galaxy 1");
      expect(history2[0].message).toBe("Galaxy 2");
      expect(history3[0].message).toBe("Galaxy 3");
    });

    it("should return empty history for non-existent galaxy", () => {
      const history = progressTracker.getHistory(999);
      expect(history.length).toBe(0);
    });

    it("should return null for latest progress on non-existent galaxy", () => {
      const latest = progressTracker.getLatest(999);
      expect(latest).toBeNull();
    });

    it("should maintain timestamp order", () => {
      const galaxyId = 5;

      progressTracker.update(galaxyId, "initializing", 0, "Step 1");
      // Small delay to ensure different timestamps
      const history1 = progressTracker.getHistory(galaxyId);

      progressTracker.update(galaxyId, "creating-species", 25, "Step 2");
      const history2 = progressTracker.getHistory(galaxyId);

      progressTracker.update(galaxyId, "generating-planets", 50, "Step 3");
      const history3 = progressTracker.getHistory(galaxyId);

      expect(history3.length).toBe(3);
      expect(history3[0].timestamp <= history3[1].timestamp).toBe(true);
      expect(history3[1].timestamp <= history3[2].timestamp).toBe(true);
    });

    it("should update progress percentage correctly", () => {
      const galaxyId = 6;

      for (let i = 0; i <= 100; i += 10) {
        progressTracker.update(galaxyId, "generating-events", i, `Progress: ${i}%`);
      }

      const latest = progressTracker.getLatest(galaxyId);
      expect(latest?.progress).toBe(100);
    });

    it("should handle stage transitions", () => {
      const galaxyId = 7;
      const stages = [
        "initializing",
        "creating-species",
        "generating-planets",
        "establishing-civilizations",
        "generating-events",
        "finalizing",
        "complete",
      ];

      stages.forEach((stage, idx) => {
        progressTracker.update(galaxyId, stage, (idx / stages.length) * 100, `Stage: ${stage}`);
      });

      const history = progressTracker.getHistory(galaxyId);
      expect(history.length).toBe(stages.length);

      stages.forEach((stage, idx) => {
        expect(history[idx].stage).toBe(stage);
      });
    });
  });

  describe("Progress Data Structure", () => {
    it("should have valid progress update structure", () => {
      const galaxyId = 8;
      progressTracker.update(galaxyId, "initializing", 0, "Starting");

      const latest = progressTracker.getLatest(galaxyId);
      expect(latest).toBeDefined();
      expect(latest?.stage).toBeDefined();
      expect(latest?.progress).toBeDefined();
      expect(latest?.message).toBeDefined();
      expect(latest?.timestamp).toBeDefined();
      expect(latest?.timestamp instanceof Date).toBe(true);
    });

    it("should validate progress percentage bounds", () => {
      const galaxyId = 9;

      progressTracker.update(galaxyId, "initializing", 0, "Start");
      let latest = progressTracker.getLatest(galaxyId);
      expect(latest?.progress).toBe(0);

      progressTracker.update(galaxyId, "finalizing", 100, "Complete");
      latest = progressTracker.getLatest(galaxyId);
      expect(latest?.progress).toBe(100);
    });
  });
});

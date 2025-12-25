import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  SimulationError,
  ErrorCategory,
  ErrorSeverity,
  Validator,
  retryWithBackoff,
  withTimeout,
  safeJsonParse,
  ErrorLogger,
  safeOperation,
  Ok,
  Err,
} from "../errorHandling";

describe("Error Handling Framework", () => {
  describe("SimulationError", () => {
    it("should create a SimulationError with all properties", () => {
      const error = new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        "Test error",
        { testData: "value" }
      );

      expect(error.category).toBe(ErrorCategory.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.message).toBe("Test error");
      expect(error.context).toEqual({ testData: "value" });
    });

    it("should convert to JSON correctly", () => {
      const originalError = new Error("Original");
      const error = new SimulationError(
        ErrorCategory.DATABASE,
        ErrorSeverity.CRITICAL,
        "Database error",
        { query: "SELECT *" },
        originalError
      );

      const json = error.toJSON();
      expect(json.category).toBe(ErrorCategory.DATABASE);
      expect(json.severity).toBe(ErrorSeverity.CRITICAL);
      expect(json.message).toBe("Database error");
      expect(json.context).toEqual({ query: "SELECT *" });
    });
  });

  describe("Validator.validateGalaxyConfig", () => {
    it("should accept valid galaxy config", () => {
      const validConfig = {
        galaxyName: "Andromeda",
        speciesCount: 5,
        totalYears: 50000,
        userId: 1,
      };

      expect(() => Validator.validateGalaxyConfig(validConfig)).not.toThrow();
    });

    it("should reject missing galaxy name", () => {
      const invalidConfig = {
        galaxyName: "",
        speciesCount: 5,
        totalYears: 50000,
        userId: 1,
      };

      expect(() => Validator.validateGalaxyConfig(invalidConfig)).toThrow(SimulationError);
    });

    it("should reject invalid species count", () => {
      const invalidConfig = {
        galaxyName: "Andromeda",
        speciesCount: 10, // > 8
        totalYears: 50000,
        userId: 1,
      };

      expect(() => Validator.validateGalaxyConfig(invalidConfig)).toThrow(SimulationError);
    });

    it("should reject invalid total years", () => {
      const invalidConfig = {
        galaxyName: "Andromeda",
        speciesCount: 5,
        totalYears: 500, // < 1000
        userId: 1,
      };

      expect(() => Validator.validateGalaxyConfig(invalidConfig)).toThrow(SimulationError);
    });

    it("should reject invalid user ID", () => {
      const invalidConfig = {
        galaxyName: "Andromeda",
        speciesCount: 5,
        totalYears: 50000,
        userId: "not-a-number",
      };

      expect(() => Validator.validateGalaxyConfig(invalidConfig)).toThrow(SimulationError);
    });
  });

  describe("Validator.validateEventData", () => {
    it("should accept valid event data", () => {
      const validEvent = {
        title: "First Contact",
        eventType: "first-contact",
        year: 5000,
        importance: 8,
      };

      expect(() => Validator.validateEventData(validEvent)).not.toThrow();
    });

    it("should reject missing title", () => {
      const invalidEvent = {
        title: "",
        eventType: "war",
        year: 5000,
        importance: 7,
      };

      expect(() => Validator.validateEventData(invalidEvent)).toThrow(SimulationError);
    });

    it("should reject invalid year", () => {
      const invalidEvent = {
        title: "War",
        eventType: "war",
        year: -100,
        importance: 7,
      };

      expect(() => Validator.validateEventData(invalidEvent)).toThrow(SimulationError);
    });

    it("should reject invalid importance", () => {
      const invalidEvent = {
        title: "Event",
        eventType: "discovery",
        year: 5000,
        importance: 15, // > 10
      };

      expect(() => Validator.validateEventData(invalidEvent)).toThrow(SimulationError);
    });
  });

  describe("Validator.validateLLMResponse", () => {
    it("should accept valid LLM response", () => {
      const validResponse = {
        choices: [
          {
            message: {
              content: "Generated event",
            },
          },
        ],
      };

      expect(() => Validator.validateLLMResponse(validResponse)).not.toThrow();
    });

    it("should reject response with no choices", () => {
      const invalidResponse = {
        choices: [],
      };

      expect(() => Validator.validateLLMResponse(invalidResponse)).toThrow(SimulationError);
    });

    it("should reject response with missing content", () => {
      const invalidResponse = {
        choices: [
          {
            message: {},
          },
        ],
      };

      expect(() => Validator.validateLLMResponse(invalidResponse)).toThrow(SimulationError);
    });

    it("should reject malformed response", () => {
      const invalidResponse = null;

      expect(() => Validator.validateLLMResponse(invalidResponse)).toThrow(SimulationError);
    });
  });

  describe("retryWithBackoff", () => {
    it("should succeed on first attempt", async () => {
      const fn = vi.fn().mockResolvedValueOnce("success");

      const result = await retryWithBackoff(fn, 3, 100);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should retry on failure and succeed", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("Fail 1"))
        .mockRejectedValueOnce(new Error("Fail 2"))
        .mockResolvedValueOnce("success");

      const result = await retryWithBackoff(fn, 3, 50);

      expect(result).toBe("success");
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it("should throw after max retries exceeded", async () => {
      const fn = vi.fn().mockRejectedValue(new Error("Always fails"));

      await expect(retryWithBackoff(fn, 2, 50)).rejects.toThrow(SimulationError);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should apply exponential backoff", async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error("Fail"))
        .mockResolvedValueOnce("success");

      const startTime = Date.now();
      await retryWithBackoff(fn, 2, 100, 2);
      const elapsed = Date.now() - startTime;

      // Should wait at least 100ms (initial delay)
      expect(elapsed).toBeGreaterThanOrEqual(100);
    });
  });

  describe("withTimeout", () => {
    it("should resolve before timeout", async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve("success"), 50));

      const result = await withTimeout(promise, 200, "test-operation");

      expect(result).toBe("success");
    });

    it("should throw on timeout", async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve("success"), 200));

      await expect(withTimeout(promise, 50, "test-operation")).rejects.toThrow(SimulationError);
    });

    it("should include operation name in error", async () => {
      const promise = new Promise((resolve) => setTimeout(() => resolve("success"), 200));

      try {
        await withTimeout(promise, 50, "my-operation");
      } catch (error) {
        if (error instanceof SimulationError) {
          expect(error.message).toContain("my-operation");
          expect(error.category).toBe(ErrorCategory.TIMEOUT);
        }
      }
    });
  });

  describe("safeJsonParse", () => {
    it("should parse valid JSON", () => {
      const json = '{"key": "value", "number": 42}';

      const result = safeJsonParse<any>(json, "test");

      expect(result).toEqual({ key: "value", number: 42 });
    });

    it("should throw on invalid JSON", () => {
      const json = '{invalid json}';

      expect(() => safeJsonParse(json, "test")).toThrow(SimulationError);
    });

    it("should include context in error", () => {
      const json = '{invalid}';

      try {
        safeJsonParse(json, "my-context");
      } catch (error) {
        if (error instanceof SimulationError) {
          expect(error.context?.context).toBe("my-context");
        }
      }
    });
  });

  describe("Result type", () => {
    it("should create Ok result", () => {
      const result = Ok("success");

      expect(result.ok).toBe(true);
      expect(result.value).toBe("success");
    });

    it("should create Err result", () => {
      const error = new SimulationError(ErrorCategory.VALIDATION, ErrorSeverity.HIGH, "Error");
      const result = Err(error);

      expect(result.ok).toBe(false);
      expect(result.error).toBe(error);
    });
  });

  describe("safeOperation", () => {
    it("should return Ok on success", async () => {
      const operation = vi.fn().mockResolvedValueOnce("success");

      const result = await safeOperation(operation, "test-op");

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe("success");
      }
    });

    it("should return Err on failure", async () => {
      const operation = vi.fn().mockRejectedValueOnce(new Error("Failed"));

      const result = await safeOperation(operation, "test-op");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBeInstanceOf(SimulationError);
      }
    });

    it("should apply timeout", async () => {
      const operation = vi
        .fn()
        .mockImplementationOnce(
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve("success"), 5000);
            })
        );

      const result = await safeOperation(operation, "test-op", 100);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.category).toBe(ErrorCategory.TIMEOUT);
      }
    });

    it("should handle SimulationError correctly", async () => {
      const simError = new SimulationError(ErrorCategory.DATABASE, ErrorSeverity.HIGH, "DB Error");
      const operation = vi.fn().mockRejectedValueOnce(simError);

      const result = await safeOperation(operation, "test-op");

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe(simError);
      }
    });
  });

  describe("ErrorLogger", () => {
    it("should log SimulationError", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new SimulationError(
        ErrorCategory.VALIDATION,
        ErrorSeverity.HIGH,
        "Test error",
        { field: "value" }
      );

      ErrorLogger.log(error, "test-context");

      expect(consoleSpy).toHaveBeenCalled();
      const callArgs = consoleSpy.mock.calls[0][0];
      expect(callArgs).toContain("HIGH");
      expect(callArgs).toContain("validation");

      consoleSpy.mockRestore();
    });

    it("should log unknown errors", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const error = new Error("Unknown error");

      ErrorLogger.logUnknown(error, "test-context");

      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});

/**
 * Input Validation and Constraint Checking Middleware
 * 
 * Provides comprehensive validation for all inputs with detailed error messages
 * and constraint enforcement for seamless architect interaction.
 */

import { AppError, ErrorCode } from "./errorHandler";

export interface ValidationRule {
  field: string;
  validate: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Validator class for complex validation scenarios
 */
export class Validator {
  private rules: ValidationRule[] = [];

  /**
   * Add validation rule
   */
  addRule(rule: ValidationRule): this {
    this.rules.push(rule);
    return this;
  }

  /**
   * Validate object against rules
   */
  validate(obj: Record<string, any>): ValidationResult {
    const errors: Record<string, string> = {};

    for (const rule of this.rules) {
      const result = rule.validate(obj[rule.field]);

      if (result !== true) {
        errors[rule.field] = typeof result === "string" ? result : rule.message || `Invalid ${rule.field}`;
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Validate or throw error
   */
  validateOrThrow(obj: Record<string, any>, requestId?: string): void {
    const result = this.validate(obj);

    if (!result.valid) {
      throw new AppError(ErrorCode.INVALID_INPUT, "Validation failed", {
        details: { errors: result.errors },
        userMessage: `Please fix the following errors: ${Object.entries(result.errors)
          .map(([field, error]) => `${field}: ${error}`)
          .join("; ")}`,
        requestId,
      });
    }
  }
}

/**
 * Common validation functions
 */
export const validators = {
  /**
   * Required field validator
   */
  required: (value: any): boolean => {
    return value !== null && value !== undefined && value !== "";
  },

  /**
   * Email validator
   */
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * URL validator
   */
  url: (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Number range validator
   */
  range: (min: number, max: number) => (value: number): boolean => {
    return value >= min && value <= max;
  },

  /**
   * String length validator
   */
  length: (min: number, max: number) => (value: string): boolean => {
    return value.length >= min && value.length <= max;
  },

  /**
   * Pattern validator
   */
  pattern: (pattern: RegExp) => (value: string): boolean => {
    return pattern.test(value);
  },

  /**
   * Array length validator
   */
  arrayLength: (min: number, max: number) => (value: any[]): boolean => {
    return Array.isArray(value) && value.length >= min && value.length <= max;
  },

  /**
   * Enum validator
   */
  enum: (allowedValues: any[]) => (value: any): boolean => {
    return allowedValues.includes(value);
  },

  /**
   * Date validator
   */
  date: (value: any): boolean => {
    return value instanceof Date && !isNaN(value.getTime());
  },

  /**
   * ISO date string validator
   */
  isoDate: (value: string): boolean => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(value) && !isNaN(Date.parse(value));
  },

  /**
   * UUID validator
   */
  uuid: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  },

  /**
   * Positive number validator
   */
  positive: (value: number): boolean => {
    return value > 0;
  },

  /**
   * Non-negative number validator
   */
  nonNegative: (value: number): boolean => {
    return value >= 0;
  },

  /**
   * Integer validator
   */
  integer: (value: number): boolean => {
    return Number.isInteger(value);
  },

  /**
   * Custom validator factory
   */
  custom: (fn: (value: any) => boolean | string) => fn,
};

/**
 * Input sanitization utilities
 */
export const sanitizers = {
  /**
   * Trim whitespace
   */
  trim: (value: string): string => {
    return value.trim();
  },

  /**
   * Convert to lowercase
   */
  toLowerCase: (value: string): string => {
    return value.toLowerCase();
  },

  /**
   * Convert to uppercase
   */
  toUpperCase: (value: string): string => {
    return value.toUpperCase();
  },

  /**
   * Remove special characters
   */
  removeSpecialChars: (value: string): string => {
    return value.replace(/[^a-zA-Z0-9\s]/g, "");
  },

  /**
   * Escape HTML
   */
  escapeHtml: (value: string): string => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return value.replace(/[&<>"']/g, (char) => map[char]);
  },

  /**
   * Parse JSON safely
   */
  parseJSON: (value: string): any => {
    try {
      return JSON.parse(value);
    } catch {
      throw new AppError(ErrorCode.INVALID_INPUT, "Invalid JSON", {
        userMessage: "The provided JSON is invalid. Please check the syntax.",
      });
    }
  },
};

/**
 * Constraint validators for business logic
 */
export const constraints = {
  /**
   * Check task priority is valid
   */
  validTaskPriority: (priority: string): boolean => {
    return ["low", "medium", "high", "critical"].includes(priority);
  },

  /**
   * Check task category is valid
   */
  validTaskCategory: (category: string): boolean => {
    return ["feature", "bug-fix", "documentation", "optimization", "testing"].includes(category);
  },

  /**
   * Check task status is valid
   */
  validTaskStatus: (status: string): boolean => {
    return ["pending", "in-progress", "completed", "failed"].includes(status);
  },

  /**
   * Check figure archetype is valid
   */
  validFigureArchetype: (archetype: string): boolean => {
    return [
      "king",
      "queen",
      "general",
      "scientist",
      "artist",
      "engineer",
      "prophet",
      "guru",
      "merchant",
      "explorer",
    ].includes(archetype);
  },

  /**
   * Check civilization name is valid
   */
  validCivilizationName: (name: string): boolean => {
    return name.length >= 2 && name.length <= 100 && /^[a-zA-Z0-9\s\-']+$/.test(name);
  },

  /**
   * Check event title is valid
   */
  validEventTitle: (title: string): boolean => {
    return title.length >= 5 && title.length <= 200;
  },

  /**
   * Check year is within valid range
   */
  validYear: (year: number): boolean => {
    return year >= -10000 && year <= 10000;
  },

  /**
   * Check species count is valid
   */
  validSpeciesCount: (count: number): boolean => {
    return count >= 1 && count <= 8;
  },

  /**
   * Check simulation length is valid
   */
  validSimulationLength: (length: number): boolean => {
    return length >= 100 && length <= 100000;
  },
};

/**
 * Create a validated input object
 */
export function createValidatedInput<T extends Record<string, any>>(
  input: any,
  schema: Record<keyof T, (value: any) => boolean | string>,
  requestId?: string
): T {
  const errors: Record<string, string> = {};

  for (const [key, validator] of Object.entries(schema)) {
    const result = validator(input[key]);
    if (result !== true) {
      errors[key] = typeof result === "string" ? result : `Invalid ${key}`;
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new AppError(ErrorCode.INVALID_INPUT, "Input validation failed", {
      details: { errors },
      userMessage: `Please fix the following errors: ${Object.entries(errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join("; ")}`,
      requestId,
    });
  }

  return input as T;
}

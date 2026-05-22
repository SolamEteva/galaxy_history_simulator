/**
 * Narrative Validation Engine
 * Validates narratives against causal constraints and detects contradictions
 * 
 * PRINCIPLE: Narratives must respect the underlying event causality
 * - Contradictions between perspectives are expected and valuable
 * - But contradictions with causal facts are errors
 * - Validation ensures narrative depth without breaking causality
 */

import type { CivilizationState, EventNode } from "../../types/narrative";
import type { PerspectiveNarrative, MultiPerspectiveEvent } from "./multiPerspectiveNarrative";

export interface NarrativeValidationResult {
  isValid: boolean;
  causalityViolations: string[];
  constraintViolations: string[];
  contradictionAnalysis: {
    perspective1: string;
    perspective2: string;
    contradictionType: "factual" | "interpretation" | "emphasis";
    severity: number; // 0-1
    isExpected: boolean;
  }[];
  confidenceScore: number; // 0-1
}

export interface ContradictionAnalysis {
  perspective1: string;
  perspective2: string;
  contradictedClaims: string[];
  contradictionType: "factual" | "interpretation" | "emphasis";
  severity: number;
  isExpected: boolean;
}

/**
 * Validate narrative against causal constraints
 */
export function validateCausality(
  narrative: string,
  event: EventNode,
  civilization: CivilizationState
): {
  violations: string[];
  isValid: boolean;
} {
  const violations: string[] = [];

  // Check 1: Event type consistency
  const eventTypeKeywords: Record<string, string[]> = {
    war: ["battle", "conflict", "military", "attack", "defeat", "victory"],
    alliance: ["alliance", "treaty", "cooperation", "united", "joined"],
    economic_crisis: ["economic", "trade", "famine", "poverty", "collapse"],
    plague: ["disease", "plague", "epidemic", "illness", "death"],
    discovery: ["discovered", "found", "innovation", "breakthrough", "revealed"],
    technological_advancement: ["technology", "advancement", "innovation", "development"],
    cultural_shift: ["culture", "tradition", "belief", "custom", "changed"],
    migration: ["migration", "moved", "relocated", "traveled", "journey"],
  };

  const keywords = eventTypeKeywords[event.eventType] || [];
  const narrativeLower = narrative.toLowerCase();
  const hasRelevantKeywords = keywords.some(k => narrativeLower.includes(k));

  if (keywords.length > 0 && !hasRelevantKeywords) {
    violations.push(`Narrative doesn't mention key aspects of ${event.eventType} event`);
  }

  // Check 2: Temporal consistency
  if (event.year > 0) {
    // Narrative should reference the year or era appropriately
    if (!narrativeLower.includes(event.year.toString()) && 
        !narrativeLower.includes("year") && 
        !narrativeLower.includes("era")) {
      // Not a violation, just a note
    }
  }

  // Check 3: Civilization capability consistency
  const technology = civilization.resources.technology || 1;
  const highTechKeywords = ["advanced", "sophisticated", "complex", "technological"];
  const lowTechKeywords = ["primitive", "simple", "basic", "crude"];

  if (technology < 3) {
    const hasHighTechClaims = highTechKeywords.some(k => narrativeLower.includes(k));
    if (hasHighTechClaims) {
      violations.push(`Narrative claims advanced technology but civilization is at tech level ${technology}`);
    }
  }

  if (technology > 7) {
    const hasLowTechClaims = lowTechKeywords.some(k => narrativeLower.includes(k));
    if (hasLowTechClaims) {
      violations.push(`Narrative claims primitive technology but civilization is at tech level ${technology}`);
    }
  }

  // Check 4: Population consistency
  const population = civilization.resources.population || 1000;
  if (population < 10000) {
    if (narrativeLower.includes("empire") || narrativeLower.includes("vast armies")) {
      violations.push(`Narrative claims empire/vast armies but population is only ${population}`);
    }
  }

  // Check 5: Importance consistency
  if (event.importance >= 8) {
    // Major events should have significant narrative weight
    if (narrative.length < 50) {
      violations.push(`Narrative too brief for importance level ${event.importance}`);
    }
  }

  return {
    violations,
    isValid: violations.length === 0,
  };
}

/**
 * Validate narrative against civilization constraints
 */
export function validateConstraints(
  narrative: string,
  civilization: CivilizationState,
  event: EventNode
): {
  violations: string[];
  isValid: boolean;
} {
  const violations: string[] = [];

  // Check 1: Unity coefficient consistency
  const unity = civilization.unityCoefficient ?? 0.5;
  if (unity < 0.3) {
    // Low unity should show internal conflict
    if (!narrative.toLowerCase().includes("conflict") && 
        !narrative.toLowerCase().includes("division") &&
        !narrative.toLowerCase().includes("discord")) {
      violations.push(`Low unity civilization (${unity}) narrative doesn't reflect internal conflict`);
    }
  }

  // Check 2: Strategy consistency
  if (civilization.strategy?.expansionist > 0.6) {
    if (event.eventType === "alliance" && !narrative.toLowerCase().includes("expand")) {
      // Expansionist civilizations should frame alliances as expansion opportunities
      violations.push(`Expansionist civilization doesn't frame event as expansion opportunity`);
    }
  }

  if (civilization.strategy?.peaceful > 0.6) {
    if (event.eventType === "war" && narrative.toLowerCase().includes("conquest")) {
      violations.push(`Peaceful civilization narrative glorifies conquest`);
    }
  }

  // Check 3: Trait consistency
  if (civilization.traits?.includes("isolationist")) {
    if (event.eventType === "alliance" || event.eventType === "first_contact") {
      if (!narrative.toLowerCase().includes("reluctant") && 
          !narrative.toLowerCase().includes("forced")) {
        violations.push(`Isolationist civilization doesn't express reluctance about contact`);
      }
    }
  }

  // Check 4: Resource consistency
  const resources = civilization.resources;
  if ((resources.food || 0) < 50) {
    if (narrative.toLowerCase().includes("feast") || narrative.toLowerCase().includes("abundance")) {
      violations.push(`Narrative claims food abundance but civilization has low food resources`);
    }
  }

  return {
    violations,
    isValid: violations.length === 0,
  };
}

/**
 * Detect contradictions between two perspectives
 */
export function detectContradictionBetween(
  narrative1: string,
  narrative2: string,
  perspective1: string,
  perspective2: string
): ContradictionAnalysis | null {
  const claims1 = extractClaims(narrative1);
  const claims2 = extractClaims(narrative2);

  const contradictedClaims: string[] = [];
  let contradictionType: "factual" | "interpretation" | "emphasis" = "interpretation";

  // Check for factual contradictions
  for (const claim1 of claims1) {
    for (const claim2 of claims2) {
      if (areClaimsContradictory(claim1, claim2)) {
        contradictedClaims.push(`${claim1} vs ${claim2}`);
        
        // Determine contradiction type
        if (isFactualClaim(claim1) && isFactualClaim(claim2)) {
          contradictionType = "factual";
        } else if (isEmphasisClaim(claim1) && isEmphasisClaim(claim2)) {
          contradictionType = "emphasis";
        }
      }
    }
  }

  if (contradictedClaims.length === 0) {
    return null;
  }

  // Calculate severity (0-1)
  const severity = Math.min(1, contradictedClaims.length / 5);

  // Determine if contradiction is expected
  const isExpected = isExpectedContradiction(perspective1, perspective2);

  return {
    perspective1,
    perspective2,
    contradictedClaims,
    contradictionType,
    severity,
    isExpected,
  };
}

/**
 * Extract claims from narrative text
 */
function extractClaims(narrative: string): string[] {
  // Simple claim extraction: split by sentences and filter
  const sentences = narrative.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.map(s => s.trim());
}

/**
 * Check if two claims are contradictory
 */
function areClaimsContradictory(claim1: string, claim2: string): boolean {
  const opposites: [string, string][] = [
    ["victory", "defeat"],
    ["triumph", "loss"],
    ["success", "failure"],
    ["gained", "lost"],
    ["expanded", "contracted"],
    ["strengthened", "weakened"],
    ["united", "divided"],
    ["peace", "war"],
    ["justice", "injustice"],
    ["righteous", "evil"],
  ];

  const lower1 = claim1.toLowerCase();
  const lower2 = claim2.toLowerCase();

  for (const [word1, word2] of opposites) {
    if ((lower1.includes(word1) && lower2.includes(word2)) ||
        (lower1.includes(word2) && lower2.includes(word1))) {
      return true;
    }
  }

  return false;
}

/**
 * Check if claim is factual (verifiable) vs interpretive
 */
function isFactualClaim(claim: string): boolean {
  const factualKeywords = ["killed", "died", "destroyed", "built", "discovered", "occurred", "happened"];
  return factualKeywords.some(k => claim.toLowerCase().includes(k));
}

/**
 * Check if claim is about emphasis/interpretation
 */
function isEmphasisClaim(claim: string): boolean {
  const emphasisKeywords = ["righteous", "just", "evil", "wrong", "glorious", "tragic", "magnificent"];
  return emphasisKeywords.some(k => claim.toLowerCase().includes(k));
}

/**
 * Determine if contradiction between two perspectives is expected
 */
function isExpectedContradiction(perspective1: string, perspective2: string): boolean {
  const expectedPairs = [
    ["victor", "loser"],
    ["victor", "alien"],
    ["loser", "alien"],
    ["archaeologist", "victor"],
    ["archaeologist", "loser"],
  ];

  return expectedPairs.some(
    ([p1, p2]) => (perspective1 === p1 && perspective2 === p2) || 
                   (perspective1 === p2 && perspective2 === p1)
  );
}

/**
 * Validate all perspectives in a multi-perspective event
 */
export function validateMultiPerspectiveEvent(
  multiEvent: MultiPerspectiveEvent,
  civilization: CivilizationState
): Map<string, NarrativeValidationResult> {
  const results = new Map<string, NarrativeValidationResult>();

  for (const [perspectiveName, perspective] of multiEvent.perspectives) {
    const causalityCheck = validateCausality(perspective.narrative, multiEvent.event, civilization);
    const constraintCheck = validateConstraints(perspective.narrative, civilization, multiEvent.event);

    // Detect contradictions with other perspectives
    const contradictions: ContradictionAnalysis[] = [];
    for (const [otherName, otherPerspective] of multiEvent.perspectives) {
      if (perspectiveName !== otherName) {
        const contradiction = detectContradictionBetween(
          perspective.narrative,
          otherPerspective.narrative,
          perspectiveName,
          otherName
        );
        if (contradiction) {
          contradictions.push(contradiction);
        }
      }
    }

    // Calculate confidence score
    const violationCount = causalityCheck.violations.length + constraintCheck.violations.length;
    const confidenceScore = Math.max(0, 1 - violationCount * 0.15);

    results.set(perspectiveName, {
      isValid: causalityCheck.isValid && constraintCheck.isValid,
      causalityViolations: causalityCheck.violations,
      constraintViolations: constraintCheck.violations,
      contradictionAnalysis: contradictions,
      confidenceScore,
    });
  }

  return results;
}

/**
 * Generate validation report
 */
export function generateValidationReport(
  validationResults: Map<string, NarrativeValidationResult>
): string {
  let report = "# Narrative Validation Report\n\n";

  for (const [perspective, result] of validationResults) {
    report += `## ${perspective.toUpperCase()}\n`;
    report += `- Valid: ${result.isValid ? "✓" : "✗"}\n`;
    report += `- Confidence: ${(result.confidenceScore * 100).toFixed(1)}%\n`;

    if (result.causalityViolations.length > 0) {
      report += `- Causality Violations: ${result.causalityViolations.join("; ")}\n`;
    }

    if (result.constraintViolations.length > 0) {
      report += `- Constraint Violations: ${result.constraintViolations.join("; ")}\n`;
    }

    if (result.contradictionAnalysis.length > 0) {
      report += `- Contradictions: ${result.contradictionAnalysis.length}\n`;
      for (const contradiction of result.contradictionAnalysis) {
        report += `  - vs ${contradiction.perspective2}: ${contradiction.contradictionType} (severity: ${(contradiction.severity * 100).toFixed(0)}%)\n`;
      }
    }

    report += "\n";
  }

  return report;
}

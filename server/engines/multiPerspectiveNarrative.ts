/**
 * Multi-Perspective Narrative Generation Engine
 * Generates five distinct perspectives on the same event:
 * 1. Victor - The winning/benefiting party
 * 2. Loser - The defeated/harmed party
 * 3. Neutral Observer - Objective historian perspective
 * 4. Archaeologist - Future scholar analyzing the event
 * 5. Alien Visitor - Non-human perspective on human-like events
 * 
 * PRINCIPLE: Truth is multifaceted. Each perspective reveals different aspects
 * and may contradict others, creating narrative depth and hidden truths.
 */

import { invokeLLM } from "../_core/llm";
import type { CivilizationState, EventNode } from "../../types/narrative";

export interface PerspectiveNarrative {
  perspective: "victor" | "loser" | "neutral" | "archaeologist" | "alien";
  narrative: string;
  tone: string; // triumphant, bitter, analytical, scholarly, detached
  bias: number; // 0-1, how biased this perspective is
  hiddenTruths: string[]; // Aspects this perspective obscures or reveals
  contradictions: string[]; // What this perspective contradicts from other views
  confidence: number; // 0-1, how confident this narrator is
}

export interface MultiPerspectiveEvent {
  event: EventNode;
  perspectives: Map<string, PerspectiveNarrative>;
  contradictionMap: Map<string, string[]>; // Which perspectives contradict which
  revealedTruths: string[]; // Truths that emerge from comparing perspectives
  hiddenTruths: string[]; // Truths obscured by all perspectives
}

/**
 * Generate victor perspective narrative
 * Triumphant, self-serving, emphasizes victory and minimizes costs
 */
export async function generateVictorPerspective(
  event: EventNode,
  victorCivilization: CivilizationState,
  loserCivilization: CivilizationState,
  context: {
    recentEvents: EventNode[];
    historicalContext: string;
  }
): Promise<PerspectiveNarrative> {
  const prompt = `
You are a historian from the VICTOR civilization in this event. Write a triumphant account that emphasizes your civilization's achievement and minimizes costs.

VICTOR CIVILIZATION: ${victorCivilization.name}
LOSER CIVILIZATION: ${loserCivilization.name}
EVENT: ${event.title}
YEAR: ${event.year}

Write a 2-3 sentence narrative that:
1. Celebrates the victory and its righteousness
2. Emphasizes the victor's strength and wisdom
3. Minimizes the costs and suffering
4. Frames the outcome as inevitable and deserved

TONE: Triumphant, confident, self-serving
NARRATIVE:
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a triumphant historian writing from the victor's perspective. Emphasize achievement and minimize costs.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const narrative = typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : event.description;

    return {
      perspective: "victor",
      narrative,
      tone: "triumphant",
      bias: 0.8,
      hiddenTruths: ["Actual costs of victory", "Suffering of defeated", "Long-term consequences"],
      contradictions: [],
      confidence: 0.9,
    };
  } catch (error) {
    console.error("Victor narrative generation failed:", error);
    return {
      perspective: "victor",
      narrative: `${victorCivilization.name} achieved victory in ${event.title}.`,
      tone: "triumphant",
      bias: 0.8,
      hiddenTruths: ["Actual costs"],
      contradictions: [],
      confidence: 0.5,
    };
  }
}

/**
 * Generate loser perspective narrative
 * Bitter, resentful, emphasizes injustice and suffering
 */
export async function generateLoserPerspective(
  event: EventNode,
  victorCivilization: CivilizationState,
  loserCivilization: CivilizationState,
  context: {
    recentEvents: EventNode[];
    historicalContext: string;
  }
): Promise<PerspectiveNarrative> {
  const prompt = `
You are a historian from the LOSER civilization in this event. Write a bitter account that emphasizes injustice and suffering.

VICTOR CIVILIZATION: ${victorCivilization.name}
LOSER CIVILIZATION: ${loserCivilization.name}
EVENT: ${event.title}
YEAR: ${event.year}

Write a 2-3 sentence narrative that:
1. Emphasizes the injustice and unfairness
2. Highlights the suffering and losses
3. Questions the victor's righteousness
4. Frames the outcome as tragic or unjust

TONE: Bitter, resentful, grieving
NARRATIVE:
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a bitter historian writing from the loser's perspective. Emphasize suffering and injustice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const narrative = typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : event.description;

    return {
      perspective: "loser",
      narrative,
      tone: "bitter",
      bias: 0.7,
      hiddenTruths: ["Actual suffering", "Moral costs", "Long-term resentment"],
      contradictions: ["victor"],
      confidence: 0.85,
    };
  } catch (error) {
    console.error("Loser narrative generation failed:", error);
    return {
      perspective: "loser",
      narrative: `${loserCivilization.name} suffered in ${event.title}.`,
      tone: "bitter",
      bias: 0.7,
      hiddenTruths: ["Actual suffering"],
      contradictions: ["victor"],
      confidence: 0.5,
    };
  }
}

/**
 * Generate neutral observer perspective narrative
 * Objective, analytical, attempts balance
 */
export async function generateNeutralPerspective(
  event: EventNode,
  victorCivilization: CivilizationState,
  loserCivilization: CivilizationState,
  context: {
    recentEvents: EventNode[];
    historicalContext: string;
  }
): Promise<PerspectiveNarrative> {
  const prompt = `
You are an objective historian analyzing this event from a neutral perspective.

VICTOR CIVILIZATION: ${victorCivilization.name}
LOSER CIVILIZATION: ${loserCivilization.name}
EVENT: ${event.title}
YEAR: ${event.year}

Write a 2-3 sentence narrative that:
1. Presents both sides' perspectives fairly
2. Analyzes causes and consequences objectively
3. Acknowledges complexity and nuance
4. Avoids moral judgment

TONE: Analytical, balanced, scholarly
NARRATIVE:
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an objective historian. Present balanced analysis without moral judgment.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const narrative = typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : event.description;

    return {
      perspective: "neutral",
      narrative,
      tone: "analytical",
      bias: 0.2,
      hiddenTruths: ["Deeper motivations", "Systemic factors"],
      contradictions: [],
      confidence: 0.75,
    };
  } catch (error) {
    console.error("Neutral narrative generation failed:", error);
    return {
      perspective: "neutral",
      narrative: `${event.title} occurred between ${victorCivilization.name} and ${loserCivilization.name}.`,
      tone: "analytical",
      bias: 0.2,
      hiddenTruths: ["Deeper factors"],
      contradictions: [],
      confidence: 0.5,
    };
  }
}

/**
 * Generate archaeologist perspective narrative
 * Future scholar analyzing from distant past
 */
export async function generateArchaeologistPerspective(
  event: EventNode,
  victorCivilization: CivilizationState,
  loserCivilization: CivilizationState,
  context: {
    recentEvents: EventNode[];
    historicalContext: string;
  }
): Promise<PerspectiveNarrative> {
  const prompt = `
You are an archaeologist 10,000 years in the future, studying this event through fragments and ruins.

VICTOR CIVILIZATION: ${victorCivilization.name}
LOSER CIVILIZATION: ${loserCivilization.name}
EVENT: ${event.title}
YEAR: ${event.year}

Write a 2-3 sentence narrative that:
1. Interprets the event from fragmentary evidence
2. Questions what really happened vs. recorded history
3. Acknowledges gaps and uncertainties
4. Speculates on deeper significance

TONE: Scholarly, speculative, humble about limitations
NARRATIVE:
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a future archaeologist studying ancient history. Acknowledge uncertainty and gaps in knowledge.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const narrative = typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : event.description;

    return {
      perspective: "archaeologist",
      narrative,
      tone: "scholarly",
      bias: 0.3,
      hiddenTruths: ["True causes", "Forgotten details", "Lost civilizations"],
      contradictions: [],
      confidence: 0.5,
    };
  } catch (error) {
    console.error("Archaeologist narrative generation failed:", error);
    return {
      perspective: "archaeologist",
      narrative: `Evidence suggests ${event.title} occurred, but details remain unclear.`,
      tone: "scholarly",
      bias: 0.3,
      hiddenTruths: ["True causes"],
      contradictions: [],
      confidence: 0.3,
    };
  }
}

/**
 * Generate alien visitor perspective narrative
 * Non-human observer with different values and understanding
 */
export async function generateAlienPerspective(
  event: EventNode,
  victorCivilization: CivilizationState,
  loserCivilization: CivilizationState,
  context: {
    recentEvents: EventNode[];
    historicalContext: string;
  }
): Promise<PerspectiveNarrative> {
  const prompt = `
You are an alien visitor from a non-human civilization observing this event with different values and understanding.

VICTOR CIVILIZATION: ${victorCivilization.name}
LOSER CIVILIZATION: ${loserCivilization.name}
EVENT: ${event.title}
YEAR: ${event.year}

Write a 2-3 sentence narrative that:
1. Observes the event through alien perspective
2. Questions human assumptions and values
3. Highlights what seems strange or incomprehensible
4. Offers alternative interpretation

TONE: Detached, curious, slightly bemused
NARRATIVE:
`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are an alien observer. Question human assumptions and offer non-human perspective.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const narrative = typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : event.description;

    return {
      perspective: "alien",
      narrative,
      tone: "detached",
      bias: 0.4,
      hiddenTruths: ["Human nature", "Unstated assumptions", "Alternative values"],
      contradictions: [],
      confidence: 0.6,
    };
  } catch (error) {
    console.error("Alien narrative generation failed:", error);
    return {
      perspective: "alien",
      narrative: `The humans call this event ${event.title}. We observe and wonder.`,
      tone: "detached",
      bias: 0.4,
      hiddenTruths: ["Human nature"],
      contradictions: [],
      confidence: 0.4,
    };
  }
}

/**
 * Generate all five perspectives for an event
 */
export async function generateAllPerspectives(
  event: EventNode,
  victorCivilization: CivilizationState,
  loserCivilization: CivilizationState,
  context: {
    recentEvents: EventNode[];
    historicalContext: string;
  }
): Promise<Map<string, PerspectiveNarrative>> {
  const perspectives = new Map<string, PerspectiveNarrative>();

  const [victor, loser, neutral, archaeologist, alien] = await Promise.all([
    generateVictorPerspective(event, victorCivilization, loserCivilization, context),
    generateLoserPerspective(event, victorCivilization, loserCivilization, context),
    generateNeutralPerspective(event, victorCivilization, loserCivilization, context),
    generateArchaeologistPerspective(event, victorCivilization, loserCivilization, context),
    generateAlienPerspective(event, victorCivilization, loserCivilization, context),
  ]);

  perspectives.set("victor", victor);
  perspectives.set("loser", loser);
  perspectives.set("neutral", neutral);
  perspectives.set("archaeologist", archaeologist);
  perspectives.set("alien", alien);

  return perspectives;
}

/**
 * Detect contradictions between perspectives
 */
export function detectContradictions(perspectives: Map<string, PerspectiveNarrative>): Map<string, string[]> {
  const contradictions = new Map<string, string[]>();

  // Victor and Loser always contradict
  contradictions.set("victor", ["loser"]);
  contradictions.set("loser", ["victor"]);

  // Archaeologist may contradict others due to different information
  const archaeologistTruths = perspectives.get("archaeologist")?.hiddenTruths || [];
  if (archaeologistTruths.length > 0) {
    contradictions.set("archaeologist", ["victor", "loser"]);
  }

  // Alien perspective may contradict human assumptions
  contradictions.set("alien", ["victor", "loser", "neutral"]);

  return contradictions;
}

/**
 * Extract revealed truths from comparing perspectives
 */
export function extractRevealedTruths(perspectives: Map<string, PerspectiveNarrative>): string[] {
  const truths: string[] = [];

  // What victor hides, loser reveals
  const victorHidden = perspectives.get("victor")?.hiddenTruths || [];
  const loserReveals = perspectives.get("loser")?.hiddenTruths || [];
  for (const hidden of victorHidden) {
    if (loserReveals.includes(hidden)) {
      truths.push(`Truth revealed by comparing victor and loser: ${hidden}`);
    }
  }

  // What archaeologist questions
  const archaeologistTruths = perspectives.get("archaeologist")?.hiddenTruths || [];
  for (const truth of archaeologistTruths) {
    truths.push(`Truth questioned by archaeologist: ${truth}`);
  }

  // What alien perspective reveals about human nature
  const alienTruths = perspectives.get("alien")?.hiddenTruths || [];
  for (const truth of alienTruths) {
    if (truth.includes("human")) {
      truths.push(`Truth about humanity revealed by alien: ${truth}`);
    }
  }

  return truths;
}

/**
 * Create multi-perspective event
 */
export async function createMultiPerspectiveEvent(
  event: EventNode,
  victorCivilization: CivilizationState,
  loserCivilization: CivilizationState,
  context: {
    recentEvents: EventNode[];
    historicalContext: string;
  }
): Promise<MultiPerspectiveEvent> {
  const perspectives = await generateAllPerspectives(event, victorCivilization, loserCivilization, context);
  const contradictions = detectContradictions(perspectives);
  const revealedTruths = extractRevealedTruths(perspectives);

  // Extract hidden truths that aren't revealed
  const allHidden = new Set<string>();
  for (const perspective of perspectives.values()) {
    for (const truth of perspective.hiddenTruths) {
      allHidden.add(truth);
    }
  }
  const hiddenTruths = Array.from(allHidden);

  return {
    event,
    perspectives,
    contradictionMap: contradictions,
    revealedTruths,
    hiddenTruths,
  };
}

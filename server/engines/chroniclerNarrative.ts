/**
 * Chronicler Narrative Engine: AI as Recorder, Not Author
 * 
 * The Chronicler's role is to translate the mathematical reality of the simulation
 * into human language while preserving perfect causal alignment. It does not invent;
 * it records. Every narrative is grounded in mechanical necessity.
 */

import { invokeLLM } from '../_core/llm';
import type { EventNode } from '../../types/narrative';

export interface CausalPackage {
  event: EventNode;
  rawStateChange: Record<string, any>;
  dependencies: Array<{
    factor: string;
    value: number;
    influence: number; // 0-1, how much this factor influenced the outcome
  }>;
  causalChain: Array<{
    step: number;
    description: string;
    mathematical: string;
  }>;
  constraints: Array<{
    name: string;
    satisfied: boolean;
    explanation: string;
  }>;
}

/**
 * Build a causal package from simulation state
 * 
 * This package contains all the information the Chronicler needs to generate
 * a narrative that is perfectly grounded in mechanical reality.
 */
export function buildCausalPackage(
  event: EventNode,
  context: {
    sourceCivilization?: any;
    affectedCivilization?: any;
    allCivilizations?: Map<string, any>;
    allEvents?: EventNode[];
    emotionalState?: Record<string, number>;
    traitInfluences?: Record<string, number>;
  }
): CausalPackage {
  const dependencies: CausalPackage['dependencies'] = [];
  const causalChain: CausalPackage['causalChain'] = [];
  const constraints: CausalPackage['constraints'] = [];

  // Extract dependencies from context
  if (context.emotionalState) {
    for (const [emotion, value] of Object.entries(context.emotionalState)) {
      if (value > 30) {
        // Only significant emotional states
        dependencies.push({
          factor: `${emotion} (${Math.round(value)}/100)`,
          value,
          influence: Math.min(1, value / 100),
        });
      }
    }
  }

  if (context.traitInfluences) {
    for (const [trait, influence] of Object.entries(context.traitInfluences)) {
      if (influence > 0.2) {
        dependencies.push({
          factor: trait,
          value: influence,
          influence,
        });
      }
    }
  }

  // Build causal chain
  causalChain.push({
    step: 1,
    description: 'Initial condition established',
    mathematical: `Event triggered by causal significance: ${event.causalStrength}`,
  });

  if (dependencies.length > 0) {
    causalChain.push({
      step: 2,
      description: `${dependencies.length} factors influenced the outcome`,
      mathematical: `Combined influence: ${dependencies.reduce((sum, d) => sum + d.influence, 0).toFixed(2)}`,
    });
  }

  causalChain.push({
    step: 3,
    description: 'Event manifested in civilization behavior',
    mathematical: `Constraint satisfaction: ${event.constraintSatisfaction}`,
  });

  // Validate constraints
  constraints.push({
    name: 'Causal Necessity',
    satisfied: event.causalStrength > 0.5,
    explanation: 'Event has sufficient causal weight to occur',
  });

  constraints.push({
    name: 'Constraint Satisfaction',
    satisfied: event.constraintSatisfaction > 0.7,
    explanation: 'Event respects simulation constraints',
  });

  constraints.push({
    name: 'Unity Coefficient',
    satisfied: event.unityCoefficient > 0.5,
    explanation: 'Event maintains civilization coherence',
  });

  return {
    event,
    rawStateChange: {
      eventType: event.eventType,
      importance: event.importance,
      involvedCivilizations: event.involvedCivilizations,
    },
    dependencies,
    causalChain,
    constraints,
  };
}

/**
 * Generate Chronicler narrative from causal package
 * 
 * The Chronicler receives the complete causal package and generates a narrative
 * that is grounded in mechanical reality, not invention.
 */
export async function generateChroniclerNarrative(
  causalPackage: CausalPackage,
  perspective: 'victor' | 'loser' | 'neutral' | 'archaeologist' | 'alien'
): Promise<string> {
  // Build the prompt that instructs the LLM to be a Chronicler, not an Author
  const systemPrompt = buildChroniclerSystemPrompt(perspective);
  const dataPrompt = buildCausalDataPrompt(causalPackage);

  const response = await invokeLLM({
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: dataPrompt,
      },
    ],
  });

  if (response.choices && response.choices[0]?.message?.content) {
    return response.choices[0].message.content;
  }

  throw new Error('Failed to generate narrative from LLM');
}

/**
 * Build system prompt that establishes the Chronicler role
 */
function buildChroniclerSystemPrompt(perspective: string): string {
  return `You are a Chronicler, not an Author. Your role is to translate mathematical cause-and-effect into human language.

CRITICAL RULES:
1. Do NOT invent events or details that are not in the causal package
2. Do NOT add external elements or embellishments
3. Do NOT create drama for drama's sake
4. Your narrative must be perfectly grounded in the mechanical reality provided

YOUR TASK:
Translate the provided causal package into a narrative from the ${perspective} perspective. The narrative must:
- Respect the exact causal chain provided
- Acknowledge all significant dependencies
- Preserve the mathematical relationships
- Use vivid language to convey the mechanical reality, not to invent meaning

PERSPECTIVE GUIDELINES:
- Victor: Acknowledge your success while recognizing the legitimate struggles of opponents
- Loser: Describe your defeat honestly while preserving dignity and agency
- Neutral: Present facts without bias, acknowledging multiple valid interpretations
- Archaeologist: Analyze the event as historical evidence, noting what can and cannot be concluded
- Alien: Observe the event as an outsider, highlighting what is culturally specific vs. universal

Remember: You are recording what happened, not creating what should have happened.`;
}

/**
 * Build the data prompt that provides the causal package
 */
function buildCausalDataPrompt(causalPackage: CausalPackage): string {
  let prompt = `EVENT TO CHRONICLE:\n`;
  prompt += `Title: ${causalPackage.event.title}\n`;
  prompt += `Type: ${causalPackage.event.eventType}\n`;
  prompt += `Importance: ${causalPackage.event.importance}/10\n`;
  prompt += `Causal Strength: ${causalPackage.event.causalStrength.toFixed(2)}\n\n`;

  prompt += `CAUSAL CHAIN (The mechanical sequence of cause and effect):\n`;
  for (const step of causalPackage.causalChain) {
    prompt += `${step.step}. ${step.description}\n`;
    prompt += `   Math: ${step.mathematical}\n`;
  }

  prompt += `\nKEY DEPENDENCIES (Factors that influenced this outcome):\n`;
  for (const dep of causalPackage.dependencies) {
    prompt += `- ${dep.factor}: ${(dep.influence * 100).toFixed(0)}% influence\n`;
  }

  prompt += `\nCONSTRAINTS (Reality checks):\n`;
  for (const constraint of causalPackage.constraints) {
    const status = constraint.satisfied ? '✓' : '✗';
    prompt += `${status} ${constraint.name}: ${constraint.explanation}\n`;
  }

  prompt += `\nGENERATE A NARRATIVE that:
1. Explains why this event was inevitable given the causal factors
2. Translates the mathematical dependencies into human motivations and consequences
3. Preserves the exact causal sequence
4. Uses specific, earned details rather than generic descriptions
5. Acknowledges the constraints that made this outcome necessary

The narrative should be 2-3 paragraphs, vivid but grounded.`;

  return prompt;
}

/**
 * Validate narrative against causal package
 * 
 * Ensure the narrative doesn't violate the causal constraints
 */
export function validateNarrativeAgainstCausal(
  narrative: string,
  causalPackage: CausalPackage
): {
  isValid: boolean;
  violations: Array<{
    type: string;
    description: string;
    severity: 'warning' | 'error';
  }>;
} {
  const violations: Array<{
    type: string;
    description: string;
    severity: 'warning' | 'error';
  }> = [];

  // Check 1: Narrative should acknowledge the event type
  if (!narrative.toLowerCase().includes(causalPackage.event.eventType.replace(/_/g, ' '))) {
    violations.push({
      type: 'Missing Event Type',
      description: `Narrative does not clearly reference the ${causalPackage.event.eventType} event`,
      severity: 'warning',
    });
  }

  // Check 2: Narrative should reference key dependencies
  const narrativeLower = narrative.toLowerCase();
  let dependenciesReferenced = 0;
  for (const dep of causalPackage.dependencies.slice(0, 3)) {
    // Check first 3 dependencies
    const depName = dep.factor.toLowerCase();
    if (narrativeLower.includes(depName.split('(')[0].trim())) {
      dependenciesReferenced++;
    }
  }

  if (dependenciesReferenced === 0 && causalPackage.dependencies.length > 0) {
    violations.push({
      type: 'Missing Dependencies',
      description: 'Narrative does not reference any of the key causal dependencies',
      severity: 'error',
    });
  }

  // Check 3: Narrative length should be reasonable
  if (narrative.length < 100) {
    violations.push({
      type: 'Insufficient Detail',
      description: 'Narrative is too brief to adequately explain the causal chain',
      severity: 'warning',
    });
  }

  if (narrative.length > 2000) {
    violations.push({
      type: 'Excessive Length',
      description: 'Narrative is too long and may contain invented details',
      severity: 'warning',
    });
  }

  // Check 4: Narrative should not contradict constraints
  const constraintViolations = causalPackage.constraints.filter((c) => !c.satisfied);
  if (constraintViolations.length > 0) {
    violations.push({
      type: 'Constraint Violation',
      description: `Narrative violates ${constraintViolations.length} simulation constraints`,
      severity: 'error',
    });
  }

  return {
    isValid: violations.filter((v) => v.severity === 'error').length === 0,
    violations,
  };
}

/**
 * Generate multi-perspective narratives from a single causal package
 * 
 * Different perspectives interpret the same mechanical reality differently
 */
export async function generateMultiPerspectiveNarratives(
  causalPackage: CausalPackage
): Promise<Record<string, string>> {
  const perspectives: Array<'victor' | 'loser' | 'neutral' | 'archaeologist' | 'alien'> = [
    'victor',
    'loser',
    'neutral',
    'archaeologist',
    'alien',
  ];

  const narratives: Record<string, string> = {};

  for (const perspective of perspectives) {
    try {
      narratives[perspective] = await generateChroniclerNarrative(causalPackage, perspective);
    } catch (error) {
      console.error(`Failed to generate ${perspective} narrative:`, error);
      narratives[perspective] = `[Failed to generate ${perspective} perspective]`;
    }
  }

  return narratives;
}

/**
 * Analyze contradictions between perspectives
 * 
 * Contradictions reveal how the same mechanical reality is interpreted differently
 */
export function analyzeMultiPerspectiveContradictions(
  narratives: Record<string, string>
): Array<{
  perspectives: [string, string];
  contradictionType: 'factual' | 'interpretation' | 'emphasis';
  description: string;
  significance: number; // 0-1
}> {
  const contradictions: Array<{
    perspectives: [string, string];
    contradictionType: 'factual' | 'interpretation' | 'emphasis';
    description: string;
    significance: number;
  }> = [];

  const perspectives = Object.keys(narratives);

  // Compare each pair of perspectives
  for (let i = 0; i < perspectives.length; i++) {
    for (let j = i + 1; j < perspectives.length; j++) {
      const p1 = perspectives[i];
      const p2 = perspectives[j];
      const n1 = narratives[p1].toLowerCase();
      const n2 = narratives[p2].toLowerCase();

      // Simple contradiction detection based on sentiment/tone
      const successWords = ['victory', 'triumph', 'success', 'achieved', 'gained'];
      const failureWords = ['defeat', 'loss', 'failed', 'lost', 'destroyed'];

      const n1Success = successWords.filter((w) => n1.includes(w)).length;
      const n1Failure = failureWords.filter((w) => n1.includes(w)).length;

      const n2Success = successWords.filter((w) => n2.includes(w)).length;
      const n2Failure = failureWords.filter((w) => n2.includes(w)).length;

      // If one emphasizes success and the other failure, it's a contradiction
      if ((n1Success > n1Failure && n2Failure > n2Success) || (n1Failure > n1Success && n2Success > n2Failure)) {
        contradictions.push({
          perspectives: [p1, p2],
          contradictionType: n1Success > n1Failure ? 'emphasis' : 'interpretation',
          description: `${p1} emphasizes success while ${p2} emphasizes failure`,
          significance: 0.7,
        });
      }
    }
  }

  return contradictions;
}

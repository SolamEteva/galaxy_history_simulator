import { createMachine, assign, ActorRefFrom, createActor } from "xstate";

/**
 * Civilization State Machine
 * Models the lifecycle and state transitions of a civilization
 * Based on Dwarf Fortress-style historical progression
 */

export type CivilizationState =
  | "primitive"
  | "tribal"
  | "agricultural"
  | "classical"
  | "medieval"
  | "industrial"
  | "modern"
  | "spacefaring"
  | "transcendent"
  | "extinct";

export interface CivilizationContext {
  id: number;
  speciesId: number;
  name: string;
  year: number;
  population: number;
  technology: number; // 0-100
  culture: number; // 0-100
  stability: number; // 0-100
  militaryPower: number; // 0-100
  wealth: number; // 0-100
  knowledge: string[]; // List of discovered technologies
  beliefs: string[]; // Ideological/religious beliefs
  alliances: number[]; // IDs of allied civilizations
  conflicts: number[]; // IDs of enemy civilizations
  achievements: string[]; // Major historical achievements
  yearOfOrigin: number;
  yearOfExtinction?: number;
}

export type CivilizationEvent =
  | { type: "DISCOVER_AGRICULTURE" }
  | { type: "FORM_SETTLEMENT" }
  | { type: "BUILD_CITY" }
  | { type: "ESTABLISH_EMPIRE" }
  | { type: "INDUSTRIAL_REVOLUTION" }
  | { type: "TECHNOLOGICAL_SINGULARITY" }
  | { type: "ACHIEVE_SPACEFLIGHT" }
  | { type: "TRANSCEND" }
  | { type: "FACE_EXTINCTION" }
  | { type: "ADVANCE_TECHNOLOGY"; amount: number }
  | { type: "ADVANCE_CULTURE"; amount: number }
  | { type: "GAIN_KNOWLEDGE"; knowledge: string }
  | { type: "ADOPT_BELIEF"; belief: string }
  | { type: "FORM_ALLIANCE"; allyId: number }
  | { type: "DECLARE_WAR"; enemyId: number }
  | { type: "EXPERIENCE_PLAGUE"; severity: number }
  | { type: "NATURAL_DISASTER"; severity: number }
  | { type: "GOLDEN_AGE" }
  | { type: "DARK_AGE" };

/**
 * Create a civilization state machine
 */
export function createCivilizationMachine(initialContext: CivilizationContext) {
  return createMachine(
    {
      id: `civilization-${initialContext.id}`,
      initial: "primitive",
      context: initialContext,
      states: {
        primitive: {
          description: "Hunter-gatherer societies, no permanent settlements",
          on: {
            DISCOVER_AGRICULTURE: {
              target: "tribal",
              actions: assign({
                technology: ({ context }) => context.technology + 10,
                knowledge: ({ context }) => [...context.knowledge, "agriculture"],
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Discovered agriculture",
                ],
              }),
            },
            ADVANCE_TECHNOLOGY: {
              actions: assign({
                technology: ({ context, event }) =>
                  Math.min(100, context.technology + event.amount),
              }),
            },
          },
        },

        tribal: {
          description: "Tribal societies with basic agriculture",
          on: {
            FORM_SETTLEMENT: {
              target: "agricultural",
              actions: assign({
                population: ({ context }) => context.population * 2,
                technology: ({ context }) => context.technology + 15,
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Established first settlement",
                ],
              }),
            },
            DISCOVER_AGRICULTURE: {
              actions: "noop",
            },
            ADVANCE_TECHNOLOGY: {
              actions: assign({
                technology: ({ context, event }) =>
                  Math.min(100, context.technology + event.amount),
              }),
            },
          },
        },

        agricultural: {
          description: "Agricultural societies with permanent settlements",
          on: {
            BUILD_CITY: {
              target: "classical",
              actions: assign({
                population: ({ context }) => context.population * 3,
                technology: ({ context }) => context.technology + 20,
                culture: ({ context }) => context.culture + 15,
                wealth: ({ context }) => context.wealth + 20,
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Built first city",
                ],
              }),
            },
            ADVANCE_TECHNOLOGY: {
              actions: assign({
                technology: ({ context, event }) =>
                  Math.min(100, context.technology + event.amount),
              }),
            },
            ADVANCE_CULTURE: {
              actions: assign({
                culture: ({ context, event }) =>
                  Math.min(100, context.culture + event.amount),
              }),
            },
          },
        },

        classical: {
          description: "Classical civilizations with cities and empires",
          on: {
            ESTABLISH_EMPIRE: {
              target: "medieval",
              actions: assign({
                militaryPower: ({ context }) => context.militaryPower + 25,
                wealth: ({ context }) => context.wealth + 30,
                culture: ({ context }) => context.culture + 20,
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Established empire",
                ],
              }),
            },
            ADVANCE_TECHNOLOGY: {
              actions: assign({
                technology: ({ context, event }) =>
                  Math.min(100, context.technology + event.amount),
              }),
            },
            ADVANCE_CULTURE: {
              actions: assign({
                culture: ({ context, event }) =>
                  Math.min(100, context.culture + event.amount),
              }),
            },
            ADOPT_BELIEF: {
              actions: assign({
                beliefs: ({ context, event }) => [...context.beliefs, event.belief],
                culture: ({ context }) => Math.min(100, context.culture + 10),
              }),
            },
            DECLARE_WAR: {
              actions: assign({
                conflicts: ({ context, event }) => [...context.conflicts, event.enemyId],
                militaryPower: ({ context }) => Math.max(0, context.militaryPower - 10),
              }),
            },
          },
        },

        medieval: {
          description: "Medieval societies with feudalism and organized religion",
          on: {
            INDUSTRIAL_REVOLUTION: {
              target: "industrial",
              actions: assign({
                technology: ({ context }) => context.technology + 40,
                wealth: ({ context }) => context.wealth + 40,
                population: ({ context }) => context.population * 2,
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Industrial Revolution",
                ],
              }),
            },
            ADVANCE_TECHNOLOGY: {
              actions: assign({
                technology: ({ context, event }) =>
                  Math.min(100, context.technology + event.amount),
              }),
            },
            ADVANCE_CULTURE: {
              actions: assign({
                culture: ({ context, event }) =>
                  Math.min(100, context.culture + event.amount),
              }),
            },
            ADOPT_BELIEF: {
              actions: assign({
                beliefs: ({ context, event }) => [...context.beliefs, event.belief],
              }),
            },
            GOLDEN_AGE: {
              actions: assign({
                culture: ({ context }) => Math.min(100, context.culture + 25),
                wealth: ({ context }) => Math.min(100, context.wealth + 25),
                stability: ({ context }) => Math.min(100, context.stability + 20),
              }),
            },
            DARK_AGE: {
              actions: assign({
                culture: ({ context }) => Math.max(0, context.culture - 20),
                wealth: ({ context }) => Math.max(0, context.wealth - 30),
                stability: ({ context }) => Math.max(0, context.stability - 30),
              }),
            },
          },
        },

        industrial: {
          description: "Industrial societies with mechanization and mass production",
          on: {
            TECHNOLOGICAL_SINGULARITY: {
              target: "modern",
              actions: assign({
                technology: ({ context }) => 100,
                knowledge: ({ context }) => [
                  ...context.knowledge,
                  "Advanced Computing",
                  "Artificial Intelligence",
                ],
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Technological Singularity",
                ],
              }),
            },
            ADVANCE_TECHNOLOGY: {
              actions: assign({
                technology: ({ context, event }) =>
                  Math.min(100, context.technology + event.amount),
              }),
            },
            GAIN_KNOWLEDGE: {
              actions: assign({
                knowledge: ({ context, event }) => [...context.knowledge, event.knowledge],
              }),
            },
          },
        },

        modern: {
          description: "Modern societies with advanced technology and global connectivity",
          on: {
            ACHIEVE_SPACEFLIGHT: {
              target: "spacefaring",
              actions: assign({
                knowledge: ({ context }) => [...context.knowledge, "Spaceflight"],
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Achieved spaceflight",
                ],
                militaryPower: ({ context }) => Math.min(100, context.militaryPower + 30),
              }),
            },
            TRANSCEND: {
              target: "transcendent",
              actions: assign({
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Transcended physical form",
                ],
              }),
            },
            FACE_EXTINCTION: {
              target: "extinct",
              actions: assign({
                yearOfExtinction: ({ context }) => context.year,
                population: () => 0,
              }),
            },
          },
        },

        spacefaring: {
          description: "Spacefaring civilizations capable of interstellar travel",
          on: {
            TRANSCEND: {
              target: "transcendent",
              actions: assign({
                achievements: ({ context }) => [
                  ...context.achievements,
                  "Transcended to higher existence",
                ],
              }),
            },
            FACE_EXTINCTION: {
              target: "extinct",
              actions: assign({
                yearOfExtinction: ({ context }) => context.year,
                population: () => 0,
              }),
            },
            ADVANCE_TECHNOLOGY: {
              actions: assign({
                technology: ({ context, event }) =>
                  Math.min(100, context.technology + event.amount),
              }),
            },
            FORM_ALLIANCE: {
              actions: assign({
                alliances: ({ context, event }) => [...context.alliances, event.allyId],
              }),
            },
          },
        },

        transcendent: {
          description: "Post-biological civilizations that have transcended physical existence",
          type: "final",
          on: {
            FACE_EXTINCTION: {
              target: "extinct",
              actions: assign({
                yearOfExtinction: ({ context }) => context.year,
              }),
            },
          },
        },

        extinct: {
          description: "Extinct civilizations that no longer exist",
          type: "final",
        },
      },
    },
    {
      actions: {
        noop: () => {
          // No operation
        },
      },
    }
  );
}

/**
 * Helper to get human-readable state description
 */
export function getStateDescription(state: CivilizationState): string {
  const descriptions: Record<CivilizationState, string> = {
    primitive: "Hunter-gatherer societies, no permanent settlements",
    tribal: "Tribal societies with basic agriculture",
    agricultural: "Agricultural societies with permanent settlements",
    classical: "Classical civilizations with cities and empires",
    medieval: "Medieval societies with feudalism and organized religion",
    industrial: "Industrial societies with mechanization and mass production",
    modern: "Modern societies with advanced technology and global connectivity",
    spacefaring: "Spacefaring civilizations capable of interstellar travel",
    transcendent: "Post-biological civilizations that have transcended physical existence",
    extinct: "Extinct civilizations that no longer exist",
  };
  return descriptions[state];
}

/**
 * Helper to determine if a civilization can transition to a state
 */
export function canTransitionTo(
  currentState: CivilizationState,
  targetState: CivilizationState
): boolean {
  const stateOrder: CivilizationState[] = [
    "primitive",
    "tribal",
    "agricultural",
    "classical",
    "medieval",
    "industrial",
    "modern",
    "spacefaring",
    "transcendent",
  ];

  const currentIndex = stateOrder.indexOf(currentState);
  const targetIndex = stateOrder.indexOf(targetState);

  // Can transition to same state, next state, or extinct
  return targetIndex === currentIndex || targetIndex === currentIndex + 1 || targetState === "extinct";
}

/**
 * Helper to get technology requirements for state transitions
 */
export function getTechnologyRequirement(targetState: CivilizationState): number {
  const requirements: Record<CivilizationState, number> = {
    primitive: 0,
    tribal: 5,
    agricultural: 15,
    classical: 30,
    medieval: 50,
    industrial: 70,
    modern: 85,
    spacefaring: 95,
    transcendent: 100,
    extinct: 0,
  };
  return requirements[targetState];
}

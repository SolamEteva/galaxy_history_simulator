/**
 * Chronicler Module
 * 
 * Implements perspective-switching narrative generation.
 * The same event is told from multiple viewpoints (victor, loser, neutral observer,
 * archaeologist, alien anthropologist), creating narrative depth and revealing
 * hidden truths through contradictions.
 * 
 * Key insight: Truth is multifaceted. A war is simultaneously a glorious victory,
 * a devastating defeat, a tragic necessity, and a fascinating historical moment—
 * all depending on perspective.
 */

export type PerspectiveType =
  | "victor"
  | "loser"
  | "neutral_observer"
  | "archaeologist"
  | "alien_anthropologist";

export interface EventNarrative {
  eventId: string;
  eventType: string;
  timestamp: number;
  actors: string[];
  location: string;
  perspectives: Map<PerspectiveType, NarrativePerspective>;
  contradictions: Contradiction[];
  hiddenTruths: string[];
}

export interface NarrativePerspective {
  type: PerspectiveType;
  narrator: string; // who is telling this story
  narrative: string; // the actual narrative text
  tone: string; // emotional tone (triumphant, tragic, analytical, etc.)
  emphasis: string[]; // what aspects this perspective emphasizes
  omissions: string[]; // what this perspective downplays or ignores
  bias: number; // 0-1, how biased is this perspective
  reliability: number; // 0-1, how reliable is this narrator
}

export interface Contradiction {
  perspectives: [PerspectiveType, PerspectiveType];
  claim1: string;
  claim2: string;
  resolution: string; // what actually happened
  significance: number; // 0-1, how important is this contradiction
}

export interface NarrativeTheme {
  theme: string;
  perspectives: Map<PerspectiveType, string>; // how each perspective interprets the theme
  underlyingTruth: string;
}

/**
 * Chronicler Module
 * Generates multi-perspective narratives for events
 */
export class ChroniclerModule {
  private narratives: Map<string, EventNarrative> = new Map();
  private themes: Map<string, NarrativeTheme> = new Map();
  private narratorProfiles: Map<string, NarratorProfile> = new Map();

  constructor() {
    this.initializeNarratorProfiles();
  }

  /**
   * Initialize narrator profiles for each perspective type
   */
  private initializeNarratorProfiles(): void {
    this.narratorProfiles.set("victor", {
      type: "victor",
      bias: 0.8,
      reliability: 0.6,
      tone: "triumphant",
      emphasis: ["victory", "strategy", "heroism", "destiny"],
      omissions: ["collateral damage", "civilian suffering", "luck"],
      voiceCharacteristics: {
        vocabulary: "elevated, heroic",
        sentenceStructure: "declarative, confident",
        emotionalContent: "pride, vindication",
      },
    });

    this.narratorProfiles.set("loser", {
      type: "loser",
      bias: 0.7,
      reliability: 0.7,
      tone: "tragic",
      emphasis: ["injustice", "betrayal", "sacrifice", "resilience"],
      omissions: ["own mistakes", "enemy's legitimate grievances"],
      voiceCharacteristics: {
        vocabulary: "poetic, mournful",
        sentenceStructure: "complex, reflective",
        emotionalContent: "sorrow, dignity in defeat",
      },
    });

    this.narratorProfiles.set("neutral_observer", {
      type: "neutral_observer",
      bias: 0.2,
      reliability: 0.9,
      tone: "analytical",
      emphasis: ["causes", "effects", "patterns", "context"],
      omissions: ["emotional impact", "individual heroism"],
      voiceCharacteristics: {
        vocabulary: "technical, precise",
        sentenceStructure: "structured, logical",
        emotionalContent: "detached, curious",
      },
    });

    this.narratorProfiles.set("archaeologist", {
      type: "archaeologist",
      bias: 0.3,
      reliability: 0.8,
      tone: "investigative",
      emphasis: ["evidence", "mystery", "interpretation", "gaps in record"],
      omissions: ["unknowable facts", "emotional context"],
      voiceCharacteristics: {
        vocabulary: "scholarly, tentative",
        sentenceStructure: "qualified, evidence-based",
        emotionalContent: "curiosity, intellectual humility",
      },
    });

    this.narratorProfiles.set("alien_anthropologist", {
      type: "alien_anthropologist",
      bias: 0.4,
      reliability: 0.7,
      tone: "fascinated",
      emphasis: ["cultural patterns", "strange customs", "biological drives"],
      omissions: ["human moral context", "individual agency"],
      voiceCharacteristics: {
        vocabulary: "comparative, exotic",
        sentenceStructure: "observational, wondering",
        emotionalContent: "wonder, detachment",
      },
    });
  }

  /**
   * Generate multi-perspective narrative for an event
   */
  async generateMultiPerspectiveNarrative(
    eventId: string,
    eventType: string,
    timestamp: number,
    actors: string[],
    location: string,
    baseNarrative: string
  ): Promise<EventNarrative> {
    const perspectives = new Map<PerspectiveType, NarrativePerspective>();

    // Generate each perspective
    for (const perspectiveType of [
      "victor",
      "loser",
      "neutral_observer",
      "archaeologist",
      "alien_anthropologist",
    ] as PerspectiveType[]) {
      const perspective = await this.generatePerspective(
        eventId,
        eventType,
        baseNarrative,
        actors,
        perspectiveType
      );
      perspectives.set(perspectiveType, perspective);
    }

    // Detect contradictions between perspectives
    const contradictions = this.detectContradictions(perspectives, baseNarrative);

    // Extract hidden truths from contradictions
    const hiddenTruths = this.extractHiddenTruths(contradictions);

    const narrative: EventNarrative = {
      eventId,
      eventType,
      timestamp,
      actors,
      location,
      perspectives,
      contradictions,
      hiddenTruths,
    };

    this.narratives.set(eventId, narrative);
    return narrative;
  }

  /**
   * Generate a single perspective narrative
   */
  private async generatePerspective(
    eventId: string,
    eventType: string,
    baseNarrative: string,
    actors: string[],
    perspectiveType: PerspectiveType
  ): Promise<NarrativePerspective> {
    const profile = this.narratorProfiles.get(perspectiveType);
    if (!profile) {
      throw new Error(`Unknown perspective type: ${perspectiveType}`);
    }

    // Determine narrator based on perspective
    const narrator = this.selectNarrator(perspectiveType, actors);

    // Generate narrative with perspective bias
    const narrative = this.applyPerspectiveBias(
      baseNarrative,
      profile,
      eventType
    );

    // Determine tone based on narrator's role in event
    const tone = this.determineTone(perspectiveType, actors, narrator);

    return {
      type: perspectiveType,
      narrator,
      narrative,
      tone,
      emphasis: profile.emphasis,
      omissions: profile.omissions,
      bias: profile.bias,
      reliability: profile.reliability,
    };
  }

  /**
   * Select appropriate narrator for a perspective
   */
  private selectNarrator(
    perspectiveType: PerspectiveType,
    actors: string[]
  ): string {
    switch (perspectiveType) {
      case "victor":
        return `${actors[0] || "Unknown"} (Victor)`;
      case "loser":
        return `${actors[1] || "Unknown"} (Loser)`;
      case "neutral_observer":
        return "Anonymous Chronicler";
      case "archaeologist":
        return "Dr. Historian (3000 years later)";
      case "alien_anthropologist":
        return "Zyx'thar (Visiting Scholar)";
      default:
        return "Unknown Narrator";
    }
  }

  /**
   * Apply perspective bias to narrative
   * Emphasizes certain aspects, downplays others
   */
  private applyPerspectiveBias(
    baseNarrative: string,
    profile: NarratorProfile,
    eventType: string
  ): string {
    let biasedNarrative = baseNarrative;

    // Amplify emphasized aspects
    profile.emphasis.forEach((aspect) => {
      const regex = new RegExp(`\\b${aspect}\\b`, "gi");
      biasedNarrative = biasedNarrative.replace(
        regex,
        `**${aspect}**`
      );
    });

    // Downplay omitted aspects
    profile.omissions.forEach((aspect) => {
      const regex = new RegExp(`\\b${aspect}\\b`, "gi");
      biasedNarrative = biasedNarrative.replace(
        regex,
        `~~${aspect}~~`
      );
    });

    // Add perspective-specific framing
    const framing = this.generateFraming(profile, eventType);
    biasedNarrative = `${framing}\n\n${biasedNarrative}`;

    return biasedNarrative;
  }

  /**
   * Generate perspective-specific framing
   */
  private generateFraming(profile: NarratorProfile, eventType: string): string {
    const framings: Record<string, Record<string, string>> = {
      war: {
        victor: "This was a glorious victory, achieved through superior strategy and courage.",
        loser: "This was a tragic conflict, where brave souls fell defending their homeland.",
        neutral_observer:
          "This conflict resulted from competing resource claims and ideological differences.",
        archaeologist:
          "Archaeological evidence suggests this conflict was pivotal in regional power dynamics.",
        alien_anthropologist:
          "This intra-species conflict reveals fascinating patterns in territorial behavior.",
      },
      discovery: {
        victor: "We made this breakthrough through brilliant innovation and perseverance.",
        loser: "We learned of this discovery too late to capitalize on it.",
        neutral_observer:
          "This discovery emerged from accumulated knowledge and fortunate timing.",
        archaeologist:
          "This discovery marks a clear technological transition point in the archaeological record.",
        alien_anthropologist:
          "This discovery demonstrates the species' capacity for abstract reasoning.",
      },
      extinction: {
        victor: "Our civilization endured while others fell to fate.",
        loser: "Our civilization faced insurmountable challenges and faded from existence.",
        neutral_observer: "This extinction resulted from environmental and social pressures.",
        archaeologist:
          "This extinction left distinctive markers in the geological and cultural record.",
        alien_anthropologist:
          "This extinction exemplifies the fragility of complex civilizations.",
      },
    };

    return (
      framings[eventType]?.[profile.type] ||
      "This event occurred as part of the ongoing flow of history."
    );
  }

  /**
   * Determine tone based on narrator's role
   */
  private determineTone(
    perspectiveType: PerspectiveType,
    actors: string[],
    narrator: string
  ): string {
    const tones: Record<PerspectiveType, string> = {
      victor: "triumphant, confident",
      loser: "tragic, dignified",
      neutral_observer: "analytical, detached",
      archaeologist: "investigative, curious",
      alien_anthropologist: "fascinated, analytical",
    };

    return tones[perspectiveType];
  }

  /**
   * Detect contradictions between different perspectives
   */
  private detectContradictions(
    perspectives: Map<PerspectiveType, NarrativePerspective>,
    baseNarrative: string
  ): Contradiction[] {
    const contradictions: Contradiction[] = [];

    // Compare victor vs loser perspective
    const victor = perspectives.get("victor");
    const loser = perspectives.get("loser");

    if (victor && loser) {
      contradictions.push({
        perspectives: ["victor", "loser"],
        claim1: "We achieved a glorious victory",
        claim2: "We fought with honor despite defeat",
        resolution: "Both fought with courage; the outcome was determined by resources and strategy",
        significance: 0.9,
      });
    }

    // Compare neutral observer vs archaeologist
    const observer = perspectives.get("neutral_observer");
    const archaeologist = perspectives.get("archaeologist");

    if (observer && archaeologist) {
      contradictions.push({
        perspectives: ["neutral_observer", "archaeologist"],
        claim1: "The causes are clear from contemporary records",
        claim2: "The causes must be inferred from incomplete evidence",
        resolution: "Both perspectives are valid; contemporary records are incomplete",
        significance: 0.6,
      });
    }

    // Compare human perspectives vs alien perspective
    const alien = perspectives.get("alien_anthropologist");
    if (alien && victor) {
      contradictions.push({
        perspectives: ["victor", "alien_anthropologist"],
        claim1: "This victory was morally justified",
        claim2: "This was a territorial conflict driven by biological imperatives",
        resolution: "Both are true; morality and biology are not mutually exclusive",
        significance: 0.7,
      });
    }

    return contradictions;
  }

  /**
   * Extract hidden truths from contradictions
   */
  private extractHiddenTruths(contradictions: Contradiction[]): string[] {
    const truths: string[] = [];

    contradictions.forEach((contradiction) => {
      truths.push(contradiction.resolution);
    });

    // Add meta-truths about perspective and bias
    truths.push(
      "All narratives are shaped by the narrator's perspective and interests"
    );
    truths.push(
      "Truth emerges from comparing multiple perspectives, not from any single account"
    );
    truths.push(
      "The most reliable history acknowledges gaps and contradictions rather than hiding them"
    );

    return truths;
  }

  /**
   * Get comparative view of all perspectives
   */
  getComparativeView(eventId: string): {
    event: EventNarrative | null;
    comparison: Record<string, string>;
    contradictions: Contradiction[];
  } {
    const narrative = this.narratives.get(eventId);

    if (!narrative) {
      return {
        event: null,
        comparison: {},
        contradictions: [],
      };
    }

    const comparison: Record<string, string> = {};
    narrative.perspectives.forEach((perspective, type) => {
      comparison[type] = perspective.narrative;
    });

    return {
      event: narrative,
      comparison,
      contradictions: narrative.contradictions,
    };
  }

  /**
   * Detect thematic patterns across perspectives
   */
  detectThemes(eventId: string): NarrativeTheme[] {
    const narrative = this.narratives.get(eventId);
    if (!narrative) {
      return [];
    }

    const themes: NarrativeTheme[] = [];

    // Theme: Sacrifice
    themes.push({
      theme: "Sacrifice",
      perspectives: new Map([
        ["victor", "Sacrifice of soldiers for victory"],
        ["loser", "Sacrifice of homeland and freedom"],
        ["neutral_observer", "Resource allocation and opportunity costs"],
        ["archaeologist", "Evidence of ritual and ceremonial practices"],
        ["alien_anthropologist", "Willingness to risk individual for collective"],
      ]),
      underlyingTruth: "All parties made difficult choices with lasting consequences",
    });

    // Theme: Power
    themes.push({
      theme: "Power",
      perspectives: new Map([
        ["victor", "Rightful exercise of superior strength"],
        ["loser", "Unjust domination by overwhelming force"],
        ["neutral_observer", "Shift in power distribution"],
        ["archaeologist", "Evidence of social hierarchy"],
        ["alien_anthropologist", "Dominance hierarchies common in species"],
      ]),
      underlyingTruth:
        "Power is relative and contested; its legitimacy depends on perspective",
    });

    // Theme: Change
    themes.push({
      theme: "Change",
      perspectives: new Map([
        ["victor", "Positive transformation toward our vision"],
        ["loser", "Catastrophic loss of the familiar"],
        ["neutral_observer", "Systemic reorganization"],
        ["archaeologist", "Clear boundary between eras"],
        ["alien_anthropologist", "Adaptation to new conditions"],
      ]),
      underlyingTruth: "Change is inevitable; its value depends on one's position",
    });

    return themes;
  }

  /**
   * Get narrative statistics
   */
  getNarrativeStats() {
    return {
      totalNarratives: this.narratives.size,
      totalContradictions: Array.from(this.narratives.values()).reduce(
        (sum, n) => sum + n.contradictions.length,
        0
      ),
      averageReliability: this.calculateAverageReliability(),
      averageBias: this.calculateAverageBias(),
      hiddenTruthsRevealed: Array.from(this.narratives.values()).reduce(
        (sum, n) => sum + n.hiddenTruths.length,
        0
      ),
    };
  }

  /**
   * Calculate average reliability across all perspectives
   */
  private calculateAverageReliability(): number {
    let totalReliability = 0;
    let count = 0;

    this.narratives.forEach((narrative) => {
      narrative.perspectives.forEach((perspective) => {
        totalReliability += perspective.reliability;
        count++;
      });
    });

    return count > 0 ? totalReliability / count : 0;
  }

  /**
   * Calculate average bias across all perspectives
   */
  private calculateAverageBias(): number {
    let totalBias = 0;
    let count = 0;

    this.narratives.forEach((narrative) => {
      narrative.perspectives.forEach((perspective) => {
        totalBias += perspective.bias;
        count++;
      });
    });

    return count > 0 ? totalBias / count : 0;
  }
}

/**
 * Narrator profile interface
 */
interface NarratorProfile {
  type: PerspectiveType;
  bias: number;
  reliability: number;
  tone: string;
  emphasis: string[];
  omissions: string[];
  voiceCharacteristics: {
    vocabulary: string;
    sentenceStructure: string;
    emotionalContent: string;
  };
}

export default ChroniclerModule;

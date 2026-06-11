export interface EventNode {
  id: string;
  year: number;
  title: string;
  description: string;
  eventType: string[];
  involvedCivilizations: string[];
  significance: number;
  causalStrength: number;
}

export interface NarrativeEvent {
  id: string;
  year: number;
  type: string;
  title: string;
  description: string;
  civilizationIds: string[];
  significance: number;
  consequences: string[];
}

export interface FigureProfile {
  id: string;
  name: string;
  civilization: string;
  title: string;
  lifespan: { start: number; end: number };
  achievements: string[];
  relationships: Record<string, string>;
  legacy: string;
}

export interface GenealogyNode {
  id: string;
  name: string;
  generation: number;
  children: string[];
  parents: string[];
  civilization: string;
}

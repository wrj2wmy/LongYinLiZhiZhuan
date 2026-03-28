export interface ForceEntry {
  id: number;
  name: string;
  style: string;
  level: number;
  color: string;
}

export interface KungfuEntry {
  id: number;
  category: string;
  level: number;
  name: string;
  description: string;
}

export interface TagEntry {
  id: number;
  name: string;
  value: number;
  effect: string;
  category: string;
}

export interface SpeAddEntry {
  id: number;
  name: string;
  description: string;
  isPercentage: boolean;
}

export interface HorseEntry {
  id: number;
  name: string;
  description: string;
  level: number;
  speed: number;
  power: number;
  sprint: number;
  resist: number;
}

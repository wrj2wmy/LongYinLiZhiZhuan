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
  exp_coeff: string;
  train_effect: string;
  use_effect: string;
  train_req: string;
  use_special: string;
  mana_cost: string;
  belong_force: string;
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

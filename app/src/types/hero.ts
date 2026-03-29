export interface HeroSummary {
  heroID: number;
  heroName: string;
  heroNickName: string | null;
  isFemale: boolean;
  belongForceID: number;
  dead: boolean;
  isLeader: boolean;
  age: number;
  heroForceLv: number;
}

export interface EditStatus {
  canUndo: boolean;
  canRedo: boolean;
  unsavedChanges: number;
  undoDescription: string | null;
  redoDescription: string | null;
}

export type HeroDetail = Record<string, unknown>;

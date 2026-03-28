import { invoke } from '@tauri-apps/api/core';
import type { HeroSummary, EditStatus, HeroDetail } from '../types/hero';
import type { ForceEntry, KungfuEntry, TagEntry, SpeAddEntry, HorseEntry } from '../types/assets';

export async function loadSave(slotPath: string): Promise<number> {
  return invoke<number>('load_save', { slotPath });
}

export async function getHeroList(): Promise<HeroSummary[]> {
  return invoke<HeroSummary[]>('get_hero_list');
}

export async function getHero(heroId: number): Promise<HeroDetail> {
  return invoke<HeroDetail>('get_hero', { heroId });
}

export async function updateHeroField(
  heroId: number,
  fieldPath: string,
  value: unknown
): Promise<void> {
  return invoke('update_hero_field', { heroId, fieldPath, value });
}

export async function undoEdit(): Promise<string | null> {
  return invoke<string | null>('undo');
}

export async function redoEdit(): Promise<string | null> {
  return invoke<string | null>('redo');
}

export async function getEditStatus(): Promise<EditStatus> {
  return invoke<EditStatus>('get_edit_status');
}

export async function saveFile(): Promise<string> {
  return invoke<string>('save_file');
}

export async function getForceList(): Promise<Record<number, ForceEntry>> {
  return invoke<Record<number, ForceEntry>>('get_force_list');
}

export async function getSkillList(): Promise<Record<number, KungfuEntry>> {
  return invoke<Record<number, KungfuEntry>>('get_skill_list');
}

export async function getTagList(): Promise<Record<number, TagEntry>> {
  return invoke<Record<number, TagEntry>>('get_tag_list');
}

export async function getSpeAddNames(): Promise<Record<number, SpeAddEntry>> {
  return invoke<Record<number, SpeAddEntry>>('get_spe_add_names');
}

export async function getHorseList(): Promise<Record<number, HorseEntry>> {
  return invoke<Record<number, HorseEntry>>('get_horse_list');
}

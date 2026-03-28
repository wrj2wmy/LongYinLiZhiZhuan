import { useState } from 'react';
import type { HeroDetail } from '../types/hero';
import type { ForceEntry, KungfuEntry, TagEntry, SpeAddEntry } from '../types/assets';
import { IdentityTab } from './tabs/IdentityTab';
import { AttributesTab } from './tabs/AttributesTab';
import { SkillsTab } from './tabs/SkillsTab';
import { EquipmentTab } from './tabs/EquipmentTab';
import { InventoryTab } from './tabs/InventoryTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { TagsTab } from './tabs/TagsTab';

const TABS = [
  { key: 'identity', label: '身份' },
  { key: 'attributes', label: '属性' },
  { key: 'skills', label: '武学' },
  { key: 'equipment', label: '装备' },
  { key: 'inventory', label: '物品' },
  { key: 'relationships', label: '关系' },
  { key: 'tags', label: '天赋' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

interface Props {
  hero: HeroDetail;
  heroId: number;
  forces: Record<number, ForceEntry>;
  skills: Record<number, KungfuEntry>;
  tags: Record<number, TagEntry>;
  speAddNames: Record<number, SpeAddEntry>;
  heroNames: Record<number, string>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function HeroDetailPanel({
  hero, heroId: _heroId, forces, skills, tags, speAddNames, heroNames, onFieldChange
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('identity');

  return (
    <div className="hero-detail-panel">
      <div className="tab-bar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="tab-content">
        {activeTab === 'identity' && (
          <IdentityTab hero={hero} forces={forces} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'attributes' && (
          <AttributesTab hero={hero} speAddNames={speAddNames} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'skills' && (
          <SkillsTab hero={hero} skills={skills} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'equipment' && (
          <EquipmentTab hero={hero} speAddNames={speAddNames} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'inventory' && (
          <InventoryTab hero={hero} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'relationships' && (
          <RelationshipsTab hero={hero} heroNames={heroNames} onFieldChange={onFieldChange} />
        )}
        {activeTab === 'tags' && (
          <TagsTab hero={hero} tags={tags} onFieldChange={onFieldChange} />
        )}
      </div>
    </div>
  );
}

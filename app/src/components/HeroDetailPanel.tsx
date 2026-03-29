import { Tabs } from 'antd';
import {
  UserOutlined,
  ThunderboltOutlined,
  BookOutlined,
  SkinOutlined,
  ShoppingOutlined,
  TeamOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { HeroDetail } from '../types/hero';
import type { ForceEntry, KungfuEntry, TagEntry, SpeAddEntry } from '../types/assets';
import { IdentityTab } from './tabs/IdentityTab';
import { AttributesTab } from './tabs/AttributesTab';
import { SkillsTab } from './tabs/SkillsTab';
import { EquipmentTab } from './tabs/EquipmentTab';
import { InventoryTab } from './tabs/InventoryTab';
import { RelationshipsTab } from './tabs/RelationshipsTab';
import { TagsTab } from './tabs/TagsTab';

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
  const items = [
    { key: 'identity', label: '身份', icon: <UserOutlined />, children: <IdentityTab hero={hero} forces={forces} onFieldChange={onFieldChange} /> },
    { key: 'attributes', label: '属性', icon: <ThunderboltOutlined />, children: <AttributesTab hero={hero} speAddNames={speAddNames} onFieldChange={onFieldChange} /> },
    { key: 'skills', label: '武学', icon: <BookOutlined />, children: <SkillsTab hero={hero} skills={skills} onFieldChange={onFieldChange} /> },
    { key: 'equipment', label: '装备', icon: <SkinOutlined />, children: <EquipmentTab hero={hero} speAddNames={speAddNames} onFieldChange={onFieldChange} /> },
    { key: 'inventory', label: '物品', icon: <ShoppingOutlined />, children: <InventoryTab hero={hero} speAddNames={speAddNames} onFieldChange={onFieldChange} /> },
    { key: 'relationships', label: '关系', icon: <TeamOutlined />, children: <RelationshipsTab hero={hero} heroNames={heroNames} onFieldChange={onFieldChange} /> },
    { key: 'tags', label: '天赋', icon: <StarOutlined />, children: <TagsTab hero={hero} tags={tags} onFieldChange={onFieldChange} /> },
  ];

  return (
    <div className="hero-detail-panel">
      <Tabs
        defaultActiveKey="identity"
        items={items}
        size="small"
        style={{ height: '100%' }}
        tabBarStyle={{ paddingLeft: 12, marginBottom: 0 }}
      />
    </div>
  );
}

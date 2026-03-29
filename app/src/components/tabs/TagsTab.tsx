import { Table, InputNumber, Tag, Flex } from 'antd';
import type { HeroDetail } from '../../types/hero';
import type { TagEntry } from '../../types/assets';
import { FieldLabel } from '../common/FieldLabel';
import { TAG_CATEGORY_COLORS, getTagColor } from '../../theme/themeConfig';

interface Props {
  hero: HeroDetail;
  tags: Record<number, TagEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

/** Render effect string like "力道潜力+5;力道+5" as colored tags */
function EffectDisplay({ text, color }: { text: string; color: string }) {
  if (!text || text === '?') return <span style={{ color: '#64748b', fontSize: 12 }}>—</span>;
  const parts = text.split(';').filter(Boolean);
  return (
    <Flex wrap gap={2}>
      {parts.map((p, i) => (
        <Tag key={i} style={{ fontSize: 11, margin: 0, borderColor: `${color}40`, background: `${color}15`, color }} bordered>
          {p.trim()}
        </Tag>
      ))}
    </Flex>
  );
}

export function TagsTab({ hero, tags, onFieldChange }: Props) {
  const heroTags = (hero.heroTagData as Array<{ tagID: number; lv: number }>) || [];

  const dataSource = heroTags.map((tag, i) => {
    const info = tags[tag.tagID] || tags[String(tag.tagID) as unknown as number];
    return {
      key: i,
      index: i,
      tagID: tag.tagID,
      name: info?.name ?? `天赋#${tag.tagID}`,
      category: info?.category ?? '?',
      effect: info?.effect ?? '?',
      value: info?.value ?? 1,
      lv: tag.lv,
    };
  });

  const columns = [
    {
      title: <FieldLabel text="名称" jsonPath="heroTagData[].tagID → HeroTagData.name" />,
      dataIndex: 'name',
      key: 'name',
      width: 130,
      render: (name: string, record: { category: string; value: number }) => {
        const color = getTagColor(record.category, record.value);
        return <span style={{ fontWeight: 600, color }}>{name}</span>;
      },
    },
    {
      title: <FieldLabel text="分类" jsonPath="HeroTagData.category" />,
      dataIndex: 'category',
      key: 'category',
      width: 70,
      render: (cat: string) => {
        const info = TAG_CATEGORY_COLORS[cat];
        if (!info) return cat;
        return (
          <span
            className="rarity-badge"
            style={{ background: info.bg, color: info.color, borderColor: info.color }}
          >
            {cat}
          </span>
        );
      },
    },
    {
      title: <FieldLabel text="效果" jsonPath="HeroTagData.effect" />,
      dataIndex: 'effect',
      key: 'effect',
      render: (text: string, record: { category: string; value: number }) => {
        const color = getTagColor(record.category, record.value);
        return <EffectDisplay text={text} color={color} />;
      },
    },
    {
      title: <FieldLabel text="等级" jsonPath="heroTagData[].lv" />,
      dataIndex: 'lv',
      key: 'lv',
      width: 80,
      render: (val: number, record: { index: number }) => (
        <InputNumber
          value={val}
          min={0}
          max={10}
          size="small"
          onChange={(v) => {
            if (v !== null) onFieldChange(`heroTagData.${record.index}.lv`, v);
          }}
          style={{ width: 56 }}
        />
      ),
    },
  ];

  return (
    <div className="tab-scroll">
      <div className="section-title">天赋 ({heroTags.length})</div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        scroll={{ y: 500 }}
      />
    </div>
  );
}

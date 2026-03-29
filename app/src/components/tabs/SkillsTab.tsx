import { useState } from 'react';
import { Table, InputNumber, Drawer, Form, Switch, Flex, Button, Descriptions, Tag, Tooltip } from 'antd';
import { CheckOutlined, EditOutlined } from '@ant-design/icons';
import { FieldLabel } from '../common/FieldLabel';
import type { HeroDetail } from '../../types/hero';
import type { KungfuEntry } from '../../types/assets';
import { RARITY_COLORS } from '../../theme/themeConfig';

const KUNGFU_LEVEL_MAP: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };

/** Safely look up a skill entry — handles JSON string-key vs numeric-key mismatch */
function lookupSkill(skills: Record<number, KungfuEntry>, skillID: number): KungfuEntry | undefined {
  return skills[skillID] ?? skills[String(skillID) as unknown as number];
}

/** Parse semicolon-delimited effect strings like "内功1;经脉1" into "name+value" tags.
 *  Values like 0.04 are displayed as percentages (4%). */
function formatEffect(raw: string): string {
  const trimmed = raw.trim();
  // Match: Chinese name followed by a numeric value (e.g. "内功1", "速度0.04", "生命上限20")
  const match = trimmed.match(/^(.+?)([-]?\d+\.?\d*)$/);
  if (!match) return trimmed;
  const [, name, numStr] = match;
  const num = parseFloat(numStr);
  if (isNaN(num)) return trimmed;
  // Values < 1 and > 0 are percentages in this context (e.g. 0.04 = 4%)
  if (Math.abs(num) < 1 && num !== 0) {
    return `${name}+${Math.round(num * 100)}%`;
  }
  return `${name}+${num}`;
}

function EffectTags({ text, color }: { text: string; color?: string }) {
  if (!text) return <span style={{ color: '#64748b', fontSize: 12 }}>—</span>;
  const parts = text.split(';').filter(Boolean);
  return (
    <Flex wrap gap={2}>
      {parts.map((p, i) => (
        <Tag key={i} style={{ fontSize: 11, margin: 0 }} color={color}>{formatEffect(p)}</Tag>
      ))}
    </Flex>
  );
}

interface SkillRow {
  key: number;
  index: number;
  skillID: number;
  name: string;
  category: string;
  level: number;
  description: string;
  trainEffect: string;
  useEffect: string;
  useSpecial: string;
  /** Merged display: useEffect if present, else useSpecial */
  effectDisplay: string;
  trainReq: string;
  manaCost: string;
  expCoeff: string;
  lv: number;
  equiped: boolean;
  fightExp: number;
  bookExp: number;
}

interface Props {
  hero: HeroDetail;
  skills: Record<number, KungfuEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function SkillsTab({ hero, skills, onFieldChange }: Props) {
  const [editingSkill, setEditingSkill] = useState<SkillRow | null>(null);

  const heroSkills = (hero.kungfuSkills as Array<{
    skillID: number; lv: number; equiped: boolean;
    fightExp?: number; bookExp?: number;
  }>) || [];

  const dataSource: SkillRow[] = heroSkills.map((sk, i) => {
    const info = lookupSkill(skills, sk.skillID);
    return {
      key: i,
      index: i,
      skillID: sk.skillID,
      name: info?.name ?? `技能#${sk.skillID}`,
      category: info?.category ?? '?',
      level: info?.level ?? 0,
      description: info?.description ?? '',
      trainEffect: info?.train_effect ?? '',
      useEffect: info?.use_effect ?? '',
      useSpecial: info?.use_special ?? '',
      effectDisplay: (info?.use_effect || info?.use_special) ?? '',
      trainReq: info?.train_req ?? '',
      manaCost: info?.mana_cost ?? '',
      expCoeff: info?.exp_coeff ?? '',
      lv: sk.lv,
      equiped: sk.equiped,
      fightExp: sk.fightExp ?? 0,
      bookExp: sk.bookExp ?? 0,
    };
  });

  const columns = [
    {
      title: <FieldLabel text="名称" jsonPath="kungfuSkills[].skillID → KungFuData.name" />,
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: SkillRow) => {
        const rarityIdx = KUNGFU_LEVEL_MAP[record.level] ?? 0;
        const rarity = RARITY_COLORS[rarityIdx] || RARITY_COLORS[0];
        return (
          <Tooltip title={record.description || undefined}>
            <span style={{ fontWeight: 600, color: rarity.color, cursor: 'help' }}>{name}</span>
          </Tooltip>
        );
      },
    },
    { title: <FieldLabel text="类别" jsonPath="KungFuData.category" />, dataIndex: 'category', key: 'category', width: 56 },
    {
      title: <FieldLabel text="品级" jsonPath="KungFuData.level" />,
      dataIndex: 'level',
      key: 'level',
      width: 65,
      render: (lv: number) => {
        const rarityIdx = KUNGFU_LEVEL_MAP[lv] ?? 0;
        const rarity = RARITY_COLORS[rarityIdx] || RARITY_COLORS[0];
        return (
          <span className="rarity-badge" style={{ background: rarity.bg, color: rarity.color, borderColor: rarity.color }}>
            {rarity.label}
          </span>
        );
      },
    },
    {
      title: <FieldLabel text="升级效果" jsonPath="KungFuData.col[7]" />,
      dataIndex: 'trainEffect',
      key: 'trainEffect',
      ellipsis: true,
      render: (text: string) => <EffectTags text={text} color="blue" />,
    },
    {
      title: <FieldLabel text="效果" jsonPath="KungFuData.col[8] / col[13]" />,
      dataIndex: 'effectDisplay',
      key: 'effectDisplay',
      ellipsis: true,
      render: (text: string, record: SkillRow) => {
        // col[8] (运功/佩带) for passives, col[13] (使用特效) for combat
        const isPassive = !!record.useEffect;
        return <EffectTags text={text} color={isPassive ? 'green' : 'orange'} />;
      },
    },
    {
      title: <FieldLabel text="等级" jsonPath="kungfuSkills[].lv" />,
      dataIndex: 'lv',
      key: 'lv',
      width: 48,
      render: (val: number) => <span style={{ fontWeight: 600 }}>{val}</span>,
    },
    {
      title: <FieldLabel text="装备" jsonPath="kungfuSkills[].equiped" />,
      dataIndex: 'equiped',
      key: 'equiped',
      width: 44,
      align: 'center' as const,
      render: (val: boolean) => val ? <CheckOutlined style={{ color: '#10B981' }} /> : null,
    },
    {
      title: '',
      key: 'action',
      width: 36,
      render: (_: unknown, record: SkillRow) => (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={(e) => { e.stopPropagation(); setEditingSkill(record); }}
        />
      ),
    },
  ];

  const handleSkillFieldChange = (field: string, value: unknown) => {
    if (!editingSkill) return;
    const path = `kungfuSkills.${editingSkill.index}.${field}`;
    onFieldChange(path, value);
    setEditingSkill((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const editRarity = editingSkill
    ? (RARITY_COLORS[KUNGFU_LEVEL_MAP[editingSkill.level] ?? 0] || RARITY_COLORS[0])
    : RARITY_COLORS[0];

  return (
    <div className="tab-scroll">
      <div className="section-title">武学 ({heroSkills.length})</div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        scroll={{ y: 500 }}
        onRow={(record) => ({
          onClick: () => setEditingSkill(record),
          style: { cursor: 'pointer' },
        })}
      />

      {/* ── Skill Editor Drawer ── */}
      <Drawer
        title={
          editingSkill ? (
            <Flex align="center" gap={8}>
              <span style={{ fontWeight: 700, color: editRarity.color }}>{editingSkill.name}</span>
              <span className="rarity-badge" style={{
                background: editRarity.bg,
                color: editRarity.color,
                borderColor: editRarity.color,
              }}>
                {editRarity.label}
              </span>
              <Tag style={{ margin: 0 }}>{editingSkill.category}</Tag>
            </Flex>
          ) : '编辑武学'
        }
        open={!!editingSkill}
        onClose={() => setEditingSkill(null)}
        width={480}
      >
        {editingSkill && (
          <>
            {/* ── Read-only info from KungFuData.txt ── */}
            <div className="section-title">武学信息 (KungFuData.txt)</div>
            <Descriptions size="small" bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label={<FieldLabel text="技能ID" jsonPath="kungfuSkills[].skillID" />}>{editingSkill.skillID}</Descriptions.Item>
              <Descriptions.Item label={<FieldLabel text="经验系数" jsonPath="KungFuData.col[6]" />}>{editingSkill.expCoeff || '—'}</Descriptions.Item>
              <Descriptions.Item label={<FieldLabel text="内力消耗" jsonPath="KungFuData.col[14]" />}>{editingSkill.manaCost || '—'}</Descriptions.Item>
              <Descriptions.Item label={<FieldLabel text="修炼需求" jsonPath="KungFuData.col[10]" />}>{editingSkill.trainReq || '—'}</Descriptions.Item>
            </Descriptions>
            {editingSkill.description && (
              <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 6, fontSize: 12, lineHeight: 1.6, background: 'var(--ant-color-bg-container-disabled, rgba(0,0,0,0.04))' }}>
                {editingSkill.description}
              </div>
            )}
            {editingSkill.trainEffect && (
              <div style={{ marginBottom: 8 }}>
                <FieldLabel text="升级效果" jsonPath="KungFuData.col[7]" />
                <span style={{ marginLeft: 4 }}><EffectTags text={editingSkill.trainEffect} color="blue" /></span>
              </div>
            )}
            {editingSkill.useEffect && (
              <div style={{ marginBottom: 8 }}>
                <FieldLabel text="佩带效果" jsonPath="KungFuData.col[8]" />
                <span style={{ marginLeft: 4 }}><EffectTags text={editingSkill.useEffect} color="green" /></span>
              </div>
            )}
            {editingSkill.useSpecial && (
              <div style={{ marginBottom: 12 }}>
                <FieldLabel text="使用特效" jsonPath="KungFuData.col[13]" />
                <span style={{ marginLeft: 4 }}><EffectTags text={editingSkill.useSpecial} color="orange" /></span>
              </div>
            )}

            {/* ── Editable fields from hero save ── */}
            <div className="section-title">修改属性 (Hero JSON)</div>
            <Form layout="vertical" size="small">
              <Flex gap={12}>
                <Form.Item label={<FieldLabel text="修炼等级" jsonPath="kungfuSkills[].lv" />} style={{ flex: 1 }}>
                  <InputNumber
                    value={editingSkill.lv}
                    min={0}
                    max={10}
                    onChange={(v) => { if (v !== null) handleSkillFieldChange('lv', v); }}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label={<FieldLabel text="装备" jsonPath="kungfuSkills[].equiped" />} style={{ flex: 1, paddingTop: 4 }}>
                  <Switch
                    checked={editingSkill.equiped}
                    onChange={(v) => handleSkillFieldChange('equiped', v)}
                    checkedChildren="已装备"
                    unCheckedChildren="未装备"
                  />
                </Form.Item>
              </Flex>
              <Flex gap={12}>
                <Form.Item label={<FieldLabel text="实战经验" jsonPath="kungfuSkills[].fightExp" />} style={{ flex: 1 }}>
                  <InputNumber
                    value={editingSkill.fightExp}
                    min={0}
                    onChange={(v) => { if (v !== null) handleSkillFieldChange('fightExp', v); }}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                <Form.Item label={<FieldLabel text="研读经验" jsonPath="kungfuSkills[].bookExp" />} style={{ flex: 1 }}>
                  <InputNumber
                    value={editingSkill.bookExp}
                    min={0}
                    onChange={(v) => { if (v !== null) handleSkillFieldChange('bookExp', v); }}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Flex>
            </Form>
          </>
        )}
      </Drawer>
    </div>
  );
}

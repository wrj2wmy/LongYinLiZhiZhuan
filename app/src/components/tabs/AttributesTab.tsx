import { Card, Table, Row, Col, InputNumber } from 'antd';
import type { HeroDetail } from '../../types/hero';
import type { SpeAddEntry } from '../../types/assets';
import { NumberField } from '../common/EditableField';
import { FieldLabel } from '../common/FieldLabel';

const ATTRI_NAMES = ['力道', '灵巧', '智力', '意志', '体质', '经脉'];
const FIGHT_NAMES = ['内功', '轻功', '绝技', '拳掌', '剑法', '刀法', '长兵', '奇门', '射术'];
const LIVING_NAMES = ['医术', '毒术', '学识', '口才', '采伐', '木植', '锻造', '炼药', '烹饪'];

interface Props {
  hero: HeroDetail;
  speAddNames: Record<number, SpeAddEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

function ArrayTable({
  label,
  names,
  baseKey,
  maxKey,
  totalKey,
  hero,
  onFieldChange,
}: {
  label: string;
  names: string[];
  baseKey: string;
  maxKey: string;
  totalKey: string;
  hero: HeroDetail;
  onFieldChange: (path: string, val: unknown) => void;
}) {
  const base = hero[baseKey] as number[];
  const max = hero[maxKey] as number[];
  const total = hero[totalKey] as number[];

  const dataSource = names.map((name, i) => ({
    key: name,
    name,
    base: base[i],
    max: max[i],
    total: total[i],
    index: i,
  }));

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name', width: 70 },
    {
      title: <FieldLabel text="基础" jsonPath={baseKey} />,
      key: 'base',
      width: 90,
      render: (_: unknown, record: { base: number; index: number }) => (
        <InputNumber
          value={record.base}
          size="small"
          onChange={(v) => { if (v !== null) onFieldChange(`${baseKey}.${record.index}`, v); }}
          style={{ width: 70 }}
        />
      ),
    },
    {
      title: <FieldLabel text="上限" jsonPath={maxKey} />,
      key: 'max',
      width: 90,
      render: (_: unknown, record: { max: number; index: number }) => (
        <InputNumber
          value={record.max}
          size="small"
          onChange={(v) => { if (v !== null) onFieldChange(`${maxKey}.${record.index}`, v); }}
          style={{ width: 70 }}
        />
      ),
    },
    {
      title: <FieldLabel text="当前" jsonPath={totalKey} />,
      key: 'total',
      width: 90,
      render: (_: unknown, record: { total: number; index: number }) => (
        <InputNumber
          value={record.total}
          size="small"
          onChange={(v) => { if (v !== null) onFieldChange(`${totalKey}.${record.index}`, v); }}
          style={{ width: 70 }}
        />
      ),
    },
  ];

  return (
    <>
      <div className="section-title">{label}</div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        size="small"
        bordered
        style={{ marginBottom: 16 }}
      />
    </>
  );
}

export function AttributesTab({ hero, onFieldChange }: Props) {
  return (
    <div className="tab-scroll">
      <div className="section-title">生命资源</div>
      <Card size="small" style={{ marginBottom: 12 }}>
        <Row gutter={[12, 0]}>
          <Col span={12}>
            <NumberField label={<FieldLabel text="生命" jsonPath="hp" />} value={hero.hp as number} onChange={(v) => onFieldChange('hp', v)} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="最大生命" jsonPath="maxhp" />} value={hero.maxhp as number} onChange={(v) => onFieldChange('maxhp', v)} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="体力" jsonPath="power" />} value={hero.power as number} onChange={(v) => onFieldChange('power', v)} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="最大体力" jsonPath="maxPower" />} value={hero.maxPower as number} onChange={(v) => onFieldChange('maxPower', v)} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="内力" jsonPath="mana" />} value={hero.mana as number} onChange={(v) => onFieldChange('mana', v)} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="最大内力" jsonPath="maxMana" />} value={hero.maxMana as number} onChange={(v) => onFieldChange('maxMana', v)} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="护甲" jsonPath="armor" />} value={hero.armor as number} onChange={(v) => onFieldChange('armor', v)} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="外伤" jsonPath="externalInjury" />} value={hero.externalInjury as number} onChange={(v) => onFieldChange('externalInjury', v)} min={0} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="内伤" jsonPath="internalInjury" />} value={hero.internalInjury as number} onChange={(v) => onFieldChange('internalInjury', v)} min={0} />
          </Col>
          <Col span={12}>
            <NumberField label={<FieldLabel text="中毒" jsonPath="poisonInjury" />} value={hero.poisonInjury as number} onChange={(v) => onFieldChange('poisonInjury', v)} min={0} />
          </Col>
        </Row>
      </Card>

      <ArrayTable label="六维属性" names={ATTRI_NAMES} baseKey="baseAttri" maxKey="maxAttri" totalKey="totalAttri" hero={hero} onFieldChange={onFieldChange} />
      <ArrayTable label="武学技能" names={FIGHT_NAMES} baseKey="baseFightSkill" maxKey="maxFightSkill" totalKey="totalFightSkill" hero={hero} onFieldChange={onFieldChange} />
      <ArrayTable label="技艺" names={LIVING_NAMES} baseKey="baseLivingSkill" maxKey="maxLivingSkill" totalKey="totalLivingSkill" hero={hero} onFieldChange={onFieldChange} />
    </div>
  );
}

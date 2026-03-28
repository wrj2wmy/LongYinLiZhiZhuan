import type { HeroDetail } from '../../types/hero';
import type { SpeAddEntry } from '../../types/assets';
import { NumberField } from '../common/EditableField';

const ATTRI_NAMES = ['力道', '灵巧', '智力', '意志', '体质', '经脉'];
const FIGHT_NAMES = ['内功', '轻功', '绝技', '拳掌', '剑法', '刀法', '长兵', '奇门', '射术'];
const LIVING_NAMES = ['医术', '毒术', '学识', '口才', '采伐', '木植', '锻造', '炼药', '烹饪'];

interface Props {
  hero: HeroDetail;
  speAddNames: Record<number, SpeAddEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

function ArrayEditor({
  label, names, baseKey, maxKey, totalKey, hero, onFieldChange,
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

  return (
    <div className="attri-section">
      <h3>{label}</h3>
      <div className="attri-header">
        <span className="attri-name-col">名称</span>
        <span className="attri-val-col">基础</span>
        <span className="attri-val-col">上限</span>
        <span className="attri-val-col">当前</span>
      </div>
      {names.map((name, i) => (
        <div key={name} className="attri-row">
          <span className="attri-name-col">{name}</span>
          <NumberField label="" value={base[i]} onChange={(v) => onFieldChange(`${baseKey}.${i}`, v)} />
          <NumberField label="" value={max[i]} onChange={(v) => onFieldChange(`${maxKey}.${i}`, v)} />
          <NumberField label="" value={total[i]} onChange={(v) => onFieldChange(`${totalKey}.${i}`, v)} />
        </div>
      ))}
    </div>
  );
}

export function AttributesTab({ hero, onFieldChange }: Props) {
  return (
    <div className="tab-attributes">
      <h3>生命资源</h3>
      <div className="resource-grid">
        <NumberField label="生命" value={hero.hp as number} onChange={(v) => onFieldChange('hp', v)} />
        <NumberField label="最大生命" value={hero.maxhp as number} onChange={(v) => onFieldChange('maxhp', v)} />
        <NumberField label="体力" value={hero.power as number} onChange={(v) => onFieldChange('power', v)} />
        <NumberField label="最大体力" value={hero.maxPower as number} onChange={(v) => onFieldChange('maxPower', v)} />
        <NumberField label="内力" value={hero.mana as number} onChange={(v) => onFieldChange('mana', v)} />
        <NumberField label="最大内力" value={hero.maxMana as number} onChange={(v) => onFieldChange('maxMana', v)} />
        <NumberField label="护甲" value={hero.armor as number} onChange={(v) => onFieldChange('armor', v)} />
        <NumberField label="外伤" value={hero.externalInjury as number} onChange={(v) => onFieldChange('externalInjury', v)} min={0} />
        <NumberField label="内伤" value={hero.internalInjury as number} onChange={(v) => onFieldChange('internalInjury', v)} min={0} />
        <NumberField label="中毒" value={hero.poisonInjury as number} onChange={(v) => onFieldChange('poisonInjury', v)} min={0} />
      </div>

      <ArrayEditor label="六维属性" names={ATTRI_NAMES} baseKey="baseAttri" maxKey="maxAttri" totalKey="totalAttri" hero={hero} onFieldChange={onFieldChange} />
      <ArrayEditor label="武学技能" names={FIGHT_NAMES} baseKey="baseFightSkill" maxKey="maxFightSkill" totalKey="totalFightSkill" hero={hero} onFieldChange={onFieldChange} />
      <ArrayEditor label="技艺" names={LIVING_NAMES} baseKey="baseLivingSkill" maxKey="maxLivingSkill" totalKey="totalLivingSkill" hero={hero} onFieldChange={onFieldChange} />
    </div>
  );
}

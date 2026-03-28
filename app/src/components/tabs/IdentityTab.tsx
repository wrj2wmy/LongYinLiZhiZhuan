import type { HeroDetail } from '../../types/hero';
import type { ForceEntry } from '../../types/assets';
import { TextField, NumberField, CheckboxField, SelectField } from '../common/EditableField';

interface Props {
  hero: HeroDetail;
  forces: Record<number, ForceEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function IdentityTab({ hero, forces, onFieldChange }: Props) {
  const forceOptions = Object.values(forces)
    .sort((a, b) => a.id - b.id)
    .map((f) => ({ value: f.id, label: f.name }));
  forceOptions.unshift({ value: -1, label: '无门派' });

  return (
    <div className="tab-identity">
      <h3>基本信息</h3>
      <TextField label="姓名" value={hero.heroName as string} onChange={(v) => onFieldChange('heroName', v)} />
      <TextField label="姓氏" value={hero.heroFamilyName as string} onChange={(v) => onFieldChange('heroFamilyName', v)} />
      <TextField label="称号" value={(hero.heroNickName as string) || ''} onChange={(v) => onFieldChange('heroNickName', v || null)} />
      <CheckboxField label="女性" value={hero.isFemale as boolean} onChange={(v) => onFieldChange('isFemale', v)} />
      <NumberField label="年龄" value={hero.age as number} onChange={(v) => onFieldChange('age', v)} min={1} max={200} />
      <NumberField label="代数" value={hero.generation as number} onChange={(v) => onFieldChange('generation', v)} min={0} />

      <h3>门派</h3>
      <SelectField label="所属门派" value={hero.belongForceID as number} options={forceOptions} onChange={(v) => onFieldChange('belongForceID', v)} />
      <CheckboxField label="掌门" value={hero.isLeader as boolean} onChange={(v) => onFieldChange('isLeader', v)} />
      <NumberField label="门派等级" value={hero.heroForceLv as number} onChange={(v) => onFieldChange('heroForceLv', v)} min={0} max={5} />
      <CheckboxField label="已故" value={hero.dead as boolean} onChange={(v) => onFieldChange('dead', v)} />
      <CheckboxField label="隐藏" value={hero.hide as boolean} onChange={(v) => onFieldChange('hide', v)} />

      <h3>声望</h3>
      <NumberField label="声望" value={hero.fame as number} onChange={(v) => onFieldChange('fame', v)} />
      <NumberField label="恶名" value={hero.badFame as number} onChange={(v) => onFieldChange('badFame', v)} min={0} />
      <NumberField label="忠义" value={hero.loyal as number} onChange={(v) => onFieldChange('loyal', v)} />
      <NumberField label="邪恶" value={hero.evil as number} onChange={(v) => onFieldChange('evil', v)} min={0} max={100} />
      <NumberField label="混乱" value={hero.chaos as number} onChange={(v) => onFieldChange('chaos', v)} min={0} max={100} />
    </div>
  );
}

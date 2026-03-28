import type { HeroDetail } from '../../types/hero';
import type { SpeAddEntry } from '../../types/assets';
import { NumberField } from '../common/EditableField';

const EQUIP_SLOTS = [
  { key: 'weapon', label: '武器' },
  { key: 'armor', label: '护甲' },
  { key: 'helmet', label: '头盔' },
  { key: 'shoes', label: '鞋子' },
  { key: 'decoration', label: '饰品' },
];

interface Props {
  hero: HeroDetail;
  speAddNames: Record<number, SpeAddEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function EquipmentTab({ hero, speAddNames, onFieldChange }: Props) {
  const equipment = hero.nowEquipment as Record<string, unknown> | null;

  if (!equipment) {
    return (
      <div className="tab-equipment">
        <h3>装备</h3>
        <p>无装备数据</p>
      </div>
    );
  }

  return (
    <div className="tab-equipment">
      <h3>装备栏</h3>
      {EQUIP_SLOTS.map((slot) => {
        const item = equipment[slot.key] as Record<string, unknown> | null;
        if (!item) {
          return (
            <div key={slot.key} className="equip-slot">
              <h4>{slot.label}</h4>
              <p className="equip-empty">空</p>
            </div>
          );
        }

        const itemName = (item.name as string) || `物品#${item.id}`;
        const speAdds = (item.speAddList as Array<{ speAddID: number; value: number }>) || [];

        return (
          <div key={slot.key} className="equip-slot">
            <h4>{slot.label}: {itemName}</h4>
            <NumberField
              label="耐久"
              value={(item.durability as number) || 0}
              onChange={(v) => onFieldChange(`nowEquipment.${slot.key}.durability`, v)}
              min={0}
            />
            {speAdds.length > 0 && (
              <div className="equip-spe-adds">
                <span className="equip-spe-label">特殊属性:</span>
                <ul>
                  {speAdds.map((sa, i) => {
                    const info = speAddNames[sa.speAddID];
                    const name = info?.name ?? `属性#${sa.speAddID}`;
                    const display = info?.isPercentage ? `${sa.value}%` : String(sa.value);
                    return (
                      <li key={i}>
                        {name}: {display}
                        <input
                          type="number"
                          value={sa.value}
                          onChange={(e) =>
                            onFieldChange(
                              `nowEquipment.${slot.key}.speAddList.${i}.value`,
                              parseInt(e.target.value)
                            )
                          }
                          style={{ width: 60, marginLeft: 8 }}
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

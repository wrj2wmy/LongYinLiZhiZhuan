import type { HeroDetail } from '../../types/hero';
import { NumberField } from '../common/EditableField';

interface Props {
  hero: HeroDetail;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function InventoryTab({ hero, onFieldChange }: Props) {
  const money = (hero.money as number) || 0;
  const weight = (hero.weight as number) || 0;
  const maxWeight = (hero.maxWeight as number) || 0;
  const items = (hero.itemListData as Array<Record<string, unknown>>) || [];

  return (
    <div className="tab-inventory">
      <h3>资源</h3>
      <NumberField label="银两" value={money} onChange={(v) => onFieldChange('money', v)} min={0} />
      <div className="field-row">
        <label className="field-label">负重</label>
        <span className="field-value">{weight} / {maxWeight}</span>
      </div>

      <h3>物品 ({items.length})</h3>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>ID</th>
            <th>数量</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const name = (item.name as string) || `物品#${item.id}`;
            const count = (item.count as number) || 1;
            return (
              <tr key={i}>
                <td>{name}</td>
                <td>{item.id as number}</td>
                <td>
                  <input
                    type="number"
                    value={count}
                    min={0}
                    onChange={(e) =>
                      onFieldChange(`itemListData.${i}.count`, parseInt(e.target.value))
                    }
                    style={{ width: 60 }}
                  />
                </td>
              </tr>
            );
          })}
          {items.length === 0 && (
            <tr>
              <td colSpan={3} style={{ textAlign: 'center', color: '#999' }}>
                无物品
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

import { useState } from 'react';
import { Card, Typography, Empty, Descriptions, Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { HeroDetail } from '../../types/hero';
import type { SpeAddEntry } from '../../types/assets';
import { RARITY_COLORS } from '../../theme/themeConfig';
import { FieldLabel } from '../common/FieldLabel';
import { ItemEditorDrawer, toEditableItem } from '../common/ItemEditorDrawer';
import type { EditableItem } from '../common/ItemEditorDrawer';

const EQUIP_SLOTS = [
  { recordKey: 'weaponSaveRecord', maxKey: 'maxWeaponCount', label: '武器' },
  { recordKey: 'armorSaveRecord', maxKey: 'maxArmorCount', label: '护甲' },
  { recordKey: 'helmetSaveRecord', maxKey: 'maxHelmetCount', label: '头盔' },
  { recordKey: 'shoesSaveRecord', maxKey: 'maxShoesCount', label: '鞋子' },
  { recordKey: 'decorationSaveRecord', maxKey: 'maxDecorationCount', label: '饰品' },
];

interface Props {
  hero: HeroDetail;
  speAddNames: Record<number, SpeAddEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

function ClickableItemTile({
  item,
  index,
  onClick,
}: {
  item: Record<string, unknown>;
  index: number;
  onClick: (item: EditableItem) => void;
}) {
  const name = (item.name as string) || `物品#${item.itemID}`;
  const rareLv = (item.rareLv as number) || 0;
  const itemLv = (item.itemLv as number) || 0;
  const rarity = RARITY_COLORS[rareLv] || RARITY_COLORS[0];

  return (
    <div
      className="item-tile item-tile--clickable"
      style={{ borderLeftColor: rarity.color, cursor: 'pointer' }}
      onClick={() => onClick(toEditableItem(item, index))}
    >
      <Flex justify="space-between" align="center">
        <Flex align="center" gap={6}>
          <span style={{ fontWeight: 600, fontSize: 13, color: rarity.color }}>{name}</span>
          <EditOutlined style={{ fontSize: 11, color: '#64748b' }} />
        </Flex>
        <Flex gap={4}>
          <span
            className="rarity-badge"
            style={{ background: rarity.bg, color: rarity.color, borderColor: rarity.color }}
          >
            {rarity.label}
          </span>
          {itemLv > 0 && <span className="level-badge">Lv{itemLv}</span>}
        </Flex>
      </Flex>
      {/* Show describe if available */}
      {typeof item.describe === 'string' && item.describe.length > 0 && (
        <div style={{ fontSize: 11, marginTop: 2, color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.describe}
        </div>
      )}
    </div>
  );
}

export function EquipmentTab({ hero, speAddNames, onFieldChange }: Props) {
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  const equipment = hero.nowEquipment as Record<string, unknown> | null;
  const itemListData = hero.itemListData as Record<string, unknown> | null;
  const allItems = (itemListData?.allItem as Array<Record<string, unknown>>) || [];

  if (!equipment) {
    return (
      <div style={{ padding: 16 }}>
        <Empty description="无装备数据" />
      </div>
    );
  }

  const eqWeight = (equipment.equipmentWeight as number) || 0;
  const horseRecord = hero.horseSaveRecord as number;
  const horseArmorRecord = hero.horseArmorSaveRecord as number;

  const horseItem = horseRecord >= 0 ? allItems[horseRecord] : null;
  const horseArmorItem = horseArmorRecord >= 0 ? allItems[horseArmorRecord] : null;

  const handleItemFieldChange = (itemIndex: number, field: string, value: unknown) => {
    const path = `itemListData.allItem.${itemIndex}.${field}`;
    onFieldChange(path, value);
    // Update local editing state
    setEditingItem((prev) => prev && prev.index === itemIndex ? { ...prev, [field]: value } : prev);
  };

  return (
    <div className="tab-scroll">
      <div className="section-title">装备栏</div>
      <Descriptions size="small" bordered column={1} style={{ marginBottom: 12 }}>
        <Descriptions.Item label={<FieldLabel text="装备总重" jsonPath="nowEquipment.equipmentWeight" />}>{eqWeight.toFixed(1)}</Descriptions.Item>
      </Descriptions>

      {/* ── Standard equipment slots ── */}
      {EQUIP_SLOTS.map((slot) => {
        const records = (equipment[slot.recordKey] as number[]) || [];
        const maxCount = (equipment[slot.maxKey] as number) || 1;

        return (
          <Card
            key={slot.recordKey}
            title={
              <Flex align="center" gap={8}>
                <span>{slot.label}</span>
                <span className="hero-count-pill" style={{ fontSize: 10 }}>{records.length}/{maxCount}</span>
              </Flex>
            }
            size="small"
            style={{ marginBottom: 8 }}
          >
            {records.length === 0 ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>空</Typography.Text>
            ) : (
              <Flex vertical gap={4}>
                {records.map((itemIdx, i) => {
                  const item = allItems[itemIdx] as Record<string, unknown> | undefined;
                  if (!item) {
                    return (
                      <div key={i} className="item-tile" style={{ borderLeftColor: '#6b7280' }}>
                        <Typography.Text type="secondary">物品索引#{itemIdx} (无效)</Typography.Text>
                      </div>
                    );
                  }
                  return (
                    <ClickableItemTile
                      key={i}
                      item={item}
                      index={itemIdx}
                      onClick={setEditingItem}
                    />
                  );
                })}
              </Flex>
            )}
          </Card>
        );
      })}

      {/* ── Horse (坐骑) ── */}
      <Card
        title={
          <Flex align="center" gap={8}>
            <span>坐骑</span>
            {horseItem && <span className="hero-count-pill" style={{ fontSize: 10 }}>已装备</span>}
          </Flex>
        }
        size="small"
        style={{ marginBottom: 8 }}
      >
        {horseItem ? (
          <ClickableItemTile item={horseItem} index={horseRecord} onClick={setEditingItem} />
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>无坐骑</Typography.Text>
        )}
      </Card>

      {/* ── Horse Armor (马鞍/马具) ── */}
      <Card
        title={
          <Flex align="center" gap={8}>
            <span>马具</span>
            {horseArmorItem && <span className="hero-count-pill" style={{ fontSize: 10 }}>已装备</span>}
          </Flex>
        }
        size="small"
        style={{ marginBottom: 8 }}
      >
        {horseArmorItem ? (
          <ClickableItemTile item={horseArmorItem} index={horseArmorRecord} onClick={setEditingItem} />
        ) : (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>无马具</Typography.Text>
        )}
      </Card>

      {/* ── Shared Item Editor Drawer ── */}
      <ItemEditorDrawer
        item={editingItem}
        speAddNames={speAddNames}
        onClose={() => setEditingItem(null)}
        onFieldChange={handleItemFieldChange}
      />
    </div>
  );
}

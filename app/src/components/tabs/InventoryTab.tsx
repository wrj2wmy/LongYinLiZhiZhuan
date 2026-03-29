import { useState } from 'react';
import { Table, Card, Descriptions, Flex } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import type { HeroDetail } from '../../types/hero';
import type { SpeAddEntry } from '../../types/assets';
import { NumberField } from '../common/EditableField';
import { FieldLabel } from '../common/FieldLabel';
import { RARITY_COLORS } from '../../theme/themeConfig';
import { ItemEditorDrawer, toEditableItem, RarityDot } from '../common/ItemEditorDrawer';
import type { EditableItem } from '../common/ItemEditorDrawer';

const ITEM_TYPE_LABELS: Record<number, string> = {
  0: '装备', 1: '药品', 2: '食物', 3: '书籍', 4: '珍宝', 5: '材料', 6: '坐骑',
};

interface Props {
  hero: HeroDetail;
  speAddNames: Record<number, SpeAddEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function InventoryTab({ hero, speAddNames, onFieldChange }: Props) {
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);

  const itemListData = hero.itemListData as Record<string, unknown> | null;
  const money = (itemListData?.money as number) || 0;
  const weight = (itemListData?.weight as number) || 0;
  const maxWeight = (itemListData?.maxWeight as number) || 0;
  const items = (itemListData?.allItem as Array<Record<string, unknown>>) || [];

  const dataSource = items.map((item, i) => ({
    key: i,
    index: i,
    name: (item.name as string) || `物品#${item.itemID}`,
    itemID: item.itemID as number,
    type: (item.type as number) ?? 0,
    rareLv: (item.rareLv as number) || 0,
    itemLv: (item.itemLv as number) || 0,
    value: (item.value as number) || 0,
  }));

  const columns = [
    {
      title: <FieldLabel text="名称" jsonPath="itemListData.allItem[].name" />,
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: { itemLv: number }) => {
        const rarity = RARITY_COLORS[record.itemLv] || RARITY_COLORS[0];
        return <span style={{ fontWeight: 600, color: rarity.color }}>{name}</span>;
      },
    },
    {
      title: <FieldLabel text="类型" jsonPath="itemListData.allItem[].type" />,
      dataIndex: 'type',
      key: 'type',
      width: 56,
      render: (t: number) => <span style={{ fontSize: 11 }}>{ITEM_TYPE_LABELS[t] || `${t}`}</span>,
    },
    {
      title: <FieldLabel text="品级" jsonPath="itemListData.allItem[].itemLv" />,
      dataIndex: 'itemLv',
      key: 'itemLv',
      width: 70,
      render: (lv: number) => {
        const rarity = RARITY_COLORS[lv] || RARITY_COLORS[0];
        return (
          <span className="rarity-badge" style={{ background: rarity.bg, color: rarity.color, borderColor: rarity.color }}>
            {rarity.label}
          </span>
        );
      },
    },
    {
      title: <FieldLabel text="稀有度" jsonPath="itemListData.allItem[].rareLv" />,
      dataIndex: 'rareLv',
      key: 'rareLv',
      width: 56,
      align: 'center' as const,
      render: (lv: number) => <RarityDot level={lv} />,
    },
    { title: <FieldLabel text="价值" jsonPath="itemListData.allItem[].value" />, dataIndex: 'value', key: 'value', width: 80 },
    {
      title: '',
      key: 'action',
      width: 36,
      render: (_: unknown, record: { index: number }) => (
        <EditOutlined
          style={{ cursor: 'pointer', color: '#3b82f6' }}
          onClick={(e) => {
            e.stopPropagation();
            const raw = items[record.index];
            if (raw) setEditingItem(toEditableItem(raw, record.index));
          }}
        />
      ),
    },
  ];

  const handleItemFieldChange = (itemIndex: number, field: string, value: unknown) => {
    const path = `itemListData.allItem.${itemIndex}.${field}`;
    onFieldChange(path, value);
    setEditingItem((prev) => prev && prev.index === itemIndex ? { ...prev, [field]: value } : prev);
  };

  return (
    <div className="tab-scroll">
      <div className="section-title">资源</div>
      <Card size="small" style={{ marginBottom: 12 }}>
        <Flex gap={24} align="center">
          <div style={{ flex: 1, maxWidth: 250 }}>
            <NumberField label={<FieldLabel text="银两" jsonPath="itemListData.money" />} value={money} onChange={(v) => onFieldChange('itemListData.money', v)} min={0} />
          </div>
          <Descriptions size="small" column={1} style={{ flex: 1 }}>
            <Descriptions.Item label={<FieldLabel text="负重" jsonPath="itemListData.weight / maxWeight" />}>{weight} / {maxWeight}</Descriptions.Item>
          </Descriptions>
        </Flex>
      </Card>

      <div className="section-title">物品 ({items.length})</div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={{ pageSize: 50, size: 'small', showSizeChanger: true }}
        size="small"
        bordered
        scroll={{ y: 400 }}
        onRow={(record) => ({
          onClick: () => {
            const raw = items[record.index];
            if (raw) setEditingItem(toEditableItem(raw, record.index));
          },
          style: { cursor: 'pointer' },
        })}
      />

      <ItemEditorDrawer
        item={editingItem}
        speAddNames={speAddNames}
        onClose={() => setEditingItem(null)}
        onFieldChange={handleItemFieldChange}
      />
    </div>
  );
}

import { Drawer, Form, Input, InputNumber, Select, Switch, Flex, Descriptions, Tag, Card } from 'antd';
import { RARITY_COLORS } from '../../theme/themeConfig';
import type { SpeAddEntry } from '../../types/assets';
import { FieldLabel } from './FieldLabel';

const ITEM_TYPE_LABELS: Record<number, string> = {
  0: '装备', 1: '药品', 2: '食物', 3: '书籍', 4: '珍宝', 5: '材料', 6: '坐骑',
};

export interface EditableItem {
  index: number;
  name: string;
  itemID: number;
  type: number;
  subType: number;
  rareLv: number;
  itemLv: number;
  value: number;
  weight: number;
  describe: string;
  poisonNum: number;
  isNew: boolean;
  equipmentData: Record<string, unknown> | null;
  medFoodData: Record<string, unknown> | null;
  bookData: Record<string, unknown> | null;
  treasureData: Record<string, unknown> | null;
  materialData: Record<string, unknown> | null;
  horseData: Record<string, unknown> | null;
}

export function toEditableItem(item: Record<string, unknown>, index: number): EditableItem {
  return {
    index,
    name: (item.name as string) || `物品#${item.itemID}`,
    itemID: item.itemID as number,
    type: (item.type as number) ?? 0,
    subType: (item.subType as number) ?? 0,
    rareLv: (item.rareLv as number) || 0,
    itemLv: (item.itemLv as number) || 0,
    value: (item.value as number) || 0,
    weight: (item.weight as number) || 0,
    describe: (item.describe as string) || '',
    poisonNum: (item.poisonNum as number) || 0,
    isNew: (item.isNew as boolean) || false,
    equipmentData: (item.equipmentData as Record<string, unknown>) || null,
    medFoodData: (item.medFoodData as Record<string, unknown>) || null,
    bookData: (item.bookData as Record<string, unknown>) || null,
    treasureData: (item.treasureData as Record<string, unknown>) || null,
    materialData: (item.materialData as Record<string, unknown>) || null,
    horseData: (item.horseData as Record<string, unknown>) || null,
  };
}

export function RarityDot({ level }: { level: number }) {
  const rarity = RARITY_COLORS[level] || RARITY_COLORS[0];
  return (
    <span
      style={{
        display: 'inline-block',
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: rarity.color,
        boxShadow: `0 0 4px ${rarity.color}60`,
        verticalAlign: 'middle',
      }}
    />
  );
}

/** Format stat value strictly as "name+value" or "name+X%" based on asset isPercentage flag */
function formatStatEntry(name: string, val: number, isPct: boolean): string {
  if (isPct) {
    return `${name}+${Math.round(val * 100)}%`;
  }
  // For non-percentage, round to avoid ugly floats like 4.977777
  const rounded = Number.isInteger(val) ? val : Math.round(val * 100) / 100;
  return `${name}+${rounded}`;
}

/** Editable heroSpeAddData: each stat shown as an InputNumber */
function EditableSpeAdd({
  data,
  speAddNames,
  jsonBasePath,
  onFieldChange,
}: {
  data: Record<string, number>;
  speAddNames: Record<number, SpeAddEntry>;
  jsonBasePath: string;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <span style={{ color: '#64748b', fontSize: 12 }}>无</span>;

  return (
    <Flex vertical gap={4}>
      {entries.map(([idStr, val]) => {
        const id = Number(idStr);
        const entry = speAddNames[id] || speAddNames[String(id) as unknown as number];
        const name = entry?.name ?? `#${id}`;
        const isPct = entry?.isPercentage ?? false;
        return (
          <Flex key={idStr} align="center" gap={8}>
            <Tag color="blue" style={{ margin: 0, fontSize: 11, minWidth: 60 }}>{name}</Tag>
            <InputNumber
              value={val}
              size="small"
              step={isPct ? 0.01 : 1}
              onChange={(v) => { if (v !== null) onFieldChange(`${jsonBasePath}.${idStr}`, v); }}
              style={{ width: 100 }}
            />
            <span style={{ fontSize: 11, color: '#94a3b8' }}>
              {isPct ? `= ${Math.round(val * 100)}%` : ''}
            </span>
          </Flex>
        );
      })}
    </Flex>
  );
}

/** Read-only display of heroSpeAddData as "stat+value" tags */
function SpeAddDisplay({
  data,
  speAddNames,
}: {
  data: Record<string, number>;
  speAddNames: Record<number, SpeAddEntry>;
}) {
  const entries = Object.entries(data);
  if (entries.length === 0) return <span style={{ color: '#64748b', fontSize: 12 }}>无</span>;

  return (
    <Flex wrap gap={4}>
      {entries.map(([idStr, val]) => {
        const id = Number(idStr);
        const entry = speAddNames[id] || speAddNames[String(id) as unknown as number];
        const name = entry?.name ?? `#${id}`;
        const isPct = entry?.isPercentage ?? false;
        return (
          <Tag key={idStr} color="blue" style={{ margin: 0, fontSize: 11 }}>
            {formatStatEntry(name, val, isPct)}
          </Tag>
        );
      })}
    </Flex>
  );
}

/** Editable section for equipment stats (under Hero JSON, editable) */
function EditableExtraAddSection({
  data,
  speAddNames,
  label,
  jsonPath,
  onFieldChange,
}: {
  data: Record<string, unknown> | null | undefined;
  speAddNames: Record<number, SpeAddEntry>;
  label: string;
  jsonPath: string;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  if (!data) return null;
  const heroSpeAdd = (data.heroSpeAddData as Record<string, number>) || null;
  if (!heroSpeAdd || Object.keys(heroSpeAdd).length === 0) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      <FieldLabel text={label} jsonPath={`${jsonPath}.heroSpeAddData`} />
      <span style={{ marginRight: 4 }}>:</span>
      <div style={{ marginTop: 4 }}>
        <EditableSpeAdd
          data={heroSpeAdd}
          speAddNames={speAddNames}
          jsonBasePath={`${jsonPath}.heroSpeAddData`}
          onFieldChange={onFieldChange}
        />
      </div>
    </div>
  );
}

/** Read-only section (for non-equipment items) */
function ReadOnlyExtraAddSection({
  data,
  speAddNames,
  label,
  jsonPath,
}: {
  data: Record<string, unknown> | null | undefined;
  speAddNames: Record<number, SpeAddEntry>;
  label: string;
  jsonPath?: string;
}) {
  if (!data) return null;
  const heroSpeAdd = (data.heroSpeAddData as Record<string, number>) || null;
  if (!heroSpeAdd || Object.keys(heroSpeAdd).length === 0) return null;
  return (
    <div style={{ marginBottom: 8 }}>
      {jsonPath ? <FieldLabel text={label} jsonPath={jsonPath} /> : <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>}
      <span style={{ marginRight: 4 }}>:</span>
      <SpeAddDisplay data={heroSpeAdd} speAddNames={speAddNames} />
    </div>
  );
}

/** Type-specific data sections */
function TypeSpecificData({
  item,
  speAddNames,
  onFieldChange,
}: {
  item: EditableItem;
  speAddNames: Record<number, SpeAddEntry>;
  onFieldChange: (path: string, value: unknown) => void;
}) {
  const itemPath = `itemListData.allItem.${item.index}`;

  switch (item.type) {
    case 0: {
      const eqData = item.equipmentData;
      if (!eqData) return null;
      const baseAdd = eqData.baseAddData as Record<string, unknown> | undefined;
      const extraAdd = eqData.extraAddData as Record<string, unknown> | undefined;
      const speEquip = eqData.speEquipData as Record<string, unknown> | undefined;
      return (
        <Card title={<FieldLabel text="装备属性" jsonPath="equipmentData" />} size="small" style={{ marginBottom: 12 }}>
          <EditableExtraAddSection data={baseAdd} speAddNames={speAddNames} label="基础属性" jsonPath={`${itemPath}.equipmentData.baseAddData`} onFieldChange={onFieldChange} />
          <EditableExtraAddSection data={extraAdd} speAddNames={speAddNames} label="附加属性" jsonPath={`${itemPath}.equipmentData.extraAddData`} onFieldChange={onFieldChange} />
          <EditableExtraAddSection data={speEquip} speAddNames={speAddNames} label="特殊属性" jsonPath={`${itemPath}.equipmentData.speEquipData`} onFieldChange={onFieldChange} />
          {!baseAdd && !extraAdd && !speEquip && (
            <span style={{ color: '#64748b', fontSize: 12 }}>无附加属性</span>
          )}
        </Card>
      );
    }
    case 1:
    case 2: {
      const mfData = item.medFoodData;
      if (!mfData) return null;
      const extraAdd = mfData.extraAddData as Record<string, unknown> | undefined;
      return (
        <Card title={<FieldLabel text={item.type === 1 ? '药品效果' : '食物效果'} jsonPath="medFoodData" />} size="small" style={{ marginBottom: 12 }}>
          <ReadOnlyExtraAddSection data={extraAdd} speAddNames={speAddNames} label="效果" jsonPath="medFoodData.extraAddData.heroSpeAddData" />
          {(mfData.hp != null || mfData.mana != null || mfData.power != null) && (
            <Descriptions size="small" column={3} style={{ marginTop: 4 }}>
              {mfData.hp != null && <Descriptions.Item label={<FieldLabel text="生命" jsonPath="medFoodData.hp" />}>{String(mfData.hp)}</Descriptions.Item>}
              {mfData.mana != null && <Descriptions.Item label={<FieldLabel text="内力" jsonPath="medFoodData.mana" />}>{String(mfData.mana)}</Descriptions.Item>}
              {mfData.power != null && <Descriptions.Item label={<FieldLabel text="体力" jsonPath="medFoodData.power" />}>{String(mfData.power)}</Descriptions.Item>}
            </Descriptions>
          )}
        </Card>
      );
    }
    case 3: {
      const bookData = item.bookData;
      if (!bookData) return null;
      return (
        <Card title={<FieldLabel text="书籍数据" jsonPath="bookData" />} size="small" style={{ marginBottom: 12 }}>
          {bookData.skillID != null && (
            <Descriptions size="small" column={2}>
              <Descriptions.Item label={<FieldLabel text="武学ID" jsonPath="bookData.skillID" />}>{String(bookData.skillID)}</Descriptions.Item>
              {bookData.bookLv != null && <Descriptions.Item label={<FieldLabel text="秘籍等级" jsonPath="bookData.bookLv" />}>{String(bookData.bookLv)}</Descriptions.Item>}
            </Descriptions>
          )}
        </Card>
      );
    }
    case 4: {
      const tData = item.treasureData;
      if (!tData) return null;
      const extraAdd = tData.extraAddData as Record<string, unknown> | undefined;
      return (
        <Card title={<FieldLabel text="珍宝属性" jsonPath="treasureData" />} size="small" style={{ marginBottom: 12 }}>
          <ReadOnlyExtraAddSection data={extraAdd} speAddNames={speAddNames} label="属性加成" jsonPath="treasureData.extraAddData.heroSpeAddData" />
        </Card>
      );
    }
    case 5: {
      const matData = item.materialData;
      if (!matData) return null;
      const extraAdd = matData.extraAddData as Record<string, unknown> | undefined;
      return (
        <Card title={<FieldLabel text="材料属性" jsonPath="materialData" />} size="small" style={{ marginBottom: 12 }}>
          <ReadOnlyExtraAddSection data={extraAdd} speAddNames={speAddNames} label="属性加成" jsonPath="materialData.extraAddData.heroSpeAddData" />
        </Card>
      );
    }
    case 6: {
      const hData = item.horseData;
      if (!hData) return null;
      const extraAdd = hData.extraAddData as Record<string, unknown> | undefined;
      return (
        <Card title={<FieldLabel text="坐骑属性" jsonPath="horseData" />} size="small" style={{ marginBottom: 12 }}>
          {(hData.speed != null || hData.power != null) && (
            <Descriptions size="small" bordered column={2} style={{ marginBottom: 8 }}>
              {hData.speed != null && <Descriptions.Item label={<FieldLabel text="速度" jsonPath="horseData.speed" />}>{String(hData.speed)}</Descriptions.Item>}
              {hData.power != null && <Descriptions.Item label={<FieldLabel text="耐力" jsonPath="horseData.power" />}>{String(hData.power)}</Descriptions.Item>}
              {hData.sprint != null && <Descriptions.Item label={<FieldLabel text="冲刺" jsonPath="horseData.sprint" />}>{String(hData.sprint)}</Descriptions.Item>}
              {hData.resist != null && <Descriptions.Item label={<FieldLabel text="抗性" jsonPath="horseData.resist" />}>{String(hData.resist)}</Descriptions.Item>}
            </Descriptions>
          )}
          <ReadOnlyExtraAddSection data={extraAdd} speAddNames={speAddNames} label="属性加成" jsonPath="horseData.extraAddData.heroSpeAddData" />
        </Card>
      );
    }
    default:
      return null;
  }
}

interface Props {
  item: EditableItem | null;
  speAddNames: Record<number, SpeAddEntry>;
  onClose: () => void;
  onFieldChange: (itemIndex: number, field: string, value: unknown) => void;
}

export function ItemEditorDrawer({ item, speAddNames, onClose, onFieldChange }: Props) {
  const itemLvRarity = item ? (RARITY_COLORS[item.itemLv] || RARITY_COLORS[0]) : RARITY_COLORS[0];

  const handleChange = (field: string, value: unknown) => {
    if (!item) return;
    onFieldChange(item.index, field, value);
  };

  /** For deep nested paths like equipmentData.baseAddData.heroSpeAddData.0 */
  const handleDeepChange = (fullPath: string, value: unknown) => {
    if (!item) return;
    // fullPath is like "itemListData.allItem.5.equipmentData.baseAddData.heroSpeAddData.0"
    // We need to strip the prefix "itemListData.allItem.{index}." and pass the rest
    const prefix = `itemListData.allItem.${item.index}.`;
    const field = fullPath.startsWith(prefix) ? fullPath.slice(prefix.length) : fullPath;
    onFieldChange(item.index, field, value);
  };

  return (
    <Drawer
      title={
        item ? (
          <Flex align="center" gap={8}>
            <RarityDot level={item.rareLv} />
            <span style={{ fontWeight: 700, color: itemLvRarity.color }}>{item.name}</span>
            <span className="rarity-badge" style={{ background: itemLvRarity.bg, color: itemLvRarity.color, borderColor: itemLvRarity.color }}>
              {itemLvRarity.label}
            </span>
            <Tag style={{ margin: 0 }}>{ITEM_TYPE_LABELS[item.type] ?? `类型${item.type}`}</Tag>
          </Flex>
        ) : '编辑物品'
      }
      open={!!item}
      onClose={onClose}
      width={520}
    >
      {item && (
        <>
          <Descriptions size="small" bordered column={2} style={{ marginBottom: 12 }}>
            <Descriptions.Item label={<FieldLabel text="物品ID" jsonPath="itemID" />}>{item.itemID}</Descriptions.Item>
            <Descriptions.Item label={<FieldLabel text="类型" jsonPath="type / subType" />}>{ITEM_TYPE_LABELS[item.type] ?? item.type} (子类 {item.subType})</Descriptions.Item>
            {item.describe && (
              <Descriptions.Item label={<FieldLabel text="描述" jsonPath="describe" />} span={2}>{item.describe}</Descriptions.Item>
            )}
          </Descriptions>

          <TypeSpecificData item={item} speAddNames={speAddNames} onFieldChange={handleDeepChange} />

          <div className="section-title">编辑属性</div>
          <Form layout="vertical" size="small">
            <Form.Item label={<FieldLabel text="名称" jsonPath="name" />}>
              <Input value={item.name} onChange={(e) => handleChange('name', e.target.value)} />
            </Form.Item>
            <Flex gap={12}>
              <Form.Item label={<FieldLabel text="价值" jsonPath="value" />} style={{ flex: 1 }}>
                <InputNumber value={item.value} min={0} onChange={(v) => { if (v !== null) handleChange('value', v); }} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label={<FieldLabel text="重量" jsonPath="weight" />} style={{ flex: 1 }}>
                <InputNumber value={item.weight} min={0} step={0.1} onChange={(v) => { if (v !== null) handleChange('weight', v); }} style={{ width: '100%' }} />
              </Form.Item>
            </Flex>
            <Flex gap={12}>
              <Form.Item label={<FieldLabel text="品级" jsonPath="itemLv" />} style={{ flex: 1 }}>
                <Select
                  value={item.itemLv}
                  onChange={(v) => handleChange('itemLv', v)}
                  options={Object.entries(RARITY_COLORS).map(([k, v]) => ({
                    value: Number(k),
                    label: <span style={{ color: v.color, fontWeight: 600 }}>{v.label}</span>,
                  }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item label={<FieldLabel text="稀有度" jsonPath="rareLv" />} style={{ flex: 1 }}>
                <Select
                  value={item.rareLv}
                  onChange={(v) => handleChange('rareLv', v)}
                  options={Object.entries(RARITY_COLORS).map(([k, v]) => ({
                    value: Number(k),
                    label: (
                      <Flex align="center" gap={6}>
                        <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: v.color, boxShadow: `0 0 4px ${v.color}60` }} />
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{Number(k)}</span>
                      </Flex>
                    ),
                  }))}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Flex>
            <Flex gap={12}>
              <Form.Item label={<FieldLabel text="毒性" jsonPath="poisonNum" />} style={{ flex: 1 }}>
                <InputNumber value={item.poisonNum} min={0} onChange={(v) => { if (v !== null) handleChange('poisonNum', v); }} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item label={<FieldLabel text="新物品" jsonPath="isNew" />} style={{ flex: 1, paddingTop: 4 }}>
                <Switch checked={item.isNew} onChange={(v) => handleChange('isNew', v)} checkedChildren="是" unCheckedChildren="否" />
              </Form.Item>
            </Flex>
          </Form>
        </>
      )}
    </Drawer>
  );
}

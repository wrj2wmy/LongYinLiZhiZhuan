import { useState, useMemo, useRef, useEffect } from 'react';
import { List } from 'react-window';
import { Input, Select, Checkbox, Typography, Flex } from 'antd';
import type { CSSProperties, ReactElement } from 'react';
import type { HeroSummary } from '../types/hero';
import type { ForceEntry } from '../types/assets';
import { useTheme } from '../theme/ThemeContext';
import { FORCE_LV_COLORS } from '../theme/themeConfig';
import './HeroListPanel.css';

const { Search } = Input;
const { Text } = Typography;

interface Props {
  heroes: HeroSummary[];
  forces: Record<number, ForceEntry>;
  selectedHeroId: number | null;
  onSelectHero: (heroId: number) => void;
}

interface HeroRowProps {
  filtered: HeroSummary[];
  forces: Record<number, ForceEntry>;
  selectedHeroId: number | null;
  onSelectHero: (heroId: number) => void;
  isDark: boolean;
}

function HeroRow({
  index,
  style,
  filtered,
  forces,
  selectedHeroId,
  onSelectHero,
  isDark,
}: {
  ariaAttributes: {
    'aria-posinset': number;
    'aria-setsize': number;
    role: 'listitem';
  };
  index: number;
  style: CSSProperties;
} & HeroRowProps): ReactElement {
  const hero = filtered[index];
  const force = forces[hero.belongForceID];
  const forceName = force?.name || '无门派';
  const isSelected = hero.heroID === selectedHeroId;
  const lvInfo = FORCE_LV_COLORS[hero.heroForceLv] || FORCE_LV_COLORS[0];

  return (
    <div
      style={style}
      className={`hero-card ${isSelected ? 'hero-card--selected' : ''} ${hero.dead ? 'hero-card--dead' : ''}`}
      onClick={() => onSelectHero(hero.heroID)}
    >
      <div className="hero-card__inner">
        {/* Top row: name + ID */}
        <div className="hero-card__top">
          <span className="hero-card__name">
            <span className={`hero-card__gender ${hero.isFemale ? 'female' : 'male'}`}>
              {hero.isFemale ? '♀' : '♂'}
            </span>
            {hero.heroName}
          </span>
          <span className="hero-card__id">#{hero.heroID}</span>
        </div>
        {/* Bottom row: chips */}
        <div className="hero-card__chips">
          <span className="hero-chip hero-chip--force">{forceName}</span>
          <span
            className="hero-chip hero-chip--lv"
            style={{
              color: lvInfo.color,
              borderColor: lvInfo.color,
              background: isDark ? `${lvInfo.color}20` : `${lvInfo.color}12`,
            }}
          >
            {lvInfo.label}
          </span>
          <span className="hero-chip hero-chip--age">{hero.age}岁</span>
        </div>
      </div>
    </div>
  );
}

export function HeroListPanel({ heroes, forces, selectedHeroId, onSelectHero }: Props) {
  const [search, setSearch] = useState('');
  const [showDead, setShowDead] = useState(true);
  const [forceFilter, setForceFilter] = useState<number | null>(null);
  const [listHeight, setListHeight] = useState(400);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useTheme();

  useEffect(() => {
    const el = listContainerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setListHeight(entry.contentRect.height);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const filtered = useMemo(() => {
    return heroes.filter((h) => {
      if (!showDead && h.dead) return false;
      if (forceFilter !== null && h.belongForceID !== forceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const forceName = forces[h.belongForceID]?.name || '';
        return (
          h.heroName.toLowerCase().includes(q) ||
          (h.heroNickName?.toLowerCase().includes(q) ?? false) ||
          forceName.toLowerCase().includes(q) ||
          String(h.heroID).includes(q)
        );
      }
      return true;
    });
  }, [heroes, search, showDead, forceFilter, forces]);

  const forceOptions = useMemo(() => {
    return Object.values(forces)
      .sort((a, b) => a.id - b.id)
      .map((f) => ({ value: f.id, label: f.name }));
  }, [forces]);

  return (
    <div className="hero-list-panel">
      <div className="hero-list-header">
        <Flex align="center" justify="space-between" style={{ marginBottom: 8 }}>
          <Text strong style={{ fontSize: 14 }}>人物列表</Text>
          <span className="hero-count-pill">{filtered.length} / {heroes.length}</span>
        </Flex>
        <Search
          placeholder="姓名 / ID / 关键词"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          size="small"
          style={{ marginBottom: 8 }}
        />
        <Flex gap={6} align="center" wrap>
          <Select
            value={forceFilter}
            onChange={(val) => setForceFilter(val)}
            placeholder="门派"
            allowClear
            size="small"
            style={{ flex: 1, minWidth: 80 }}
            options={forceOptions}
          />
          <Checkbox
            checked={showDead}
            onChange={(e) => setShowDead(e.target.checked)}
            style={{ fontSize: 12 }}
          >
            <Text style={{ fontSize: 12 }}>已故</Text>
          </Checkbox>
        </Flex>
      </div>
      <div ref={listContainerRef} className="hero-list-body">
        <List
          rowComponent={HeroRow}
          rowCount={filtered.length}
          rowHeight={64}
          rowProps={{ filtered, forces, selectedHeroId, onSelectHero, isDark }}
          style={{ height: listHeight, width: '100%' }}
        />
      </div>
    </div>
  );
}

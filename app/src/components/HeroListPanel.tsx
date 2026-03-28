import { useState, useMemo } from 'react';
import { List } from 'react-window';
import type { CSSProperties, ReactElement } from 'react';
import type { HeroSummary } from '../types/hero';
import type { ForceEntry } from '../types/assets';
import './HeroListPanel.css';

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
}

function HeroRow({
  index,
  style,
  filtered,
  forces,
  selectedHeroId,
  onSelectHero,
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
  const forceName = forces[hero.belongForceId]?.name || '无门派';
  const isSelected = hero.heroId === selectedHeroId;

  return (
    <div
      style={style}
      className={`hero-row ${isSelected ? 'selected' : ''} ${hero.dead ? 'dead' : ''}`}
      onClick={() => onSelectHero(hero.heroId)}
    >
      <div className="hero-row-name">
        {hero.isLeader && <span className="leader-badge">主</span>}
        {hero.heroName}
      </div>
      <div className="hero-row-info">
        {forceName} · {hero.age}岁 · Lv{hero.heroForceLv}
      </div>
    </div>
  );
}

export function HeroListPanel({ heroes, forces, selectedHeroId, onSelectHero }: Props) {
  const [search, setSearch] = useState('');
  const [showDead, setShowDead] = useState(true);
  const [forceFilter, setForceFilter] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return heroes.filter((h) => {
      if (!showDead && h.dead) return false;
      if (forceFilter !== null && h.belongForceId !== forceFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const forceName = forces[h.belongForceId]?.name || '';
        return (
          h.heroName.toLowerCase().includes(q) ||
          (h.heroNickName?.toLowerCase().includes(q) ?? false) ||
          forceName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [heroes, search, showDead, forceFilter, forces]);

  const forceOptions = useMemo(() => {
    return Object.values(forces).sort((a, b) => a.id - b.id);
  }, [forces]);

  return (
    <div className="hero-list-panel">
      <div className="hero-list-header">
        <input
          className="hero-search"
          type="text"
          placeholder="搜索侠客..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="hero-filters">
          <label>
            <input
              type="checkbox"
              checked={showDead}
              onChange={(e) => setShowDead(e.target.checked)}
            />
            显示已故
          </label>
          <select
            value={forceFilter ?? ''}
            onChange={(e) => setForceFilter(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">全部门派</option>
            {forceOptions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="hero-count">{filtered.length} / {heroes.length}</div>
      </div>
      <List
        rowComponent={HeroRow}
        rowCount={filtered.length}
        rowHeight={50}
        rowProps={{ filtered, forces, selectedHeroId, onSelectHero }}
        style={{ height: 600, width: '100%' }}
      />
    </div>
  );
}

import type { HeroDetail } from '../../types/hero';

interface Props {
  hero: HeroDetail;
  heroNames: Record<number, string>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

function HeroLink({ heroId, heroNames }: { heroId: number; heroNames: Record<number, string> }) {
  const name = heroNames[heroId] ?? `侠客#${heroId}`;
  return <span className="hero-link">{name}</span>;
}

function HeroIdList({
  label,
  ids,
  heroNames,
}: {
  label: string;
  ids: number[];
  heroNames: Record<number, string>;
}) {
  if (ids.length === 0) return null;
  return (
    <div className="rel-group">
      <h4>{label} ({ids.length})</h4>
      <div className="rel-list">
        {ids.map((id) => (
          <HeroLink key={id} heroId={id} heroNames={heroNames} />
        ))}
      </div>
    </div>
  );
}

export function RelationshipsTab({ hero, heroNames, onFieldChange: _onFieldChange }: Props) {
  const teacherID = hero.teacherID as number | undefined;
  const loverID = hero.loverID as number | undefined;
  const students = (hero.studentIDs as number[]) || [];
  const friends = (hero.friendIDs as number[]) || [];
  const haters = (hero.haterIDs as number[]) || [];
  const children = (hero.childrenIDs as number[]) || [];

  return (
    <div className="tab-relationships">
      <h3>人际关系</h3>

      {teacherID != null && teacherID >= 0 && (
        <div className="rel-group">
          <h4>师父</h4>
          <HeroLink heroId={teacherID} heroNames={heroNames} />
        </div>
      )}

      {loverID != null && loverID >= 0 && (
        <div className="rel-group">
          <h4>伴侣</h4>
          <HeroLink heroId={loverID} heroNames={heroNames} />
        </div>
      )}

      <HeroIdList label="弟子" ids={students} heroNames={heroNames} />
      <HeroIdList label="子女" ids={children} heroNames={heroNames} />
      <HeroIdList label="好友" ids={friends} heroNames={heroNames} />
      <HeroIdList label="仇人" ids={haters} heroNames={heroNames} />

      {!teacherID && !loverID && students.length === 0 && friends.length === 0 && haters.length === 0 && children.length === 0 && (
        <p style={{ color: '#999' }}>无关系数据</p>
      )}
    </div>
  );
}

import { Card, Empty, Flex } from 'antd';
import type { HeroDetail } from '../../types/hero';
import { FieldLabel } from '../common/FieldLabel';

interface Props {
  hero: HeroDetail;
  heroNames: Record<number, string>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

const REL_COLORS: Record<string, string> = {
  '师父': '#3b82f6',
  '伴侣': '#ec4899',
  '弟子': '#06b6d4',
  '亲属': '#10b981',
  '兄弟': '#3b82f6',
  '好友': '#8b5cf6',
  '仇人': '#ef4444',
  '前任': '#d97706',
};

function RelTag({ heroId, heroNames, color }: { heroId: number; heroNames: Record<number, string>; color: string }) {
  const name = heroNames[heroId] ?? `侠客#${heroId}`;
  return (
    <span
      className="relation-tag"
      style={{ borderColor: `${color}40`, background: `${color}10` }}
    >
      <span style={{ color, fontWeight: 600 }}>{name}</span>
      <span className="relation-tag__id">#{heroId}</span>
    </span>
  );
}

function RelSection({
  label,
  ids,
  heroNames,
  jsonPath,
}: {
  label: string;
  ids: number[];
  heroNames: Record<number, string>;
  jsonPath?: string;
}) {
  if (ids.length === 0) return null;
  const color = REL_COLORS[label] || '#6b7280';
  return (
    <Card
      title={
        <Flex align="center" gap={8}>
          <span style={{ borderLeft: `3px solid ${color}`, paddingLeft: 8 }}>{jsonPath ? <FieldLabel text={label} jsonPath={jsonPath} /> : label}</span>
          <span className="hero-count-pill" style={{ fontSize: 10 }}>{ids.length}</span>
        </Flex>
      }
      size="small"
      style={{ marginBottom: 8 }}
    >
      <Flex wrap gap={4}>
        {ids.map((id) => (
          <RelTag key={id} heroId={id} heroNames={heroNames} color={color} />
        ))}
      </Flex>
    </Card>
  );
}

export function RelationshipsTab({ hero, heroNames, onFieldChange: _onFieldChange }: Props) {
  const teacher = hero.Teacher as number | undefined;
  const lover = hero.Lover as number | undefined;
  const students = (hero.Students as number[]) || [];
  const friends = (hero.Friends as number[]) || [];
  const haters = (hero.Haters as number[]) || [];
  const relatives = (hero.Relatives as number[]) || [];
  const brothers = (hero.Brothers as number[]) || [];
  const preLovers = (hero.PreLovers as number[]) || [];

  const hasAnyRelation =
    (teacher != null && teacher >= 0) ||
    (lover != null && lover >= 0) ||
    students.length > 0 || friends.length > 0 || haters.length > 0 ||
    relatives.length > 0 || brothers.length > 0 || preLovers.length > 0;

  return (
    <div className="tab-scroll">
      <div className="section-title">人际关系</div>

      {teacher != null && teacher >= 0 && (
        <Card
          title={<span style={{ borderLeft: '3px solid #3b82f6', paddingLeft: 8 }}><FieldLabel text="师父" jsonPath="Teacher" /></span>}
          size="small"
          style={{ marginBottom: 8 }}
        >
          <RelTag heroId={teacher} heroNames={heroNames} color={REL_COLORS['师父']} />
        </Card>
      )}

      {lover != null && lover >= 0 && (
        <Card
          title={<span style={{ borderLeft: '3px solid #ec4899', paddingLeft: 8 }}><FieldLabel text="伴侣" jsonPath="Lover" /></span>}
          size="small"
          style={{ marginBottom: 8 }}
        >
          <RelTag heroId={lover} heroNames={heroNames} color={REL_COLORS['伴侣']} />
        </Card>
      )}

      <RelSection label="弟子" ids={students} heroNames={heroNames} jsonPath="Students" />
      <RelSection label="亲属" ids={relatives} heroNames={heroNames} jsonPath="Relatives" />
      <RelSection label="兄弟" ids={brothers} heroNames={heroNames} jsonPath="Brothers" />
      <RelSection label="好友" ids={friends} heroNames={heroNames} jsonPath="Friends" />
      <RelSection label="仇人" ids={haters} heroNames={heroNames} jsonPath="Haters" />
      <RelSection label="前任" ids={preLovers} heroNames={heroNames} jsonPath="PreLovers" />

      {!hasAnyRelation && <Empty description="无关系数据" />}
    </div>
  );
}

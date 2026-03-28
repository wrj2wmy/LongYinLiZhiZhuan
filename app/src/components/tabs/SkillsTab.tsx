import type { HeroDetail } from '../../types/hero';
import type { KungfuEntry } from '../../types/assets';

interface Props {
  hero: HeroDetail;
  skills: Record<number, KungfuEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function SkillsTab({ hero, skills, onFieldChange }: Props) {
  const heroSkills = (hero.kungfuSkills as Array<{ skillID: number; lv: number; equiped: boolean }>) || [];

  return (
    <div className="tab-skills">
      <h3>武学 ({heroSkills.length})</h3>
      <table className="skill-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>类别</th>
            <th>品级</th>
            <th>等级</th>
            <th>装备</th>
          </tr>
        </thead>
        <tbody>
          {heroSkills.map((sk, i) => {
            const info = skills[sk.skillID];
            return (
              <tr key={i}>
                <td>{info?.name ?? `技能#${sk.skillID}`}</td>
                <td>{info?.category ?? '?'}</td>
                <td>{info?.level ?? '?'}</td>
                <td>
                  <input
                    type="number"
                    value={sk.lv}
                    min={0}
                    max={10}
                    onChange={(e) => onFieldChange(`kungfuSkills.${i}.lv`, parseInt(e.target.value))}
                    style={{ width: 50 }}
                  />
                </td>
                <td>{sk.equiped ? '\u2713' : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

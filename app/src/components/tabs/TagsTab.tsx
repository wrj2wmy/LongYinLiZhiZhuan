import type { HeroDetail } from '../../types/hero';
import type { TagEntry } from '../../types/assets';

interface Props {
  hero: HeroDetail;
  tags: Record<number, TagEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function TagsTab({ hero, tags, onFieldChange }: Props) {
  const heroTags = (hero.heroTagData as Array<{ tagID: number; lv: number }>) || [];

  return (
    <div className="tab-tags">
      <h3>天赋 ({heroTags.length})</h3>
      <table className="tags-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>分类</th>
            <th>效果</th>
            <th>等级</th>
          </tr>
        </thead>
        <tbody>
          {heroTags.map((tag, i) => {
            const info = tags[tag.tagID];
            return (
              <tr key={i}>
                <td>{info?.name ?? `天赋#${tag.tagID}`}</td>
                <td>{info?.category ?? '?'}</td>
                <td>{info?.effect ?? '?'}</td>
                <td>
                  <input
                    type="number"
                    value={tag.lv}
                    min={0}
                    max={10}
                    onChange={(e) =>
                      onFieldChange(`heroTagData.${i}.lv`, parseInt(e.target.value))
                    }
                    style={{ width: 50 }}
                  />
                </td>
              </tr>
            );
          })}
          {heroTags.length === 0 && (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', color: '#999' }}>
                无天赋
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

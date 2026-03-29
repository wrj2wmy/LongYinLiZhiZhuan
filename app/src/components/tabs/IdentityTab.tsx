import { Card, Form, Flex, Row, Col } from 'antd';
import type { HeroDetail } from '../../types/hero';
import type { ForceEntry } from '../../types/assets';
import { TextField, NumberField, CheckboxField, SelectField } from '../common/EditableField';
import { FieldLabel } from '../common/FieldLabel';

interface Props {
  hero: HeroDetail;
  forces: Record<number, ForceEntry>;
  onFieldChange: (fieldPath: string, value: unknown) => void;
}

export function IdentityTab({ hero, forces, onFieldChange }: Props) {
  const forceOptions = Object.values(forces)
    .sort((a, b) => a.id - b.id)
    .map((f) => ({ value: f.id, label: f.name }));
  forceOptions.unshift({ value: -1, label: '无门派' });

  return (
    <div className="tab-scroll">
      <div className="section-title">基本信息</div>
      <Card size="small" style={{ marginBottom: 12 }}>
        <Form layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} size="small">
          <Row gutter={16}>
            <Col span={12}>
              <TextField label={<FieldLabel text="姓名" jsonPath="heroName" />} value={hero.heroName as string} onChange={(v) => onFieldChange('heroName', v)} />
            </Col>
            <Col span={12}>
              <TextField label={<FieldLabel text="姓氏" jsonPath="heroFamilyName" />} value={hero.heroFamilyName as string} onChange={(v) => onFieldChange('heroFamilyName', v)} />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <TextField label={<FieldLabel text="称号" jsonPath="heroNickName" />} value={(hero.heroNickName as string) || ''} onChange={(v) => onFieldChange('heroNickName', v || null)} />
            </Col>
            <Col span={12}>
              <NumberField label={<FieldLabel text="年龄" jsonPath="age" />} value={hero.age as number} onChange={(v) => onFieldChange('age', v)} min={1} max={200} />
            </Col>
          </Row>
          <Flex gap={16}>
            <CheckboxField label={<FieldLabel text="女性" jsonPath="isFemale" />} value={hero.isFemale as boolean} onChange={(v) => onFieldChange('isFemale', v)} />
            <NumberField label={<FieldLabel text="代数" jsonPath="generation" />} value={hero.generation as number} onChange={(v) => onFieldChange('generation', v)} min={0} />
          </Flex>
        </Form>
      </Card>

      <div className="section-title">门派</div>
      <Card size="small" style={{ marginBottom: 12 }}>
        <Form layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} size="small">
          <Row gutter={16}>
            <Col span={12}>
              <SelectField label={<FieldLabel text="所属门派" jsonPath="belongForceID" />} value={hero.belongForceID as number} options={forceOptions} onChange={(v) => onFieldChange('belongForceID', v)} />
            </Col>
            <Col span={12}>
              <NumberField label={<FieldLabel text="门派等级" jsonPath="heroForceLv" />} value={hero.heroForceLv as number} onChange={(v) => onFieldChange('heroForceLv', v)} min={0} max={5} />
            </Col>
          </Row>
          <Flex gap={16}>
            <CheckboxField label={<FieldLabel text="掌门" jsonPath="isLeader" />} value={hero.isLeader as boolean} onChange={(v) => onFieldChange('isLeader', v)} />
            <CheckboxField label={<FieldLabel text="已故" jsonPath="dead" />} value={hero.dead as boolean} onChange={(v) => onFieldChange('dead', v)} />
            <CheckboxField label={<FieldLabel text="隐藏" jsonPath="hide" />} value={hero.hide as boolean} onChange={(v) => onFieldChange('hide', v)} />
          </Flex>
        </Form>
      </Card>

      <div className="section-title">声望</div>
      <Card size="small">
        <Form layout="horizontal" labelCol={{ span: 5 }} wrapperCol={{ span: 19 }} size="small">
          <Row gutter={16}>
            <Col span={12}>
              <NumberField label={<FieldLabel text="声望" jsonPath="fame" />} value={hero.fame as number} onChange={(v) => onFieldChange('fame', v)} />
            </Col>
            <Col span={12}>
              <NumberField label={<FieldLabel text="恶名" jsonPath="badFame" />} value={hero.badFame as number} onChange={(v) => onFieldChange('badFame', v)} min={0} />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <NumberField label={<FieldLabel text="忠义" jsonPath="loyal" />} value={hero.loyal as number} onChange={(v) => onFieldChange('loyal', v)} />
            </Col>
            <Col span={8}>
              <NumberField label={<FieldLabel text="邪恶" jsonPath="evil" />} value={hero.evil as number} onChange={(v) => onFieldChange('evil', v)} min={0} max={100} />
            </Col>
            <Col span={8}>
              <NumberField label={<FieldLabel text="混乱" jsonPath="chaos" />} value={hero.chaos as number} onChange={(v) => onFieldChange('chaos', v)} min={0} max={100} />
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

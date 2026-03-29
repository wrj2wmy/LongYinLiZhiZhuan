import { Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

/**
 * A label with a small info icon showing the original JSON attribute path.
 * Use as Form.Item label to help verify field mapping correctness.
 */
export function FieldLabel({ text, jsonPath }: { text: string; jsonPath: string }) {
  return (
    <span>
      {text}
      <Tooltip title={<code style={{ fontSize: 11 }}>{jsonPath}</code>}>
        <InfoCircleOutlined style={{ marginLeft: 4, fontSize: 11, color: '#94a3b8', cursor: 'help' }} />
      </Tooltip>
    </span>
  );
}

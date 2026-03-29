import { useState, useCallback, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Form, Input, InputNumber, Checkbox, Select } from 'antd';

interface NumberFieldProps {
  label: ReactNode;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function NumberField({ label, value, onChange, min, max, step = 1, disabled }: NumberFieldProps) {
  const [local, setLocal] = useState<number | null>(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = useCallback((val: number | null) => {
    setLocal(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (val !== null) onChange(val);
    }, 300);
  }, [onChange]);

  return (
    <Form.Item label={label} style={{ marginBottom: 6 }}>
      <InputNumber
        value={local}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        size="small"
        style={{ width: '100%', maxWidth: 180 }}
      />
    </Form.Item>
  );
}

interface TextFieldProps {
  label: ReactNode;
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function TextField({ label, value, onChange, disabled }: TextFieldProps) {
  const [local, setLocal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocal(raw);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(raw), 300);
  }, [onChange]);

  return (
    <Form.Item label={label} style={{ marginBottom: 6 }}>
      <Input
        value={local}
        onChange={handleChange}
        disabled={disabled}
        size="small"
        style={{ maxWidth: 180 }}
      />
    </Form.Item>
  );
}

interface CheckboxFieldProps {
  label: ReactNode;
  value: boolean;
  onChange: (val: boolean) => void;
}

export function CheckboxField({ label, value, onChange }: CheckboxFieldProps) {
  return (
    <Form.Item style={{ marginBottom: 6 }}>
      <Checkbox
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      >
        {label}
      </Checkbox>
    </Form.Item>
  );
}

interface SelectFieldProps {
  label: ReactNode;
  value: number | string;
  options: { value: number | string; label: string }[];
  onChange: (val: number | string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <Form.Item label={label} style={{ marginBottom: 6 }}>
      <Select
        value={value}
        onChange={(v) => onChange(v)}
        options={options}
        size="small"
        style={{ maxWidth: 180 }}
        showSearch
        optionFilterProp="label"
      />
    </Form.Item>
  );
}

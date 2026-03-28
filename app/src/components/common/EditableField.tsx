import { useState, useCallback, useRef, useEffect } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function NumberField({ label, value, onChange, min, max, step = 1, disabled }: NumberFieldProps) {
  const [local, setLocal] = useState(String(value));
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setLocal(raw);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const num = parseFloat(raw);
      if (!isNaN(num)) onChange(num);
    }, 300);
  }, [onChange]);

  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      <input
        type="number"
        className="field-input"
        value={local}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />
    </div>
  );
}

interface TextFieldProps {
  label: string;
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
    <div className="field-row">
      <label className="field-label">{label}</label>
      <input
        type="text"
        className="field-input"
        value={local}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

export function CheckboxField({ label, value, onChange }: CheckboxFieldProps) {
  return (
    <div className="field-row">
      <label className="field-label">
        <input
          type="checkbox"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        {label}
      </label>
    </div>
  );
}

interface SelectFieldProps {
  label: string;
  value: number | string;
  options: { value: number | string; label: string }[];
  onChange: (val: number | string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div className="field-row">
      <label className="field-label">{label}</label>
      <select
        className="field-input"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(isNaN(Number(v)) ? v : Number(v));
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

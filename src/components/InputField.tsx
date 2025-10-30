import React from "react";
import { InfoIcon } from "./InfoIcon";

type Props = {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  tooltip?: string;
};

export const InputField: React.FC<Props> = ({
  id, label, value, onChange, min, max, step, suffix, tooltip
}) => {
  return (
    <label htmlFor={id} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="font-medium">{label}</span>
        {tooltip ? <InfoIcon title={tooltip} /> : null}
      </div>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="w-full rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value || "0"))}
          min={min}
          max={max}
          step={step ?? 1}
          aria-describedby={tooltip ? `${id}-tip` : undefined}
        />
        {suffix ? <span className="text-sm text-gray-500">{suffix}</span> : null}
      </div>
    </label>
  );
};

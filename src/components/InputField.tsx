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
        {tooltip ? <InfoIcon title={tooltip} tooltipId={`${id}-tip`} /> : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="input w-full sm:w-auto sm:flex-1 min-w-0"
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => onChange(parseFloat(e.target.value || "0"))}
          min={min}
          max={max}
          step={step ?? 1}
          aria-describedby={tooltip ? `${id}-tip` : undefined}
        />
        {suffix ? (
          <span className="text-sm text-gray-500 sm:whitespace-nowrap">{suffix}</span>
        ) : null}
      </div>
    </label>
  );
};

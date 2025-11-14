import React from "react";
import { useTranslation } from "react-i18next";
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
  disabled?: boolean;
  align?: "left" | "center";
};

const formatNumberValue = (val: number) =>
  typeof val === "number" && Number.isFinite(val) ? String(val) : "";

export const InputField: React.FC<Props> = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  tooltip,
  disabled = false,
  align = "left",
}) => {
  const { t } = useTranslation();
  const [rawValue, setRawValue] = React.useState<string>(() => formatNumberValue(value));
  const [isFocused, setIsFocused] = React.useState(false);

  const clampValue = React.useCallback(
    (next: number) => {
      let result = next;
      if (typeof min === "number") {
        result = Math.max(min, result);
      }
      if (typeof max === "number") {
        result = Math.min(max, result);
      }
      return result;
    },
    [min, max],
  );

  const numericValue = rawValue === "" ? undefined : Number(rawValue);
  const isNumeric = typeof numericValue === "number" && Number.isFinite(numericValue);
  const isBelowMin = isNumeric && typeof min === "number" && numericValue < min;
  const isAboveMax = isNumeric && typeof max === "number" && numericValue > max;
  const hasError = !disabled && (isBelowMin || isAboveMax);
  const errorMessage = hasError
    ? typeof min === "number" && typeof max === "number"
      ? t("parameters.errors.range", { min, max })
      : isBelowMin
        ? t("parameters.errors.min", { min })
        : t("parameters.errors.max", { max })
    : undefined;

  React.useEffect(() => {
    if (isFocused) return;
    const formatted = formatNumberValue(value);
    setRawValue((current) => (current === formatted ? current : formatted));
  }, [value, isFocused]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextRaw = event.target.value;
    setRawValue(nextRaw);

    if (nextRaw === "" || nextRaw === "-" || nextRaw === "+") {
      return;
    }

    const parsed = Number(nextRaw);
    if (!Number.isFinite(parsed)) {
      return;
    }

    const clamped = clampValue(parsed);
    onChange(clamped);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (rawValue === "") {
      setRawValue(formatNumberValue(value));
      return;
    }

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      setRawValue(formatNumberValue(value));
      return;
    }

    const clamped = clampValue(parsed);
    if (clamped !== value) {
      onChange(clamped);
    }
    setRawValue(formatNumberValue(clamped));
  };

  const handleFocus = () => setIsFocused(true);

  const describedBy = [] as string[];
  if (tooltip && !disabled) {
    describedBy.push(`${id}-tip`);
  }
  if (hasError) {
    describedBy.push(`${id}-error`);
  }
  const ariaDescribedBy = describedBy.length > 0 ? describedBy.join(" ") : undefined;

  const inputClassName = `input w-full ${
    hasError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-400/40 dark:border-rose-400/60" : ""
  }`;

  const labelClassName = `flex flex-col gap-2 ${align === "center" ? "text-center" : ""}`;
  const labelHeaderClassName = `flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200 ${
    align === "center" ? "justify-center" : ""
  }`;

  return (
    <label htmlFor={id} className={labelClassName}>
      <div className={labelHeaderClassName}>
        <span>{label}</span>
        {tooltip ? <InfoIcon title={tooltip} tooltipId={`${id}-tip`} disabled={disabled} /> : null}
      </div>
      <div className="relative">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className={inputClassName}
          value={rawValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          min={min}
          max={max}
          step={step ?? 1}
          aria-describedby={ariaDescribedBy}
          aria-invalid={hasError || undefined}
          style={suffix ? { paddingRight: "7rem" } : undefined}
          disabled={disabled}
        />
        {suffix ? (
          <span
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs font-medium text-gray-500 dark:text-gray-400"
            aria-hidden="true"
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {hasError && errorMessage ? (
        <span id={`${id}-error`} className="field-help text-rose-600 dark:text-rose-300">
          {errorMessage}
        </span>
      ) : null}
    </label>
  );
};

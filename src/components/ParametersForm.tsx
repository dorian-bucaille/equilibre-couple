import React from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { InputField } from "./InputField";
import { TextField } from "./TextField";
import { InfoIcon } from "./InfoIcon";
import type { Inputs, SplitMode } from "../lib/types";
import { useCollapse } from "../hooks/useCollapse";

interface ParametersFormProps {
  inputs: Inputs;
  onInputsChange: React.Dispatch<React.SetStateAction<Inputs>>;
  partnerAName: string;
  partnerBName: string;
  partnerPlaceholderA: string;
  partnerPlaceholderB: string;
  onModeChange: (mode: SplitMode) => void;
}

export function ParametersForm({
  inputs,
  onInputsChange,
  partnerAName,
  partnerBName,
  partnerPlaceholderA,
  partnerPlaceholderB,
  onModeChange,
}: ParametersFormProps) {
  const { t } = useTranslation();
  const biasHighlight = useHighlightOnChange(inputs.biasPts);
  const advancedRef = useCollapse(inputs.advanced);
  const biasDisabled = inputs.mode === "equal_leftover";
  const advancedCollapsed = !inputs.advanced;
  const suffixEuroMonth = t("parameters.suffix.euroMonth");
  const suffixPercent = t("parameters.suffix.percent");

  const labelWithCode = (key: string, code: string, name?: string) => {
    const base = t(key, name ? { name } : undefined);
    return inputs.advanced ? `${base}${t("parameters.codeSuffix", { code })}` : base;
  };

  const salaryLabelA = labelWithCode("parameters.salaryLabel", "a1", partnerAName);
  const salaryLabelB = labelWithCode("parameters.salaryLabel", "b", partnerBName);
  const ticketsLabelA = labelWithCode("parameters.ticketsLabel", "a2", partnerAName);
  const ticketsLabelB = labelWithCode("parameters.ticketsLabel", "b2", partnerBName);
  const sharedBudgetLabel = labelWithCode("parameters.sharedBudgetLabel", "m");
  const salaryTooltipA = t("parameters.salaryTooltip", { name: partnerAName });
  const salaryTooltipB = t("parameters.salaryTooltip", { name: partnerBName });
  const ticketsTooltipA = t("parameters.ticketsTooltip", { name: partnerAName });
  const ticketsTooltipB = t("parameters.ticketsTooltip", { name: partnerBName });
  const sharedBudgetTooltip = t("parameters.sharedBudgetTooltip");

  const showAdvanced = inputs.advanced;

  return (
    <section className="card space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("parameters.title")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("parameters.description")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="partnerAName"
          label={t("parameters.partnerNameLabel", { label: "A" })}
          value={inputs.partnerAName}
          onChange={(value) => onInputsChange((prev) => ({ ...prev, partnerAName: value }))}
          placeholder={partnerPlaceholderA}
          tooltip={t("parameters.partnerTooltip", { label: "A" })}
        />
        <TextField
          id="partnerBName"
          label={t("parameters.partnerNameLabel", { label: "B" })}
          value={inputs.partnerBName}
          onChange={(value) => onInputsChange((prev) => ({ ...prev, partnerBName: value }))}
          placeholder={partnerPlaceholderB}
          tooltip={t("parameters.partnerTooltip", { label: "B" })}
        />
        <fieldset className="space-y-3 sm:col-span-2" aria-describedby="mode-tip">
          <legend className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
            <span>{t("parameters.modeLabel")}</span>
            <InfoIcon title={t("parameters.modeTooltip")} tooltipId="mode-tip" />
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="mode-option">
              <input
                type="radio"
                name="mode"
                value="proportional"
                checked={inputs.mode === "proportional"}
                onChange={() => onModeChange("proportional")}
                className="mode-option__input"
              />
              <div className="mode-option__content">
                <span className="mode-option__title">{t("parameters.modes.proportional.title")}</span>
                <span className="mode-option__description">
                  {t("parameters.modes.proportional.description")}
                </span>
              </div>
            </label>
            <label className="mode-option">
              <input
                type="radio"
                name="mode"
                value="equal_leftover"
                checked={inputs.mode === "equal_leftover"}
                onChange={() => onModeChange("equal_leftover")}
                className="mode-option__input"
              />
              <div className="mode-option__content">
                <span className="mode-option__title">{t("parameters.modes.equal_leftover.title")}</span>
                <span className="mode-option__description">
                  {t("parameters.modes.equal_leftover.description")}
                </span>
              </div>
            </label>
          </div>
        </fieldset>
        <InputField
          id="a1"
          label={salaryLabelA}
          value={inputs.a1}
          onChange={(v) => onInputsChange((prev) => ({ ...prev, a1: v }))}
          min={0}
          suffix={suffixEuroMonth}
          tooltip={salaryTooltipA}
        />
        <InputField
          id="b"
          label={salaryLabelB}
          value={inputs.b}
          onChange={(v) => onInputsChange((prev) => ({ ...prev, b: v }))}
          min={0}
          suffix={suffixEuroMonth}
          tooltip={salaryTooltipB}
        />
        {showAdvanced && (
          <>
            <InputField
              id="a2"
              label={ticketsLabelA}
              value={inputs.a2}
              onChange={(v) => onInputsChange((prev) => ({ ...prev, a2: v }))}
              min={0}
              suffix={suffixEuroMonth}
              tooltip={ticketsTooltipA}
            />
            <InputField
              id="b2"
              label={ticketsLabelB}
              value={inputs.b2}
              onChange={(v) => onInputsChange((prev) => ({ ...prev, b2: v }))}
              min={0}
              suffix={suffixEuroMonth}
              tooltip={ticketsTooltipB}
            />
          </>
        )}
        <div className="sm:col-span-2">
          <InputField
            id="m"
            label={sharedBudgetLabel}
            value={inputs.m}
            onChange={(v) => onInputsChange((prev) => ({ ...prev, m: v }))}
            min={0}
            suffix={suffixEuroMonth}
            tooltip={sharedBudgetTooltip}
            align="center"
          />
        </div>
        <div className="sm:col-span-2">
          <div className="rounded-3xl border border-dashed border-rose-200/80 bg-white/70 p-4 shadow-sm transition-colors duration-300 ease-out dark:border-rose-500/40 dark:bg-gray-900/40">
            <button
              type="button"
              className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ease-out ${
                inputs.advanced
                  ? "bg-rose-500/10 text-rose-700 dark:text-rose-200"
                  : "bg-white/60 text-gray-700 hover:bg-white dark:bg-gray-900/40 dark:text-gray-200 dark:hover:bg-gray-900/60"
              }`}
              onClick={() => onInputsChange((prev) => ({ ...prev, advanced: !prev.advanced }))}
              aria-expanded={inputs.advanced}
              aria-controls="advanced-panel"
            >
              <div className="flex flex-col gap-1 text-left">
                <span className="text-sm font-semibold">{t("parameters.advancedToggle.title")}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t("parameters.advancedToggle.description")}
                </span>
              </div>
              <span
                className={`text-lg transition-transform duration-300 ease-out ${
                  inputs.advanced ? "rotate-180" : "rotate-0"
                }`}
                aria-hidden="true"
              >
                ▾
              </span>
            </button>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{t("parameters.advancedToggle.helper")}</p>
            <div
              id="advanced-panel"
              ref={advancedRef}
              className="overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out"
              style={{ maxHeight: "0px", opacity: 0, transform: "translateY(-0.5rem)" }}
              aria-hidden={advancedCollapsed}
            >
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <InputField
                  id="trPct"
                  label={t("parameters.trPctLabel")}
                  value={inputs.trPct}
                  onChange={(v) => onInputsChange((prev) => ({ ...prev, trPct: v }))}
                  suffix={suffixPercent}
                  min={0}
                  max={100}
                  step={1}
                  tooltip={t("parameters.trPctTooltip")}
                  disabled={advancedCollapsed}
                />
                <InputField
                  id="E"
                  label={t("parameters.eligibleLabel")}
                  value={inputs.E}
                  onChange={(v) => onInputsChange((prev) => ({ ...prev, E: v }))}
                  min={0}
                  suffix={suffixEuroMonth}
                  tooltip={t("parameters.eligibleTooltip")}
                  disabled={advancedCollapsed}
                />
                <label className="flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white/70 p-4 shadow-sm transition-colors duration-300 ease-out dark:border-gray-700/60 dark:bg-gray-900/40 sm:col-span-2">
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {t("parameters.bias.label", { partnerA: partnerAName, partnerB: partnerBName })}
                    </span>
                    <div className="flex flex-col items-start gap-1 text-xs font-medium text-gray-500 sm:items-end sm:text-right dark:text-gray-400">
                      <span
                        className={`transition-all duration-200 ease-out ${
                          biasHighlight
                            ? "-translate-y-0.5 text-rose-600 opacity-100 dark:text-rose-300"
                            : "translate-y-0 text-gray-500 opacity-80 dark:text-gray-400"
                        }`}
                      >
                        {formatBiasSummary(inputs.biasPts, partnerAName, partnerBName, t)}
                      </span>
                      <span
                        className={`transition-all duration-200 ease-out ${
                          biasHighlight
                            ? "text-rose-600 opacity-100 dark:text-rose-300"
                            : "text-gray-500 opacity-80 dark:text-gray-400"
                        }`}
                      >
                        {formatBiasForPartner(inputs.biasPts, partnerAName, t)}
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={-10}
                    max={10}
                    step={0.5}
                    value={inputs.biasPts}
                    onChange={(e) => onInputsChange((prev) => ({ ...prev, biasPts: parseFloat(e.target.value) }))}
                    aria-label={t("parameters.bias.sliderLabel", { partnerA: partnerAName, partnerB: partnerBName })}
                    className={`w-full accent-rose-500 transition-transform duration-200 ease-out ${
                      biasHighlight ? "scale-[1.01]" : "scale-100"
                    }`}
                    disabled={advancedCollapsed || biasDisabled}
                  />
                  <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400">
                    <span>{t("parameters.bias.favorA", { name: partnerAName })}</span>
                    <span>{t("parameters.bias.neutral")}</span>
                    <span>{t("parameters.bias.favorB", { name: partnerBName })}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t("parameters.bias.helper", { partnerA: partnerAName, partnerB: partnerBName })}
                  </span>
                  {biasDisabled && (
                    <span className="field-help text-amber-600 dark:text-amber-400">
                      {t("parameters.bias.disabled")}
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function useHighlightOnChange(value: number, duration = 250) {
  const [highlight, setHighlight] = React.useState(false);
  const firstRender = React.useRef(true);

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setHighlight(true);
    const timeout = window.setTimeout(() => setHighlight(false), duration);
    return () => window.clearTimeout(timeout);
  }, [value, duration]);

  return highlight;
}

function formatBiasSummary(
  value: number,
  partnerAName: string,
  partnerBName: string,
  t: TFunction,
) {
  const normalized = Math.abs(value) < 1e-6 ? 0 : value;
  if (normalized === 0) return t("parameters.bias.summaryNeutral");
  const points = `${normalized > 0 ? "+" : ""}${normalized.toFixed(1)}`;
  if (normalized > 0) {
    return t("parameters.bias.summaryFavor", { name: partnerBName, points });
  }
  return t("parameters.bias.summaryFavor", { name: partnerAName, points });
}

function formatBiasForPartner(value: number, partnerName: string, t: TFunction) {
  const normalized = Math.abs(value) < 1e-6 ? 0 : value;
  const sign = normalized > 0 ? "+" : normalized < 0 ? "" : "+";
  return t("parameters.bias.summaryDetail", {
    name: partnerName,
    points: `${sign}${normalized.toFixed(1)}`,
  });
}

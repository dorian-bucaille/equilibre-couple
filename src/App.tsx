import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { calculate } from "./lib/calc";
import type { HistoryItem } from "./lib/storage";
import type { Inputs, SplitMode } from "./lib/types";
import { useInputsState } from "./hooks/useInputsState";
import { useSharing } from "./hooks/useSharing";
import { HeaderActions } from "./components/HeaderActions";
import { ParametersForm } from "./components/ParametersForm";
import { HistorySection } from "./components/HistorySection";
import { DetailsSection } from "./components/DetailsSection";
import "./styles.css";

export default function App() {
  const { t, i18n } = useTranslation();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { inputs, setInputs, isDirty, resetInputs, loadInputs } = useInputsState();
  const { ariaMessage, setAriaMessage, copyTooltip, copyLink } = useSharing(inputs, t);
  const locale = i18n.language.startsWith("fr") ? "fr-FR" : "en-GB";

  const partnerPlaceholderA = t("parameters.partnerPlaceholder", { label: "A" });
  const partnerPlaceholderB = t("parameters.partnerPlaceholder", { label: "B" });
  const partnerAName = inputs.partnerAName.trim() || partnerPlaceholderA;
  const partnerBName = inputs.partnerBName.trim() || partnerPlaceholderB;

  const result = useMemo(() => calculate(inputs), [inputs]);

  const printPDF = () => window.print();

  const handleModeChange = (mode: SplitMode) => {
    setInputs((prev) => ({ ...prev, mode }));
    setAriaMessage(
      mode === "equal_leftover"
        ? t("accessibility.modeEqualLeftover")
        : t("accessibility.modeProportional"),
    );
  };

  const handleHistoryCleared = () => {
    setAriaMessage(t("accessibility.historyCleared"));
  };

  const handleLoadHistory = (item: HistoryItem) => {
    if (isDirty) {
      const confirmed = window.confirm(t("actions.confirmLoad"));
      if (!confirmed) return;
    }

    const snapshot = JSON.parse(JSON.stringify(item.inputs)) as Inputs;
    loadInputs(snapshot);

    const formattedDate = new Date(item.dateISO).toLocaleDateString(locale);
    setAriaMessage(t("accessibility.historyLoaded", { date: formattedDate }));

    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      titleRef.current?.focus();
    }, 300);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-rose-50 transition-colors duration-300 ease-out dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-32 top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-rose-300/30 blur-3xl dark:bg-rose-500/20" />
      <div className="pointer-events-none absolute bottom-[-14rem] right-[-24rem] h-[32rem] w-[32rem] rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/20" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <HeaderActions
          titleRef={titleRef}
          copyTooltip={copyTooltip}
          onCopyLink={copyLink}
          onPrint={printPDF}
          onReset={resetInputs}
          showGlossary={inputs.advanced}
        />

        <div aria-live="polite" className="sr-only">
          {ariaMessage}
        </div>

        <div className="mt-10 flex flex-col gap-10">
          <ParametersForm
            inputs={inputs}
            onInputsChange={setInputs}
            partnerAName={partnerAName}
            partnerBName={partnerBName}
            partnerPlaceholderA={partnerPlaceholderA}
            partnerPlaceholderB={partnerPlaceholderB}
            onModeChange={handleModeChange}
          />

          <HistorySection
            inputs={inputs}
            result={result}
            partnerAName={partnerAName}
            partnerBName={partnerBName}
            mode={inputs.mode}
            onLoadHistory={handleLoadHistory}
            onHistoryCleared={handleHistoryCleared}
          >
            <DetailsSection result={result} />
            {result.warnings.length > 0 && (
              <div className="rounded-3xl border border-amber-500/30 bg-amber-50/80 p-5 text-sm text-amber-800 shadow-sm dark:border-amber-400/40 dark:bg-amber-900/30 dark:text-amber-200">
                <ul className="ml-4 list-disc space-y-1">
                  {result.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </HistorySection>
        </div>
      </div>
    </div>
  );
}

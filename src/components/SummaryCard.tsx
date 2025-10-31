import React from "react";
import { euro, pct } from "../lib/format";
import type { Result, SplitMode } from "../lib/types";

type Segment = {
  label: string;
  amount: number;
  color: string;
};

type DisplayMode = "amount" | "percent";

const Chart: React.FC<{
  title: string;
  centerLabel: string;
  displayMode: DisplayMode;
  segments: Segment[];
  actions?: React.ReactNode;
}> = ({ title, centerLabel, displayMode, segments, actions }) => {
  const total = segments.reduce((acc, cur) => acc + cur.amount, 0);
  const hasValues = total > 0;
  let cumulative = 0;
  const gradient = hasValues
    ? segments
        .map((segment) => {
          const start = cumulative;
          const delta = total === 0 ? 0 : (segment.amount / total) * 100;
          cumulative += delta;
          return `${segment.color} ${start}% ${cumulative}%`;
        })
        .join(", ")
    : "var(--chart-empty) 0% 100%";

  const formatValue = (segment: Segment) => {
    if (displayMode === "percent") {
      const ratio = hasValues ? segment.amount / total : 0;
      return pct(ratio);
    }
    return euro(segment.amount);
  };

  const centerValue = displayMode === "percent"
    ? pct(hasValues ? 1 : 0)
    : euro(total);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-200/80 bg-white/70 p-5 text-sm shadow-sm transition-colors duration-300 ease-out dark:border-gray-700/60 dark:bg-gray-900/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
          {title}
        </h3>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
        <div
          className="relative h-36 w-36"
          role="img"
          aria-label={`${title}: ${segments
            .map((segment) => `${segment.label} ${formatValue(segment)}`)
            .join(", ")}`}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background: `conic-gradient(${gradient})`,
            }}
          />
          <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white/90 text-center leading-tight backdrop-blur-sm dark:bg-slate-950/80">
            <span className="text-[11px] font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {centerLabel}
            </span>
            <span className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
              {centerValue}
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col gap-2 text-sm sm:w-48">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2 shadow-inner dark:bg-gray-900/60">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: segment.color }}
                />
                {segment.label}
              </span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {formatValue(segment)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SummaryStat: React.FC<{
  label: string;
  value: string;
  emphasis?: "normal" | "large";
  tone?: "default" | "alert";
}> = ({ label, value, emphasis = "normal", tone = "default" }) => {
  const labelClasses =
    tone === "alert"
      ? "text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-200"
      : "text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
  const valueClasses =
    emphasis === "large"
      ? tone === "alert"
        ? "text-2xl font-semibold text-amber-600 dark:text-amber-200"
        : "text-2xl font-semibold text-gray-900 dark:text-gray-100"
      : tone === "alert"
        ? "text-lg font-semibold text-amber-600 dark:text-amber-200"
        : "text-lg font-semibold text-gray-900 dark:text-gray-100";
  const containerClasses =
    tone === "alert"
      ? "border-amber-200/80 bg-amber-50/80 shadow-sm dark:border-amber-400/50 dark:bg-amber-500/10"
      : "border-gray-200/80 bg-white/70 shadow-sm dark:border-gray-700/60 dark:bg-gray-900/40";

  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border p-4 text-center transition-colors duration-200 ease-out ${containerClasses}`}>
      <span className={labelClasses}>{label}</span>
      <span className={`mt-2 ${valueClasses}`}>{value}</span>
    </div>
  );
};

export const SummaryCard: React.FC<{
  r: Result;
  partnerAName: string;
  partnerBName: string;
  mode: SplitMode;
  onSaveHistory?: () => void;
  onFocusNote?: () => void;
}> = ({ r, partnerAName, partnerBName, mode, onSaveHistory, onFocusNote }) => {
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("percent");
  const isEqualLeftover = mode === "equal_leftover";
  const modeAnnouncement = isEqualLeftover ? "Mode reste à vivre égal" : "Mode proportionnel";

  const contributionSegments: Segment[] = [
    {
      label: `Dépôt ${partnerAName}`,
      amount: Math.max(r.depositD, 0),
      color: "var(--chart-a-deposit)",
    },
    {
      label: `TR ${partnerAName}`,
      amount: Math.max(r.usedTRA, 0),
      color: "var(--chart-a-tr)",
    },
    {
      label: `Dépôt ${partnerBName}`,
      amount: Math.max(r.depositM, 0),
      color: "var(--chart-b-deposit)",
    },
    {
      label: `TR ${partnerBName}`,
      amount: Math.max(r.usedTRB, 0),
      color: "var(--chart-b-tr)",
    },
  ];

  const warningsCount = r.warnings.length;

  return (
    <div className="card space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Résumé</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aperçu instantané de la répartition et du niveau de contribution de chaque partenaire.
        </p>
      </div>
      <div aria-live="polite" className="sr-only">
        {modeAnnouncement}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label={`Part ${partnerAName}`} value={pct(r.shareD_biased)} emphasis="large" />
        <SummaryStat label={`Part ${partnerBName}`} value={pct(r.shareM_biased)} emphasis="large" />
        <SummaryStat label={`Dépôt ${partnerAName}`} value={euro(r.depositD)} />
        <SummaryStat label={`Dépôt ${partnerBName}`} value={euro(r.depositM)} />
      </div>
      {isEqualLeftover && (
        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryStat label={`Reste ${partnerAName}`} value={euro(r.leftoverA)} />
          <SummaryStat label={`Reste ${partnerBName}`} value={euro(r.leftoverB)} />
        </div>
      )}

      <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryStat label="Cash total à déposer" value={euro(r.cashNeeded)} />
        <SummaryStat label="TR utilisés (V)" value={euro(r.V)} />
        <SummaryStat label="Pot total (M)" value={euro(r.potTotal)} />
        <SummaryStat
          label="Avertissements"
          value={String(warningsCount)}
          tone={warningsCount > 0 ? "alert" : "default"}
        />
      </div>

      <Chart
        title="Répartition des contributions"
        centerLabel={displayMode === "percent" ? "Total (%)" : "Total (€)"}
        displayMode={displayMode}
        segments={contributionSegments}
        actions={
          <div className="inline-flex rounded-full border border-rose-100 bg-white/70 p-0.5 text-xs font-semibold shadow-inner dark:border-rose-500/40 dark:bg-gray-900/60">
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 ${
                displayMode === "amount"
                  ? "bg-rose-500 text-white shadow-sm dark:bg-rose-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              }`}
              onClick={() => setDisplayMode("amount")}
              aria-pressed={displayMode === "amount"}
            >
              €
            </button>
            <button
              type="button"
              className={`rounded-full px-3 py-1.5 transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 ${
                displayMode === "percent"
                  ? "bg-rose-500 text-white shadow-sm dark:bg-rose-400"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
              }`}
              onClick={() => setDisplayMode("percent")}
              aria-pressed={displayMode === "percent"}
            >
              %
            </button>
          </div>
        }
      />
      {(onSaveHistory || onFocusNote) && (
        <div className="no-print flex flex-col gap-3 rounded-2xl border border-gray-200/80 bg-white/70 p-4 shadow-sm dark:border-gray-700/60 dark:bg-gray-900/40 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Sauvegarder cette configuration</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Les enregistrements sont stockés localement sur cet appareil.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {onFocusNote && (
              <button type="button" className="btn btn-ghost" onClick={onFocusNote}>
                Ajouter une note
              </button>
            )}
            {onSaveHistory && (
              <button type="button" className="btn btn-primary" onClick={onSaveHistory}>
                Enregistrer dans l'historique
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

import React from "react";
import { euro, pct } from "../lib/format";
import type { Result } from "../lib/types";

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
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
          {title}
        </h3>
        {actions}
      </div>
      <div
        className="relative h-32 w-32"
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
        <div className="absolute inset-6 flex flex-col items-center justify-center rounded-full bg-white text-center text-sm font-medium leading-tight dark:bg-slate-950">
          <span className="text-xs text-gray-500 dark:text-gray-400">{centerLabel}</span>
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {centerValue}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-sm">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {segment.label}
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {formatValue(segment)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SummaryCard: React.FC<{
  r: Result;
  partnerAName: string;
  partnerBName: string;
  onSaveHistory?: () => void;
  onFocusNote?: () => void;
}> = ({ r, partnerAName, partnerBName, onSaveHistory, onFocusNote }) => {
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>("percent");

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

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">Résumé</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <div className="text-sm text-gray-500">Part {partnerAName}</div>
          <div className="text-xl">{pct(r.shareD_biased)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Part {partnerBName}</div>
          <div className="text-xl">{pct(r.shareM_biased)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Dépôt {partnerAName}</div>
          <div className="text-xl">{euro(r.depositD)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Dépôt {partnerBName}</div>
          <div className="text-xl">{euro(r.depositM)}</div>
        </div>
      </div>

      <hr className="my-3 border-gray-200 dark:border-gray-800" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <div className="text-sm text-gray-500">Cash total à déposer</div>
          <div className="text-lg">{euro(r.cashNeeded)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">TR utilisés (V)</div>
          <div className="text-lg">{euro(r.V)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Pot total (M)</div>
          <div className="text-lg">{euro(r.potTotal)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Avertissements</div>
          <div className="text-lg">{r.warnings.length}</div>
        </div>
      </div>

      <hr className="my-4 border-gray-200 dark:border-gray-800" />

      <div className="flex justify-center">
        <Chart
          title="Répartition des contributions"
          centerLabel={displayMode === "percent" ? "Total (%)" : "Total (€)"}
          displayMode={displayMode}
          segments={contributionSegments}
          actions={
            <div className="flex rounded-md border border-gray-200 bg-white p-0.5 text-xs font-medium shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                className={`rounded-sm px-2 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-300 ${
                  displayMode === "amount"
                    ? "bg-rose-500 text-white dark:bg-rose-400"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                }`}
                onClick={() => setDisplayMode("amount")}
                aria-pressed={displayMode === "amount"}
              >
                €
              </button>
              <button
                type="button"
                className={`rounded-sm px-2 py-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:focus-visible:ring-rose-300 ${
                  displayMode === "percent"
                    ? "bg-rose-500 text-white dark:bg-rose-400"
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
      </div>
      {(onSaveHistory || onFocusNote) && (
        <div className="no-print mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sauvegarder cette configuration dans l'historique local.
          </p>
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

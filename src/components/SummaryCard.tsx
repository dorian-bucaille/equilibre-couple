import React from "react";
import { euro, pct } from "../lib/format";
import type { Result } from "../lib/types";

type Segment = {
  label: string;
  value: number;
  color: string;
  formattedValue: string;
};

const Chart: React.FC<{
  title: string;
  centerLabel: string;
  centerValue: string;
  segments: Segment[];
}> = ({ title, centerLabel, centerValue, segments }) => {
  const total = segments.reduce((acc, cur) => acc + cur.value, 0);
  const hasValues = total > 0;
  let cumulative = 0;
  const gradient = hasValues
    ? segments
        .map((segment) => {
          const start = cumulative;
          const delta = (segment.value / total) * 100;
          cumulative += delta;
          return `${segment.color} ${start}% ${cumulative}%`;
        })
        .join(", ")
    : "var(--chart-empty) 0% 100%";

  return (
    <div className="flex flex-col items-center gap-3">
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
        {title}
      </h3>
      <div
        className="relative h-32 w-32"
        role="img"
        aria-label={`${title}: ${segments
          .map((segment) => `${segment.label} ${segment.formattedValue}`)
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
              {segment.formattedValue}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SummaryCard: React.FC<{ r: Result }> = ({ r }) => {
  const shareSegments: Segment[] = [
    {
      label: "Part partenaire A",
      value: Math.max(r.shareD_biased, 0),
      color: "var(--chart-a)",
      formattedValue: pct(r.shareD_biased),
    },
    {
      label: "Part partenaire B",
      value: Math.max(r.shareM_biased, 0),
      color: "var(--chart-b)",
      formattedValue: pct(r.shareM_biased),
    },
  ];

  const rawTotalDeposits = r.depositD + r.depositM;
  const totalDeposits = Math.max(rawTotalDeposits, 0);
  const depositSegments: Segment[] = [
    {
      label: "Dépôt partenaire A",
      value: Math.max(r.depositD, 0),
      color: "var(--chart-a)",
      formattedValue: euro(r.depositD),
    },
    {
      label: "Dépôt partenaire B",
      value: Math.max(r.depositM, 0),
      color: "var(--chart-b)",
      formattedValue: euro(r.depositM),
    },
  ];

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">Résumé</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <div className="text-sm text-gray-500">Part partenaire A</div>
          <div className="text-xl">{pct(r.shareD_biased)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Part partenaire B</div>
          <div className="text-xl">{pct(r.shareM_biased)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Dépôt partenaire A</div>
          <div className="text-xl">{euro(r.depositD)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Dépôt partenaire B</div>
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

      <div className="grid gap-6 sm:grid-cols-2">
        <Chart
          title="Répartition des parts"
          centerLabel="Part A"
          centerValue={pct(r.shareD_biased)}
          segments={shareSegments}
        />
        <Chart
          title="Répartition des contributions"
          centerLabel="Dépôts"
          centerValue={euro(rawTotalDeposits)}
          segments={depositSegments}
        />
      </div>
    </div>
  );
};

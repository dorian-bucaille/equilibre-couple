import React, { useCallback, useImperativeHandle, useMemo, useRef, useState } from "react";
import { euro, pct } from "../lib/format";
import {
  loadHistory,
  saveHistory,
  type HistoryItem,
  type HistoryResultSnapshot,
} from "../lib/storage";
import type { Inputs, Result } from "../lib/types";

type PeriodFilter = "all" | "3m" | "6m" | "12m";

const toMonthLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { month: "short", year: "numeric" });

const toFullLabel = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", {
    dateStyle: "full",
    timeStyle: "short",
  });

type NumericKey = Extract<keyof Inputs, "a1" | "a2" | "b" | "b2" | "m" | "trPct" | "E" | "biasPts">;
type BooleanKey = Extract<keyof Inputs, "advanced">;
type TextKey = Extract<keyof Inputs, "partnerAName" | "partnerBName">;

type InputSummary =
  | { key: NumericKey; label: string; formatter?: (value: number) => string }
  | { key: BooleanKey; label: string; type: "bool" }
  | { key: TextKey; label: string; type: "text" };

const INPUT_SUMMARY: InputSummary[] = [
  { key: "a1", label: "Salaire A", formatter: euro },
  { key: "a2", label: "TR bruts A", formatter: euro },
  { key: "b", label: "Salaire B", formatter: euro },
  { key: "b2", label: "TR bruts B", formatter: euro },
  { key: "m", label: "Budget hors TR", formatter: euro },
  { key: "trPct", label: "% TR dépensés", formatter: (value) => pct(value / 100) },
  { key: "E", label: "Dépenses éligibles", formatter: euro },
  { key: "biasPts", label: "Biais (pts)" },
  { key: "advanced", label: "Mode avancé", type: "bool" },
  { key: "partnerAName", label: "Nom A", type: "text" },
  { key: "partnerBName", label: "Nom B", type: "text" },
];

type HistoryProps = {
  inputs: Inputs;
  result: Result;
  onLoad: (item: HistoryItem) => void;
  onRequestClearAll?: () => void;
};

export type HistoryHandle = {
  addCurrentState: () => void;
  focusNote: () => void;
};

const buildResultSnapshot = (
  result: Result,
  inputs: Inputs,
): HistoryResultSnapshot => ({
  depositA: result.depositD,
  depositB: result.depositM,
  cashNeeded: result.cashNeeded,
  usedTR: result.V,
  partnerAName: inputs.partnerAName?.trim() || "Partenaire A",
  partnerBName: inputs.partnerBName?.trim() || "Partenaire B",
});

const HistoryComponent: React.ForwardRefRenderFunction<HistoryHandle, HistoryProps> = (
  { inputs, result, onLoad, onRequestClearAll },
  ref,
) => {
  const [items, setItems] = useState<HistoryItem[]>(loadHistory);
  const [note, setNote] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const noteInputRef = useRef<HTMLInputElement>(null);

  const add = useCallback(() => {
    const trimmedNote = note.trim().slice(0, 120);
    const id = crypto.randomUUID();
    const dateISO = new Date().toISOString();
    const snapshot = buildResultSnapshot(result, inputs);
    const savedInputs = JSON.parse(JSON.stringify(inputs)) as Inputs;
    setItems((prev) => {
      const next = [{ id, dateISO, note: trimmedNote, inputs: savedInputs, result: snapshot }, ...prev].slice(0, 60);
      saveHistory(next);
      return next;
    });
    setNote("");
  }, [inputs, note, result]);

  const del = (id: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      saveHistory(next);
      return next;
    });
    setExpanded((prev) => {
      const copy = new Set(prev);
      copy.delete(id);
      return copy;
    });
  };

  const clearAll = () => {
    const first = window.confirm("Supprimer tout l'historique local ?");
    if (!first) return;
    const second = window.confirm("Cette action est définitive. Confirmer la suppression ?");
    if (!second) return;
    setItems(() => {
      saveHistory([]);
      return [];
    });
    setExpanded(new Set());
    onRequestClearAll?.();
  };

  const toggleDetails = (id: string) => {
    setExpanded((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  useImperativeHandle(
    ref,
    () => ({
      addCurrentState: add,
      focusNote: () => {
        if (noteInputRef.current) {
          noteInputRef.current.focus();
          noteInputRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      },
    }),
    [add],
  );

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const now = new Date();

    const matchesPeriod = (dateISO: string) => {
      if (period === "all") return true;
      const diffMonths = (now.getTime() - new Date(dateISO).getTime()) / (1000 * 60 * 60 * 24 * 30.4375);
      const limit = period === "3m" ? 3 : period === "6m" ? 6 : 12;
      return diffMonths <= limit;
    };

    return items.filter((item) => {
      if (!matchesPeriod(item.dateISO)) return false;
      if (!term) return true;
      const label = toMonthLabel(item.dateISO).toLowerCase();
      const noteValue = (item.note || "(sans note)").toLowerCase();
      return noteValue.includes(term) || label.includes(term);
    });
  }, [items, period, searchTerm]);

  return (
    <section className="card history-card">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Historique</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Jusqu'à 60 enregistrements sont conservés sur cet appareil.
          </p>
        </div>
        <button type="button" onClick={clearAll} className="no-print btn btn-ghost self-start" disabled={items.length === 0}>
          Tout effacer
        </button>
      </div>

      <div className="no-print mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex flex-1 flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Note</span>
            <input
              placeholder="Oct. 2025 – nouveau loyer"
              className="input"
              value={note}
              maxLength={120}
              onChange={(e) => setNote(e.target.value)}
              ref={noteInputRef}
            />
          </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Recherche</span>
            <input
              type="search"
              placeholder="Filtrer par note ou mois"
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Période</span>
            <select
              className="input"
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodFilter)}
            >
              <option value="all">Tout</option>
              <option value="3m">3 derniers mois</option>
              <option value="6m">6 derniers mois</option>
              <option value="12m">12 derniers mois</option>
            </select>
          </label>
          <button type="button" onClick={add} className="btn btn-primary self-start">
            Enregistrer dans l'historique
          </button>
        </div>
      </div>

      {items.length >= 60 && (
        <div className="no-print mb-3 rounded-md border border-amber-500/40 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-400/40 dark:bg-amber-900/30 dark:text-amber-200">
          Capacité maximale atteinte. Le prochain enregistrement remplacera le plus ancien.
        </div>
      )}

      {filteredItems.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun enregistrement ne correspond à votre recherche.</p>
      ) : (
        <div className="relative history-timeline" role="list" aria-label="Historique des calculs enregistrés">
          {filteredItems.map((item, index) => {
            const isLast = index === filteredItems.length - 1;
            const isExpanded = expanded.has(item.id);
            const monthLabel = toMonthLabel(item.dateISO);
            const fullLabel = toFullLabel(item.dateISO);
            const noteValue = item.note || "(sans note)";

            return (
              <article
                key={item.id}
                role="listitem"
                className="history-entry relative pl-10 pb-8 last:pb-0"
              >
                <span
                  aria-hidden="true"
                  className="timeline-dot absolute left-1 top-1.5 h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400"
                />
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="timeline-line absolute left-2 top-4 h-full w-px bg-gray-300 dark:bg-gray-700"
                  />
                )}
                <div className="history-entry-card flex flex-col gap-3 rounded-lg border border-gray-200 bg-white/70 p-4 shadow-sm transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900/40">
                  <header className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <time
                        className="text-sm font-medium text-gray-800 dark:text-gray-100"
                        dateTime={item.dateISO}
                        title={fullLabel}
                      >
                        {monthLabel}
                      </time>
                      <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{noteValue}</p>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <div>
                        Dépôts — {item.result.partnerAName}: {euro(item.result.depositA)} / {item.result.partnerBName}: {euro(item.result.depositB)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Cash: {euro(item.result.cashNeeded)} · TR utilisés: {euro(item.result.usedTR)}
                      </div>
                    </div>
                  </header>
                  <div className="no-print flex flex-wrap gap-2" aria-label={`Actions pour l'enregistrement du ${fullLabel}`}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => onLoad(item)}
                      aria-label={`Charger l'enregistrement du ${fullLabel}`}
                    >
                      Charger
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => toggleDetails(item.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`history-details-${item.id}`}
                      aria-label={`Afficher les détails de l'enregistrement du ${fullLabel}`}
                    >
                      Détails
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => del(item.id)}
                      aria-label={`Supprimer l'enregistrement du ${fullLabel}`}
                    >
                      Supprimer
                    </button>
                  </div>
                  <div
                    id={`history-details-${item.id}`}
                    hidden={!isExpanded}
                    className="rounded-md border border-gray-200 bg-white/60 p-3 text-sm text-gray-700 transition-all duration-200 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-200"
                  >
                    <dl className="grid gap-2 sm:grid-cols-2">
                      {INPUT_SUMMARY.map((meta) => {
                        const value = item.inputs[meta.key];
                        let display: string;
                        if ("type" in meta) {
                          if (meta.type === "bool") {
                            display = value ? "Oui" : "Non";
                          } else {
                            display = typeof value === "string" && value.trim() !== "" ? value : "(par défaut)";
                          }
                        } else {
                          const numeric = typeof value === "number" ? value : Number(value) || 0;
                          if (meta.key === "biasPts") {
                            display = numeric.toFixed(1);
                          } else {
                            display = meta.formatter ? meta.formatter(numeric) : String(value ?? "");
                          }
                        }
                        return (
                          <div key={String(meta.key)} className="flex flex-col">
                            <dt className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{meta.label}</dt>
                            <dd className="font-medium text-gray-900 dark:text-gray-100">{display}</dd>
                          </div>
                        );
                      })}
                    </dl>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export const History = React.forwardRef(HistoryComponent);


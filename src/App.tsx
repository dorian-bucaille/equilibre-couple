import React, { useEffect, useMemo, useRef, useState } from "react";
import { calculate } from "./lib/calc";
import { euro } from "./lib/format";
import type { Inputs } from "./lib/types";
import { InputField } from "./components/InputField";
import { SummaryCard } from "./components/SummaryCard";
import { DetailsCard } from "./components/DetailsCard";
import { loadState, saveState } from "./lib/storage";
import { useCollapse } from "./hooks/useCollapse";
import "./styles.css";

const DEFAULTS: Inputs = {
  a1: 2000,
  a2: 175,
  b2: 0,
  trPct: 100,
  b: 2000,
  m: 1500,
  advanced: false,
  E: 600,
  biasPts: 0,
};

function parseQuery(defaults: Inputs): Inputs {
  const u = new URL(window.location.href);
  const g = (k: keyof Inputs) => u.searchParams.get(String(k));
  const num = (v: string | null, d: number) => (v ? Number(v) : d);
  return {
    a1: num(g("a1"), defaults.a1),
    a2: num(g("a2"), defaults.a2),
    b2: num(g("b2"), defaults.b2),
    trPct: num(g("trPct"), defaults.trPct),
    b: num(g("b"), defaults.b),
    m: num(g("m"), defaults.m),
    advanced: g("advanced") ? g("advanced") === "1" : defaults.advanced,
    E: num(g("E"), defaults.E),
    biasPts: num(g("biasPts"), defaults.biasPts),
  };
}

function toQuery(i: Inputs) {
  const p = new URLSearchParams();
  p.set("a1", String(i.a1));
  p.set("a2", String(i.a2));
  p.set("b2", String(i.b2));
  p.set("trPct", String(i.trPct));
  p.set("b", String(i.b));
  p.set("m", String(i.m));
  p.set("advanced", i.advanced ? "1" : "0");
  p.set("E", String(i.E));
  p.set("biasPts", String(i.biasPts));
  return `${location.origin}${location.pathname}?${p.toString()}`;
}

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const loaded = loadState(DEFAULTS);
    const merged = parseQuery(loaded);
    return merged;
  });
  const biasHighlight = useHighlightOnChange(inputs.biasPts);
  const advancedRef = useCollapse(inputs.advanced);

  useEffect(() => {
    saveState(inputs);
  }, [inputs]);

  const result = useMemo(() => calculate(inputs), [inputs]);

  const copyLink = async () => {
    const url = toQuery(inputs);
    await navigator.clipboard.writeText(url);
    alert("Lien copié dans le presse-papiers.");
  };

  const reset = () => setInputs(DEFAULTS);

  const printPDF = () => window.print();

  return (
    <div className="max-w-3xl mx-auto space-y-5 px-4 py-6 sm:p-6 transition-colors duration-300 ease-out">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-center text-2xl font-bold md:text-left">
          Équilibre couple — calculateur
        </h1>
        <div className="no-print flex flex-wrap items-center justify-center gap-2 md:justify-end">
          <ThemeToggle />
          <button onClick={copyLink} className="btn btn-ghost">Copier le lien</button>
          <button onClick={printPDF} className="btn btn-ghost">Imprimer / PDF</button>
          <button onClick={reset} className="btn btn-danger">Réinitialiser</button>
        </div>
      </header>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">Paramètres</h2>

        <div className="grid sm:grid-cols-2 gap-3">
          <InputField
            id="a1"
            label={`Salaire Partenaire A${inputs.advanced ? " (a1)" : ""}`}
            value={inputs.a1}
            onChange={(v) => setInputs({ ...inputs, a1: v })}
            suffix="€ / mois"
            tooltip="Salaire net mensuel du partenaire A"
          />
          <InputField
            id="b"
            label={`Salaire Partenaire B${inputs.advanced ? " (b)" : ""}`}
            value={inputs.b}
            onChange={(v) => setInputs({ ...inputs, b: v })}
            suffix="€ / mois"
            tooltip="Salaire net mensuel du partenaire B"
          />
          <InputField
            id="a2"
            label={`Tickets resto Partenaire A${inputs.advanced ? " (a2)" : ""}`}
            value={inputs.a2}
            onChange={(v) => setInputs({ ...inputs, a2: v })}
            suffix="€ / mois"
            tooltip="Montant mensuel brut de tickets restaurant crédités"
          />
          <InputField
            id="b2"
            label={`Tickets resto Partenaire B${inputs.advanced ? " (b2)" : ""}`}
            value={inputs.b2}
            onChange={(v) => setInputs({ ...inputs, b2: v })}
            suffix="€ / mois"
            tooltip="Montant mensuel brut de tickets restaurant crédités pour le partenaire B"
          />
          <InputField
            id="m"
            label={`Budget commun hors TR${inputs.advanced ? " (m)" : ""}`}
            value={inputs.m}
            onChange={(v) => setInputs({ ...inputs, m: v })}
            suffix="€ / mois"
            tooltip="Part du budget commun non éligible TR (cash)"
          />
          <div className="sm:col-span-2">
            <div className="rounded-lg border border-gray-200/80 bg-white/50 p-3 transition-colors duration-300 ease-out dark:border-gray-800/80 dark:bg-gray-900/30">
              <button
                type="button"
                className={`btn btn-ghost w-full justify-between gap-2 transition-transform duration-200 ease-out ${
                  inputs.advanced ? "shadow-sm ring-1 ring-blue-500/40" : ""
                }`}
                onClick={() => setInputs({ ...inputs, advanced: !inputs.advanced })}
                aria-expanded={inputs.advanced}
                aria-controls="advanced-panel"
              >
                <span className="font-medium">Mode avancé</span>
                <span
                  className={`text-lg transition-transform duration-300 ease-out ${
                    inputs.advanced ? "rotate-180" : "rotate-0"
                  }`}
                  aria-hidden="true"
                >
                  ▾
                </span>
              </button>
              <p className="mt-2 text-sm text-gray-500">
                Permet de saisir E = dépenses éligibles TR (au‑delà des TR)
              </p>
              <div
                id="advanced-panel"
                ref={advancedRef}
                className="overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out"
                style={{ maxHeight: "0px", opacity: 0, transform: "translateY(-0.5rem)" }}
                aria-hidden={!inputs.advanced}
              >
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InputField
                    id="trPct"
                    label="% TR effectivement dépensés"
                    value={inputs.trPct}
                    onChange={(v) => setInputs({ ...inputs, trPct: v })}
                    suffix="%"
                    min={0}
                    max={100}
                    step={1}
                    tooltip="Pourcentage des TR réellement consommés"
                  />
                  <InputField
                    id="E"
                    label="Dépenses éligibles TR (E)"
                    value={inputs.E}
                    onChange={(v) => setInputs({ ...inputs, E: v })}
                    suffix="€ / mois"
                    tooltip="Montant mensuel des dépenses éligibles (courses/resto) qui peuvent être payées en TR"
                  />
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-medium">Ajustement du prorata (favoriser A ou B)</span>
                      <span
                        className={`inline-block text-sm transition-all duration-200 ease-out sm:text-right ${
                          biasHighlight
                            ? "-translate-y-1 opacity-100 text-blue-600 dark:text-blue-300"
                            : "translate-y-0 opacity-80 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formatBiasSummary(inputs.biasPts)}
                      </span>
                      <span
                        className={`text-sm transition-all duration-200 ease-out ${
                          biasHighlight
                            ? "opacity-100 text-blue-600 dark:text-blue-300"
                            : "opacity-80 text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {formatBiasForPartnerA(inputs.biasPts)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={-10}
                      max={10}
                      step={0.5}
                      value={inputs.biasPts}
                      onChange={(e) => setInputs({ ...inputs, biasPts: parseFloat(e.target.value) })}
                      aria-label="Ajustement du prorata (A ↔ B)"
                      className={`w-full accent-blue-600 transition-transform duration-200 ease-out ${
                        biasHighlight ? "scale-[1.02]" : "scale-100"
                      }`}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Favoriser A</span>
                      <span>Neutre</span>
                      <span>Favoriser B</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      Valeur positive: favorise B (A paie davantage). Valeur négative: favorise A (A paie moins).
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SummaryCard r={result} />
      <DetailsCard r={result} />

      {result.warnings.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 p-4">
          <ul className="list-disc ml-5 text-amber-700 dark:text-amber-300">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <footer className="text-sm text-gray-500">
        Somme des dépôts: {euro(result.depositD + result.depositM)} — Cash requis: {euro(result.cashNeeded)}.
      </footer>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(
    () => window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
  }, [dark]);

  return (
    <button
      className="btn btn-ghost transition-transform duration-300 ease-out hover:scale-105 active:scale-95"
      onClick={() => setDark((d) => !d)}
      aria-pressed={dark}
      aria-label="Basculer mode sombre"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

function useHighlightOnChange(value: number, duration = 250) {
  const [highlight, setHighlight] = useState(false);
  const firstRender = useRef(true);

  useEffect(() => {
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

function formatBiasSummary(value: number) {
  const normalized = Math.abs(value) < 1e-6 ? 0 : value;
  if (normalized === 0) return "Neutre";
  if (normalized > 0) return `Favorise B (+${normalized.toFixed(1)} pts)`;
  return `Favorise A (${normalized.toFixed(1)} pts)`;
}

function formatBiasForPartnerA(value: number) {
  const normalized = Math.abs(value) < 1e-6 ? 0 : value;
  const sign = normalized > 0 ? "+" : normalized < 0 ? "" : "+";
  return `${sign}${normalized.toFixed(1)} points pour le partenaire A`;
}

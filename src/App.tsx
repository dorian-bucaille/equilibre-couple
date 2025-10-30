import React, { useEffect, useMemo, useState } from "react";
import { calculate } from "./lib/calc";
import { euro } from "./lib/format";
import type { Inputs } from "./lib/types";
import { InputField } from "./components/InputField";
import { SummaryCard } from "./components/SummaryCard";
import { DetailsCard } from "./components/DetailsCard";
import { loadState, saveState } from "./lib/storage";
import "./styles.css";

const DEFAULTS: Inputs = {
  a1: 2300,
  a2: 175,
  trPct: 100,
  b: 2000,
  m: 1500,
  advanced: true, // tu as validé le mode avancé
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
    <div className="max-w-3xl mx-auto p-6 space-y-5">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Équilibre couple — calculateur</h1>
        <div className="no-print flex items-center gap-2">
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
            label="Salaire Dorian (a1)"
            value={inputs.a1}
            onChange={(v) => setInputs({ ...inputs, a1: v })}
            suffix="€ / mois"
            tooltip="Salaire net mensuel de Dorian"
          />
          <InputField
            id="b"
            label="Salaire Mariwenn (b)"
            value={inputs.b}
            onChange={(v) => setInputs({ ...inputs, b: v })}
            suffix="€ / mois"
            tooltip="Salaire net mensuel de Mariwenn"
          />
          <InputField
            id="a2"
            label="Tickets resto Dorian (a2)"
            value={inputs.a2}
            onChange={(v) => setInputs({ ...inputs, a2: v })}
            suffix="€ / mois"
            tooltip="Montant mensuel brut de tickets restaurant crédités"
          />
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
            id="m"
            label="Budget commun hors TR (m)"
            value={inputs.m}
            onChange={(v) => setInputs({ ...inputs, m: v })}
            suffix="€ / mois"
            tooltip="Part du budget commun non éligible TR (cash)"
          />

          <label className="flex flex-col gap-1">
            <span className="font-medium">Mode avancé (E/N)</span>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={inputs.advanced}
                onChange={(e) => setInputs({ ...inputs, advanced: e.target.checked })}
                aria-label="Activer le mode avancé"
              />
              <span className="text-sm text-gray-500">
                Permet de saisir E = dépenses éligibles TR (au‑delà des TR)
              </span>
            </div>
          </label>

          {inputs.advanced && (
            <InputField
              id="E"
              label="Dépenses éligibles TR (E)"
              value={inputs.E}
              onChange={(v) => setInputs({ ...inputs, E: v })}
              suffix="€ / mois"
              tooltip="Montant mensuel des dépenses éligibles (courses/resto) qui peuvent être payées en TR"
            />
          )}

          <label className="flex flex-col gap-1 sm:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">Ajustement en faveur de Mariwenn</span>
              <span className="text-sm text-gray-500">+{inputs.biasPts.toFixed(1)} points pour Dorian</span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={inputs.biasPts}
              onChange={(e) => setInputs({ ...inputs, biasPts: parseFloat(e.target.value) })}
              aria-label="Ajustement en faveur de Mariwenn"
            />
            <span className="text-xs text-gray-500">
              Plus la valeur est élevée, plus Dorian prend de poids dans le prorata ({'=>'} il paie davantage en cash).
            </span>
          </label>
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
      className="btn btn-ghost"
      onClick={() => setDark((d) => !d)}
      aria-pressed={dark}
      aria-label="Basculer mode sombre"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}


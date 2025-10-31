import React, { useEffect, useMemo, useRef, useState } from "react";
import { calculate } from "./lib/calc";
import type { Inputs, SplitMode } from "./lib/types";
import { InputField } from "./components/InputField";
import { SummaryCard } from "./components/SummaryCard";
import { CalculationInfoCard } from "./components/CalculationInfoCard";
import { DetailsCard, type DetailsCardHandle } from "./components/DetailsCard";
import { GlossaryButton } from "./components/GlossaryButton";
import { InfoIcon } from "./components/InfoIcon";
import { History, type HistoryHandle } from "./components/History";
import { loadState, saveState, type HistoryItem } from "./lib/storage";
import { useCollapse } from "./hooks/useCollapse";
import "./styles.css";
import { TextField } from "./components/TextField";

const DEFAULTS: Inputs = {
  partnerAName: "Partenaire A",
  partnerBName: "Partenaire B",
  a1: 2000,
  a2: 175,
  b2: 0,
  trPct: 100,
  b: 2000,
  m: 1500,
  advanced: false,
  E: 600,
  biasPts: 0,
  mode: "proportional",
};

function parseQuery(defaults: Inputs): Inputs {
  const u = new URL(window.location.href);
  const g = (k: keyof Inputs) => u.searchParams.get(String(k));
  const num = (v: string | null, d: number) => (v ? Number(v) : d);
  const modeParam = u.searchParams.get("mode");
  const mode: SplitMode = modeParam === "equal_leftover" ? "equal_leftover" : modeParam === "proportional" ? "proportional" : defaults.mode;
  return {
    partnerAName: (u.searchParams.get("nameA") ?? defaults.partnerAName) || "",
    partnerBName: (u.searchParams.get("nameB") ?? defaults.partnerBName) || "",
    a1: num(g("a1"), defaults.a1),
    a2: num(g("a2"), defaults.a2),
    b2: num(g("b2"), defaults.b2),
    trPct: num(g("trPct"), defaults.trPct),
    b: num(g("b"), defaults.b),
    m: num(g("m"), defaults.m),
    advanced: g("advanced") ? g("advanced") === "1" : defaults.advanced,
    E: num(g("E"), defaults.E),
    biasPts: num(g("biasPts"), defaults.biasPts),
    mode,
  };
}

function toQuery(i: Inputs) {
  const p = new URLSearchParams();
  p.set("nameA", i.partnerAName);
  p.set("nameB", i.partnerBName);
  p.set("a1", String(i.a1));
  p.set("a2", String(i.a2));
  p.set("b2", String(i.b2));
  p.set("trPct", String(i.trPct));
  p.set("b", String(i.b));
  p.set("m", String(i.m));
  p.set("advanced", i.advanced ? "1" : "0");
  p.set("E", String(i.E));
  p.set("biasPts", String(i.biasPts));
  p.set("mode", i.mode);
  return `${location.origin}${location.pathname}?${p.toString()}`;
}

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(() => {
    const loaded = loadState(DEFAULTS);
    const merged = parseQuery(loaded);
    return merged;
  });
  const [lastLoadedInputs, setLastLoadedInputs] = useState<Inputs>(inputs);
  const [ariaMessage, setAriaMessage] = useState("");
  const historyRef = useRef<HistoryHandle>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const detailsRef = useRef<DetailsCardHandle>(null);
  const biasHighlight = useHighlightOnChange(inputs.biasPts);
  const advancedRef = useCollapse(inputs.advanced);
  const isDirty = useMemo(() => !areInputsEqual(inputs, lastLoadedInputs), [inputs, lastLoadedInputs]);

  const partnerAName = inputs.partnerAName.trim() || "Partenaire A";
  const partnerBName = inputs.partnerBName.trim() || "Partenaire B";
  const biasDisabled = inputs.mode === "equal_leftover";

  useEffect(() => {
    saveState(inputs);
  }, [inputs]);

  const result = useMemo(() => calculate(inputs), [inputs]);

  const copyLink = async () => {
    const url = toQuery(inputs);
    await navigator.clipboard.writeText(url);
    alert("Lien copié dans le presse-papiers.");
  };

  const reset = () => {
    const fresh = { ...DEFAULTS };
    setInputs(fresh);
    setLastLoadedInputs(fresh);
  };

  const printPDF = () => window.print();

  const handleModeChange = (mode: SplitMode) => {
    setInputs((prev) => ({ ...prev, mode }));
    setAriaMessage(mode === "equal_leftover" ? "Mode reste à vivre égal activé" : "Mode proportionnel activé");
  };

  const handleSummarySave = () => {
    historyRef.current?.addCurrentState();
  };

  const handleSummaryFocusNote = () => {
    historyRef.current?.focusNote();
  };

  const handleHistoryCleared = () => {
    setAriaMessage("Historique effacé");
  };

  const handleLoadHistory = (item: HistoryItem) => {
    if (isDirty) {
      const confirmed = window.confirm(
        "Charger cet enregistrement va remplacer les valeurs actuelles. Continuer ?",
      );
      if (!confirmed) return;
    }

    const snapshot = JSON.parse(JSON.stringify(item.inputs)) as Inputs;
    setInputs(snapshot);
    setLastLoadedInputs(snapshot);

    const formattedDate = new Date(item.dateISO).toLocaleDateString("fr-FR");
    setAriaMessage(`Enregistrement du ${formattedDate} chargé`);

    window.scrollTo({ top: 0, behavior: "smooth" });
    window.setTimeout(() => {
      titleRef.current?.focus();
    }, 300);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-white to-rose-50 transition-colors duration-300 ease-out dark:from-gray-950 dark:via-gray-950 dark:to-slate-900">
      <div className="pointer-events-none absolute -left-32 top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-rose-300/30 blur-3xl dark:bg-rose-500/20" />
      <div className="pointer-events-none absolute bottom-[-14rem] right-[-24rem] h-[32rem] w-[32rem] rounded-full bg-sky-300/25 blur-3xl dark:bg-sky-500/20" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-white/70 bg-white/80 px-6 py-6 shadow-xl backdrop-blur-md transition-colors duration-300 ease-out dark:border-white/10 dark:bg-gray-900/60">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-2 text-center md:text-left">
              <h1
                className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50"
                ref={titleRef}
                tabIndex={-1}
              >
                Équilibre couple — calculateur
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Ajustez vos contributions communes en quelques secondes et visualisez un partage équilibré, clair et apaisant.
              </p>
            </div>
            <div className="no-print flex flex-col items-center gap-3 md:items-end">
              <div className="flex items-center gap-2">
                <ThemeToggle />
                {inputs.advanced && <GlossaryButton />}
              </div>
              <div className="flex flex-wrap justify-center gap-2 md:justify-end">
                <a
                  href="https://github.com/dorian-bucaille/equilibre-couple"
                  className="btn btn-ghost"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
                <button onClick={copyLink} className="btn btn-ghost">Copier le lien</button>
                <button onClick={printPDF} className="btn btn-ghost">Imprimer / PDF</button>
                <button onClick={reset} className="btn btn-danger">Réinitialiser</button>
              </div>
            </div>
          </div>
        </header>

        <div aria-live="polite" className="sr-only">
          {ariaMessage}
        </div>

        <section className="card space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Paramètres</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Personnalisez les revenus, les tickets restaurant et le budget commun pour obtenir une proposition sur-mesure.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <TextField
              id="partnerAName"
              label="Nom partenaire A"
              value={inputs.partnerAName}
              onChange={(value) => setInputs({ ...inputs, partnerAName: value })}
              placeholder="Partenaire A"
              tooltip="Personnalise le nom utilisé pour le partenaire A dans les calculs et graphiques"
            />
            <TextField
              id="partnerBName"
              label="Nom partenaire B"
              value={inputs.partnerBName}
              onChange={(value) => setInputs({ ...inputs, partnerBName: value })}
              placeholder="Partenaire B"
              tooltip="Personnalise le nom utilisé pour le partenaire B dans les calculs et graphiques"
            />
            <fieldset className="space-y-3 sm:col-span-2" aria-describedby="mode-tip">
              <legend className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <span>Mode de répartition</span>
                <InfoIcon
                  title="Proportionnel : chacun contribue selon ses moyens. Reste à vivre égal : chacun garde le même reste cash après contribution."
                  tooltipId="mode-tip"
                />
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="mode-option">
                  <input
                    type="radio"
                    name="mode"
                    value="proportional"
                    checked={inputs.mode === "proportional"}
                    onChange={() => handleModeChange("proportional")}
                    className="mode-option__input"
                  />
                  <div className="mode-option__content">
                    <span className="mode-option__title">Proportionnel</span>
                    <span className="mode-option__description">
                      Chacun contribue selon ses moyens, tickets resto inclus.
                    </span>
                  </div>
                </label>
                <label className="mode-option">
                  <input
                    type="radio"
                    name="mode"
                    value="equal_leftover"
                    checked={inputs.mode === "equal_leftover"}
                    onChange={() => handleModeChange("equal_leftover")}
                    className="mode-option__input"
                  />
                  <div className="mode-option__content">
                    <span className="mode-option__title">Reste à vivre égal</span>
                    <span className="mode-option__description">
                      Alignement du cash restant après contribution pour chaque partenaire.
                    </span>
                  </div>
                </label>
              </div>
            </fieldset>
            <InputField
              id="a1"
              label={`Salaire ${partnerAName}${inputs.advanced ? " (a1)" : ""}`}
              value={inputs.a1}
              onChange={(v) => setInputs({ ...inputs, a1: v })}
              suffix="€ / mois"
              tooltip={`Salaire net mensuel de ${partnerAName}`}
            />
            <InputField
              id="b"
              label={`Salaire ${partnerBName}${inputs.advanced ? " (b)" : ""}`}
              value={inputs.b}
              onChange={(v) => setInputs({ ...inputs, b: v })}
              suffix="€ / mois"
              tooltip={`Salaire net mensuel de ${partnerBName}`}
            />
            <InputField
              id="a2"
              label={`Tickets resto ${partnerAName}${inputs.advanced ? " (a2)" : ""}`}
              value={inputs.a2}
              onChange={(v) => setInputs({ ...inputs, a2: v })}
              suffix="€ / mois"
              tooltip={`Montant mensuel brut de tickets restaurant crédités pour ${partnerAName}`}
            />
            <InputField
              id="b2"
              label={`Tickets resto ${partnerBName}${inputs.advanced ? " (b2)" : ""}`}
              value={inputs.b2}
              onChange={(v) => setInputs({ ...inputs, b2: v })}
              suffix="€ / mois"
              tooltip={`Montant mensuel brut de tickets restaurant crédités pour ${partnerBName}`}
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
              <div className="rounded-3xl border border-dashed border-rose-200/80 bg-white/70 p-4 shadow-sm transition-colors duration-300 ease-out dark:border-rose-500/40 dark:bg-gray-900/40">
                <button
                  type="button"
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left transition-all duration-200 ease-out ${
                    inputs.advanced
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-200"
                      : "bg-white/60 text-gray-700 hover:bg-white dark:bg-gray-900/40 dark:text-gray-200 dark:hover:bg-gray-900/60"
                  }`}
                  onClick={() => setInputs({ ...inputs, advanced: !inputs.advanced })}
                  aria-expanded={inputs.advanced}
                  aria-controls="advanced-panel"
                >
                  <div className="space-y-1">
                    <span className="text-sm font-semibold">Mode avancé</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Ajouter les dépenses éligibles et ajuster finement la contribution.
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
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                  Permet de saisir E = dépenses éligibles TR (au‑delà des TR)
                </p>
                <div
                  id="advanced-panel"
                  ref={advancedRef}
                  className="overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out"
                  style={{ maxHeight: "0px", opacity: 0, transform: "translateY(-0.5rem)" }}
                  aria-hidden={!inputs.advanced}
                >
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
                    <label className="flex flex-col gap-4 rounded-2xl border border-gray-200/80 bg-white/70 p-4 shadow-sm transition-colors duration-300 ease-out dark:border-gray-700/60 dark:bg-gray-900/40 sm:col-span-2">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Ajustement du prorata (favoriser {partnerAName} ou {partnerBName})
                        </span>
                        <div className="flex flex-col items-start gap-1 text-xs font-medium text-gray-500 sm:items-end sm:text-right dark:text-gray-400">
                          <span
                            className={`transition-all duration-200 ease-out ${
                              biasHighlight
                                ? "-translate-y-0.5 text-rose-600 opacity-100 dark:text-rose-300"
                                : "translate-y-0 text-gray-500 opacity-80 dark:text-gray-400"
                            }`}
                          >
                            {formatBiasSummary(inputs.biasPts, partnerAName, partnerBName)}
                          </span>
                          <span
                            className={`transition-all duration-200 ease-out ${
                              biasHighlight
                                ? "text-rose-600 opacity-100 dark:text-rose-300"
                                : "text-gray-500 opacity-80 dark:text-gray-400"
                            }`}
                          >
                            {formatBiasForPartner(inputs.biasPts, partnerAName)}
                          </span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={-10}
                        max={10}
                        step={0.5}
                        value={inputs.biasPts}
                        onChange={(e) => setInputs({ ...inputs, biasPts: parseFloat(e.target.value) })}
                        aria-label={`Ajustement du prorata (${partnerAName} ↔ ${partnerBName})`}
                        className={`w-full accent-rose-500 transition-transform duration-200 ease-out ${
                          biasHighlight ? "scale-[1.01]" : "scale-100"
                        }`}
                        disabled={biasDisabled}
                      />
                      <div className="flex justify-between text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        <span>Favoriser {partnerAName}</span>
                        <span>Neutre</span>
                        <span>Favoriser {partnerBName}</span>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Valeur positive: favorise {partnerBName} ({partnerAName} paie davantage). Valeur négative: favorise {partnerAName} ({partnerAName} paie moins).
                      </span>
                      {biasDisabled && (
                        <span className="field-help text-amber-600 dark:text-amber-400">
                          Biais non applicable en mode “Reste à vivre égal”.
                        </span>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SummaryCard
          r={result}
          partnerAName={partnerAName}
          partnerBName={partnerBName}
          mode={inputs.mode}
          onSaveHistory={handleSummarySave}
          onFocusNote={handleSummaryFocusNote}
        />
        <CalculationInfoCard
          onRequestDetails={() => {
            detailsRef.current?.openAndFocus();
          }}
        />
        <DetailsCard ref={detailsRef} r={result} />

        {result.warnings.length > 0 && (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-50/80 p-5 text-sm text-amber-800 shadow-sm dark:border-amber-400/40 dark:bg-amber-900/30 dark:text-amber-200">
            <ul className="ml-4 list-disc space-y-1">
              {result.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        )}

        <History
          ref={historyRef}
          inputs={inputs}
          result={result}
          onLoad={handleLoadHistory}
          onRequestClearAll={handleHistoryCleared}
        />
      </div>
    </div>
  );
}

function areInputsEqual(a: Inputs, b: Inputs) {
  const keys: (keyof Inputs)[] = [
    "partnerAName",
    "partnerBName",
    "a1",
    "a2",
    "b2",
    "trPct",
    "b",
    "m",
    "advanced",
    "E",
    "biasPts",
    "mode",
  ];

  return keys.every((key) => a[key] === b[key]);
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

function formatBiasSummary(value: number, partnerAName: string, partnerBName: string) {
  const normalized = Math.abs(value) < 1e-6 ? 0 : value;
  if (normalized === 0) return "Neutre";
  if (normalized > 0) return `Favorise ${partnerBName} (+${normalized.toFixed(1)} pts)`;
  return `Favorise ${partnerAName} (${normalized.toFixed(1)} pts)`;
}

function formatBiasForPartner(value: number, partnerName: string) {
  const normalized = Math.abs(value) < 1e-6 ? 0 : value;
  const sign = normalized > 0 ? "+" : normalized < 0 ? "" : "+";
  return `${sign}${normalized.toFixed(1)} points pour ${partnerName}`;
}

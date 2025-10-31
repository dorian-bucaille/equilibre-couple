import { clamp /*, round2 */ } from "./format"; // ⟵ on n'utilise plus round2 ici
import type { Inputs, Result } from "./types";

// Arrondi sûr à 2 décimales (toujours un number, jamais NaN)
const r2 = (n: unknown): number => {
  const x = typeof n === "number" && Number.isFinite(n) ? n : 0;
  return Math.round(x * 100) / 100;
};

export function calculate(inputs: Inputs): Result {
  const toFinite = (value: unknown, fallback = 0) =>
    typeof value === "number" && Number.isFinite(value) ? value : fallback;

  const a1 = toFinite(inputs.a1);
  const a2 = toFinite(inputs.a2);
  const b2 = toFinite(inputs.b2);
  const trPct = toFinite(inputs.trPct, 100);
  const b = toFinite(inputs.b);
  const m = toFinite(inputs.m);
  const advanced = Boolean(inputs.advanced);
  const E = toFinite(inputs.E);
  const biasPts = toFinite(inputs.biasPts);
  const partnerAName = inputs.partnerAName?.trim() || "Partenaire A";
  const partnerBName = inputs.partnerBName?.trim() || "Partenaire B";

  const trPctClamped = clamp(trPct, 0, 100) / 100;
  const effectiveTRA = Math.max(0, a2) * trPctClamped;
  const effectiveTRB = Math.max(0, b2) * trPctClamped;
  const effectiveTR = effectiveTRA + effectiveTRB;

  const eligibleTR = Math.max(0, E);

  let usedTRA = effectiveTRA;
  let usedTRB = effectiveTRB;

  if (advanced) {
    const cap = Math.min(effectiveTR, eligibleTR);
    if (effectiveTR > 0 && cap < effectiveTR) {
      const ratio = cap / effectiveTR;
      usedTRA = effectiveTRA * ratio;
      usedTRB = effectiveTRB * ratio;
    }
    if (cap === 0) {
      usedTRA = 0;
      usedTRB = 0;
    }
  }

  const V = advanced ? usedTRA + usedTRB : effectiveTR;

  const potTotal = advanced ? m + eligibleTR : m + V;

  const extraEligibleCash = advanced ? Math.max(0, eligibleTR - V) : 0;

  const cashNeeded = m + extraEligibleCash;

  const wD = Math.max(0, a1) + usedTRA;
  const wM = Math.max(0, b) + usedTRB;
  const denom = wD + wM;
  const shareD_raw = denom > 0 ? wD / denom : 0.5;

  // Biais signé : +X => favorise B (A paie plus), -X => favorise A (A paie moins)
  const biasShift = clamp(biasPts, -50, 50) / 100;
  const shareD_biased = clamp(shareD_raw + biasShift, 0, 1);
  const shareM_biased = 1 - shareD_biased;

  const contribEqD = potTotal * shareD_biased;
  const contribEqM = potTotal - contribEqD;

  const depositDRaw = contribEqD - usedTRA;
  const depositMRaw = contribEqM - usedTRB;

  let depositD = depositDRaw;
  let depositM = depositMRaw;

  if (depositD < 0) {
    depositM += depositD;
    depositD = 0;
  }
  if (depositM < 0) {
    depositD += depositM;
    depositM = 0;
  }

  const cashNeededRounded = r2(cashNeeded);

  depositD = r2(Math.max(0, depositD));
  depositM = r2(Math.max(0, cashNeededRounded - depositD));

  const sumDeposits = depositD + depositM;
  if (sumDeposits > cashNeededRounded && Math.abs(sumDeposits - cashNeededRounded) < 0.05) {
    const diff = r2(sumDeposits - cashNeededRounded);
    if (diff > 0) {
      if (depositM >= diff) depositM = r2(depositM - diff);
      else depositD = r2(Math.max(0, depositD - diff));
    }
  }

  // Sécurité borne (arrondis)
  depositD = r2(depositD);
  depositM = r2(depositM);
  if (depositM < 0 && Math.abs(depositM) < 0.02) {
    depositM = 0;
    depositD = r2(cashNeededRounded - depositM);
  }
  if (depositD < 0 && Math.abs(depositD) < 0.02) {
    depositD = 0;
    depositM = r2(cashNeededRounded);
  }

  const warnings: string[] = [];
  const steps: string[] = [];

  if (denom === 0) {
    warnings.push("Somme des revenus pondérés nulle — parts fixées à 50/50 par sécurité.");
  }
  if (advanced && effectiveTR > eligibleTR) {
    warnings.push(
      `TR non utilisés intégralement: ${r2(effectiveTR - eligibleTR)} € non consommés (E < TR).`
    );
  }
  if (contribEqD - usedTRA < 0) {
    warnings.push(`Le dépôt de ${partnerAName} est borné à 0 (sa part est couverte par les tickets resto).`);
  }
  if (contribEqM - usedTRB < 0) {
    warnings.push(`Le dépôt de ${partnerBName} est borné à 0 (sa part est couverte par les tickets resto).`);
  }

  steps.push(
  `TR effectifs — ${partnerAName}: ${r2(effectiveTRA)} €, ${partnerBName}: ${r2(effectiveTRB)} € (total ${r2(effectiveTR)} €)`,
  advanced
    ? `TR utilisés (après plafond E) — ${partnerAName}: ${r2(usedTRA)} €, ${partnerBName}: ${r2(usedTRB)} € (total ${r2(V)} €)`
    : `TR utilisés — ${partnerAName}: ${r2(effectiveTRA)} €, ${partnerBName}: ${r2(effectiveTRB)} € (total ${r2(V)} €)`,
  advanced
    ? `Pot total M = m + E = ${r2(m)} + ${r2(eligibleTR)} = ${r2(potTotal)} €`
    : `Pot total équivalent = m + V = ${r2(m)} + ${r2(V)} = ${r2(potTotal)} €`,
  advanced
    ? `Cash à déposer = m + max(0, E - V) = ${r2(m)} + ${r2(Math.max(0, eligibleTR - V))} = ${r2(cashNeededRounded)} €`
    : `Cash à déposer = m = ${r2(cashNeededRounded)} €`,
  `Parts (avant biais): ${partnerAName}=${(shareD_raw * 100).toFixed(1)}% / ${partnerBName}=${((1 - shareD_raw) * 100).toFixed(1)}%`,
  `Biais ${(biasPts >= 0 ? "+" : "") + biasPts.toFixed(1)} pts (${biasPts === 0 ? "neutre" : biasPts > 0 ? `favorise ${partnerBName}` : `favorise ${partnerAName}`}) => ${partnerAName}=${(shareD_biased * 100).toFixed(1)}% / ${partnerBName}=${(shareM_biased * 100).toFixed(1)}%`,
  `Contribution équivalente: ${partnerAName}=${r2(contribEqD)} €, ${partnerBName}=${r2(contribEqM)} €`,
  `Dépôts cash: ${partnerAName}=${r2(depositD)} €, ${partnerBName}=${r2(depositM)} € (somme cash=${r2(depositD + depositM)} €)`
);

  return {
    effectiveTRA: r2(effectiveTRA),
    effectiveTRB: r2(effectiveTRB),
    effectiveTR: r2(effectiveTR),
    usedTRA: r2(usedTRA),
    usedTRB: r2(usedTRB),
    V: r2(V),
    potTotal: r2(potTotal),
    cashNeeded: cashNeededRounded,
    shareD_raw: r2(shareD_raw),
    shareD_biased: r2(shareD_biased),
    shareM_biased: r2(shareM_biased),
    contribEqD: r2(contribEqD),
    contribEqM: r2(contribEqM),
    depositD,
    depositM,
    warnings,
    steps,
  };
}

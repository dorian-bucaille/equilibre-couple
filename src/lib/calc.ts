import { clamp, round2 } from "./format";
import type { Inputs, Result } from "./types";

/**
 * Calcul "proportionnel aux revenus" avec TR comme contribution en nature.
 * - Mode simple: pot = m + V, cash = m, V = (a2 + b2) * trPct
 * - Mode avancé: pot = m + E, cash = m + max(0, E - V), V = min(effectiveTR, E)
 * - Part partenaire A ~ (a1 + V_A) / (a1 + V_A + b + V_B), puis biais +X points (clampé).
 * - Dépôt partenaire A = max(0, contribEqD - V_A), partenaire B = cash - dépôt A.
 */
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

  // Biais en faveur du partenaire B: on AUGMENTE la part du partenaire A de X points => A paie plus, B moins.
  // (Ex.: "ajuster légèrement en faveur du partenaire B" — p.ex. +3 pts pour A)
  const biasShift = clamp(biasPts, -50, 50) / 100;
  const shareD_biased = clamp(shareD_raw + biasShift, 0, 1);
  const shareM_biased = 1 - shareD_biased;

  const contribEqD = potTotal * shareD_biased;
  const contribEqM = potTotal - contribEqD;

  const depositDRaw = contribEqD - usedTRA;
  const depositMRaw = contribEqM - usedTRB;

  // Dépôts cash (répartis après prise en compte des TR de chaque partenaire)
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

  const cashNeededRounded = round2(cashNeeded);

  depositD = round2(Math.max(0, depositD));
  depositM = round2(Math.max(0, cashNeededRounded - depositD));

  const sumDeposits = depositD + depositM;
  if (sumDeposits > cashNeededRounded && Math.abs(sumDeposits - cashNeededRounded) < 0.05) {
    const diff = round2(sumDeposits - cashNeededRounded);
    if (diff > 0) {
      if (depositM >= diff) depositM = round2(depositM - diff);
      else depositD = round2(Math.max(0, depositD - diff));
    }
  }

  // Sécurité borne (arrondis)
  depositD = round2(depositD);
  depositM = round2(depositM);
  // Corrige l'éventuel -0.01 dû aux arrondis
  if (depositM < 0 && Math.abs(depositM) < 0.02) {
    depositM = 0;
    depositD = round2(cashNeededRounded - depositM);
  }
  if (depositD < 0 && Math.abs(depositD) < 0.02) {
    depositD = 0;
    depositM = round2(cashNeededRounded);
  }

  const warnings: string[] = [];
  const steps: string[] = [];

  if (denom === 0) {
    warnings.push("Somme des revenus pondérés nulle — parts fixées à 50/50 par sécurité.");
  }
  if (advanced && effectiveTR > eligibleTR) {
    warnings.push(
      `TR non utilisés intégralement: ${round2(effectiveTR - eligibleTR)} € non consommés (E < TR).`
    );
  }
  if (contribEqD - usedTRA < 0) {
    warnings.push("Dépôt du partenaire A borné à 0 (sa part est couverte par les tickets resto).");
  }
  if (contribEqM - usedTRB < 0) {
    warnings.push("Dépôt du partenaire B borné à 0 (sa part est couverte par les tickets resto).");
  }

  steps.push(
    `TR effectifs — A: ${round2(effectiveTRA)} €, B: ${round2(effectiveTRB)} € (total ${round2(
      effectiveTR
    )} €)`,
    advanced
      ? `TR utilisés (après plafond E) — A: ${round2(usedTRA)} €, B: ${round2(usedTRB)} € (total ${round2(
          V
        )} €)`
      : `TR utilisés — A: ${round2(effectiveTRA)} €, B: ${round2(effectiveTRB)} € (total ${round2(V)} €)`,
    advanced
      ? `Pot total M = m + E = ${round2(m)} + ${round2(eligibleTR)} = ${round2(potTotal)} €`
      : `Pot total équivalent = m + V = ${round2(m)} + ${round2(V)} = ${round2(potTotal)} €`,
    advanced
      ? `Cash à déposer = m + max(0, E - V) = ${round2(m)} + ${round2(
          Math.max(0, eligibleTR - V)
        )} = ${round2(cashNeededRounded)} €`
      : `Cash à déposer = m = ${round2(cashNeededRounded)} €`,
    `Parts (avant biais): D=${(shareD_raw * 100).toFixed(1)}% / M=${(
      (1 - shareD_raw) * 100
    ).toFixed(1)}%`,
    `Biais ${(biasPts >= 0 ? "+" : "") + biasPts.toFixed(1)} pts (${biasPts === 0
      ? "neutre"
      : biasPts > 0
        ? "favorise B"
        : "favorise A"}) => D=${(shareD_biased * 100).toFixed(1)}% / M=${(
      shareM_biased * 100
    ).toFixed(1)}%`,
    `Contribution équivalente: D=${round2(contribEqD)} €, M=${round2(contribEqM)} €`,
    `Dépôts cash: D=${round2(depositD)} €, M=${round2(depositM)} € (somme cash=${round2(
      depositD + depositM
    )} €)`
  );

  return {
    effectiveTRA: round2(effectiveTRA),
    effectiveTRB: round2(effectiveTRB),
    effectiveTR: round2(effectiveTR),
    usedTRA: round2(usedTRA),
    usedTRB: round2(usedTRB),
    V: round2(V),
    potTotal: round2(potTotal),
    cashNeeded: cashNeededRounded,
    shareD_raw: round2(shareD_raw),
    shareD_biased: round2(shareD_biased),
    shareM_biased: round2(shareM_biased),
    contribEqD: round2(contribEqD),
    contribEqM: round2(contribEqM),
    depositD,
    depositM,
    warnings,
    steps,
  };
}

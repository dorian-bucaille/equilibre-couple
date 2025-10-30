import { clamp, round2 } from "./format";
import type { Inputs, Result } from "./types";

/**
 * Calcul "proportionnel aux revenus" avec TR comme contribution en nature.
 * - Mode simple: pot = m + V, cash = m, V = a2 * trPct
 * - Mode avancé: pot = m + E, cash = m + max(0, E - V), V = min(effectiveTR, E)
 * - Part partenaire A ~ (a1 + V) / (a1 + V + b), puis biais +X points (clampé).
 * - Dépôt partenaire A = max(0, contribEqD - V), partenaire B = cash - dépôt A.
 */
export function calculate(inputs: Inputs): Result {
  const { a1, a2, trPct, b, m, advanced, E, biasPts } = inputs;

  const effectiveTR = Math.max(0, a2) * clamp(trPct, 0, 100) / 100;

  const V = advanced ? Math.min(effectiveTR, Math.max(0, E)) : effectiveTR;

  const potTotal = advanced ? m + Math.max(0, E) : m + V;

  const extraEligibleCash = advanced ? Math.max(0, Math.max(0, E) - V) : 0;

  const cashNeeded = m + extraEligibleCash;

  const wD = Math.max(0, a1) + V;
  const wM = Math.max(0, b);
  const denom = wD + wM;
  const shareD_raw = denom > 0 ? wD / denom : 0.5;

  // Biais signé:
  //  - Valeur positive => favorise le partenaire B (on AUGMENTE la part d'A de X points => A paie plus)
  //  - Valeur négative => favorise le partenaire A (on DIMINUE la part d'A)
  const shareD_biased = clamp(shareD_raw + clamp(biasPts, -50, 50) / 100, 0, 1);
  const shareM_biased = 1 - shareD_biased;

  const contribEqD = potTotal * shareD_biased;
  const contribEqM = potTotal - contribEqD;

  // Dépôts cash
  let depositD = Math.max(0, contribEqD - V);
  let depositM = cashNeeded - depositD;

  // Sécurité borne (arrondis)
  depositD = round2(depositD);
  depositM = round2(depositM);
  // Corrige l'éventuel -0.01 dû aux arrondis
  if (depositM < 0 && Math.abs(depositM) < 0.02) {
    depositM = 0;
    depositD = round2(cashNeeded - depositM);
  }
  if (depositD < 0 && Math.abs(depositD) < 0.02) {
    depositD = 0;
    depositM = round2(cashNeeded);
  }

  const warnings: string[] = [];
  const steps: string[] = [];

  if (denom === 0) {
    warnings.push("Somme des revenus pondérés nulle — parts fixées à 50/50 par sécurité.");
  }
  if (advanced && effectiveTR > E) {
    warnings.push(
      `TR non utilisés intégralement: ${round2(effectiveTR - E)} € non consommés (E < TR).`
    );
  }
  if (contribEqD - V < 0) {
    warnings.push("Dépôt du partenaire A borné à 0 (sa part est couverte par les tickets resto).");
  }

  steps.push(
    `TR effectifs: ${round2(effectiveTR)} €, V utilisés: ${round2(V)} €`,
    advanced
      ? `Pot total M = m + E = ${round2(m)} + ${round2(E)} = ${round2(potTotal)} €`
      : `Pot total équivalent = m + V = ${round2(m)} + ${round2(V)} = ${round2(potTotal)} €`,
    advanced
      ? `Cash à déposer = m + max(0, E - V) = ${round2(m)} + ${round2(
          Math.max(0, E - V)
        )} = ${round2(cashNeeded)} €`
      : `Cash à déposer = m = ${round2(cashNeeded)} €`,
    `Parts (avant biais): D=${(shareD_raw * 100).toFixed(1)}% / M=${(((1 - shareD_raw) * 100)).toFixed(1)}%`,
    `Biais ${(biasPts >= 0 ? "+" : "") + biasPts.toFixed(1)} pts (${biasPts === 0 ? "neutre" : biasPts > 0 ? "favorise B" : "favorise A"}) => D=${(shareD_biased * 100).toFixed(1)}% / M=${(shareM_biased * 100).toFixed(1)}%`,
    `Contribution équivalente: D=${round2(contribEqD)} €, M=${round2(contribEqM)} €`,
    `Dépôts cash: D=${round2(depositD)} €, M=${round2(depositM)} € (somme cash=${round2(
      depositD + depositM
    )} €)`
  );

  return {
    effectiveTR: round2(effectiveTR),
    V: round2(V),
    potTotal: round2(potTotal),
    cashNeeded: round2(cashNeeded),
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

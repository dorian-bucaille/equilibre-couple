import { clamp /*, round2 */ } from "./format"; // ⟵ on n'utilise plus round2 ici
import type { Inputs, Result, SplitMode } from "./types";

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
  const requestedMode = inputs.mode as SplitMode | undefined;
  const mode: SplitMode = requestedMode === "equal_leftover" ? "equal_leftover" : "proportional";
  const biasPtsRaw = toFinite(inputs.biasPts);
  const biasPts = mode === "equal_leftover" ? 0 : biasPtsRaw;
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

  const cashNeededRounded = r2(cashNeeded);
  const SA = Math.max(0, a1);
  const SB = Math.max(0, b);

  let shareD_raw = 0.5;
  let shareD_biased = 0.5;
  let shareM_biased = 0.5;
  let contribEqDRaw = 0;
  let contribEqMRaw = 0;
  let depositD = 0;
  let depositM = 0;
  let leftoverA = 0;
  let leftoverB = 0;

  const warnings: string[] = [];
  const steps: string[] = [];

  const pushCommonSteps = () => {
    steps.push(
      `TR effectifs — ${partnerAName}: ${r2(effectiveTRA)} €, ${partnerBName}: ${r2(effectiveTRB)} € (total ${r2(effectiveTR)} €)`
    );
    steps.push(
      advanced
        ? `TR utilisés (après plafond E) — ${partnerAName}: ${r2(usedTRA)} €, ${partnerBName}: ${r2(usedTRB)} € (total ${r2(V)} €)`
        : `TR utilisés — ${partnerAName}: ${r2(effectiveTRA)} €, ${partnerBName}: ${r2(effectiveTRB)} € (total ${r2(V)} €)`
    );
    steps.push(
      advanced
        ? `Pot total M = m + E = ${r2(m)} + ${r2(eligibleTR)} = ${r2(potTotal)} €`
        : `Pot total équivalent = m + V = ${r2(m)} + ${r2(V)} = ${r2(potTotal)} €`
    );
    steps.push(
      advanced
        ? `Cash à déposer = m + max(0, E - V) = ${r2(m)} + ${r2(Math.max(0, eligibleTR - V))} = ${r2(cashNeededRounded)} €`
        : `Cash à déposer = m = ${r2(cashNeededRounded)} €`
    );
  };

  pushCommonSteps();

  if (mode === "proportional") {
    const wD = SA + usedTRA;
    const wM = SB + usedTRB;
    const denom = wD + wM;
    shareD_raw = denom > 0 ? wD / denom : 0.5;

    // Biais signé : +X => favorise B (A paie plus), -X => favorise A (A paie moins)
    const biasShift = clamp(biasPts, -50, 50) / 100;
    shareD_biased = clamp(shareD_raw + biasShift, 0, 1);
    shareM_biased = 1 - shareD_biased;

    contribEqDRaw = potTotal * shareD_biased;
    contribEqMRaw = potTotal - contribEqDRaw;

    let depositDRaw = contribEqDRaw - usedTRA;
    let depositMRaw = contribEqMRaw - usedTRB;

    if (depositDRaw < 0) {
      depositMRaw += depositDRaw;
      depositDRaw = 0;
    }
    if (depositMRaw < 0) {
      depositDRaw += depositMRaw;
      depositMRaw = 0;
    }

    depositD = r2(Math.max(0, depositDRaw));
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

    leftoverA = r2(SA - depositD);
    leftoverB = r2(SB - depositM);

    if (denom === 0) {
      warnings.push("Somme des revenus pondérés nulle — parts fixées à 50/50 par sécurité.");
    }
    if (contribEqDRaw - usedTRA < 0) {
      warnings.push(`Le dépôt de ${partnerAName} est borné à 0 (sa part est couverte par les tickets resto).`);
    }
    if (contribEqMRaw - usedTRB < 0) {
      warnings.push(`Le dépôt de ${partnerBName} est borné à 0 (sa part est couverte par les tickets resto).`);
    }

    steps.push(
      `Parts (avant biais): ${partnerAName}=${(shareD_raw * 100).toFixed(1)}% / ${partnerBName}=${((1 - shareD_raw) * 100).toFixed(1)}%`
    );
    steps.push(
      `Biais ${(biasPts >= 0 ? "+" : "") + biasPts.toFixed(1)} pts (${biasPts === 0 ? "neutre" : biasPts > 0 ? `favorise ${partnerBName}` : `favorise ${partnerAName}`}) => ${partnerAName}=${(shareD_biased * 100).toFixed(1)}% / ${partnerBName}=${(shareM_biased * 100).toFixed(1)}%`
    );
    steps.push(
      `Contribution équivalente: ${partnerAName}=${r2(contribEqDRaw)} €, ${partnerBName}=${r2(contribEqMRaw)} €`
    );
    steps.push(
      `Dépôts cash: ${partnerAName}=${r2(depositD)} €, ${partnerBName}=${r2(depositM)} € (somme cash=${r2(depositD + depositM)} €)`
    );
  } else {
    let depositDRaw = (cashNeeded + (SA - SB)) / 2;
    let depositMRaw = cashNeeded - depositDRaw;
    let boundedA = false;
    let boundedB = false;

    if (depositDRaw < 0) {
      depositDRaw = 0;
      depositMRaw = cashNeeded;
      boundedA = true;
    }
    if (depositMRaw < 0) {
      depositMRaw = 0;
      depositDRaw = cashNeeded;
      boundedB = true;
    }

    depositD = r2(Math.max(0, depositDRaw));
    depositM = r2(Math.max(0, cashNeededRounded - depositD));

    if (depositM < 0 && Math.abs(depositM) < 0.02) {
      depositM = 0;
      depositD = r2(cashNeededRounded);
    }
    if (depositD < 0 && Math.abs(depositD) < 0.02) {
      depositD = 0;
      depositM = r2(cashNeededRounded);
    }

    leftoverA = r2(SA - depositD);
    leftoverB = r2(SB - depositM);

    contribEqDRaw = depositD + usedTRA;
    contribEqMRaw = depositM + usedTRB;
    shareD_raw = potTotal > 0 ? contribEqDRaw / potTotal : 0.5;
    shareD_raw = clamp(shareD_raw, 0, 1);
    shareD_biased = shareD_raw;
    shareM_biased = 1 - shareD_biased;

    if (depositD === 0 && SA < SB) {
      warnings.push("Dépôt A borné à 0 (reste égalisé).");
    }
    if (depositM === 0 && SB < SA) {
      warnings.push("Dépôt B borné à 0 (reste égalisé).");
    }

    steps.push("Mode reste à vivre égal : chacun conserve le même reste cash.");
    steps.push(
      `Égalité du reste cash: ${r2(SA)} - dépôt ${partnerAName} = ${r2(SB)} - dépôt ${partnerBName}`
    );
    steps.push(
      `Dépôt ${partnerAName} = (cashNeeded + (${r2(SA)} - ${r2(SB)})) / 2 = ${r2(depositD)} €`
    );
    steps.push(
      `Dépôt ${partnerBName} = cashNeeded - dépôt ${partnerAName} = ${r2(cashNeededRounded)} - ${r2(depositD)} = ${r2(depositM)} €`
    );
    if (boundedA) {
      steps.push(`Dépôt ${partnerAName} borné à 0 pour éviter un dépôt négatif.`);
    }
    if (boundedB) {
      steps.push(`Dépôt ${partnerBName} borné à 0 pour éviter un dépôt négatif.`);
    }
    steps.push(
      `Contribution équivalente (cash + TR): ${partnerAName}=${r2(contribEqDRaw)} €, ${partnerBName}=${r2(contribEqMRaw)} €`
    );
    steps.push(
      `Restes cash égalisés: ${partnerAName}=${r2(leftoverA)} €, ${partnerBName}=${r2(leftoverB)} €`
    );
    steps.push(
      `Dépôts cash: ${partnerAName}=${r2(depositD)} €, ${partnerBName}=${r2(depositM)} € (somme cash=${r2(depositD + depositM)} €)`
    );
  }

  if (advanced && effectiveTR > eligibleTR) {
    warnings.push(
      `TR non utilisés intégralement: ${r2(effectiveTR - eligibleTR)} € non consommés (E < TR).`
    );
  }

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
    contribEqD: r2(contribEqDRaw),
    contribEqM: r2(contribEqMRaw),
    depositD,
    depositM,
    leftoverA,
    leftoverB,
    warnings,
    steps,
  };
}

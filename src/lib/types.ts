export type Inputs = {
  a1: number;      // Salaire partenaire A
  a2: number;      // TR bruts partenaire A
  trPct: number;   // % TR effectivement dépensés (0..100)
  b: number;       // Salaire partenaire B
  m: number;       // Budget commun hors TR (cash non-eligible)
  advanced: boolean;
  E: number;       // Dépenses éligibles TR (si advanced), sinon ignoré
  biasPts: number; // +points en faveur du partenaire B => A paie plus
};

export type Result = {
  effectiveTR: number;  // a2 * trPct
  V: number;            // TR réellement utilisés = min(effectiveTR, E) si advanced, sinon effectiveTR
  potTotal: number;     // M total (m + E si advanced, sinon m + V)
  cashNeeded: number;   // Cash à déposer (m + max(0, E - V)) si advanced, sinon m
  shareD_raw: number;   // Part partenaire A (avant biais)
  shareD_biased: number;
  shareM_biased: number;
  contribEqD: number;   // Contribution équivalente du partenaire A (sur potTotal)
  contribEqM: number;
  depositD: number;     // Dépôt cash du partenaire A (borné >= 0)
  depositM: number;     // Dépôt cash du partenaire B
  warnings: string[];
  steps: string[];
};

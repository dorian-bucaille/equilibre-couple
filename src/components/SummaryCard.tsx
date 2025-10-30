import React from "react";
import { euro, pct } from "../lib/format";
import type { Result } from "../lib/types";

export const SummaryCard: React.FC<{ r: Result }> = ({ r }) => {
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
    </div>
  );
};

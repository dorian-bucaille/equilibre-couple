import React, { useState } from "react";
import type { Result } from "../lib/types";

export const DetailsCard: React.FC<{ r: Result }> = ({ r }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      <button
        className="no-print inline-flex items-center gap-2 text-sm px-3 py-2 rounded bg-gray-200 dark:bg-gray-800"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {open ? "Masquer les détails" : "Afficher les détails"}
      </button>

      {open && (
        <div className="mt-3 space-y-2 text-sm">
          <ul className="list-disc ml-5">
            {r.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          {r.warnings.length > 0 && (
            <div className="mt-3">
              <div className="font-semibold">Avertissements</div>
              <ul className="list-disc ml-5 text-amber-600">
                {r.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-gray-500">
            Note: les tickets resto sont comptés comme une <strong>contribution en nature</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

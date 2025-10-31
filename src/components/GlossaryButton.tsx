import React, { useEffect, useRef, useState } from "react";

const DEFINITIONS: Array<{ term: string; description: string }> = [
  {
    term: "m",
    description:
      "Budget commun à alimenter en cash (dépenses non éligibles aux tickets resto).",
  },
  {
    term: "E",
    description:
      "Montant mensuel des dépenses éligibles aux tickets resto qui dépassent les TR disponibles.",
  },
  {
    term: "V",
    description:
      "Total des tickets restaurant réellement utilisés dans le calcul (après application du % TR effectifs).",
  },
  {
    term: "TR effectifs",
    description:
      "Montant de tickets resto pris en compte après avoir appliqué le pourcentage de TR effectivement dépensés.",
  },
  {
    term: "Pot total (M)",
    description:
      "Budget mutualisé utilisé pour répartir les dépenses: cash m + dépenses éligibles (E) ou tickets utilisés (V).",
  },
  {
    term: "Biais",
    description:
      "Ajustement manuel du prorata: valeur positive favorise B (A paie plus), valeur négative favorise A (A paie moins).",
  },
];

export const GlossaryButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", handleKey);
    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="glossary-panel"
      >
        ?
      </button>
      {open && (
        <div
          id="glossary-panel"
          role="dialog"
          aria-label="Glossaire contextuel"
          className="absolute right-0 z-20 mt-2 w-72 max-w-xs rounded-lg border border-gray-200 bg-white p-4 text-left text-sm shadow-lg dark:border-gray-700 dark:bg-slate-900"
        >
          <h3 className="mb-2 text-base font-semibold">Glossaire</h3>
          <dl className="space-y-2">
            {DEFINITIONS.map((item) => (
              <div key={item.term}>
                <dt className="font-medium text-gray-900 dark:text-gray-100">{item.term}</dt>
                <dd className="text-gray-600 dark:text-gray-300">{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};


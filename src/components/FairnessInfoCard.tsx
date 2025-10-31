import React from "react";

export const FairnessInfoCard: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <section
      className="card border-blue-200/60 bg-blue-50/70 text-sm dark:border-blue-800/60 dark:bg-blue-900/30"
      aria-labelledby="fairness-info-title"
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">
          ⚖️
        </span>
        <div className="space-y-2">
          <div>
            <h2 id="fairness-info-title" className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Pourquoi c’est équitable
            </h2>
            <p className="text-gray-700 dark:text-gray-200">
              Ici, l’équité signifie « chacun contribue selon ses moyens » : on compare les ressources réelles plutôt que de viser un simple 50/50.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-blue-700 shadow-sm dark:bg-blue-900/70 dark:text-blue-200">
              Revenus nets
            </span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-blue-700 shadow-sm dark:bg-blue-900/70 dark:text-blue-200">
              Tickets resto
            </span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-blue-700 shadow-sm dark:bg-blue-900/70 dark:text-blue-200">
              Budget commun
            </span>
          </div>
          <button
            type="button"
            className="btn btn-ghost mt-1 inline-flex items-center gap-1 border border-blue-200/70 bg-white/60 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-white dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-100"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-controls="fairness-info-details"
          >
            {expanded ? "Masquer" : "Voir plus"}
            <span aria-hidden="true" className={`transition-transform ${expanded ? "rotate-180" : "rotate-0"}`}>
              ▾
            </span>
          </button>
        </div>
      </div>

      <div
        id="fairness-info-details"
        className={`mt-3 space-y-3 overflow-hidden text-gray-700 transition-all duration-300 ease-out dark:text-gray-200 ${
          expanded ? "max-h-[60rem] opacity-100" : "max-h-0 opacity-0"
        }`}
        aria-hidden={!expanded}
      >
        <div className="rounded-lg border border-blue-200/60 bg-white/60 p-3 text-sm leading-relaxed dark:border-blue-800/60 dark:bg-blue-950/40">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
            <span aria-hidden="true">🧠</span>
            Comprendre le calcul
          </h3>
          <p>
            Le modèle additionne revenus, tickets resto consommés et dépenses communes à financer. On calcule ensuite la part de chacun dans ce total afin que la contribution suive le même pourcentage.
          </p>
          <ol className="ml-5 list-decimal space-y-1 pt-3">
            <li>On totalise toutes les ressources mobilisées par le couple.</li>
            <li>On mesure la part relative de chaque partenaire dans cette enveloppe.</li>
            <li>On applique ce pourcentage au budget commun et l’on déduit les tickets resto déjà utilisés.</li>
          </ol>
          <div className="mt-3 rounded-md border border-blue-100/80 bg-blue-100/60 p-2 text-[0.85rem] text-blue-900 shadow-sm dark:border-blue-800/40 dark:bg-blue-900/30 dark:text-blue-100">
            Les tickets resto couvrant déjà certaines courses sont considérés comme une contribution en nature : ils réduisent d’autant le virement à faire.
          </div>
          <p className="pt-3">
            Résultat : l’effort ressenti reste comparable, et vous pouvez ajuster ensemble si vous préférez équilibrer les restes à vivre ou tenir compte d’autres projets.
          </p>
        </div>
      </div>
    </section>
  );
};

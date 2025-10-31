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
              Le calcul vise une répartition proportionnelle aux ressources réelles de chacun : l’effort ressenti reste comparable,
              même si les montants diffèrent.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-blue-700 shadow-sm dark:bg-blue-900/70 dark:text-blue-200">
              Revenus nets
            </span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-blue-700 shadow-sm dark:bg-blue-900/70 dark:text-blue-200">
              Tickets resto utilisés
            </span>
            <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-medium text-blue-700 shadow-sm dark:bg-blue-900/70 dark:text-blue-200">
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
        <div className="rounded-lg border border-blue-200/60 bg-white/60 p-3 text-sm dark:border-blue-800/60 dark:bg-blue-950/40">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800 dark:text-blue-200">
            <span aria-hidden="true">🧠</span>
            Comprendre le calcul
          </h3>
          <p>
            Le modèle additionne les revenus nets et la part de tickets restaurant réellement dépensée pour les dépenses communes. La
            contribution de chacun est ensuite calculée au prorata de cette enveloppe partagée.
          </p>
          <ol className="ml-5 list-decimal space-y-1 pt-2">
            <li>On additionne toutes les ressources disponibles du couple.</li>
            <li>On calcule la part relative de chaque partenaire dans ce total.</li>
            <li>Chacun finance le budget commun à hauteur de sa part, moins les tickets resto déjà utilisés.</li>
          </ol>
          <p className="pt-2">
            Si les tickets resto couvrent déjà une partie des dépenses, la contribution en espèces du partenaire concerné est réduite d’autant. On
            vise une équité perçue, pas une symétrie parfaite : libre à vous d’ajuster selon vos projets ou charges personnelles.
          </p>
        </div>
      </div>
    </section>
  );
};

# AGENT INSTRUCTIONS

### Vue d’ensemble
- Le projet **Équilibre couple** est une application web qui aide deux partenaires à ajuster leurs contributions aux dépenses communes en se basant sur leurs revenus et leurs tickets restaurant. L’interface propose un formulaire de paramètres, un résumé clair et un bloc de détails, avec des fonctions pratiques : partage de lien, mode sombre, impression/PDF, historique local, etc.

- Pour démarrer : `npm install` puis `npm run dev`, ce qui lance Vite en mode développement. Des scripts supplémentaires permettent la build, les tests et le linting.

### Structure technique
- Stack : React 18 + TypeScript, bundlé par Vite, stylé avec Tailwind CSS. Les dépendances et outils (ESLint, Vitest, Prettier, Tailwind, etc.) sont déclarés dans `package.json`.

- Point d’entrée : `src/main.tsx` monte l’application dans `#root` et enveloppe `App` avec `I18nextProvider` pour activer les traductions.

- Le dossier `src/` est découpé en : `components/` (cartes, champs, etc.), `lib/` (calculs, formatage, stockage, types), `hooks/` (comportements UI comme l’accordéon), `vendor/` (adaptateurs i18n), et les feuilles de style globales.

### Points de repère côté code
1. **Gestion des paramètres utilisateur dans `App.tsx`**
   - `App` centralise l’état des champs saisis (`Inputs`), l’historique local et les interactions (copie de lien, impression, reset). Les valeurs par défaut, la lecture des query params et la synchronisation avec `localStorage` sont gérées au sein du composant, qui calcule aussi un résumé via `calculate(inputs)`. C’est votre repère principal pour comprendre le flux de données entre formulaire, calculs et affichage.

   - `useCollapse` anime l’ouverture du panneau avancé : ce hook manipule dynamiquement `max-height`, opacité et pointer events selon l’état `open`, ce qui montre comment l’UI reste fluide sans bibliothèque externe.

2. **Internationalisation (`src/lib/i18n.ts`)**
   - Le module initialise i18next, choisit la langue via le `localStorage` ou le navigateur, et expose les ressources (textes FR/EN) utilisées dans tous les composants. Explorer ce fichier aide à comprendre comment les libellés du formulaire, des cartes et des info-bulles sont centralisés et comment ajouter une nouvelle langue.

3. **Cœur métier : `calculate`**
   - `src/lib/calc.ts` contient l’algorithme qui transforme les entrées (revenus, tickets, mode de partage, biais) en résultats : contributions, restes à vivre, avertissements, étapes explicatives. Il applique des sécurités (clamp, arrondis) et deux modes de répartition (proportionnel ou “reste à vivre égal”). Comprendre cette fonction est essentiel pour toute évolution métier.

   - Le module `format.ts` fournit `clamp`, `round2` et des helpers de formatage monétaire/pourcentage utilisés par l’algo et l’UI.

4. **Persistance locale**
   - `src/lib/storage.ts` gère la sauvegarde automatique de l’état du formulaire et l’historique des simulations dans `localStorage`, avec migration des anciennes versions et recalcul des snapshots si nécessaire. Le composant `History` (appelé via `historyRef` dans `App`) s’appuie sur ces fonctions pour permettre de nommer, recharger ou purger des configurations.

5. **Tests et validation**
   - `src/lib/calc.test.ts` contient une batterie de tests Vitest qui vérifient les scénarios clés (mode avancé, biais, bornes, rester-à-vivre égal, avertissements). Ils servent d’exemples pour comprendre les attentes métier et offrent un filet de sécurité lors de modifications de l’algorithme.

### Conseils pour la suite de l’apprentissage
- **Commencer par l’interface** : manipulez `App.tsx` et les composants de formulaire pour appréhender les props, l’usage de `useTranslation`, et la manière dont les inputs déclenchent `setInputs`.
- **Suivre le flux des données** : partez d’un champ (`InputField`, `TextField`), voyez comment il met à jour l’état, puis inspectez comment `result` issu de `calculate` nourrit `SummaryCard`, `DetailsCard` et l’historique.
- **Explorer l’i18n** : ajouter/modifier un libellé dans `src/lib/i18n.ts` et observer la propagation vous fera toucher à la fois à l’UI et à la configuration.
- **Modifier/étendre le calcul** : testez de petites variations dans `calculate` en lançant `npm test` pour voir comment les scénarios réagissent, ce qui solidifie votre compréhension de la logique financière.
- **Observer les hooks/utilitaires** : des fichiers courts comme `useCollapse.ts` ou `format.ts` sont de bons exemples de patterns réutilisables en React/TypeScript.

En suivant ces jalons (UI → i18n → calcul → persistance → tests), vous aurez une vision progressive mais complète de l’application, tout en sachant précisément dans quels fichiers intervenir pour chaque aspect.

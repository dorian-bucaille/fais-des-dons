# 🎁 Fais des dons – calculateur d'optimisation fiscale

**Fais des dons** (nom de code *OptimDon*) est une application web React + TypeScript qui aide les contribuables français à planifier leurs dons aux associations. L'interface dérive de l'ancienne application « Équilibre couple », mais le moteur métier a été totalement repensé pour :

- estimer les montants optimaux de dons en fonction du revenu imposable ;
- respecter les plafonds légaux (75 %, 66 % et 20 % du revenu) ;
- comparer le coût réel selon différents objectifs (maximiser l'avantage, donner un montant précis, viser un coût net) ;
- intégrer, en mode expert, les dons effectués en titres-restaurant (part salariée et part employeur).

L'application est 100 % client-side, sans API ni backend, et réutilise les composants UI, la sauvegarde locale et le partage par URL issus du projet initial.

## Fonctionnalités principales

- **Paramètres guidés** : année fiscale, revenu imposable, fréquence (ponctuel ou mensuel) et objectif (max avantage fiscal, don brut cible, coût net cible).
- **Mode expert** : activation optionnelle pour ajouter les dons en titres-restaurant (valeur faciale, quantité, répartition employeur/salarié) et obtenir des messages pédagogiques sur le report.
- **Synthèse claire** : carte de résultats détaillant la répartition 75 % / 66 %, l'économie d'impôt, le coût réel avec ou sans part employeur, ainsi que deux barres de progression (plafond 75 % et plafond global 20 %).
- **Détails chiffrés** : tableau ligne à ligne des bases retenues, plafonds appliqués, montants reportés sur 5 ans et formules affichées avec les valeurs numériques.
- **Exports et partage** : génération d'un résumé imprimable/PDF, copie des résultats, export CSV et URL partageable intégrant tous les paramètres de la simulation.
- **Expérience fluide** : thème sombre natif, persistance automatique dans `localStorage`, synchronisation des paramètres par query string et interface responsive fidèle au design d'origine.

## Aperçu du parcours utilisateur

1. Sélectionnez l'année fiscale et indiquez votre revenu imposable annuel.
2. Choisissez l'objectif de calcul :
   - maximiser l'avantage fiscal (remplit automatiquement le plafond des 20 %) ;
   - viser un montant de don précis ;
   - viser un coût net après réduction.
3. Activez le mode expert pour mélanger euros et titres-restaurant si besoin ; l'application valide la somme des pourcentages employeur/salarié et signale les objectifs inatteignables.
4. Consultez la carte « Synthèse », le bloc « Détails » et, le cas échéant, les messages de mise en garde sur les dépassements ou les reports.
5. Exportez ou partagez vos résultats via les actions situées dans l'entête.

## Prérequis

- [Node.js](https://nodejs.org/) 18 ou plus.
- [npm](https://www.npmjs.com/) (installé avec Node.js).

## Structure du projet

```
.
├── src/
│   ├── components/      # Formulaire, cartes de synthèse, détails, export et header.
│   ├── hooks/           # Persistences locale et synchronisation avec l'URL.
│   ├── lib/             # Logique métier : calculs fiscaux, formatage, types et stockage.
│   ├── styles.css       # Entrée Tailwind partagée clair/sombre.
│   ├── App.tsx          # Mise en page principale (formulaire + résultats).
│   └── main.tsx         # Bootstrap React/Vite.
├── public/              # Fichiers statiques.
└── vite.config.ts       # Configuration Vite.
```

La fonction centrale de calcul se trouve dans `src/lib/calc.ts` (plafonds, réduction, recherche binaire pour le coût net). Les formats et libellés sont gérés dans `src/lib/format.ts`, tandis que `src/lib/storage.ts` encapsule la lecture/écriture dans `localStorage`.

## Démarrage rapide

```bash
npm install
npm run dev
```

Puis ouvrez [http://localhost:5173](http://localhost:5173) pour accéder à l'application en développement. Les paramètres sont sauvegardés automatiquement et se reflètent dans l'URL.

### Scripts disponibles

| Commande                 | Description                                                                     |
|--------------------------|---------------------------------------------------------------------------------|
| `npm run dev`            | Lance le serveur de développement Vite avec rechargement à chaud.               |
| `npm run build`          | Génère la build de production dans `dist`.                                      |
| `npm run preview`        | Sert la build de production en local pour validation finale.                    |
| `npm run lint`           | Analyse le code TypeScript/React avec ESLint.                                   |
| `npm run format`         | Applique Prettier afin d'homogénéiser le formatage.                             |
| `npm test`               | Exécute la suite de tests Vitest (dont les cas métier du moteur de calcul).     |
| `npm run test:watch`     | Lance Vitest en mode surveillé pour le TDD.                                     |
| `npm run lighthouse:ci`  | Produit un rapport automatisé de performance/accessibilité via Lighthouse CI.   |

## Qualité et tests

La logique fiscale est couverte par des tests unitaires (`src/lib/calc.test.ts`, `src/lib/format.test.ts`). Avant toute PR, exécutez :

```bash
npm run lint
npm test
```

Pour les évolutions sensibles d'UX ou de performance, n'hésitez pas à lancer `npm run lighthouse:ci`.

## Déploiement

Le projet est optimisé pour Netlify (configuration fournie dans `netlify.toml`). Pour déployer :

1. Reliez le dépôt GitHub à Netlify.
2. Définissez la commande de build sur `npm run build` et le dossier de publication sur `dist`.
3. Activez l'option de build preview pour valider les simulations avant mise en production.

## Licence

Ce projet est distribué sous licence [MIT](LICENSE).

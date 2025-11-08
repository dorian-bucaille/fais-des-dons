import i18n, { type Resource } from "i18next";
import { initReactI18next } from "react-i18next";

const STORAGE_KEY = "fdd:lang";
const fallbackLng = "fr" as const;

const getInitialLanguage = () => {
  if (typeof window === "undefined") return fallbackLng;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) return stored;
  const navigatorLang = window.navigator.language?.split("-")[0];
  if (navigatorLang === "fr" || navigatorLang === "en") return navigatorLang;
  return fallbackLng;
};

const resources: Resource = {
  fr: {
    translation: {
      languages: {
        switch: "FR / EN",
      },
      header: {
        title: "🎁 Fais des dons — calculateur fiscal",
        description:
          "Personnalisez vos objectifs de dons, la fréquence et le mode expert pour affiner la simulation fiscale.",
        simpleDescription:
          "Indiquez simplement votre revenu imposable et découvrez immédiatement combien donner pour profiter des réductions d'impôt.",
        simpleMode: "Mode simple",
        advancedMode: "Mode expert",
        disclaimer: "Calculateur pédagogique — aucune donnée n'est transmise.",
        github: "GitHub",
      },
      appearance: {
        toggleTitle: "Changer le mode d'affichage",
        toggleAria: "Basculer vers le {{mode}}",
        lightMode: "Mode clair",
        darkMode: "Mode sombre",
      },
      actions: {
        copyLink: "Copier le lien",
        copyLinkSuccess: "Lien copié dans le presse-papiers.",
        copyLinkError: "Impossible de copier automatiquement le lien.",
        copySummary: "Copier les résultats",
        copySummarySuccess: "Résumé copié dans le presse-papiers.",
        copySummaryError: "Impossible de copier le résumé.",
        exportCsv: "Exporter en CSV",
        print: "Imprimer / PDF",
        reset: "Réinitialiser",
      },
      simple: {
        title: "Ta simulation express",
        description:
          "Entre ton revenu imposable pour voir immédiatement combien donner et ce que ça coûtera vraiment après réduction d'impôt.",
        incomeLabel: "Ton revenu imposable annuel",
        incomeHelper: "Il apparaît sur ton avis d'imposition, rubrique \"revenu imposable\".",
        emptyState:
          "Saisis ton revenu imposable pour découvrir des idées de dons et l'économie d'impôt associée.",
        cards: {
          monthly: {
            title: "Si tu donnes chaque mois",
            amount: "{{amount}} / mois",
            detail: "Soit {{annual}} par an.",
            subAmount: "≈ {{amount}} / mois récupérés",
            realCostPerMonth: "Coût réel : {{amount}} / mois",
            explanation:
              "Tu verses {{donationMonthly}} par mois ({{donation}} par an). L'État te rend {{reductionMonthly}} par mois, soit {{reduction}} sur l'année. Au final, ton don ne te coûte que {{costMonthly}} par mois ({{cost}} sur l'année).",
          },
          once: {
            title: "Si tu donnes en une fois",
            detail: "Un don ponctuel de {{amount}}.",
            explanation:
              "Tu donnes {{donation}} en une fois. L'État te rend {{reduction}} sur tes impôts, donc il ne sort réellement que {{cost}} de ta poche.",
          },
          associationReceives: "Les associations reçoivent",
          taxReduction: "Réduction d'impôt estimée",
          realCost: "Ce que ça te coûte vraiment",
          reductionRate: "Pris en charge par l'État",
        },
        caps: {
          title: "Tes plafonds fiscaux",
          line75: "Réduction à 75 % jusqu'à {{amount}}",
          line20: "Réduction à 66 % dans la limite de {{amount}} (20 % de ton revenu)",
        },
        advancedCta:
          "Envie d'ajuster la fréquence, un objectif précis ou des titres-restaurant ? Passe en mode expert.",
        switchAdvanced: "Ouvrir le mode expert",
      },
      parameters: {
        title: "Paramètres",
        description: "Saisissez votre revenu imposable, choisissez un objectif et, si besoin, ajoutez vos dons en titres-restaurant.",
        year: "Année fiscale",
        income: "Revenu imposable annuel",
        frequency: {
          title: "Fréquence",
          once: "Ponctuel",
          monthly: "Mensuel",
        },
        objectives: {
          max: {
            title: "Maximiser l'avantage fiscal",
            description: "Remplir automatiquement le plafond global de 20 % du revenu imposable.",
          },
          brut: {
            title: "Je veux donner un montant",
            description: "Fixez un don brut (cash + TR). Les plafonds sont appliqués automatiquement.",
            amount: "Montant {{label}}",
          },
          net: {
            title: "Je vise un coût réel",
            description: "Trouver le don qui aboutit au coût net souhaité après réduction d'impôt.",
            amount: "Coût recherché {{label}}",
          },
        },
        expert: {
          title: "Mode expert",
          description: "Ajouter des dons en titres-restaurant",
          enable: "Activer",
          disable: "Désactiver",
          faceValue: "Valeur faciale d'un TR",
          quantity: "Nombre de TR donnés",
          employerRate: "% part employeur",
          employeeRate: "% part salarié",
          helper: "La somme des pourcentages employeur + salarié doit être égale à 100 %. Les montants sont annualisés selon la fréquence.",
        },
      },
      summary: {
        title: "Synthèse",
        description: "Visualisez le don optimal, l'économie d'impôt et le coût réel.",
        periodic: {
          once: "ponctuel",
          monthly: "par mois",
        },
        labels: {
          donationAnnual: "Don total annuel",
          donationPeriodic: "Don {{label}}",
          reduction: "Réduction totale",
          costAfter: "Coût après réduction",
          base75: "Base 75 %",
          base66: "Base 66 %",
        },
        costBreakdown: {
          title: "Coût détaillé",
          before: "Montant payé avant impôt",
          employeeTR: "Part salarié (TR)",
          employerTR: "Part employeur (TR)",
          includingEmployer: "Coût incluant la part employeur",
          reduction: "Réduction d'impôt",
          after: "Coût réel pour vous",
        },
        progress: {
          cap75: "Plafond 75 % utilisé",
          cap75Label: "Plafond annuel : {{amount}}",
          cap20: "Plafond global (20 % du revenu)",
          cap20Label: "Limite actuelle : {{amount}}",
        },
        tr: {
          title: "Titres-restaurant",
          detail: "{{quantity}} titres à {{face}} chacun, soit {{nominal}} pris en compte dans le calcul.",
        },
        warnings: {
          title: "Points d'attention",
          objective_unreachable: "Le coût visé dépasse ce que permet votre revenu cette année.",
          objective_unreachable_low: "Le coût demandé est plus faible que 0 €, il est donc déjà atteint.",
          tr_split_invalid: "Les pourcentages employeur / salarié ne totalisent pas 100 %. Ils ont été normalisés automatiquement.",
          cap20_reached: "Le plafond global de 20 % du revenu imposable est atteint : l'excédent part en report.",
        },
        info: {
          title: "À savoir",
          report: "Le surplus au-dessus de 20 % est reportable sur les 5 prochaines années.",
          tr_not_fully_used: "Tous les titres-restaurant saisis ne sont pas utilisés dans le don (cible plus faible).",
        },
        objectiveNotReached: "Objectif de coût difficile à atteindre (cible : {{target}}). Les plafonds fiscaux limitent le résultat.",
      },
      details: {
        title: "Détails du calcul",
        show: "Afficher",
        hide: "Masquer",
        intro: "Étapes appliquées à votre don pour déterminer la réduction d'impôt.",
        steps: {
          base75: "Base 75 % : min(plafond, don) = {{base75}}",
          base66: "Base 66 % : reste des dons = {{base66}}",
          cap20: "Plafond global : 20 % × revenu = {{cap20}}",
          baseRetained: "Base retenue après plafonds : {{donation}} limité à {{cap20}} = {{base75}} + {{base66}}",
          reduction: "Réduction : 75 % × base 75 + 66 % × base 66 = {{reduction}}",
          cost: "Coût net : don − réduction",
        },
        report: "Report futur : {{report}} seront imputables sur les 5 prochaines années.",
        note: "Résultats basés sur les règles fiscales en vigueur pour l'année sélectionnée.",
      },
      calculationInfo: {
        aria: "Comprendre les règles de calcul",
        toggle: "Comprendre les règles fiscales",
        sectionTitle: "Comment fonctionne la réduction d'impôt",
        rulesTitle: "Repères clés",
        rulesList: [
          "Les dons aux organismes d'aide aux personnes en difficulté sont déductibles à 75 % jusqu'au plafond annuel.",
          "Au-delà, les dons éligibles sont déductibles à 66 %, dans la limite de 20 % du revenu imposable.",
          "L'excédent au-delà des 20 % est reportable sur 5 ans.",
        ],
        objectivesTitle: "Objectifs proposés",
        objectivesText: "Choisissez un mode de calcul pour ajuster votre effort de don.",
        objectivesList: [
          "Maximiser l'avantage fiscal remplit automatiquement le plafond global.",
          "Donner un montant fixe calcule l'économie et le coût réel associés.",
          "Viser un coût net réalise une recherche numérique pour approcher votre cible.",
        ],
        expertTitle: "Mode expert",
        expertText: "Vous pouvez ajouter des titres-restaurant donnés. Le calcul distingue la part employeur et salarié pour plus de transparence.",
        expertNote: "Rappel : les titres-restaurant donnés sont évalués en valeur faciale.",
        reminderTitle: "À retenir",
        reminderList: [
          "Le calcul est purement indicatif et ne remplace pas un conseil fiscal personnalisé.",
          "Les montants sont annualisés si vous choisissez une fréquence mensuelle.",
          "Aucune donnée n'est envoyée : tout reste dans votre navigateur.",
        ],
        detailsLink: "Voir le détail des formules",
      },
      context: {
        title: "Bonus pédagogique",
        pas: "Le prélèvement à la source ne supprime pas la réduction : elle vient en restitution lors de la déclaration annuelle.",
        report: "En cas de report, notez les montants pour les déclarations des 5 prochaines années.",
      },
      glossary: {
        title: "Glossaire",
        aria: "Glossaire des termes utilisés",
        terms: [
          { term: "Plafond 75 %", description: "Montant annuel de dons éligibles à la réduction de 75 %." },
          { term: "Plafond 20 %", description: "Limite globale : la somme des bases 75 % et 66 % ne peut pas dépasser 20 % du revenu imposable." },
          { term: "Report", description: "Part du don excédant le plafond global, utilisable sur les 5 années suivantes." },
          { term: "Titres-restaurant", description: "Avantage en nature dont la valeur faciale est partagée entre employeur et salarié." },
        ],
      },
    },
  },
  en: {
    translation: {
      languages: {
        switch: "EN / FR",
      },
      header: {
        title: "🎁 Fais des dons — tax helper",
        description:
          "Fine-tune donations with detailed objectives, frequencies and the expert mode for advanced simulations.",
        simpleDescription:
          "Enter your taxable income and instantly visualise donation ideas alongside the tax reduction.",
        simpleMode: "Simple mode",
        advancedMode: "Expert mode",
        disclaimer: "Educational tool — no data is sent anywhere.",
        github: "GitHub",
      },
      appearance: {
        toggleTitle: "Switch appearance mode",
        toggleAria: "Toggle to {{mode}}",
        lightMode: "Light mode",
        darkMode: "Dark mode",
      },
      actions: {
        copyLink: "Copy link",
        copyLinkSuccess: "Link copied to clipboard.",
        copyLinkError: "Unable to copy link automatically.",
        copySummary: "Copy results",
        copySummarySuccess: "Summary copied to clipboard.",
        copySummaryError: "Unable to copy summary.",
        exportCsv: "Export CSV",
        print: "Print / PDF",
        reset: "Reset",
      },
      simple: {
        title: "Your quick simulation",
        description:
          "Enter your taxable income to instantly see how much to give and what it really costs after the tax break.",
        incomeLabel: "Your annual taxable income",
        incomeHelper: "You will find it on your French tax notice under “revenu imposable”.",
        emptyState:
          "Fill in your taxable income to discover donation ideas and the matching tax reduction.",
        cards: {
          monthly: {
            title: "If you donate every month",
            amount: "{{amount}} / month",
            detail: "Which is {{annual}} per year.",
            subAmount: "≈ {{amount}} returned each month",
            realCostPerMonth: "Real cost: {{amount}} / month",
            explanation:
              "You give {{donationMonthly}} per month ({{donation}} per year). The State gives you back {{reductionMonthly}} per month, i.e. {{reduction}} per year. In the end it really costs {{costMonthly}} per month ({{cost}} per year).",
          },
          once: {
            title: "If you donate once",
            detail: "A one-off donation of {{amount}}.",
            explanation:
              "You donate {{donation}} in one go. The State gives you back {{reduction}}, so the real cost is only {{cost}}.",
          },
          associationReceives: "Charities receive",
          taxReduction: "Estimated tax reduction",
          realCost: "What it really costs you",
          reductionRate: "Covered by the State",
        },
        caps: {
          title: "Your tax ceilings",
          line75: "75% rate up to {{amount}}",
          line20: "66% rate within {{amount}} (20% of your income)",
        },
        advancedCta:
          "Need another objective, a different frequency or meal vouchers? Switch to expert mode.",
        switchAdvanced: "Open expert mode",
      },
      parameters: {
        title: "Parameters",
        description: "Enter your taxable income, pick an objective and optionally add meal vouchers.",
        year: "Tax year",
        income: "Taxable income",
        frequency: {
          title: "Frequency",
          once: "One-off",
          monthly: "Monthly",
        },
        objectives: {
          max: {
            title: "Maximise tax benefit",
            description: "Automatically fills the 20 % global cap based on your income.",
          },
          brut: {
            title: "Donate a given amount",
            description: "Set a gross donation (cash + vouchers). Caps are applied automatically.",
            amount: "Amount {{label}}",
          },
          net: {
            title: "Target a net cost",
            description: "Find the donation that matches the net cost after tax deduction.",
            amount: "Target cost {{label}}",
          },
        },
        expert: {
          title: "Expert mode",
          description: "Add meal vouchers",
          enable: "Enable",
          disable: "Disable",
          faceValue: "Voucher face value",
          quantity: "Number of vouchers",
          employerRate: "% employer share",
          employeeRate: "% employee share",
          helper: "Employer and employee percentages should sum to 100 %. Amounts are annualised using the selected frequency.",
        },
      },
      summary: {
        title: "Summary",
        description: "Overview of the optimal donation, tax savings and net cost.",
        periodic: {
          once: "one-off",
          monthly: "per month",
        },
        labels: {
          donationAnnual: "Total donation (year)",
          donationPeriodic: "Donation {{label}}",
          reduction: "Tax reduction",
          costAfter: "Net cost",
          base75: "75 % base",
          base66: "66 % base",
        },
        costBreakdown: {
          title: "Cost breakdown",
          before: "Amount paid before tax",
          employeeTR: "Employee share (vouchers)",
          employerTR: "Employer share (vouchers)",
          includingEmployer: "Cost including employer share",
          reduction: "Tax reduction",
          after: "Net cost for you",
        },
        progress: {
          cap75: "75 % cap usage",
          cap75Label: "Annual cap: {{amount}}",
          cap20: "Global 20 % cap",
          cap20Label: "Current limit: {{amount}}",
        },
        tr: {
          title: "Meal vouchers",
          detail: "{{quantity}} vouchers at {{face}} each, i.e. {{nominal}} taken into account.",
        },
        warnings: {
          title: "Warnings",
          objective_unreachable: "The requested net cost is higher than what the current income allows.",
          objective_unreachable_low: "Requested cost is below zero and is therefore already reached.",
          tr_split_invalid: "Employer / employee percentages do not sum to 100 %. Values were normalised.",
          cap20_reached: "The 20 % global cap is reached: the excess goes to future carry-over.",
        },
        info: {
          title: "Keep in mind",
          report: "Any amount above the global cap can be carried forward for 5 years.",
          tr_not_fully_used: "Not all meal vouchers are used because the target donation is lower.",
        },
        objectiveNotReached: "Net cost target is difficult to reach (target: {{target}}). Fiscal caps limit the result.",
      },
      details: {
        title: "Calculation details",
        show: "Show",
        hide: "Hide",
        intro: "Steps applied to your donation to compute the tax reduction.",
        steps: {
          base75: "75 % base: min(cap, donation) = {{base75}}",
          base66: "66 % base: remaining donation = {{base66}}",
          cap20: "Global cap: 20 % × income = {{cap20}}",
          baseRetained: "Retained base after caps: {{donation}} limited to {{cap20}} = {{base75}} + {{base66}}",
          reduction: "Reduction: 75 % × base 75 + 66 % × base 66 = {{reduction}}",
          cost: "Net cost: donation − reduction",
        },
        report: "Carry-over: {{report}} can be used over the next 5 years.",
        note: "Figures are based on the selected tax year.",
      },
      calculationInfo: {
        aria: "Understand how the calculator works",
        toggle: "Understand the rules",
        sectionTitle: "How the tax deduction works",
        rulesTitle: "Key rules",
        rulesList: [
          "Donations to eligible charities benefit from a 75 % deduction up to the annual cap.",
          "Beyond that, donations are deductible at 66 % within the 20 % income limit.",
          "Any excess over the 20 % cap can be carried forward for 5 years.",
        ],
        objectivesTitle: "Objectives",
        objectivesText: "Pick a mode to match your donation strategy.",
        objectivesList: [
          "Maximise tax benefit fills the global cap automatically.",
          "Donate a fixed amount computes the related tax savings and net cost.",
          "Target a net cost runs a numeric search to get close to your target.",
        ],
        expertTitle: "Expert mode",
        expertText: "Add meal vouchers to split the employer and employee contributions.",
        expertNote: "Meal vouchers are accounted for using their face value.",
        reminderTitle: "Remember",
        reminderList: [
          "This tool is informative only and does not replace personalised advice.",
          "Amounts are annualised when you pick a monthly frequency.",
          "Everything stays on your device; nothing is sent to a server.",
        ],
        detailsLink: "See formula details",
      },
      context: {
        title: "Extra notes",
        pas: "Pay-as-you-earn does not cancel the deduction: the refund is applied when you file your tax return.",
        report: "If you generate a carry-over, keep a note for the next 5 tax returns.",
      },
      glossary: {
        title: "Glossary",
        aria: "Glossary",
        terms: [
          { term: "75 % cap", description: "Annual amount eligible for the 75 % deduction." },
          { term: "20 % cap", description: "Global limit: the sum of 75 % and 66 % bases cannot exceed 20 % of income." },
          { term: "Carry-over", description: "Donation amount above the cap that can be carried over for 5 years." },
          { term: "Meal vouchers", description: "Benefit in kind shared between employer and employee using the face value." },
        ],
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng,
  interpolation: { escapeValue: false },
});

i18n.on("languageChanged", (lng) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, lng);
});

export default i18n;


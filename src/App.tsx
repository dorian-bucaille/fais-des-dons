import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "./components/InputField";
import { SummaryCard } from "./components/SummaryCard";
import { DetailsCard, type DetailsCardHandle } from "./components/DetailsCard";
import { CalculationInfoCard } from "./components/CalculationInfoCard";
import { GlossaryButton } from "./components/GlossaryButton";
import { calculate } from "./lib/calc";
import { loadState, saveState } from "./lib/storage";
import type { Inputs, ObjectiveInput, ObjectiveType } from "./lib/types";
import { useCollapse } from "./hooks/useCollapse";
import "./styles.css";

const DEFAULTS: Inputs = {
  year: 2025,
  taxableIncome: 0,
  frequency: "once",
  objective: { type: "max_advantage" },
  expertMode: false,
  trFaceValue: 8.5,
  trQuantity: 0,
  trEmployerRate: 60,
  trEmployeeRate: 40,
};

const sanitizeNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseObjectiveParam = (raw: string | null, defaults: Inputs): ObjectiveInput => {
  if (!raw) return defaults.objective;
  if (raw === "max") {
    return { type: "max_advantage" };
  }
  if (raw.startsWith("brut:")) {
    const amount = Number(raw.slice(5));
    return { type: "donation_target", amount: Number.isFinite(amount) ? amount : 0 };
  }
  if (raw.startsWith("net:")) {
    const cost = Number(raw.slice(4));
    return { type: "net_cost_target", cost: Number.isFinite(cost) ? cost : 0 };
  }
  if (raw.startsWith("cout:")) {
    const cost = Number(raw.slice(5));
    return { type: "net_cost_target", cost: Number.isFinite(cost) ? cost : 0 };
  }
  return defaults.objective;
};

const parseTrParam = (raw: string | null, base: Inputs) => {
  if (!raw) return base;
  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const next = { ...base };
  for (const part of parts) {
    if (!part.includes("=")) {
      next.expertMode = part === "1" || part.toLowerCase() === "true";
      continue;
    }
    const [key, value] = part.split("=");
    if (!value) continue;
    const num = Number(value);
    switch (key) {
      case "v":
        if (Number.isFinite(num)) next.trFaceValue = num;
        break;
      case "q":
        if (Number.isFinite(num)) next.trQuantity = num;
        break;
      case "er":
        if (Number.isFinite(num)) next.trEmployerRate = num * 100;
        break;
      case "sr":
        if (Number.isFinite(num)) next.trEmployeeRate = num * 100;
        break;
      case "exp":
        next.expertMode = value === "1" || value.toLowerCase() === "true";
        break;
      default:
        break;
    }
  }
  return next;
};

const parseQuery = (defaults: Inputs): Inputs => {
  if (typeof window === "undefined") return defaults;
  const url = new URL(window.location.href);
  const params = url.searchParams;
  let parsed: Inputs = { ...defaults };

  parsed.year = Math.round(sanitizeNumber(params.get("y"), defaults.year));
  if (!Number.isFinite(parsed.year) || parsed.year <= 0) {
    parsed.year = defaults.year;
  }

  parsed.taxableIncome = Math.max(0, sanitizeNumber(params.get("ri"), defaults.taxableIncome));

  const freqParam = params.get("per");
  if (freqParam === "mensuel") parsed.frequency = "monthly";
  else if (freqParam === "ponctuel") parsed.frequency = "once";

  parsed.objective = parseObjectiveParam(params.get("o"), parsed);

  parsed = parseTrParam(params.get("tr"), parsed);

  const expertParam = params.get("exp");
  if (expertParam !== null) {
    parsed.expertMode = expertParam === "1" || expertParam.toLowerCase() === "true";
  }

  return parsed;
};

const toQuery = (inputs: Inputs) => {
  const params = new URLSearchParams();
  params.set("y", String(inputs.year));
  params.set("ri", String(Math.max(0, Math.round(inputs.taxableIncome))));
  params.set("per", inputs.frequency === "monthly" ? "mensuel" : "ponctuel");
  let objectiveValue = "max";
  if (inputs.objective.type === "donation_target") {
    objectiveValue = `brut:${inputs.objective.amount}`;
  } else if (inputs.objective.type === "net_cost_target") {
    objectiveValue = `net:${inputs.objective.cost}`;
  }
  params.set("o", objectiveValue);
  const trParts = [inputs.expertMode ? "1" : "0"];
  trParts.push(`v=${inputs.trFaceValue}`);
  trParts.push(`q=${inputs.trQuantity}`);
  trParts.push(`er=${inputs.trEmployerRate / 100}`);
  trParts.push(`sr=${inputs.trEmployeeRate / 100}`);
  params.set("tr", trParts.join(","));
  params.set("exp", inputs.expertMode ? "1" : "0");
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

const formatEuro = (value: number, locale: string) =>
  new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }).format(value);

const createSummaryText = (inputs: Inputs, locale: string) => {
  const result = calculate(inputs);
  const lines = [
    `Année fiscale : ${result.config.year}`,
    `Revenu imposable : ${formatEuro(result.inputs.taxableIncome, locale)}`,
    `Don total : ${formatEuro(result.donation.total, locale)} (${formatEuro(result.donation.totalPeriodic, locale)} ${
      result.inputs.frequency === "monthly" ? "/ mois" : "ponctuel"
    })`,
    `Réduction d'impôt : ${formatEuro(result.details.reduction, locale)}`,
    `Coût réel après réduction : ${formatEuro(result.costs.afterReduction, locale)}`,
    `Base 75 % : ${formatEuro(result.details.base75, locale)}`,
    `Base 66 % : ${formatEuro(result.details.base66, locale)}`,
    `Report éventuel : ${formatEuro(result.details.report, locale)}`,
  ];
  if (result.tr.enabled) {
    lines.push(
      `Titres-restaurant utilisés : ${formatEuro(result.donation.trUsed, locale)} (part salarié ${formatEuro(
        result.tr.employeePart,
        locale,
      )}, part employeur ${formatEuro(result.tr.employerPart, locale)})`,
    );
  }
  return lines.join("\n");
};

const downloadCsv = (inputs: Inputs, locale: string) => {
  const result = calculate(inputs);
  const rows = [
    ["annee", "revenu", "base75", "base66", "reduction", "cout_reel", "report"],
    [
      result.config.year,
      result.inputs.taxableIncome,
      result.details.base75,
      result.details.base66,
      result.details.reduction,
      result.costs.afterReduction,
      result.details.report,
    ],
  ];
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          if (typeof cell === "number") {
            return new Intl.NumberFormat(locale, { useGrouping: false, maximumFractionDigits: 2 }).format(cell);
          }
          return String(cell);
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `fais-des-dons-${result.config.year}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export default function App() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith("fr") ? "fr-FR" : "en-GB";
  const [inputs, setInputs] = useState<Inputs>(() => {
    const stored = loadState(DEFAULTS);
    return parseQuery(stored);
  });
  const [copied, setCopied] = useState<string | null>(null);
  const detailsRef = useRef<DetailsCardHandle>(null);
  const expertRef = useCollapse(inputs.expertMode);

  useEffect(() => {
    saveState(inputs);
  }, [inputs]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = toQuery(inputs);
    window.history.replaceState(null, "", url);
  }, [inputs]);

  const result = useMemo(() => calculate(inputs), [inputs]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleObjectiveChange = (type: ObjectiveType) => {
    setInputs((prev) => {
      if (type === "max_advantage") return { ...prev, objective: { type } };
      if (type === "donation_target") {
        const amount = prev.objective.type === "donation_target" ? prev.objective.amount : 100;
        return { ...prev, objective: { type, amount } };
      }
      const cost = prev.objective.type === "net_cost_target" ? prev.objective.cost : 100;
      return { ...prev, objective: { type, cost } };
    });
  };

  const handleCopyLink = async () => {
    try {
      const url = toQuery(inputs);
      await navigator.clipboard.writeText(url);
      setCopied(t("actions.copyLinkSuccess"));
    } catch {
      setCopied(t("actions.copyLinkError"));
    }
  };

  const handleCopySummary = async () => {
    try {
      const summary = createSummaryText(inputs, locale);
      await navigator.clipboard.writeText(summary);
      setCopied(t("actions.copySummarySuccess"));
    } catch {
      setCopied(t("actions.copySummaryError"));
    }
  };

  const handleExportCsv = () => downloadCsv(inputs, locale);

  const reset = () => setInputs({ ...DEFAULTS });

  return (
    <div className="pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">{t("header.title")}</h1>
              <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-300">{t("header.description")}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{t("header.disclaimer")}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr")}
              >
                {t("languages.switch")}
              </button>
              <GlossaryButton />
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
            <button type="button" className="btn btn-primary no-print" onClick={handleCopyLink}>
              {t("actions.copyLink")}
            </button>
            <button type="button" className="btn btn-ghost no-print" onClick={handleCopySummary}>
              {t("actions.copySummary")}
            </button>
            <button type="button" className="btn btn-ghost no-print" onClick={handleExportCsv}>
              {t("actions.exportCsv")}
            </button>
            <button type="button" className="btn btn-ghost no-print" onClick={() => window.print()}>
              {t("actions.print")}
            </button>
            <button type="button" className="btn btn-ghost no-print" onClick={reset}>
              {t("actions.reset")}
            </button>
          </div>
          {copied ? <div className="text-sm font-medium text-emerald-600 dark:text-emerald-300">{copied}</div> : null}
        </header>

        <section className="card space-y-6" id="parameters">
          <header className="space-y-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("parameters.title")}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t("parameters.description")}</p>
          </header>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InputField
              id="year"
              label={t("parameters.year")}
              value={inputs.year}
              onChange={(value) => setInputs((prev) => ({ ...prev, year: Math.round(value) || prev.year }))}
              min={2005}
              max={2100}
            />
            <InputField
              id="income"
              label={t("parameters.income")}
              value={inputs.taxableIncome}
              onChange={(value) => setInputs((prev) => ({ ...prev, taxableIncome: Math.max(0, value) }))}
              min={0}
              step={100}
              suffix="€"
            />
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{t("parameters.frequency.title")}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn btn-ghost flex-1 ${inputs.frequency === "once" ? "ring-2 ring-rose-400/60" : ""}`}
                  onClick={() => setInputs((prev) => ({ ...prev, frequency: "once" }))}
                >
                  {t("parameters.frequency.once")}
                </button>
                <button
                  type="button"
                  className={`btn btn-ghost flex-1 ${inputs.frequency === "monthly" ? "ring-2 ring-rose-400/60" : ""}`}
                  onClick={() => setInputs((prev) => ({ ...prev, frequency: "monthly" }))}
                >
                  {t("parameters.frequency.monthly")}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {([
              {
                type: "max_advantage" as ObjectiveType,
                title: t("parameters.objectives.max.title"),
                description: t("parameters.objectives.max.description"),
              },
              {
                type: "donation_target" as ObjectiveType,
                title: t("parameters.objectives.brut.title"),
                description: t("parameters.objectives.brut.description"),
              },
              {
                type: "net_cost_target" as ObjectiveType,
                title: t("parameters.objectives.net.title"),
                description: t("parameters.objectives.net.description"),
              },
            ] satisfies Array<{ type: ObjectiveType; title: string; description: string }>).map((option) => (
              <label key={option.type} className="mode-option">
                <input
                  type="radio"
                  name="objective"
                  className="mode-option__input"
                  checked={inputs.objective.type === option.type}
                  onChange={() => handleObjectiveChange(option.type)}
                />
                <div className="mode-option__content">
                  <span className="mode-option__title">{option.title}</span>
                  <span className="mode-option__description">{option.description}</span>
                  {option.type === "donation_target" && inputs.objective.type === "donation_target" ? (
                    <div className="mt-2">
                      <InputField
                        id="donation-amount"
                        label={t("parameters.objectives.brut.amount", {
                          label: inputs.frequency === "monthly" ? t("parameters.frequency.monthly") : t("parameters.frequency.once"),
                        })}
                        value={inputs.objective.amount}
                        onChange={(value) =>
                          setInputs((prev) => ({
                            ...prev,
                            objective: { type: "donation_target", amount: Math.max(0, value) },
                          }))
                        }
                        min={0}
                        suffix="€"
                      />
                    </div>
                  ) : null}
                  {option.type === "net_cost_target" && inputs.objective.type === "net_cost_target" ? (
                    <div className="mt-2">
                      <InputField
                        id="net-cost"
                        label={t("parameters.objectives.net.amount", {
                          label: inputs.frequency === "monthly" ? t("parameters.frequency.monthly") : t("parameters.frequency.once"),
                        })}
                        value={inputs.objective.cost}
                        onChange={(value) =>
                          setInputs((prev) => ({
                            ...prev,
                            objective: { type: "net_cost_target", cost: Math.max(0, value) },
                          }))
                        }
                        min={0}
                        suffix="€"
                      />
                    </div>
                  ) : null}
                </div>
              </label>
            ))}
          </div>

          <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">{t("parameters.expert.title")}</h3>
                <p className="text-xs text-indigo-900/70 dark:text-indigo-100/80">{t("parameters.expert.description")}</p>
              </div>
              <button
                type="button"
                className={`btn btn-ghost ${inputs.expertMode ? "ring-2 ring-indigo-500/60" : ""}`}
                onClick={() => setInputs((prev) => ({ ...prev, expertMode: !prev.expertMode }))}
                aria-expanded={inputs.expertMode}
              >
                {inputs.expertMode ? t("parameters.expert.disable") : t("parameters.expert.enable")}
              </button>
            </div>
            <div
              ref={expertRef}
              className="mt-4 grid gap-3 overflow-hidden text-sm"
              style={{ maxHeight: "0px", opacity: 0, transform: "translateY(-0.5rem)" }}
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <InputField
                  id="tr-face"
                  label={t("parameters.expert.faceValue")}
                  value={inputs.trFaceValue}
                  onChange={(value) => setInputs((prev) => ({ ...prev, trFaceValue: Math.max(0, value) }))}
                  min={0}
                  step={0.1}
                  suffix="€"
                />
                <InputField
                  id="tr-quantity"
                  label={t("parameters.expert.quantity")}
                  value={inputs.trQuantity}
                  onChange={(value) => setInputs((prev) => ({ ...prev, trQuantity: Math.max(0, value) }))}
                  min={0}
                  step={1}
                />
                <InputField
                  id="tr-employer"
                  label={t("parameters.expert.employerRate")}
                  value={inputs.trEmployerRate}
                  onChange={(value) => setInputs((prev) => ({ ...prev, trEmployerRate: Math.max(0, value) }))}
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                />
                <InputField
                  id="tr-employee"
                  label={t("parameters.expert.employeeRate")}
                  value={inputs.trEmployeeRate}
                  onChange={(value) => setInputs((prev) => ({ ...prev, trEmployeeRate: Math.max(0, value) }))}
                  min={0}
                  max={100}
                  step={1}
                  suffix="%"
                />
              </div>
              <p className="text-xs text-indigo-900/70 dark:text-indigo-100/80">
                {t("parameters.expert.helper")}
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <SummaryCard result={result} />
          <div className="flex flex-col gap-6">
            <CalculationInfoCard onRequestDetails={() => detailsRef.current?.openAndFocus()} />
            <section className="card space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{t("context.title")}</h2>
              <p>{t("context.pas")}</p>
              <p>{t("context.report")}</p>
            </section>
          </div>
        </div>

        <DetailsCard ref={detailsRef} result={result} />
      </div>
    </div>
  );
}


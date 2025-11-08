import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { InputField } from "./InputField";
import { calculate, getTaxConfig } from "../lib/calc";
import { euro, pct } from "../lib/format";
import type { Inputs, Result } from "../lib/types";
import { DEFAULT_INPUTS } from "../lib/defaults";

type Props = {
  inputs: Inputs;
  onIncomeChange: (income: number) => void;
  onSwitchAdvanced: () => void;
};

const SimpleSuggestion: React.FC<{ result: Result; variant: "monthly" | "once" }> = ({ result, variant }) => {
  const { t } = useTranslation();
  const donation = result.donation.total;
  const donationPeriodic = result.donation.totalPeriodic;
  const reduction = result.details.reduction;
  const reductionPeriodic = result.multiplier > 0 ? reduction / result.multiplier : reduction;
  const netCost = result.costs.afterReduction;
  const netCostPeriodic = result.multiplier > 0 ? netCost / result.multiplier : netCost;
  const reductionRate = donation > 0 ? reduction / donation : 0;

  return (
    <article className="flex h-full flex-col gap-4 rounded-3xl border border-emerald-200/70 bg-white/95 p-6 shadow-sm transition-colors duration-300 ease-out dark:border-emerald-500/40 dark:bg-gray-900/60">
      <header className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
          {t(`simple.cards.${variant}.title`)}
        </span>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {variant === "monthly"
            ? t("simple.cards.monthly.amount", { amount: euro(donationPeriodic) })
            : euro(donation)}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {variant === "monthly"
            ? t("simple.cards.monthly.detail", { annual: euro(donation) })
            : t("simple.cards.once.detail", { amount: euro(donation) })}
        </p>
      </header>

      <dl className="space-y-3 rounded-2xl border border-emerald-100/80 bg-emerald-50/70 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
        <div className="flex justify-between gap-4">
          <dt className="font-medium">{t("simple.cards.associationReceives")}</dt>
          <dd className="text-right font-semibold">{euro(donation)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-medium">{t("simple.cards.taxReduction")}</dt>
          <dd className="flex flex-col items-end font-semibold text-emerald-700 dark:text-emerald-200">
            <span>{euro(reduction)}</span>
            {variant === "monthly" ? (
              <span className="text-xs font-medium text-emerald-700/70 dark:text-emerald-200/70">
                {t("simple.cards.monthly.subAmount", { amount: euro(reductionPeriodic) })}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="font-medium">{t("simple.cards.realCost")}</dt>
          <dd className="flex flex-col items-end text-emerald-700 dark:text-emerald-200">
            <span className="text-2xl font-bold">{euro(netCost)}</span>
            {variant === "monthly" ? (
              <span className="text-xs font-semibold text-emerald-700/70 dark:text-emerald-200/70">
                {t("simple.cards.monthly.realCostPerMonth", { amount: euro(netCostPeriodic) })}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="flex justify-between gap-4 text-xs uppercase tracking-wide text-emerald-700/80 dark:text-emerald-200/70">
          <dt>{t("simple.cards.reductionRate")}</dt>
          <dd className="font-semibold">{pct(reductionRate)}</dd>
        </div>
      </dl>

      <p className="text-sm text-gray-600 dark:text-gray-300">
        {variant === "monthly"
          ? t("simple.cards.monthly.explanation", {
              donation: euro(donation),
              donationMonthly: euro(donationPeriodic),
              reduction: euro(reduction),
              reductionMonthly: euro(reductionPeriodic),
              cost: euro(netCost),
              costMonthly: euro(netCostPeriodic),
            })
          : t("simple.cards.once.explanation", {
              donation: euro(donation),
              reduction: euro(reduction),
              cost: euro(netCost),
            })}
      </p>
    </article>
  );
};

export const SimpleMode: React.FC<Props> = ({ inputs, onIncomeChange, onSwitchAdvanced }) => {
  const { t } = useTranslation();
  const { year, taxableIncome } = inputs;

  const monthlyResult = useMemo(
    () =>
      calculate({
        ...DEFAULT_INPUTS,
        year,
        taxableIncome,
        frequency: "monthly",
        objective: { type: "max_advantage" },
        expertMode: false,
        trFaceValue: 0,
        trQuantity: 0,
        trEmployerRate: 0,
        trEmployeeRate: 100,
      }),
    [taxableIncome, year],
  );

  const onceResult = useMemo(
    () =>
      calculate({
        ...DEFAULT_INPUTS,
        year,
        taxableIncome,
        frequency: "once",
        objective: { type: "max_advantage" },
        expertMode: false,
        trFaceValue: 0,
        trQuantity: 0,
        trEmployerRate: 0,
        trEmployeeRate: 100,
      }),
    [taxableIncome, year],
  );

  const config = getTaxConfig(year);
  const cap20 = taxableIncome * config.cap20Rate;
  const cap75 = Math.min(config.cap75Euros, cap20);
  const hasIncome = taxableIncome > 0;

  return (
    <section className="card space-y-6" id="simple-mode">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("simple.title")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("simple.description")}</p>
      </header>

      <div className="grid gap-4 md:max-w-md">
        <InputField
          id="simple-income"
          label={t("simple.incomeLabel")}
          value={inputs.taxableIncome}
          onChange={(value) => onIncomeChange(Math.max(0, value))}
          min={0}
          step={100}
          suffix="€"
          tooltip={t("simple.incomeHelper")}
        />
      </div>

      {hasIncome ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <SimpleSuggestion result={monthlyResult} variant="monthly" />
          <SimpleSuggestion result={onceResult} variant="once" />
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-emerald-200/70 bg-emerald-50/60 p-4 text-sm text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-100">
          {t("simple.emptyState")}
        </p>
      )}

      <div className="rounded-2xl border border-gray-200/80 bg-white/70 p-4 text-sm text-gray-700 shadow-sm dark:border-gray-700/60 dark:bg-gray-900/40 dark:text-gray-200">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t("simple.caps.title")}
        </h3>
        <ul className="mt-3 space-y-1">
          <li>{t("simple.caps.line75", { amount: euro(cap75) })}</li>
          <li>{t("simple.caps.line20", { amount: euro(cap20) })}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-4 text-sm text-indigo-900 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-100">
        <p>{t("simple.advancedCta")}</p>
        <button type="button" className="btn btn-ghost self-start" onClick={onSwitchAdvanced}>
          {t("simple.switchAdvanced")}
        </button>
      </div>
    </section>
  );
};

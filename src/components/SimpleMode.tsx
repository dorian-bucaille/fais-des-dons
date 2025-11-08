import React, { useEffect, useMemo, useState } from "react";
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

const SimpleSummary: React.FC<{ result: Result; variant: "monthly" | "once" }> = ({ result, variant }) => {
  const { t } = useTranslation();
  const donation = result.donation.total;
  const donationPeriodic = result.donation.totalPeriodic;
  const reduction = result.details.reduction;
  const reductionPeriodic = result.multiplier > 0 ? reduction / result.multiplier : reduction;
  const netCost = result.costs.afterReduction;
  const netCostPeriodic = result.multiplier > 0 ? netCost / result.multiplier : netCost;
  const reductionRate = donation > 0 ? reduction / donation : 0;
  const isMonthly = variant === "monthly";

  return (
    <article className="space-y-6 rounded-3xl border border-emerald-200/70 bg-white/95 p-6 shadow-sm transition-colors duration-300 ease-out dark:border-emerald-500/40 dark:bg-gray-900/60">
      <header className="space-y-3 rounded-2xl bg-emerald-100/80 p-5 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100">
        <span className="text-xs font-semibold uppercase tracking-wide">
          {t("simple.highlight.title")}
        </span>
        <div className="text-4xl font-black">
          {isMonthly
            ? t("simple.highlight.monthly", {
                amount: euro(netCostPeriodic),
                annual: euro(netCost),
              })
            : t("simple.highlight.once", { amount: euro(netCost) })}
        </div>
        <p className="text-sm text-emerald-900/80 dark:text-emerald-100/80">
          {isMonthly
            ? t("simple.highlight.monthlyDetail", {
                donation: euro(donationPeriodic),
                donationAnnual: euro(donation),
                reduction: euro(reductionPeriodic),
                reductionAnnual: euro(reduction),
              })
            : t("simple.highlight.onceDetail", {
                donation: euro(donation),
                reduction: euro(reduction),
                amount: euro(netCost),
              })}
        </p>
      </header>

      <dl className="space-y-4 text-sm text-gray-700 dark:text-gray-200">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {t(`simple.cards.${variant}.title`)}
          </dt>
          <dd className="text-right text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isMonthly
              ? t("simple.cards.monthly.amount", { amount: euro(donationPeriodic) })
              : euro(donation)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-medium">{t("simple.cards.associationReceives")}</dt>
          <dd className="text-right font-semibold">{euro(donation)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-medium">{t("simple.cards.taxReduction")}</dt>
          <dd className="flex flex-col items-end font-semibold text-emerald-700 dark:text-emerald-200">
            <span>{euro(reduction)}</span>
            {isMonthly ? (
              <span className="text-xs font-medium text-emerald-700/70 dark:text-emerald-200/70">
                {t("simple.cards.monthly.subAmount", { amount: euro(reductionPeriodic) })}
              </span>
            ) : null}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="font-medium">{t("simple.cards.realCost")}</dt>
          <dd className="flex flex-col items-end text-emerald-700 dark:text-emerald-200">
            <span className="text-2xl font-bold">{euro(netCost)}</span>
            {isMonthly ? (
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
        {isMonthly
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

  const monthlyMaxResult = useMemo(
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

  const onceMaxResult = useMemo(
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

  const monthlyDefault = monthlyMaxResult.donation.totalPeriodic;
  const onceDefault = onceMaxResult.donation.total;

  const [variant, setVariant] = useState<"monthly" | "once">("monthly");
  const [monthlyAmount, setMonthlyAmount] = useState(monthlyDefault);
  const [onceAmount, setOnceAmount] = useState(onceDefault);

  useEffect(() => {
    setMonthlyAmount(monthlyDefault);
  }, [monthlyDefault]);

  useEffect(() => {
    setOnceAmount(onceDefault);
  }, [onceDefault]);

  const monthlyResult = useMemo(
    () =>
      calculate({
        ...DEFAULT_INPUTS,
        year,
        taxableIncome,
        frequency: "monthly",
        objective: { type: "donation_target", amount: Math.max(0, monthlyAmount) },
        expertMode: false,
        trFaceValue: 0,
        trQuantity: 0,
        trEmployerRate: 0,
        trEmployeeRate: 100,
      }),
    [monthlyAmount, taxableIncome, year],
  );

  const onceResult = useMemo(
    () =>
      calculate({
        ...DEFAULT_INPUTS,
        year,
        taxableIncome,
        frequency: "once",
        objective: { type: "donation_target", amount: Math.max(0, onceAmount) },
        expertMode: false,
        trFaceValue: 0,
        trQuantity: 0,
        trEmployerRate: 0,
        trEmployeeRate: 100,
      }),
    [onceAmount, taxableIncome, year],
  );

  const config = getTaxConfig(year);
  const cap20 = taxableIncome * config.cap20Rate;
  const cap75 = Math.min(config.cap75Euros, cap20);
  const hasIncome = taxableIncome > 0;
  const isMonthly = variant === "monthly";
  const sliderValue = isMonthly ? monthlyAmount : onceAmount;
  const sliderMax = isMonthly
    ? Math.max(monthlyDefault * 2, monthlyDefault + 50, 50)
    : Math.max(onceDefault * 1.5, onceDefault + 1000, cap75 * 2, 500);
  const sliderStep = isMonthly ? 1 : 10;
  const selectedResult = isMonthly ? monthlyResult : onceResult;

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
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex rounded-full border border-emerald-200/70 bg-emerald-50/80 p-1 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <button
                type="button"
                className={`btn btn-ghost px-4 py-2 text-sm font-semibold transition ${
                  isMonthly ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-200" : "text-emerald-700/70 dark:text-emerald-200/70"
                }`}
                onClick={() => setVariant("monthly")}
              >
                {t("simple.toggle.monthly")}
              </button>
              <button
                type="button"
                className={`btn btn-ghost px-4 py-2 text-sm font-semibold transition ${
                  !isMonthly ? "bg-white text-emerald-700 shadow-sm dark:bg-gray-900 dark:text-emerald-200" : "text-emerald-700/70 dark:text-emerald-200/70"
                }`}
                onClick={() => setVariant("once")}
              >
                {t("simple.toggle.once")}
              </button>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-emerald-200/70 bg-white/80 p-5 shadow-sm dark:border-emerald-500/30 dark:bg-gray-900/60">
            <div className="flex items-baseline justify-between gap-4 text-sm font-medium text-gray-700 dark:text-gray-200">
              <span>{t(`simple.slider.${variant}.label`)}</span>
              <span className="text-base font-semibold text-emerald-700 dark:text-emerald-200">
                {isMonthly
                  ? t("simple.slider.monthly.value", { amount: euro(sliderValue) })
                  : t("simple.slider.once.value", { amount: euro(sliderValue) })}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={sliderMax}
              step={sliderStep}
              value={Number.isFinite(sliderValue) ? sliderValue : 0}
              onChange={(event) => {
                const value = Number(event.target.value);
                if (!Number.isFinite(value)) {
                  return;
                }
                if (isMonthly) {
                  setMonthlyAmount(value);
                } else {
                  setOnceAmount(value);
                }
              }}
              className="w-full accent-emerald-600"
              aria-label={t(`simple.slider.${variant}.label`)}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t(`simple.slider.${variant}.helper`)}
            </p>
          </div>

          <SimpleSummary result={selectedResult} variant={variant} />
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

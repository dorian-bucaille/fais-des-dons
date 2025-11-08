import React from "react";
import { useTranslation } from "react-i18next";
import { euro, pct } from "../lib/format";
import type { Result } from "../lib/types";

type Props = {
  result: Result;
};

const Stat: React.FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent = false,
}) => (
  <div
    className={`flex flex-col gap-1 rounded-2xl border p-4 text-center shadow-sm transition-colors duration-300 ease-out ${
      accent
        ? "border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-500/40 dark:bg-emerald-500/10"
        : "border-gray-200/80 bg-white/70 dark:border-gray-700/60 dark:bg-gray-900/40"
    }`}
  >
    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
      {label}
    </span>
    <span
      className={`text-xl font-semibold ${
        accent ? "text-emerald-700 dark:text-emerald-300" : "text-gray-900 dark:text-gray-100"
      }`}
    >
      {value}
    </span>
  </div>
);

const Progress: React.FC<{ label: string; ratio: number; capLabel: string }> = ({
  label,
  ratio,
  capLabel,
}) => {
  const clamped = Math.max(0, Math.min(1, Number.isFinite(ratio) ? ratio : 0));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-300">
        <span>{label}</span>
        <span>{pct(clamped)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200/80 dark:bg-gray-800/80">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500"
          style={{ width: `${clamped * 100}%` }}
          aria-hidden="true"
        />
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">{capLabel}</span>
    </div>
  );
};

export const SummaryCard: React.FC<Props> = ({ result }) => {
  const { t } = useTranslation();
  const frequencyKey = result.inputs.frequency === "monthly" ? "monthly" : "once";
  const periodicLabel = t(`summary.periodic.${frequencyKey}`);

  const infoMessages = result.infoMessages.map((code) => t(`summary.info.${code}`));
  const warningMessages = result.warnings.map((code) => t(`summary.warnings.${code}`));

  const objectiveMessage = result.objective.achieved
    ? null
    : t("summary.objectiveNotReached", {
        target: result.objective.targetAnnual ? euro(result.objective.targetAnnual) : undefined,
      });

  return (
    <section className="card space-y-6" id="summary-section">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("summary.title")}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t("summary.description")}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t("summary.labels.donationAnnual")}
          value={`${euro(result.donation.total)}`}
          accent
        />
        <Stat label={t("summary.labels.donationPeriodic", { label: periodicLabel })} value={euro(result.donation.totalPeriodic)} />
        <Stat label={t("summary.labels.reduction") } value={euro(result.details.reduction)} />
        <Stat label={t("summary.labels.costAfter") } value={euro(result.costs.afterReduction)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <Stat label={t("summary.labels.base75") } value={euro(result.details.base75)} />
            <Stat label={t("summary.labels.base66") } value={euro(result.details.base66)} />
          </div>
          <div className="rounded-2xl border border-gray-200/80 bg-white/70 p-4 shadow-sm dark:border-gray-700/60 dark:bg-gray-900/40">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("summary.costBreakdown.title")}
            </h3>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600 dark:text-gray-300">{t("summary.costBreakdown.before")}</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">{euro(result.costs.beforeReduction)}</dd>
              </div>
              {result.tr.enabled ? (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-300">{t("summary.costBreakdown.employeeTR")}</dt>
                    <dd className="font-semibold text-gray-900 dark:text-gray-100">{euro(result.tr.employeePart)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-gray-600 dark:text-gray-300">{t("summary.costBreakdown.employerTR")}</dt>
                    <dd className="font-semibold text-gray-900 dark:text-gray-100">{euro(result.tr.employerPart)}</dd>
                  </div>
                  {typeof result.costs.includingEmployer === "number" ? (
                    <div className="flex justify-between gap-4 text-sm font-semibold text-amber-700 dark:text-amber-200">
                      <dt>{t("summary.costBreakdown.includingEmployer")}</dt>
                      <dd>{euro(result.costs.includingEmployer)}</dd>
                    </div>
                  ) : null}
                </>
              ) : null}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-600 dark:text-gray-300">{t("summary.costBreakdown.reduction")}</dt>
                <dd className="font-semibold text-gray-900 dark:text-gray-100">− {euro(result.details.reduction)}</dd>
              </div>
              <div className="flex justify-between gap-4 text-base font-semibold text-emerald-700 dark:text-emerald-300">
                <dt>{t("summary.costBreakdown.after")}</dt>
                <dd>{euro(result.costs.afterReduction)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <Progress
            label={t("summary.progress.cap75")}
            ratio={result.caps.cap75Usage}
            capLabel={t("summary.progress.cap75Label", { amount: euro(result.caps.cap75) })}
          />
          <Progress
            label={t("summary.progress.cap20")}
            ratio={result.caps.cap20Usage}
            capLabel={t("summary.progress.cap20Label", { amount: euro(result.caps.cap20) })}
          />
        </div>
      </div>

      {result.tr.enabled ? (
        <div className="rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 text-sm text-indigo-900 shadow-sm dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-100">
          <h3 className="text-xs font-semibold uppercase tracking-wide">{t("summary.tr.title")}</h3>
          <p className="mt-2 text-sm">
            {t("summary.tr.detail", {
              nominal: euro(result.donation.trUsed),
              face: euro(result.tr.faceValue),
              quantity: result.tr.quantity,
            })}
          </p>
        </div>
      ) : null}

      {warningMessages.length > 0 ? (
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-sm dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
          <h3 className="text-xs font-semibold uppercase tracking-wide">{t("summary.warnings.title")}</h3>
          <ul className="mt-2 space-y-1">
            {warningMessages.map((message, index) => (
              <li key={index}>• {message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {infoMessages.length > 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-900 shadow-sm dark:border-slate-600/50 dark:bg-slate-900/40 dark:text-slate-200">
          <h3 className="text-xs font-semibold uppercase tracking-wide">{t("summary.info.title")}</h3>
          <ul className="mt-2 space-y-1">
            {infoMessages.map((message, index) => (
              <li key={index}>• {message}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {objectiveMessage ? (
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/80 p-4 text-sm text-rose-900 shadow-sm dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100">
          {objectiveMessage}
        </div>
      ) : null}
    </section>
  );
};


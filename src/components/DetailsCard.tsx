import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Result } from "../lib/types";
import { euro } from "../lib/format";
import { useCollapse } from "../hooks/useCollapse";

export type DetailsCardHandle = {
  openAndFocus: () => void;
};

type Props = {
  result: Result;
};

export const DetailsCard = forwardRef<DetailsCardHandle, Props>(({ result }, ref) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useCollapse(open);
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const toggle = () => setOpen((prev) => !prev);

  useImperativeHandle(
    ref,
    () => ({
      openAndFocus: () => {
        setOpen(true);
        window.requestAnimationFrame(() => {
          rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.setTimeout(() => headingRef.current?.focus(), 250);
        });
      },
    }),
    [],
  );

  const context = {
    base75: euro(result.details.base75),
    base66: euro(result.details.base66),
    donation: euro(result.donation.total),
    taxable: euro(result.inputs.taxableIncome),
    cap20: euro(result.caps.cap20),
    reduction: euro(result.details.reduction),
    report: euro(result.details.report),
  };

  return (
    <section ref={rootRef} className="card" id="details-section">
      <header className="flex items-center justify-between gap-3">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
        >
          {t("details.title")}
        </h2>
        <button
          type="button"
          className="no-print btn btn-ghost"
          onClick={toggle}
          aria-expanded={open}
          aria-controls="details-panel"
        >
          {open ? t("details.hide") : t("details.show")}
        </button>
      </header>

      <div
        id="details-panel"
        ref={containerRef}
        className="overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out"
        style={{ maxHeight: "0px", opacity: 0, transform: "translateY(-0.5rem)" }}
        aria-hidden={!open}
      >
        <div className="mt-3 space-y-3 text-sm">
          <p className="text-gray-600 dark:text-gray-300">{t("details.intro")}</p>
          <ul className="ml-5 list-disc space-y-2">
            <li>{t("details.steps.base75", context)}</li>
            <li>{t("details.steps.base66", context)}</li>
            <li>{t("details.steps.cap20", context)}</li>
            <li>{t("details.steps.baseRetained", context)}</li>
            <li>{t("details.steps.reduction", context)}</li>
            <li>{t("details.steps.cost", context)}</li>
          </ul>
          {result.details.report > 0 ? (
            <div className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm text-slate-900 shadow-sm dark:border-slate-600/40 dark:bg-slate-900/30 dark:text-slate-100">
              {t("details.report", context)}
            </div>
          ) : null}
          <p className="text-gray-500 dark:text-gray-400">{t("details.note")}</p>
        </div>
      </div>
    </section>
  );
});

DetailsCard.displayName = "DetailsCard";


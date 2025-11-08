import React, { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  onRequestDetails: () => void;
};

const STORAGE_KEY = "fdd:calc-info-open";

export const CalculationInfoCard: React.FC<Props> = ({ onRequestDetails }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const contentId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldFocus = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setOpen(saved === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, open ? "true" : "false");
  }, [open]);

  useEffect(() => {
    if (open && shouldFocus.current) {
      window.setTimeout(() => {
        headingRef.current?.focus();
        shouldFocus.current = false;
      }, 80);
    }
  }, [open]);

  const toggle = () => {
    if (!open) shouldFocus.current = true;
    setOpen((prev) => !prev);
  };

  return (
    <section
      className="card border-indigo-200/70 bg-indigo-50/70 shadow-sm dark:border-indigo-500/30 dark:bg-slate-900/40"
      aria-label={t("calculationInfo.aria")}
    >
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 rounded-md border border-transparent bg-white/60 px-3 py-2 text-left text-sm font-medium text-indigo-800 transition-colors duration-200 ease-out hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:bg-slate-900/70 dark:text-indigo-200 dark:hover:bg-slate-900"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className="flex items-center gap-2 text-base font-semibold">
          <span aria-hidden="true">🧮</span>
          {t("calculationInfo.toggle")}
        </span>
        <span aria-hidden="true" className={`text-lg transition-transform duration-300 ease-out ${open ? "-rotate-180" : "rotate-0"}`}>
          ▾
        </span>
      </button>

      <div
        id={contentId}
        className={`mt-4 overflow-hidden text-sm transition-[max-height,opacity,transform] duration-300 ease-out ${
          open ? "max-h-[2000px] opacity-100 translate-y-0" : "max-h-0 opacity-0 -translate-y-2"
        }`}
        aria-hidden={!open}
      >
        <div className="space-y-5">
          <h3
            ref={headingRef}
            tabIndex={-1}
            className="text-lg font-semibold text-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60 dark:text-indigo-200"
          >
            {t("calculationInfo.sectionTitle")}
          </h3>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">{t("calculationInfo.rulesTitle")}</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
              {(t("calculationInfo.rulesList") as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">{t("calculationInfo.objectivesTitle")}</h4>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{t("calculationInfo.objectivesText")}</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
              {(t("calculationInfo.objectivesList") as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">{t("calculationInfo.expertTitle")}</h4>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-200">{t("calculationInfo.expertText")}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{t("calculationInfo.expertNote")}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-200">{t("calculationInfo.reminderTitle")}</h4>
            <ul className="list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-200">
              {(t("calculationInfo.reminderList") as string[]).map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>

          {open ? (
            <div>
              <a
                href="#details-section"
                className="text-sm font-medium text-indigo-700 underline underline-offset-2 transition-colors hover:text-indigo-900 dark:text-indigo-300 dark:hover:text-indigo-200"
                onClick={(event) => {
                  event.preventDefault();
                  onRequestDetails();
                }}
              >
                {t("calculationInfo.detailsLink")}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};


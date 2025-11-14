import React from "react";
import { useTranslation } from "react-i18next";
import { GlossaryButton } from "./GlossaryButton";
import { ThemeToggle } from "./ThemeToggle";

type HeaderActionsProps = {
  titleRef: React.RefObject<HTMLHeadingElement>;
  copyTooltip: { message: string; tone: "success" | "error" } | null;
  onCopyLink: () => void | Promise<void>;
  onReset: () => void;
  onPrint: () => void;
  showGlossary: boolean;
};

export function HeaderActions({
  titleRef,
  copyTooltip,
  onCopyLink,
  onPrint,
  onReset,
  showGlossary,
}: HeaderActionsProps) {
  const { t } = useTranslation();

  return (
    <header className="rounded-3xl border border-white/70 bg-white/80 px-6 py-6 shadow-xl backdrop-blur-md transition-colors duration-300 ease-out dark:border-white/10 dark:bg-gray-900/60">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2 text-center md:text-left">
          <h1
            className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50"
            ref={titleRef}
            tabIndex={-1}
          >
            {t("header.title")}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">{t("header.description")}</p>
        </div>
        <div className="no-print flex flex-col items-center gap-3 md:items-end">
          <div className="flex flex-wrap items-center justify-center gap-2 md:justify-end">
            <LanguageSwitcher />
            <ThemeToggle />
            {showGlossary ? <GlossaryButton /> : null}
            <button onClick={onReset} className="btn btn-ghost text-rose-600 hover:text-rose-700">
              {t("actions.reset")}
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-2 md:justify-end">
            <a
              href="https://github.com/dorian-bucaille/equilibre-couple"
              className="btn btn-ghost"
              target="_blank"
              rel="noreferrer"
            >
              {t("header.github")}
            </a>
            <div className="relative">
              <button onClick={onCopyLink} className="btn btn-ghost">
                {t("actions.copyLink")}
              </button>
              {copyTooltip ? (
                <div className="pointer-events-none absolute inset-x-0 top-full mt-2 flex justify-center">
                  <span
                    role="status"
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium shadow-lg ring-1 ring-black/5 ${copyTooltip.tone === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
                  >
                    {copyTooltip.message}
                  </span>
                </div>
              ) : null}
            </div>
            <button onClick={onPrint} className="btn btn-ghost">
              {t("actions.print")}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.language.startsWith("fr") ? "fr" : "en";

  return (
    <div className="relative">
      <label htmlFor="language-select" className="sr-only">
        {t("accessibility.languageSwitcher")}
      </label>
      <select
        id="language-select"
        className="input w-28 cursor-pointer appearance-none pr-8 text-sm"
        value={current}
        onChange={(event) => {
          const next = event.target.value;
          void i18n.changeLanguage(next);
        }}
      >
        <option value="fr">{t("languages.fr")}</option>
        <option value="en">{t("languages.en")}</option>
      </select>
      <span className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-500">▾</span>
    </div>
  );
}

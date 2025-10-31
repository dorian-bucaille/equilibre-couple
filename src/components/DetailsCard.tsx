/* eslint-env browser */
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import type { Result } from "../lib/types";
import { useCollapse } from "../hooks/useCollapse";

export type DetailsCardHandle = {
  openAndFocus: () => void;
};

export const DetailsCard = forwardRef<DetailsCardHandle, { r: Result }>(({ r }, ref) => {
  const [open, setOpen] = useState(false);
  const containerRef = useCollapse(open);
  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const handleToggle = () => {
    setOpen((prev) => !prev);
  };

  useImperativeHandle(
    ref,
    () => ({
      openAndFocus: () => {
        setOpen(true);
        window.requestAnimationFrame(() => {
          rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
          window.setTimeout(() => {
            headingRef.current?.focus();
          }, 250);
        });
      },
    }),
    [],
  );

  return (
    <div ref={rootRef} className="card" id="details-section">
      <div className="flex items-center justify-between gap-3">
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="text-lg font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
        >
          Détails du calcul
        </h2>
        <button
          className="no-print btn btn-ghost"
          onClick={handleToggle}
          aria-expanded={open}
          aria-controls="details-panel"
        >
          {open ? "Masquer les détails" : "Afficher les détails"}
        </button>
      </div>

      <div
        id="details-panel"
        ref={containerRef}
        className="overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out"
        style={{ maxHeight: "0px", opacity: 0, transform: "translateY(-0.5rem)" }}
        aria-hidden={!open}
      >
        <div className="mt-3 space-y-2 text-sm">
          <ul className="list-disc ml-5">
            {r.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
          {r.warnings.length > 0 && (
            <div className="mt-3">
              <div className="font-semibold">Avertissements</div>
              <ul className="list-disc ml-5 text-amber-600">
                {r.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <p className="mt-3 text-gray-500">
            Note: les tickets resto sont comptés comme une <strong>contribution en nature</strong>.
          </p>
        </div>
      </div>
    </div>
  );
});

DetailsCard.displayName = "DetailsCard";


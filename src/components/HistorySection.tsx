import React, { useRef } from "react";
import { SummaryCard } from "./SummaryCard";
import { History, type HistoryHandle } from "./History";
import type { Inputs, SplitMode } from "../lib/types";
import type { HistoryItem } from "../lib/storage";
import type { Result } from "../lib/types";

type HistorySectionProps = {
  inputs: Inputs;
  result: Result;
  partnerAName: string;
  partnerBName: string;
  mode: SplitMode;
  onLoadHistory: (item: HistoryItem) => void;
  onHistoryCleared: () => void;
  children?: React.ReactNode;
};

export function HistorySection({
  inputs,
  result,
  partnerAName,
  partnerBName,
  mode,
  onLoadHistory,
  onHistoryCleared,
  children,
}: HistorySectionProps) {
  const historyRef = useRef<HistoryHandle>(null);

  const handleSummarySave = () => {
    historyRef.current?.addCurrentState();
  };

  const handleSummaryFocusNote = () => {
    historyRef.current?.focusNote();
  };

  return (
    <>
      <SummaryCard
        r={result}
        partnerAName={partnerAName}
        partnerBName={partnerBName}
        mode={mode}
        onSaveHistory={handleSummarySave}
        onFocusNote={handleSummaryFocusNote}
      />
      {children}
      <History
        ref={historyRef}
        inputs={inputs}
        result={result}
        onLoad={onLoadHistory}
        onRequestClearAll={onHistoryCleared}
      />
    </>
  );
}

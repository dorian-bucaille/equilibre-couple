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
  advanced: boolean;
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
  advanced,
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
        advanced={advanced}
        onSaveHistory={advanced ? handleSummarySave : undefined}
        onFocusNote={advanced ? handleSummaryFocusNote : undefined}
      />
      {advanced ? children : null}
      {advanced ? (
        <History
          ref={historyRef}
          inputs={inputs}
          result={result}
          onLoad={onLoadHistory}
          onRequestClearAll={onHistoryCleared}
        />
      ) : null}
    </>
  );
}

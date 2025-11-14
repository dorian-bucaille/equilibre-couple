import React, { useRef } from "react";
import { CalculationInfoCard } from "./CalculationInfoCard";
import { DetailsCard, type DetailsCardHandle } from "./DetailsCard";
import type { Result } from "../lib/types";

type DetailsSectionProps = {
  result: Result;
};

export function DetailsSection({ result }: DetailsSectionProps) {
  const detailsRef = useRef<DetailsCardHandle>(null);

  return (
    <>
      <CalculationInfoCard
        onRequestDetails={() => {
          detailsRef.current?.openAndFocus();
        }}
      />
      <DetailsCard ref={detailsRef} r={result} />
    </>
  );
}

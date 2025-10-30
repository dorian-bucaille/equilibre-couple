import React from "react";

export const InfoIcon: React.FC<{ title?: string }> = ({ title }) => (
  <span
    role="img"
    aria-label="aide"
    title={title}
    className="inline-block w-5 h-5 rounded-full bg-blue-600/10 text-blue-700 dark:text-blue-300 text-center align-middle cursor-help"
  >
    ?
  </span>
);

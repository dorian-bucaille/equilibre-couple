import type { Inputs, SplitMode } from "./types";
import { readNumericParam } from "./searchParams";

export const DEFAULT_INPUTS: Inputs = {
  partnerAName: "",
  partnerBName: "",
  a1: 2000,
  a2: 175,
  b2: 0,
  trPct: 100,
  b: 2000,
  m: 1500,
  advanced: false,
  E: 600,
  biasPts: 0,
  mode: "proportional",
};

export function parseInputsFromQuery(url: string, defaults: Inputs): Inputs {
  const parsedUrl = new URL(url);
  const params = parsedUrl.searchParams;
  const get = (key: keyof Inputs) => params.get(String(key));
  const getNumber = (key: keyof Inputs, fallback: number) =>
    readNumericParam(params, String(key), fallback);
  const modeParam = parsedUrl.searchParams.get("mode");
  const mode: SplitMode =
    modeParam === "equal_leftover"
      ? "equal_leftover"
      : modeParam === "proportional"
        ? "proportional"
        : defaults.mode;

  return {
    partnerAName: (parsedUrl.searchParams.get("nameA") ?? defaults.partnerAName) || "",
    partnerBName: (parsedUrl.searchParams.get("nameB") ?? defaults.partnerBName) || "",
    a1: getNumber("a1", defaults.a1),
    a2: getNumber("a2", defaults.a2),
    b2: getNumber("b2", defaults.b2),
    trPct: getNumber("trPct", defaults.trPct),
    b: getNumber("b", defaults.b),
    m: getNumber("m", defaults.m),
    advanced: get("advanced") ? get("advanced") === "1" : defaults.advanced,
    E: getNumber("E", defaults.E),
    biasPts: getNumber("biasPts", defaults.biasPts),
    mode,
  };
}

export function inputsToShareableUrl(
  inputs: Inputs,
  location: Pick<Location, "origin" | "pathname"> = window.location,
) {
  const params = new URLSearchParams();
  params.set("nameA", inputs.partnerAName);
  params.set("nameB", inputs.partnerBName);
  params.set("a1", String(inputs.a1));
  params.set("a2", String(inputs.a2));
  params.set("b2", String(inputs.b2));
  params.set("trPct", String(inputs.trPct));
  params.set("b", String(inputs.b));
  params.set("m", String(inputs.m));
  params.set("advanced", inputs.advanced ? "1" : "0");
  params.set("E", String(inputs.E));
  params.set("biasPts", String(inputs.biasPts));
  params.set("mode", inputs.mode);
  return `${location.origin}${location.pathname}?${params.toString()}`;
}

export function areInputsEqual(a: Inputs, b: Inputs) {
  const keys: (keyof Inputs)[] = [
    "partnerAName",
    "partnerBName",
    "a1",
    "a2",
    "b2",
    "trPct",
    "b",
    "m",
    "advanced",
    "E",
    "biasPts",
    "mode",
  ];

  return keys.every((key) => a[key] === b[key]);
}

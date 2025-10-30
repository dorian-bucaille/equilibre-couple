import React, { useState } from "react";
import { euro } from "../lib/format";
import { loadHistory, saveHistory, type HistoryItem } from "../lib/storage";
import type { Inputs, Result } from "../lib/types";

export const History: React.FC<{
  inputs: Inputs;
  result: Result;
}> = ({ inputs, result }) => {
  const [items, setItems] = useState<HistoryItem[]>(loadHistory());
  const [note, setNote] = useState("");

  const add = () => {
    const id = crypto.randomUUID();
    const dateISO = new Date().toISOString();
    const newItems = [{ id, dateISO, note, inputs }, ...items].slice(0, 60);
    setItems(newItems);
    saveHistory(newItems);
    setNote("");
  };

  const del = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveHistory(next);
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-2">Historique local</h2>

      <div className="no-print flex flex-col sm:flex-row gap-2 mb-3">
        <input
          placeholder="Note (ex. Octobre 2025, loyer révisé...)"
          className="flex-1 input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button onClick={add} className="btn btn-primary">
          Enregistrer
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <div className="text-sm text-gray-500">Aucun enregistrement.</div>}
        {items.map((it) => (
          <div
            key={it.id}
            className="border border-gray-200 dark:border-gray-800 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
          >
            <div>
              <div className="text-sm text-gray-500">{new Date(it.dateISO).toLocaleString("fr-FR")}</div>
              <div className="font-medium">{it.note || "(sans note)"}</div>
            </div>
            <div className="text-sm text-right">
              <div>Dépôts — D: {euro(result.depositD)} / M: {euro(result.depositM)}</div>
              <div className="text-gray-500">Cash: {euro(result.cashNeeded)} | TR: {euro(result.V)}</div>
            </div>
            <button onClick={() => del(it.id)} className="no-print btn btn-ghost">
              Suppr
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};


import { SCHEMA_VERSION, seedState } from "../domain/seed";
import type { AppState } from "../domain/types";

// Nunca apagar dados silenciosamente quando o schema mudar (PRD §19).
// Cada migration recebe o estado bruto e o eleva uma versão.
type Migration = (raw: any) => any;

const migrations: Record<number, Migration> = {
  // Exemplo para futuras versões:
  // 1: (raw) => ({ ...raw, schemaVersion: 2, novoCampo: [] }),
};

export function migrate(raw: any): AppState {
  if (!raw || typeof raw !== "object") return seedState();
  let state = raw;
  let version = typeof state.schemaVersion === "number" ? state.schemaVersion : 0;

  while (version < SCHEMA_VERSION && migrations[version]) {
    state = migrations[version](state);
    version = state.schemaVersion;
  }

  // Preenche campos ausentes com defaults do seed (aditivo, não destrutivo).
  const base = seedState();
  const merged: AppState = {
    ...base,
    ...state,
    schemaVersion: SCHEMA_VERSION,
    settings: { ...base.settings, ...(state.settings ?? {}) },
    profile: { ...base.profile, ...(state.profile ?? {}) },
    goals: Array.isArray(state.goals) ? state.goals : base.goals,
  };

  // Normaliza unidades em alimentos/registros anteriores ao sistema de porções.
  merged.foods = (merged.foods ?? []).map((f: any) => ({
    ...f,
    unitLabel: f.unitLabel ?? "porção",
    unitGrams: typeof f.unitGrams === "number" ? f.unitGrams : 100,
  }));
  merged.foodLogs = (merged.foodLogs ?? []).map((l: any) => {
    const unitGrams = typeof l.unitGrams === "number" ? l.unitGrams : (l.grams ?? 100);
    const quantity = typeof l.quantity === "number" ? l.quantity : 1;
    return {
      ...l,
      unitLabel: l.unitLabel ?? "porção",
      unitGrams,
      quantity,
      grams: typeof l.grams === "number" ? l.grams : quantity * unitGrams,
    };
  });

  return merged;
}

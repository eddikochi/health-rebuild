import type { AppState } from "../domain/types";

// A UI nunca chama localStorage direto (PRD §18). Depois troca-se por Supabase.
export interface Repository {
  getState(): AppState;
  saveState(state: AppState): void;
  reset(): void;
  export(): string;
  import(json: string): AppState;
}

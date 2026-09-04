import { seedState } from "../domain/seed";
import type { AppState } from "../domain/types";
import { migrate } from "./migrations";
import type { Repository } from "./repository";

const STORAGE_KEY = "health-rebuild:v1";

export class LocalStorageRepository implements Repository {
  getState(): AppState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const initial = seedState();
        this.saveState(initial);
        return initial;
      }
      return migrate(JSON.parse(raw));
    } catch (err) {
      console.error("Falha ao carregar estado, usando seed:", err);
      return seedState();
    }
  }

  saveState(state: AppState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.error("Falha ao salvar estado:", err);
    }
  }

  reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  export(): string {
    return JSON.stringify(this.getState(), null, 2);
  }

  import(json: string): AppState {
    const parsed = migrate(JSON.parse(json));
    this.saveState(parsed);
    return parsed;
  }
}

export const repository: Repository = new LocalStorageRepository();

import { describe, expect, it } from "vitest";
import {
  getConsistencyScore,
  getDailyCalories,
  getDailyWaterMl,
  getMaxLoad,
  getWeeklyWorkoutCount,
  getWorkoutVolume,
} from "./analytics";
import { seedState } from "./seed";
import type { AppState, Workout } from "./types";

function baseState(): AppState {
  return seedState();
}

const DATE = "2026-09-02"; // quarta
const WEEK_REF = "2026-09-03";

describe("nutrition", () => {
  it("kcal = kcal/100g × gramas/100", () => {
    const s = baseState();
    s.foodLogs.push({
      id: "1",
      date: DATE,
      name: "Frango",
      kcalPer100g: 165,
      grams: 150,
      meal: "Almoço",
      consumed: true,
      quantity: 1.5,
      unitLabel: "filé",
      unitGrams: 100,
    });
    expect(getDailyCalories(s, DATE)).toBe(248); // 165*1.5 = 247.5 -> 248
  });

  it("apenas alimentos consumidos entram no total", () => {
    const s = baseState();
    s.foodLogs.push(
      { id: "1", date: DATE, name: "A", kcalPer100g: 100, grams: 100, meal: "Almoço", consumed: true, quantity: 1, unitLabel: "porção", unitGrams: 100 },
      { id: "2", date: DATE, name: "B", kcalPer100g: 100, grams: 100, meal: "Almoço", consumed: false, quantity: 1, unitLabel: "porção", unitGrams: 100 },
    );
    expect(getDailyCalories(s, DATE)).toBe(100);
  });

  it("soma refeições diferentes no mesmo dia", () => {
    const s = baseState();
    s.foodLogs.push(
      { id: "1", date: DATE, name: "A", kcalPer100g: 100, grams: 100, meal: "Café da manhã", consumed: true, quantity: 1, unitLabel: "porção", unitGrams: 100 },
      { id: "2", date: DATE, name: "B", kcalPer100g: 200, grams: 100, meal: "Janta", consumed: true, quantity: 1, unitLabel: "porção", unitGrams: 100 },
    );
    expect(getDailyCalories(s, DATE)).toBe(300);
  });
});

describe("water", () => {
  it("soma apenas logs consumidos do dia", () => {
    const s = baseState();
    s.waterLogs.push(
      { id: "1", date: DATE, ml: 500, consumed: true },
      { id: "2", date: DATE, ml: 500, consumed: false },
      { id: "3", date: "2026-09-01", ml: 500, consumed: true },
    );
    expect(getDailyWaterMl(s, DATE)).toBe(500);
  });
});

describe("workout volume", () => {
  const workout: Workout = {
    id: "w1",
    date: WEEK_REF,
    routineName: "Teste",
    completed: true,
    exercises: [
      {
        id: "e1",
        name: "Leg press",
        restSeconds: 90,
        sets: [
          { id: "s1", setNumber: 1, plannedReps: 8, actualReps: 8, weightKg: 80, status: "done" },
          { id: "s2", setNumber: 2, plannedReps: 8, actualReps: 10, weightKg: 80, status: "done" },
          { id: "s3", setNumber: 3, plannedReps: 12, actualReps: 12, weightKg: 60, status: "pending" },
        ],
      },
    ],
  };

  it("volume = Σ(peso × reps) apenas de séries concluídas", () => {
    expect(getWorkoutVolume(workout)).toBe(80 * 8 + 80 * 10);
  });

  it("carga máxima considera apenas séries concluídas", () => {
    const s = baseState();
    s.workouts.push(workout);
    expect(getMaxLoad(s)).toBe(80);
  });
});

describe("progress deriva de dados reais", () => {
  it("treino registrado altera consistência e contagem semanal", () => {
    const s = baseState();
    expect(getConsistencyScore(s, WEEK_REF).total).toBe(0);
    s.workouts.push({
      id: "w1",
      date: WEEK_REF,
      routineName: "Teste",
      completed: true,
      exercises: [],
    });
    expect(getWeeklyWorkoutCount(s, WEEK_REF)).toBe(1);
    expect(getConsistencyScore(s, WEEK_REF).treino).toBeGreaterThan(0);
  });

  it("estado inicial (seed) não tem métricas mockadas", () => {
    const s = baseState();
    expect(s.workouts).toHaveLength(0);
    expect(s.bodyMeasurements).toHaveLength(0);
    expect(getConsistencyScore(s, WEEK_REF).total).toBe(0);
  });
});

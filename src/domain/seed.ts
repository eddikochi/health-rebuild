import { uid } from "./id";
import type {
  AppState,
  Food,
  Meal,
  PlannedSet,
  Routine,
  RoutineExercise,
} from "./types";

export const SCHEMA_VERSION = 1;

function plannedSets(spec: Array<[number, number]>): PlannedSet[] {
  // spec: [reps, weightKg][]
  return spec.map(([reps, weightKg]) => ({ id: uid(), reps, weightKg }));
}

function ex(
  name: string,
  muscle: string,
  restSeconds: number,
  sets: Array<[number, number]>,
): RoutineExercise {
  return { id: uid(), name, muscle, restSeconds, plannedSets: plannedSets(sets) };
}

// Full Body A–E (conteúdo demonstrativo/editável — PRD §7).
function seedRoutines(): Routine[] {
  return [
    {
      id: uid(),
      name: "Full Body A",
      day: "SEG",
      focus: "Geral",
      exercises: [
        ex("Leg press", "Pernas", 90, [[8, 80], [8, 80], [12, 70], [12, 70]]),
        ex("Supino máquina", "Peito", 90, [[8, 30], [8, 30], [12, 25], [12, 25]]),
        ex("Puxada frontal", "Costas", 90, [[8, 45], [8, 45], [12, 40], [12, 40]]),
      ],
    },
    {
      id: uid(),
      name: "Full Body B",
      day: "TER",
      focus: "Costas/posterior",
      exercises: [
        ex("Stiff", "Posterior", 90, [[8, 40], [8, 40], [12, 35], [12, 35]]),
        ex("Remada baixa", "Costas", 90, [[8, 45], [8, 45], [12, 40], [12, 40]]),
        ex("Supino inclinado", "Peito", 90, [[8, 25], [8, 25], [12, 20], [12, 20]]),
      ],
    },
    {
      id: uid(),
      name: "Full Body C",
      day: "QUA",
      focus: "Leve/condicionamento",
      exercises: [
        ex("Agachamento guiado", "Pernas", 90, [[8, 40], [8, 40], [12, 30], [12, 30]]),
        ex("Chest press", "Peito", 90, [[8, 30], [8, 30], [12, 25], [12, 25]]),
        ex("Remada máquina", "Costas", 90, [[8, 40], [8, 40], [12, 35], [12, 35]]),
      ],
    },
    {
      id: uid(),
      name: "Full Body D",
      day: "QUI",
      focus: "Pernas/peito",
      exercises: [
        ex("Leg press", "Pernas", 90, [[8, 85], [8, 85], [12, 75], [12, 75]]),
        ex("Cadeira extensora", "Pernas", 90, [[8, 35], [8, 35], [12, 30], [12, 30]]),
        ex("Supino máquina", "Peito", 90, [[8, 30], [8, 30], [12, 25], [12, 25]]),
      ],
    },
    {
      id: uid(),
      name: "Full Body E",
      day: "SEX",
      focus: "Geral",
      exercises: [
        ex("Agachamento guiado", "Pernas", 90, [[8, 45], [8, 45], [12, 35], [12, 35]]),
        ex("Remada baixa", "Costas", 90, [[8, 45], [8, 45], [12, 40], [12, 40]]),
        ex("Desenvolvimento", "Ombros", 90, [[8, 20], [8, 20], [12, 16], [12, 16]]),
      ],
    },
  ];
}

function seedFoods(): Food[] {
  const items: Array<[string, number, Meal]> = [
    ["Ovos", 155, "Café da manhã"],
    ["Pão", 265, "Café da manhã"],
    ["Banana", 89, "Café da manhã"],
    ["Iogurte", 63, "Café da manhã"],
    ["Arroz", 130, "Almoço"],
    ["Feijão", 76, "Almoço"],
    ["Frango", 165, "Almoço"],
    ["Brócolis", 35, "Almoço"],
    ["Granola", 450, "Lanche da tarde"],
    ["Banana", 89, "Lanche da tarde"],
    ["Carne moída", 220, "Janta"],
    ["Batata", 77, "Janta"],
    ["Legumes", 50, "Janta"],
    ["Salada", 25, "Janta"],
  ];
  return items.map(([name, kcalPer100g, meal]) => ({
    id: uid(),
    name,
    kcalPer100g,
    meal,
  }));
}

export function seedState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    profile: { age: 41, heightCm: 176, baselineWeightKg: 79 },
    settings: {
      waterGoalMl: 2500,
      calorieLimit: 2000,
      weeklyGoalPct: 80,
      defaultRestSeconds: 90,
    },
    routines: seedRoutines(),
    foods: seedFoods(),
    workouts: [],
    activeWorkoutId: undefined,
    foodLogs: [],
    waterContainers: [
      { id: uid(), ml: 500 },
      { id: uid(), ml: 500 },
      { id: uid(), ml: 750 },
    ],
    waterLogs: [],
    bodyMeasurements: [],
    weeklyCheckIns: [],
  };
}

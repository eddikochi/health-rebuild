// Domain model — entities/events, not visual state (PRD §18).
// Datas em ISO 8601 (YYYY-MM-DD para dias; ISO completo para timestamps).

export type ID = string;
export type ISODate = string; // "2026-09-03"
export type ISOTimestamp = string; // "2026-09-03T12:34:56.000Z"

export const MEALS = [
  "Café da manhã",
  "Almoço",
  "Lanche da tarde",
  "Janta",
] as const;
export type Meal = (typeof MEALS)[number];

export interface Profile {
  age: number;
  heightCm: number;
  baselineWeightKg: number;
}

export interface Settings {
  waterGoalMl: number;
  calorieLimit: number;
  weeklyGoalPct: number;
  defaultRestSeconds: number;
}

// ---- Treino: template (planejado) ----
export interface PlannedSet {
  id: ID;
  reps: number;
  weightKg: number;
}

export interface RoutineExercise {
  id: ID;
  name: string;
  muscle?: string;
  restSeconds: number;
  plannedSets: PlannedSet[];
}

export interface Routine {
  id: ID;
  name: string;
  day: string;
  focus?: string;
  exercises: RoutineExercise[];
}

// ---- Treino: execução (real) ----
export type SetStatus = "pending" | "done";

export interface WorkoutSet {
  id: ID;
  setNumber: number;
  plannedReps: number;
  actualReps: number;
  weightKg: number;
  status: SetStatus;
  completedAt?: ISOTimestamp;
}

export interface WorkoutExercise {
  id: ID;
  name: string;
  restSeconds: number;
  sets: WorkoutSet[];
}

export interface CardioSession {
  type: string;
  durationMinutes: number;
}

export interface Workout {
  id: ID;
  date: ISODate;
  routineId?: ID;
  routineName: string;
  exercises: WorkoutExercise[];
  cardio?: CardioSession;
  // Descanso persistido por timestamp (PRD §8) — sobrevive a reload/suspensão.
  restStartedAt?: ISOTimestamp;
  restEndsAt?: ISOTimestamp;
  restDurationSeconds?: number;
  completed: boolean;
}

// ---- Alimentação ----
export interface Food {
  id: ID;
  name: string;
  kcalPer100g: number;
  meal: Meal;
  unitLabel: string; // "ovo", "fatia", "unidade", "colher", "g"…
  unitGrams: number; // peso médio de 1 unidade, em gramas
}

export interface FoodLog {
  id: ID;
  date: ISODate;
  name: string;
  kcalPer100g: number;
  grams: number; // gramas totais (= quantity × unitGrams), fonte do cálculo de kcal
  meal: Meal;
  consumed: boolean;
  quantity: number; // quantas unidades
  unitLabel: string;
  unitGrams: number;
}

// ---- Hidratação ----
export interface WaterContainer {
  id: ID;
  ml: number;
}

export interface WaterLog {
  id: ID;
  date: ISODate;
  ml: number;
  consumed: boolean;
}

// ---- Corpo ----
export interface BodyMeasurement {
  id: ID;
  date: ISODate;
  weightKg?: number;
  waistCm?: number;
  abdomenCm?: number;
  chestCm?: number;
  armLeftCm?: number;
  armRightCm?: number;
  thighLeftCm?: number;
  thighRightCm?: number;
  notes?: string;
}

export type BodyMetricKey = Exclude<keyof BodyMeasurement, "id" | "date" | "notes">;

// ---- Check-in semanal ----
export interface WeeklyCheckIn {
  id: ID;
  date: ISODate;
  energy: number; // 1-5
  sleep: number; // 1-5
  readiness: number; // 1-5
  notes?: string;
}

export const GOALS = [
  "Reduzir gordura",
  "Melhorar condicionamento",
  "Manter/ganhar massa",
] as const;

export interface AppState {
  schemaVersion: number;
  profile: Profile;
  goals: string[];
  settings: Settings;
  routines: Routine[];
  foods: Food[];
  workouts: Workout[];
  activeWorkoutId?: ID;
  foodLogs: FoodLog[];
  waterContainers: WaterContainer[];
  waterLogs: WaterLog[];
  bodyMeasurements: BodyMeasurement[];
  weeklyCheckIns: WeeklyCheckIn[];
}

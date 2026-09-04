import { sameWeek, todayISO } from "./date";
import type { AppState, BodyMetricKey, ISODate, Workout } from "./types";

// Todas as métricas de Progresso derivam de registros reais (PRD §15, §32, §41).

export function getDailyCalories(state: AppState, date: ISODate): number {
  return Math.round(
    state.foodLogs
      .filter((l) => l.date === date && l.consumed)
      .reduce((a, l) => a + (l.kcalPer100g * l.grams) / 100, 0),
  );
}

export function getDailyWaterMl(state: AppState, date: ISODate): number {
  return state.waterLogs
    .filter((l) => l.date === date && l.consumed)
    .reduce((a, l) => a + l.ml, 0);
}

export function getWorkoutVolume(workout: Workout): number {
  return workout.exercises.reduce(
    (a, ex) =>
      a +
      ex.sets
        .filter((s) => s.status === "done")
        .reduce((b, s) => b + s.weightKg * s.actualReps, 0),
    0,
  );
}

export function getWeeklyWorkoutCount(state: AppState, ref: ISODate): number {
  return state.workouts.filter((w) => w.completed && sameWeek(w.date, ref)).length;
}

export function getWeeklyCardioMinutes(state: AppState, ref: ISODate): number {
  return state.workouts
    .filter((w) => w.completed && sameWeek(w.date, ref) && w.cardio)
    .reduce((a, w) => a + (w.cardio?.durationMinutes ?? 0), 0);
}

// Dias na semana com kcal registradas dentro do limite.
export function getNutritionAdherence(state: AppState, ref: ISODate): number {
  const days = new Set(
    state.foodLogs.filter((l) => sameWeek(l.date, ref) && l.consumed).map((l) => l.date),
  );
  if (days.size === 0) return 0;
  let within = 0;
  days.forEach((d) => {
    if (getDailyCalories(state, d) <= state.settings.calorieLimit) within++;
  });
  return within / days.size;
}

// Dias na semana que bateram a meta de hidratação.
export function getHydrationAdherence(state: AppState, ref: ISODate): number {
  const days = new Set(
    state.waterLogs.filter((l) => sameWeek(l.date, ref) && l.consumed).map((l) => l.date),
  );
  if (days.size === 0) return 0;
  let hit = 0;
  days.forEach((d) => {
    if (getDailyWaterMl(state, d) >= state.settings.waterGoalMl) hit++;
  });
  return hit / days.size;
}

export interface ScoreBreakdown {
  treino: number;
  cardio: number;
  alimentacao: number;
  agua: number;
  recuperacao: number;
  checkin: number;
  total: number;
}

export const SCORE_MAX = {
  treino: 30,
  cardio: 20,
  alimentacao: 20,
  agua: 10,
  recuperacao: 10,
  checkin: 10,
} as const;

const WORKOUT_TARGET = 5;
const CARDIO_TARGET_MIN = 75;

// Health Consistency Score — hipótese MVP, explicável (PRD §33).
export function getConsistencyScore(state: AppState, ref = todayISO()): ScoreBreakdown {
  const workouts = getWeeklyWorkoutCount(state, ref);
  const cardio = getWeeklyCardioMinutes(state, ref);
  const checkins = state.weeklyCheckIns.filter((c) => sameWeek(c.date, ref));
  const avgReadiness = checkins.length
    ? checkins.reduce((a, c) => a + c.readiness, 0) / checkins.length
    : 0;

  const treino = Math.round(Math.min(workouts / WORKOUT_TARGET, 1) * SCORE_MAX.treino);
  const cardioPts = Math.round(Math.min(cardio / CARDIO_TARGET_MIN, 1) * SCORE_MAX.cardio);
  const alimentacao = Math.round(getNutritionAdherence(state, ref) * SCORE_MAX.alimentacao);
  const agua = Math.round(getHydrationAdherence(state, ref) * SCORE_MAX.agua);
  const recuperacao = Math.round((avgReadiness / 5) * SCORE_MAX.recuperacao);
  const checkin = checkins.length ? SCORE_MAX.checkin : 0;

  return {
    treino,
    cardio: cardioPts,
    alimentacao,
    agua,
    recuperacao,
    checkin,
    total: treino + cardioPts + alimentacao + agua + recuperacao + checkin,
  };
}

export interface WeekProgress {
  score: number;
  goal: number;
  delta: number;
  status: string;
}

export function getWeekProgress(state: AppState, ref = todayISO()): WeekProgress {
  const score = getConsistencyScore(state, ref).total;
  const goal = state.settings.weeklyGoalPct;
  const delta = score - goal;
  let status: string;
  if (delta === 0) status = "Meta atingida";
  else if (delta > 0) status = `Meta superada em ${delta} pts`;
  else status = `Faltam ${Math.abs(delta)} pts`;
  return { score, goal, delta, status };
}

// Dias distintos da semana que bateram a meta de hidratação.
export function getWeeklyHydrationDays(state: AppState, ref: ISODate): number {
  const days = new Set(
    state.waterLogs.filter((l) => sameWeek(l.date, ref) && l.consumed).map((l) => l.date),
  );
  let hit = 0;
  days.forEach((d) => {
    if (getDailyWaterMl(state, d) >= state.settings.waterGoalMl) hit++;
  });
  return hit;
}

// Dias distintos da semana com alimentação dentro do limite calórico.
export function getWeeklyNutritionDays(state: AppState, ref: ISODate): number {
  const days = new Set(
    state.foodLogs.filter((l) => sameWeek(l.date, ref) && l.consumed).map((l) => l.date),
  );
  let within = 0;
  days.forEach((d) => {
    if (getDailyCalories(state, d) <= state.settings.calorieLimit) within++;
  });
  return within;
}

export type PillarStatus = "below" | "in" | "above";

export interface GoalPillar {
  key: "treino" | "agua" | "alimentacao";
  icon: string;
  label: string;
  done: number;
  targetText: string;
  status: PillarStatus;
  badge: string;
  met: boolean;
}

export interface GoalReadout {
  pillars: GoalPillar[];
  metCount: number;
  total: number;
}

function daysBadge(missing: number): string {
  return missing === 1 ? "falta 1 dia" : `faltam ${missing} dias`;
}

// Metas didáticas: alvos concretos por pilar + leitura de abaixo/acima (semana).
export function getWeeklyGoalReadout(state: AppState, ref = todayISO()): GoalReadout {
  const s = state.settings;
  const pillars: GoalPillar[] = [];

  // Treino (mín–máx)
  const treinos = getWeeklyWorkoutCount(state, ref);
  const tMin = s.workoutMinPerWeek;
  const tMax = s.workoutMaxPerWeek;
  pillars.push({
    key: "treino",
    icon: "🏋️",
    label: "Treinos",
    done: treinos,
    targetText: `alvo ${tMin}–${tMax}`,
    status: treinos < tMin ? "below" : treinos > tMax ? "above" : "in",
    badge:
      treinos < tMin
        ? `falta ${tMin - treinos} p/ mínimo`
        : treinos > tMax
          ? `${treinos - tMax} acima do máx.`
          : "na meta",
    met: treinos >= tMin,
  });

  // Água (dias/semana)
  const aguaDias = getWeeklyHydrationDays(state, ref);
  pillars.push({
    key: "agua",
    icon: "💧",
    label: "Água",
    done: aguaDias,
    targetText: `alvo ${s.waterDaysTarget} de 7 dias`,
    status: aguaDias < s.waterDaysTarget ? "below" : "in",
    badge: aguaDias < s.waterDaysTarget ? daysBadge(s.waterDaysTarget - aguaDias) : "na meta",
    met: aguaDias >= s.waterDaysTarget,
  });

  // Alimentação (dias/semana dentro do limite)
  const alimDias = getWeeklyNutritionDays(state, ref);
  pillars.push({
    key: "alimentacao",
    icon: "🍽️",
    label: "Alimentação",
    done: alimDias,
    targetText: `alvo ${s.nutritionDaysTarget} de 7 dias`,
    status: alimDias < s.nutritionDaysTarget ? "below" : "in",
    badge:
      alimDias < s.nutritionDaysTarget ? daysBadge(s.nutritionDaysTarget - alimDias) : "na meta",
    met: alimDias >= s.nutritionDaysTarget,
  });

  return { pillars, metCount: pillars.filter((p) => p.met).length, total: pillars.length };
}

function sameMonth(a: ISODate, b: ISODate): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

export function getMonthlyWorkoutCount(state: AppState, ref: ISODate): number {
  return state.workouts.filter((w) => w.completed && sameMonth(w.date, ref)).length;
}

function monthDaysMeeting(
  state: AppState,
  ref: ISODate,
  source: "water" | "food",
): number {
  const logs = source === "water" ? state.waterLogs : state.foodLogs;
  const days = new Set(
    logs.filter((l) => l.consumed && sameMonth(l.date, ref)).map((l) => l.date),
  );
  let hit = 0;
  days.forEach((d) => {
    const ok =
      source === "water"
        ? getDailyWaterMl(state, d) >= state.settings.waterGoalMl
        : getDailyCalories(state, d) <= state.settings.calorieLimit;
    if (ok) hit++;
  });
  return hit;
}

export interface MonthlyReadout {
  monthLabel: string;
  weeks: number;
  pillars: GoalPillar[];
  metCount: number;
  total: number;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Metas do mês: alvos semanais escalados pelo nº de semanas do mês (PRD §15).
export function getMonthlyGoalReadout(state: AppState, ref = todayISO()): MonthlyReadout {
  const s = state.settings;
  const [year, month] = ref.split("-").map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const weeks = Math.max(1, Math.round(daysInMonth / 7));

  const treinos = getMonthlyWorkoutCount(state, ref);
  const tMin = s.workoutMinPerWeek * weeks;
  const tMax = s.workoutMaxPerWeek * weeks;
  const aguaDias = monthDaysMeeting(state, ref, "water");
  const aguaAlvo = s.waterDaysTarget * weeks;
  const alimDias = monthDaysMeeting(state, ref, "food");
  const alimAlvo = s.nutritionDaysTarget * weeks;

  const pillars: GoalPillar[] = [
    {
      key: "treino",
      icon: "🏋️",
      label: "Treinos",
      done: treinos,
      targetText: `alvo ${tMin}–${tMax}`,
      status: treinos < tMin ? "below" : treinos > tMax ? "above" : "in",
      badge:
        treinos < tMin
          ? `${tMin - treinos} abaixo do mínimo`
          : treinos > tMax
            ? `${treinos - tMax} acima do máx.`
            : "na meta",
      met: treinos >= tMin,
    },
    {
      key: "agua",
      icon: "💧",
      label: "Água",
      done: aguaDias,
      targetText: `alvo ${aguaAlvo} dias`,
      status: aguaDias < aguaAlvo ? "below" : "in",
      badge: aguaDias < aguaAlvo ? `${aguaAlvo - aguaDias} dia(s) abaixo` : "na meta",
      met: aguaDias >= aguaAlvo,
    },
    {
      key: "alimentacao",
      icon: "🍽️",
      label: "Alimentação",
      done: alimDias,
      targetText: `alvo ${alimAlvo} dias`,
      status: alimDias < alimAlvo ? "below" : "in",
      badge: alimDias < alimAlvo ? `${alimAlvo - alimDias} dia(s) abaixo` : "na meta",
      met: alimDias >= alimAlvo,
    },
  ];

  return {
    monthLabel: MONTH_NAMES[month - 1],
    weeks,
    pillars,
    metCount: pillars.filter((p) => p.met).length,
    total: pillars.length,
  };
}

// Insight factual e não-diagnóstico (PRD §17).
export function getWeeklyInsight(state: AppState, ref = todayISO()): string {
  const workouts = getWeeklyWorkoutCount(state, ref);
  const cardio = getWeeklyCardioMinutes(state, ref);
  const hydrationDays = getWeeklyHydrationDays(state, ref);
  const cardioPart = cardio > 0 ? ` e somou ${cardio} min de cardio` : "";
  return `Você completou ${workouts}/5 treinos e atingiu a meta de hidratação em ${hydrationDays} dia(s)${cardioPart} nesta semana.`;
}

export interface DayActivity {
  date: ISODate;
  workout: boolean;
  waterHit: boolean;
  foodLogged: boolean;
  score: number; // 0..3 — quantos pilares foram cumpridos no dia
  workoutName?: string;
  waterMl: number;
  kcal: number;
  weightKg?: number;
}

// Atividade de um dia, derivada dos registros (para o calendário de consistência).
export function getDayActivity(state: AppState, date: ISODate): DayActivity {
  const dayWorkouts = state.workouts.filter((w) => w.completed && w.date === date);
  const waterMl = getDailyWaterMl(state, date);
  const kcal = getDailyCalories(state, date);
  const workout = dayWorkouts.length > 0;
  const waterHit = waterMl >= state.settings.waterGoalMl;
  const foodLogged = kcal > 0;
  const measure = state.bodyMeasurements
    .filter((m) => m.date === date && m.weightKg != null)
    .at(-1);
  return {
    date,
    workout,
    waterHit,
    foodLogged,
    score: (workout ? 1 : 0) + (waterHit ? 1 : 0) + (foodLogged ? 1 : 0),
    workoutName: dayWorkouts.at(-1)?.routineName,
    waterMl,
    kcal,
    weightKg: measure?.weightKg,
  };
}

export interface SeriesPoint {
  date: ISODate;
  value: number;
}

function withinRange(date: ISODate, days: number): boolean {
  const then = new Date(date + "T00:00:00").getTime();
  const now = new Date(todayISO() + "T00:00:00").getTime();
  return (now - then) / 86400000 <= days;
}

export function getWeightSeries(state: AppState, days = 180): SeriesPoint[] {
  return state.bodyMeasurements
    .filter((m) => m.weightKg != null && withinRange(m.date, days))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ date: m.date, value: m.weightKg as number }));
}

// Média móvel simples (trend weight) — reduz ruído diário (PRD §14).
export function getWeightTrend(state: AppState, days = 180, window = 5): SeriesPoint[] {
  const raw = getWeightSeries(state, days);
  return raw.map((p, i) => {
    const slice = raw.slice(Math.max(0, i - window + 1), i + 1);
    const avg = slice.reduce((a, s) => a + s.value, 0) / slice.length;
    return { date: p.date, value: Math.round(avg * 10) / 10 };
  });
}

export function getWaistSeries(state: AppState, days = 180): SeriesPoint[] {
  return getBodySeries(state, "waistCm", days);
}

export function getBodySeries(
  state: AppState,
  key: BodyMetricKey,
  days = 180,
): SeriesPoint[] {
  return state.bodyMeasurements
    .filter((m) => m[key] != null && withinRange(m.date, days))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((m) => ({ date: m.date, value: m[key] as number }));
}

export function getCalorieSeries(state: AppState, days = 14): SeriesPoint[] {
  const byDate = new Map<ISODate, number>();
  state.foodLogs
    .filter((l) => l.consumed && withinRange(l.date, days))
    .forEach((l) => {
      byDate.set(l.date, (byDate.get(l.date) ?? 0) + (l.kcalPer100g * l.grams) / 100);
    });
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, value: Math.round(v) }));
}

// Evolução de carga máxima por exercício (nome), a partir de treinos concluídos.
export function getExerciseProgress(state: AppState, name: string): SeriesPoint[] {
  const points: SeriesPoint[] = [];
  state.workouts
    .filter((w) => w.completed)
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((w) => {
      const ex = w.exercises.find((e) => e.name === name);
      if (!ex) return;
      const max = Math.max(
        0,
        ...ex.sets.filter((s) => s.status === "done").map((s) => s.weightKg),
      );
      if (max > 0) points.push({ date: w.date, value: max });
    });
  return points;
}

export function getVolumeSeries(state: AppState, days = 60): SeriesPoint[] {
  return state.workouts
    .filter((w) => w.completed && withinRange(w.date, days))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => ({ date: w.date, value: getWorkoutVolume(w) }));
}

export function getMaxLoad(state: AppState): number {
  let max = 0;
  state.workouts
    .filter((w) => w.completed)
    .forEach((w) =>
      w.exercises.forEach((e) =>
        e.sets.forEach((s) => {
          if (s.status === "done") max = Math.max(max, s.weightKg);
        }),
      ),
    );
  return max;
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { repository } from "../data/localStorageRepository";
import { nowISO, todayISO } from "../domain/date";
import { uid } from "../domain/id";
import type {
  AppState,
  BodyMeasurement,
  CardioSession,
  Food,
  ID,
  ISODate,
  Meal,
  Routine,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "../domain/types";

type BodyMeasurementData = Partial<Omit<BodyMeasurement, "id" | "date">>;

interface NewExercise {
  name: string;
  muscle?: string;
  restSeconds: number;
  sets: number;
  reps: number;
  weightKg: number;
}

interface AppActions {
  // settings
  updateSettings(patch: Partial<AppState["settings"]>): void;
  updateProfile(patch: Partial<AppState["profile"]>): void;
  toggleGoal(goal: string): void;
  setGoals(goals: string[]): void;
  // water
  addWaterLog(date: ISODate, ml: number, consumed?: boolean): void;
  toggleWaterLog(id: ID): void;
  updateWaterLog(id: ID, ml: number): void;
  removeWaterLog(id: ID): void;
  addContainer(ml: number): void;
  updateContainer(id: ID, ml: number): void;
  removeContainer(id: ID): void;
  // Marca/desmarca o consumo de um recipiente no dia (fluxo gamificado da Home).
  toggleContainerToday(containerId: ID, date: ISODate): void;
  // food library
  addFood(
    name: string,
    kcalPer100g: number,
    meal: Meal,
    unitLabel: string,
    unitGrams: number,
  ): void;
  updateFood(id: ID, patch: Partial<Food>): void;
  removeFood(id: ID): void;
  // food logs
  addFoodLog(
    date: ISODate,
    data: {
      name: string;
      kcalPer100g: number;
      meal: Meal;
      quantity: number;
      unitLabel: string;
      unitGrams: number;
    },
  ): void;
  toggleFoodLog(id: ID): void;
  updateFoodLogQuantity(id: ID, quantity: number): void;
  removeFoodLog(id: ID): void;
  // body
  addMeasurement(date: ISODate, data: BodyMeasurementData): void;
  removeMeasurement(id: ID): void;
  // check-in
  addCheckIn(
    date: ISODate,
    data: { energy: number; sleep: number; readiness: number; notes?: string },
  ): void;
  removeCheckIn(id: ID): void;
  // routines (template)
  addRoutine(name: string): void;
  updateRoutine(id: ID, patch: Partial<Pick<Routine, "name" | "day" | "focus">>): void;
  removeRoutine(id: ID): void;
  addExerciseToRoutine(routineId: ID, ex: NewExercise): void;
  removeRoutineExercise(routineId: ID, exId: ID): void;
  addPlannedSet(routineId: ID, exId: ID): void;
  updatePlannedSet(
    routineId: ID,
    exId: ID,
    setId: ID,
    patch: { reps?: number; weightKg?: number },
  ): void;
  removePlannedSet(routineId: ID, exId: ID, setId: ID): void;
  // workout (execução)
  startWorkout(routineId: ID, date: ISODate): ID;
  logPastWorkout(routineId: ID, date: ISODate): ID;
  completeSet(exId: ID, setId: ID, data: { actualReps: number; weightKg: number }): void;
  skipRest(): void;
  addRestSeconds(seconds: number): void;
  addWorkoutSet(exId: ID): void;
  removeWorkoutSet(exId: ID, setId: ID): void;
  updateWorkoutSet(
    exId: ID,
    setId: ID,
    patch: { actualReps?: number; weightKg?: number },
  ): void;
  addWorkoutExercise(ex: NewExercise): void;
  removeWorkoutExercise(exId: ID): void;
  setCardio(cardio: CardioSession | undefined): void;
  finishWorkout(): void;
  discardWorkout(): void;
  reopenWorkout(id: ID): void;
  removeWorkout(id: ID): void;
  // data
  reset(): void;
  exportJSON(): string;
  importJSON(json: string): void;
}

interface Store {
  state: AppState;
  actions: AppActions;
}

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => repository.getState());
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    repository.saveState(state);
  }, [state]);

  // Helper: atualiza o workout ativo imutavelmente.
  const patchActiveWorkout = useCallback(
    (fn: (w: Workout) => Workout) => {
      setState((s) => {
        if (!s.activeWorkoutId) return s;
        return {
          ...s,
          workouts: s.workouts.map((w) => (w.id === s.activeWorkoutId ? fn(w) : w)),
        };
      });
    },
    [],
  );

  const mapExercise = (
    w: Workout,
    exId: ID,
    fn: (ex: WorkoutExercise) => WorkoutExercise,
  ): Workout => ({
    ...w,
    exercises: w.exercises.map((ex) => (ex.id === exId ? fn(ex) : ex)),
  });

  const actions = useMemo<AppActions>(() => {
    return {
      updateSettings(patch) {
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
      },
      updateProfile(patch) {
        setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }));
      },
      toggleGoal(goal) {
        setState((s) => ({
          ...s,
          goals: s.goals.includes(goal)
            ? s.goals.filter((g) => g !== goal)
            : [...s.goals, goal],
        }));
      },
      setGoals(goals) {
        setState((s) => ({ ...s, goals }));
      },

      // ---- water ----
      addWaterLog(date, ml, consumed = true) {
        setState((s) => ({
          ...s,
          waterLogs: [...s.waterLogs, { id: uid(), date, ml, consumed }],
        }));
      },
      toggleWaterLog(id) {
        setState((s) => ({
          ...s,
          waterLogs: s.waterLogs.map((l) =>
            l.id === id ? { ...l, consumed: !l.consumed } : l,
          ),
        }));
      },
      updateWaterLog(id, ml) {
        setState((s) => ({
          ...s,
          waterLogs: s.waterLogs.map((l) => (l.id === id ? { ...l, ml } : l)),
        }));
      },
      removeWaterLog(id) {
        setState((s) => ({ ...s, waterLogs: s.waterLogs.filter((l) => l.id !== id) }));
      },
      addContainer(ml) {
        setState((s) => ({
          ...s,
          waterContainers: [...s.waterContainers, { id: uid(), ml }],
        }));
      },
      updateContainer(id, ml) {
        setState((s) => ({
          ...s,
          waterContainers: s.waterContainers.map((c) => (c.id === id ? { ...c, ml } : c)),
        }));
      },
      removeContainer(id) {
        setState((s) => ({
          ...s,
          waterContainers: s.waterContainers.filter((c) => c.id !== id),
        }));
      },
      toggleContainerToday(containerId, date) {
        setState((s) => {
          const existing = s.waterLogs.find(
            (l) => l.date === date && l.containerId === containerId && l.consumed,
          );
          if (existing) {
            return { ...s, waterLogs: s.waterLogs.filter((l) => l.id !== existing.id) };
          }
          const container = s.waterContainers.find((c) => c.id === containerId);
          if (!container) return s;
          return {
            ...s,
            waterLogs: [
              ...s.waterLogs,
              { id: uid(), date, ml: container.ml, consumed: true, containerId },
            ],
          };
        });
      },

      // ---- food library ----
      addFood(name, kcalPer100g, meal, unitLabel, unitGrams) {
        setState((s) => ({
          ...s,
          foods: [
            ...s.foods,
            { id: uid(), name, kcalPer100g, meal, unitLabel, unitGrams },
          ],
        }));
      },
      updateFood(id, patch) {
        setState((s) => ({
          ...s,
          foods: s.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        }));
      },
      removeFood(id) {
        setState((s) => ({ ...s, foods: s.foods.filter((f) => f.id !== id) }));
      },

      // ---- food logs ----
      addFoodLog(date, data) {
        const grams = data.quantity * data.unitGrams;
        setState((s) => ({
          ...s,
          foodLogs: [...s.foodLogs, { id: uid(), date, consumed: true, grams, ...data }],
        }));
      },
      toggleFoodLog(id) {
        setState((s) => ({
          ...s,
          foodLogs: s.foodLogs.map((l) =>
            l.id === id ? { ...l, consumed: !l.consumed } : l,
          ),
        }));
      },
      updateFoodLogQuantity(id, quantity) {
        setState((s) => ({
          ...s,
          foodLogs: s.foodLogs.map((l) =>
            l.id === id ? { ...l, quantity, grams: quantity * l.unitGrams } : l,
          ),
        }));
      },
      removeFoodLog(id) {
        setState((s) => ({ ...s, foodLogs: s.foodLogs.filter((l) => l.id !== id) }));
      },

      // ---- body ----
      addMeasurement(date, data) {
        setState((s) => ({
          ...s,
          bodyMeasurements: [...s.bodyMeasurements, { id: uid(), date, ...data }],
        }));
      },
      removeMeasurement(id) {
        setState((s) => ({
          ...s,
          bodyMeasurements: s.bodyMeasurements.filter((m) => m.id !== id),
        }));
      },

      // ---- check-in ----
      addCheckIn(date, data) {
        setState((s) => ({
          ...s,
          weeklyCheckIns: [...s.weeklyCheckIns, { id: uid(), date, ...data }],
        }));
      },
      removeCheckIn(id) {
        setState((s) => ({
          ...s,
          weeklyCheckIns: s.weeklyCheckIns.filter((c) => c.id !== id),
        }));
      },

      // ---- routines (template) ----
      addRoutine(name) {
        setState((s) => ({
          ...s,
          routines: [
            ...s.routines,
            { id: uid(), name, day: "EXTRA", exercises: [] },
          ],
        }));
      },
      updateRoutine(id, patch) {
        setState((s) => ({
          ...s,
          routines: s.routines.map((r) => (r.id === id ? { ...r, ...patch } : r)),
        }));
      },
      removeRoutine(id) {
        setState((s) => ({ ...s, routines: s.routines.filter((r) => r.id !== id) }));
      },
      addExerciseToRoutine(routineId, ex) {
        setState((s) => ({
          ...s,
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: [
                    ...r.exercises,
                    {
                      id: uid(),
                      name: ex.name,
                      muscle: ex.muscle,
                      restSeconds: ex.restSeconds,
                      plannedSets: Array.from({ length: Math.max(1, ex.sets) }, () => ({
                        id: uid(),
                        reps: ex.reps,
                        weightKg: ex.weightKg,
                      })),
                    },
                  ],
                }
              : r,
          ),
        }));
      },
      removeRoutineExercise(routineId, exId) {
        setState((s) => ({
          ...s,
          routines: s.routines.map((r) =>
            r.id === routineId
              ? { ...r, exercises: r.exercises.filter((e) => e.id !== exId) }
              : r,
          ),
        }));
      },
      addPlannedSet(routineId, exId) {
        setState((s) => ({
          ...s,
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: r.exercises.map((e) => {
                    if (e.id !== exId) return e;
                    const last = e.plannedSets[e.plannedSets.length - 1];
                    return {
                      ...e,
                      plannedSets: [
                        ...e.plannedSets,
                        {
                          id: uid(),
                          reps: last?.reps ?? 10,
                          weightKg: last?.weightKg ?? 0,
                        },
                      ],
                    };
                  }),
                }
              : r,
          ),
        }));
      },
      updatePlannedSet(routineId, exId, setId, patch) {
        setState((s) => ({
          ...s,
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: r.exercises.map((e) =>
                    e.id === exId
                      ? {
                          ...e,
                          plannedSets: e.plannedSets.map((ps) =>
                            ps.id === setId ? { ...ps, ...patch } : ps,
                          ),
                        }
                      : e,
                  ),
                }
              : r,
          ),
        }));
      },
      removePlannedSet(routineId, exId, setId) {
        setState((s) => ({
          ...s,
          routines: s.routines.map((r) =>
            r.id === routineId
              ? {
                  ...r,
                  exercises: r.exercises.map((e) =>
                    e.id === exId
                      ? { ...e, plannedSets: e.plannedSets.filter((ps) => ps.id !== setId) }
                      : e,
                  ),
                }
              : r,
          ),
        }));
      },

      // ---- workout execução ----
      startWorkout(routineId, date) {
        const id = uid();
        setState((s) => {
          const routine = s.routines.find((r) => r.id === routineId);
          if (!routine) return s;
          const workout: Workout = {
            id,
            date,
            routineId: routine.id,
            routineName: routine.name,
            completed: false,
            exercises: routine.exercises.map((re) => ({
              id: uid(),
              name: re.name,
              restSeconds: re.restSeconds,
              sets: re.plannedSets.map((ps, i) => ({
                id: uid(),
                setNumber: i + 1,
                plannedReps: ps.reps,
                actualReps: ps.reps,
                weightKg: ps.weightKg,
                status: "pending" as const,
              })),
            })),
          };
          return { ...s, workouts: [...s.workouts, workout], activeWorkoutId: id };
        });
        return id;
      },
      logPastWorkout(routineId, date) {
        // Registra um treino passado já concluído, sem tocar no treino ativo.
        // As séries entram como "done" com os valores planejados (editáveis depois).
        const id = uid();
        setState((s) => {
          const routine = s.routines.find((r) => r.id === routineId);
          if (!routine) return s;
          const completedAt = new Date(date + "T12:00:00").toISOString();
          const workout: Workout = {
            id,
            date,
            routineId: routine.id,
            routineName: routine.name,
            completed: true,
            exercises: routine.exercises.map((re) => ({
              id: uid(),
              name: re.name,
              restSeconds: re.restSeconds,
              sets: re.plannedSets.map((ps, i) => ({
                id: uid(),
                setNumber: i + 1,
                plannedReps: ps.reps,
                actualReps: ps.reps,
                weightKg: ps.weightKg,
                status: "done" as const,
                completedAt,
              })),
            })),
          };
          return { ...s, workouts: [...s.workouts, workout] };
        });
        return id;
      },
      completeSet(exId, setId, data) {
        patchActiveWorkout((w) => {
          const ex = w.exercises.find((e) => e.id === exId);
          const rest = ex?.restSeconds ?? w.restDurationSeconds ?? 90;
          const start = nowISO();
          const ends = new Date(Date.now() + rest * 1000).toISOString();
          return {
            ...mapExercise(w, exId, (e) => ({
              ...e,
              sets: e.sets.map((st) =>
                st.id === setId
                  ? {
                      ...st,
                      status: "done" as const,
                      actualReps: data.actualReps,
                      weightKg: data.weightKg,
                      completedAt: start,
                    }
                  : st,
              ),
            })),
            restStartedAt: start,
            restEndsAt: ends,
            restDurationSeconds: rest,
          };
        });
      },
      skipRest() {
        patchActiveWorkout((w) => ({
          ...w,
          restStartedAt: undefined,
          restEndsAt: undefined,
        }));
      },
      addRestSeconds(seconds) {
        patchActiveWorkout((w) => {
          if (!w.restEndsAt) return w;
          return {
            ...w,
            restEndsAt: new Date(
              new Date(w.restEndsAt).getTime() + seconds * 1000,
            ).toISOString(),
          };
        });
      },
      addWorkoutSet(exId) {
        // Série extra pertence apenas a esta sessão (PRD §42.3).
        patchActiveWorkout((w) =>
          mapExercise(w, exId, (e) => {
            const last = e.sets[e.sets.length - 1];
            const next: WorkoutSet = {
              id: uid(),
              setNumber: e.sets.length + 1,
              plannedReps: last?.plannedReps ?? 10,
              actualReps: last?.actualReps ?? last?.plannedReps ?? 10,
              weightKg: last?.weightKg ?? 0,
              status: "pending",
            };
            return { ...e, sets: [...e.sets, next] };
          }),
        );
      },
      removeWorkoutSet(exId, setId) {
        patchActiveWorkout((w) =>
          mapExercise(w, exId, (e) => ({
            ...e,
            sets: e.sets
              .filter((st) => st.id !== setId)
              .map((st, i) => ({ ...st, setNumber: i + 1 })),
          })),
        );
      },
      updateWorkoutSet(exId, setId, patch) {
        patchActiveWorkout((w) =>
          mapExercise(w, exId, (e) => ({
            ...e,
            sets: e.sets.map((st) => (st.id === setId ? { ...st, ...patch } : st)),
          })),
        );
      },
      addWorkoutExercise(ex) {
        patchActiveWorkout((w) => ({
          ...w,
          exercises: [
            ...w.exercises,
            {
              id: uid(),
              name: ex.name,
              restSeconds: ex.restSeconds,
              sets: Array.from({ length: Math.max(1, ex.sets) }, (_, i) => ({
                id: uid(),
                setNumber: i + 1,
                plannedReps: ex.reps,
                actualReps: ex.reps,
                weightKg: ex.weightKg,
                status: "pending" as const,
              })),
            },
          ],
        }));
      },
      removeWorkoutExercise(exId) {
        patchActiveWorkout((w) => ({
          ...w,
          exercises: w.exercises.filter((e) => e.id !== exId),
        }));
      },
      setCardio(cardio) {
        patchActiveWorkout((w) => ({ ...w, cardio }));
      },
      finishWorkout() {
        setState((s) => ({
          ...s,
          activeWorkoutId: undefined,
          workouts: s.workouts.map((w) =>
            w.id === s.activeWorkoutId
              ? { ...w, completed: true, restStartedAt: undefined, restEndsAt: undefined }
              : w,
          ),
        }));
      },
      discardWorkout() {
        setState((s) => ({
          ...s,
          activeWorkoutId: undefined,
          workouts: s.workouts.filter((w) => w.id !== s.activeWorkoutId),
        }));
      },
      reopenWorkout(id) {
        setState((s) => ({
          ...s,
          activeWorkoutId: id,
          workouts: s.workouts.map((w) =>
            w.id === id ? { ...w, completed: false } : w,
          ),
        }));
      },
      removeWorkout(id) {
        setState((s) => ({
          ...s,
          workouts: s.workouts.filter((w) => w.id !== id),
          activeWorkoutId: s.activeWorkoutId === id ? undefined : s.activeWorkoutId,
        }));
      },

      // ---- data ----
      reset() {
        repository.reset();
        setState(repository.getState());
      },
      exportJSON() {
        return JSON.stringify(stateRef.current, null, 2);
      },
      importJSON(json) {
        setState(repository.import(json));
      },
    };
  }, [patchActiveWorkout]);

  const value = useMemo(() => ({ state, actions }), [state, actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useApp deve ser usado dentro de AppProvider");
  return ctx;
}

export function todayKey(): ISODate {
  return todayISO();
}

import { useState } from "react";
import { useFeedback } from "../../components/Feedback";
import { InputSheet } from "../../components/InputSheet";
import {
  getConsistencyScore,
  getDailyCalories,
  getDailyWaterMl,
  getWeekProgress,
  getWeeklyWorkoutCount,
} from "../../domain/analytics";
import { todayISO } from "../../domain/date";
import type { Screen } from "../../App";
import { useApp } from "../../store/AppStore";

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export function HomeScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, actions } = useApp();
  const { toast } = useFeedback();
  const today = todayISO();
  const [editGoal, setEditGoal] = useState(false);
  const [addBottle, setAddBottle] = useState(false);

  const progress = getWeekProgress(state);
  const score = getConsistencyScore(state);
  const workouts = getWeeklyWorkoutCount(state, today);
  const water = getDailyWaterMl(state, today);
  const kcal = getDailyCalories(state, today);
  const goalMarker = Math.min(100, state.settings.weeklyGoalPct);

  const abbr = WEEKDAYS[new Date(today + "T00:00:00").getDay()];
  const active = state.workouts.find((w) => w.id === state.activeWorkoutId);
  const todayRoutine =
    state.routines.find((r) => r.day === abbr) ?? state.routines[0];

  const startToday = () => {
    if (!active && todayRoutine) actions.startWorkout(todayRoutine.id, today);
    navigate("treino");
  };

  return (
    <section>
      <div className="eyebrow">Ciclo 01 • Semana 1</div>
      <h1>Hoje</h1>

      <div className="card">
        <div className="row">
          <div>
            <div className="eyebrow">Progresso semanal</div>
            <h2>{score.total}% concluído</h2>
            <div className="muted">Meta semanal: {state.settings.weeklyGoalPct}%</div>
          </div>
          <button className="btn" onClick={() => setEditGoal(true)}>
            Editar meta
          </button>
        </div>
        <div className="bar" style={{ position: "relative", marginTop: 12 }}>
          <i style={{ width: score.total + "%" }} />
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: -4,
              left: `calc(${goalMarker}% - 1px)`,
              width: 2,
              height: 16,
              background: "#333",
            }}
          />
        </div>
        <div className="row" style={{ marginTop: 10 }}>
          <span className={"pill" + (progress.delta >= 0 ? " ok" : "")}>
            Meta {state.settings.weeklyGoalPct}%
          </span>
          <span className="muted">{progress.status}</span>
        </div>
        <p className="muted">
          Treino {workouts}/5 • Água {water} ml • Alimentação {kcal} kcal
        </p>
      </div>

      <div className="card dark">
        <div className="eyebrow">Treino de hoje</div>
        <h2>{active ? active.routineName : todayRoutine?.name ?? "Sem rotina"}</h2>
        <p>
          {active ? "Treino em andamento" : todayRoutine?.focus ?? "Geral"} • ~50 min
        </p>
        <button className="btn primary" onClick={startToday}>
          {active ? "Continuar treino" : "Começar treino"}
        </button>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <div className="eyebrow">Água</div>
            <h2>
              {water} / {state.settings.waterGoalMl} ml
            </h2>
          </div>
          <button className="btn" onClick={() => setAddBottle(true)}>
            + Garrafa
          </button>
        </div>
        <div className="bar" style={{ marginTop: 10 }}>
          <i style={{ width: Math.min(100, (water / state.settings.waterGoalMl) * 100) + "%" }} />
        </div>
        <button className="btn ghost block" style={{ marginTop: 10 }} onClick={() => navigate("perfil")}>
          Gerenciar hidratação
        </button>
      </div>

      <div className="card">
        <div className="row">
          <div>
            <div className="eyebrow">Alimentação</div>
            <h2>{kcal} kcal registradas</h2>
          </div>
          <button className="btn" onClick={() => navigate("comida")}>
            Abrir
          </button>
        </div>
        <p className="muted">
          {kcal <= state.settings.calorieLimit
            ? `${state.settings.calorieLimit - kcal} kcal disponíveis hoje`
            : `${kcal - state.settings.calorieLimit} kcal acima do limite`}
        </p>
      </div>

      {editGoal && (
        <InputSheet
          title="Meta semanal de consistência"
          fields={[
            {
              key: "goal",
              label: "Meta (%)",
              type: "number",
              min: 1,
              value: String(state.settings.weeklyGoalPct),
            },
          ]}
          onClose={() => setEditGoal(false)}
          onSubmit={(v) => {
            const n = Number(v.goal);
            if (n >= 1 && n <= 100) {
              actions.updateSettings({ weeklyGoalPct: n });
              toast("Meta semanal atualizada");
            }
          }}
        />
      )}
      {addBottle && (
        <InputSheet
          title="Registrar água"
          submitLabel="Registrar"
          fields={[{ key: "ml", label: "Volume (ml)", type: "number", min: 1, value: "500" }]}
          onClose={() => setAddBottle(false)}
          onSubmit={(v) => {
            const ml = Number(v.ml);
            if (ml > 0) {
              actions.addWaterLog(today, ml, true);
              toast("Água registrada");
            }
          }}
        />
      )}
    </section>
  );
}

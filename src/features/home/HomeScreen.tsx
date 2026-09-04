import { useState } from "react";
import { useFeedback } from "../../components/Feedback";
import { InputSheet } from "../../components/InputSheet";
import {
  getDailyCalories,
  getDailyWaterMl,
  getWeeklyGoalReadout,
} from "../../domain/analytics";
import { todayISO } from "../../domain/date";
import type { Screen } from "../../App";
import { useApp } from "../../store/AppStore";

const WEEKDAYS = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export function HomeScreen({ navigate }: { navigate: (s: Screen) => void }) {
  const { state, actions } = useApp();
  const { toast } = useFeedback();
  const today = todayISO();
  const [editTargets, setEditTargets] = useState(false);

  const readout = getWeeklyGoalReadout(state);
  const water = getDailyWaterMl(state, today);
  const drunkCount = state.waterContainers.filter((c) =>
    state.waterLogs.some((l) => l.date === today && l.containerId === c.id && l.consumed),
  ).length;
  const kcal = getDailyCalories(state, today);

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
            <div className="eyebrow">Metas da semana</div>
            <h2>
              {readout.metCount}/{readout.total} alvos cumpridos
            </h2>
          </div>
          <button className="btn" onClick={() => setEditTargets(true)}>
            Editar alvos
          </button>
        </div>
        <div className="bar" style={{ marginTop: 12 }}>
          <i style={{ width: (readout.metCount / readout.total) * 100 + "%" }} />
        </div>
        <div className="stack" style={{ marginTop: 12 }}>
          {readout.pillars.map((p) => (
            <div className="row" key={p.key} style={{ gap: 8 }}>
              <span className="grow">
                {p.icon} {p.label}{" "}
                <b>{p.done}</b> <small className="muted">· {p.targetText}</small>
              </span>
              <span className={"pill" + (p.status === "below" ? "" : " ok")}>
                {p.status === "in" ? "✓ " : ""}
                {p.badge}
              </span>
            </div>
          ))}
        </div>
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
          {water >= state.settings.waterGoalMl && water > 0 ? (
            <span className="pill ok">Meta batida! 🎉</span>
          ) : (
            <span className="muted">{drunkCount}/{state.waterContainers.length} garrafas</span>
          )}
        </div>
        <div className="bar" style={{ marginTop: 10 }}>
          <i style={{ width: Math.min(100, (water / state.settings.waterGoalMl) * 100) + "%" }} />
        </div>
        {state.waterContainers.length === 0 ? (
          <p className="empty" style={{ marginTop: 10 }}>
            Nenhuma garrafa cadastrada. Configure em Perfil › Hidratação.
          </p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {state.waterContainers.map((c) => {
              const consumed = state.waterLogs.some(
                (l) => l.date === today && l.containerId === c.id && l.consumed,
              );
              return (
                <button
                  key={c.id}
                  aria-pressed={consumed}
                  aria-label={`${c.ml} ml${consumed ? " — consumida, tocar para desfazer" : " — tocar para beber"}`}
                  onClick={() => actions.toggleContainerToday(c.id, today)}
                  style={{
                    border: "0",
                    borderRadius: 14,
                    padding: "12px 14px",
                    minWidth: 84,
                    minHeight: 60,
                    cursor: "pointer",
                    fontWeight: 800,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                    background: consumed ? "var(--primary)" : "var(--primary-soft)",
                    color: consumed ? "#fff" : "var(--primary-strong)",
                    boxShadow: consumed ? "inset 0 0 0 2px var(--primary)" : "inset 0 0 0 1px var(--border)",
                  }}
                >
                  <span style={{ fontSize: 20 }} aria-hidden>
                    {consumed ? "💧" : "🩶"}
                  </span>
                  {c.ml} ml
                </button>
              );
            })}
          </div>
        )}
        <button className="btn ghost block" style={{ marginTop: 12 }} onClick={() => navigate("perfil")}>
          Gerenciar garrafas
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

      {editTargets && (
        <InputSheet
          title="Editar alvos da semana"
          fields={[
            { key: "wmin", label: "Treinos — mínimo/semana", type: "number", min: 0, value: String(state.settings.workoutMinPerWeek) },
            { key: "wmax", label: "Treinos — máximo/semana", type: "number", min: 1, value: String(state.settings.workoutMaxPerWeek) },
            { key: "water", label: "Água — dias/semana na meta", type: "number", min: 1, value: String(state.settings.waterDaysTarget) },
            { key: "food", label: "Alimentação — dias/semana no limite", type: "number", min: 1, value: String(state.settings.nutritionDaysTarget) },
          ]}
          onClose={() => setEditTargets(false)}
          onSubmit={(v) => {
            const wmin = Number(v.wmin);
            const wmax = Number(v.wmax);
            const water = Number(v.water);
            const food = Number(v.food);
            actions.updateSettings({
              workoutMinPerWeek: wmin >= 0 ? wmin : state.settings.workoutMinPerWeek,
              workoutMaxPerWeek: wmax >= 1 ? Math.max(wmax, wmin) : state.settings.workoutMaxPerWeek,
              waterDaysTarget: water >= 1 && water <= 7 ? water : state.settings.waterDaysTarget,
              nutritionDaysTarget: food >= 1 && food <= 7 ? food : state.settings.nutritionDaysTarget,
            });
            toast("Alvos atualizados");
          }}
        />
      )}
    </section>
  );
}

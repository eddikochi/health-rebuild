import { useState } from "react";
import { Chart } from "../../components/Chart";
import { useFeedback } from "../../components/Feedback";
import { Sheet, Tabs, TrashButton } from "../../components/Sheet";
import { getExerciseProgress, getMaxLoad, getWorkoutVolume } from "../../domain/analytics";
import { todayISO } from "../../domain/date";
import type { ID, Workout, WorkoutExercise, WorkoutSet } from "../../domain/types";
import { fmtClock, useNow } from "../../hooks/useNow";
import { useApp } from "../../store/AppStore";
import { ExerciseForm } from "./ExerciseForm";

type Tab = "exec" | "rotinas" | "historico";

const TABS = [
  { id: "exec" as const, label: "Hoje" },
  { id: "rotinas" as const, label: "Rotinas" },
  { id: "historico" as const, label: "Histórico" },
];

export function WorkoutScreen() {
  const { state } = useApp();
  const active = state.workouts.find((w) => w.id === state.activeWorkoutId);
  const [tab, setTab] = useState<Tab>(active ? "exec" : "rotinas");

  return (
    <section>
      <div className="eyebrow">Treino</div>
      <h1>{active ? active.routineName : "Full Body • 5 dias"}</h1>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "exec" && <ExecTab />}
      {tab === "rotinas" && <RoutinesTab onStart={() => setTab("exec")} />}
      {tab === "historico" && <HistoryTab onEdit={() => setTab("exec")} />}
    </section>
  );
}

// ---------- Execução ----------
function ExecTab() {
  const { state, actions } = useApp();
  const { toast } = useFeedback();
  const active = state.workouts.find((w) => w.id === state.activeWorkoutId);
  const [addingExercise, setAddingExercise] = useState(false);

  const resting =
    !!active?.restEndsAt && new Date(active.restEndsAt).getTime() > Date.now();
  const now = useNow(resting);

  if (!active) {
    return (
      <div className="card">
        <h2>Nenhum treino em andamento</h2>
        <p className="empty">
          Escolha uma rotina na aba <b>Rotinas</b> e toque em <b>Começar treino</b>.
        </p>
      </div>
    );
  }

  const remaining = active.restEndsAt
    ? (new Date(active.restEndsAt).getTime() - now) / 1000
    : 0;
  const isResting = remaining > 0;
  const volume = getWorkoutVolume(active);
  const exerciseNames = [
    ...new Set(state.routines.flatMap((r) => r.exercises.map((e) => e.name))),
  ];

  return (
    <>
      {isResting && (
        <div className="card dark">
          <div className="row">
            <div>
              <div className="eyebrow">Descanso</div>
              <div className="metric">{fmtClock(remaining)}</div>
            </div>
            <div className="stack">
              <button className="btn" onClick={() => actions.addRestSeconds(30)}>
                +30 s
              </button>
              <button className="btn ghost" onClick={() => actions.skipRest()}>
                Pular
              </button>
            </div>
          </div>
        </div>
      )}

      {active.exercises.map((ex) => (
        <ExerciseCard key={ex.id} ex={ex} globallyResting={isResting} />
      ))}

      <button className="btn block" onClick={() => setAddingExercise(true)}>
        + Adicionar exercício
      </button>

      <CardioCard workout={active} />

      <button
        className="btn primary"
        style={{ marginTop: 12 }}
        onClick={() => {
          actions.finishWorkout();
          toast("Treino salvo no histórico");
        }}
      >
        Finalizar treino {volume > 0 ? `• vol. ${volume} kg` : ""}
      </button>
      <button
        className="btn ghost block"
        style={{ marginTop: 8 }}
        onClick={() => actions.discardWorkout()}
      >
        Descartar
      </button>

      {addingExercise && (
        <ExerciseForm
          title="Adicionar exercício"
          suggestions={exerciseNames}
          defaultRest={state.settings.defaultRestSeconds}
          onClose={() => setAddingExercise(false)}
          onSubmit={(v) => actions.addWorkoutExercise(v)}
        />
      )}
    </>
  );
}

function ExerciseCard({
  ex,
  globallyResting,
}: {
  ex: WorkoutExercise;
  globallyResting: boolean;
}) {
  const { actions } = useApp();
  const { confirm } = useFeedback();
  const firstPending = ex.sets.findIndex((s) => s.status === "pending");

  return (
    <div className="card">
      <div className="row">
        <h2>{ex.name}</h2>
        <TrashButton
          label={`Remover ${ex.name}`}
          onClick={async () => {
            if (await confirm({ title: `Remover ${ex.name}?` }))
              actions.removeWorkoutExercise(ex.id);
          }}
        />
      </div>
      {ex.sets.map((set, idx) => {
        const ready = idx === firstPending && !globallyResting;
        const locked = set.status === "pending" && !ready;
        return (
          <SetRow key={set.id} exId={ex.id} set={set} ready={ready} locked={locked} />
        );
      })}
      <button className="btn block" onClick={() => actions.addWorkoutSet(ex.id)}>
        + Adicionar série
      </button>
    </div>
  );
}

function SetRow({
  exId,
  set,
  ready,
  locked,
}: {
  exId: ID;
  set: WorkoutSet;
  ready: boolean;
  locked: boolean;
}) {
  const { actions } = useApp();
  const done = set.status === "done";
  const cls = "set " + (done ? "done" : locked ? "locked" : "");

  return (
    <div className={cls}>
      <div className="row">
        <b>
          S{set.setNumber}
          {done ? " ✓" : ""}
        </b>
        <span>{locked ? "🔒" : ""}</span>
      </div>
      <div className="set-inputs">
        <div className="field">
          <label htmlFor={`w-${set.id}`}>Carga (kg)</label>
          <input
            id={`w-${set.id}`}
            type="number"
            inputMode="decimal"
            value={set.weightKg}
            disabled={!ready}
            onChange={(e) =>
              actions.updateWorkoutSet(exId, set.id, { weightKg: Number(e.target.value) })
            }
          />
        </div>
        <div className="field">
          <label htmlFor={`r-${set.id}`}>Reps</label>
          <input
            id={`r-${set.id}`}
            type="number"
            inputMode="numeric"
            value={set.actualReps}
            disabled={!ready}
            onChange={(e) =>
              actions.updateWorkoutSet(exId, set.id, { actualReps: Number(e.target.value) })
            }
          />
        </div>
        <TrashButton
          label={`Remover série ${set.setNumber}`}
          onClick={() => actions.removeWorkoutSet(exId, set.id)}
        />
      </div>
      {ready && (
        <button
          className="btn primary"
          onClick={() =>
            actions.completeSet(exId, set.id, {
              actualReps: set.actualReps,
              weightKg: set.weightKg,
            })
          }
        >
          ✓ Série finalizada
        </button>
      )}
    </div>
  );
}

function CardioCard({ workout }: { workout: Workout }) {
  const { actions } = useApp();
  const [type, setType] = useState(workout.cardio?.type ?? "Esteira");
  const [minutes, setMinutes] = useState(workout.cardio?.durationMinutes ?? 15);

  return (
    <div className="card">
      <div className="eyebrow">Cardio (opcional)</div>
      {workout.cardio ? (
        <div className="row">
          <h2>
            {workout.cardio.type} • {workout.cardio.durationMinutes} min
          </h2>
          <TrashButton label="Remover cardio" onClick={() => actions.setCardio(undefined)} />
        </div>
      ) : (
        <>
          <p className="muted">Após a força, registre o cardio.</p>
          <div className="set-inputs">
            <div className="field">
              <label htmlFor="cardio-type">Tipo</label>
              <input id="cardio-type" value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="cardio-min">Minutos</label>
              <input
                id="cardio-min"
                type="number"
                inputMode="numeric"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </div>
            <button
              className="btn"
              onClick={() => actions.setCardio({ type, durationMinutes: minutes })}
            >
              Salvar
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------- Rotinas ----------
function RoutinesTab({ onStart }: { onStart: () => void }) {
  const { state, actions } = useApp();
  const { toast, confirm } = useFeedback();
  const [openId, setOpenId] = useState<ID | null>(null);
  const hasActive = !!state.activeWorkoutId;

  return (
    <>
      {state.routines.map((r) => (
        <div className="card" key={r.id}>
          <div className="row">
            <div>
              <span className="eyebrow">{r.day}</span>
              <h2>{r.name}</h2>
              <p className="muted">
                {r.exercises.length} exercícios{r.focus ? ` • ${r.focus}` : ""}
              </p>
            </div>
            <div className="stack">
              <button
                className="btn primary"
                disabled={hasActive}
                onClick={() => {
                  actions.startWorkout(r.id, todayISO());
                  onStart();
                }}
              >
                Começar
              </button>
              <button className="btn" onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                {openId === r.id ? "Fechar" : "Editar"}
              </button>
            </div>
          </div>
          {hasActive && (
            <p className="muted">Finalize o treino atual para iniciar outro.</p>
          )}
          {openId === r.id && <RoutineEditor routineId={r.id} />}
          <div style={{ marginTop: 8 }}>
            <TrashButton
              label={`Excluir ${r.name}`}
              onClick={async () => {
                if (await confirm({ title: `Excluir ${r.name}?`, message: "A rotina será removida." })) {
                  actions.removeRoutine(r.id);
                  toast("Rotina excluída");
                }
              }}
            />
          </div>
        </div>
      ))}
      <button
        className="btn primary"
        onClick={() => {
          const name = "Nova rotina";
          actions.addRoutine(name);
          toast("Rotina criada — edite os exercícios");
        }}
      >
        + Rotina
      </button>
    </>
  );
}

function RoutineEditor({ routineId }: { routineId: ID }) {
  const { state, actions } = useApp();
  const { confirm } = useFeedback();
  const routine = state.routines.find((r) => r.id === routineId);
  const [adding, setAdding] = useState(false);
  if (!routine) return null;

  const suggestions = [
    ...new Set(state.routines.flatMap((r) => r.exercises.map((e) => e.name))),
  ];

  return (
    <div style={{ marginTop: 10, borderTop: "1px solid #eee", paddingTop: 10 }}>
      {routine.exercises.length === 0 && (
        <p className="empty">Nenhum exercício. Adicione o primeiro abaixo.</p>
      )}
      {routine.exercises.map((ex) => (
        <div className="card" key={ex.id} style={{ background: "#faf9f7" }}>
          <div className="row">
            <h3>
              {ex.name}
              {ex.muscle ? ` • ${ex.muscle}` : ""}
            </h3>
            <TrashButton
              label={`Remover ${ex.name}`}
              onClick={async () => {
                if (await confirm({ title: `Remover ${ex.name}?` }))
                  actions.removeRoutineExercise(routine.id, ex.id);
              }}
            />
          </div>
          {ex.plannedSets.map((ps, i) => (
            <div className="set-inputs" key={ps.id}>
              <div className="field">
                <label htmlFor={`ps-w-${ps.id}`}>S{i + 1} carga</label>
                <input
                  id={`ps-w-${ps.id}`}
                  type="number"
                  inputMode="decimal"
                  value={ps.weightKg}
                  onChange={(e) =>
                    actions.updatePlannedSet(routine.id, ex.id, ps.id, {
                      weightKg: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="field">
                <label htmlFor={`ps-r-${ps.id}`}>Reps</label>
                <input
                  id={`ps-r-${ps.id}`}
                  type="number"
                  inputMode="numeric"
                  value={ps.reps}
                  onChange={(e) =>
                    actions.updatePlannedSet(routine.id, ex.id, ps.id, {
                      reps: Number(e.target.value),
                    })
                  }
                />
              </div>
              <TrashButton
                label={`Remover série ${i + 1}`}
                onClick={() => actions.removePlannedSet(routine.id, ex.id, ps.id)}
              />
            </div>
          ))}
          <button className="btn block" onClick={() => actions.addPlannedSet(routine.id, ex.id)}>
            + Adicionar série
          </button>
        </div>
      ))}
      <button className="btn primary" onClick={() => setAdding(true)}>
        + Adicionar exercício
      </button>
      {adding && (
        <ExerciseForm
          title="Adicionar exercício à rotina"
          suggestions={suggestions}
          defaultRest={state.settings.defaultRestSeconds}
          onClose={() => setAdding(false)}
          onSubmit={(v) => actions.addExerciseToRoutine(routine.id, v)}
        />
      )}
    </div>
  );
}

// ---------- Histórico ----------
function HistoryTab({ onEdit }: { onEdit: () => void }) {
  const { state, actions } = useApp();
  const { confirm } = useFeedback();
  const [registering, setRegistering] = useState(false);
  const done = state.workouts
    .filter((w) => w.completed)
    .sort((a, b) => b.date.localeCompare(a.date));

  const exerciseNames = [
    ...new Set(state.workouts.flatMap((w) => w.exercises.map((e) => e.name))),
  ];

  return (
    <>
      <div className="card">
        <div className="row">
          <h2>Histórico</h2>
          <button
            className="btn"
            disabled={!!state.activeWorkoutId}
            onClick={() => setRegistering(true)}
          >
            + Registrar treino
          </button>
        </div>
        {done.length === 0 ? (
          <p className="empty">
            Nenhum treino salvo. Comece um treino ou registre um passado.
          </p>
        ) : (
          done.map((w) => {
            const sets = w.exercises.reduce(
              (a, e) => a + e.sets.filter((s) => s.status === "done").length,
              0,
            );
            return (
              <div className="item" key={w.id}>
                <span className="grow">
                  <b>{w.routineName}</b>
                  <br />
                  <small className="muted">
                    {w.date} • {sets} séries • vol. {getWorkoutVolume(w)} kg
                    {w.cardio ? ` • cardio ${w.cardio.durationMinutes} min` : ""}
                  </small>
                </span>
                <button
                  className="btn"
                  onClick={() => {
                    actions.reopenWorkout(w.id);
                    onEdit();
                  }}
                >
                  Editar
                </button>
                <TrashButton
                  label="Excluir treino"
                  onClick={async () => {
                    if (await confirm({ title: "Excluir treino?", message: `${w.routineName} • ${w.date}` }))
                      actions.removeWorkout(w.id);
                  }}
                />
              </div>
            );
          })
        )}
      </div>

      {done.length > 0 && (
        <>
          <div className="card dark">
            <div className="eyebrow">Carga máxima registrada</div>
            <div className="metric">{getMaxLoad(state)} kg</div>
          </div>
          {exerciseNames.slice(0, 1).map((name) => (
            <Chart
              key={name}
              title={`Evolução de carga • ${name}`}
              unit="kg"
              points={getExerciseProgress(state, name)}
            />
          ))}
        </>
      )}

      {registering && <RegisterPastWorkout onClose={() => setRegistering(false)} onDone={onEdit} />}
    </>
  );
}

function RegisterPastWorkout({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { state, actions } = useApp();
  const [routineId, setRoutineId] = useState(state.routines[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());

  return (
    <Sheet title="Registrar treino passado" onClose={onClose}>
      <div className="stack">
        <div className="field">
          <label htmlFor="rp-routine">Rotina</label>
          <select id="rp-routine" value={routineId} onChange={(e) => setRoutineId(e.target.value)}>
            {state.routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="rp-date">Data</label>
          <input id="rp-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <p className="muted">
          O treino abre para edição: ajuste cargas/reps e finalize as séries.
        </p>
        <button
          className="btn primary"
          disabled={!routineId}
          onClick={() => {
            actions.startWorkout(routineId, date);
            onClose();
            onDone();
          }}
        >
          Abrir para edição
        </button>
      </div>
    </Sheet>
  );
}

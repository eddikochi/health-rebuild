import { useState } from "react";
import { Chart } from "../../components/Chart";
import { useFeedback } from "../../components/Feedback";
import { Sheet, Tabs, TrashButton } from "../../components/Sheet";
import {
  getBodySeries,
  getCalorieSeries,
  getConsistencyScore,
  getMaxLoad,
  getMonthlyGoalReadout,
  getVolumeSeries,
  getWaistSeries,
  getWeeklyCardioMinutes,
  getWeeklyInsight,
  getWeeklyWorkoutCount,
  getWeightSeries,
  getWeightTrend,
  SCORE_MAX,
} from "../../domain/analytics";
import { todayISO } from "../../domain/date";
import type { BodyMetricKey, ISODate } from "../../domain/types";
import { useApp } from "../../store/AppStore";
import { ConsistencyCalendar } from "./ConsistencyCalendar";

type Tab = "geral" | "corpo" | "performance" | "consistencia";
const TABS = [
  { id: "geral" as const, label: "Geral" },
  { id: "corpo" as const, label: "Corpo" },
  { id: "performance" as const, label: "Performance" },
  { id: "consistencia" as const, label: "Consistência" },
];

export function ProgressScreen() {
  const [tab, setTab] = useState<Tab>("geral");
  return (
    <section>
      <div className="eyebrow">Dados integrados</div>
      <h1>Progresso</h1>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "geral" && <GeneralTab />}
      {tab === "corpo" && <BodyTab />}
      {tab === "performance" && <PerformanceTab />}
      {tab === "consistencia" && <ConsistencyTab />}
    </section>
  );
}

function noData(state: ReturnType<typeof useApp>["state"]): boolean {
  return (
    state.workouts.length === 0 &&
    state.foodLogs.length === 0 &&
    state.waterLogs.length === 0 &&
    state.bodyMeasurements.length === 0
  );
}

function GeneralTab() {
  const { state } = useApp();
  const score = getConsistencyScore(state);
  const workouts = getWeeklyWorkoutCount(state, todayISO());

  if (noData(state)) {
    return (
      <div className="card">
        <p className="empty">
          Seu progresso começa aqui. Registre alguns dias para começarmos a mostrar tendências.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="card dark">
        <div className="eyebrow">Health Consistency Score</div>
        <div className="metric">{score.total}/100</div>
        <p>{workouts}/5 treinos nesta semana</p>
      </div>
      <Chart title="Tendência do peso" unit="kg" points={getWeightTrend(state)} />
      <Chart title="Kcal registradas" unit="kcal" points={getCalorieSeries(state)} />
      <div className="grid2">
        <div className="card">
          <div className="eyebrow">Carga máx.</div>
          <h2>{getMaxLoad(state)} kg</h2>
        </div>
        <div className="card">
          <div className="eyebrow">Cintura</div>
          <h2>{getWaistSeries(state).at(-1)?.value ?? "—"} cm</h2>
        </div>
      </div>
    </>
  );
}

const EXTRA_MEASURES: Array<{ key: BodyMetricKey; label: string; unit: string }> = [
  { key: "abdomenCm", label: "Abdômen", unit: "cm" },
  { key: "chestCm", label: "Peito", unit: "cm" },
  { key: "armLeftCm", label: "Braço E", unit: "cm" },
  { key: "armRightCm", label: "Braço D", unit: "cm" },
  { key: "thighLeftCm", label: "Coxa E", unit: "cm" },
  { key: "thighRightCm", label: "Coxa D", unit: "cm" },
];

function BodyTab() {
  const { state } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Chart title="Peso" unit="kg" points={getWeightSeries(state)} />
      <Chart title="Tendência (trend weight)" unit="kg" points={getWeightTrend(state)} />
      <Chart title="Cintura" unit="cm" points={getWaistSeries(state)} />
      {EXTRA_MEASURES.map((m) => {
        const series = getBodySeries(state, m.key);
        return series.length > 0 ? (
          <Chart key={m.key} title={m.label} unit={m.unit} points={series} />
        ) : null;
      })}
      <button className="btn primary" onClick={() => setOpen(true)}>
        + Registrar medida
      </button>
      {open && <MeasurementForm onClose={() => setOpen(false)} />}
    </>
  );
}

function MeasurementForm({ onClose }: { onClose: () => void }) {
  const { actions } = useApp();
  const [date, setDate] = useState(todayISO());
  const [more, setMore] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const set = (k: string, v: string) => setVals((s) => ({ ...s, [k]: v }));

  const numField = (key: BodyMetricKey, label: string) => (
    <div className="field" key={key}>
      <label htmlFor={`bm-${key}`}>{label}</label>
      <input
        id={`bm-${key}`}
        type="number"
        inputMode="decimal"
        value={vals[key] ?? ""}
        onChange={(e) => set(key, e.target.value)}
      />
    </div>
  );

  return (
    <Sheet title="Registrar medida" onClose={onClose}>
      <div className="stack">
        <div className="field">
          <label htmlFor="bm-date">Data</label>
          <input id="bm-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="grid2">
          {numField("weightKg", "Peso (kg)")}
          {numField("waistCm", "Cintura (cm)")}
        </div>
        {more && (
          <div className="grid2">{EXTRA_MEASURES.map((m) => numField(m.key, `${m.label} (${m.unit})`))}</div>
        )}
        <button className="btn ghost" onClick={() => setMore((v) => !v)}>
          {more ? "Menos medidas" : "Mais medidas (peito, braços, coxas)"}
        </button>
        <button
          className="btn primary"
          onClick={() => {
            const data: Record<string, number> = {};
            for (const [k, v] of Object.entries(vals)) {
              if (v !== "" && !Number.isNaN(Number(v))) data[k] = Number(v);
            }
            if (Object.keys(data).length === 0) return;
            actions.addMeasurement(date, data);
            onClose();
          }}
        >
          Salvar
        </button>
      </div>
    </Sheet>
  );
}

function PerformanceTab() {
  const { state } = useApp();
  const volume = getVolumeSeries(state);
  return (
    <>
      <div className="card dark">
        <div className="eyebrow">Carga máxima registrada</div>
        <div className="metric">{getMaxLoad(state)} kg</div>
      </div>
      <Chart title="Volume por treino" unit="kg" points={volume} />
      {volume.length === 0 && (
        <div className="card">
          <p className="empty">Finalize treinos para ver volume e evolução de carga.</p>
        </div>
      )}
    </>
  );
}

function ConsistencyTab() {
  const { state } = useApp();
  const [checkin, setCheckin] = useState(false);
  const score = getConsistencyScore(state);
  const rows: Array<[string, number, number]> = [
    ["Treino", score.treino, SCORE_MAX.treino],
    ["Cardio", score.cardio, SCORE_MAX.cardio],
    ["Alimentação", score.alimentacao, SCORE_MAX.alimentacao],
    ["Água", score.agua, SCORE_MAX.agua],
    ["Recuperação", score.recuperacao, SCORE_MAX.recuperacao],
    ["Check-in", score.checkin, SCORE_MAX.checkin],
  ];
  return (
    <>
      <MonthlyGoalsCard />
      <ConsistencyCalendar />

      <div className="card">
        <h2>Health Consistency Score</h2>
        <p className="muted">Hipótese MVP — cada linha é derivada dos seus registros.</p>
        {rows.map(([label, val, max]) => (
          <div className="item" key={label}>
            <span className="grow">{label}</span>
            <div className="bar" style={{ width: 120 }}>
              <i style={{ width: (val / max) * 100 + "%" }} />
            </div>
            <b>
              {val}/{max}
            </b>
          </div>
        ))}
        <div className="row" style={{ marginTop: 10 }}>
          <b>Total</b>
          <b>{score.total}/100</b>
        </div>
        <p className="muted" style={{ marginTop: 8 }}>
          Cardio: {getWeeklyCardioMinutes(state, todayISO())} min • Treinos:{" "}
          {getWeeklyWorkoutCount(state, todayISO())}/5 nesta semana.
        </p>
      </div>

      <CheckInCard onOpen={() => setCheckin(true)} />
      {checkin && <CheckInForm onClose={() => setCheckin(false)} />}
    </>
  );
}

function MonthlyGoalsCard() {
  const { state } = useApp();
  const readout = getMonthlyGoalReadout(state);
  return (
    <div className="card">
      <div className="row">
        <div>
          <div className="eyebrow">Metas de {readout.monthLabel}</div>
          <h2 style={{ margin: 0 }}>
            {readout.metCount}/{readout.total} alvos cumpridos
          </h2>
        </div>
        <span className="muted">{readout.weeks} semanas</span>
      </div>
      <div className="stack" style={{ marginTop: 12 }}>
        {readout.pillars.map((p) => (
          <div className="row" key={p.key} style={{ gap: 8 }}>
            <span className="grow">
              {p.icon} {p.label} <b>{p.done}</b>{" "}
              <small className="muted">· {p.targetText}</small>
            </span>
            <span className={"pill" + (p.status === "below" ? "" : " ok")}>
              {p.status === "in" ? "✓ " : ""}
              {p.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CheckInCard({ onOpen }: { onOpen: () => void }) {
  const { state, actions } = useApp();
  const { confirm } = useFeedback();
  const latest = [...state.weeklyCheckIns].sort((a, b) => b.date.localeCompare(a.date))[0];

  return (
    <div className="card">
      <div className="row">
        <h2>Check-in semanal</h2>
        <button className="btn" onClick={onOpen}>
          + Check-in
        </button>
      </div>
      <p className="muted">{getWeeklyInsight(state)}</p>
      {latest ? (
        <div className="item">
          <span className="grow">
            <b>{latest.date}</b>
            <br />
            <small className="muted">
              Energia {latest.energy}/5 • Sono {latest.sleep}/5 • Disposição {latest.readiness}/5
              {latest.notes ? ` • ${latest.notes}` : ""}
            </small>
          </span>
          <TrashButton
            label="Remover check-in"
            onClick={async () => {
              if (await confirm({ title: "Remover check-in?" })) actions.removeCheckIn(latest.id);
            }}
          />
        </div>
      ) : (
        <p className="empty">Nenhum check-in ainda. Registre como foi sua semana.</p>
      )}
    </div>
  );
}

function CheckInForm({ onClose }: { onClose: () => void }) {
  const { actions } = useApp();
  const [date, setDate] = useState<ISODate>(todayISO());
  const [energy, setEnergy] = useState(3);
  const [sleep, setSleep] = useState(3);
  const [readiness, setReadiness] = useState(3);
  const [notes, setNotes] = useState("");

  const scale = (label: string, value: number, setValue: (n: number) => void, id: string) => (
    <div className="field">
      <label id={`${id}-label`}>
        {label}: <b>{value}</b>
      </label>
      <div className="row" role="group" aria-labelledby={`${id}-label`} style={{ gap: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            className={"btn" + (n === value ? " primary" : " ghost")}
            style={{ flex: 1, width: "auto" }}
            aria-pressed={n === value}
            onClick={() => setValue(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Sheet title="Check-in semanal" onClose={onClose}>
      <div className="stack">
        <div className="field">
          <label htmlFor="ci-date">Data</label>
          <input id="ci-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {scale("Energia", energy, setEnergy, "ci-energy")}
        {scale("Sono", sleep, setSleep, "ci-sleep")}
        {scale("Disposição", readiness, setReadiness, "ci-readiness")}
        <div className="field">
          <label htmlFor="ci-notes">Notas (opcional)</label>
          <input id="ci-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <button
          className="btn primary"
          onClick={() => {
            actions.addCheckIn(date, { energy, sleep, readiness, notes: notes.trim() || undefined });
            onClose();
          }}
        >
          Salvar check-in
        </button>
      </div>
    </Sheet>
  );
}

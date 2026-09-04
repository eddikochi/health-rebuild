import { useState } from "react";
import { getDayActivity, type DayActivity } from "../../domain/analytics";
import { todayISO } from "../../domain/date";
import type { ISODate } from "../../domain/types";
import { useApp } from "../../store/AppStore";
import { RegisterPastWorkout } from "../workout/RegisterPastWorkout";

const WEEKDAYS = ["S", "T", "Q", "Q", "S", "S", "D"]; // Seg..Dom
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

// Intensidade laranja por pilares cumpridos (0..3). Sem vermelho punitivo (PRD §34).
const COLORS = ["#eee9e3", "#ffd9c6", "#ff9e73", "#ff5a1f"];

function iso(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function ConsistencyCalendar() {
  const { state } = useApp();
  const today = todayISO();
  const [ty, tm] = today.split("-").map(Number);
  const [year, setYear] = useState(ty);
  const [month, setMonth] = useState(tm - 1); // 0-based
  const [selectedDate, setSelectedDate] = useState<ISODate | null>(null);
  const selected = selectedDate ? getDayActivity(state, selectedDate) : null;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // 0 = segunda
  const cells: Array<number | null> = [
    ...Array<null>(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const shift = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y--;
    } else if (m > 11) {
      m = 0;
      y++;
    }
    setMonth(m);
    setYear(y);
    setSelectedDate(null);
  };

  return (
    <div className="card">
      <div className="row">
        <button className="icon neutral" aria-label="Mês anterior" onClick={() => shift(-1)}>
          ‹
        </button>
        <h2 style={{ margin: 0 }}>
          {MONTHS[month]} {year}
        </h2>
        <button className="icon neutral" aria-label="Próximo mês" onClick={() => shift(1)}>
          ›
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 4,
          marginTop: 12,
        }}
      >
        {WEEKDAYS.map((w, i) => (
          <div key={i} className="muted" style={{ textAlign: "center", fontSize: 12, fontWeight: 800 }}>
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day == null) return <div key={`e${i}`} />;
          const date = iso(year, month, day);
          const act = getDayActivity(state, date);
          const isToday = date === today;
          const isSel = selectedDate === date;
          const future = date > today;
          return (
            <button
              key={date}
              aria-label={`${day} — ${act.score}/3 pilares`}
              onClick={() => setSelectedDate(date)}
              style={{
                aspectRatio: "1 / 1",
                border: isToday ? "2px solid #202020" : "1px solid var(--border)",
                outline: isSel ? "3px solid var(--primary)" : "none",
                borderRadius: 10,
                background: future ? "transparent" : COLORS[act.score],
                color: act.score >= 2 ? "#fff" : "#333",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                opacity: future ? 0.4 : 1,
                minHeight: 0,
                padding: 0,
              }}
            >
              {day}
            </button>
          );
        })}
      </div>

      <div className="row" style={{ marginTop: 12, justifyContent: "flex-start", gap: 8 }}>
        <span className="muted" style={{ fontSize: 12 }}>
          Menos
        </span>
        {COLORS.map((c) => (
          <span
            key={c}
            aria-hidden
            style={{ width: 16, height: 16, borderRadius: 4, background: c, display: "inline-block" }}
          />
        ))}
        <span className="muted" style={{ fontSize: 12 }}>
          Mais
        </span>
      </div>

      {selected && (
        <DaySummary act={selected} goalMl={state.settings.waterGoalMl} isFuture={selected.date > today} />
      )}
    </div>
  );
}

function DaySummary({
  act,
  goalMl,
  isFuture,
}: {
  act: DayActivity;
  goalMl: number;
  isFuture: boolean;
}) {
  const [registering, setRegistering] = useState(false);
  return (
    <div className="card" style={{ background: "#faf9f7", marginBottom: 0 }}>
      <div className="eyebrow">{act.date}</div>
      {act.score === 0 ? (
        <p className="empty">Nenhum registro neste dia.</p>
      ) : (
        <div className="stack" style={{ marginTop: 6 }}>
          <div className="row">
            <span className="grow">{act.workout ? `🏋️ ${act.workoutName ?? "Treino"}` : "Sem treino"}</span>
            <span>{act.workout ? "✓" : "—"}</span>
          </div>
          <div className="row">
            <span className="grow">💧 {act.waterMl} / {goalMl} ml</span>
            <span>{act.waterHit ? "✓" : "—"}</span>
          </div>
          <div className="row">
            <span className="grow">🍽️ {act.kcal} kcal</span>
            <span>{act.foodLogged ? "✓" : "—"}</span>
          </div>
          {act.weightKg != null && (
            <div className="row">
              <span className="grow">⚖️ {act.weightKg} kg</span>
            </div>
          )}
        </div>
      )}
      {!act.workout && !isFuture && (
        <button className="btn block" style={{ marginTop: 10 }} onClick={() => setRegistering(true)}>
          + Registrar treino neste dia
        </button>
      )}
      {registering && (
        <RegisterPastWorkout presetDate={act.date} onClose={() => setRegistering(false)} />
      )}
    </div>
  );
}

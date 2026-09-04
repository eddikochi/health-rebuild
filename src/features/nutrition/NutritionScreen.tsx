import { useState } from "react";
import { useFeedback } from "../../components/Feedback";
import { InputSheet } from "../../components/InputSheet";
import { Tabs, TrashButton } from "../../components/Sheet";
import { getDailyCalories } from "../../domain/analytics";
import { todayISO, weekStartISO } from "../../domain/date";
import { MEALS, type Food, type ISODate, type Meal } from "../../domain/types";
import { useApp } from "../../store/AppStore";
import { FoodLogForm } from "./FoodLogForm";

type Tab = "hoje" | "plano" | "alimentos";
const TABS = [
  { id: "hoje" as const, label: "Hoje" },
  { id: "plano" as const, label: "Plano semanal" },
  { id: "alimentos" as const, label: "Alimentos" },
];

export function NutritionScreen() {
  const [tab, setTab] = useState<Tab>("hoje");
  const [date, setDate] = useState<ISODate>(todayISO());
  return (
    <section>
      <div className="eyebrow">Alimentação</div>
      <h1>Cardápio</h1>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "hoje" && <TodayTab date={date} setDate={setDate} />}
      {tab === "plano" && <PlanTab onPick={(d) => { setDate(d); setTab("hoje"); }} />}
      {tab === "alimentos" && <LibraryTab />}
    </section>
  );
}

function TodayTab({ date, setDate }: { date: ISODate; setDate: (d: ISODate) => void }) {
  const { state, actions } = useApp();
  const [addMeal, setAddMeal] = useState<Meal | null>(null);
  const [editLimit, setEditLimit] = useState(false);
  const total = getDailyCalories(state, date);
  const limit = state.settings.calorieLimit;
  const over = total > limit;

  return (
    <>
      <div className="card">
        <div className="field">
          <label htmlFor="food-date">Data do registro</label>
          <input
            id="food-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {MEALS.map((meal) => {
        const logs = state.foodLogs.filter((l) => l.date === date && l.meal === meal);
        const kcal = Math.round(
          logs.filter((l) => l.consumed).reduce((a, l) => a + (l.kcalPer100g * l.grams) / 100, 0),
        );
        return (
          <div className="card" key={meal}>
            <div className="row">
              <div>
                <h2>{meal}</h2>
                <span className="muted">{kcal} kcal registradas</span>
              </div>
            </div>
            {logs.length === 0 ? (
              <p className="empty">Nenhum alimento.</p>
            ) : (
              logs.map((l) => (
                <div className="item" key={l.id}>
                  <input
                    type="checkbox"
                    aria-label={`Consumido: ${l.name}`}
                    checked={l.consumed}
                    onChange={() => actions.toggleFoodLog(l.id)}
                  />
                  <span className="grow">
                    {l.name}
                    <br />
                    <small className="muted">
                      {l.kcalPer100g} kcal/100g • {Math.round((l.kcalPer100g * l.grams) / 100)} kcal
                    </small>
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    aria-label={`Gramas de ${l.name}`}
                    style={{ width: 80 }}
                    value={l.grams}
                    onChange={(e) => actions.updateFoodLog(l.id, { grams: Number(e.target.value) })}
                  />
                  <TrashButton label={`Remover ${l.name}`} onClick={() => actions.removeFoodLog(l.id)} />
                </div>
              ))
            )}
            <button className="btn block" onClick={() => setAddMeal(meal)}>
              + Alimento
            </button>
          </div>
        );
      })}

      <div className="card">
        <div className="eyebrow">Calculadora diária</div>
        <h2>
          {total} / {limit} kcal
        </h2>
        <div className={"bar" + (over ? " over" : "")}>
          <i style={{ width: Math.min(100, (total / limit) * 100) + "%" }} />
        </div>
        <p className="muted">
          {over
            ? `${total - limit} kcal acima do limite`
            : `${limit - total} kcal restantes`}
        </p>
        <button className="btn" onClick={() => setEditLimit(true)}>
          Definir limite diário
        </button>
      </div>

      {addMeal && <FoodLogForm date={date} meal={addMeal} onClose={() => setAddMeal(null)} />}
      {editLimit && (
        <InputSheet
          title="Limite diário de kcal"
          fields={[{ key: "limit", label: "kcal", type: "number", min: 1, value: String(limit) }]}
          onClose={() => setEditLimit(false)}
          onSubmit={(v) => {
            const n = Number(v.limit);
            if (n > 0) actions.updateSettings({ calorieLimit: n });
          }}
        />
      )}
    </>
  );
}

function PlanTab({ onPick }: { onPick: (d: ISODate) => void }) {
  const { state } = useApp();
  const start = weekStartISO(todayISO());
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start + "T00:00:00");
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
  const labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

  return (
    <div className="card">
      <h2>Plano semanal</h2>
      <p className="muted">Toque em um dia para montar o cardápio dele.</p>
      {days.map((d, i) => (
        <div className="item" key={d}>
          <span className="grow">
            <b>{labels[i]}</b> <small className="muted">{d}</small>
          </span>
          <span className="pill">{getDailyCalories(state, d)} kcal</span>
          <button className="btn" onClick={() => onPick(d)}>
            Abrir
          </button>
        </div>
      ))}
    </div>
  );
}

function LibraryTab() {
  const { state, actions } = useApp();
  const { confirm } = useFeedback();
  const [editing, setEditing] = useState<Food | null>(null);
  const [adding, setAdding] = useState(false);
  const mealOptions = MEALS.map((m) => ({ value: m, label: m }));

  return (
    <div className="card">
      <h2>Biblioteca de alimentos</h2>
      {state.foods.length === 0 && <p className="empty">Nenhum alimento cadastrado.</p>}
      {state.foods.map((f) => (
        <div className="item" key={f.id}>
          <span className="grow">
            {f.name} • {f.kcalPer100g} kcal/100g • <small className="muted">{f.meal}</small>
          </span>
          <button className="btn" aria-label={`Editar ${f.name}`} onClick={() => setEditing(f)}>
            Editar
          </button>
          <TrashButton
            label={`Remover ${f.name}`}
            onClick={async () => {
              if (await confirm({ title: `Remover ${f.name}?` })) actions.removeFood(f.id);
            }}
          />
        </div>
      ))}
      <button className="btn primary" onClick={() => setAdding(true)}>
        + Alimento
      </button>

      {editing && (
        <InputSheet
          title={`Editar ${editing.name}`}
          fields={[
            { key: "name", label: "Nome", value: editing.name },
            { key: "kcal", label: "kcal / 100 g", type: "number", min: 0, value: String(editing.kcalPer100g) },
            { key: "meal", label: "Refeição", value: editing.meal, options: mealOptions },
          ]}
          onClose={() => setEditing(null)}
          onSubmit={(v) => {
            const name = v.name.trim();
            const kcal = Number(v.kcal);
            actions.updateFood(editing.id, {
              name: name || editing.name,
              kcalPer100g: kcal >= 0 ? kcal : editing.kcalPer100g,
              meal: v.meal as Meal,
            });
          }}
        />
      )}
      {adding && (
        <InputSheet
          title="Novo alimento"
          submitLabel="Adicionar"
          fields={[
            { key: "name", label: "Nome", value: "" },
            { key: "kcal", label: "kcal / 100 g", type: "number", min: 0, value: "100" },
            { key: "meal", label: "Refeição", value: "Almoço", options: mealOptions },
          ]}
          onClose={() => setAdding(false)}
          onSubmit={(v) => {
            const name = v.name.trim();
            if (!name) return;
            const kcal = Number(v.kcal);
            actions.addFood(name, kcal >= 0 ? kcal : 0, v.meal as Meal);
          }}
        />
      )}
    </div>
  );
}

import { useState } from "react";
import { Sheet } from "../../components/Sheet";
import { MEALS, type Meal } from "../../domain/types";
import { presetGrams, UNIT_PRESETS } from "../../domain/portions";

export interface FoodFormValue {
  name: string;
  kcalPer100g: number;
  meal: Meal;
  unitLabel: string;
  unitGrams: number;
}

interface Props {
  title: string;
  submitLabel?: string;
  initial?: Partial<FoodFormValue>;
  onSubmit: (value: FoodFormValue) => void;
  onClose: () => void;
}

const CUSTOM = "__custom__";

export function FoodForm({ title, submitLabel = "Salvar", initial, onSubmit, onClose }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [kcal, setKcal] = useState(initial?.kcalPer100g ?? 100);
  const [meal, setMeal] = useState<Meal>(initial?.meal ?? "Almoço");

  const initialLabel = initial?.unitLabel ?? "unidade";
  const isKnown = UNIT_PRESETS.some((p) => p.label === initialLabel);
  const [unitSel, setUnitSel] = useState(isKnown ? initialLabel : CUSTOM);
  const [customLabel, setCustomLabel] = useState(isKnown ? "" : initialLabel);
  const [grams, setGrams] = useState(initial?.unitGrams ?? presetGrams(initialLabel) ?? 100);
  const [adjust, setAdjust] = useState(false);

  const unitLabel = unitSel === CUSTOM ? customLabel.trim() || "porção" : unitSel;

  const onUnitChange = (value: string) => {
    setUnitSel(value);
    const g = presetGrams(value);
    if (g != null) setGrams(g); // sugere o peso da porção escolhida
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, kcalPer100g: kcal, meal, unitLabel, unitGrams: grams });
    onClose();
  };

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="stack">
        <div className="field">
          <label htmlFor="ff-name">Nome</label>
          <input id="ff-name" value={name} autoFocus onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="ff-kcal">kcal / 100 g</label>
            <input
              id="ff-kcal"
              type="number"
              inputMode="numeric"
              value={kcal}
              onChange={(e) => setKcal(Number(e.target.value))}
            />
          </div>
          <div className="field">
            <label htmlFor="ff-meal">Refeição</label>
            <select id="ff-meal" value={meal} onChange={(e) => setMeal(e.target.value as Meal)}>
              {MEALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="ff-unit">Como você mede? (porção)</label>
          <select id="ff-unit" value={unitSel} onChange={(e) => onUnitChange(e.target.value)}>
            {UNIT_PRESETS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label}
              </option>
            ))}
            <option value={CUSTOM}>Outra…</option>
          </select>
        </div>
        {unitSel === CUSTOM && (
          <div className="field">
            <label htmlFor="ff-custom">Nome da porção</label>
            <input
              id="ff-custom"
              value={customLabel}
              placeholder="ex.: bife, punhado, pão francês"
              onChange={(e) => setCustomLabel(e.target.value)}
            />
          </div>
        )}

        <div className="card" style={{ background: "#faf9f7", margin: 0 }}>
          <div className="row">
            <span className="grow muted">
              1 {unitLabel} ≈ <b>{grams} g</b>
            </span>
            <button className="btn ghost" style={{ width: "auto" }} onClick={() => setAdjust((a) => !a)}>
              {adjust ? "Ok" : "Ajustar peso"}
            </button>
          </div>
          {adjust && (
            <div className="field" style={{ marginTop: 8 }}>
              <label htmlFor="ff-grams">Peso médio de 1 {unitLabel} (g)</label>
              <input
                id="ff-grams"
                type="number"
                inputMode="numeric"
                value={grams}
                onChange={(e) => setGrams(Number(e.target.value))}
              />
              <small className="muted">Sugestão automática — refine quando quiser.</small>
            </div>
          )}
        </div>

        <button className="btn primary" onClick={submit}>
          {submitLabel}
        </button>
      </div>
    </Sheet>
  );
}

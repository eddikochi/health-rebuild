import { useState } from "react";
import { Sheet } from "../../components/Sheet";
import type { ISODate, Meal } from "../../domain/types";
import { useApp } from "../../store/AppStore";

interface Props {
  date: ISODate;
  meal: Meal;
  onClose: () => void;
}

export function FoodLogForm({ date, meal, onClose }: Props) {
  const { state, actions } = useApp();
  const libForMeal = state.foods.filter((f) => f.meal === meal);

  const [name, setName] = useState("");
  const [kcal, setKcal] = useState(100);
  const [unitLabel, setUnitLabel] = useState("porção");
  const [unitGrams, setUnitGrams] = useState(100);
  const [quantity, setQuantity] = useState(1);
  const [saveToLibrary, setSaveToLibrary] = useState(false);
  const [fromLibrary, setFromLibrary] = useState(false);

  const grams = Math.round(quantity * unitGrams);
  const totalKcal = Math.round((kcal * grams) / 100);

  const pickFromLibrary = (foodId: string) => {
    const f = state.foods.find((x) => x.id === foodId);
    if (!f) return;
    setName(f.name);
    setKcal(f.kcalPer100g);
    setUnitLabel(f.unitLabel);
    setUnitGrams(f.unitGrams);
    setQuantity(1);
    setFromLibrary(true);
    setSaveToLibrary(false);
  };

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed || quantity <= 0) return;
    actions.addFoodLog(date, {
      name: trimmed,
      kcalPer100g: kcal,
      meal,
      quantity,
      unitLabel: unitLabel.trim() || "porção",
      unitGrams,
    });
    if (saveToLibrary && !fromLibrary) {
      actions.addFood(trimmed, kcal, meal, unitLabel.trim() || "porção", unitGrams);
    }
    onClose();
  };

  return (
    <Sheet title={`Adicionar em ${meal}`} onClose={onClose}>
      {libForMeal.length > 0 && (
        <>
          <div className="eyebrow">Da biblioteca</div>
          <div className="stack" style={{ margin: "8px 0 16px" }}>
            {libForMeal.map((f) => (
              <button
                key={f.id}
                className={"btn ghost block" + (fromLibrary && f.name === name ? " primary" : "")}
                onClick={() => pickFromLibrary(f.id)}
              >
                {f.name} • 1 {f.unitLabel} ≈ {f.unitGrams} g
              </button>
            ))}
          </div>
        </>
      )}

      <div className="eyebrow">{fromLibrary ? "Quantidade" : "Novo alimento"}</div>
      <div className="stack" style={{ marginTop: 8 }}>
        {!fromLibrary && (
          <>
            <div className="field">
              <label htmlFor="fl-name">Nome</label>
              <input
                id="fl-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setFromLibrary(false);
                }}
              />
            </div>
            <div className="grid2">
              <div className="field">
                <label htmlFor="fl-kcal">kcal / 100 g</label>
                <input
                  id="fl-kcal"
                  type="number"
                  inputMode="numeric"
                  value={kcal}
                  onChange={(e) => setKcal(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label htmlFor="fl-unit">Unidade</label>
                <input
                  id="fl-unit"
                  value={unitLabel}
                  placeholder="ovo, fatia, colher…"
                  onChange={(e) => setUnitLabel(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="fl-ug">Peso médio de 1 {unitLabel || "unidade"} (g)</label>
                <input
                  id="fl-ug"
                  type="number"
                  inputMode="numeric"
                  value={unitGrams}
                  onChange={(e) => setUnitGrams(Number(e.target.value))}
                />
              </div>
            </div>
          </>
        )}

        <div className="field">
          <label htmlFor="fl-qty">
            Quantidade{fromLibrary ? ` — ${name}` : ""} ({unitLabel || "unidade"})
          </label>
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn ghost"
              aria-label="Diminuir"
              style={{ width: "auto" }}
              onClick={() => setQuantity((q) => Math.max(0.5, Math.round((q - 0.5) * 2) / 2))}
            >
              −
            </button>
            <input
              id="fl-qty"
              type="number"
              inputMode="decimal"
              step="0.5"
              min={0.5}
              style={{ textAlign: "center" }}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <button
              className="btn ghost"
              aria-label="Aumentar"
              style={{ width: "auto" }}
              onClick={() => setQuantity((q) => Math.round((q + 0.5) * 2) / 2)}
            >
              +
            </button>
          </div>
        </div>

        <div className="card" style={{ background: "#faf9f7", margin: 0 }}>
          <div className="row">
            <span className="grow muted">
              {quantity} {unitLabel || "un."} • {grams} g
            </span>
            <b>{totalKcal} kcal</b>
          </div>
        </div>

        {fromLibrary ? (
          <button className="btn ghost" onClick={() => setFromLibrary(false)}>
            Editar alimento / criar novo
          </button>
        ) : (
          <label className="item" style={{ borderBottom: "none" }}>
            <input
              type="checkbox"
              checked={saveToLibrary}
              onChange={(e) => setSaveToLibrary(e.target.checked)}
            />
            <span className="grow">Salvar na biblioteca para reutilizar</span>
          </label>
        )}

        <button className="btn primary" onClick={submit}>
          Adicionar
        </button>
      </div>
    </Sheet>
  );
}

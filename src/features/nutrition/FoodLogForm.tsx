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
  const [grams, setGrams] = useState(100);
  const [saveToLibrary, setSaveToLibrary] = useState(false);

  const addFromLibrary = (foodId: string) => {
    const f = state.foods.find((x) => x.id === foodId);
    if (!f) return;
    actions.addFoodLog(date, { name: f.name, kcalPer100g: f.kcalPer100g, grams: 100, meal });
    onClose();
  };

  const submitCustom = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    actions.addFoodLog(date, { name: trimmed, kcalPer100g: kcal, grams, meal });
    if (saveToLibrary) actions.addFood(trimmed, kcal, meal);
    onClose();
  };

  return (
    <Sheet title={`Adicionar em ${meal}`} onClose={onClose}>
      {libForMeal.length > 0 && (
        <>
          <div className="eyebrow">Da biblioteca</div>
          <div className="stack" style={{ margin: "8px 0 16px" }}>
            {libForMeal.map((f) => (
              <button key={f.id} className="btn ghost block" onClick={() => addFromLibrary(f.id)}>
                {f.name} • {f.kcalPer100g} kcal/100g
              </button>
            ))}
          </div>
        </>
      )}
      <div className="eyebrow">Novo alimento</div>
      <div className="stack" style={{ marginTop: 8 }}>
        <div className="field">
          <label htmlFor="fl-name">Nome</label>
          <input id="fl-name" value={name} onChange={(e) => setName(e.target.value)} />
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
            <label htmlFor="fl-grams">Gramas</label>
            <input
              id="fl-grams"
              type="number"
              inputMode="numeric"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
            />
          </div>
        </div>
        <label className="item" style={{ borderBottom: "none" }}>
          <input
            type="checkbox"
            checked={saveToLibrary}
            onChange={(e) => setSaveToLibrary(e.target.checked)}
          />
          <span className="grow">Salvar na biblioteca para reutilizar</span>
        </label>
        <button className="btn primary" onClick={submitCustom}>
          Adicionar
        </button>
      </div>
    </Sheet>
  );
}

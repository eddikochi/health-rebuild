import { useState } from "react";
import { Sheet } from "../../components/Sheet";

export interface ExerciseFormValue {
  name: string;
  muscle?: string;
  restSeconds: number;
  sets: number;
  reps: number;
  weightKg: number;
}

interface Props {
  title: string;
  suggestions?: string[];
  defaultRest: number;
  onSubmit: (value: ExerciseFormValue) => void;
  onClose: () => void;
}

// Sem prompt() — bottom sheet real (PRD §42.1).
export function ExerciseForm({ title, suggestions = [], defaultRest, onSubmit, onClose }: Props) {
  const [name, setName] = useState("");
  const [muscle, setMuscle] = useState("");
  const [sets, setSets] = useState(4);
  const [reps, setReps] = useState(10);
  const [weightKg, setWeightKg] = useState(20);
  const [restSeconds, setRestSeconds] = useState(defaultRest);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, muscle: muscle.trim() || undefined, sets, reps, weightKg, restSeconds });
    onClose();
  };

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="stack">
        <div className="field">
          <label htmlFor="ex-name">Nome do exercício</label>
          <input
            id="ex-name"
            list="ex-suggestions"
            value={name}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Leg press"
          />
          <datalist id="ex-suggestions">
            {suggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="ex-muscle">Grupo muscular (opcional)</label>
          <input
            id="ex-muscle"
            value={muscle}
            onChange={(e) => setMuscle(e.target.value)}
            placeholder="Ex.: Pernas"
          />
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="ex-sets">Séries</label>
            <input
              id="ex-sets"
              type="number"
              inputMode="numeric"
              min={1}
              value={sets}
              onChange={(e) => setSets(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="field">
            <label htmlFor="ex-reps">Reps</label>
            <input
              id="ex-reps"
              type="number"
              inputMode="numeric"
              min={1}
              value={reps}
              onChange={(e) => setReps(Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="field">
            <label htmlFor="ex-weight">Carga (kg)</label>
            <input
              id="ex-weight"
              type="number"
              inputMode="decimal"
              min={0}
              value={weightKg}
              onChange={(e) => setWeightKg(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className="field">
            <label htmlFor="ex-rest">Descanso (s)</label>
            <select
              id="ex-rest"
              value={restSeconds}
              onChange={(e) => setRestSeconds(Number(e.target.value))}
            >
              <option value={60}>60 s</option>
              <option value={90}>90 s</option>
              <option value={120}>120 s</option>
            </select>
          </div>
        </div>
        <button className="btn primary" onClick={submit}>
          Adicionar exercício
        </button>
      </div>
    </Sheet>
  );
}

import { useState } from "react";
import { useFeedback } from "../../components/Feedback";
import { Sheet } from "../../components/Sheet";
import { todayISO } from "../../domain/date";
import type { ISODate } from "../../domain/types";
import { useApp } from "../../store/AppStore";

interface Props {
  presetDate?: ISODate;
  onClose: () => void;
  onLogged?: () => void;
}

// Registra um treino passado já concluído (não depende de treino ativo).
export function RegisterPastWorkout({ presetDate, onClose, onLogged }: Props) {
  const { state, actions } = useApp();
  const { toast } = useFeedback();
  const [routineId, setRoutineId] = useState(state.routines[0]?.id ?? "");
  const [date, setDate] = useState<ISODate>(presetDate ?? todayISO());

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
          As séries entram concluídas com as cargas planejadas da rotina. Você pode ajustar
          cargas/reps depois em <b>Editar</b>, no histórico.
        </p>
        <button
          className="btn primary"
          disabled={!routineId}
          onClick={() => {
            actions.logPastWorkout(routineId, date);
            toast("Treino registrado");
            onLogged?.();
            onClose();
          }}
        >
          Registrar treino
        </button>
      </div>
    </Sheet>
  );
}

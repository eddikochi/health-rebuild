import { useState } from "react";
import { nowISO, todayISO } from "../../domain/date";
import { GOALS } from "../../domain/types";
import { useApp } from "../../store/AppStore";
import type { Screen } from "../../App";

const TOTAL_STEPS = 5;

export function Onboarding({ navigate, onDone }: { navigate: (s: Screen) => void; onDone: () => void }) {
  const { state, actions } = useApp();
  const [step, setStep] = useState(0);

  const [age, setAge] = useState(String(state.profile.age));
  const [height, setHeight] = useState(String(state.profile.heightCm));
  const [weight, setWeight] = useState(String(state.profile.baselineWeightKg));
  const [goals, setGoals] = useState<string[]>(state.goals);
  const [weeklyGoal, setWeeklyGoal] = useState(String(state.settings.weeklyGoalPct));
  const [waterGoal, setWaterGoal] = useState(String(state.settings.waterGoalMl));

  const toggleGoal = (g: string) =>
    setGoals((cur) => (cur.includes(g) ? cur.filter((x) => x !== g) : [...cur, g]));

  const persist = () => {
    const ageN = Number(age);
    const heightN = Number(height);
    const weightN = Number(weight);
    actions.updateProfile({
      age: ageN > 0 ? ageN : state.profile.age,
      heightCm: heightN > 0 ? heightN : state.profile.heightCm,
      baselineWeightKg: weightN > 0 ? weightN : state.profile.baselineWeightKg,
    });
    if (weightN > 0) actions.addMeasurement(todayISO(), { weightKg: weightN });
    actions.setGoals(goals);
    const wg = Number(weeklyGoal);
    const water = Number(waterGoal);
    actions.updateSettings({
      weeklyGoalPct: wg >= 1 && wg <= 100 ? wg : state.settings.weeklyGoalPct,
      waterGoalMl: water > 0 ? water : state.settings.waterGoalMl,
    });
  };

  const finish = (target?: Screen) => {
    persist();
    actions.updateSettings({ onboardedAt: nowISO() });
    onDone();
    if (target) navigate(target);
  };

  const skip = () => {
    actions.updateSettings({ onboardedAt: nowISO() });
    onDone();
  };

  const next = () => setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "var(--background)",
        overflow: "auto",
      }}
    >
      <div className="app" style={{ paddingBottom: 24, minHeight: "auto" }}>
        {/* progresso */}
        <div className="row" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {Array.from({ length: TOTAL_STEPS }, (_, i) => (
              <span
                key={i}
                aria-hidden
                style={{
                  width: i === step ? 22 : 8,
                  height: 8,
                  borderRadius: 99,
                  background: i <= step ? "var(--primary)" : "#ddd",
                  transition: "width .2s",
                }}
              />
            ))}
          </div>
          {step < TOTAL_STEPS - 1 && (
            <button className="btn ghost" style={{ width: "auto" }} onClick={skip}>
              Pular
            </button>
          )}
        </div>

        {step === 0 && (
          <div>
            <div style={{ fontSize: 44 }} aria-hidden>
              👋
            </div>
            <h1>Bem-vindo ao Health Rebuild</h1>
            <p className="muted">
              Seu sistema para reconstruir saúde e consistência depois dos 40. Vamos configurar o
              essencial em 1 minuto — dá para ajustar tudo depois.
            </p>
            <div className="card">
              <p style={{ margin: 0 }}>
                <b>Faça → Registre → Meça → Ajuste.</b> Você verá o que fazer hoje e a evolução ao
                longo das semanas.
              </p>
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <div className="eyebrow">Passo 1</div>
            <h1>Seus dados</h1>
            <p className="muted">Usamos para personalizar o acompanhamento.</p>
            <div className="card stack">
              <div className="field">
                <label htmlFor="ob-age">Idade</label>
                <input id="ob-age" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="ob-height">Altura (cm)</label>
                <input id="ob-height" type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="ob-weight">Peso atual (kg)</label>
                <input id="ob-weight" type="number" inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} />
                <small className="muted">Vira o primeiro ponto do seu gráfico de peso.</small>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="eyebrow">Passo 2</div>
            <h1>Seus objetivos</h1>
            <p className="muted">Selecione o que faz sentido agora.</p>
            <div className="card">
              {GOALS.map((g) => (
                <label className="item" key={g}>
                  <input type="checkbox" checked={goals.includes(g)} onChange={() => toggleGoal(g)} />
                  <span className="grow">{g}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="eyebrow">Passo 3</div>
            <h1>Metas</h1>
            <p className="muted">Valores iniciais — ajuste quando quiser.</p>
            <div className="card stack">
              <div className="field">
                <label htmlFor="ob-week">Meta semanal de consistência (%)</label>
                <input id="ob-week" type="number" inputMode="numeric" value={weeklyGoal} onChange={(e) => setWeeklyGoal(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="ob-water">Meta diária de água (ml)</label>
                <input id="ob-water" type="number" inputMode="numeric" value={waterGoal} onChange={(e) => setWaterGoal(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div style={{ fontSize: 44 }} aria-hidden>
              🎉
            </div>
            <h1>Tudo pronto!</h1>
            <div className="card">
              <p style={{ marginTop: 0 }}>
                Seu programa <b>Full Body A–E</b> já está montado e a biblioteca de alimentos com
                porções também. Você pode editar tudo a qualquer momento.
              </p>
              <p className="muted" style={{ marginBottom: 0 }}>
                Comece registrando seu dia: treino, água e alimentação.
              </p>
            </div>
            <button className="btn primary" onClick={() => finish("treino")}>
              Ver meu treino
            </button>
            <button className="btn ghost block" style={{ marginTop: 8 }} onClick={() => finish("hoje")}>
              Ir para a tela Hoje
            </button>
          </div>
        )}

        {/* navegação */}
        {step < TOTAL_STEPS - 1 && (
          <div className="row" style={{ marginTop: 16, gap: 8 }}>
            {step > 0 ? (
              <button className="btn ghost" style={{ flex: 1 }} onClick={back}>
                Voltar
              </button>
            ) : (
              <span style={{ flex: 1 }} />
            )}
            <button className="btn primary" style={{ flex: 2 }} onClick={next}>
              {step === 0 ? "Vamos começar" : "Avançar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

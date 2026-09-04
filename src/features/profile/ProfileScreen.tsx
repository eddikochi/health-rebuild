import { useState } from "react";
import { useFeedback } from "../../components/Feedback";
import { InputSheet } from "../../components/InputSheet";
import { Tabs, TrashButton } from "../../components/Sheet";
import { getDailyWaterMl } from "../../domain/analytics";
import { todayISO } from "../../domain/date";
import { useApp } from "../../store/AppStore";

type Tab = "dados" | "objetivos" | "hidratacao" | "preferencias";
const TABS = [
  { id: "dados" as const, label: "Dados" },
  { id: "objetivos" as const, label: "Objetivos" },
  { id: "hidratacao" as const, label: "Hidratação" },
  { id: "preferencias" as const, label: "Preferências" },
];

export function ProfileScreen() {
  const [tab, setTab] = useState<Tab>("dados");
  return (
    <section>
      <div className="eyebrow">Configurações</div>
      <h1>Perfil</h1>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      {tab === "dados" && <DataTab />}
      {tab === "objetivos" && <GoalsTab />}
      {tab === "hidratacao" && <HydrationTab />}
      {tab === "preferencias" && <PrefsTab />}
    </section>
  );
}

function DataTab() {
  const { state } = useApp();
  const { profile } = state;
  return (
    <div className="card">
      <p>
        Idade <b>{profile.age}</b>
      </p>
      <p>
        Altura <b>{profile.heightCm} cm</b>
      </p>
      <p>
        Baseline <b>{profile.baselineWeightKg} kg</b>
      </p>
    </div>
  );
}

function GoalsTab() {
  return (
    <div className="card">
      <h2>Objetivos</h2>
      {["Reduzir gordura", "Melhorar condicionamento", "Manter/ganhar massa"].map((g) => (
        <label className="item" key={g}>
          <input type="checkbox" defaultChecked />
          <span className="grow">{g}</span>
        </label>
      ))}
      <p className="muted">Objetivos concretos alimentarão a meta semanal em versões futuras.</p>
    </div>
  );
}

function HydrationTab() {
  const { state, actions } = useApp();
  const today = todayISO();
  const [addContainer, setAddContainer] = useState(false);
  const logs = state.waterLogs.filter((l) => l.date === today);
  const total = getDailyWaterMl(state, today);

  return (
    <>
      <div className="card">
        <div className="row">
          <div>
            <div className="eyebrow">Hoje</div>
            <h2>
              {total} / {state.settings.waterGoalMl} ml
            </h2>
          </div>
        </div>
        {logs.length === 0 ? (
          <p className="empty">Nenhum registro hoje.</p>
        ) : (
          logs.map((l) => (
            <div className="item" key={l.id}>
              <input
                type="checkbox"
                aria-label={`Consumido: ${l.ml} ml`}
                checked={l.consumed}
                onChange={() => actions.toggleWaterLog(l.id)}
              />
              <span className="grow">{l.ml} ml</span>
              <TrashButton label="Remover registro" onClick={() => actions.removeWaterLog(l.id)} />
            </div>
          ))
        )}
      </div>

      <div className="card">
        <div className="eyebrow">Recipientes rápidos</div>
        <div className="stack" style={{ marginTop: 8 }}>
          {state.waterContainers.map((c) => (
            <div className="item" key={c.id}>
              <button className="btn grow" onClick={() => actions.addWaterLog(today, c.ml, true)}>
                + {c.ml} ml
              </button>
              <TrashButton label={`Remover recipiente ${c.ml} ml`} onClick={() => actions.removeContainer(c.id)} />
            </div>
          ))}
        </div>
        <button className="btn primary" style={{ marginTop: 8 }} onClick={() => setAddContainer(true)}>
          + Recipiente
        </button>
      </div>
      {addContainer && (
        <InputSheet
          title="Novo recipiente"
          submitLabel="Adicionar"
          fields={[{ key: "ml", label: "Volume (ml)", type: "number", min: 1, value: "500" }]}
          onClose={() => setAddContainer(false)}
          onSubmit={(v) => {
            const ml = Number(v.ml);
            if (ml > 0) actions.addContainer(ml);
          }}
        />
      )}
    </>
  );
}

function PrefsTab() {
  const { state, actions } = useApp();
  const { confirm, toast } = useFeedback();
  const s = state.settings;

  const numberPref = (label: string, key: keyof typeof s, current: number) => (
    <div className="item">
      <span className="grow">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        style={{ width: 100 }}
        value={current}
        onChange={(e) => actions.updateSettings({ [key]: Number(e.target.value) } as Partial<typeof s>)}
      />
    </div>
  );

  const doExport = () => {
    const blob = new Blob([actions.exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "health-rebuild-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          actions.importJSON(String(reader.result));
          toast("Dados importados");
        } catch {
          toast("Arquivo inválido");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <>
      <div className="card">
        <h2>Preferências</h2>
        {numberPref("Descanso padrão (s)", "defaultRestSeconds", s.defaultRestSeconds)}
        {numberPref("Meta de água (ml)", "waterGoalMl", s.waterGoalMl)}
        {numberPref("Limite calórico (kcal)", "calorieLimit", s.calorieLimit)}
        {numberPref("Meta semanal (%)", "weeklyGoalPct", s.weeklyGoalPct)}
      </div>
      <div className="card">
        <div className="eyebrow">Dados</div>
        <p className="muted">Salvos apenas neste navegador (localStorage).</p>
        <div className="grid2">
          <button className="btn" onClick={doExport}>
            Exportar JSON
          </button>
          <button className="btn" onClick={doImport}>
            Importar JSON
          </button>
        </div>
        <button
          className="btn ghost block"
          style={{ marginTop: 8 }}
          onClick={async () => {
            if (await confirm({ title: "Apagar todos os dados?", message: "Esta ação não pode ser desfeita." })) {
              actions.reset();
              toast("Dados apagados");
            }
          }}
        >
          Limpar dados
        </button>
      </div>
    </>
  );
}

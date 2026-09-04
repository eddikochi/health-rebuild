import { useState } from "react";
import { useFeedback } from "../../components/Feedback";
import { InputSheet } from "../../components/InputSheet";
import { Tabs, TrashButton } from "../../components/Sheet";
import { getDailyWaterMl } from "../../domain/analytics";
import { todayISO } from "../../domain/date";
import { GOALS } from "../../domain/types";
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
  const { state, actions } = useApp();
  const { profile } = state;
  const { toast } = useFeedback();
  const [editing, setEditing] = useState(false);
  return (
    <div className="card">
      <div className="row">
        <h2 style={{ margin: 0 }}>Meus dados</h2>
        <button className="btn" onClick={() => setEditing(true)}>
          Editar
        </button>
      </div>
      <p>
        Idade <b>{profile.age}</b>
      </p>
      <p>
        Altura <b>{profile.heightCm} cm</b>
      </p>
      <p>
        Peso base <b>{profile.baselineWeightKg} kg</b>
      </p>
      <p className="muted">
        Para acompanhar a evolução do peso ao longo do tempo, registre em{" "}
        <b>Progresso › Corpo</b>.
      </p>
      {editing && (
        <InputSheet
          title="Editar meus dados"
          fields={[
            { key: "age", label: "Idade", type: "number", min: 1, value: String(profile.age) },
            { key: "height", label: "Altura (cm)", type: "number", min: 1, value: String(profile.heightCm) },
            { key: "baseline", label: "Peso base (kg)", type: "number", min: 1, value: String(profile.baselineWeightKg) },
          ]}
          onClose={() => setEditing(false)}
          onSubmit={(v) => {
            const age = Number(v.age);
            const height = Number(v.height);
            const baseline = Number(v.baseline);
            actions.updateProfile({
              age: age > 0 ? age : profile.age,
              heightCm: height > 0 ? height : profile.heightCm,
              baselineWeightKg: baseline > 0 ? baseline : profile.baselineWeightKg,
            });
            toast("Dados atualizados");
          }}
        />
      )}
    </div>
  );
}

function GoalsTab() {
  const { state, actions } = useApp();
  return (
    <div className="card">
      <h2>Objetivos</h2>
      {GOALS.map((g) => (
        <label className="item" key={g}>
          <input
            type="checkbox"
            checked={state.goals.includes(g)}
            onChange={() => actions.toggleGoal(g)}
          />
          <span className="grow">{g}</span>
        </label>
      ))}
      <p className="muted">Objetivos concretos alimentarão a meta semanal em versões futuras.</p>
    </div>
  );
}

function HydrationTab() {
  const { state, actions } = useApp();
  const { confirm } = useFeedback();
  const today = todayISO();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<{ id: string; ml: number } | null>(null);
  const total = getDailyWaterMl(state, today);

  return (
    <>
      <div className="card">
        <div className="eyebrow">Meta diária</div>
        <h2>
          {total} / {state.settings.waterGoalMl} ml hoje
        </h2>
        <p className="muted">
          Para registrar o consumo, toque nas garrafas na tela <b>Hoje</b>. Aqui você define
          quais recipientes usa no dia.
        </p>
      </div>

      <div className="card">
        <div className="eyebrow">Meus recipientes</div>
        {state.waterContainers.length === 0 ? (
          <p className="empty">Nenhum recipiente. Adicione o primeiro abaixo.</p>
        ) : (
          state.waterContainers.map((c) => (
            <div className="item" key={c.id}>
              <span className="grow">💧 {c.ml} ml</span>
              <button
                className="btn"
                aria-label={`Editar recipiente ${c.ml} ml`}
                onClick={() => setEditing({ id: c.id, ml: c.ml })}
              >
                Editar
              </button>
              <TrashButton
                label={`Remover recipiente ${c.ml} ml`}
                onClick={async () => {
                  if (await confirm({ title: `Remover recipiente de ${c.ml} ml?` }))
                    actions.removeContainer(c.id);
                }}
              />
            </div>
          ))
        )}
        <button className="btn primary" style={{ marginTop: 8 }} onClick={() => setAdding(true)}>
          + Recipiente
        </button>
      </div>

      {adding && (
        <InputSheet
          title="Novo recipiente"
          submitLabel="Adicionar"
          fields={[{ key: "ml", label: "Volume (ml)", type: "number", min: 1, value: "500" }]}
          onClose={() => setAdding(false)}
          onSubmit={(v) => {
            const ml = Number(v.ml);
            if (ml > 0) actions.addContainer(ml);
          }}
        />
      )}
      {editing && (
        <InputSheet
          title="Editar recipiente"
          fields={[{ key: "ml", label: "Volume (ml)", type: "number", min: 1, value: String(editing.ml) }]}
          onClose={() => setEditing(null)}
          onSubmit={(v) => {
            const ml = Number(v.ml);
            if (ml > 0) actions.updateContainer(editing.id, ml);
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
          onClick={() => {
            actions.updateSettings({ onboardedAt: undefined });
            toast("Tour reiniciado");
          }}
        >
          Refazer tour de boas-vindas
        </button>
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

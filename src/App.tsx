import { useState } from "react";
import { HomeScreen } from "./features/home/HomeScreen";
import { NutritionScreen } from "./features/nutrition/NutritionScreen";
import { Onboarding } from "./features/onboarding/Onboarding";
import { ProfileScreen } from "./features/profile/ProfileScreen";
import { ProgressScreen } from "./features/progress/ProgressScreen";
import { WorkoutScreen } from "./features/workout/WorkoutScreen";
import { useApp } from "./store/AppStore";

export type Screen = "hoje" | "treino" | "comida" | "progresso" | "perfil";

const NAV: Array<{ id: Screen; icon: string; label: string }> = [
  { id: "hoje", icon: "⌂", label: "Hoje" },
  { id: "treino", icon: "▣", label: "Treino" },
  { id: "comida", icon: "◉", label: "Comida" },
  { id: "progresso", icon: "↗", label: "Progresso" },
  { id: "perfil", icon: "●", label: "Perfil" },
];

export default function App() {
  const { state } = useApp();
  const [screen, setScreen] = useState<Screen>("hoje");

  const navigate = (s: Screen) => {
    setScreen(s);
    window.scrollTo(0, 0);
  };

  if (!state.settings.onboardedAt) {
    return <Onboarding navigate={navigate} onDone={() => setScreen("hoje")} />;
  }

  return (
    <>
      <main className="app">
        {screen === "hoje" && <HomeScreen navigate={navigate} />}
        {screen === "treino" && <WorkoutScreen />}
        {screen === "comida" && <NutritionScreen />}
        {screen === "progresso" && <ProgressScreen />}
        {screen === "perfil" && <ProfileScreen />}
      </main>
      <nav className="nav" aria-label="Navegação principal">
        {NAV.map((n) => (
          <button
            key={n.id}
            className={screen === n.id ? "on" : ""}
            aria-current={screen === n.id ? "page" : undefined}
            onClick={() => navigate(n.id)}
          >
            <b aria-hidden>{n.icon}</b>
            {n.label}
          </button>
        ))}
      </nav>
    </>
  );
}

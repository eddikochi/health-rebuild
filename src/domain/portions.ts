// Porções caseiras comuns com peso médio sugerido (g).
// Servem para pré-preencher o peso ao criar um alimento — o usuário não precisa
// saber gramas; escolhe a medida e ajusta depois se quiser.
export interface UnitPreset {
  label: string;
  grams: number;
}

export const UNIT_PRESETS: UnitPreset[] = [
  { label: "unidade", grams: 100 },
  { label: "fatia", grams: 30 },
  { label: "colher de sopa", grams: 15 },
  { label: "colher de chá", grams: 5 },
  { label: "concha", grams: 80 },
  { label: "xícara", grams: 120 },
  { label: "copo", grams: 200 },
  { label: "pote", grams: 170 },
  { label: "filé", grams: 100 },
  { label: "porção", grams: 100 },
  { label: "grama (g)", grams: 1 },
];

export function presetGrams(label: string): number | undefined {
  return UNIT_PRESETS.find((p) => p.label === label)?.grams;
}

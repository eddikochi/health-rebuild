import { useState } from "react";
import { Sheet } from "./Sheet";

export interface InputField {
  key: string;
  label: string;
  type?: "text" | "number";
  value?: string;
  placeholder?: string;
  min?: number;
  options?: { value: string; label: string }[];
}

interface Props {
  title: string;
  fields: InputField[];
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => void;
  onClose: () => void;
}

// Substitui window.prompt por um bottom sheet acessível (teclado numérico, labels).
export function InputSheet({ title, fields, submitLabel = "Salvar", onSubmit, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.key, f.value ?? ""])),
  );

  const set = (key: string, v: string) => setValues((s) => ({ ...s, [key]: v }));

  return (
    <Sheet title={title} onClose={onClose}>
      <div className="stack">
        {fields.map((f) => (
          <div className="field" key={f.key}>
            <label htmlFor={`in-${f.key}`}>{f.label}</label>
            {f.options ? (
              <select
                id={`in-${f.key}`}
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={`in-${f.key}`}
                type={f.type === "number" ? "number" : "text"}
                inputMode={f.type === "number" ? "decimal" : undefined}
                min={f.min}
                placeholder={f.placeholder}
                value={values[f.key]}
                autoFocus={fields[0].key === f.key}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
          </div>
        ))}
        <button
          className="btn primary"
          onClick={() => {
            onSubmit(values);
            onClose();
          }}
        >
          {submitLabel}
        </button>
      </div>
    </Sheet>
  );
}

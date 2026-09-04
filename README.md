# Health Rebuild OS

Sistema pessoal para reconstruir e manter saúde, condicionamento e consistência
após os 40. **Faça → Registre → Salve → Derive → Visualize → Ajuste.**

Não é app médico. Não diagnostica nem substitui profissional de saúde.

Fonte de verdade do produto: [`docs/PRD.md`](docs/PRD.md).

## Stack

- React 18 + TypeScript + Vite
- Estado por entidades/eventos persistido em `localStorage` através de uma
  **repository layer** (troca por Supabase depois sem reescrever a UI)
- Análises derivadas em funções puras (`src/domain/analytics.ts`)
- PWA (manifest + service worker) — instalável e mobile-first
- Vitest para testes de domínio

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

## Scripts

| Script            | O que faz                              |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (Vite)     |
| `npm run build`   | Typecheck (`tsc`) + build de produção  |
| `npm run preview` | Serve o build de `dist/`               |
| `npm test`        | Testes de domínio (Vitest)             |

## Arquitetura

```
src/
├── App.tsx                 # shell + bottom navigation
├── main.tsx                # providers + registro do service worker
├── components/             # UI compartilhada (Sheet, Tabs, Chart, Feedback)
├── data/
│   ├── repository.ts       # interface (a UI nunca chama localStorage direto)
│   ├── localStorageRepository.ts
│   └── migrations.ts       # schemaVersion + migrations não-destrutivas
├── domain/
│   ├── types.ts            # entidades (Routine, Workout, FoodLog, ...)
│   ├── analytics.ts        # selectors/derivações puras
│   ├── seed.ts             # dados iniciais (Full Body A–E, alimentos)
│   ├── date.ts / id.ts     # utilitários (ISO 8601, crypto.randomUUID)
│   └── analytics.test.ts   # testes de domínio
├── hooks/useNow.ts         # tick para o timer de descanso (por timestamp)
├── store/AppStore.tsx      # contexto + ações tipadas sobre o AppState
└── features/               # home, workout, nutrition, progress, profile
```

### Decisões-chave

- **Descanso por timestamp** (`restStartedAt`/`restEndsAt`): o tempo restante é
  sempre `restEndsAt - now`, então o timer sobrevive a reload/suspensão da aba.
- **Série extra na sessão não muta o template** da rotina (PRD §42.3).
- **Progresso 100% derivado** de registros reais — sem números mockados.
- **Datas retroativas** em alimentação, água, peso e treino (registro manual).
- **CRUD com lixeira** e confirmação para entidades grandes (PRD §23).

## Deploy (Vercel)

1. Importar o repositório no Vercel.
2. Framework: **Vite** · Build: `npm run build` · Output: `dist`.
3. Deploy → abrir a URL HTTPS no celular (Safari/Chrome) e "Adicionar à Tela de
   Início" para instalar como PWA.

## Limitações atuais (MVP)

- Persistência local apenas (sem sincronização entre dispositivos).
- Sem backend/autenticação — os dados vivem no navegador (localStorage).
- Publicado como repositório **público** no GitHub Pages para permitir teste no
  celular sem conta paga; migrar para Vercel/privado quando quiser.

## Roadmap

- **P0 (feito):** 5 módulos, Full Body A–E, execução com timer persistente,
  histórico + volume, cardio básico, 4 refeições, orçamento calórico, água,
  peso/medidas completas, progresso derivado, meta semanal, check-in semanal,
  export/import JSON, PWA (ícones 192/512).
- **P1:** fotos, PRs, macros, dark mode, gráfico de trend vs peso bruto, CSV.
- **P2:** Supabase/Auth, sincronização, integrações (Health/Strava).
```

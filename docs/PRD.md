# HEALTH REBUILD OS --- HANDOFF COMPLETO PARA CLAUDE CODE

> **Objetivo deste documento:** transformar o protótipo validado do
> Health Rebuild em uma aplicação web mobile-first realmente utilizável
> no celular, versionada no GitHub e publicada em uma URL HTTPS para
> testes reais.
>
> Este documento é a fonte de verdade inicial do projeto. **Não
> redesenhar o produto nem remover funcionalidades sem necessidade.**
> Primeiro reproduzir o comportamento descrito aqui; depois iterar.

------------------------------------------------------------------------

## 1. Produto

**Nome de trabalho:** Health Rebuild OS\
**Posicionamento:** sistema pessoal para reconstruir e manter saúde,
condicionamento e consistência após os 40.

Promessa central:

> "Quero saber exatamente o que preciso fazer hoje e enxergar
> objetivamente se minhas ações estão produzindo resultado ao longo das
> semanas."

Não é um app médico, não diagnostica doenças e não substitui médico,
nutricionista, fisioterapeuta ou profissional de educação física.

### Loop central

**Planejar → Fazer → Registrar → Medir → Analisar → Ajustar**

### Princípios de UX

1.  Action first: a primeira tela responde "o que faço hoje?".
2.  Progressive disclosure: complexidade aparece apenas quando
    necessária.
3.  Mobile-first e uso com uma mão.
4.  Números precisam de contexto.
5.  Tendências \> snapshots.
6.  Incentivar sem punir.
7.  **Planejamento granular, execução por checkbox/ação.**
8.  Uma tela = uma tarefa predominante.
9.  Tabs mudam contexto dentro de um módulo; bottom navigation muda
    módulo.
10. Se algo pode ser adicionado, deve poder ser **editado e removido**.
11. Remoção deve usar **ícone de lixeira**, não botão textual "Remover".

------------------------------------------------------------------------

## 2. Objetivo técnico imediato

Migrar o protótipo HTML atual para uma aplicação real:

-   React
-   TypeScript
-   Vite
-   mobile-first
-   responsiva no desktop
-   persistência local inicialmente
-   PWA instalável
-   deploy HTTPS
-   GitHub como fonte de verdade
-   arquitetura preparada para Supabase/PostgreSQL depois

### Não implementar agora

-   pagamentos
-   social/feed
-   marketplace
-   smartwatch
-   Apple Health / Health Connect
-   scanner de código de barras
-   GPS
-   IA coach
-   diagnóstico médico
-   backend complexo antes da validação do modelo

------------------------------------------------------------------------

# 3. Stack

## MVP de validação

-   React
-   TypeScript
-   Vite
-   React Router ou navegação equivalente
-   CSS Modules / CSS simples / Tailwind apenas se não alterar o DS
-   localStorage para persistência
-   PWA manifest + service worker
-   Git + GitHub
-   deploy via Vercel, Netlify ou GitHub Pages

Preferência para deploy: **Vercel** pela simplicidade.

## Fase seguinte

-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Row Level Security
-   sincronização entre dispositivos

------------------------------------------------------------------------

# 4. Design System

Referência visual: ambiente/linguagem fitness contemporânea inspirada na
26fit, **sem copiar a marca**.

### Direção

-   wellness-tech
-   minimalista
-   grafite + off-white + laranja
-   evitar estética "hardcore gym"
-   bastante espaço negativo
-   alto contraste
-   excelente legibilidade 40+

### Tokens iniciais

``` css
--primary: #ff5a1f;
--graphite: #202020;
--background: #f4f2ee;
--surface: #ffffff;
--muted: #747474;
--border: #e4dfd8;
--primary-soft: #fff0e8;
--success: #237a4b;
--danger: #a52b20;
```

### Tipografia

Preferência: Geist. Fallback: Inter / system UI.

-   Display 32/38
-   H1 28/34
-   H2 22/28
-   H3 18/24
-   Body 16/24
-   Small 14/20
-   Caption 12/16

Body mínimo: 16px.

### Espaçamento

Base 8px:

`4, 8, 12, 16, 24, 32, 48, 64`

### Radius

-   input: 10
-   button: 12
-   card: 16
-   modal: 24
-   pill: 999

------------------------------------------------------------------------

# 5. Arquitetura de informação

Bottom navigation fixa:

1.  Hoje
2.  Treino
3.  Comida
4.  Progresso
5.  Perfil

## Hoje

Home curta. Não transformar em dashboard infinito.

Deve conter:

1.  progresso semanal + gráfico + meta
2.  treino de hoje
3.  água
4.  alimentação
5.  resumo da semana

## Treino

Tabs:

-   Hoje
-   Rotinas
-   Histórico

## Comida

Tabs:

-   Hoje
-   Plano semanal
-   Alimentos

## Progresso

Tabs:

-   Geral
-   Corpo
-   Performance
-   Consistência

## Perfil

Tabs:

-   Dados
-   Objetivos
-   Hidratação
-   Preferências

## Check-in semanal

Fluxo próprio chamado pela Home/Progresso.

------------------------------------------------------------------------

# 6. HOME / HOJE

A Home deve responder rapidamente:

-   qual é meu treino?
-   quanto bebi?
-   como está minha alimentação?
-   como estou em relação à meta semanal?

## Progresso semanal

Exibir:

-   percentual atual
-   **meta semanal configurável**
-   linha da meta no gráfico
-   distância até a meta
-   status:
    -   "Faltam X pontos"
    -   "Meta atingida"
    -   "Meta superada em X pontos"

Meta inicial de demonstração: 80%.

Porém o sistema deve evoluir para a meta ser derivada de objetivos
concretos:

-   treinos realizados/meta
-   cardio/meta
-   dias de hidratação/meta
-   alimentação dentro da meta
-   check-in semanal

Não salvar "score 82" arbitrariamente. Calcular a partir dos dados
brutos.

------------------------------------------------------------------------

# 7. TREINO

## Programa inicial

Criar programa demonstrativo:

**Full Body --- 5 dias**

-   SEG --- Full Body A --- geral
-   TER --- Full Body B --- costas/posterior
-   QUA --- Full Body C --- leve/condicionamento
-   QUI --- Full Body D --- pernas/peito
-   SEX --- Full Body E --- geral

Esses exercícios são conteúdo demonstrativo/editável, não prescrição
médica/profissional.

## Estrutura

``` text
Program
└── Routine
    └── RoutineExercise
        └── PlannedSet
```

Execução:

``` text
Workout
└── WorkoutExercise
    └── WorkoutSet
```

### Planned vs actual

Preservar distinção.

Exemplo planejado:

-   S1: 8 reps
-   S2: 8 reps
-   S3: 12 reps
-   S4: 12 reps

O usuário pode:

-   alterar carga
-   alterar reps
-   adicionar série
-   remover série
-   adicionar exercício
-   remover exercício
-   editar exercício

Não obrigar todos os exercícios a `2×8 + 2×12`. Isso é apenas um
template inicial.

------------------------------------------------------------------------

# 8. LOOP DE EXECUÇÃO DA SÉRIE --- REQUISITO CRÍTICO

Não usar apenas checkbox de série.

Estado:

``` text
READY → COMPLETED → RESTING → NEXT READY
```

### Fluxo

1.  Série atual disponível.
2.  Próximas séries bloqueadas.
3.  Usuário informa carga/reps.
4.  Toca **✓ Série finalizada**.
5.  Salvar timestamp e dados.
6.  Timer de descanso inicia automaticamente.
7.  Próxima série continua bloqueada.
8.  Timer chega a zero.
9.  Próxima série é liberada.

### Descanso

Padrão inicial: 90 s.

Permitir:

-   +30 s
-   Pular descanso

Descanso configurável por exercício/rotina:

-   60 s
-   90 s
-   120 s
-   personalizado

### Persistência do timer

Não implementar timer apenas decrementando variável em memória.

Salvar:

``` text
rest_started_at
rest_duration_seconds
rest_ends_at
```

Ao reabrir/trocar de aba:

``` text
remaining = rest_ends_at - now
```

Assim o timer não quebra quando o browser suspender a aba.

### WorkoutSet

Guardar:

``` ts
{
  id,
  workoutExerciseId,
  setNumber,
  plannedReps,
  actualReps,
  weightKg,
  status,
  completedAt,
  restStartedAt,
  restCompletedAt,
  restDurationSeconds
}
```

------------------------------------------------------------------------

# 9. HISTÓRICO DE TREINO

Permitir:

-   executar treino pelo app
-   cadastrar treino passado manualmente
-   editar registro
-   excluir registro

Precisamos cadastrar, por exemplo, treino de segunda e treino de quarta
para validar o progresso.

Histórico deve mostrar:

-   data
-   rotina
-   exercícios
-   séries
-   reps
-   cargas
-   duração
-   cardio
-   volume

### Volume

Exemplo:

``` text
volume = Σ(weight × reps)
```

Usar isso para gráficos de performance.

------------------------------------------------------------------------

# 10. ALIMENTAÇÃO

A tela **Hoje** precisa ter quatro refeições:

1.  Café da manhã
2.  Almoço
3.  Lanche da tarde
4.  Janta

Não remover nenhuma delas ao evoluir a feature.

## Cada alimento

Campos:

-   nome
-   kcal por 100 g
-   quantidade em gramas
-   consumido
-   refeição
-   opcional futuramente: proteína, carboidrato, gordura

Exemplo:

``` text
Frango
165 kcal / 100 g
150 g
✓ consumido
```

Calcular:

``` text
kcalConsumidas = kcalPor100g * gramas / 100
```

## Cada refeição

Mostrar:

-   alimentos
-   checkboxes
-   gramas
-   kcal
-   kcal total da refeição
-   -   alimento
-   editar
-   🗑 excluir

## Biblioteca

Usuário pode cadastrar alimentos reutilizáveis.

## Plano semanal

Permitir montar cardápio de segunda a domingo.

------------------------------------------------------------------------

# 11. CALCULADORA CALÓRICA

Requisito MVP.

Exibir no final de Alimentação/Hoje:

``` text
CALCULADORA DIÁRIA

1.487 / 2.000 kcal
██████████████░░░

513 kcal restantes
```

O limite diário é configurável.

Se ultrapassar:

``` text
215 kcal acima do limite
```

Não tratar o limite inicial como recomendação clínica.

O valor inicial pode ser 2.000 kcal apenas como placeholder.

Posteriormente, metas nutricionais podem ser definidas com suporte
profissional.

------------------------------------------------------------------------

# 12. HIDRATAÇÃO

Meta inicial demonstrativa:

2.500 ml/dia.

O usuário pode cadastrar recipientes:

``` text
500 ml
750 ml
1 L
```

Cada recipiente/garrafa:

-   checkbox de consumido
-   editar volume
-   🗑 remover

Exemplo:

``` text
☑ 500 ml
☑ 500 ml
☐ 500 ml
```

Home:

``` text
1.000 / 2.500 ml
```

Tudo precisa alimentar Progresso.

------------------------------------------------------------------------

# 13. CORPO

Registros:

``` text
date
weightKg
waistCm
abdomenCm?
chestCm?
armLeftCm?
armRightCm?
thighLeftCm?
thighRightCm?
notes?
```

Cadência sugerida:

-   peso: frequente
-   cintura: semanal
-   medidas completas: mensal

Fotos ficam P1.

------------------------------------------------------------------------

# 14. TREND WEIGHT

Guardar separadamente:

-   scale weight
-   trend weight

O algoritmo pode ser implementado depois, mas o modelo deve permitir
isso desde já.

Objetivo: reduzir ruído diário de água/conteúdo gastrointestinal.

Gráfico de Corpo deve futuramente mostrar:

-   peso bruto
-   tendência suavizada

------------------------------------------------------------------------

# 15. PROGRESSO --- REGRA CENTRAL

**Progresso não possui números manuais desconectados.**

Todos os indicadores são derivados dos registros reais.

Fluxo:

``` text
WorkoutSet ──────┐
Workout ─────────┤
FoodLog ─────────┤
WaterLog ────────┼──> selectors/analytics ──> Progress UI
BodyMeasurement ┤
CardioSession ───┤
WeeklyCheckIn ───┘
```

## Geral

Mostrar:

-   Health Consistency Score
-   peso/tendência
-   cintura
-   treinos
-   alimentação
-   hidratação
-   performance

## Corpo

Gráficos:

-   peso
-   trend weight
-   cintura
-   demais medidas

Períodos:

-   30 dias
-   3 meses
-   6 meses
-   1 ano

## Performance

-   evolução de carga por exercício
-   volume
-   reps
-   treinos realizados
-   cardio
-   PRs futuramente

## Consistência

-   treino %
-   cardio %
-   alimentação %
-   hidratação %
-   check-in
-   Health Score

### Regra visual

Um gráfico deve ter uma função principal.

Não misturar 8 métricas em um gráfico multicolorido.

------------------------------------------------------------------------

# 16. CARDIO

Após treino de força:

``` text
Força concluída
Faltam 15 min de cardio

[INICIAR]
[FAZER DEPOIS]
```

Guardar:

``` text
date
type
durationMinutes
intensity?
distance?
pace?
heartRate?
```

MVP obrigatório:

-   tipo
-   duração

------------------------------------------------------------------------

# 17. CHECK-IN SEMANAL

Guardar:

-   semana/data
-   energia 1--5
-   sono 1--5
-   disposição/readiness 1--5
-   notas

Resumo automático:

-   peso/tendência
-   cintura
-   treinos
-   cardio
-   alimentação
-   hidratação

Gerar insight não diagnóstico.

Exemplo permitido:

> "Você completou 4/5 treinos e atingiu a meta de hidratação em 6/7
> dias."

Não permitido:

> "Seu cansaço provavelmente é causado por X doença."

------------------------------------------------------------------------

# 18. MODELO DE DADOS --- LOCAL PRIMEIRO

Durante validação, persistir em localStorage.

**Não salvar apenas o estado visual atual. Salvar entidades/eventos.**

Estrutura sugerida:

``` ts
type AppState = {
  profile: Profile
  goals: Goal[]
  programs: Program[]
  routines: Routine[]
  workouts: Workout[]
  workoutExercises: WorkoutExercise[]
  workoutSets: WorkoutSet[]
  cardioSessions: CardioSession[]
  foods: Food[]
  meals: Meal[]
  mealItems: MealItem[]
  foodLogs: FoodLog[]
  waterContainers: WaterContainer[]
  waterLogs: WaterLog[]
  bodyMeasurements: BodyMeasurement[]
  weeklyCheckIns: WeeklyCheckIn[]
  settings: Settings
}
```

### IDs

Usar `crypto.randomUUID()`.

### Datas

ISO 8601.

### Persistência

Criar camada:

``` text
src/data/repository.ts
```

A UI não deve chamar `localStorage` diretamente.

Interface:

``` ts
interface Repository {
  getState(): AppState
  saveState(state: AppState): void
}
```

Depois substituímos implementação local por Supabase sem reescrever a
UI.

------------------------------------------------------------------------

# 19. LOCALSTORAGE

Chave versionada:

``` text
health-rebuild:v1
```

Implementar:

-   load
-   save
-   migrations
-   reset de dados
-   export JSON
-   import JSON

### Importante

Nunca apagar dados silenciosamente quando o schema mudar.

Criar:

``` text
schemaVersion
```

e migrations.

------------------------------------------------------------------------

# 20. PWA / TESTE NO CELULAR

Precisamos conseguir abrir uma URL HTTPS no iPhone/Android.

Implementar:

-   manifest.webmanifest
-   icons
-   theme-color
-   service worker
-   viewport correto
-   safe-area-inset
-   touch targets \>= 44px
-   sem hover como interação necessária

### iPhone

Validar:

-   Safari
-   Adicionar à Tela de Início
-   navegação inferior respeita safe area
-   teclado numérico para kg/reps/gramas
-   timer continua correto após bloquear/desbloquear tela
-   dados continuam após fechar/reabrir

------------------------------------------------------------------------

# 21. RESPONSIVIDADE

Mobile é prioridade.

Breakpoints conceituais:

``` text
< 600px = mobile
600–1024 = tablet
> 1024 = desktop preview
```

No desktop, manter coluna central semelhante ao protótipo atual.

Não esticar cards por toda a tela.

------------------------------------------------------------------------

# 22. COMPONENTES

Criar componentes reutilizáveis.

## Foundations

-   Typography
-   Color tokens
-   Spacing
-   Radius
-   Elevation
-   Icons

## Actions

-   Button
-   IconButton
-   FAB
-   SegmentedControl

## Inputs

-   TextField
-   NumberInput
-   Stepper
-   Slider
-   RatingScale

## Data

-   MetricCard
-   TrendMetric
-   ProgressBar
-   ProgressRing
-   Chart
-   CalendarHeatmap

## Health

-   WeightCard
-   BodyMeasurement
-   WaterTracker
-   ConsistencyScore

## Workout

-   WorkoutCard
-   ExerciseCard
-   SetRow / SetCard
-   RestTimer
-   WorkoutSummary

## Food

-   MealCard
-   FoodRow
-   CalorieBudget
-   MealPlanner

## Feedback

-   Toast
-   BottomSheet
-   Modal
-   EmptyState
-   InsightCard
-   ConfirmDeleteDialog

## Navigation

-   TopBar
-   BottomNavigation
-   Tabs

------------------------------------------------------------------------

# 23. DELETE / CRUD

Regra global:

``` text
Create
Read
Update
Delete
```

Tudo que tiver `+ adicionar` precisa ter:

-   edição
-   exclusão

Usar lixeira.

Para entidades grandes:

``` text
•••
Editar
Excluir
```

Confirmar exclusão de:

-   treino
-   rotina
-   refeição
-   histórico importante

Série individual pode ser removida diretamente.

------------------------------------------------------------------------

# 24. GITHUB --- HANDOFF

Criar repositório privado:

``` text
health-rebuild
```

## Branches

``` text
main
develop
feature/*
fix/*
```

Para MVP solo, pode simplificar:

``` text
main
feature/*
```

`main` deve sempre estar deployável.

## Commits

Usar Conventional Commits:

``` text
feat: add workout rest timer
fix: persist timer after app resume
feat: add daily calorie budget
refactor: move persistence to repository
```

## README

Criar README com:

-   produto
-   stack
-   instalação
-   scripts
-   arquitetura
-   deploy
-   limitações atuais
-   roadmap

------------------------------------------------------------------------

# 25. ESTRUTURA DO REPOSITÓRIO

``` text
health-rebuild/
├── public/
│   ├── icons/
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   ├── components/
│   ├── features/
│   │   ├── home/
│   │   ├── workout/
│   │   ├── nutrition/
│   │   ├── progress/
│   │   ├── profile/
│   │   └── checkin/
│   ├── data/
│   │   ├── repository.ts
│   │   ├── localStorageRepository.ts
│   │   └── migrations.ts
│   ├── domain/
│   │   ├── types.ts
│   │   ├── workout.ts
│   │   ├── nutrition.ts
│   │   └── analytics.ts
│   ├── hooks/
│   ├── styles/
│   ├── utils/
│   └── main.tsx
├── docs/
│   ├── PRD.md
│   ├── DATA_MODEL.md
│   └── QA.md
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

------------------------------------------------------------------------

# 26. CLAUDE CODE --- INSTRUÇÕES DE EXECUÇÃO

## Primeira tarefa

Antes de escrever código:

1.  ler este documento inteiro;
2.  criar `docs/PRD.md` com este conteúdo;
3.  propor árvore do projeto;
4.  listar decisões técnicas;
5.  somente então implementar.

### Prompt recomendado ao Claude Code

``` text
Leia integralmente docs/PRD.md antes de alterar qualquer arquivo.

Você está implementando o Health Rebuild OS. O PRD é a fonte de verdade.

Objetivo desta fase:
1. criar aplicação React + TypeScript + Vite;
2. reproduzir o design system e a UX descritos no PRD;
3. implementar os cinco módulos: Hoje, Treino, Comida, Progresso e Perfil;
4. persistir entidades em localStorage através de uma repository layer;
5. implementar Full Body A–E;
6. implementar o state machine de séries:
   ready -> completed -> resting -> next ready;
7. persistir o descanso usando timestamps;
8. implementar alimentação com 4 refeições, gramagem e kcal;
9. implementar calculadora de limite calórico diário;
10. implementar hidratação por recipientes;
11. implementar histórico de treino;
12. implementar peso e medidas;
13. fazer Progresso derivar exclusivamente dos dados registrados;
14. implementar meta semanal;
15. tornar o app PWA mobile-first;
16. preparar deploy em Vercel.

Não redesenhe o produto.
Não remova funcionalidades do PRD.
Não introduza backend nesta fase.
Não use dados mockados no dashboard quando houver registros reais.
Não armazene métricas derivadas se elas puderem ser calculadas a partir dos eventos brutos.

Antes de finalizar:
- npm run build deve passar;
- TypeScript sem erros;
- testar navegação;
- testar persistência após refresh;
- testar CRUD;
- testar timer;
- testar cálculo calórico;
- testar progresso;
- documentar no README como rodar e publicar.
```

------------------------------------------------------------------------

# 27. COMANDOS INICIAIS

Claude Code pode executar:

``` bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
```

Adicionar bibliotecas somente quando justificadas.

Evitar dependências pesadas para funcionalidades triviais.

------------------------------------------------------------------------

# 28. DEPLOY VERCEL

Depois de criar e testar localmente:

``` bash
git init
git add .
git commit -m "feat: bootstrap health rebuild mvp"
git branch -M main
git remote add origin <REPOSITORY_URL>
git push -u origin main
```

No Vercel:

1.  importar repositório GitHub;
2.  framework: Vite;
3.  build command: `npm run build`;
4.  output: `dist`;
5.  deploy.

Resultado esperado:

``` text
https://health-rebuild-....vercel.app
```

Abrir essa URL no celular.

------------------------------------------------------------------------

# 29. GITHUB ACTIONS

Criar CI simples:

``` yaml
name: CI

on:
  push:
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
```

Adicionar lint/test quando configurados.

------------------------------------------------------------------------

# 30. TESTES MÍNIMOS

Priorizar testes de domínio.

## Workout

-   finalizar série inicia descanso;
-   próxima série fica bloqueada;
-   pular libera próxima;
-   timer expirado libera próxima;
-   refresh durante descanso não reinicia 90s;
-   volume é calculado corretamente.

## Nutrition

-   kcal = kcal/100g × gramas/100;
-   apenas alimentos consumidos entram no total;
-   total diário soma refeições;
-   limite restante correto;
-   ultrapassagem correta.

## Water

-   soma apenas logs consumidos;
-   recipiente pode ser adicionado/removido;
-   progresso diário correto.

## Progress

-   treino registrado altera consistência;
-   carga altera performance;
-   alimentação altera indicador;
-   água altera indicador;
-   peso cria novo ponto no gráfico;
-   dashboard não usa números mockados depois de existir dado real.

------------------------------------------------------------------------

# 31. DADOS DE TESTE / VALIDAÇÃO

Precisamos conseguir inserir manualmente:

### Treinos

-   treino de segunda
-   treino de quarta/hoje

Campos completos, não apenas "maior carga".

### Alimentação

Registrar refeições de vários dias da semana.

Para isso, o formulário de log de alimentação precisa permitir
selecionar **data**.

Não amarrar todos os logs ao `new Date()`.

### Peso/medidas

Permitir data retroativa.

### Água

Permitir data retroativa para teste, mesmo que o fluxo normal use hoje.

------------------------------------------------------------------------

# 32. ANALYTICS / DERIVAÇÕES

Criar funções puras em:

``` text
src/domain/analytics.ts
```

Exemplos:

``` ts
getDailyCalories(date)
getDailyWaterMl(date)
getWorkoutVolume(workoutId)
getWeeklyWorkoutCount(week)
getWeeklyCardioMinutes(week)
getHydrationAdherence(week)
getNutritionAdherence(week)
getConsistencyScore(week)
getWeightSeries(range)
getExerciseProgress(exerciseId, range)
```

A UI consome selectors/analytics.

Não duplicar cálculo dentro dos componentes.

------------------------------------------------------------------------

# 33. HEALTH CONSISTENCY SCORE

Hipótese inicial, não verdade científica:

-   força: 30%
-   cardio/movimento: 20%
-   alimentação: 20%
-   hidratação: 10%
-   recuperação/sono: 10%
-   check-in semanal: 10%

Documentar claramente como **MVP hypothesis**.

O score deve ser explicável.

Usuário deve conseguir tocar no score e ver:

``` text
Treino       27/30
Cardio       14/20
Alimentação  16/20
Água          8/10
Recuperação   8/10
Check-in     10/10
------------------
Total        83/100
```

------------------------------------------------------------------------

# 34. EMPTY / RETURN STATES

Sem dados:

> "Seu progresso começa aqui. Registre alguns dias para começarmos a
> mostrar tendências."

Após ausência:

> "Bom ter você de volta. Seu último treino foi há X dias. Vamos
> continuar de onde paramos."

Evitar:

-   culpa
-   streak quebrado
-   vermelho punitivo
-   linguagem de fracasso

------------------------------------------------------------------------

# 35. ACESSIBILIDADE / 40+

Obrigatório:

-   body \>= 16px
-   contraste adequado
-   touch targets \>= 44px
-   labels reais
-   não depender apenas de cor
-   teclado numérico em inputs numéricos
-   `aria-label` em icon buttons
-   foco visível
-   navegação por teclado no desktop

------------------------------------------------------------------------

# 36. CRITÉRIOS DE ACEITE PARA PRIMEIRO DEPLOY

O build só está pronto para teste no celular quando:

-   [ ] URL HTTPS pública funciona
-   [ ] bottom nav funciona no iPhone
-   [ ] tabs funcionam
-   [ ] dados persistem após refresh
-   [ ] dados persistem após fechar/reabrir Safari
-   [ ] Full Body A--E existe
-   [ ] treino pode ser iniciado
-   [ ] série pode ser finalizada
-   [ ] descanso inicia automaticamente
-   [ ] próxima série fica bloqueada
-   [ ] timer sobrevive a suspensão/reload
-   [ ] treino pode ser salvo
-   [ ] treino passado pode ser cadastrado
-   [ ] quatro refeições existem
-   [ ] alimentos podem ser adicionados/editados/excluídos
-   [ ] gramas alteram kcal
-   [ ] limite diário funciona
-   [ ] água pode ser registrada
-   [ ] recipientes podem ser criados/editados/excluídos
-   [ ] peso pode ser registrado
-   [ ] Progresso muda com dados reais
-   [ ] meta semanal aparece no gráfico
-   [ ] nenhum botão depende de preview do ChatGPT
-   [ ] nenhum dado real depende de mock hardcoded

------------------------------------------------------------------------

# 37. FASE 2 --- SUPABASE

Só começar depois que o fluxo local estiver validado.

Tabelas previstas:

``` text
profiles
goals
programs
routines
routine_exercises
planned_sets
workouts
workout_exercises
workout_sets
cardio_sessions
foods
meals
meal_items
food_logs
water_containers
water_logs
body_measurements
weekly_checkins
user_settings
```

Todas com:

``` text
id UUID
user_id UUID
created_at timestamptz
updated_at timestamptz
```

Usar RLS.

------------------------------------------------------------------------

# 38. MIGRAÇÃO LOCAL → SUPABASE

A repository layer deve permitir:

``` text
LocalStorageRepository
        ↓
SupabaseRepository
```

A UI não deve saber qual implementação está ativa.

Quando Supabase entrar:

1.  criar auth;
2.  criar schema;
3.  implementar repository;
4.  criar import do estado local;
5.  sincronizar;
6.  somente depois remover dependência exclusiva do localStorage.

------------------------------------------------------------------------

# 39. ROADMAP

## P0 --- primeiro deploy utilizável

-   Home
-   Full Body A--E
-   execução de treino
-   timer persistente
-   histórico
-   cardio básico
-   quatro refeições
-   alimentos
-   kcal/gramas
-   orçamento calórico
-   água
-   peso
-   cintura
-   progresso
-   meta semanal
-   perfil
-   localStorage
-   PWA
-   deploy

## P1

-   fotos
-   PRs
-   RPE completo
-   macros
-   templates de refeições
-   recomendações automatizadas
-   export CSV
-   dark mode
-   check-in mais avançado

## P2

-   Supabase/Auth
-   sincronização
-   Apple Health / Health Connect
-   smartwatch
-   Strava
-   scanner
-   foto de comida
-   profissional/nutricionista
-   multiusuário
-   assinatura
-   IA Coach

------------------------------------------------------------------------

# 40. DEFINIÇÃO DE PRONTO

Uma feature só está pronta quando:

1.  funciona no desktop;
2.  funciona no Safari mobile;
3.  persiste corretamente;
4.  possui create/edit/delete quando aplicável;
5.  atualiza Progresso quando aplicável;
6.  não quebra dados existentes;
7.  TypeScript passa;
8.  build passa;
9.  possui empty state;
10. possui tratamento básico de erro.

------------------------------------------------------------------------

# 41. REGRA FINAL PARA O AGENTE

**Não transforme o Health Rebuild em um dashboard estático.**

O produto é um sistema de execução e registro.

A ordem de prioridade é:

``` text
FAZER
↓
REGISTRAR
↓
SALVAR
↓
DERIVAR
↓
VISUALIZAR
↓
AJUSTAR
```

Se uma métrica em Progresso não puder ser rastreada até um registro real
do usuário, ela não deve ser apresentada como dado real.

------------------------------------------------------------------------

## Próxima ação do Claude Code

1.  Criar o projeto Vite/React/TS.
2.  Salvar este documento como `docs/PRD.md`.
3.  Criar `README.md`.
4.  Criar a repository layer.
5.  Implementar shell + DS + navegação.
6.  Implementar persistência.
7.  Implementar Treino.
8.  Implementar Alimentação.
9.  Implementar Hidratação.
10. Implementar Corpo.
11. Implementar analytics/Progresso.
12. Implementar PWA.
13. Rodar build/test.
14. Commit.
15. Push GitHub.
16. Deploy Vercel.
17. Entregar URL HTTPS para validação no celular.

------------------------------------------------------------------------

# 42. CORREÇÃO OBRIGATÓRIA --- CRUD DE EXERCÍCIOS E SÉRIES

> **Regressão identificada durante a validação:** em uma iteração do
> protótipo, o botão **+ Adicionar exercício** desapareceu da
> execução/edição de treino e o botão **+ Série / + Série extra** deixou
> de criar uma nova série. Isso deve ser tratado como requisito
> bloqueante do primeiro deploy.

## 42.1 Adicionar exercício

Toda rotina deve permitir adicionar exercícios.

O CTA deve existir em local visível, após a lista de exercícios:

``` text
FULL BODY A

[ Exercício 1 ]
[ Exercício 2 ]
[ Exercício 3 ]

[ + ADICIONAR EXERCÍCIO ]
```

Ao tocar:

1.  abrir modal/bottom sheet;
2.  permitir selecionar exercício existente da biblioteca;
3.  permitir criar exercício novo;
4.  informar nome;
5.  opcionalmente informar grupo muscular;
6.  definir séries planejadas;
7.  definir reps planejadas;
8.  definir descanso;
9.  salvar;
10. inserir imediatamente na rotina sem reload.

O exercício criado deve persistir após refresh/reabertura do app.

Todo exercício da rotina deve possuir:

-   editar;
-   reordenar futuramente;
-   🗑 excluir.

Não usar `prompt()` na implementação React final.

## 42.2 Adicionar série

Cada exercício deve possuir CTA funcional:

``` text
[ + ADICIONAR SÉRIE ]
```

Ao tocar, criar imediatamente uma nova série planejada/real, conforme o
contexto.

Exemplo:

``` text
S1   30 kg   8
S2   30 kg   8
S3   26 kg  12
S4   26 kg  12

[ + ADICIONAR SÉRIE ]

↓ clique

S1   30 kg   8
S2   30 kg   8
S3   26 kg  12
S4   26 kg  12
S5   26 kg  12

[ + ADICIONAR SÉRIE ]
```

A nova série deve:

-   receber ID próprio com `crypto.randomUUID()`;
-   ser editável;
-   permitir carga;
-   permitir reps;
-   possuir estado próprio;
-   poder ser finalizada;
-   participar do fluxo de descanso;
-   poder ser removida com 🗑;
-   persistir;
-   entrar no cálculo de volume/performance quando executada.

### Defaults

Ao adicionar série durante a edição da rotina:

-   copiar reps planejadas da última série, se existir;
-   copiar descanso do exercício;
-   não marcar como concluída.

Ao adicionar série durante treino em execução:

-   copiar carga/reps da última série como sugestão;
-   manter campos editáveis;
-   inserir como próxima série pendente;
-   não alterar séries já concluídas.

## 42.3 Separar template de execução

Não mutar inadvertidamente a rotina planejada quando o usuário adicionar
uma série extra somente durante um treino.

Exemplo:

``` text
RoutineExercise
plannedSets = 4
```

Durante quarta-feira:

``` text
WorkoutExercise
actualSets = 5
```

A quinta série deve pertencer à sessão atual.

Após finalizar, oferecer futuramente:

``` text
Você adicionou uma série extra.
[Atualizar rotina] [Somente neste treino]
```

Para P0, o comportamento padrão pode ser:

> Série extra adicionada durante sessão = somente naquele Workout.

## 42.4 Critérios de aceite específicos

O primeiro deploy NÃO está pronto se qualquer item abaixo falhar:

-   [ ] Full Body A permite `+ Adicionar exercício`.
-   [ ] Full Body B permite `+ Adicionar exercício`.
-   [ ] Full Body C permite `+ Adicionar exercício`.
-   [ ] Full Body D permite `+ Adicionar exercício`.
-   [ ] Full Body E permite `+ Adicionar exercício`.
-   [ ] exercício novo aparece sem recarregar.
-   [ ] exercício novo permanece após refresh.
-   [ ] exercício pode ser editado.
-   [ ] exercício pode ser excluído pela lixeira.
-   [ ] cada exercício possui `+ Adicionar série`.
-   [ ] clicar em `+ Adicionar série` realmente cria S5/S6/etc.
-   [ ] série adicionada possui carga e reps editáveis.
-   [ ] série adicionada pode ser removida.
-   [ ] série adicionada pode ser finalizada.
-   [ ] finalizar série adicionada dispara descanso normalmente.
-   [ ] próxima série continua obedecendo bloqueio/liberação.
-   [ ] série extra executada entra no volume.
-   [ ] refresh não elimina exercício/série adicionados.
-   [ ] adicionar série durante uma sessão não altera silenciosamente o
    template da rotina.

## 42.5 Testes automatizados mínimos

Adicionar testes para:

``` ts
it('adds an exercise to a routine')
it('persists a newly added exercise')
it('removes an exercise from a routine')
it('adds a planned set to an exercise')
it('adds an extra set during an active workout')
it('does not mutate routine template when adding workout-only set')
it('includes extra completed set in workout volume')
it('starts rest after completing an added set')
```

## 42.6 Regra anti-regressão

**Nenhuma evolução de Treino pode remover CRUD já validado.**

Antes de concluir qualquer alteração em `features/workout`, validar
manualmente:

``` text
ROTINA
  + exercício
  editar exercício
  excluir exercício
      ↓
EXERCÍCIO
  + série
  editar série
  excluir série
      ↓
EXECUÇÃO
  finalizar série
  descanso
  desbloquear próxima
      ↓
HISTÓRICO / PROGRESSO
```

Se um elo deixar de funcionar, a alteração não deve ser considerada
concluída.

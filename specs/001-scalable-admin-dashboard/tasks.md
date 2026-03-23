# Tasks: Dashboard Admin Escalável IndicAI

**Input**: Design documents from `/specs/001-scalable-admin-dashboard/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organização**: Tasks por user story para implementação e teste independente. Código limpo e escalável; sem soluções provisórias.

**Rendering (SSR)**: Páginas (`page.tsx`) devem ser Server Components por defeito. Componentes com interactividade (formulários, hooks, nuqs, context) ficam em `"use client"`; a página server importa e compõe com esses componentes.

**Checkpoint obrigatório**: Após cada phase, documentar o que foi feito e obter autorização explícita antes de avançar para a próxima.

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Executável em paralelo (ficheiros diferentes, sem dependências)
- **[Story]**: User story (US1, US2, …) para tasks de feature
- Incluir paths exatos nas descrições

---

## Phase 1: Setup (Infraestrutura partilhada)

**Objetivo**: Dependências e base estrutural alinhada ao plan.

- [x] T001 Instalar nuqs em `package.json` para filtros via URL (`pnpm add nuqs`)
- [x] T002 Instalar Sonner em `package.json` para toasts (`pnpm add sonner`)
- [x] T003 [P] Adicionar Aceternity Sidebar via shadcn (`npx shadcn@latest add @aceternity/sidebar`) — preservado em `src/components/layout/aceternity-sidebar.tsx` para Phase 2; sidebar shadcn restaurado em `ui/sidebar.tsx`
- [x] T004 [P] Adicionar componente Table do shadcn (`npx shadcn@latest add table`)
- [x] T005 [P] Adicionar componente Chart do shadcn (`npx shadcn@latest add chart`)
- [x] T006 Criar pastas de estrutura em `src/`: `components/features/`, `components/layout/`, `services/`, `types/` conforme plan.md
- [x] T007 Verificar e configurar NuqsProvider em `src/components/providers.tsx` (ou layout raiz) para suporte a query params — configurado NuqsAdapter
- [x] T008 Verificar e configurar Toaster (Sonner) em `src/app/layout.tsx` ou `src/components/providers.tsx` — configurado em providers.tsx

### ✅ Checkpoint Phase 1

**Antes de avançar**: Descrever o que foi implementado (deps, pastas, providers). Só prosseguir para Phase 2 com autorização explícita.

---

## Phase 2: Foundational (Pré-requisitos bloqueantes)

**Objetivo**: Layout, componentes base e convenções que todas as user stories usam.

**⚠️ Crítico**: Nenhuma user story deve começar antes desta phase estar concluída.

- [x] T009 Implementar `src/components/layout/sidebar.tsx` com Aceternity Sidebar (desktop, expansão no hover), links para dashboard e áreas admin, usando paleta preto+amarelo
- [x] T010 Implementar `src/components/layout/bottom-nav.tsx` para navegação mobile (visível apenas em viewport móvel), com mesmos destinos do sidebar
- [x] T011 Atualizar `src/components/private-layout-guard.tsx` para usar Aceternity Sidebar no desktop e BottomNav no mobile, removendo sidebar shadcn antigo
- [x] T012 [P] Reorganizar auth: criar `src/components/auth/login/login-form.tsx` (mover de auth/login-form.tsx) e ajustar imports em `src/app/(auth)/login/page.tsx`
- [x] T013 [P] Reorganizar auth: criar `src/components/auth/recuperar-senha/forgot-password-form.tsx` e ajustar imports em `src/app/(auth)/indicai/recuperar-senha/page.tsx`
- [x] T014 [P] Reorganizar auth: criar `src/components/auth/reset-senha/reset-password-form.tsx` e ajustar página de reset; remover ficheiros antigos da raiz de auth
- [x] T015 Criar `src/components/ui/data-table.tsx` (wrapper de Table shadcn) com padrão visual: header amarelo (fundo amarelo, texto preto), linhas alternadas neutro/amarelo, suporte dark/light
- [x] T016 Criar `src/components/ui/empty-state.tsx` reutilizável: ícone, mensagem e opcional botão de ação
- [x] T017 Criar `src/components/ui/loading-skeleton.tsx` para listagens (variantes: table rows, cards) com Skeleton do shadcn
- [x] T018 Criar `src/services/admin-auth-fetch.ts` com `changeAdminPassword` usando `adminFetch` de `src/lib/api.ts`
- [x] T019 Adicionar schema `changePasswordSchema` em `src/schemas/auth.ts` para alteração de senha (senhaAtual, senhaNova, confirmSenha)
- [x] T020 Criar rotas em `app/(private)/dashboard/`: `page.tsx` (central), `usuarios/page.tsx`, `profissionais/page.tsx`, `avaliacoes/page.tsx`, `denuncias/page.tsx`, `relatorios/page.tsx`, `banners/page.tsx`, `sistema/page.tsx` com placeholder legível (URLs: /dashboard, /dashboard/usuarios, etc.)
- [x] T021 Adicionar links do sidebar e bottom-nav para /dashboard e /dashboard/usuarios, /dashboard/profissionais, etc.

### ✅ Checkpoint Phase 2

**Antes de avançar**: Descrever o que foi implementado (layout, auth reorganizado, DataTable, empty-state, skeleton, services, rotas). Só prosseguir para Phase 3 com autorização explícita.

---

## Phase 3: User Story 1 — Login único e alteração de senha (P1)

**Objetivo**: Login restrito a admins e alteração de senha na interface.

**Teste independente**: Login com admin ok; login com user comum rejeitado; alteração de senha invalida outras sessões.

- [ ] T022 [US1] Garantir que `src/contexts/auth-context.tsx` valida role admin em login e getMe (já deve estar; verificar `isAdminRole`)
- [ ] T023 [US1] Criar `src/components/features/settings/change-password-form.tsx` com formulário para alterar senha (usar schema de auth), spinner no submit, toast Sonner em sucesso/erro
- [ ] T024 [US1] Adicionar link/botão para alteração de senha no sidebar ou área de perfil (ex.: em `PrivateLayoutGuard` ou dropdown do utilizador)
- [ ] T025 [US1] Criar página ou modal de alteração de senha acessível ao admin autenticado e integrar com `admin-auth-fetch.changeAdminPassword`
- [ ] T026 [US1] Tratar erro 403 (sessão invalidada) no auth-context: fazer logout e redirecionar para login com mensagem clara

### ✅ Checkpoint Phase 3

**Antes de avançar**: Descrever o que foi implementado. Validar login admin, rejeição de user comum e alteração de senha. Só prosseguir para Phase 4 com autorização explícita.

---

## Phase 4: User Story 2 — Cadastro e exclusão de contas (P2)

**Objetivo**: Criar contas (profissional, empresa, cliente), desativar contas e ver indicadores comparativos.

**Teste independente**: Criar conta de cada tipo; desativar conta; ver indicadores na dashboard.

- [ ] T027 [P] [US2] Criar `src/services/admin-users-fetch.ts` com listUsers, getUserById, createUserAccount (POST /users), ban, unban, delete (conforme contracts/admin-api.md)
- [ ] T028 [P] [US2] Criar `src/services/admin-empresas-fetch.ts` com createEmpresaAccount (POST /empresas)
- [ ] T029 [P] [US2] Criar `src/services/admin-metrics-fetch.ts` com getOverviewMetrics, getAccountMetricsComparison
- [ ] T030 [US2] Criar `src/schemas/usuarios.ts` com createUserSchema (campos por tipo: profissional, empresa, cliente)
- [ ] T031 [US2] Criar `src/components/features/usuarios/user-list.tsx` com DataTable, nuqs (page, search, sortBy, sortOrder, status), Skeleton, EmptyState, toast em erros
- [ ] T032 [US2] Criar `src/components/features/usuarios/create-user-dialog.tsx` com formulário e select de tipo; usar schemas e Sonner
- [ ] T033 [US2] Implementar lógica de desativação/ban em user-list (botões + Dialog de confirmação para ações destrutivas)
- [ ] T034 [US2] Adicionar cards ou secção de indicadores comparativos em `app/(private)/dashboard/page.tsx` consumindo admin-metrics-fetch (accounts-comparison, overview)
- [ ] T035 [US2] Conectar `app/(private)/dashboard/usuarios/page.tsx` a user-list e create-user-dialog; garantir nuqs na URL

### ✅ Checkpoint Phase 4

**Antes de avançar**: Descrever o que foi implementado. Validar criação/desativação de contas e indicadores. Só prosseguir para Phase 5 com autorização explícita.

---

## Phase 5: User Story 3 — Profissões e profissionais (P3)

**Objetivo**: Rankings de profissões mais buscadas e profissionais melhor avaliados.

**Teste independente**: Ver rankings com dados coerentes.

- [ ] T036 [P] [US3] Adicionar getTopProfessions e getTopRatedProfessionals em `src/services/admin-metrics-fetch.ts`
- [ ] T037 [US3] Criar `src/components/features/relatorios/top-professions-card.tsx` com dados de getTopProfessions, Skeleton, EmptyState
- [ ] T038 [US3] Criar `src/components/features/relatorios/top-rated-professionals-card.tsx` com dados de getTopRatedProfessionals, Skeleton, EmptyState
- [ ] T039 [US3] Integrar ambos os cards em `app/(private)/dashboard/relatorios/page.tsx` (ou secção dedicada em dashboard/page.tsx)

### ✅ Checkpoint Phase 5

**Antes de avançar**: Descrever o que foi implementado. Validar exibição dos rankings. Só prosseguir para Phase 6 com autorização explícita.

---

## Phase 6: User Story 4 — Gestão de avaliações (P4)

**Objetivo**: Listar, filtrar, pesquisar, suspender e apagar avaliações.

**Teste independente**: Listar avaliações, aplicar filtros via URL, suspender e apagar com confirmação.

- [ ] T040 [P] [US4] Criar `src/services/admin-avaliacoes-fetch.ts` com listAvaliacoes, suspendAvaliacao, restoreAvaliacao, deleteAvaliacao
- [ ] T041 [US4] Criar `src/schemas/avaliacoes.ts` se houver formulários de validação (ex.: filtros)
- [ ] T042 [US4] Criar `src/components/features/avaliacoes/avaliacoes-list.tsx` com DataTable, nuqs (page, search, sortBy, status), Skeleton, EmptyState, ações suspender/restaurar/apagar com Dialog de confirmação
- [ ] T043 [US4] Conectar `app/(private)/dashboard/avaliacoes/page.tsx` a avaliacoes-list; garantir partilha de URL

### ✅ Checkpoint Phase 6

**Antes de avançar**: Descrever o que foi implementado. Validar listagem, filtros e ações de moderação. Só prosseguir para Phase 7 com autorização explícita.

---

## Phase 7: User Story 5 — Plano e expiração do profissional (P5)

**Objetivo**: Alterar plano, classificação e data de expiração do profissional (incl. nunca expirar).

**Teste independente**: Alterar plano/expiração e ver alterações refletidas.

- [ ] T044 [P] [US5] Criar `src/services/admin-profissionais-fetch.ts` com updateProfessionalSubscription, updateRating (conforme contracts)
- [ ] T045 [US5] Criar `src/schemas/profissionais.ts` para alteração de plano e expiração
- [ ] T046 [US5] Criar `src/components/features/profissionais/subscription-edit-dialog.tsx` com formulário (plano, classificação, data expiração, checkbox nunca expirar), validação e Sonner
- [ ] T047 [US5] Criar listagem ou detalhe de profissionais em `src/components/features/profissionais/` com botão para abrir subscription-edit-dialog
- [ ] T048 [US5] Conectar `app/(private)/dashboard/profissionais/page.tsx` aos componentes

### ✅ Checkpoint Phase 7

**Antes de avançar**: Descrever o que foi implementado. Validar alteração de plano e expiração. Só prosseguir para Phase 8 com autorização explícita.

---

## Phase 8: User Story 6 — Denúncias, sugestões e reclamações (P6)

**Objetivo**: Listar submissões e responder ao autor por e-mail.

**Teste independente**: Ver fila, distinguir tipo/estado, enviar resposta e validar associação.

- [ ] T049 [P] [US6] Criar `src/services/admin-relatorios-fetch.ts` com listRelatorios, listFeedbackSummary, respondReportFeedback, updateReportStatus
- [ ] T050 [US6] Criar `src/schemas/relatorios.ts` para resposta (texto, validação de e-mail)
- [ ] T051 [US6] Criar `src/components/features/denuncias/feedback-list.tsx` com tabela/cards, filtros por tipo/estado, nuqs, Skeleton, EmptyState
- [ ] T052 [US6] Criar `src/components/features/denuncias/respond-feedback-dialog.tsx` com campo de resposta e envio; tratar autor sem e-mail com feedback claro
- [ ] T053 [US6] Conectar `app/(private)/dashboard/denuncias/page.tsx` aos componentes

### ✅ Checkpoint Phase 8

**Antes de avançar**: Descrever o que foi implementado. Validar fila e resposta ao autor. Só prosseguir para Phase 9 com autorização explícita.

---

## Phase 9: User Story 7 — Relatório financeiro (P7)

**Objetivo**: Visão agregada por profissionais e planos, com filtros.

**Teste independente**: Ver totais e detalhes; aplicar filtros por período/plano.

- [ ] T054 [P] [US7] Adicionar getFinancialReport, getPlanStats em `src/services/admin-metrics-fetch.ts` (ou criar admin-financial-fetch.ts)
- [ ] T055 [US7] Criar `src/components/features/relatorios/financial-report.tsx` com dados agregados, filtros (período, plano), Chart se aplicável, Skeleton, EmptyState
- [ ] T056 [US7] Integrar financial-report em `app/(private)/dashboard/relatorios/page.tsx`

### ✅ Checkpoint Phase 9

**Antes de avançar**: Descrever o que foi implementado. Validar relatório e filtros. Só prosseguir para Phase 10 com autorização explícita.

---

## Phase 10: User Story 8 — Localização e demanda (P8)

**Objetivo**: Agregações geográficas para análise de procura.

**Teste independente**: Ver agrupamentos por região; comportamento para utilizadores sem localização.

- [ ] T057 [P] [US8] Adicionar getUsersByCity, getDemandByRegion em `src/services/admin-metrics-fetch.ts`
- [ ] T058 [US8] Criar `src/components/features/relatorios/location-stats.tsx` com dados por cidade/região, tratamento explícito de “desconhecido”
- [ ] T059 [US8] Integrar em `app/(private)/dashboard/relatorios/page.tsx` ou secção dedicada

### ✅ Checkpoint Phase 10

**Antes de avançar**: Descrever o que foi implementado. Validar agregações e tratamento de “desconhecido”. Só prosseguir para Phase 11 com autorização explícita.

---

## Phase 11: User Story 9 — Banners direcionados (P9)

**Objetivo**: Criar, editar e remover banners para utilizadores ou todos.

**Teste independente**: Criar banner, definir destinatários, remover.

- [ ] T060 [P] [US9] Criar `src/services/admin-banners-fetch.ts` com listBanners, createBanner, updateBanner, deleteBanner
- [ ] T061 [US9] Criar `src/schemas/banners.ts` para criação/edição (título, conteúdo, destinatários, vigência)
- [ ] T062 [US9] Criar `src/components/features/banners/banners-list.tsx` com tabela, nuqs, Skeleton, EmptyState
- [ ] T063 [US9] Criar `src/components/features/banners/banner-form-dialog.tsx` para criar/editar; selector de destinatários (lista ou “todos”)
- [ ] T064 [US9] Conectar `app/(private)/dashboard/banners/page.tsx` aos componentes

### ✅ Checkpoint Phase 11

**Antes de avançar**: Descrever o que foi implementado. Validar CRUD de banners. Só prosseguir para Phase 12 com autorização explícita.

---

## Phase 12: User Story 10 — Suspensão e bloqueio (P10)

**Objetivo**: Ativar/manter manutenção e bloquear/desbloquear utilizadores.

**Teste independente**: Ativar manutenção (admins mantêm acesso); bloquear utilizadores; confirmação em ações em massa.

- [ ] T065 [P] [US10] Adicionar getMaintenanceMode, enableMaintenanceMode, disableMaintenanceMode em `src/services/admin-auth-fetch.ts` ou criar `admin-system-fetch.ts`
- [ ] T066 [US10] Criar `src/components/features/sistema/maintenance-toggle.tsx` para ativar/desativar manutenção (apenas master)
- [ ] T067 [US10] Implementar bloqueio individual e em massa em user-list com Dialog de confirmação reforçada para bulk
- [ ] T068 [US10] Integrar maintenance-toggle e lógica de bloqueio em `app/(private)/dashboard/sistema/page.tsx` e user-list

### ✅ Checkpoint Phase 12

**Antes de avançar**: Descrever o que foi implementado. Validar manutenção e bloqueios. Só prosseguir para Phase 13 com autorização explícita.

---

## Phase 13: User Story 11 — Remoção de fotos (P11)

**Objetivo**: Remover fotos de perfil e vitrine.

**Teste independente**: Remover foto e ver estado coerente para o utilizador afetado.

- [ ] T069 [P] [US11] Adicionar removeUserProfilePhoto, removeVitrinePhoto em `src/services/admin-users-fetch.ts`
- [ ] T070 [US11] Adicionar ações de remoção de foto de perfil e fotos de vitrine na view de detalhe do utilizador/profissional (com Dialog de confirmação)
- [ ] T071 [US11] Garantir feedback Sonner e estado atualizado após remoção

### ✅ Checkpoint Phase 13

**Antes de avançar**: Descrever o que foi implementado. Validar remoção de fotos. Só prosseguir para Phase 14 com autorização explícita.

---

## Phase 14: Polish e concerns transversais

**Objetivo**: Consistência, performance e validação final.

- [ ] T072 [P] Revisar todos os componentes para garantir padrão FR-017 (Skeleton, empty state, toast, spinner, retry quando aplicável)
- [ ] T073 [P] Garantir que todas as tabelas/listagens usam DataTable com header amarelo e linhas alternadas (FR-014)
- [ ] T074 [P] Verificar dark/light em componentes críticos (sidebar, bottom-nav, tabelas)
- [ ] T075 Executar `pnpm format` e `pnpm lint`; corrigir erros
- [ ] T076 Validar quickstart.md: instalar deps, rodar dev, testar fluxos principais
- [ ] T077 Documentar em README ou CONTRIBUTING a convenção de checkpoints (reportar + autorização entre phases)

### ✅ Checkpoint Final

**Conclusão**: Descrever resumo do que foi entregue. Validar com quickstart e cenários de aceitação da spec.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências — iniciar imediatamente
- **Phase 2 (Foundational)**: Depende da conclusão da Phase 1 — bloqueia todas as user stories
- **Phases 3–13 (User Stories)**: Dependem da Phase 2; podem seguir em sequência (P1→P2→…→P11) ou em paralelo por story se houver capacidade
- **Phase 14 (Polish)**: Depende da conclusão das user stories desejadas

### User Story Dependencies

- **US1**: Após Phase 2 — sem dependência de outras stories
- **US2**: Após Phase 2 — sem dependência de outras stories
- **US3, US4, US5, …**: Podem começar após Phase 2; algumas partilham services (ex.: admin-metrics-fetch)

### Paralelismo

- Tasks [P] na mesma phase podem ser executadas em paralelo
- User stories distintas podem ser desenvolvidas em paralelo por pessoas diferentes após Phase 2

---

## Implementation Strategy

### MVP primeiro (apenas US1)

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: US1 (Login + alteração de senha)
4. Parar e validar; reportar; obter autorização
5. Demo/deploy se aplicável

### Entrega incremental

1. Setup + Foundational → base pronta
2. US1 → validar → reportar → autorização → demo (MVP)
3. US2 → validar → reportar → autorização → demo
4. Repetir para US3–US11 conforme prioridade

---

## Notes

- **Código limpo**: Sem hacks, TODOs vagos ou soluções provisórias; estrutura escalável
- **Checkpoints**: Após cada phase, descrever o que foi feito e obter autorização explícita antes da próxima
- **Paths**: Usar paths absolutos ou relativos ao `src/` conforme o projeto
- **Contracts**: Seguir `contracts/admin-api.md` para payloads e permissões

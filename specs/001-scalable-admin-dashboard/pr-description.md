# feat(dashboard): US1–US11 — Dashboard admin completo + polish UX

## Descrição

Este PR **encerra a spec `001-scalable-admin-dashboard`** (Phases 1–14): implementação completa do dashboard administrativo IndicAI consumindo as APIs do backend (spec `001-admin-auth`), com login restrito a administradores, gestão de utilizadores, profissionais, avaliações, denúncias/feedback, relatórios (financeiro, geo, rankings), banners, sistema (manutenção, bloqueio) e remoção de fotos. Inclui **enriquecimento da home** (tabelas recentes, gráficos adicionais, ações rápidas), **melhorias de UX** (skeleton apenas na área de conteúdo, sidebar fixa, branding IndicAI, tabelas sem bordas brancas, toast de erro vermelho escuro) e conformidade com **FR-001–FR-020** da spec. O objetivo é dar à equipa operacional uma interface completa, responsiva e consistente para operar a plataforma.

O restante deste documento serve para **revisor humano**, **Copilot** e **onboarding**: contexto, intenção por área, superfície alterada e como validar.

---

## Contexto e documentação de origem

| Artefacto                                                   | Uso na revisão                                  |
| ----------------------------------------------------------- | ----------------------------------------------- |
| `specs/001-scalable-admin-dashboard/spec.md`                | User stories US1–US11 e requisitos funcionais   |
| `specs/001-scalable-admin-dashboard/tasks.md`               | T001–T077; phases 1–14                          |
| `specs/001-scalable-admin-dashboard/contracts/admin-api.md` | Contrato de API consumida                       |
| `specs/001-scalable-admin-dashboard/quickstart.md`          | Setup e comandos                                |
| `src/lib/api.ts`                                            | `adminFetch`, `AdminApiError` e helpers de auth |

Se algo na UI não bater com o contrato verbal deste PR, o **contrato normativo** continua a ser a spec + `contracts/admin-api.md`.

---

## Intenção por área (porque foi feito)

### Login e sessão (US1, FR-001/002)

**Problema:** Acesso ao dashboard sem fluxo dedicado e alteração de senha inexistente.  
**Solução:** Login com CPF e senha restrito a `isAdminRole`; alteração de senha via Dialog no menu do utilizador (sidebar); tratamento de 403 com logout e redirecionamento para login com mensagem.

### Gestão de contas (US2, FR-003)

**Problema:** Cadastro manual e desativação de contas dispersos.  
**Solução:** Listagem com DataTable, nuqs (page, search, sortBy, sortOrder, status), CreateUserDialog para profissional/empresa/cliente, ban/unban/delete com confirmação, indicadores comparativos na home (métricas de contas).

### Profissões e profissionais (US3, FR-004)

**Problema:** Rankings não acessíveis.  
**Solução:** Cards `top-professions-card` e `top-rated-professionals-card` em relatórios; tabelas na home com utilizadores recentes e top avaliados.

### Avaliações (US4, FR-005)

**Problema:** Moderação de avaliações sem interface.  
**Solução:** Listagem com filtros (nuqs), ações suspender/restaurar/eliminar com Dialog de confirmação.

### Plano e expiração (US5, FR-006)

**Problema:** Ajuste de plano e expiração por profissional inacessível.  
**Solução:** `subscription-edit-dialog` com plano, classificação, data de expiração e checkbox "nunca expirar"; integrado na listagem de profissionais.

### Denúncias e feedback (US6, FR-007)

**Problema:** Fila de submissões sem canal de resposta.  
**Solução:** `feedback-list` com filtros por tipo/estado; `respond-feedback-dialog` com envio de resposta por e-mail e tratamento de autor sem e-mail válido.

### Relatório financeiro (US7, FR-008)

**Problema:** Visão agregada de receita e planos inexistente.  
**Solução:** `financial-report` com Chart (BarChart), filtros por período/plano, detalhe por plano/período.

### Localização e demanda (US8, FR-009)

**Problema:** Distribuição geográfica não visível.  
**Solução:** `location-stats` com utilizadores por cidade e demanda por região; tratamento explícito de "desconhecido".

### Banners (US9, FR-010)

**Problema:** Comunicação direcionada sem CRUD.  
**Solução:** `banners-list` com tabela e nuqs; `banner-form-dialog` para criar/editar (destinatários, vigência).

### Manutenção e bloqueio (US10, FR-011)

**Problema:** Suspensão global e bloqueio em massa sem interface dedicada.  
**Solução:** `maintenance-toggle` em sistema (apenas master); ban individual e em massa em `user-list` com confirmação reforçada.

### Remoção de fotos (US11, FR-012)

**Problema:** Moderação de fotos de perfil e vitrine sem ação na UI.  
**Solução:** Ações em `user-detail-dialog` para remover foto de perfil e fotos de vitrine (com confirmação e feedback Sonner).

### Home enriquecida e polish UX (extra-spec)

**Problema:** Dashboard home minimalista; bordas brancas; textos "Carregando"/"Redirecionando"; sidebar a scrollar; itens colapsados desalinhados; nome IndicAI fragmentado.  
**Solução:**

- Tabelas recent-users e top-rated na home; gráficos adicionais (PieChart, BarChart) via `dashboard-charts`; ações rápidas em FAB (Floating Action Button).
- Card de boas-vindas personalizado (nome do utilizador, saudação temporal).
- `PageHeader` reutilizável em todas as sub-páginas.
- Remoção de bordas em DataTable, user-list, loading-skeleton, cards de relatórios (uso de `bg-muted/40` em vez de `border`).
- Skeleton apenas na área de conteúdo (auth loading e `loading.tsx`); sidebar e header sempre visíveis durante loading.
- Sidebar fixa (`h-dvh`, `overflow-hidden`); utilizador no fundo da sidebar com flex layout; separador entre nome e links.
- Branding IndicAI: logo mark "IA" em badge amarelo + nome "IndicAI" em amarelo; itens colapsados centralizados com background adequado.
- Toast de erro com fundo vermelho escuro (`hsl(0 65% 22%)`).
- `CreateUserDialog` com trigger condicional (só renderiza botão quando não controlado).

---

## Superfície de rotas e páginas

### Rotas privadas (`/dashboard`)

| Path                       | Componente principal                                                                         | Descrição                                                |
| -------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `/dashboard`               | `dashboard-content.tsx`                                                                      | Home: métricas, tabelas recentes, gráficos, welcome card |
| `/dashboard/usuarios`      | `usuarios-content.tsx` + `user-list`                                                         | CRUD contas, ban, detail                                 |
| `/dashboard/profissionais` | `profissionais-list`                                                                         | Listagem + subscription-edit-dialog                      |
| `/dashboard/avaliacoes`    | `avaliacoes-list`                                                                            | Listagem, suspender, restaurar, eliminar                 |
| `/dashboard/denuncias`     | `feedback-list` + `respond-feedback-dialog`                                                  | Fila de feedback, resposta por e-mail                    |
| `/dashboard/relatorios`    | `financial-report`, `location-stats`, `top-professions-card`, `top-rated-professionals-card` | Relatório financeiro, geo, rankings                      |
| `/dashboard/banners`       | `banners-list` + `banner-form-dialog`                                                        | CRUD banners                                             |
| `/dashboard/sistema`       | `maintenance-toggle`                                                                         | Manutenção global                                        |

### Rotas públicas

| Path                       | Descrição                                             |
| -------------------------- | ----------------------------------------------------- |
| `/`                        | `home-redirect` → /dashboard ou /login conforme token |
| `/login`                   | Login admin                                           |
| `/indicai/recuperar-senha` | Esqueci a senha                                       |

---

## Alterações técnicas relevantes para revisão de código

### Layout e guard

- **`PrivateLayoutGuard`**: Renderiza `DashboardSidebar` + header + main sempre; skeleton de auth apenas dentro de `main`; redirect para /login se sem token após loading.
- **`DashboardSidebar`**: `h-dvh overflow-hidden`; `SidebarNavContent` com flex (nav flex-1, user menu no fundo); separadores.
- **`aceternity-sidebar.tsx`**: `SidebarLink` com `collapsed` logic (justify-center, padding reduzido); ícones centralizados quando colapsado.
- **`loading.tsx`** (dashboard): Skeleton de conteúdo durante code-split do Next.js.

### Componentes UI

- **`PageHeader`**: Título, descrição opcional, ícone opcional, `children` para ações.
- **`DataTable`**: Wrapper sem `border`; header primary, linhas alternadas.
- **`LoadingSkeleton`**: Variantes `table-rows` e `cards`; sem bordas; `border-border/30` sutil entre linhas.
- **`EmptyState`**: Ícone, mensagem, botão opcional.

### Serviços (fetch)

- `admin-auth-fetch`, `admin-users-fetch`, `admin-metrics-fetch`, `admin-avaliacoes-fetch`, `admin-profissionais-fetch`, `admin-relatorios-fetch`, `admin-banners-fetch`, `admin-system-fetch` (ou métodos em auth-fetch).

### Validação

- Schemas Zod em `schemas/auth.ts`, `usuarios.ts`, `profissionais.ts`, `relatorios.ts`, `banners.ts`.

---

## Ficheiros e pastas típicos a rever (diff)

| Área           | Caminhos                                                                                                                                                                                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layout         | `src/components/private-layout-guard.tsx`, `src/components/layout/sidebar.tsx`, `src/components/layout/aceternity-sidebar.tsx`, `src/components/layout/sidebar-user-menu.tsx`, `src/components/layout/bottom-nav.tsx` |
| Auth           | `src/components/auth/login/`, `src/contexts/auth-context.tsx`                                                                                                                                                         |
| Dashboard home | `src/app/(private)/dashboard/dashboard-content.tsx`, `src/components/features/dashboard/`                                                                                                                             |
| Features       | `src/components/features/usuarios/`, `profissionais/`, `avaliacoes/`, `denuncias/`, `banners/`, `relatorios/`, `sistema/`, `settings/`                                                                                |
| UI base        | `src/components/ui/page-header.tsx`, `data-table.tsx`, `loading-skeleton.tsx`, `empty-state.tsx`                                                                                                                      |
| Services       | `src/services/admin-*-fetch.ts`                                                                                                                                                                                       |
| Schemas        | `src/schemas/*.ts`                                                                                                                                                                                                    |
| Estilos        | `src/app/globals.css` (Sonner, chart colors, etc.)                                                                                                                                                                    |
| Rotas          | `src/app/(private)/`, `src/app/(auth)/`                                                                                                                                                                               |

---

## Dependências de runtime (env e serviços)

| Dependência                                      | Afeta                                    |
| ------------------------------------------------ | ---------------------------------------- |
| `NEXT_PUBLIC_API_URL`                            | Todas as chamadas ao backend             |
| Backend a correr (CORS para origem do dashboard) | Auth e operações                         |
| Tema (dark/light)                                | Componentes adaptam-se via CSS variables |

---

## Como testar (checklist para o revisor)

1. [ ] `pnpm build` — sem erros.
2. [ ] `pnpm lint` — sem erros.
3. [ ] Backend a correr; CORS configurado; login com admin.
4. [ ] Navegação entre páginas: sidebar e header estáveis; skeleton apenas no conteúdo.
5. [ ] Sidebar colapsada: ícones centralizados; logo "IA" + "IndicAI" legíveis.
6. [ ] Tabelas: sem bordas brancas; header amarelo; linhas alternadas.
7. [ ] Toast de erro: fundo vermelho escuro.
8. [ ] Filtros e pesquisa: nuqs na URL (page, search, etc.) partilháveis.
9. [ ] Ações destrutivas: confirmação antes de executar.
10. [ ] Quickstart: `pnpm dev` e fluxos principais conforme `quickstart.md`.

---

## Checklist específico para Copilot / assistente de revisão

- Confirmar que **todas** as chamadas ao backend usam `adminFetch` ou equivalente com token.
- Verificar que componentes com `useEffect` para dados exibem skeleton durante loading (não texto "Carregando").
- Garantir que `CreateUserDialog` em modo controlado (FAB, PageHeader) não renderiza trigger próprio.
- Alinhar mensagens de erro/toast com o resto da app (português).
- Verificar responsividade: bottom-nav em mobile, sidebar em desktop.

---

## Fora do escopo deste PR (para não confundir)

- Testes unitários ou E2E (spec menciona T076–T077 como pendentes).
- Refatoração de services ou split de módulos além do já feito.
- Backend: este PR é exclusivamente frontend (dashboard).

---

## Riscos e follow-ups sugeridos

- **Backend indisponível:** Falhas de rede tratadas com toast e retry onde aplicável; validar cenários offline.
- **Permissões:** Algumas rotas podem devolver 403 se o role do admin não tiver permissão; UI deve exibir feedback claro.
- **nuqs:** Filtros complexos em URL podem gerar strings longas; considerar limitar parâmetros em cenários de bookmark.

---

## Parágrafo de atenção (deploy e dívida técnica)

Antes de deploy, validar que `NEXT_PUBLIC_API_URL` aponta para o backend correto e que o backend está acessível. O dashboard não persiste dados localmente além do token de sessão; a fonte de verdade é o backend. Para evolução, vale considerar testes E2E (Playwright/Cypress) e documentação da convenção de checkpoints entre phases (T077).

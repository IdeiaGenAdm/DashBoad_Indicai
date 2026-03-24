# Feature Specification: Dashboard Admin Escalável IndicMe

**Feature Branch**: `001-scalable-admin-dashboard`  
**Created**: 2026-03-22  
**Status**: Draft  
**Input**: User description: "Adaptar o Dashboard com arquitetura escalável; planejar estrutura; ferramentas existentes e nuqs para filtros via URL; componentes padronizados; padrão de fetch em services; implementar 15 tarefas admin do spec do backend."

**Referência**: Esta especificação descreve o dashboard administrativo como interface para as capacidades já definidas e implementadas no backend (spec `001-admin-auth`).

## Clarifications

### Session 2026-03-22

- Q: Estrutura de pastas e padrões de código — qual abordagem adotar? → A: A — Modular por domínio: `app/(private)/[feature]/`, `components/features/[feature]/`, `services/admin-[feature]-fetch.ts`; um módulo por área (users, avaliações, banners, etc.).
- Q: Sidebar principal — qual componente e comportamento? → A: B — Aceternity Sidebar (expansão no hover no desktop); em mobile, navegação pela parte de baixo (bottom nav).
- Q: Padrão visual das tabelas — header e linhas alternadas? → A: Header amarelo (fundo amarelo, texto preto); linhas alternadas entre cor neutra e amarelo; letra e componentes devem adaptar-se aos temas dark e light.
- Q: Estados de UI (loading, vazio, erro) — qual nível de feedback? → A: C — Rich: Skeleton em listagens; empty state com ícone e mensagem; toast (Sonner) para erros e ações; spinner em botões de submit; erro inline por campo; retry em falhas de rede; skeleton customizado por tipo de conteúdo.
- Q: Parâmetros na URL (nuqs) — quais sincronizar? → A: B — page, search, sortBy, sortOrder, filtros por coluna (ex.: status, tipo).
- Q: Onde ficam os componentes — dentro de app ou fora? → A: Em `app/` apenas pastas de rota e `page.tsx`; todos os demais componentes em `components/`, organizados por área (ex.: `components/auth/login/`, `components/auth/recuperar-senha/`). Ajustar login e recuperar-senha para seguir esta convenção.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Login único e alteração de senha (Priority: P1)

Um administrador precisa entrar no dashboard através de um fluxo de login único (CPF/CNPJ e senha) e, quando necessário, alterar a própria senha diretamente na interface.

**Why this priority**: Sem acesso autenticado e seguro, nenhuma outra função administrativa pode ser utilizada.

**Independent Test**: Pode ser validado com tentativas de login bem-sucedidas e malsucedidas, alteração de senha e verificação de que o acesso é restrito a administradores.

**Acceptance Scenarios**:

1. **Given** um administrador com credenciais válidas e role privilegiado, **When** ele faz login no dashboard, **Then** obtém acesso às funcionalidades autorizadas.
2. **Given** um utilizador com credenciais válidas mas role comum (user), **When** tenta fazer login no dashboard, **Then** recebe mensagem de acesso restrito a administradores.
3. **Given** um administrador autenticado, **When** altera a própria senha com sucesso, **Then** outras sessões desse administrador são invalidadas e a nova senha passa a ser exigida.

---

### User Story 2 - Cadastro e exclusão de contas com indicadores comparativos (Priority: P2)

Um administrador precisa registar novas contas (profissional, empresa, cliente), desativar contas quando aplicável, e visualizar indicadores que permitam comparar efeitos das ações (contagens, tendências por tipo).

**Why this priority**: A gestão de identidades é pré-requisito para moderação, suporte e relatórios fiáveis.

**Independent Test**: Pode ser testado criando e desativando contas de cada tipo e verificando os indicadores comparativos na interface.

**Acceptance Scenarios**:

1. **Given** um administrador autenticado, **When** regista uma nova conta escolhendo o tipo (profissional, empresa ou cliente), **Then** a conta fica disponível nas listagens com o tipo identificado.
2. **Given** uma conta existente, **When** o administrador solicita remoção, **Then** a conta é desativada e os indicadores refletem a alteração.
3. **Given** os dados de contas, **When** o administrador consulta o painel de indicadores, **Then** vê métricas comparativas (contagens por tipo, evolução temporal).

---

### User Story 3 - Profissões mais buscadas e profissionais melhor avaliados (Priority: P3)

Um administrador precisa consultar rankings de profissões mais procuradas e de profissionais com melhor avaliação, de forma legível.

**Why this priority**: Informa estratégia de mercado e qualidade percebida.

**Independent Test**: Pode ser testado com dados de exemplo verificando ordenação e integridade dos números.

**Acceptance Scenarios**:

1. **Given** dados de procura na plataforma, **When** o administrador abre o relatório de profissões mais buscadas, **Then** vê um ranking coerente.
2. **Given** avaliações de profissionais, **When** o administrador consulta profissionais melhor avaliados, **Then** os resultados refletem critérios explícitos (média, período).

---

### User Story 4 - Gestão de avaliações: listagem, apagar e suspender (Priority: P4)

Um administrador precisa listar avaliações, filtrar e pesquisar, apagar avaliações inadequadas e suspender avaliações quando necessário sem apagar definitivamente.

**Why this priority**: Protege utilizadores e reputação da plataforma.

**Independent Test**: Pode ser testado com avaliações de exemplo, verificando estados (ativa, suspensa, removida).

**Acceptance Scenarios**:

1. **Given** avaliações existentes, **When** o administrador pesquisa ou aplica filtros (incluindo via URL partilhável), **Then** a lista mostra os registos esperados.
2. **Given** uma avaliação visível, **When** o administrador a suspende, **Then** deixa de ser apresentada aos utilizadores finais.
3. **Given** uma avaliação, **When** o administrador a elimina, **Then** o conteúdo deixa de estar disponível.

---

### User Story 5 - Plano, classificação e expiração do profissional (Priority: P5)

Um administrador precisa alterar o plano do profissional, a sua classificação e a data de expiração do plano, incluindo opção de nunca expirar.

**Why this priority**: Liga receita, direitos de funcionalidade e suporte operacional.

**Independent Test**: Pode ser testado alterando cada campo e verificando o comportamento refletido.

**Acceptance Scenarios**:

1. **Given** um profissional com plano atual, **When** o administrador altera plano, classificação ou data de expiração (ou marca nunca expirar), **Then** as alterações ficam registadas e refletidas.
2. **Given** alteração de plano ou expiração, **When** guardada, **Then** o sistema comporta-se de acordo com as novas regras (avisos, bloqueios conforme regras de negócio).

---

### User Story 6 - Denúncias, sugestões e reclamações com resposta ao autor (Priority: P6)

Um administrador precisa ver submissões (denúncias, sugestões, reclamações), distinguir tipo e estado, e enviar resposta ao autor por e-mail mantendo registo.

**Why this priority**: Fecha o ciclo de feedback e conformidade com expectativas de contacto.

**Independent Test**: Pode ser testado com submissões de exemplo e verificação de envio e registo da resposta.

**Acceptance Scenarios**:

1. **Given** submissões existentes, **When** o administrador abre a fila, **Then** consegue distinguir tipo e estado.
2. **Given** uma submissão com autor identificável, **When** o administrador envia resposta, **Then** o autor recebe por e-mail e o caso fica associado à resposta.
3. **Given** autor sem e-mail válido, **When** o administrador tenta responder, **Then** recebe indicação de falha.

---

### User Story 7 - Relatório financeiro por profissionais e planos (Priority: P7)

Um administrador precisa de uma visão agregada dos profissionais e respetivos planos para relatório financeiro (receitas, distribuição por plano, totais).

**Why this priority**: Suporta contabilidade e decisões comerciais.

**Independent Test**: Pode ser testado com dados fictícios conferindo totais e quebras por plano ou profissional.

**Acceptance Scenarios**:

1. **Given** profissionais com planos, **When** o administrador gera o relatório financeiro, **Then** obtém totais e detalhes para revisão.
2. **Given** filtros por período ou plano, **When** aplicados, **Then** o relatório limita os resultados de forma coerente.

---

### User Story 8 - Localização dos utilizadores e demanda (Priority: P8)

Um administrador precisa entender a distribuição geográfica dos utilizadores para avaliar nível de procura e utilização por região.

**Why this priority**: Apoia expansão, marketing e capacidade operacional.

**Independent Test**: Pode ser testado com perfis com localização conhecida e verificação de agregações respeitando privacidade.

**Acceptance Scenarios**:

1. **Given** utilizadores com localização, **When** o administrador consulta o painel de localização, **Then** vê agrupamentos úteis (por região) sem expor dados desnecessários.
2. **Given** utilizadores sem localização, **When** o relatório é gerado, **Then** o tratamento de “desconhecido” é explícito.

---

### User Story 9 - Banners direcionados (Priority: P9)

Um administrador precisa criar e enviar banners para um ou mais utilizadores específicos ou para todos, para avisos direcionados.

**Why this priority**: Permite comunicação operacional e de marketing.

**Independent Test**: Pode ser testado definindo destinatários e publicando avisos.

**Acceptance Scenarios**:

1. **Given** utilizadores alvo, **When** o administrador cria um banner para esse conjunto (ou todos), **Then** apenas os elegíveis o verão.
2. **Given** um banner ativo, **When** o administrador o retira ou agenda fim, **Then** deixa de ser mostrado conforme regras.

---

### User Story 10 - Suspensão do serviço e bloqueio de utilizadores (Priority: P10)

Um administrador precisa ativar suspensão global do serviço (manutenção) e bloquear o acesso de um ou mais utilizadores, ou de todos.

**Why this priority**: Reduz risco operacional em incidentes.

**Independent Test**: Pode ser testado ativando e desativando estados e verificando que utilizadores afetados não conseguem uso normal.

**Acceptance Scenarios**:

1. **Given** necessidade de manutenção, **When** o administrador ativa suspensão global, **Then** utilizadores finais veem indisponibilidade; administradores mantêm acesso.
2. **Given** utilizadores identificados, **When** o administrador bloqueia o acesso, **Then** esses utilizadores não conseguem usar a plataforma até reversão.
3. **Given** bloqueio em massa, **When** ativado, **Then** existe confirmação reforçada; reversão é traçável.

---

### User Story 11 - Remoção de fotos de perfil e vitrine (Priority: P11)

Um administrador precisa remover fotos de perfil ou de vitrine quando o conteúdo é inadequado.

**Why this priority**: Moderação visual é parte comum de marketplaces de serviços.

**Independent Test**: Pode ser testado marcando conteúdo e verificando que a imagem deixa de ser exibida e que a ação fica registada para auditoria.

**Acceptance Scenarios**:

1. **Given** uma foto de perfil ou vitrine visível, **When** o administrador remove a imagem, **Then** a imagem deixa de estar disponível para utilizadores finais.
2. **Given** remoção, **When** o utilizador afetado acede à conta, **Then** vê estado coerente (placeholder ou similar).

---

### Edge Cases

- Filtros e pesquisa partilháveis via URL: quando o administrador aplica filtros ou pesquisa, o estado deve ser partilhável (URL) para permitir bookmark e partilha.
- Tabelas com muitos registos: paginação e indicação de progresso; Skeleton customizado por tipo de conteúdo durante carregamento; empty state com ícone e mensagem quando não há dados.
- Ações destrutivas (bloqueio em massa, exclusão): confirmação explícita antes de executar.
- Erros de rede ou API: feedback claro ao utilizador (toast Sonner, erro inline por campo quando aplicável); opção de retry em falhas de rede; sem perder o contexto da página.
- Sessão expirada durante operação: redirecionamento para login com mensagem adequada.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: O dashboard MUST disponibilizar fluxo de login exclusivo para administradores (CPF/CNPJ e senha), recusando acesso a utilizadores sem role privilegiado.
- **FR-002**: Administradores autenticados MUST poder alterar a própria senha na interface; após sucesso, outras sessões desse administrador MUST ser invalidadas.
- **FR-003**: O dashboard MUST apresentar interfaces para cadastro de contas (profissional, empresa, cliente) e desativação de contas, com indicadores comparativos visíveis.
- **FR-004**: O dashboard MUST permitir consulta de profissões mais buscadas e profissionais melhor avaliados em formato legível.
- **FR-005**: O dashboard MUST permitir listar, filtrar e pesquisar avaliações, com opções de apagar e suspender.
- **FR-006**: O dashboard MUST permitir alterar plano, classificação e data de expiração do profissional, incluindo opção de nunca expirar.
- **FR-007**: O dashboard MUST permitir gestão de denúncias, sugestões e reclamações, com campo para resposta ao autor enviada por e-mail.
- **FR-008**: O dashboard MUST permitir consulta de relatório financeiro por profissionais e planos, com filtros por período e plano.
- **FR-009**: O dashboard MUST permitir visualizar agregações de localização dos utilizadores para análise de demanda.
- **FR-010**: O dashboard MUST permitir criar, editar e remover banners direcionados a utilizadores específicos ou a todos.
- **FR-011**: O dashboard MUST permitir ativar/desativar suspensão global do serviço e bloquear/desbloquear utilizadores (individual, grupo ou todos).
- **FR-012**: O dashboard MUST permitir remover fotos de perfil e de vitrine.
- **FR-013**: Filtros e pesquisa em listagens MUST ser partilháveis via URL (nuqs): page, search, sortBy, sortOrder e filtros por coluna (ex.: status, tipo) para permitir bookmark e partilha.
- **FR-014**: Tabelas e listagens MUST ter padrão visual consistente: header amarelo (fundo amarelo, texto preto), textos em negrito, linhas alternadas neutro/amarelo; componentes e tipografia adaptam-se aos temas dark e light.
- **FR-015**: Chamadas ao backend MUST ser organizadas em pasta de services, com um ficheiro por domínio/fetch (ex.: admin-user-fetch).
- **FR-016**: O layout admin MUST usar Aceternity Sidebar no desktop (expansão no hover) e navegação na parte de baixo (bottom nav) em dispositivos móveis.
- **FR-017**: Estados de UI MUST seguir padrão rich: Skeleton customizado por tipo em listagens; empty state com ícone e mensagem; toast (Sonner) para erros e ações; spinner em botões de submit; erro inline por campo em formulários; opção de retry em falhas de rede.
- **FR-018**: A pasta `app/` MUST conter apenas pastas de rota e ficheiros `page.tsx`; componentes MUST ficar em `components/`, organizados por área (ex.: `components/auth/login/`, `components/auth/recuperar-senha/`).
- **FR-019**: Schemas Zod MUST ficar em `schemas/`, organizados por domínio (ex.: `schemas/auth.ts`, `schemas/usuarios.ts`).
- **FR-020**: Páginas (`page.tsx`) MUST ser Server Components (SSR) por defeito; usar `"use client"` apenas em componentes que requeiram interactividade (hooks, formulários, nuqs, context). A composição Server → Client deve ser usada: a página renderiza no servidor e importa componentes client onde necessário.

### Key Entities _(include if feature involves data)_

- **Administrador**: utilizador com role privilegiado; autentica-se no dashboard; pode alterar própria senha.
- **Conta**: profissional, empresa ou cliente; pode ser criada e desativada pelo admin.
- **Profissional**: conta com plano, classificação, data de expiração, avaliações, fotos de perfil e vitrine.
- **Avaliação**: conteúdo classificatório; estados ativa, suspensa, removida.
- **Submissão de feedback**: denúncia, sugestão ou reclamação; autor; resposta associada.
- **Banner**: mensagem visual; audiência (utilizadores específicos ou todos); vigência.
- **Relatório financeiro**: dados agregados por profissionais e planos.
- **Agregação geográfica**: localização/região para análise de procura.
- **Estado de serviço**: suspensão global; bloqueio de utilizadores.

## Assumptions

- O backend já expõe as APIs necessárias (spec 001-admin-auth); o dashboard consome essas APIs.
- Autenticação: o dashboard usa o fluxo existente (login com CPF/senha) ou Better Auth; acesso restrito a roles privilegiados.
- Componentes e ferramentas: utilizam-se shadcn, Aceternity (sidebar desktop com expansão no hover), Lucide React, Zod, React Hook Form, Sonner (toast), nuqs (query/URL), Skeleton (loading), Table, Tooltip, Card, Chart, Dialog, Form, Tabs. Em mobile: navegação principal na parte de baixo (bottom nav).
- Paleta visual: preto e amarelo; tabelas com header amarelo (fundo amarelo, texto preto), linhas alternadas neutro/amarelo; todos os componentes e tipografia adaptam-se aos temas dark e light.
- **Estrutura modular por domínio**: `app/(private)/dashboard/` contém a página central (`page.tsx`) e subpastas por feature (`usuarios/`, `avaliacoes/`, `banners/`, etc.); URLs: `/dashboard`, `/dashboard/usuarios`, `/dashboard/profissionais`, etc. Componentes em `components/features/[feature]/`; services em `services/admin-[feature]-fetch.ts`.
- **SSR**: Páginas são Server Components; dados iniciais (quando possível) obtidos no servidor; componentes com interactividade (formulários, listagens com nuqs) ficam em ficheiros com `"use client"` e são importados nas páginas.
- **Convenção app vs components**: Dentro de `app/` ficam apenas as pastas de rota e os ficheiros `page.tsx`; qualquer outro componente vai para `components/`. Áreas como login, recuperar-senha têm o componente em `components/auth/[nome-da-area]/` (ex.: `components/auth/login/`, `components/auth/recuperar-senha/`).
- **Schemas**: Pasta `schemas/` para todos os schemas Zod (validação de formulários); organizar por domínio (ex.: `schemas/auth.ts`, `schemas/usuarios.ts`).
- Filtros e pesquisa sincronizados com URL via nuqs: page, search, sortBy, sortOrder, filtros por coluna (status, tipo, etc.) para partilha e bookmark.
- Todas as ações administrativas deixam registo de auditoria no backend; o dashboard pode expor visualização de logs de auditoria quando relevante.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Em testes de aceitação, login, alteração de senha e restrição a admins produzem o comportamento esperado.
- **SC-002**: Um administrador consegue criar uma conta de cada tipo e ver o tipo correto nas listagens em menos de 5 minutos por conta.
- **SC-003**: Ações de moderação (suspender/eliminar avaliação, remover foto) refletem-se na experiência do utilizador final dentro do prazo aceitável.
- **SC-004**: Relatórios (profissões, profissionais avaliados, localização, financeiro) apresentam totais reconciliáveis com os dados de origem em cenários de teste.
- **SC-005**: Filtros e pesquisa aplicados podem ser partilhados via URL e restaurados ao abrir o link.
- **SC-006**: Tabelas e listagens seguem padrão visual consistente (header destacado, linhas alternadas).
- **SC-007**: Administradores conseguem executar tarefas semanais típicas (moderação, ajuste de plano, resposta a reclamações) sem necessidade de suporte técnico em mais de 80% dos casos.

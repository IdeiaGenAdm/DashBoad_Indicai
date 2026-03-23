# Research: Dashboard Admin Escalável

**Feature**: 001-scalable-admin-dashboard | **Date**: 2026-03-22

## Scope

Todas as decisões técnicas foram resolvidas durante a sessão de clarificação (`/speckit.clarify`). Este documento consolida as opções escolhidas e alternativas descartadas.

---

## 1. Estrutura de pastas

**Decision**: Modular por domínio (Opção A)

**Rationale**: Um módulo por área admin (usuários, avaliações, banners, etc.) permite escalar sem duplicação; colocation de componentes por feature facilita manutenção.

**Alternatives considered**:

- B (Flat simples): Menos hierarquia; menos escalável.
- C (Feature-first com colocation total): Mais complexo para Next.js App Router.

---

## 2. Sidebar e navegação mobile

**Decision**: Aceternity Sidebar (desktop, expansão no hover) + bottom nav (mobile)

**Rationale**: Alinhado à spec; melhor UX em desktop (expansão sem clicar) e mobile (acesso rápido na parte inferior).

**Alternatives considered**:

- A (Manter shadcn Sidebar): Menos animação; não explora Aceternity.
- C (Sidebar fixa): Simples mas menos flexível em mobile.

---

## 3. Padrão visual das tabelas

**Decision**: Header amarelo (fundo amarelo, texto preto); linhas alternadas neutro/amarelo; adaptação dark/light

**Rationale**: Consistência com paleta; boa legibilidade; suporte a temas.

**Alternatives considered**:

- B (Header preto): Mais contraste; menos destaque de marca.
- C (Borda/acento): Mais subtil; menos consistente.

---

## 4. Estados de UI (loading, vazio, erro)

**Decision**: Padrão Rich (Opção C) — Skeleton customizado, empty state, toast Sonner, spinner em submit, erro inline, retry em falhas

**Rationale**: Feedback completo ao utilizador; reduz confusão em erros e listagens vazias.

**Alternatives considered**:

- A (Mínimo): Menos implementação; UX inferior.
- B (Padrão): Intermédio; sem retry nem skeleton customizado.

---

## 5. Parâmetros na URL (nuqs)

**Decision**: page, search, sortBy, sortOrder, filtros por coluna (status, tipo, etc.)

**Rationale**: Cobertura do essencial para partilha e bookmark; não polui a URL com limit/view.

**Alternatives considered**:

- A (Só page e search): Insuficiente para filtros avançados.
- C (+ limit, view): Mais flexível; mais complexo; pode ser adicionado depois.

---

## 6. Convenção app vs components

**Decision**: Em `app/` apenas pastas de rota e `page.tsx`; componentes em `components/` por área (ex.: `components/auth/login/`)

**Rationale**: Separar rotas de lógica/UI; manter app/ limpo; facilitar testes e reutilização.

**Alternatives considered**: Colocation em app/ — rejeitado por decisão explícita do utilizador.

---

## 7. Integração com backend

**Decision**: Consumir APIs REST do backend (spec 001-admin-auth); token JWT em header `Authorization: Bearer <token>`; adminFetch em lib/api.ts

**Rationale**: Backend já implementado; contrato estável; sem necessidade de GraphQL ou alternativas.

**Alternatives considered**: Better Auth no frontend — mantido fluxo atual (login API) por simplicidade; migração possível no futuro.

---

## 8. Estratégia de rendering (SSR)

**Decision**: SSR por defeito; Server Components nas páginas; `"use client"` apenas onde necessário

**Rationale**: Next.js App Router favorece Server Components para melhor desempenho (menos JavaScript no cliente), SEO e carregamento inicial. Formulários, listagens com filtros nuqs e componentes com hooks precisam de client; a composição Server → Client mantém a página leve.

**Guidelines**:

- `page.tsx` = Server Component (sem `"use client"`)
- Componente que usa `useState`, `useEffect`, `useForm`, nuqs ou context → `"use client"`
- Dados iniciais (quando acedíveis sem token no servidor) podem ser fetches async nas páginas

**Alternatives considered**:

- Client-only SPA: Mais JavaScript; carregamento mais lento; rejeitado.
- Full RSC (sem client): Formulários e nuqs exigem client; híbrido é o equilíbrio.

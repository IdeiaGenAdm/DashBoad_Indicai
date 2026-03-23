# Implementation Plan: Dashboard Admin Escalável IndicAI

**Branch**: `001-scalable-admin-dashboard` | **Date**: 2026-03-22 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/001-scalable-admin-dashboard/spec.md`

## Summary

Adaptar o dashboard administrativo IndicAI com arquitetura modular por domínio, consumindo as APIs do backend (spec 001-admin-auth). Inclui: layout Aceternity Sidebar (desktop) + bottom nav (mobile), tabelas com padrão visual (header amarelo, linhas alternadas), filtros via nuqs (page, search, sortBy, sortOrder), serviços por domínio e 11 áreas admin (login, contas, avaliações, denúncias, relatórios, banners, sistema, etc.).

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router), React 19  
**Primary Dependencies**: shadcn/ui, Aceternity Sidebar, nuqs, Sonner, Zod, React Hook Form, Lucide React, next-themes  
**Storage**: N/A (dashboard consome APIs REST do backend)  
**Testing**: ESLint; testes manuais/E2E conforme evolução  
**Target Platform**: Web (desktop + mobile responsivo)  
**Project Type**: Web application (Next.js SPA)  
**Performance Goals**: Carregamento de listagens em <2s; transições suaves  
**Constraints**: CORS configurado no backend; token JWT em localStorage  
**Scale/Scope**: ~15 páginas admin; ~12 domains de services; paleta preto+amarelo; dark/light mode  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Constitution file not found (`.specify/memory/constitution.md`); gates skipped.

## Project Structure

### Documentation (this feature)

```text
specs/001-scalable-admin-dashboard/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks - not created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── indicai/recuperar-senha/page.tsx
│   ├── (private)/
│   │   ├── layout.tsx
│   │   └── dashboard/
│   │       ├── page.tsx              # Página central do dashboard
│   │       ├── usuarios/page.tsx
│   │       ├── profissionais/page.tsx
│   │       ├── avaliacoes/page.tsx
│   │       ├── denuncias/page.tsx
│   │       ├── relatorios/page.tsx
│   │       ├── banners/page.tsx
│   │       └── sistema/page.tsx
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                    # Primitivos shadcn
│   ├── layout/                # Sidebar, bottom-nav, guards
│   ├── auth/
│   │   ├── login/
│   │   ├── recuperar-senha/
│   │   └── reset-senha/
│   └── features/
│       ├── usuarios/
│       ├── avaliacoes/
│       ├── banners/
│       └── ...
│
├── contexts/
│   ├── auth-context.tsx
│   └── theme-provider (via providers)
│
├── services/
│   ├── admin-users-fetch.ts
│   ├── admin-avaliacoes-fetch.ts
│   ├── admin-banners-fetch.ts
│   ├── admin-metrics-fetch.ts
│   └── ...
│
├── hooks/
├── lib/
│   ├── api.ts
│   └── utils.ts
├── schemas/                 # Schemas Zod por domínio
│   ├── auth.ts
│   └── ...                  # usuarios, avaliacoes, banners, etc.
└── types/
```

**Structure Decision**: Estrutura modular por domínio (Clarification A). Em `app/` apenas rotas e `page.tsx`; componentes em `components/` por área. Services um ficheiro por domínio (`admin-*-fetch.ts`).

## Complexity Tracking

> N/A — Sem violações de constitution a justificar.

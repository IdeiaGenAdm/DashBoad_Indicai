# Quickstart: Dashboard Admin IndicAI

**Feature**: 001-scalable-admin-dashboard

## Pré-requisitos

- Node.js 20+
- pnpm (ou npm/yarn)
- Backend IndicAI a correr em `http://localhost:5000` (ou configurar `NEXT_PUBLIC_API_URL`)

## Setup

```bash
# Instalar dependências
pnpm install

# Variáveis de ambiente (criar .env.local)
# NEXT_PUBLIC_API_URL=http://localhost:5000

# Desenvolvimento
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Dependências a adicionar (para esta feature)

```bash
# nuqs (filtros via URL)
pnpm add nuqs

# Sonner (toast) — se ainda não instalado
pnpm add sonner

# Aceternity Sidebar (via shadcn)
npx shadcn@latest add "https://ui.aceternity.com/r/sidebar.json"

# Componentes shadcn em falta
npx shadcn@latest add table
npx shadcn@latest add chart
# tooltip, skeleton já presentes
```

## Estrutura de trabalho

1. **Layout**: Substituir sidebar atual por Aceternity; criar `BottomNav` para mobile
2. **Auth**: Reorganizar `components/auth/login/` e `components/auth/recuperar-senha/`
3. **Services**: Criar `services/admin-users-fetch.ts` e demais por domínio
4. **Rotas**: Adicionar páginas em `app/(private)/dashboard/[feature]/` (URLs: /dashboard, /dashboard/usuarios, etc.)
5. **Tabelas**: Criar componente `DataTable` com padrão visual (header amarelo, linhas alternadas) e nuqs

## Backend

O backend deve estar a correr com CORS configurado para `http://localhost:3000` (ou a origem do dashboard).

```bash
# No projeto indicai-backend
pnpm dev
```

## Comandos úteis

```bash
pnpm dev        # Desenvolvimento
pnpm build      # Build produção
pnpm format     # Prettier
pnpm lint       # ESLint
```

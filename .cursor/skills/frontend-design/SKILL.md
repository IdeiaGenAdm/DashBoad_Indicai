---
name: frontend-design
description: >-
  Define e guia a criação de interfaces frontend distintas e production-grade
  para o Dashboard IndicAI. Use ao construir componentes, páginas ou telas.
  Prioriza componentes existentes, evita estéticas genéricas e inspira decisões
  criativas baseadas na paleta preto+amarelo e no design system do projeto.
---

# Frontend Design — Dashboard IndicAI

Orientação para criar interfaces distintas, memoráveis e production-grade. Combina **design thinking** com **uso rigoroso dos componentes existentes**. Nunca HTML/CSS/Motion cru — apenas Tailwind, shadcn/ui e ecossistema do projeto.

Use ao construir componentes, páginas, dialogs, formulários ou qualquer tela do dashboard.

---

## Quick Start

1. **Verificar componentes existentes** em `@/components/ui`, `@/components/layout`, `@/components/features`.
2. **Compor** com os existentes via props, `className` e variantes.
3. **Estilizar** só com Tailwind; usar variáveis do tema (`primary`, `muted`, etc.).
4. **Criar carácter** — escolher uma direção estética e executá-la com precisão.

---

## Stack

| Área | Tecnologia |
|------|------------|
| Framework | Next.js (App Router) |
| UI | shadcn/ui, Radix UI |
| Estilos | Tailwind CSS (utilitários) |
| Formulários | react-hook-form + zod |
| Estado URL | nuqs |
| Ícones | lucide-react |
| Toasts | Sonner |
| Charts | recharts (ChartContainer) |

---

## Prioridade de Componentes

### UI (`@/components/ui`)

| Categoria | Componentes | Uso típico |
|-----------|-------------|------------|
| Layout | Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter | Blocos, métricas, painéis |
| Formulários | Form, FormField, FormItem, FormLabel, FormControl, FormMessage + Input, Select, Textarea, Checkbox | Formulários validados com zod |
| Dados | Table, DataTable (header amarelo, linhas alternadas) | Listagens, tabelas admin |
| Overlays | Dialog, Sheet, DropdownMenu, Tooltip | Modais, drawers, menus |
| Feedback | Skeleton, LoadingSkeleton, EmptyState | Loading, estados vazios |
| Base | Button, Input, Label, Separator | Ações, campos, divisores |
| Outros | Chart, Sidebar | Gráficos, navegação |

### Layout (`@/components/layout`)

- **AceternitySidebar** — Sidebar desktop (hover)
- **BottomNav** — Navegação mobile
- **PrivateLayoutGuard** — Layout com sidebar + bottom-nav
- **UserMenu** — Dropdown perfil (alterar senha, logout)

### Features

- Padrão: `components/features/<área>/` (usuarios, avaliacoes, denuncias, banners, etc.)
- Reutilizar: CreateUserDialog, ChangePasswordForm, MetricsCards, EmptyState, LoadingSkeleton

**Regra**: Se existe componente adequado, usá-lo. Não criar alternativas em HTML/CSS. Adaptar via `className`, `variant`, props.

---

## Design Thinking

Antes de codar, definir:

1. **Propósito** — Que problema resolve? Quem usa?
2. **Tom** — Minimal, refinado, editorial, utilitário, acolhedor?
3. **Restrições** — Performance, acessibilidade, consistência.
4. **Diferenciação** — O que torna esta tela memorável?

Escolher uma direção clara e executar com precisão.

---

## Direções Estéticas

### Minimal Refinado
- Espaço negativo generoso
- Tipografia limpa (Poppins)
- Uso moderado de cor (primary como acento)
- Bordas subtis, sombras leves

### Editorial
- Hierarquia forte: títulos grandes, descrições menores
- Cards com descrições e contexto
- Ícones como apoio, não como decoração

### Utilitário
- Densidade de informação clara
- DataTable com header amarelo, linhas alternadas
- Ações visíveis (Button primary para primária, outline para secundária)

### Acolhedor
- Gradientes suaves (`from-primary/15 via-primary/5`)
- Ícones em containers (`rounded-xl bg-primary/20`)
- Texto de apoio (CardDescription, mensagens claras)

**Exemplo de aplicação** — Login usa "Acolhedor + Editorial": card esquerdo com gradiente, ícone em container, descrição; card direito focado no form.

---

## Paleta e Tema

### Identidade IndicAI
- **Primary**: amarelo vibrante (`hsl(52 98% 52%)`) — CTAs, destaques, headers de tabela
- **Foreground**: preto/neutro — texto principal
- **Muted**: neutro suave — secundário, ícones secundários

### Uso criativo da paleta

| Contexto | Boa prática |
|----------|-------------|
| Destaque | `bg-primary`, `text-primary`, `border-primary` |
| Fundo suave | `bg-primary/5`, `bg-primary/10`, `from-primary/15` |
| Ícones de destaque | `text-primary` ou container `bg-primary/20` |
| Cards especiais | Gradiente `bg-linear-to-br from-primary/15 via-primary/5 to-transparent` |
| Tabelas | `[&_thead]:bg-primary`, linhas `bg-primary/5` (even), hover `bg-primary/10` |

### Dark mode
- Variáveis em `globals.css` (`.dark`) já cobrem tema
- Usar tokens (`bg-background`, `text-foreground`) — nunca cores fixas para fundo/texto

---

## Tipografia

- **Fonte**: Poppins (sans), Geist Mono (mono) — definidas em `layout.tsx`
- **Hierarquia**:
  - Títulos de página: `text-3xl font-bold` ou `text-2xl font-bold tracking-tight`
  - Títulos de card: `text-2xl` (CardTitle) ou `text-sm font-medium` (métricas)
  - Corpo: `text-sm` padrão
  - Secundário: `text-muted-foreground`

---

## Padrões de Componentes

### Página com métricas
- `h1` + `p` descritivo no topo
- `MetricsCards` ou grid de Cards
- Card principal com conteúdo secundário

### Listagem (DataTable)
- Usar `DataTable`, `DataTableHeader`, `DataTableBody`, `DataTableRow`, `DataTableHead`, `DataTableCell`
- Header amarelo, linhas alternadas — já definido no componente

### Loading
- `LoadingSkeleton` ou `Skeleton` dentro de Cards
- Ex.: grid de Cards com `animate-pulse` em placeholders

### Estado vazio
- `EmptyState` com ícone, mensagem e ação opcional (Button `variant="outline"`)

### Formulário
- Form + react-hook-form + zod
- `space-y-4` entre campos
- Loader (`Loader2` animate-spin) no botão de submit
- Toast Sonner para erros

### Dialogs / Modais
- `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter`
- Botões: primária (default), cancelar (outline ou ghost)

---

## Exemplos de Decisões Criativas

### ✅ Bom — Card de destaque
```tsx
<Card className="overflow-hidden border-0 bg-linear-to-br from-primary/15 via-primary/5 to-transparent">
  <CardContent className="flex flex-col justify-center p-8">
    <div className="flex size-14 items-center justify-center rounded-xl bg-primary/20">
      <LayoutDashboard className="size-8 text-primary" />
    </div>
    ...
  </CardContent>
</Card>
```
Gradiente suave, ícone em container, sem borda — transmite destaque e acolhimento.

### ✅ Bom — Métricas em grid
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Utilizadores</CardTitle>
      <Users className="size-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{total}</div>
    </CardContent>
  </Card>
</div>
```
Layout responsivo, hierarquia clara, ícone secundário.

### ❌ Evitar — Card genérico
```tsx
<div className="p-4 bg-white rounded shadow">
  <div className="text-lg font-bold">{total}</div>
</div>
```
Usar `Card` existente; evitar divs com classes repetidas.

### ❌ Evitar — Cor fixa
```tsx
<div className="bg-yellow-400 text-black">...</div>
```
Usar `bg-primary text-primary-foreground` para respeitar tema e dark mode.

---

## Workflow de Implementação

```
□ 1. Verificar se existe componente em ui/, layout/, features/
□ 2. Se sim: compor com ele; se não: shadcn add ou compor existentes
□ 3. Escolher direção estética (minimal, editorial, utilitário, acolhedor)
□ 4. Aplicar paleta (primary, muted, gradientes quando apropriado)
□ 5. Estilizar só com Tailwind (classes utilitárias)
□ 6. Loading: Skeleton/LoadingSkeleton; vazio: EmptyState; erro: toast Sonner
□ 7. Revisar: carácter distintivo vs genérico?
```

---

## Anti-Patterns

- ❌ Escrever HTML/CSS/Motion cru
- ❌ Criar componentes que já existem (DataTable, Card, EmptyState, etc.)
- ❌ Ignorar convenções (features/, schemas, nuqs)
- ❌ Fontes ou paletas fora do sistema (Poppins, preto+amarelo)
- ❌ Layouts genéricos sem carácter
- ❌ Cores fixas (yellow-400, black) em vez de tokens do tema

---

## Resumo

| Aspeto | O que fazer |
|--------|-------------|
| Componentes | Priorizar sempre os existentes |
| Estilo | Tailwind + variáveis do tema |
| Criatividade | Direção estética clara; usar paleta de forma intencional |
| Consistência | Seguir padrões (MetricsCards, DataTable, EmptyState, Form) |
| Feedback | Skeleton, EmptyState, Sonner |

Para detalhes de tokens e variáveis CSS, ver [reference.md](reference.md).

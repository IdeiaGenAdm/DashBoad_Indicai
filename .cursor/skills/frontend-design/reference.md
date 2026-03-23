# Referência — Design System IndicAI

Material de apoio para decisões de design. Consultar quando precisar de detalhes sobre tokens, variáveis ou padrões visuais.

---

## Variáveis CSS (globals.css)

### Light ( :root )

| Variável             | Valor       | Uso                    |
| -------------------- | ----------- | ---------------------- |
| --background         | 60 9% 98%   | Fundo da página        |
| --foreground         | 0 0% 4%     | Texto principal        |
| --primary            | 52 98% 52%  | Amarelo IndicAI        |
| --primary-foreground | 0 0% 0%     | Texto sobre primary    |
| --secondary          | 220 14% 96% | Fundos secundários     |
| --muted              | 220 14% 96% | Fundos discretos       |
| --muted-foreground   | 220 9% 46%  | Texto secundário       |
| --accent             | 52 98% 95%  | Hover suave em primary |
| --destructive        | 0 84% 60%   | Erros, exclusões       |
| --border             | 220 13% 91% | Bordas                 |
| --ring               | 52 98% 52%  | Focus rings            |
| --radius             | 0.625rem    | Border radius base     |
| --success            | 142 76% 36% | Confirmações           |

### Dark ( .dark )

| Variável     | Valor      | Notas                              |
| ------------ | ---------- | ---------------------------------- |
| --background | 0 0% 4%    | Fundo escuro                       |
| --foreground | 60 9% 98%  | Texto claro                        |
| --primary    | 52 98% 55% | Amarelo ligeiramente mais vibrante |
| --card       | 0 0% 8%    | Cards escuros                      |

### Uso no Tailwind

- `bg-background`, `text-foreground`
- `bg-primary`, `text-primary`, `text-primary-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-accent`, `text-accent-foreground`
- `border-border`, `ring-ring`
- `rounded-lg` (usa --radius)

---

## DataTable — Padrão Visual

O componente `DataTable` aplica automaticamente:

- Header: `bg-primary text-primary-foreground font-semibold`
- Linhas pares: `bg-primary/5` (light), `bg-primary/10` (dark)
- Linhas ímpares: `bg-muted/50`
- Hover: `bg-primary/10` (light), `bg-primary/20` (dark)
- Bordas: `border-primary/10`

Não sobrescrever estes estilos a menos que haja motivo explícito.

---

## Button — Variantes

| Variant     | Uso                             |
| ----------- | ------------------------------- |
| default     | Ação primária (primary amarelo) |
| destructive | Exclusão, confirmação de risco  |
| outline     | Ação secundária, cancelar       |
| secondary   | Ação neutra                     |
| ghost       | Ação terciária, itens de menu   |
| link        | Links inline                    |

| Size    | Uso                          |
| ------- | ---------------------------- |
| default | Botões padrão                |
| sm      | Botões compactos, EmptyState |
| lg      | CTAs grandes                 |
| icon    | Botão só ícone (quadrado)    |

---

## Espaçamento Consistente

- Entre secções de página: `space-y-6` ou `gap-6`
- Entre cards em grid: `gap-4`
- Dentro de formulários: `space-y-4`
- Card padding: `p-6` (CardHeader, CardContent)
- Padding reduzido em headers de métricas: `pb-2`

---

## Gradientes Sugeridos

- Card de destaque: `bg-linear-to-br from-primary/15 via-primary/5 to-transparent`
- Dark: `dark:from-primary/20 dark:via-primary/10 dark:to-transparent`

---

## Ícones (lucide-react)

- Tamanho padrão em UI: `size-4` (16px)
- Ícones em cards de métricas: `size-4 text-muted-foreground`
- Ícones de destaque: `size-8 text-primary` em container `size-14 rounded-xl bg-primary/20`
- EmptyState: `size-12 opacity-50`

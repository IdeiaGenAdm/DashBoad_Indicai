# Contrato: Admin API (Backend → Dashboard)

**Base URL**: `{NEXT_PUBLIC_API_URL}/api` (ex.: `http://localhost:5000/api`)  
**Auth**: `Authorization: Bearer <token>` (JWT) em todas as rotas `/api/admin/*`

---

## Auth (público)

| Método | Path                  | Descrição                                           |
| ------ | --------------------- | --------------------------------------------------- |
| POST   | /auth/login           | Body: `{ cpf, senha }` → `{ user, token, message }` |
| GET    | /auth/me              | Headers: Bearer token → `{ user }`                  |
| POST   | /auth/forgot-password | Body: `{ email }`                                   |
| POST   | /auth/reset-password  | Body: `{ token, cpf, senha, confirmSenha }`         |

---

## Admin (requer auth)

### Auth

| Método | Path                        | Descrição              | Permission   |
| ------ | --------------------------- | ---------------------- | ------------ |
| POST   | /admin/auth/change-password | Alterar senha do admin | requireAdmin |

### System

| Método | Path                      | Descrição            | Permission    |
| ------ | ------------------------- | -------------------- | ------------- |
| GET    | /admin/system/maintenance | Estado manutenção    | requireMaster |
| POST   | /admin/system/maintenance | Ativar manutenção    | requireMaster |
| DELETE | /admin/system/maintenance | Desativar manutenção | requireMaster |

### Users

| Método | Path                                         | Descrição                          | Permission       |
| ------ | -------------------------------------------- | ---------------------------------- | ---------------- |
| POST   | /admin/users                                 | Criar conta (profissional/cliente) | requireAdmin     |
| POST   | /admin/empresas                              | Criar conta empresa                | requireAdmin     |
| GET    | /admin/users                                 | Listar utilizadores                | view_users       |
| GET    | /admin/users/:userId                         | Detalhe utilizador                 | view_users       |
| PATCH  | /admin/users/:userId                         | Atualizar utilizador               | requireAdmin     |
| POST   | /admin/users/:userId/ban                     | Bloquear                           | ban_user         |
| POST   | /admin/users/ban-bulk                        | Bloquear em massa                  | ban_user         |
| POST   | /admin/users/:userId/unban                   | Desbloquear                        | unban_user       |
| DELETE | /admin/users/:userId                         | Eliminar conta                     | requireMaster    |
| DELETE | /admin/users/:userId/profile-photo           | Remover foto perfil                | moderate_content |
| DELETE | /admin/users/:userId/vitrine-photos/:photoId | Remover foto vitrine               | moderate_content |

### Professionals

| Método | Path                                                 | Descrição               | Permission      |
| ------ | ---------------------------------------------------- | ----------------------- | --------------- |
| PATCH  | /admin/professionals/:professionalId/subscription    | Alterar plano/expiração | manage_billing  |
| PATCH  | /admin/profissionais/:profissionalId/estrelas        | Alterar classificação   | requireMaster   |
| POST   | /admin/professionals/:professionalId/force-sponsor   | Forçar patrocínio       | force_sponsor   |
| POST   | /admin/professionals/:professionalId/override-rating | Override avaliação      | override_rating |

### Avaliações

| Método | Path                                   | Descrição | Permission       |
| ------ | -------------------------------------- | --------- | ---------------- |
| GET    | /admin/avaliacoes                      | Listar    | view_ratings     |
| PATCH  | /admin/avaliacoes/:avaliacaoId/suspend | Suspender | moderate_content |
| PATCH  | /admin/avaliacoes/:avaliacaoId/restore | Restaurar | moderate_content |
| DELETE | /admin/avaliacoes/:avaliacaoId         | Eliminar  | requireAdmin     |

### Demandas

| Método | Path                               | Descrição | Permission    |
| ------ | ---------------------------------- | --------- | ------------- |
| GET    | /admin/demandas                    | Listar    | view_demands  |
| PATCH  | /admin/demandas/:demandaId/fechar  | Fechar    | requireAdmin  |
| PATCH  | /admin/demandas/:demandaId/reabrir | Reabrir   | requireAdmin  |
| DELETE | /admin/demandas/:demandaId         | Eliminar  | requireMaster |

### Relatórios / Feedback

| Método | Path                                | Descrição                              | Permission     |
| ------ | ----------------------------------- | -------------------------------------- | -------------- |
| GET    | /admin/relatorios                   | Listar denúncias/sugestões/reclamações | view_reports   |
| GET    | /admin/feedback/summary             | Resumo feedback                        | view_reports   |
| POST   | /admin/relatorios/:tipo/:id/respond | Responder ao autor (email)             | manage_reports |
| PATCH  | /admin/relatorios/:tipo/:id/status  | Atualizar estado                       | requireAdmin   |
| DELETE | /admin/relatorios/:tipo/:id         | Eliminar                               | requireMaster  |

### Métricas / Stats

| Método | Path                                 | Descrição                      | Permission      |
| ------ | ------------------------------------ | ------------------------------ | --------------- |
| GET    | /admin/metrics/overview              | Overview geral                 | view_dashboards |
| GET    | /admin/stats/accounts-comparison     | Comparativo contas             | view_dashboards |
| GET    | /admin/stats/top-professions         | Profissões mais buscadas       | view_analytics  |
| GET    | /admin/stats/top-rated-professionals | Profissionais melhor avaliados | view_analytics  |
| GET    | /admin/stats/users-by-city           | Utilizadores por cidade        | view_analytics  |
| GET    | /admin/stats/demand-by-region        | Demanda por região             | view_analytics  |
| GET    | /admin/stats/plans                   | Stats planos                   | view_analytics  |
| GET    | /admin/stats/financial               | Relatório financeiro           | view_financial  |

### Banners

| Método | Path                     | Descrição | Permission      |
| ------ | ------------------------ | --------- | --------------- |
| GET    | /admin/banners           | Listar    | view_dashboards |
| POST   | /admin/banners           | Criar     | requireAdmin    |
| PATCH  | /admin/banners/:bannerId | Atualizar | requireAdmin    |
| DELETE | /admin/banners/:bannerId | Eliminar  | requireAdmin    |

### Assinaturas

| Método | Path                                           | Descrição               | Permission         |
| ------ | ---------------------------------------------- | ----------------------- | ------------------ |
| GET    | /admin/assinaturas                             | Listar                  | view_subscriptions |
| PATCH  | /admin/assinaturas/:assinaturaId/cancelar      | Cancelar                | requireAdmin       |
| PATCH  | /admin/assinaturas/:assinaturaId/modificar     | Modificar               | requireAdmin       |
| POST   | /admin/assinaturas/:assinaturaId/inadimplencia | Processar inadimplência | requireAdmin       |

### Audit Logs

| Método | Path              | Descrição   | Permission      |
| ------ | ----------------- | ----------- | --------------- |
| GET    | /admin/audit-logs | Listar logs | view_audit_logs |

---

## Códigos de resposta

- 200: sucesso
- 201: criado
- 400: dados inválidos
- 401: não autenticado
- 403: acesso negado (role/permissão insuficiente)
- 404: não encontrado
- 429: rate limit (login)
- 500: erro interno

## Erro padrão

```json
{ "error": "Mensagem", "message": "Opcional" }
```

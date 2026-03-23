# Data Model: Dashboard Admin

**Feature**: 001-scalable-admin-dashboard | **Date**: 2026-03-22

O dashboard não persiste dados; consome APIs do backend. Este documento descreve as entidades e formas de dados que o dashboard recebe e manipula.

---

## Entidades principais

### Administrador (User com role privilegiado)

| Campo        | Tipo          | Notas                                               |
| ------------ | ------------- | --------------------------------------------------- |
| id           | string (UUID) | Identificador                                       |
| nomeCompleto | string        |                                                     |
| cpf          | string        | 11 ou 14 dígitos                                    |
| email        | string        |                                                     |
| role         | string        | master, admin, moderator, finance, content, analyst |
| tokenVersion | number        | Para invalidação de sessões                         |

---

### Conta (User / Empresa)

| Campo        | Tipo         | Notas                          |
| ------------ | ------------ | ------------------------------ |
| id           | string       |                                |
| tipoUsuario  | string       | profissional, empresa, cliente |
| nomeCompleto | string       |                                |
| cpf          | string       |                                |
| email        | string       |                                |
| status       | string       | ativo, bloqueado, desativado   |
| createdAt    | string (ISO) |                                |

---

### Profissional (extensão de Conta)

| Campo              | Tipo           | Notas                              |
| ------------------ | -------------- | ---------------------------------- |
| planoInfo          | object         | tipoPlano, nivelPatrocinio, status |
| avaliacaoMedia     | string         |                                    |
| totalAvaliacoes    | string         |                                    |
| dataExpiracaoPlano | string \| null | ou "nunca"                         |

---

### Avaliação

| Campo          | Tipo   | Notas                     |
| -------------- | ------ | ------------------------- |
| id             | string |                           |
| profissionalId | string |                           |
| autorId        | string |                           |
| nota           | number |                           |
| comentario     | string |                           |
| status         | string | ativa, suspensa, removida |
| createdAt      | string |                           |

---

### Submissão de feedback (denúncia, sugestão, reclamação)

| Campo      | Tipo           | Notas                          |
| ---------- | -------------- | ------------------------------ |
| id         | string         |                                |
| tipo       | string         | denuncia, sugestao, reclamacao |
| autorId    | string         |                                |
| autorEmail | string \| null | Para resposta                  |
| conteudo   | string         |                                |
| estado     | string         | pendente, respondido, etc.     |
| resposta   | string \| null | Resposta enviada ao autor      |

---

### Banner

| Campo          | Tipo           | Notas                          |
| -------------- | -------------- | ------------------------------ |
| id             | string         |                                |
| titulo         | string         |                                |
| conteudo       | string         |                                |
| destinatarios  | string[]       | IDs de utilizadores ou "todos" |
| vigenciaInicio | string         |                                |
| vigenciaFim    | string \| null |                                |
| ativo          | boolean        |                                |

---

### Métricas / Stats (respostas agregadas)

- **Overview**: contagens gerais (users, profissionais, avaliações)
- **Accounts comparison**: comparativo por tipo de conta
- **Top professions**: ranking profissões mais buscadas
- **Top rated professionals**: ranking profissionais melhor avaliados
- **Users by city**: agregação por cidade
- **Demand by region**: demanda por região
- **Financial report**: totais por plano/profissional
- **Plan stats**: distribuição por tipo de plano

---

## Estados e transições

### Avaliação

- ativa → suspensa (suspend)
- ativa → removida (delete)
- suspensa → ativa (restore)

### Conta

- ativa → bloqueada (ban)
- bloqueada → ativa (unban)
- ativa → desativada (remove/soft delete)

### Manutenção

- off → on (enable maintenance)
- on → off (disable maintenance)

---

## Validação (Zod)

Formulários no dashboard devem validar com Zod antes de enviar ao backend:

- Login: cpf (11|14 dígitos), senha (min 1)
- Alteração de senha: senhaAtual, senhaNova, confirmSenha
- Criar conta: campos obrigatórios por tipo (profissional, empresa, cliente)
- Responder feedback: email do autor, texto da resposta
- Banner: titulo, conteudo, destinatarios, vigência

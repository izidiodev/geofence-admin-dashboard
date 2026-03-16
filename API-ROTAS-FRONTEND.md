# Documentação das Rotas da API — Frontend

**Base URL:** `/api`

Todas as requisições devem usar o prefixo `/api`. Exemplo: `GET /api/users`.

---

## Autenticação (Header JWT)

Rotas marcadas como **🔒 Protegida** exigem o header:

```
Authorization: Bearer <token>
```

O token é obtido no login (`POST /api/auth/login`). Em caso de token ausente, inválido ou expirado, a API retorna **401 Unauthorized**.

---

## Padrão de Resposta da API

### Sucesso (200/201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Mensagem opcional"
}
```

### Erro genérico (4xx/5xx)
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

### Erro de validação (400)
```json
{
  "success": false,
  "errors": [
    "Campo X é obrigatório",
    "Email inválido"
  ]
}
```

---

# 1. Auth

## `POST /api/auth/login`

**Pública** — Não requer token.

Realiza login e retorna o usuário e o token JWT.

### Body (JSON)
| Campo     | Tipo   | Obrigatório | Regras                                      |
|-----------|--------|-------------|---------------------------------------------|
| `email`   | string | Sim         | Formato e-mail válido, máx. 255 caracteres  |
| `password`| string | Sim         | Mín. 6, máx. 255 caracteres                 |

### Exemplo de requisição
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

### Resposta 200
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "Nome do Usuário",
      "email": "usuario@exemplo.com",
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "is_deleted": false
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

### Erros possíveis
- **400** — Validação: `errors` array com mensagens.
- **401** — Credenciais inválidas: `error: "Invalid credentials"`.

---

# 2. Users

Todas as rotas de users são **🔒 Protegidas**.

## `GET /api/users`

Lista usuários com paginação e filtros.

### Query params
| Parametro    | Tipo   | Obrigatório | Descrição                                      |
|-------------|--------|-------------|------------------------------------------------|
| `page`      | number | Não         | Página (default: 1)                            |
| `limit`     | number | Não         | Itens por página (default: 10, máx: 100)      |
| `search`    | string | Não         | Busca por nome/email                           |
| `is_deleted`| boolean| Não         | `true` ou `false` — filtrar por deletados      |

### Resposta 200
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Nome",
        "email": "email@exemplo.com",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "is_deleted": false
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

---

## `GET /api/users/:id`

Retorna um usuário pelo ID (UUID).

### Parâmetros de URL
| Parametro | Tipo   | Descrição   |
|-----------|--------|-------------|
| `id`      | string | UUID do usuário |

### Resposta 200
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nome",
    "email": "email@exemplo.com",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "is_deleted": false
  }
}
```

### Erros
- **400** — ID inválido (não é UUID).
- **404** — Usuário não encontrado.

---

## `POST /api/users`

Cria um novo usuário.

### Body (JSON)
| Campo      | Tipo   | Obrigatório | Regras                                      |
|------------|--------|-------------|---------------------------------------------|
| `name`     | string | Sim         | Máx. 255 caracteres                         |
| `email`    | string | Sim         | Formato e-mail válido, máx. 255             |
| `password` | string | Sim         | Mín. 6, máx. 255 caracteres                 |

### Resposta 201
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nome",
    "email": "email@exemplo.com",
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "is_deleted": false
  },
  "message": "User created successfully"
}
```

### Erros
- **400** — Validação: `errors` array.
- **409** — E-mail já em uso (se aplicável).

---

## `PUT /api/users/:id`

Atualiza um usuário. Todos os campos do body são opcionais (envie apenas o que deseja alterar).

### Body (JSON)
| Campo      | Tipo   | Obrigatório | Regras                                      |
|------------|--------|-------------|---------------------------------------------|
| `name`     | string | Não         | Não vazio, máx. 255                         |
| `email`    | string | Não         | E-mail válido, máx. 255                     |
| `password` | string | Não         | Mín. 6, máx. 255 caracteres                 |

### Resposta 200
```json
{
  "success": true,
  "data": { ... },
  "message": "User updated successfully"
}
```

### Erros
- **400** — ID inválido ou validação (`errors`).
- **404** — Usuário não encontrado.

---

## `DELETE /api/users/:id`

Soft delete do usuário (marca como deletado).

### Resposta 200
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### Erros
- **400** — ID inválido.
- **404** — Usuário não encontrado.

---

# 3. Types

Todas as rotas de types são **🔒 Protegidas**.

## `GET /api/types`

Lista tipos com paginação.

### Query params
| Parametro | Tipo   | Obrigatório | Descrição                           |
|-----------|--------|-------------|-------------------------------------|
| `page`    | number | Não         | Página (default: 1)                 |
| `limit`   | number | Não         | Itens por página (default: 10, máx: 100) |

### Resposta 200
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Nome do tipo",
        "description": "Descrição ou null",
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

---

# 4. Campaigns

## `GET /api/campaigns/available`

**Pública** — Não requer token.  
Lista campanhas disponíveis (para o app), com paginação e filtros.

### Query params
| Parametro    | Tipo    | Obrigatório | Descrição                           |
|-------------|---------|-------------|-------------------------------------|
| `page`      | number  | Não         | Página (default: 1)                 |
| `limit`     | number  | Não         | Itens por página (default: 10, máx: 100) |
| `search`    | string  | Não         | Busca por nome                      |
| `is_deleted`| boolean | Não         | `true` ou `false`                   |
| `enabled`   | boolean | Não         | `true` ou `false`                   |

### Resposta 200
Mesmo formato de lista paginada de campanhas (ver abaixo).

---

## Rotas protegidas de Campaigns (🔒)

As rotas abaixo exigem `Authorization: Bearer <token>`.

### `GET /api/campaigns`

Lista todas as campanhas (admin), com paginação e filtros.

**Query params:** `page`, `limit`, `search`, `is_deleted`, `enabled` (mesmos de `/available`).

### Resposta 200
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Nome da campanha",
        "description": "Descrição ou null",
        "exp_date": "2025-12-31T23:59:59.000Z",
        "city_uf": "Cidade - UF ou null",
        "type_id": "uuid",
        "enabled": true,
        "lat": "latitude",
        "long": "longitude",
        "radius": 5000,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "is_deleted": false
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

### `GET /api/campaigns/:id`

Retorna uma campanha pelo ID (UUID).

**Resposta 200:** `data` é um objeto de campanha (mesmo formato de um item em `items` acima).

**Erros:** 400 (ID inválido), 404 (não encontrada).

---

### `POST /api/campaigns`

Cria uma nova campanha.

#### Body (JSON)
| Campo        | Tipo    | Obrigatório | Regras                                                |
|--------------|---------|-------------|-------------------------------------------------------|
| `name`       | string  | Sim         | Máx. 255 caracteres                                  |
| `description`| string  | Não         | Máx. 500 caracteres                                  |
| `exp_date`   | string  | Não         | Data válida (ISO ou parseável por `Date`)             |
| `city_uf`    | string  | Não         | Máx. 255 caracteres                                  |
| `type_id`    | string  | Sim         | UUID de um type existente                             |
| `enabled`    | boolean | Não         | Default pode ser true                                 |
| `lat`        | number  | Sim         | Latitude                                              |
| `long`       | number  | Sim         | Longitude                                             |
| `radius`     | number  | Sim         | Inteiro entre 1 e 100000 (metros)                    |

#### Exemplo
```json
{
  "name": "Campanha Centro",
  "description": "Geofence no centro da cidade",
  "exp_date": "2025-12-31",
  "city_uf": "São Paulo - SP",
  "type_id": "uuid-do-type",
  "enabled": true,
  "lat": -23.5505,
  "long": -46.6333,
  "radius": 5000
}
```

**Resposta 201:** `data` = campanha criada. `message`: "Campaign created successfully".

**Erros:** 400 (validação em `errors`).

---

### `PUT /api/campaigns/:id`

Atualiza uma campanha. Todos os campos do body são opcionais.

#### Body (JSON)
| Campo        | Tipo    | Regras (quando enviado)                          |
|--------------|---------|--------------------------------------------------|
| `name`       | string  | Não vazio, máx. 255                              |
| `description`| string  | Máx. 500                                         |
| `exp_date`   | string  | Data válida                                      |
| `city_uf`    | string  | Máx. 255                                         |
| `type_id`    | string  | UUID válido                                      |
| `enabled`    | boolean | -                                                |
| `lat`        | number  | Número                                           |
| `long`       | number  | Número                                           |
| `radius`     | number  | Inteiro entre 1 e 100000                        |

**Resposta 200:** `data` = campanha atualizada. `message`: "Campaign updated successfully".

**Erros:** 400 (ID ou validação), 404 (não encontrada).

---

### `DELETE /api/campaigns/:id`

Soft delete da campanha.

**Resposta 200:** `message`: "Campaign deleted successfully".

**Erros:** 400 (ID inválido), 404 (não encontrada).

---

# Resumo das rotas

| Método | Rota                          | Auth   | Descrição                |
|--------|--------------------------------|--------|---------------------------|
| POST   | `/api/auth/login`              | Não    | Login                     |
| GET    | `/api/users`                  | Sim    | Listar usuários           |
| GET    | `/api/users/:id`              | Sim    | Buscar usuário por ID     |
| POST   | `/api/users`                  | Sim    | Criar usuário             |
| PUT    | `/api/users/:id`              | Sim    | Atualizar usuário         |
| DELETE | `/api/users/:id`              | Sim    | Deletar usuário           |
| GET    | `/api/types`                  | Sim    | Listar tipos              |
| GET    | `/api/campaigns/available`    | Não    | Campanhas disponíveis (app) |
| GET    | `/api/campaigns`              | Sim    | Listar campanhas (admin)  |
| GET    | `/api/campaigns/:id`          | Sim    | Buscar campanha por ID    |
| POST   | `/api/campaigns`              | Sim    | Criar campanha            |
| PUT    | `/api/campaigns/:id`          | Sim    | Atualizar campanha        |
| DELETE | `/api/campaigns/:id`          | Sim    | Deletar campanha          |

---

# Observações para o frontend

1. **Content-Type:** Enviar `Content-Type: application/json` em POST/PUT com body JSON.
2. **IDs:** Todos os IDs de recurso são UUID v4. Validar formato antes de enviar.
3. **Datas:** A API retorna datas em ISO 8601 (ex.: `2025-01-01T00:00:00.000Z`). Para `exp_date` no create/update, enviar string de data válida.
4. **Paginação:** `page` e `limit` são números; em query string use `?page=1&limit=10`.
5. **Booleans em query:** Use `true` ou `false` como string, ex.: `?enabled=true&is_deleted=false`.
6. **Tratamento de erros:** Sempre verificar `success` e, em caso de `false`, exibir `error` ou `errors` conforme o caso.

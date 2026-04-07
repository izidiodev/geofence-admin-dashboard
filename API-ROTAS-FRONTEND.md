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

O cadastro de campanhas é em **duas etapas**: primeiro cria-se a campanha (cabeçalho); depois adicionam-se os itens de geofence (enter, dwell, exit) via `POST /api/campaigns/:id/items`.

**Modelo:** A tabela `campaigns` guarda apenas dados da campanha (`name`, `exp_date`, `city_uf`, `enabled`). A tabela `item_campaign` guarda os pontos de entrada, permanência e saída — cada item tem `title`, `description`, `type_id` (UUID do tipo enter/dwell/exit), `lat`, `long`, `radius` e pertence a uma campanha.

---

## `GET /api/campaigns/available`

**Pública** — Não requer token.  
Lista campanhas disponíveis (para o app), com paginação e filtros.

### Query params
| Parametro    | Tipo    | Obrigatório | Descrição                                                |
|-------------|---------|-------------|----------------------------------------------------------|
| `page`      | number  | Não         | Página (default: 1)                                      |
| `limit`     | number  | Não         | Itens por página (default: 10, máx: 100)                |
| `search`    | string  | Não         | **Nome completo da cidade** (usa o trecho antes de `/` em `city_uf`). Normalização: minúsculas, sem acento, espaços colapsados — `sao paulo` casa com `São Paulo`, `São Paulo/SP`; **não** casa com `São Bernardo`; **não** aceita substring (`sao` sozinho não bate). Sem `search`, lista todas as cidades (paginado). |
| `is_deleted`| boolean | Não         | `true` ou `false`                                      |
| `enabled`   | boolean | Não         | `true` ou `false`                                      |

> O parâmetro `search_in` **não se aplica** a esta rota: o filtro é sempre por cidade (`city_uf`).

### Contador `delivery_count` (métrica de exposição)

A cada chamada bem-sucedida a este endpoint, **para cada campanha listada na página**, o backend incrementa `delivery_count` no banco (+1 por campanha retornada). Assim o painel admin pode medir **quantas vezes** cada campanha foi “entregue” ao app.

- O JSON de cada item já traz `delivery_count` **após** o incremento desta resposta.
- **Não** incrementa em `GET /api/campaigns` nem em `GET /api/campaigns/:id` (apenas leitura do total acumulado).

### Resposta 200
Lista paginada: cada item inclui dados da campanha, **`delivery_count`** e as **geofences** `enter`, `dwell` e `exit` (mesmo formato de `GET /api/campaigns/:id`). Cada um pode ser `null` se ainda não cadastrado no admin.

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Nome da campanha",
        "exp_date": "2025-12-31T23:59:59.000Z",
        "city_uf": "São Paulo/SP",
        "enabled": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "is_deleted": false,
        "delivery_count": 1523,
        "enter": {
          "id": "uuid",
          "title": "Entrada",
          "description": null,
          "type_id": "uuid-tipo-enter",
          "lat": "-23.55",
          "long": "-46.63",
          "radius": 500,
          "created_at": "2025-01-01T00:00:00.000Z",
          "updated_at": "2025-01-01T00:00:00.000Z"
        },
        "dwell": { "...": "..." },
        "exit": { "...": "..." }
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

> **Mudança de contrato (produção):** antes cada item era só o resumo; agora inclui `enter`, `dwell` e `exit`. Clientes que ignoram chaves desconhecidas seguem ok; quem valida schema estrito precisa atualizar.

---

## Rotas protegidas de Campaigns (🔒)

As rotas abaixo exigem `Authorization: Bearer <token>`.

### `GET /api/campaigns`

Lista todas as campanhas (admin), com paginação e filtros. Retorna apenas **resumo** (cabeçalho da campanha, sem os itens enter/dwell/exit).

**Query params:** `page`, `limit`, `search`, `search_in` (`name` | `city_uf` | `both`), `is_deleted`, `enabled`.

### Resposta 200
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Nome da campanha",
        "exp_date": "2025-12-31T23:59:59.000Z",
        "city_uf": "Cidade - UF ou null",
        "enabled": true,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z",
        "is_deleted": false,
        "delivery_count": 1523
      }
    ],
    "total": 20,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

`delivery_count`: total acumulado de vezes que a campanha foi retornada em **`GET /api/campaigns/available`** (não incrementa nesta rota).

---

### `GET /api/campaigns/delivery-stats`

**🔒 Protegida.** Retorna as **top 10** campanhas mais chamadas (maior `delivery_count` primeiro), com payload mínimo para gráfico na home.

**Query params:** `limit` (opcional) — número entre 1 e 10 (default: 10).

**Resposta 200**
```json
{
  "success": true,
  "data": {
    "items": [
      { "id": "uuid-1", "name": "Campanha Verão", "delivery_count": 1523 },
      { "id": "uuid-2", "name": "Campanha Inverno", "delivery_count": 890 }
    ]
  }
}
```

Ordenação: **maior `delivery_count` primeiro**. Apenas campanhas não deletadas (`is_deleted = false`).

---

### `GET /api/campaigns/:id`

Retorna uma campanha pelo ID (UUID) **com** os itens de geofence (enter, dwell, exit). Cada um pode ser `null` se ainda não tiver sido cadastrado.

### Resposta 200
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nome da campanha",
    "exp_date": "2025-12-31T23:59:59.000Z",
    "city_uf": "Cidade - UF ou null",
    "enabled": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "is_deleted": false,
    "delivery_count": 1523,
    "enter": {
      "id": "uuid",
      "title": "Entrada",
      "description": null,
      "type_id": "uuid-enter",
      "lat": "-23.55",
      "long": "-46.63",
      "radius": 500,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z"
    },
    "dwell": { ... },
    "exit": null
  }
}
```

**Erros:** 400 (ID inválido), 404 (campanha não encontrada).

---

### `POST /api/campaigns`

Cria uma nova campanha **apenas com dados do cabeçalho**. Os itens (enter, dwell, exit) são cadastrados depois via `POST /api/campaigns/:id/items`.

#### Body (JSON)
| Campo     | Tipo    | Obrigatório | Regras                                      |
|-----------|---------|-------------|---------------------------------------------|
| `name`    | string  | Sim         | Não vazio, máx. 255 caracteres             |
| `exp_date`| string  | Sim         | Data válida (ISO ou parseável por `Date`)  |
| `city_uf` | string  | Sim         | Não vazio, máx. 255 caracteres            |
| `enabled` | boolean | Não         | Default: true                              |

#### Exemplo
```json
{
  "name": "Campanha Verão",
  "exp_date": "2026-12-31",
  "city_uf": "São Paulo/SP",
  "enabled": true
}
```

#### Resposta 201
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Campanha Verão",
    "exp_date": "2026-12-31T23:59:59.000Z",
    "city_uf": "São Paulo/SP",
    "enabled": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "is_deleted": false,
    "delivery_count": 0
  },
  "message": "Campanha criada com sucesso"
}
```

**Erros:** 400 (validação em `errors`).

---

### `POST /api/campaigns/:id/items`

Adiciona **um** item de geofence à campanha (entrada, permanência ou saída). O `type_id` deve ser o UUID de um tipo **enter**, **dwell** ou **exit** (ex.: do seed). Só pode existir um item de cada tipo por campanha.

#### Parâmetros de URL
| Parametro | Tipo   | Descrição      |
|-----------|--------|----------------|
| `id`      | string | UUID da campanha |

#### Body (JSON)
| Campo       | Tipo    | Obrigatório | Regras                                                |
|-------------|---------|-------------|-------------------------------------------------------|
| `title`     | string  | Sim         | Não vazio, máx. 255 caracteres                        |
| `description`| string | Não         | Máx. 500 caracteres                                  |
| `type_id`   | string  | Sim         | UUID do tipo **enter**, **dwell** ou **exit**         |
| `lat`       | number  | Sim         | Latitude (-90 a 90)                                  |
| `long`      | number  | Sim         | Longitude (-180 a 180)                               |
| `radius`    | number  | Sim         | Inteiro entre 1 e 100000 (metros)                     |

#### Exemplo
```json
{
  "title": "Entrada",
  "description": "Ponto de entrada da geofence",
  "type_id": "uuid-do-tipo-enter",
  "lat": -23.5505,
  "long": -46.6333,
  "radius": 500
}
```

#### Resposta 201
```json
{
  "success": true,
  "data": {
    "id": "uuid-item",
    "title": "Entrada",
    "description": "Ponto de entrada da geofence",
    "type_id": "uuid-do-tipo-enter",
    "lat": "-23.5505",
    "long": "-46.6333",
    "radius": 500,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  },
  "message": "Item da campanha criado com sucesso"
}
```

#### Erros
- **400** — ID da campanha inválido ou validação do body (`errors`); ou `type_id` não é enter/dwell/exit.
- **404** — Campanha não encontrada.
- **409** — Já existe item deste tipo para esta campanha (ex.: segundo "enter" na mesma campanha).

---

### `PUT /api/campaigns/:id`

Atualiza a campanha e/ou os **itens já existentes** (enter, dwell, exit). Todos os campos do body são opcionais. Só altera itens que já foram cadastrados (não cria novos; para criar use `POST /api/campaigns/:id/items`).

#### Body (JSON)
| Campo     | Tipo    | Regras (quando enviado)                    |
|-----------|---------|--------------------------------------------|
| `name`    | string  | Não vazio, máx. 255                        |
| `exp_date`| string  | Data válida                                |
| `city_uf` | string  | Máx. 255                                   |
| `enabled` | boolean | -                                          |
| `enter`   | object  | Parcial: `title`, `description`, `type_id`, `lat`, `long`, `radius` |
| `dwell`   | object  | Idem                                       |
| `exit`    | object  | Idem                                       |

#### Resposta 200
`data` = campanha atualizada com `enter`, `dwell` e `exit` (objetos ou `null`).

**Erros:** 400 (ID ou validação), 404 (campanha não encontrada).

---

### `DELETE /api/campaigns/:id`

Soft delete da campanha (itens são removidos em cascata pelo banco).

**Resposta 200:** `message`: "Campanha excluída com sucesso".

**Erros:** 400 (ID inválido), 404 (não encontrada).

---

# Resumo das rotas

| Método | Rota                             | Auth   | Descrição                              |
|--------|-----------------------------------|--------|----------------------------------------|
| POST   | `/api/auth/login`                 | Não    | Login                                  |
| GET    | `/api/users`                     | Sim    | Listar usuários                        |
| GET    | `/api/users/:id`                 | Sim    | Buscar usuário por ID                  |
| POST   | `/api/users`                     | Sim    | Criar usuário                          |
| PUT    | `/api/users/:id`                 | Sim    | Atualizar usuário                      |
| DELETE | `/api/users/:id`                 | Sim    | Deletar usuário                        |
| GET    | `/api/types`                     | Sim    | Listar tipos                           |
| GET    | `/api/campaigns/available`       | Não    | Campanhas disponíveis (app)           |
| GET    | `/api/campaigns`                 | Sim    | Listar campanhas (admin, resumo)      |
| GET    | `/api/campaigns/delivery-stats`  | Sim    | Top 10 por delivery_count (gráfico)   |
| GET    | `/api/campaigns/:id`             | Sim    | Campanha por ID + itens enter/dwell/exit |
| POST   | `/api/campaigns`                 | Sim    | Criar campanha (só cabeçalho)         |
| POST   | `/api/campaigns/:id/items`       | Sim    | Adicionar item (enter/dwell/exit)     |
| PUT    | `/api/campaigns/:id`             | Sim    | Atualizar campanha e/ou itens         |
| DELETE | `/api/campaigns/:id`             | Sim    | Deletar campanha (soft delete)        |

---

# Observações para o frontend

1. **Content-Type:** Enviar `Content-Type: application/json` em POST/PUT com body JSON.
2. **IDs:** Todos os IDs de recurso são UUID v4. Validar formato antes de enviar.
3. **Datas:** A API retorna datas em ISO 8601 (ex.: `2025-01-01T00:00:00.000Z`). Para `exp_date` no create/update, enviar string de data válida.
4. **Paginação:** `page` e `limit` são números; em query string use `?page=1&limit=10`.
5. **Booleans em query:** Use `true` ou `false` como string, ex.: `?enabled=true&is_deleted=false`.
6. **Tratamento de erros:** Sempre verificar `success` e, em caso de `false`, exibir `error` ou `errors` conforme o caso.
7. **`delivery_count`:** use o valor em **GET /api/campaigns** ou **GET /api/campaigns/:id** para o painel de métricas. Cada resposta de **GET /api/campaigns/available** incrementa +1 por campanha exibida na lista.

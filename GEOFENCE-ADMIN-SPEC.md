# Especificação e boas práticas — frontend geofence-admin

Documento para criar um novo frontend **geofence-admin**, alinhado às boas práticas e padrões do repositório **premium-sistema**. Use este documento em outra instância do Cursor (ou com outra IA) para gerar o projeto. **Antes de codar, responda às perguntas da seção "Perguntas antes de criar o projeto".**

---

## 1. Escopo do geofence-admin

O frontend **geofence-admin** deve ter as seguintes funcionalidades:

| Funcionalidade | Descrição |
|----------------|-----------|
| **Login** | Tela de login (email/senha); autenticação via API; persistência de token e usuário (localStorage); redirecionamento após sucesso; tratamento de 401 (sessão expirada). |
| **Criação de campanhas** | Formulário para criar campanha; envio via API; feedback de sucesso/erro; recarregar lista após sucesso. |
| **Visualização de campanhas** | Listagem de campanhas com **filtros** conforme documentação da API fornecida; paginação (page, limit); tabela com colunas relevantes. |
| **Atualização de campanhas** | Edição de campanha existente (modal ou tela); mesmo contrato de formulário da criação quando fizer sentido; feedback e recarregar lista. |
| **Soft delete de campanhas** | Exclusão lógica (campanha marcada como excluída, não removida do banco); confirmação antes de excluir; recarregar lista após sucesso. |

**Observação:** Os filtros da listagem devem seguir **exatamente** a documentação da API de campanhas (query params, nomes dos campos, valores permitidos). Inclua a documentação da API ou a URL da doc no projeto para referência.

---

## 2. Perguntas antes de criar o projeto

Responda (ou obtenha do time/back-end) antes de implementar:

1. **API de campanhas**
   - Qual a **URL base** da API (ex.: `https://api.exemplo.com` ou path base como `/api/v1`)?
   - A API usa o **mesmo contrato** do premium-sistema (`ApiResponse<T>` com `success`, `data`, `error` ou `errors`)? Se não, qual o formato de resposta de sucesso e erro?
   - Endpoints exatos: login, listagem de campanhas (com query params de filtro), criar, atualizar, soft delete. Métodos HTTP e paths.
   - A listagem é **paginada**? Quais parâmetros (ex.: `page`, `limit`)? O que a API retorna (ex.: `items`, `total`, `totalPages`)?
   - Quais **filtros** a API aceita na listagem? (ex.: status, nome, dataInicio, dataFim, tipo). Nomes dos query params e valores permitidos.
   - O soft delete é um endpoint específico (ex.: `PATCH /campanhas/:id` com `{ deleted: true }`) ou `DELETE /campanhas/:id` que apenas marca como excluído?

2. **Autenticação**
   - O login retorna **token** (JWT ou outro) e **dados do usuário**? Onde enviar o token (header `Authorization: Bearer <token>`)?
   - Em resposta **401**, a API retorna alguma mensagem padrão? O frontend deve redirecionar para login e limpar token (como no premium-sistema)?

3. **Ambiente**
   - Nome do produto para `<title>` e referências (ex.: "Geofence Admin").
   - Variáveis de ambiente necessárias (ex.: `VITE_API_URL`). Há outras (ex.: `VITE_APP_NAME`)?

4. **Design e tema**
   - Reutilizar **Chakra UI** e estrutura de tema (tokens, semanticTokens, modo claro/escuro) como no premium-sistema? Ou há um design system/figma diferente?
   - Idem de **idioma**: manter tudo em português (pt-BR)?

5. **Escopo mínimo na primeira entrega**
   - Confirma que a primeira versão é: login + listagem com filtros + criar + editar + soft delete (sem outras telas como perfil, configurações, etc.)?

Com as respostas, ajuste este documento (ou um anexo) com os endpoints e DTOs reais antes de passar para a geração do código.

---

## 3. Stack tecnológica (recomendada, igual ao premium-sistema)

| Tecnologia | Uso |
|------------|-----|
| **React** (^19.x) | UI |
| **Vite** (^7.x) | Build e dev server |
| **TypeScript** (^5.x) | Tipagem |
| **react-router-dom** (^7.x) | Rotas |
| **Chakra UI** (@chakra-ui/react ^3.x) | Componentes e tema |
| **axios** | HTTP (uma instância via apiClient) |
| **react-hook-form** | Formulários |
| **next-themes** (opcional) | Tema claro/escuro |

- **Estado:** sem Redux/Zustand; uso de `useState`/`useCallback`/`useEffect` nas telas; auth baseado em token no localStorage.
- **Estilização:** Chakra UI + tema (tokens/semanticTokens); sem CSS Modules/Tailwind no padrão base.

---

## 4. Estrutura de pastas (src/)

Replicar a estrutura do premium-sistema:

```
src/
├── modules/              # Um subdiretório por domínio
│   ├── account/          # Login (screens, components, business)
│   ├── campaigns/        # Campanhas (listagem, criar, editar, soft delete)
│   └── core/             # apiClient, navigation, localStorage, ErrorBoundary
├── Providers/            # Ex.: SnackBarProvider (toaster)
├── ds/                   # Design system (FormField, ConfirmDialog, ícones, etc.)
├── types/                # api.ts, auth.ts, campaign.ts (e outros globais)
├── utils/                # showApiResultSnackbar, formatadores
├── theme/                # Tema Chakra (tokens, semanticTokens)
├── routes/               # Paths, AppRoutes, ProtectedRoute, PublicOnlyRoute, UseAuth
├── layouts/              # AuthenticatedLayout (Sidebar, PageHeader)
├── vite-env.d.ts         # Tipagem de import.meta.env
├── index.css
├── App.tsx
└── main.tsx
```

- **modules:** cada módulo com `business/` (controller, repository, main) e `mobile/` (screens, components).
- **Nomenclatura de pastas:** PascalCase em geral; **exceção** em módulos de cadastro: em `business/` e `mobile/screens/` usar **camelCase** para subpastas (ex.: `campaignController`, `campaignListScreen`). Arquivos de classe/tela em **PascalCase** (ex.: `CampaignController.ts`, `CampaignListScreen.tsx`).

---

## 5. Padrão de módulo com API (campanhas)

Seguir o padrão do módulo **clients** (cadastro CRUD):

```
modules/campaigns/
├── index.ts                    # barrel: telas + campaignController, campaignRepository
├── business/
│   ├── index.ts                # re-exporta classes e singletons de main
│   ├── main/index.ts           # baseUrl de VITE_API_URL; instancia Repository + Controller
│   ├── controller/campaignController/CampaignController.ts
│   └── repository/campaignRepository/CampaignRepository.ts
└── mobile/screens/
    ├── index.ts
    └── campaignListScreen/CampaignListScreen.tsx
```

- **Tipos:** em `src/types/campaign.ts` (Campaign, PaginatedCampaignResponse, CreateCampaignDTO, UpdateCampaignDTO, filtros alinhados à API).
- **Repository:** usar **apiClient** do core; métodos: `list(params)` (com filtros e paginação), `getById(id)`, `create(dto)`, `update(id, dto)`, `softDelete(id)` (ou o que a API definir). Retorno: `Promise<ApiResponse<T>>`.
- **Controller:** recebe repository no construtor; delega todos os métodos ao repository.
- **main:** instancia Repository e Controller; exporta `campaignController` e `campaignRepository`.
- **Tela:** uma única **CampaignListScreen** com listagem (tabela + filtros + paginação) e modais: Ver, Novo, Editar, Excluir (soft delete com ConfirmDialog). Não criar rotas separadas para formulário.

---

## 6. Contrato de API e tipos

- **Resposta padrão:** usar tipos de `src/types/api.ts` como no premium-sistema:
  - `ApiSuccess<T>`, `ApiErrorSingle`, `ApiErrorValidation`, `ApiResponse<T>`
  - Helpers: `isApiErrorSingle`, `isApiErrorValidation`
- **Listagem paginada:** tipo `PaginatedCampaignResponse` com `items`, `total`, `page`, `limit`, `totalPages`. Repository e Controller retornam `ApiResponse<PaginatedCampaignResponse>`.
- **Filtros:** definir interface de parâmetros de listagem (ex.: `CampaignListParams`) com `page`, `limit` e todos os filtros aceitos pela API; repassar do componente para o controller/repository.

Exemplo de uso na UI:

- Chamar `campaignController.list({ page, limit, status, nome, ... })`.
- Tratar resultado com `showApiResultSnackbar(result)` e, se `result.success && result.data`, usar `result.data.items`, `result.data.total`, etc.

---

## 7. Cliente HTTP (apiClient) e autenticação

- **Uma única instância** de axios em `modules/core/apiClient/apiClient.ts`:
  - `baseURL` = `import.meta.env.VITE_API_URL`
  - Interceptor de **request:** adicionar header `Authorization: Bearer <token>` (token do localStorageController).
  - Interceptor de **response:** em 401, disparar evento `SESSION_EXPIRED_EVENT`, remover token, exibir snackbar "Sessão expirada", redirecionar para rota de login.
- **Repositories:** todos usam esse **apiClient**; nunca usar `axios` direto para chamadas da API.
- **Login:** tela chama `accountController.login({ email, password })`; em sucesso, gravar token e user no localStorage e redirecionar para home; feedback com `showApiResultSnackbar(result, { successMessage: '...' })`.
- **Persistência:** acesso a localStorage **apenas** via `localStorageController` do core (`setItem`, `getItem`, `getItemParsed`, `removeItem`, `clear`).

---

## 8. Rotas e navegação

- **Paths centralizados** em `src/routes/Paths/Paths.ts` (ex.: `PATH_LOGIN`, `PATH_HOME`, `PATH_CAMPAIGNS`). Uso em AppRoutes e Sidebar.
- **AppRoutes:** rota pública apenas para login (`PublicOnlyRoute`); demais rotas protegidas (`ProtectedRoute`) dentro de `AuthenticatedLayout`. Telas carregadas com **React.lazy** e envolvidas em **Suspense** com fallback (ex.: Spinner).
- **Abstração do router:** um único adapter que importa `react-router-dom` (ex.: `reactRouterAdapter.tsx` no core); resto do app importa de `@/modules/core` (useNavigate, Navigate, Outlet, etc.).
- **Sidebar:** itens com path usando constantes de Paths.

---

## 9. Formulários e feedback de API

- **react-hook-form** com `Controller` para integrar inputs ao Chakra.
- Campos reutilizáveis no **ds** (ex.: FormField com label, id para acessibilidade).
- **Feedback de sucesso/erro:** sempre `showApiResultSnackbar(result, { successMessage?: string })` (em `@/utils/showApiResultSnackbar`). Não fazer vários `if` e chamadas diretas ao snackbar.
- Validação: regras no `Controller` (ex.: `rules={{ required: true }}`); erros de validação da API tratados pelo `showApiResultSnackbar` (ex.: `errors[]`).

---

## 10. Listagem com filtros

- Estado na tela (ou em hook): `items`, `page`, `limit`, `total`, `totalPages`, `loading`, e **parâmetros de filtro** (ex.: status, nome, datas).
- Ao mudar página, limit ou filtros: chamar `campaignController.list({ page, limit, ...filters })` e atualizar estado com `result.data`.
- UI: tabela Chakra; controles de paginação ("Mostrando X–Y de Z", select "Por página", Anterior/Próxima); **formulário de filtros** (inputs/selects) que atualizam os parâmetros e disparam nova busca (conforme documentação da API).

---

## 11. Regras gerais de código

- Código limpo (Clean Code), sem lógica duplicada; nomes claros e autoexplicativos.
- **Não usar `any`**; **não usar `let`**; tipar retorno de todas as funções.
- Não deixar código comentado morto; não escrever comentários desnecessários no código.
- Tratar erros e edge cases.
- **Imports:** usar alias `@/` (ex.: `@/types/api`, `@/modules/campaigns/business`, `@/ds`). Configurar no Vite: `@`, `@/DS`, `@/Routes`, `@modules` conforme premium-sistema.
- **Botões de ação** em modais/footers: usar `minW` adequado (ex.: 120px para Cancelar, 140px para Salvar) e `gap` no container.

---

## 12. Variáveis de ambiente e build

- **.env** (não versionado) e **.env.example** (versionado) na raiz, ex.: `VITE_API_URL=http://localhost:3001`.
- Tipagem em `src/vite-env.d.ts`: `ImportMetaEnv` com `readonly VITE_API_URL: string` (e outras `VITE_*` que existirem).
- **Vite:** usar `manualChunks` (ex.: vendor-react, vendor-chakra, vendor-forms) e `chunkSizeWarningLimit` (ex.: 600).

---

## 13. Tema e design system

- **Chakra UI** como base; tema em `src/theme/` com tokens e **semanticTokens** (ex.: `bg`, `bg.subtle`, `bg.card`, `text`, `text.muted`, `accent`, `sidebar.*`) para suportar tema claro/escuro.
- **ds:** componentes reutilizáveis (FormField, ConfirmDialog, PasswordInput, ícones, etc.) em pastas PascalCase; um único `ds/index.ts` exportando tudo.
- **index.html:** `lang="pt-BR"` e `title` com o nome do produto.

---

## 14. Checklist para implementação

- [ ] Responder às **perguntas da seção 2** e documentar endpoints e filtros da API.
- [ ] Criar projeto (Vite + React + TypeScript); configurar aliases e build como no premium-sistema.
- [ ] Implementar **core:** apiClient, localStorageController, navigation adapter, ErrorBoundary.
- [ ] Implementar **account:** login (repository, controller, LoginScreen); rotas públicas/protegidas e UseAuth.
- [ ] Implementar **types:** api.ts, auth.ts, campaign.ts (PaginatedCampaignResponse, DTOs, params de filtro).
- [ ] Implementar **campanhas:** repository (list com filtros, getById, create, update, softDelete), controller, main.
- [ ] Implementar **CampaignListScreen:** tabela, paginação, filtros (conforme API), modais Ver/Novo/Editar/Excluir (soft delete com confirmação).
- [ ] Integrar **showApiResultSnackbar** em todos os fluxos de API; SnackBarProvider no App.
- [ ] Paths, AppRoutes (lazy + Suspense), Sidebar; README com instruções e referência a este documento.

---

## 15. Referências no repositório premium-sistema

- Regras e checklist: `.cursor/rules/rules.md`
- Arquitetura: `.cursor/rules/arch.mdc`
- Módulo cadastro CRUD: `.cursor/rules/modulo-cadastro-crud.mdc`
- Contrato de API (se existir): `.cursor/rules/api-rules-doc.md` ou `api.md`
- Exemplos de código: `src/modules/clients/`, `src/modules/account/`, `src/modules/core/`, `src/types/api.ts`, `src/utils/showApiResultSnackbar.ts`

---

*Documento gerado com base no repositório premium-sistema para uso na criação do frontend geofence-admin. Atualize a seção 2 com as respostas das perguntas antes de iniciar a implementação.*

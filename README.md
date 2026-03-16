# Geofence Admin Dashboard

Frontend do painel administrativo de campanhas de geofence, conforme especificação em `GEOFENCE-ADMIN-SPEC.md` e API documentada em `API-ROTAS-FRONTEND.md`.

## Stack

- React 19, Vite 6, TypeScript 5
- react-router-dom 7
- Chakra UI 3
- axios, react-hook-form

## Setup

1. Instalar dependências:
   ```bash
   npm install
   ```

2. Configurar variáveis de ambiente:
   - Copie `.env.example` para `.env`
   - Ajuste `VITE_API_URL` para a URL base do backend (ex.: `http://localhost:3001`). As rotas da API usam o prefixo `/api`.

3. Rodar em desenvolvimento:
   ```bash
   npm run dev
   ```

4. Build para produção:
   ```bash
   npm run build
   ```

## Funcionalidades

- **Login**: autenticação (email/senha), token e usuário em localStorage, redirecionamento após sucesso; tratamento de 401 (sessão expirada).
- **Campanhas**: listagem com filtros (search, is_deleted, enabled), paginação (page, limit), criação, edição e exclusão lógica (soft delete), com confirmação.

## Estrutura

- `src/modules/account` — login (repository, controller, LoginScreen).
- `src/modules/campaigns` — CRUD de campanhas (repository, controller, CampaignListScreen com modais).
- `src/modules/core` — apiClient, localStorageController, ErrorBoundary, adapter do router.
- `src/modules/types` — listagem de tipos (para dropdown de tipo de campanha).
- `src/routes` — Paths, UseAuth, ProtectedRoute, PublicOnlyRoute, AppRoutes.
- `src/layouts` — AuthenticatedLayout com Sidebar.
- `src/ds` — FormField, PasswordInput, ConfirmDialog.
- `src/Providers` — SnackBarProvider (Chakra + Toaster).
- `src/theme` — tema Chakra (createSystem).
- `src/types` — api, auth, campaign, type.
- `src/utils` — showApiResultSnackbar, toasterRef.

## Referências

- Especificação e boas práticas: `GEOFENCE-ADMIN-SPEC.md`
- Documentação da API: `API-ROTAS-FRONTEND.md`

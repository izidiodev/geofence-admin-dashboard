import type { PaginatedResponse } from "@/types/api";

/** Campanha no list (GET /api/campaigns) — apenas cabeçalho, sem itens. delivery_count = vezes retornada em GET /campaigns/available. */
export interface CampaignHeader {
  id: string;
  name: string;
  exp_date: string | null;
  city_uf: string | null;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  /** Total de vezes que a campanha foi entregue ao app (GET /campaigns/available). */
  delivery_count?: number;
}

/** Item de geofence (enter, dwell ou exit) — retornado em GET /api/campaigns/:id. */
export interface CampaignItem {
  id: string;
  title: string;
  description: string | null;
  type_id: string;
  lat: string | number;
  long: string | number;
  radius: number;
  created_at: string;
  updated_at: string;
}

/** Campanha com itens (GET /api/campaigns/:id). enter/dwell/exit podem ser null se ainda não cadastrados. */
export interface CampaignWithItems extends CampaignHeader {
  enter: CampaignItem | null;
  dwell: CampaignItem | null;
  exit: CampaignItem | null;
}

/** Lista retorna apenas cabeçalhos. */
export type Campaign = CampaignHeader;

export type PaginatedCampaignResponse = PaginatedResponse<CampaignHeader>;

/** Item retornado por GET /api/campaigns/delivery-stats (top por delivery_count). */
export interface DeliveryStatsItem {
  id: string;
  name: string;
  delivery_count: number;
}

export interface DeliveryStatsResponse {
  items: DeliveryStatsItem[];
}

export type CampaignSearchIn = "name" | "city_uf" | "both";

export interface CampaignListParams {
  page?: number;
  limit?: number;
  search?: string;
  search_in?: CampaignSearchIn;
  is_deleted?: boolean;
  enabled?: boolean;
}

// --- DTOs alinhados à API (API-ROTAS-FRONTEND.md) ---

/** POST /api/campaigns — criar campanha (só cabeçalho). name, exp_date e city_uf obrigatórios na API. */
export interface CreateCampaignDTO {
  name: string;
  exp_date: string;
  city_uf: string;
  enabled?: boolean;
}

/** POST /api/campaigns/:id/items — adicionar um item (enter, dwell ou exit). */
export interface CreateCampaignItemDTO {
  title: string;
  description?: string;
  type_id: string;
  lat: number;
  long: number;
  radius: number;
}

/** PUT /api/campaigns/:id — atualizar campanha e/ou itens já existentes (parcial). */
export interface UpdateCampaignDTO {
  name?: string;
  exp_date?: string;
  city_uf?: string;
  enabled?: boolean;
  enter?: Partial<Omit<CreateCampaignItemDTO, "type_id"> & { type_id?: string }>;
  dwell?: Partial<Omit<CreateCampaignItemDTO, "type_id"> & { type_id?: string }>;
  exit?: Partial<Omit<CreateCampaignItemDTO, "type_id"> & { type_id?: string }>;
}

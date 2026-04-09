import type { PaginatedResponse } from "@/types/api";

export interface CampaignHeader {
  id: string;
  name: string;
  exp_date: string | null;
  city: string | null;
  uf: string | null;
  /** Centro da geofence (JSON numérico). */
  lat: number;
  /** Centro da geofence (JSON numérico). */
  long: number;
  /** Raio da geofence em metros (único por campanha). */
  radius: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  delivery_count?: number;
}

/** Item enter/dwell/exit: só conteúdo; geofence (lat/long/radius) fica no cabeçalho da campanha. */
export interface CampaignItem {
  id: string;
  title: string;
  description: string | null;
  type_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * PATCH parcial de item na campanha (PUT /campaigns/:id).
 * Apenas title, description e type_id — nunca lat, long ou radius.
 */
export type UpdateCampaignItemPartial = Partial<{
  title: string;
  description: string;
  type_id: string;
}>;

export interface CampaignWithItems extends CampaignHeader {
  enter: CampaignItem | null;
  dwell: CampaignItem | null;
  exit: CampaignItem | null;
}

export type Campaign = CampaignHeader;

export type PaginatedCampaignResponse = PaginatedResponse<CampaignHeader>;

export interface DeliveryStatsItem {
  id: string;
  name: string;
  delivery_count: number;
}

export interface DeliveryStatsResponse {
  items: DeliveryStatsItem[];
}

export type CampaignSearchIn = "name" | "city" | "both";

export interface CampaignListParams {
  page?: number;
  limit?: number;
  search?: string;
  search_in?: CampaignSearchIn;
  is_deleted?: boolean;
  enabled?: boolean;
}

export interface CreateCampaignDTO {
  name: string;
  exp_date: string;
  city: string;
  uf: string;
  lat: number;
  long: number;
  /** Inteiro em metros (1..100000). */
  radius: number;
  enabled?: boolean;
}

/** POST /campaigns/:id/items — só conteúdo. */
export interface CreateCampaignItemDTO {
  title: string;
  description?: string;
  type_id: string;
}

export interface UpdateCampaignDTO {
  name?: string;
  exp_date?: string;
  city?: string;
  uf?: string;
  lat?: number;
  long?: number;
  radius?: number;
  enabled?: boolean;
  enter?: UpdateCampaignItemPartial;
  dwell?: UpdateCampaignItemPartial;
  exit?: UpdateCampaignItemPartial;
}

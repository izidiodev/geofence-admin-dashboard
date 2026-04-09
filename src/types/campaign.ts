import type { PaginatedResponse } from "@/types/api";

export interface CampaignHeader {
  id: string;
  name: string;
  exp_date: string | null;
  city: string | null;
  uf: string | null;
  lat: string;
  long: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  delivery_count?: number;
}

export interface CampaignItem {
  id: string;
  title: string;
  description: string | null;
  type_id: string;
  radius: number;
  created_at: string;
  updated_at: string;
}

/** Campos atualizáveis de um item (sem lat/long; centro fica no cabeçalho). */
export type UpdateCampaignItemPartial = Partial<{
  title: string;
  description: string;
  type_id: string;
  radius: number;
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
  enabled?: boolean;
}

export interface CreateCampaignItemDTO {
  title: string;
  description?: string;
  type_id: string;
  radius: number;
}

export interface UpdateCampaignDTO {
  name?: string;
  exp_date?: string;
  city?: string;
  uf?: string;
  lat?: number;
  long?: number;
  enabled?: boolean;
  enter?: UpdateCampaignItemPartial;
  dwell?: UpdateCampaignItemPartial;
  exit?: UpdateCampaignItemPartial;
}

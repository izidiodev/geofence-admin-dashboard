export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  exp_date: string | null;
  city_uf: string | null;
  type_id: string;
  /** Tipo para evento Enter (geofence). */
  type_id_enter?: string;
  /** Tipo para evento Dwell. */
  type_id_dwell?: string;
  /** Tipo para evento Exit. */
  type_id_exit?: string;
  enabled: boolean;
  lat: number | string;
  long: number | string;
  radius: number;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface PaginatedCampaignResponse {
  items: Campaign[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

/** Bloco de dados de um evento (Enter, Dwell ou Exit) dentro de uma campanha. */
export interface CampaignEventDTO {
  name: string;
  description?: string;
  exp_date?: string;
  city_uf?: string;
  type_id: string;
  enabled?: boolean;
  lat: number;
  long: number;
  radius: number;
}

/** Uma campanha inteira: três blocos (enter, dwell, exit) em um único cadastro. */
export interface CreateCampaignFullDTO {
  enter: CampaignEventDTO;
  dwell: CampaignEventDTO;
  exit: CampaignEventDTO;
}

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  exp_date?: string;
  city_uf?: string;
  type_id?: string;
  type_id_enter?: string;
  type_id_dwell?: string;
  type_id_exit?: string;
  enabled?: boolean;
  lat: number;
  long: number;
  radius: number;
}

export interface UpdateCampaignDTO {
  name?: string;
  description?: string;
  exp_date?: string;
  city_uf?: string;
  type_id?: string;
  type_id_enter?: string;
  type_id_dwell?: string;
  type_id_exit?: string;
  enabled?: boolean;
  lat?: number;
  long?: number;
  radius?: number;
}

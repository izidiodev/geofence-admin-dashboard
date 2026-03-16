import { apiClient } from "@modules/core";
import type { ApiResponse } from "@/types/api";
import { normalizeErrorResponse } from "@/types/api";
import type {
  Campaign,
  CampaignListParams,
  CreateCampaignDTO,
  CreateCampaignFullDTO,
  PaginatedCampaignResponse,
  UpdateCampaignDTO,
} from "@/types/campaign";

function buildParams(params: CampaignListParams): Record<string, string | number | boolean> {
  const q: Record<string, string | number | boolean> = {};
  if (params.page != null) q.page = params.page;
  if (params.limit != null) q.limit = params.limit;
  if (params.search != null && params.search !== "") q.search = params.search;
  if (params.search_in != null) q.search_in = params.search_in;
  if (params.is_deleted != null) q.is_deleted = params.is_deleted;
  if (params.enabled != null) q.enabled = params.enabled;
  return q;
}

export class CampaignRepository {
  async list(params: CampaignListParams): Promise<ApiResponse<PaginatedCampaignResponse>> {
    try {
      const { data } = await apiClient.get<ApiResponse<PaginatedCampaignResponse>>("/campaigns", {
        params: buildParams(params),
      });
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao listar campanhas." };
    }
  }

  async getById(id: string): Promise<ApiResponse<Campaign>> {
    try {
      const { data } = await apiClient.get<ApiResponse<Campaign>>(`/campaigns/${id}`);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao buscar campanha." };
    }
  }

  async create(dto: CreateCampaignDTO): Promise<ApiResponse<Campaign>> {
    try {
      const { data } = await apiClient.post<ApiResponse<Campaign>>("/campaigns", dto);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao criar campanha." };
    }
  }

  async createTriplet(dto: CreateCampaignFullDTO): Promise<
    ApiResponse<{ campaign_group_id: string; enter: Campaign; dwell: Campaign; exit: Campaign }>
  > {
    try {
      const { data } = await apiClient.post<
        ApiResponse<{ campaign_group_id: string; enter: Campaign; dwell: Campaign; exit: Campaign }>
      >("/campaigns", dto);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao criar campanhas." };
    }
  }

  async update(id: string, dto: UpdateCampaignDTO): Promise<ApiResponse<Campaign>> {
    try {
      const { data } = await apiClient.put<ApiResponse<Campaign>>(`/campaigns/${id}`, dto);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao atualizar campanha." };
    }
  }

  async softDelete(id: string): Promise<ApiResponse<unknown>> {
    try {
      const { data } = await apiClient.delete<ApiResponse<unknown>>(`/campaigns/${id}`);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao excluir campanha." };
    }
  }
}

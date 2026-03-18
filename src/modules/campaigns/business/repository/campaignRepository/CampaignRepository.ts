import { apiClient } from "@modules/core";
import type { ApiResponse } from "@/types/api";
import { normalizeErrorResponse } from "@/types/api";
import type {
  CampaignHeader,
  CampaignListParams,
  CreateCampaignDTO,
  CreateCampaignItemDTO,
  DeliveryStatsResponse,
  PaginatedCampaignResponse,
  UpdateCampaignDTO,
  CampaignWithItems,
  CampaignItem,
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

  /** GET /api/campaigns/delivery-stats — top campanhas por delivery_count (para gráfico na home). */
  async getDeliveryStats(params?: { limit?: number }): Promise<ApiResponse<DeliveryStatsResponse>> {
    try {
      const limit = params?.limit != null ? Math.min(10, Math.max(1, params.limit)) : 10;
      const { data } = await apiClient.get<ApiResponse<DeliveryStatsResponse>>(
        "/campaigns/delivery-stats",
        { params: { limit } }
      );
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao carregar métricas de campanhas." };
    }
  }

  async getById(id: string): Promise<ApiResponse<CampaignWithItems>> {
    try {
      const { data } = await apiClient.get<ApiResponse<CampaignWithItems>>(`/campaigns/${id}`);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao buscar campanha." };
    }
  }

  /** POST /api/campaigns — cria campanha (só cabeçalho). */
  async create(dto: CreateCampaignDTO): Promise<ApiResponse<CampaignHeader>> {
    try {
      const { data } = await apiClient.post<ApiResponse<CampaignHeader>>("/campaigns", dto);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao criar campanha." };
    }
  }

  /** POST /api/campaigns/:id/items — adiciona um item (enter, dwell ou exit). */
  async addItem(campaignId: string, dto: CreateCampaignItemDTO): Promise<ApiResponse<CampaignItem>> {
    try {
      const { data } = await apiClient.post<ApiResponse<CampaignItem>>(
        `/campaigns/${campaignId}/items`,
        dto
      );
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao adicionar item da campanha." };
    }
  }

  /** PUT /api/campaigns/:id — atualiza campanha e/ou itens já existentes. */
  async update(id: string, dto: UpdateCampaignDTO): Promise<ApiResponse<CampaignWithItems>> {
    try {
      const { data } = await apiClient.put<ApiResponse<CampaignWithItems>>(`/campaigns/${id}`, dto);
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

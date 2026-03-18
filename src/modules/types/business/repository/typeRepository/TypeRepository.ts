import { apiClient } from "@modules/core";
import type { ApiResponse } from "@/types/api";
import { normalizeErrorResponse } from "@/types/api";
import type { PaginatedTypeResponse } from "@/types/type";

export class TypeRepository {
  async list(params: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedTypeResponse>> {
    try {
      const { data } = await apiClient.get<ApiResponse<PaginatedTypeResponse>>("/types", {
        params: { page: params.page ?? 1, limit: params.limit ?? 100 },
      });
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: unknown } };
      if (axiosErr.response?.data != null) return normalizeErrorResponse(axiosErr.response.data);
      return { success: false, error: "Erro ao listar tipos." };
    }
  }
}

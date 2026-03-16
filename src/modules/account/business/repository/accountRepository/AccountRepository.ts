import { apiClient } from "@modules/core";
import type { ApiResponse } from "@/types/api";
import type { LoginDTO, LoginResponseData } from "@/types/auth";

export class AccountRepository {
  async login(dto: LoginDTO): Promise<ApiResponse<LoginResponseData>> {
    try {
      const { data } = await apiClient.post<ApiResponse<LoginResponseData>>("/auth/login", dto);
      return data;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: ApiResponse<LoginResponseData> } };
      if (axiosErr.response?.data) {
        return axiosErr.response.data;
      }
      return { success: false, error: "Erro de conexão. Tente novamente." };
    }
  }
}

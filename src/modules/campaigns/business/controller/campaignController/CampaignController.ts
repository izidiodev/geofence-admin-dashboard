import type { CampaignRepository } from "@/modules/campaigns/business/repository/campaignRepository/CampaignRepository";
import type { ApiResponse } from "@/types/api";
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

export class CampaignController {
  constructor(private readonly repository: CampaignRepository) {}

  list(params: CampaignListParams): Promise<ApiResponse<PaginatedCampaignResponse>> {
    return this.repository.list(params);
  }

  getDeliveryStats(params?: { limit?: number }): Promise<ApiResponse<DeliveryStatsResponse>> {
    return this.repository.getDeliveryStats(params);
  }

  getById(id: string): Promise<ApiResponse<CampaignWithItems>> {
    return this.repository.getById(id);
  }

  create(dto: CreateCampaignDTO): Promise<ApiResponse<CampaignHeader>> {
    return this.repository.create(dto);
  }

  addItem(campaignId: string, dto: CreateCampaignItemDTO): Promise<ApiResponse<CampaignItem>> {
    return this.repository.addItem(campaignId, dto);
  }

  update(id: string, dto: UpdateCampaignDTO): Promise<ApiResponse<CampaignWithItems>> {
    return this.repository.update(id, dto);
  }

  softDelete(id: string): Promise<ApiResponse<unknown>> {
    return this.repository.softDelete(id);
  }
}

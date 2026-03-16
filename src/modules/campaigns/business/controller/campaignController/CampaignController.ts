import type { CampaignRepository } from "@/modules/campaigns/business/repository/campaignRepository/CampaignRepository";
import type { ApiResponse } from "@/types/api";
import type {
  Campaign,
  CampaignListParams,
  CreateCampaignDTO,
  CreateCampaignFullDTO,
  PaginatedCampaignResponse,
  UpdateCampaignDTO,
} from "@/types/campaign";

export class CampaignController {
  constructor(private readonly repository: CampaignRepository) {}

  list(params: CampaignListParams): Promise<ApiResponse<PaginatedCampaignResponse>> {
    return this.repository.list(params);
  }

  getById(id: string): Promise<ApiResponse<Campaign>> {
    return this.repository.getById(id);
  }

  create(dto: CreateCampaignDTO): Promise<ApiResponse<Campaign>> {
    return this.repository.create(dto);
  }

  createTriplet(dto: CreateCampaignFullDTO): Promise<
    ApiResponse<{ campaign_group_id: string; enter: Campaign; dwell: Campaign; exit: Campaign }>
  > {
    return this.repository.createTriplet(dto);
  }

  update(id: string, dto: UpdateCampaignDTO): Promise<ApiResponse<Campaign>> {
    return this.repository.update(id, dto);
  }

  softDelete(id: string): Promise<ApiResponse<unknown>> {
    return this.repository.softDelete(id);
  }
}

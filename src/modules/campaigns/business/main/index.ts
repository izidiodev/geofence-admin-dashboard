import { CampaignController } from "@/modules/campaigns/business/controller/campaignController/CampaignController";
import { CampaignRepository } from "@/modules/campaigns/business/repository/campaignRepository/CampaignRepository";

const campaignRepository = new CampaignRepository();
const campaignController = new CampaignController(campaignRepository);

export { campaignController, campaignRepository };

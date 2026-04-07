import { CAMPAIGN_MESSAGES } from "@/constants/messages";
import { CAMPAIGN_VALIDATION } from "@/modules/campaigns/constants/campaignValidation";
import { isIbgePairInList, loadIbgeMunicipios } from "@/modules/geo/ibgeMunicipiosApi";

function lengthsOk(city: string, uf: string): string | true {
  if (city.length > CAMPAIGN_VALIDATION.CITY_MAX_LENGTH) {
    return CAMPAIGN_MESSAGES.cityMax(CAMPAIGN_VALIDATION.CITY_MAX_LENGTH);
  }
  if (uf.length > CAMPAIGN_VALIDATION.UF_MAX_LENGTH) {
    return CAMPAIGN_MESSAGES.ufMax(CAMPAIGN_VALIDATION.UF_MAX_LENGTH);
  }
  return true;
}

export async function validateCampaignCityUfCreate(city: unknown, uf: unknown): Promise<string | true> {
  const ct = typeof city === "string" ? city.trim() : "";
  const u = typeof uf === "string" ? uf.trim().toUpperCase() : "";
  if (ct === "") return CAMPAIGN_MESSAGES.cityRequired;
  if (u === "") return CAMPAIGN_MESSAGES.ufRequired;
  const len = lengthsOk(ct, u);
  if (len !== true) return len;
  try {
    const list = await loadIbgeMunicipios();
    if (!isIbgePairInList(list, ct, u)) return CAMPAIGN_MESSAGES.locationMustSelectIbge;
    return true;
  } catch {
    return CAMPAIGN_MESSAGES.ibgeLoadError;
  }
}

export async function validateCampaignCityUfEdit(
  city: unknown,
  uf: unknown,
  legacy: { city: string | null; uf: string | null }
): Promise<string | true> {
  const ct = typeof city === "string" ? city.trim() : "";
  const u = typeof uf === "string" ? uf.trim().toUpperCase() : "";
  if (ct === "" && u === "") return true;
  if (ct === "" || u === "") return CAMPAIGN_MESSAGES.cityUfBothOrEmpty;
  const len = lengthsOk(ct, u);
  if (len !== true) return len;
  try {
    const list = await loadIbgeMunicipios();
    if (isIbgePairInList(list, ct, u)) return true;
    const lc = legacy.city?.trim() ?? "";
    const lu = (legacy.uf ?? "").trim().toUpperCase();
    if (lc !== "" && lu !== "" && ct === lc && u === lu) return true;
    return CAMPAIGN_MESSAGES.locationMustSelectIbge;
  } catch {
    return CAMPAIGN_MESSAGES.ibgeLoadError;
  }
}

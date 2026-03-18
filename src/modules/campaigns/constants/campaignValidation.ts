/**
 * Constantes e validações alinhadas ao backend (ms-geofence-admin CampaignValidation).
 * Use para resguardar o banco e dar feedback imediato no front.
 */
/** decimal(10,7) no banco: máx. 999,9999999 */
const LAT_LONG_MAX = 999.9999999;
const LAT_LONG_MIN = -999.9999999;

/** Lat/long para itens de geofence (API: lat -90..90, long -180..180). */
export const ITEM_LAT_MIN = -90;
export const ITEM_LAT_MAX = 90;
export const ITEM_LONG_MIN = -180;
export const ITEM_LONG_MAX = 180;

export const CAMPAIGN_VALIDATION = {
  NAME_MAX_LENGTH: 255,
  /** Título do item (enter/dwell/exit). */
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 500,
  CITY_UF_MAX_LENGTH: 255,
  RADIUS_MIN: 1,
  RADIUS_MAX: 100000,
  LAT_LONG_MIN,
  LAT_LONG_MAX,
  ITEM_LAT_MIN,
  ITEM_LAT_MAX,
  ITEM_LONG_MIN,
  ITEM_LONG_MAX,
} as const;

export function isValidNumber(value: unknown): value is number {
  if (value === undefined || value === null || value === "") return false;
  const n = Number(value);
  return !Number.isNaN(n);
}

export function isIntegerInRange(
  value: unknown,
  min: number,
  max: number
): boolean {
  if (!isValidNumber(value)) return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max;
}

/** Valida número decimal no intervalo [min, max] (ex.: lat/long decimal(10,7)). */
export function isDecimalInRange(
  value: unknown,
  min: number,
  max: number
): boolean {
  if (!isValidNumber(value)) return false;
  const n = Number(value);
  return n >= min && n <= max;
}

export function isValidDateString(value: string): boolean {
  if (value === "" || value == null) return true;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime());
}

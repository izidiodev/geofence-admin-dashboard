const LAT_LONG_MAX = 999.9999999;
const LAT_LONG_MIN = -999.9999999;

export const ITEM_LAT_MIN = -90;
export const ITEM_LAT_MAX = 90;
export const ITEM_LONG_MIN = -180;
export const ITEM_LONG_MAX = 180;

export const CAMPAIGN_VALIDATION = {
  NAME_MAX_LENGTH: 255,
  TITLE_MAX_LENGTH: 255,
  DESCRIPTION_MAX_LENGTH: 500,
  CITY_MAX_LENGTH: 255,
  UF_MAX_LENGTH: 10,
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

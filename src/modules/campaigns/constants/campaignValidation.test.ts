import { describe, it, expect } from "vitest";
import {
  CAMPAIGN_VALIDATION,
  isValidNumber,
  isIntegerInRange,
  isDecimalInRange,
  isValidDateString,
  validateCampaignLatLong,
} from "./campaignValidation";

describe("campaignValidation", () => {
  describe("CAMPAIGN_VALIDATION", () => {
    it("expõe constantes esperadas", () => {
      expect(CAMPAIGN_VALIDATION.NAME_MAX_LENGTH).toBe(255);
      expect(CAMPAIGN_VALIDATION.CITY_MAX_LENGTH).toBe(255);
      expect(CAMPAIGN_VALIDATION.UF_MAX_LENGTH).toBe(10);
      expect(CAMPAIGN_VALIDATION.RADIUS_MIN).toBe(1);
      expect(CAMPAIGN_VALIDATION.RADIUS_MAX).toBe(100000);
      expect(CAMPAIGN_VALIDATION.LAT_LONG_MIN).toBe(-999.9999999);
      expect(CAMPAIGN_VALIDATION.LAT_LONG_MAX).toBe(999.9999999);
    });
  });

  describe("isValidNumber", () => {
    it("retorna true para número", () => {
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(1.5)).toBe(true);
    });
    it("retorna false para undefined, null, string vazia", () => {
      expect(isValidNumber(undefined)).toBe(false);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber("")).toBe(false);
    });
    it("retorna true para string numérica", () => {
      expect(isValidNumber("42")).toBe(true);
      expect(isValidNumber("3.14")).toBe(true);
    });
    it("retorna false para NaN", () => {
      expect(isValidNumber(Number.NaN)).toBe(false);
      expect(isValidNumber("abc")).toBe(false);
    });
  });

  describe("isIntegerInRange", () => {
    it("retorna true para inteiro no intervalo", () => {
      expect(isIntegerInRange(50, 1, 100)).toBe(true);
      expect(isIntegerInRange(1, 1, 100)).toBe(true);
      expect(isIntegerInRange(100, 1, 100)).toBe(true);
    });
    it("retorna false para fora do intervalo", () => {
      expect(isIntegerInRange(0, 1, 100)).toBe(false);
      expect(isIntegerInRange(101, 1, 100)).toBe(false);
    });
    it("retorna false para decimal", () => {
      expect(isIntegerInRange(50.5, 1, 100)).toBe(false);
    });
  });

  describe("isDecimalInRange", () => {
    it("retorna true para decimal no intervalo", () => {
      expect(isDecimalInRange(-90, -999.9999999, 999.9999999)).toBe(true);
      expect(isDecimalInRange(0, -999.9999999, 999.9999999)).toBe(true);
    });
    it("retorna false para fora do intervalo", () => {
      expect(isDecimalInRange(1000, -999.9999999, 999.9999999)).toBe(false);
      expect(isDecimalInRange(-1000, -999.9999999, 999.9999999)).toBe(false);
    });
  });

  describe("validateCampaignLatLong", () => {
    it("aceita latitude no intervalo", () => {
      expect(validateCampaignLatLong(0, "lat")).toBe(true);
      expect(validateCampaignLatLong(-90, "lat")).toBe(true);
      expect(validateCampaignLatLong(90, "lat")).toBe(true);
    });
    it("rejeita latitude fora do intervalo", () => {
      expect(validateCampaignLatLong(91, "lat")).toMatch(/Latitude entre/);
      expect(validateCampaignLatLong(-91, "lat")).toMatch(/Latitude entre/);
    });
    it("aceita longitude no intervalo", () => {
      expect(validateCampaignLatLong(0, "long")).toBe(true);
      expect(validateCampaignLatLong(180, "long")).toBe(true);
      expect(validateCampaignLatLong(-180, "long")).toBe(true);
    });
    it("rejeita longitude fora do intervalo", () => {
      expect(validateCampaignLatLong(181, "long")).toMatch(/Longitude entre/);
    });
    it("rejeita valor não numérico", () => {
      expect(validateCampaignLatLong("", "lat")).toBe("Latitude deve ser um número");
      expect(validateCampaignLatLong("x", "long")).toBe("Longitude deve ser um número");
    });
  });

  describe("isValidDateString", () => {
    it("retorna true para string vazia ou null (opcional)", () => {
      expect(isValidDateString("")).toBe(true);
      expect(isValidDateString(null as unknown as string)).toBe(true);
    });
    it("retorna true para data válida ISO", () => {
      expect(isValidDateString("2025-12-31")).toBe(true);
    });
    it("retorna false para data inválida", () => {
      expect(isValidDateString("invalid")).toBe(false);
      expect(isValidDateString("32/13/2025")).toBe(false);
    });
  });
});

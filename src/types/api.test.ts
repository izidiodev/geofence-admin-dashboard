import { describe, it, expect } from "vitest";
import {
  isApiErrorSingle,
  isApiErrorValidation,
  normalizeErrorResponse,
  type ApiErrorSingle,
  type ApiErrorValidation,
  type ApiSuccess,
} from "./api";

describe("api types", () => {
  describe("isApiErrorSingle", () => {
    it("retorna true para objeto com success: false e error string", () => {
      const r: ApiErrorSingle = { success: false, error: "Erro" };
      expect(isApiErrorSingle(r)).toBe(true);
    });
    it("retorna false para ApiSuccess", () => {
      const r: ApiSuccess<unknown> = { success: true, data: {} };
      expect(isApiErrorSingle(r)).toBe(false);
    });
    it("retorna false para ApiErrorValidation", () => {
      const r: ApiErrorValidation = { success: false, errors: ["a"] };
      expect(isApiErrorSingle(r)).toBe(false);
    });
  });

  describe("isApiErrorValidation", () => {
    it("retorna true para objeto com success: false e errors array", () => {
      const r: ApiErrorValidation = { success: false, errors: ["a", "b"] };
      expect(isApiErrorValidation(r)).toBe(true);
    });
    it("retorna false para ApiErrorSingle", () => {
      const r: ApiErrorSingle = { success: false, error: "Erro" };
      expect(isApiErrorValidation(r)).toBe(false);
    });
  });

  describe("normalizeErrorResponse", () => {
    it("extrai error quando success: false e error é string", () => {
      const data = { success: false, error: "Mensagem do servidor" };
      expect(normalizeErrorResponse(data)).toEqual({ success: false, error: "Mensagem do servidor" });
    });
    it("junta errors em uma string quando success: false e errors é array", () => {
      const data = { success: false, errors: ["Erro 1", "Erro 2"] };
      expect(normalizeErrorResponse(data)).toEqual({ success: false, error: "Erro 1; Erro 2" });
    });
    it("usa detail string quando presente", () => {
      const data = { detail: "Not found" };
      expect(normalizeErrorResponse(data)).toEqual({ success: false, error: "Not found" });
    });
    it("usa message quando presente", () => {
      const data = { message: "Internal error" };
      expect(normalizeErrorResponse(data)).toEqual({ success: false, error: "Internal error" });
    });
    it("retorna mensagem genérica para objeto desconhecido", () => {
      const data = { foo: "bar" };
      expect(normalizeErrorResponse(data)).toEqual({
        success: false,
        error: "Ocorreu um erro. Tente novamente.",
      });
    });
    it("retorna mensagem genérica para null/undefined", () => {
      expect(normalizeErrorResponse(null).error).toBe("Ocorreu um erro. Tente novamente.");
      expect(normalizeErrorResponse(undefined).error).toBe("Ocorreu um erro. Tente novamente.");
    });
    it("aceita string não vazia como erro", () => {
      expect(normalizeErrorResponse("Falha na rede")).toEqual({ success: false, error: "Falha na rede" });
    });
  });
});

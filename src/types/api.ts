export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorSingle {
  success: false;
  error: string;
}

export interface ApiErrorValidation {
  success: false;
  errors: string[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorSingle | ApiErrorValidation;

export function isApiErrorSingle(r: ApiResponse<unknown>): r is ApiErrorSingle {
  return !r.success && "error" in r && typeof (r as ApiErrorSingle).error === "string";
}

export function isApiErrorValidation(r: ApiResponse<unknown>): r is ApiErrorValidation {
  return !r.success && "errors" in r && Array.isArray((r as ApiErrorValidation).errors);
}

/** Converte qualquer corpo de erro (400, 422, etc.) para ApiErrorSingle. */
export function normalizeErrorResponse(data: unknown): ApiErrorSingle {
  if (data != null && typeof data === "object" && "success" in data && (data as { success: boolean }).success === false) {
    const r = data as Record<string, unknown>;
    if (typeof r.error === "string") return { success: false, error: r.error };
    if (Array.isArray(r.errors)) {
      const msg = r.errors.every((e): e is string => typeof e === "string")
        ? r.errors.join("; ")
        : "Erro de validação.";
      return { success: false, error: msg };
    }
  }
  if (data != null && typeof data === "object" && "detail" in data) {
    const d = (data as { detail: unknown }).detail;
    if (typeof d === "string") return { success: false, error: d };
    if (Array.isArray(d)) {
      const parts = d
        .map((x) => (x != null && typeof x === "object" && "msg" in x ? String((x as { msg: unknown }).msg) : String(x)))
        .filter(Boolean);
      return { success: false, error: parts.length > 0 ? parts.join("; ") : "Erro de validação." };
    }
  }
  if (data != null && typeof data === "object" && "message" in data && typeof (data as { message: unknown }).message === "string") {
    return { success: false, error: (data as { message: string }).message };
  }
  if (typeof data === "string" && data.length > 0) return { success: false, error: data };
  return { success: false, error: "Ocorreu um erro. Tente novamente." };
}

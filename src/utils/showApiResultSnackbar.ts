import type { ApiResponse } from "@/types/api";
import { isApiErrorSingle, isApiErrorValidation } from "@/types/api";
import { getToaster } from "@/utils/toasterRef";

export interface ShowApiResultSnackbarOptions {
  successMessage?: string;
}

function getErrorMessage(result: ApiResponse<unknown>): string {
  if (isApiErrorSingle(result)) return result.error;
  if (isApiErrorValidation(result)) return result.errors.length > 0 ? result.errors.join("; ") : "Erro de validação.";
  const r = result as Record<string, unknown>;
  if (typeof r?.detail === "string") return r.detail;
  if (typeof r?.message === "string") return r.message;
  return "Ocorreu um erro. Tente novamente.";
}

export function showApiResultSnackbar<T>(
  result: ApiResponse<T>,
  options: ShowApiResultSnackbarOptions = {}
): void {
  const { successMessage } = options;
  const toaster = getToaster();

  if (result.success) {
    if (successMessage && toaster) {
      toaster.create({ title: successMessage, type: "success", duration: 1500 });
    }
    return;
  }

  const description = getErrorMessage(result as ApiResponse<unknown>);
  if (toaster) {
    toaster.create({ title: "Erro", description, type: "error", duration: 3000 });
  } else {
    console.error("[showApiResultSnackbar] Toaster não disponível. Erro:", description);
  }
}

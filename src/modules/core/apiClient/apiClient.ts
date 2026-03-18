import axios, { type AxiosInstance } from "axios";
import { localStorageController } from "@/modules/core/localStorageController/localStorageController";
import { dispatchSessionExpired } from "@/modules/core/apiClient/sessionExpiredEvent";

const origin =
  typeof import.meta.env.VITE_API_URL === "string" && import.meta.env.VITE_API_URL.length > 0
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "";
const baseURL = origin ? `${origin}/api` : "/api";

const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorageController.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as (typeof error.config) & { __retryCount?: number };
    const retryCount = config?.__retryCount ?? 0;
    const shouldRetry =
      config != null &&
      retryCount < MAX_RETRIES &&
      (error.code === "ECONNABORTED" || (error.response?.status >= 500 && error.response?.status < 600));
    if (shouldRetry) {
      config.__retryCount = retryCount + 1;
      return apiClient.request(config);
    }
    const isLoginRequest =
      typeof config?.url === "string" && config.url.includes("auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorageController.removeToken();
      localStorageController.removeItem(localStorageController.getUserKey());
      dispatchSessionExpired();
    }
    return Promise.reject(error);
  }
);

export { apiClient };

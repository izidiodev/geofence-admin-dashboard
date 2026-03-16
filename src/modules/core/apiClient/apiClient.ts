import axios, { type AxiosInstance } from "axios";
import { localStorageController } from "@/modules/core/localStorageController/localStorageController";
import { dispatchSessionExpired } from "@/modules/core/apiClient/sessionExpiredEvent";

const origin =
  typeof import.meta.env.VITE_API_URL === "string" && import.meta.env.VITE_API_URL.length > 0
    ? import.meta.env.VITE_API_URL.replace(/\/$/, "")
    : "";
const baseURL = origin ? `${origin}/api` : "/api";

const apiClient: AxiosInstance = axios.create({
  baseURL,
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
  (error) => {
    const isLoginRequest =
      typeof error.config?.url === "string" && error.config.url.includes("auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorageController.removeToken();
      localStorageController.removeItem(localStorageController.getUserKey());
      dispatchSessionExpired();
    }
    return Promise.reject(error);
  }
);

export { apiClient };

import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export interface ApiErrorEnvelope {
  error?: { message?: string; code?: string; details?: unknown };
}

// unwraps the server error envelope from any axios/unknown error
export function getApiError(err: unknown): { message: string; code?: string; details?: unknown } {
  if (typeof err === "object" && err !== null && "response" in err) {
    const data = (err as { response?: { data?: ApiErrorEnvelope } }).response?.data;
    if (data?.error?.message) {
      return { message: data.error.message, code: data.error.code, details: data.error.details };
    }
  }
  if (err instanceof Error && err.message) return { message: err.message };
  return { message: "Something went wrong. Please try again." };
}

export function getErrorMessage(err: unknown): string {
  return getApiError(err).message;
}

export default api;

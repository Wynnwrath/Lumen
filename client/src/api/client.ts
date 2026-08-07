import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

// One shared axios instance for all API calls.
// baseURL is "/api" and Vite's dev proxy forwards it to the backend.
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every outgoing request if we're logged in.
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On a 401 (expired/invalid token), log the user out automatically.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

// Shape of the server's error body: { error: { message, code, details } }.
export interface ApiErrorEnvelope {
  error?: { message?: string; code?: string; details?: unknown };
}

// Pulls the human-readable message + code out of any thrown error.
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

// Convenience: just the message string, for toasts.
export function getErrorMessage(err: unknown): string {
  return getApiError(err).message;
}

export default api;

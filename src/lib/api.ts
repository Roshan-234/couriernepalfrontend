import axios from "axios";
import { API_BASE_URL } from "@/config";

export function csrfToken(name = "csrf_access_token") {
  if (typeof document === "undefined") return "";
  return decodeURIComponent(
    document.cookie
      .split("; ")
      .find((cookie) => cookie.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=") || "",
  );
}
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 15000,
});
api.interceptors.request.use((config) => {
  const token = csrfToken();
  if (token) config.headers["X-CSRF-TOKEN"] = token;
  return config;
});
let refresh: Promise<unknown> | null = null;
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    if (
      error.response?.status === 401 &&
      request &&
      !request._retried &&
      !["/auth/login", "/auth/register", "/auth/refresh"].includes(request.url)
    ) {
      request._retried = true;
      try {
        refresh ??= axios
          .post(
            `${API_BASE_URL}/auth/refresh`,
            {},
            {
              withCredentials: true,
              timeout: 15000,
              headers: { "X-CSRF-TOKEN": csrfToken("csrf_refresh_token") },
            },
          )
          .finally(() => {
            refresh = null;
          });
        await refresh;
        return api(request);
      } catch {
        /* Preserve the original error. */
      }
    }
    return Promise.reject(error);
  },
);
export function errorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error))
    return (
      error.response?.data?.msg ||
      error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "The request timed out. Please try again."
        : fallback)
    );
  return fallback;
}
export default api;

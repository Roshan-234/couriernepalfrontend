export const API_BASE_URL =
  typeof window === "undefined"
    ? `${(process.env.BACKEND_URL || "http://127.0.0.1:5000").replace(/\/$/, "")}/api`
    : "/api";

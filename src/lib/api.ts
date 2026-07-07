const rawApiUrl = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000";

export const API_BASE_URL = rawApiUrl.replace(/\/+$/, "");

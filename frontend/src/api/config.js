const rawApiBase =
  import.meta.env.VITE_API_BASE_URL || "https://backend.onrender.com/api";

export const API_BASE = rawApiBase.replace(/\/$/, "");

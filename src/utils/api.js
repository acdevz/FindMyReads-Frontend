// src/utils/api.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

export async function fetchApi(endpoint, options = {}) {
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: "include",
  };

  let response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

  if (
    response.status === 401 &&
    endpoint !== "/api/auth/refresh" &&
    endpoint !== "/api/auth/login"
  ) {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (refreshRes.ok) {
      response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
    }
  }

  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      data?.detail || data?.title || data?.message || "An API error occurred",
    );
  }
  return data;
}

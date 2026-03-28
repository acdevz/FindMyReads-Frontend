// src/utils/api.js
const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
let refreshPromise = null;

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
    (response.status === 401 || response.status === 403) &&
    !endpoint.includes("/auth/")
  ) {
    if (!refreshPromise) {
      refreshPromise = fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }).finally(() => {
        refreshPromise = null;
      });
    }
    const refreshRes = await refreshPromise;

    if (refreshRes.ok) {
      response = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);
    } else {
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
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

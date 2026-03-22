export async function fetchApi(endpoint, options = {}) {
  let token = localStorage.getItem("accessToken");

  const headers = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`; // [cite: 44]
  }

  let response = await fetch(`${endpoint}`, { ...options, headers });

  // If unauthorized, try to refresh [cite: 60]
  if (response.status === 401) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      const refreshRes = await fetch(`/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshRes.ok) {
        const newData = await refreshRes.json();
        localStorage.setItem("accessToken", newData.accessToken);
        localStorage.setItem("refreshToken", newData.refreshToken);

        // Retry original request
        headers["Authorization"] = `Bearer ${newData.accessToken}`;
        response = await fetch(`${endpoint}`, {
          ...options,
          headers,
        });
      }
    }
  }

  if (response.status === 204) return null; // [cite: 70]

  const data = await response.json();
  if (!response.ok) {
    // Return standard RFC 7807 error detail [cite: 45]
    throw new Error(data.detail || data.title || "An API error occurred");
  }
  return data;
}

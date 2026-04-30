// Central API Client - Base URL: https://nha-backend.onrender.com

const BASE_URL = "https://nha-backend.onrender.com";

export function getToken() {
  return localStorage.getItem("access_token");
}

export function setTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return null;

  try {
    const response = await fetch(`${BASE_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data?.access) {
      localStorage.setItem("access_token", data.access);
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
}

async function request(endpoint, options = {}, auth = true, retry = true) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // Try to parse JSON regardless of status
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // Handle token expiration - attempt refresh and retry once
  if (response.status === 401 && auth && retry) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      // Retry the original request with new token
      return request(endpoint, options, auth, false);
    }
    // Refresh failed - clear tokens and throw
    clearTokens();
  }

  if (!response.ok) {
    // Specific error message for rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After") || "60";
      const err = new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
      err.status = 429;
      err.data = data;
      throw err;
    }

    // Surface a meaningful error message from the backend when available.
    // Django REST Framework returns validation errors as { field: ["msg", ...] }
    // so we flatten those into a single readable string.
    let message =
      data?.detail ||
      data?.message ||
      data?.error;

    if (!message && data && typeof data === "object" && !Array.isArray(data)) {
      const fieldErrors = Object.entries(data)
        .map(([field, errs]) => {
          const msgs = Array.isArray(errs) ? errs.join(" ") : String(errs);
          // capitalise field name for readability
          const label = field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, " ");
          return `${label}: ${msgs}`;
        })
        .join("  •  ");
      message = fieldErrors || null;
    }

    message = message || `HTTP ${response.status}: ${response.statusText}`;
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}


export const api = {
  get: (endpoint, auth = true) =>
    request(endpoint, { method: "GET" }, auth),

  post: (endpoint, body, auth = true) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }, auth),

  put: (endpoint, body, auth = true) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body) }, auth),

  delete: (endpoint, auth = true) =>
    request(endpoint, { method: "DELETE" }, auth),

  upload: (endpoint, formData, auth = true) => {
    const headers = {};
    if (auth) {
      const token = getToken();
      if (token) headers["Authorization"] = `Bearer ${token}`;
    }
    return fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    }).then(async (res) => {
      let data;
      try { data = await res.json(); } catch { data = null; }
      if (!res.ok) {
        const message = data?.detail || data?.message || `HTTP ${res.status}`;
        const err = new Error(message);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    });
  },
};

export default api;

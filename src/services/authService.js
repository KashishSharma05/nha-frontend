// Auth Service

import api, { setTokens, clearTokens } from "./api";

export async function register(payload) {
  const data = await api.post("/api/auth/register/", payload, false);
  // If the backend returns tokens on register, persist them
  if (data?.access) {
    setTokens(data.access, data.refresh);
  }
  return data;
}

export async function forgotPassword(payload) {
  return api.post("/api/auth/forgot-password/", payload, false);
}

export async function login(payload) {
  const data = await api.post("/api/auth/login/", payload, false);
  if (data?.access) {
    setTokens(data.access, data.refresh);
  }
  return data;
}

export async function getProfile() {
  return api.get("/api/auth/profile/");
}

export async function logout() {
  try {
    await api.post("/api/auth/logout/", {}, true);
  } catch {
    // Silent fail - tokens will be cleared regardless
  }
  clearTokens();
}

import apiClient from "./apiClient";

export async function loginUser(payload) {
  const response = await apiClient.post("/auth/login", payload);
  return response.data;
}

export async function registerUser(payload) {
  const response = await apiClient.post("/auth/register", payload);
  return response.data;
}

export async function fetchProfile() {
  const response = await apiClient.get("/auth/profile");
  return response.data;
}

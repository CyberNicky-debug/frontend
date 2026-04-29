import apiClient from "./apiClient";

export async function fetchPayments(params = {}) {
  const response = await apiClient.get("/payments", { params });
  return response.data;
}

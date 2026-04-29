import apiClient from "./apiClient";

export async function initiatePayment(payload) {
  const response = await apiClient.post("/payments/initiate", payload);
  return response.data;
}

export async function verifyPayment(payload) {
  const response = await apiClient.post("/payments/verify", payload);
  return response.data;
}

import apiClient from "./apiClient";

export async function createOrder(items) {
  const response = await apiClient.post("/orders", { items });
  return response.data;
}

export async function fetchMyOrders(params = {}) {
  const response = await apiClient.get("/orders/my", { params });
  return response.data;
}

export async function fetchOrderById(orderId) {
  const response = await apiClient.get(`/orders/${orderId}`);
  return response.data;
}

export async function fetchOrders(params = {}) {
  const response = await apiClient.get("/orders", { params });
  return response.data;
}

export async function updateOrderStatus(orderId, status) {
  const response = await apiClient.put(`/orders/${orderId}/status`, { status });
  return response.data;
}

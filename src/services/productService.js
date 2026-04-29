import apiClient from "./apiClient";

export async function fetchProducts(params = {}) {
  const response = await apiClient.get("/products", { params });
  return response.data;
}

export async function searchProducts(query, params = {}) {
  const response = await apiClient.get("/products/search", {
    params: {
      q: query,
      ...params,
    },
  });

  return response.data;
}

export async function fetchProductById(productId) {
  const response = await apiClient.get(`/products/${productId}`);
  return response.data;
}

export async function createProduct(payload) {
  const response = await apiClient.post("/products", payload);
  return response.data;
}

export async function updateProduct(productId, payload) {
  const response = await apiClient.put(`/products/${productId}`, payload);
  return response.data;
}

export async function deleteProduct(productId) {
  const response = await apiClient.delete(`/products/${productId}`);
  return response.data;
}

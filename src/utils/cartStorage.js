const CART_KEY = "electronics_cart";

export function getStoredCart() {
  const rawCart = localStorage.getItem(CART_KEY);

  if (!rawCart) {
    return [];
  }

  try {
    const parsedCart = JSON.parse(rawCart);
    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

export function saveCart(cartItems) {
  localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
}

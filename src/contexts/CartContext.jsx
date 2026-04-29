import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getStoredCart, saveCart } from "../utils/cartStorage";

const CartContext = createContext(null);

function normalizeQuantity(quantity) {
  const parsedQuantity = Number(quantity);

  if (!Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
    return 1;
  }

  return Math.floor(parsedQuantity);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(getStoredCart());

  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  function addToCart(product, quantity = 1) {
    const normalizedQuantity = normalizeQuantity(quantity);

    setCartItems((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + normalizedQuantity,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          stockQuantity: Number(product.stockQuantity || 0),
          categoryName: product.categoryName || "General",
          description: product.description || "",
          quantity: normalizedQuantity,
        },
      ];
    });
  }

  function updateQuantity(productId, quantity) {
    const normalizedQuantity = normalizeQuantity(quantity);

    setCartItems((currentCart) =>
      currentCart.map((item) =>
        item.id === productId
          ? {
              ...item,
              quantity: normalizedQuantity,
            }
          : item
      )
    );
  }

  function removeFromCart(productId) {
    setCartItems((currentCart) => currentCart.filter((item) => item.id !== productId));
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartSummary = useMemo(() => {
    const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    const subtotal = cartItems.reduce((total, item) => total + item.quantity * Number(item.price), 0);

    return {
      itemCount,
      subtotal,
    };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount: cartSummary.itemCount,
        subtotal: cartSummary.subtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}

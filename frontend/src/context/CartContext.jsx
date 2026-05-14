import { createContext, useContext, useMemo, useState } from "react";
import toast from "react-hot-toast";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const persist = (nextItems) => {
    setItems(nextItems);
  };

  const addToCart = (food, quantity = 1) => {
    const nextItems = [...items];
    const existing = nextItems.find((item) => item._id === food._id);
    const cartFood = { ...food, price: food.offerPrice > 0 ? food.offerPrice : food.price };

    if (existing) {
      existing.quantity += quantity;
    } else {
      nextItems.push({ ...cartFood, quantity });
    }

    persist(nextItems);
    toast.success(`${food.name} added to cart`);
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    persist(items.map((item) => (item._id === id ? { ...item, quantity } : item)));
  };

  const removeFromCart = (id) => {
    persist(items.filter((item) => item._id !== id));
    toast.success("Item removed");
  };

  const clearCart = () => persist([]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal > 50 || subtotal === 0 ? 0 : 3.99;
  const total = subtotal + deliveryFee;

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal,
      deliveryFee,
      total,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart
    }),
    [items, subtotal, deliveryFee, total]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);

import { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize from localStorage if available, otherwise fallback to empty array (or mock)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('shopez_cart');
      if (savedCart) return JSON.parse(savedCart);
    } catch (err) {
      console.error('Failed to parse cart from localStorage', err);
    }
    return []; // Start with empty cart — no mock items
  });

  // Sync to localStorage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('shopez_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const cartTotal = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const itemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => prev.map(item => String(item.id) === String(id) ? { ...item, qty: newQty } : item));
  };

  const removeItem = (id) => {
    setCartItems(prev => prev.filter(item => String(item.id) !== String(id)));
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => String(item.id) === String(product.id));
      if (existing) {
        return prev.map(item => String(item.id) === String(product.id) ? { ...item, qty: item.qty + quantity } : item);
      }
      return [...prev, { ...product, qty: quantity }];
    });
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, cartTotal, itemCount, updateQty, removeItem, addToCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

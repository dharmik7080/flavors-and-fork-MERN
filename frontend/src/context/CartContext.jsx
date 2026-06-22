import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [showCartDrawer, setShowCartDrawer] = useState(false);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('flavorsAndForkCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Error loading cart data from localStorage', e);
      }
    }
  }, []);

  // Sync to localStorage helper
  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('flavorsAndForkCart', JSON.stringify(newCart));
  };

  const addToCart = (item) => {
    const existing = cart.find(x => x.id === item.id);
    let updated;
    if (existing) {
      updated = cart.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x);
    } else {
      updated = [...cart, { ...item, qty: 1 }];
    }
    saveCart(updated);
  };

  const removeFromCart = (itemId) => {
    const existing = cart.find(x => x.id === itemId);
    if (!existing) return;

    let updated;
    if (existing.qty <= 1) {
      updated = cart.filter(x => x.id !== itemId);
    } else {
      updated = cart.map(x => x.id === itemId ? { ...x, qty: x.qty - 1 } : x);
    }
    saveCart(updated);
  };

  const clearCart = () => {
    saveCart([]);
    setDiscount(0);
  };

  // Derived values
  const totalItemsCount = cart.reduce((count, item) => count + item.qty, 0);
  const subtotal = cart.reduce((total, item) => total + (item.price * item.qty), 0);
  const gst = subtotal * 0.05;
  const platformFee = subtotal > 0 ? 20 : 0;
  const grandTotal = Math.max(0, Math.round(subtotal + gst + platformFee - discount));

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      discount,
      setDiscount,
      showCartDrawer,
      setShowCartDrawer,
      totalItemsCount,
      subtotal,
      gst,
      platformFee,
      grandTotal
    }}>
      {children}
    </CartContext.Provider>
  );
}

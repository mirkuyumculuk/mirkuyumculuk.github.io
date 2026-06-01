import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const { user } = useAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user && user.id) {
      fetchCart();
    } else {
      setCart([]);
      setCartCount(0);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/cart`, {
        withCredentials: true
      });
      setCart(data);
      setCartCount(data.reduce((sum, item) => sum + item.quantity, 0));
    } catch (error) {
      console.error('Fetch cart error:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(
        `${API_URL}/api/cart/add`,
        { product_id: productId, quantity },
        { withCredentials: true }
      );
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Ürün eklenemedi' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await axios.delete(`${API_URL}/api/cart/${itemId}`, {
        withCredentials: true
      });
      await fetchCart();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Ürün silinemedi' };
    }
  };

  const clearCart = () => {
    setCart([]);
    setCartCount(0);
  };

  return (
    <CartContext.Provider value={{ cart, cartCount, addToCart, removeFromCart, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
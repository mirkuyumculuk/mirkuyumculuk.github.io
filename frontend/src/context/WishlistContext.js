import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const { user } = useAuth();

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (user && user.id) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/wishlist`, {
        withCredentials: true
      });
      setWishlist(data);
    } catch (error) {
      console.error('Fetch wishlist error:', error);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      await axios.post(
        `${API_URL}/api/wishlist/add`,
        { product_id: productId, quantity: 1 },
        { withCredentials: true }
      );
      await fetchWishlist();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Ekleme başarısız' };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_URL}/api/wishlist/${productId}`, {
        withCredentials: true
      });
      await fetchWishlist();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Silme başarısız' };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.product.id === productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

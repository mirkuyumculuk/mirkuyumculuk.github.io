import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-white flex flex-col">
            <Header />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products/:category" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/checkout/success" element={<ProtectedRoute><CheckoutSuccessPage /></ProtectedRoute>} />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
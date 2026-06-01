import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Package, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';

const Header = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50" data-testid="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu-button">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] bg-white">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link
                    to="/"
                    className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-home-link"
                  >
                    Ana Sayfa
                  </Link>
                  <Link
                    to="/products/8k"
                    className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-8k-link"
                  >
                    8 Ayar
                  </Link>
                  <Link
                    to="/products/14k"
                    className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-14k-link"
                  >
                    14 Ayar
                  </Link>
                  <Link
                    to="/products/21k"
                    className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-21k-link"
                  >
                    21 Ayar
                  </Link>
                  <Link
                    to="/products/22k"
                    className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="mobile-22k-link"
                  >
                    22 Ayar
                  </Link>
                  {user && user.id ? (
                    <>
                      <Link
                        to="/account"
                        className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="mobile-account-link"
                      >
                        <User className="h-5 w-5" /> Hesabım
                      </Link>
                      <Link
                        to="/wishlist"
                        className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                        data-testid="mobile-wishlist-link"
                      >
                        <Heart className="h-5 w-5" /> Favorilerim
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors flex items-center gap-2 text-left"
                        data-testid="mobile-logout-button"
                      >
                        <LogOut className="h-5 w-5" /> Çıkış Yap
                      </button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid="mobile-login-link"
                    >
                      Giriş Yap
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <Link to="/" className="flex-1 flex flex-col items-center justify-center" data-testid="logo-link">
            <h1 className="logo-font text-4xl md:text-5xl lg:text-6xl font-black gold-gradient drop-shadow-sm tracking-widest leading-none">
              MIR
            </h1>
            <span className="text-[10px] md:text-xs text-[#B38728] tracking-[0.3em] mt-1 font-medium" data-testid="est-year">
              EST. 2026
            </span>
          </Link>

          <div className="flex items-center gap-2 md:gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" className="text-[#1A1A1A] hover:text-[#D4AF37]" data-testid="desktop-menu-button">
                    <Menu className="h-5 w-5 mr-2" />
                    Menü
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[320px] bg-white">
                  <div className="flex flex-col space-y-6 mt-8">
                    {user && user.id ? (
                      <>
                        <div className="pb-4 border-b border-[#E5E5E5]">
                          <p className="text-sm text-[#7A7A7A]">Hoşgeldiniz</p>
                          <p className="text-lg font-semibold text-[#1A1A1A]">{user.name}</p>
                        </div>
                        <Link
                          to="/account"
                          className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                          data-testid="desktop-account-link"
                        >
                          <User className="h-5 w-5" />
                          <span className="text-lg">Hesabım</span>
                        </Link>
                        <Link
                          to="/account"
                          className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                          data-testid="desktop-orders-link"
                        >
                          <Package className="h-5 w-5" />
                          <span className="text-lg">Sipariş Geçmişim</span>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                          data-testid="desktop-wishlist-link"
                        >
                          <Heart className="h-5 w-5" />
                          <span className="text-lg">Favorilerim</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 text-[#1A1A1A] hover:text-[#D4AF37] transition-colors text-left"
                          data-testid="desktop-logout-button"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="text-lg">Çıkış Yap</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                          data-testid="desktop-login-link"
                        >
                          Giriş Yap
                        </Link>
                        <Link
                          to="/register"
                          className="text-lg text-[#1A1A1A] hover:text-[#D4AF37] transition-colors"
                          data-testid="desktop-register-link"
                        >
                          Kayıt Ol
                        </Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </nav>

            <Link to="/wishlist" className="relative" data-testid="wishlist-icon-link">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-6 w-6 text-[#1A1A1A]" />
                {wishlist.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                    data-testid="wishlist-count-badge"
                  >
                    {wishlist.length}
                  </span>
                )}
              </Button>
            </Link>

            <Link to="/cart" className="relative" data-testid="cart-link">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-6 w-6 text-[#1A1A1A]" />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
                    data-testid="cart-count-badge"
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
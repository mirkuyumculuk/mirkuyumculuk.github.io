import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axios from 'axios';

const CartPage = () => {
  const { cart, removeFromCart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const handleRemove = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Ürün sepetten silindi');
    } else {
      toast.error(result.error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Sepetiniz boş');
      return;
    }

    try {
      const originUrl = window.location.origin;
      const { data } = await axios.post(
        `${API_URL}/api/checkout/session`,
        { origin_url: originUrl },
        { withCredentials: true }
      );

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ödeme başlatılamadı');
    }
  };

  if (!user || !user.id) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center" data-testid="cart-page-guest">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="heading-font text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-4">
            Sepetinizi görüntülemek için giriş yapın
          </h2>
          <Link to="/login">
            <Button className="btn-gold px-8 py-4 rounded-md" data-testid="login-prompt-button">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-16 min-h-screen" data-testid="cart-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="heading-font text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-8">
          Sepetim
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-16" data-testid="empty-cart-message">
            <ShoppingBag className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
            <p className="text-[#7A7A7A] text-lg mb-6">Sepetiniz boş</p>
            <Link to="/">
              <Button className="btn-gold px-8 py-4 rounded-md" data-testid="continue-shopping-button">
                Alışverişe Devam Et
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-md p-4 flex gap-4"
                  data-testid={`cart-item-${item.id}`}
                >
                  <Link to={`/product/${item.product.id}`} className="flex-shrink-0">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-24 h-24 object-cover rounded-md"
                    />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/product/${item.product.id}`}>
                      <h3 className="heading-font text-lg md:text-xl font-semibold text-[#1A1A1A] hover:text-[#D4AF37] transition-colors mb-2">
                        {item.product.name}
                      </h3>
                    </Link>
                    <p className="text-[#7A7A7A] text-sm mb-2">{item.product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-[#7A7A7A]">Miktar: {item.quantity}</p>
                        <p className="text-lg font-bold text-[#D4AF37]">
                          {(item.product.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        data-testid={`remove-item-button-${item.id}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-md p-6 sticky top-24">
                <h2 className="heading-font text-2xl font-semibold text-[#1A1A1A] mb-6">
                  Sipariş Özeti
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-[#7A7A7A]">
                    <span>Ara Toplam</span>
                    <span>{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
                  </div>
                  <div className="flex justify-between text-[#7A7A7A]">
                    <span>Kargo</span>
                    <span className="text-green-600">Bedava</span>
                  </div>
                  <div className="border-t border-[#E5E5E5] pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="heading-font text-xl font-semibold text-[#1A1A1A]">Toplam</span>
                      <span className="text-2xl font-bold text-[#D4AF37]" data-testid="cart-total">
                        {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="btn-gold w-full py-6 text-lg font-semibold rounded-md"
                  data-testid="checkout-button"
                >
                  Ödemeye Geç
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
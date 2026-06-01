import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, Phone, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const CartPage = () => {
  const { cart, removeFromCart } = useCart();
  const { user } = useAuth();

  const handleRemove = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Ürün sepetten silindi');
    } else {
      toast.error(result.error);
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
                        <p className="text-base font-semibold text-[#D4AF37]">
                          İletişime Geçin
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
                    <span>Ürün Sayısı</span>
                    <span>{cart.reduce((sum, item) => sum + item.quantity, 0)} adet</span>
                  </div>
                  <div className="border-t border-[#E5E5E5] pt-3 mt-3">
                    <p className="text-center text-[#1A1A1A] font-medium mb-2">
                      Toplam fiyat bilgisi için
                    </p>
                    <p className="heading-font text-xl font-semibold text-[#D4AF37] text-center" data-testid="cart-total">
                      Bizimle İletişime Geçin
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <a
                    href="tel:5549365625"
                    className="btn-gold w-full py-4 text-lg font-semibold rounded-md flex items-center justify-center gap-2 text-white"
                    data-testid="contact-phone-button"
                  >
                    <Phone className="h-5 w-5" strokeWidth={1.5} />
                    0554 936 56 25
                  </a>
                  <a
                    href="mailto:info@mirgold.com"
                    className="w-full py-4 text-lg font-semibold rounded-md border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors flex items-center justify-center gap-2"
                    data-testid="contact-email-button"
                  >
                    <Mail className="h-5 w-5" strokeWidth={1.5} />
                    E-posta Gönder
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;

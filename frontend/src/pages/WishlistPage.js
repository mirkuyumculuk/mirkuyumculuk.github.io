import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { user } = useAuth();

  const handleRemove = async (productId) => {
    const result = await removeFromWishlist(productId);
    if (result.success) {
      toast.success('Favorilerden silindi');
    } else {
      toast.error(result.error);
    }
  };

  if (!user || !user.id) {
    return (
      <div className="min-h-screen pt-20 pb-16 flex items-center justify-center" data-testid="wishlist-page-guest">
        <div className="text-center">
          <Heart className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="heading-font text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-4">
            Favorilerinizi görüntülemek için giriş yapın
          </h2>
          <Link to="/login">
            <Button className="btn-gold px-8 py-4 rounded-md" data-testid="wishlist-login-button">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-16 min-h-screen" data-testid="wishlist-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="heading-font text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-8">
          Favorilerim
        </h1>

        {wishlist.length === 0 ? (
          <div className="text-center py-16" data-testid="empty-wishlist-message">
            <Heart className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
            <p className="text-[#7A7A7A] text-lg mb-6">Favori listeniz boş</p>
            <Link to="/">
              <Button className="btn-gold px-8 py-4 rounded-md" data-testid="browse-products-button">
                Ürünleri İncele
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="category-card rounded-md overflow-hidden card-hover relative"
                data-testid={`wishlist-item-${item.product.id}`}
              >
                <Link to={`/product/${item.product.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${item.product.id}`}>
                    <h3 className="heading-font text-lg md:text-xl font-semibold text-[#1A1A1A] mb-2 hover:text-[#D4AF37] transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-[#7A7A7A] text-sm mb-4 line-clamp-2">{item.product.description}</p>
                  <div className="flex items-center justify-between">
                    <a
                      href="tel:5549365625"
                      className="text-base font-semibold text-[#D4AF37] hover:text-[#B38728]"
                      data-testid={`wishlist-contact-${item.product.id}`}
                    >
                      İletişime Geçin
                    </a>
                    <Button
                      onClick={() => handleRemove(item.product.id)}
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      data-testid={`remove-wishlist-button-${item.product.id}`}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;

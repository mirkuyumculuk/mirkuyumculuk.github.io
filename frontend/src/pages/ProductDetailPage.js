import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, ArrowLeft, Heart, Phone, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'sonner';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/products/${id}`);
      setProduct(data);
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error('Ürün bulunamadı');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user || !user.id) {
      toast.error('Sepete eklemek için giriş yapın');
      navigate('/login');
      return;
    }

    const result = await addToCart(product.id, quantity);
    if (result.success) {
      toast.success('Ürün sepete eklendi');
    } else {
      toast.error(result.error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user || !user.id) {
      toast.error('Favorilere eklemek için giriş yapın');
      return;
    }
    if (isInWishlist(product.id)) {
      const result = await removeFromWishlist(product.id);
      if (result.success) toast.success('Favorilerden çıkarıldı');
    } else {
      const result = await addToWishlist(product.id);
      if (result.success) toast.success('Favorilere eklendi');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="pt-20 md:pt-24 pb-16" data-testid="product-detail-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-[#7A7A7A] hover:text-[#D4AF37]"
          data-testid="back-button"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Geri Dön
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <div className="aspect-square rounded-md overflow-hidden border border-[#E5E5E5]">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
              data-testid="product-image"
            />
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="heading-font text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4" data-testid="product-name">
              {product.name}
            </h1>
            <p className="text-[#7A7A7A] text-base md:text-lg mb-6 leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            <div className="mb-6">
              <span className="text-2xl md:text-3xl font-semibold text-[#D4AF37]" data-testid="product-price">
                Fiyat için iletişime geçin
              </span>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <a
                  href="tel:5549365625"
                  className="flex items-center gap-2 text-[#7A7A7A] hover:text-[#D4AF37] transition-colors"
                  data-testid="product-phone-link"
                >
                  <Phone className="h-5 w-5" strokeWidth={1.5} />
                  <span>0554 936 56 25</span>
                </a>
                <a
                  href="mailto:info@mirgold.com"
                  className="flex items-center gap-2 text-[#7A7A7A] hover:text-[#D4AF37] transition-colors"
                  data-testid="product-email-link"
                >
                  <Mail className="h-5 w-5" strokeWidth={1.5} />
                  <span>info@mirgold.com</span>
                </a>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-[#1A1A1A] mb-2">
                Miktar
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 border-[#E5E5E5]"
                  data-testid="quantity-decrease-button"
                >
                  -
                </Button>
                <span className="text-lg font-semibold text-[#1A1A1A] min-w-[40px] text-center" data-testid="quantity-display">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 border-[#E5E5E5]"
                  data-testid="quantity-increase-button"
                >
                  +
                </Button>
              </div>
              <p className="text-sm text-[#7A7A7A] mt-2" data-testid="stock-info">
                Stok: {product.stock} adet
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                className="btn-gold px-8 py-6 rounded-md text-lg font-semibold flex-1"
                data-testid="add-to-cart-button"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Sepete Ekle
              </Button>
              <Button
                onClick={handleWishlistToggle}
                variant="outline"
                className="px-6 py-6 rounded-md border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
                data-testid="wishlist-button"
              >
                <Heart
                  className={`h-5 w-5 ${product && isInWishlist(product.id) ? 'fill-current' : ''}`}
                  strokeWidth={1.5}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
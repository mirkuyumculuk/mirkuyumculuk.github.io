import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Heart, Search } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

const ProductsPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const categoryTitles = {
    '8k': '8 Ayar Altın',
    '14k': '14 Ayar Altın',
    '21k': '21 Ayar Altın',
    '22k': '22 Ayar Altın'
  };

  useEffect(() => {
    fetchProducts();
  }, [category, sort]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);

      const { data } = await axios.get(`${API_URL}/api/products?${params.toString()}`);
      setProducts(data);
    } catch (error) {
      console.error('Fetch products error:', error);
      toast.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId) => {
    if (!user || !user.id) {
      toast.error('Sepete eklemek için giriş yapın');
      return;
    }

    const result = await addToCart(productId, 1);
    if (result.success) {
      toast.success('Ürün sepete eklendi');
    } else {
      toast.error(result.error);
    }
  };

  const handleWishlistToggle = async (productId) => {
    if (!user || !user.id) {
      toast.error('Favorilere eklemek için giriş yapın');
      return;
    }

    if (isInWishlist(productId)) {
      const result = await removeFromWishlist(productId);
      if (result.success) toast.success('Favorilerden çıkarıldı');
    } else {
      const result = await addToWishlist(productId);
      if (result.success) toast.success('Favorilere eklendi');
    }
  };

  return (
    <div className="pt-20 md:pt-24 pb-16" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="heading-font text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            {categoryTitles[category] || 'Tüm Ürünler'}
          </h1>
          <p className="text-[#7A7A7A] text-base md:text-lg">
            Özenle seçilmiş koleksiyonumuzu keşfedin
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#7A7A7A]" strokeWidth={1.5} />
            <Input
              type="text"
              placeholder="Ürün ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-[#E5E5E5] focus:border-[#D4AF37]"
              data-testid="search-input"
            />
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-[200px] border-[#E5E5E5]" data-testid="sort-select">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest" data-testid="sort-newest">En Yeni</SelectItem>
              <SelectItem value="name_asc" data-testid="sort-name-asc">İsim (A-Z)</SelectItem>
              <SelectItem value="name_desc" data-testid="sort-name-desc">İsim (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16" data-testid="loading-spinner">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16" data-testid="no-products-message">
            <p className="text-[#7A7A7A] text-lg">
              {search ? 'Aramanıza uygun ürün bulunamadı.' : 'Bu kategoride henüz ürün bulunmamaktadır.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="category-card rounded-md overflow-hidden card-hover relative"
                data-testid={`product-card-${product.id}`}
              >
                <button
                  onClick={() => handleWishlistToggle(product.id)}
                  className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
                  data-testid={`wishlist-toggle-${product.id}`}
                >
                  <Heart
                    className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-[#7A7A7A]'}`}
                    strokeWidth={1.5}
                  />
                </button>
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="heading-font text-lg md:text-xl font-semibold text-[#1A1A1A] mb-2 hover:text-[#D4AF37] transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-[#7A7A7A] text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <a
                      href="tel:5549365625"
                      className="text-base font-semibold text-[#D4AF37] hover:text-[#B38728] transition-colors"
                      data-testid={`contact-price-${product.id}`}
                    >
                      İletişime Geçin
                    </a>
                    <Button
                      onClick={() => handleAddToCart(product.id)}
                      className="btn-gold px-4 py-2 rounded-md"
                      data-testid={`add-to-cart-button-${product.id}`}
                    >
                      <ShoppingCart className="h-4 w-4" />
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

export default ProductsPage;

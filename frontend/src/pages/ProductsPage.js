import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { toast } from 'sonner';

const ProductsPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const categoryTitles = {
    '8k': '8 Ayar Altın',
    '14k': '14 Ayar Altın',
    '21k': '21 Ayar Altın',
    '22k': '22 Ayar Altın'
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/products?category=${category}`);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20" data-testid="loading-spinner">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  return (
    <div className="pt-20 md:pt-24 pb-16" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="heading-font text-3xl sm:text-4xl md:text-5xl font-bold text-[#1A1A1A] mb-4">
            {categoryTitles[category] || 'Tüm Ürünler'}
          </h1>
          <p className="text-[#7A7A7A] text-base md:text-lg">
            Özenle seçilmiş koleksiyonumuzu keşfedin
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16" data-testid="no-products-message">
            <p className="text-[#7A7A7A] text-lg">Bu kategoride henüz ürün bulunmamaktadır.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="category-card rounded-md overflow-hidden card-hover"
                data-testid={`product-card-${product.id}`}
              >
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
                    <span className="text-2xl font-bold text-[#D4AF37]">
                      {product.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
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
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Package, User } from 'lucide-react';

const AccountPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/orders`, {
        withCredentials: true
      });
      setOrders(data);
    } catch (error) {
      console.error('Fetch orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'confirmed': 'Onaylandı',
      'processing': 'İşleniyor',
      'shipped': 'Kargoya Verildi',
      'delivered': 'Teslim Edildi',
      'cancelled': 'İptal Edildi'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'confirmed': 'text-green-600 bg-green-50',
      'processing': 'text-blue-600 bg-blue-50',
      'shipped': 'text-purple-600 bg-purple-50',
      'delivered': 'text-green-700 bg-green-100',
      'cancelled': 'text-red-600 bg-red-50'
    };
    return colorMap[status] || 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="pt-20 md:pt-24 pb-16 min-h-screen" data-testid="account-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="heading-font text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-8">
          Hesabım
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-md p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#BF953F] to-[#B38728] flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="heading-font text-xl font-semibold text-[#1A1A1A]" data-testid="user-name">
                    {user?.name}
                  </h2>
                  <p className="text-[#7A7A7A] text-sm" data-testid="user-email">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-t border-[#E5E5E5]">
                  <span className="text-[#7A7A7A]">Toplam Sipariş</span>
                  <span className="font-semibold text-[#1A1A1A]" data-testid="total-orders-count">{orders.length}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="heading-font text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-6">
              Sipariş Geçmişim
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-16" data-testid="loading-spinner">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16 bg-[#FAFAFA] border border-[#E5E5E5] rounded-md" data-testid="no-orders-message">
                <Package className="h-16 w-16 text-[#D4AF37] mx-auto mb-4" />
                <p className="text-[#7A7A7A] text-lg">Henüz siparişiniz bulunmamaktadır</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-md p-6"
                    data-testid={`order-card-${order.id}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-[#7A7A7A]">Sipariş No</p>
                        <p className="font-mono text-sm text-[#1A1A1A]" data-testid={`order-id-${order.id}`}>
                          {order.id.substring(0, 8).toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}
                          data-testid={`order-status-${order.id}`}
                        >
                          {getStatusText(order.status)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-[#7A7A7A]">
                            {item.name} x {item.quantity}
                          </span>
                          <span className="text-[#1A1A1A] font-medium">
                            {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-[#E5E5E5] pt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-[#7A7A7A]">Tarih</p>
                        <p className="text-sm text-[#1A1A1A]">
                          {new Date(order.created_at).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-[#7A7A7A]">Toplam</p>
                        <p className="text-xl font-bold text-[#D4AF37]" data-testid={`order-total-${order.id}`}>
                          {order.total_amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
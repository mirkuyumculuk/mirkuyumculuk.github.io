import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useCart } from '../context/CartContext';

const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('checking');
  const [transaction, setTransaction] = useState(null);
  const attemptsRef = useRef(0);
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  const sessionId = searchParams.get('session_id');

  const pollPaymentStatus = useCallback(async () => {
    const maxAttempts = 5;
    const pollInterval = 2000;

    if (attemptsRef.current >= maxAttempts) {
      setStatus('timeout');
      return;
    }

    try {
      const { data } = await axios.get(
        `${API_URL}/api/checkout/status/${sessionId}`,
        { withCredentials: true }
      );

      setTransaction(data);

      if (data.payment_status === 'paid') {
        setStatus('success');
        clearCart();
        return;
      } else if (data.status === 'expired') {
        setStatus('expired');
        return;
      }

      attemptsRef.current += 1;
      setTimeout(pollPaymentStatus, pollInterval);
    } catch (error) {
      console.error('Payment status check error:', error);
      setStatus('error');
    }
  }, [API_URL, sessionId, clearCart]);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }
    pollPaymentStatus();
  }, [sessionId, navigate, pollPaymentStatus]);

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center" data-testid="checkout-success-page">
      <div className="max-w-2xl w-full mx-4">
        {status === 'checking' && (
          <div className="text-center" data-testid="payment-checking">
            <Loader className="h-16 w-16 text-[#D4AF37] mx-auto mb-4 animate-spin" />
            <h2 className="heading-font text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-2">
              Ödemeniz kontrol ediliyor...
            </h2>
            <p className="text-[#7A7A7A]">Lütfen bekleyin</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center bg-white p-8 md:p-10 rounded-md border border-[#E5E5E5]" data-testid="payment-success">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="heading-font text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              Ödeme Başarılı!
            </h1>
            <p className="text-[#7A7A7A] text-lg mb-6">
              Siparişiniz alındı. Teşekkür ederiz!
            </p>

            {transaction && (
              <div className="bg-[#FAFAFA] p-6 rounded-md mb-6 text-left">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#7A7A7A]">Toplam Tutar</span>
                    <span className="font-semibold text-[#1A1A1A]" data-testid="payment-amount">
                      {transaction.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7A7A7A]">Durum</span>
                    <span className="text-green-600 font-semibold" data-testid="payment-status">Ödendi</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/account">
                <Button className="btn-gold px-8 py-4 rounded-md w-full sm:w-auto" data-testid="view-orders-button">
                  Siparişlerim
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="px-8 py-4 rounded-md w-full sm:w-auto border-[#E5E5E5]" data-testid="continue-shopping-button">
                  Alışverişe Devam Et
                </Button>
              </Link>
            </div>
          </div>
        )}

        {status === 'timeout' && (
          <div className="text-center bg-white p-8 md:p-10 rounded-md border border-[#E5E5E5]" data-testid="payment-timeout">
            <h2 className="heading-font text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-4">
              Ödeme Kontrol Edilemedi
            </h2>
            <p className="text-[#7A7A7A] mb-6">
              Lütfen hesabınızdan sipariş durumunu kontrol edin.
            </p>
            <Link to="/account">
              <Button className="btn-gold px-8 py-4 rounded-md" data-testid="check-orders-button">
                Siparişlerime Git
              </Button>
            </Link>
          </div>
        )}

        {status === 'expired' && (
          <div className="text-center bg-white p-8 md:p-10 rounded-md border border-[#E5E5E5]" data-testid="payment-expired">
            <h2 className="heading-font text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-4">
              Ödeme Süresi Doldu
            </h2>
            <p className="text-[#7A7A7A] mb-6">
              Ödeme oturumunuz sona erdi. Lütfen tekrar deneyin.
            </p>
            <Link to="/cart">
              <Button className="btn-gold px-8 py-4 rounded-md" data-testid="retry-payment-button">
                Sepete Dön
              </Button>
            </Link>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center bg-white p-8 md:p-10 rounded-md border border-[#E5E5E5]" data-testid="payment-error">
            <h2 className="heading-font text-2xl md:text-3xl font-semibold text-[#1A1A1A] mb-4">
              Bir Hata Oluştu
            </h2>
            <p className="text-[#7A7A7A] mb-6">
              Ödeme durumunuz kontrol edilemedi. Lütfen tekrar deneyin.
            </p>
            <Link to="/cart">
              <Button className="btn-gold px-8 py-4 rounded-md" data-testid="retry-checkout-button">
                Tekrar Dene
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const isLogin = location.pathname === '/login';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!isLogin && !acceptTerms) {
      toast.error('Lütfen koşulları kabul edin');
      setLoading(false);
      return;
    }

    try {
      const result = isLogin
        ? await login(formData.email, formData.password)
        : await register(formData.name, formData.email, formData.password);

      if (result.success) {
        toast.success(isLogin ? 'Giriş başarılı' : 'Kayıt başarılı');
        navigate('/');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex items-center justify-center bg-[#FAFAFA]" data-testid="auth-page">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white p-8 md:p-10 rounded-md border border-[#E5E5E5]">
          <h1 className="heading-font text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-2 text-center">
            {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
          </h1>
          <p className="text-[#7A7A7A] text-center mb-8">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-[#1A1A1A] mb-2 block">
                  Ad Soyad
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="border-[#E5E5E5] focus:border-[#D4AF37]"
                  data-testid="name-input"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-[#1A1A1A] mb-2 block">
                E-posta
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="border-[#E5E5E5] focus:border-[#D4AF37]"
                data-testid="email-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#1A1A1A] mb-2 block">
                Şifre
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="border-[#E5E5E5] focus:border-[#D4AF37]"
                data-testid="password-input"
              />
            </div>

            {!isLogin && (
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
                  className="mt-1 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                  data-testid="terms-checkbox"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm text-[#7A7A7A] leading-relaxed cursor-pointer select-none"
                >
                  Kullanım koşullarını ve gizlilik politikasını kabul ediyorum.
                </Label>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-6 text-lg font-semibold rounded-md"
              data-testid="submit-button"
            >
              {loading ? 'Lütfen bekleyin...' : isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#7A7A7A]">
              {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}{' '}
              <Link
                to={isLogin ? '/register' : '/login'}
                className="text-[#D4AF37] hover:text-[#B38728] font-semibold"
                data-testid="auth-toggle-link"
              >
                {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
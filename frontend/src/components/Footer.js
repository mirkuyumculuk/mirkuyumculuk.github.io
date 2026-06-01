import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#FAFAFA] py-12 md:py-24 mt-20" data-testid="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h3 className="logo-font text-3xl md:text-4xl font-black gold-gradient mb-4">
              MIR
            </h3>
            <p className="text-[#7A7A7A] text-sm md:text-base leading-relaxed">
              Yıllardır kaliteli altın takıların en güvenilir adresi. Özel tasarımlar ve mükemmel işçilik.
            </p>
          </div>

          <div>
            <h4 className="heading-font text-xl md:text-2xl font-semibold text-[#1A1A1A] mb-4">
              İletişim
            </h4>
            <div className="space-y-3">
              <a
                href="tel:5549365625"
                className="flex items-center gap-3 text-[#7A7A7A] hover:text-[#D4AF37] transition-colors"
                data-testid="footer-phone-link"
              >
                <Phone className="h-5 w-5" strokeWidth={1.5} />
                <span>0554 936 56 25</span>
              </a>
              <a
                href="mailto:info@mirgold.com"
                className="flex items-center gap-3 text-[#7A7A7A] hover:text-[#D4AF37] transition-colors"
                data-testid="footer-email-link"
              >
                <Mail className="h-5 w-5" strokeWidth={1.5} />
                <span>info@mirgold.com</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="heading-font text-xl md:text-2xl font-semibold text-[#1A1A1A] mb-4">
              Kategoriler
            </h4>
            <div className="space-y-2">
              <a
                href="/products/8k"
                className="block text-[#7A7A7A] hover:text-[#D4AF37] transition-colors"
                data-testid="footer-8k-link"
              >
                8 Ayar Altın
              </a>
              <a
                href="/products/14k"
                className="block text-[#7A7A7A] hover:text-[#D4AF37] transition-colors"
                data-testid="footer-14k-link"
              >
                14 Ayar Altın
              </a>
              <a
                href="/products/21k"
                className="block text-[#7A7A7A] hover:text-[#D4AF37] transition-colors"
                data-testid="footer-21k-link"
              >
                21 Ayar Altın
              </a>
              <a
                href="/products/22k"
                className="block text-[#7A7A7A] hover:text-[#D4AF37] transition-colors"
                data-testid="footer-22k-link"
              >
                22 Ayar Altın
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#E5E5E5] text-center">
          <p className="text-[#7A7A7A] text-sm">
            &copy; {new Date().getFullYear()} MIR Gold. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
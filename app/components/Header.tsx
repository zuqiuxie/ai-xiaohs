'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const t = useTranslations('common');

  useEffect(() => {
    const handleScroll = () => {
      const shouldShowBackground = window.scrollY > 0;
      setIsScrolled(shouldShowBackground);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset + 50;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-sm bg-gradient-to-br from-rose-50/80 via-purple-50/80 to-blue-50/80 border-b border-gray-100'
          : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo area */}
          <div className="flex items-center gap-2">
            <Image src="/favicon.ico" alt="Logo" width={24} height={24} className="w-6 h-6" />
            <span className="text-lg font-medium bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </div>

          {/* Navigation area */}
          <nav className="flex items-center gap-3 sm:gap-8">
            <button
              onClick={() => scrollToSection('user-examples')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              {t('examples')}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              {t('features')}
            </button>
            <button
              onClick={() => scrollToSection('guide')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              {t('guide')}
            </button>

            <button
              onClick={() => scrollToSection('pricing')}
              className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors">
              {t('pricing')}
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Contact button */}
            <div className="relative">
              <button
                onMouseEnter={() => setShowQRCode(true)}
                onMouseLeave={() => setShowQRCode(false)}
                className="px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500
                         text-white text-xs sm:text-sm font-medium transition-all duration-300
                         hover:shadow-lg hover:scale-105 active:scale-95">
                {t('contact')}
              </button>

              {showQRCode && (
                <div className="absolute right-0 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-100">
                  <div className="relative w-32 h-32">
                    <Image src="/wechat.jpg" alt="WeChat QR Code" fill className="object-cover rounded-lg" />
                  </div>
                  <p className="mt-2 text-xs text-center text-gray-500">{t('scanQRCode')}</p>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

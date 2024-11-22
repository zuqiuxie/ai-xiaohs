'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Header() {
  // 添加状态来控制背景色
  const [isScrolled, setIsScrolled] = useState(false);

  // 监听滚动事件
  useEffect(() => {
    const handleScroll = () => {
      // 只要有滚动就显示背景色
      const shouldShowBackground = window.scrollY > 0;
      setIsScrolled(shouldShowBackground);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80; // 头部高度补偿
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset + 50;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-sm bg-gradient-to-br from-rose-50/80 via-purple-50/80 to-blue-50/80 border-b border-gray-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 左侧 Logo 区域 */}
          <div className="flex items-center gap-2">
            <Image
              src="/favicon.ico"
              alt="Logo"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="text-lg font-medium bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              小红书助手
            </span>
          </div>

          {/* 右侧导航区域 */}
          <nav className="flex items-center gap-8">
            <button
              onClick={() => scrollToSection('features')}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              功能特点
            </button>
            <button
              onClick={() => scrollToSection('guide')}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              使用说明
            </button>
            <button
              onClick={() => scrollToSection('faq')}
              className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
              常见问题
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}

'use client';

import { CheckIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';


export default function PricingSection() {
  const [showPayModal, setShowPayModal] = useState(false);
  const t = useTranslations('editor');

  const tiers = [
    {
      name: t('pricingBasic'),
      id: 'basic',
      price: '¥9.9',
      period: t('pricingPeriod'),
      description: t('pricingBasicDesc'),
      features: [
        t('pricingBasicFeature1'),
        t('pricingBasicFeature2'),
        t('pricingBasicFeature3'),
        t('pricingBasicFeature4'),
        t('pricingBasicFeature5'),
      ],
      buttonText: t('pricingBasicButton'),
      buttonStyle: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    },
    {
      name: t('pricingPro'),
      id: 'pro',
      price: '¥19.9',
      period: t('pricingPeriod'),
      description: t('pricingProDesc'),
      features: [
        t('pricingProFeature1'),
        t('pricingProFeature2'),
        t('pricingProFeature3'),
        t('pricingProFeature4'),
        t('pricingProFeature5'),
        t('pricingProFeature6'),
      ],
      buttonText: t('pricingProButton'),
      buttonStyle: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600',
      mostPopular: true,
    },
  ];

  return (
    <div id="pricing" className="relative px-4 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-center mb-4">{t('pricingTitle')}</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{t('pricingSubtitle')}</p>
        </div>
        <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:gap-x-8 xl:gap-x-12">
          {tiers.map(tier => (
            <div
              key={tier.id}
              className={`rounded-3xl p-8 ring-1 ring-gray-200 ${
                tier.mostPopular ? 'bg-gray-50 shadow-md relative' : 'bg-white'
              }`}>
              {tier.mostPopular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-1 text-sm font-medium text-white">
                  {t('pricingPopular')}
                </span>
              )}
              <h3 className="text-lg font-semibold leading-8 text-gray-900">{tier.name}</h3>
              <p className="mt-2 text-sm leading-6 text-gray-600">{tier.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">{tier.price}</span>
                <span className="text-sm font-semibold leading-6 text-gray-600">{tier.period}</span>
              </p>
              <button
                onClick={() => setShowPayModal(true)}
                className={`mt-6 w-full rounded-lg px-4 py-2.5 text-sm font-semibold leading-6 shadow-sm transition-all duration-200 ${tier.buttonStyle}`}>
                {tier.buttonText}
              </button>
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {tier.features.map(feature => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-blue-500" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 支付二维码弹窗 */}
      {showPayModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowPayModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            {/* 标题 */}
            <h3 className="text-xl font-semibold text-center mb-4">{t('pricingQRCodeTitle')}</h3>

            {/* 赞赏码图片 */}
            <div className="relative w-64 h-64 mx-auto">
              <Image src="/wechatpay.jpg" alt="微信赞赏码" fill className="object-contain rounded-lg" />
            </div>

            {/* 提示文字 */}
            <p className="text-gray-600 text-center mt-4 text-sm">{t('pricingQRCodeDesc')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

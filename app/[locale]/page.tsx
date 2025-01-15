import XhsEditor from '../components/XhsEditor';
import { IconBulb, IconShield, IconTool, IconMessage } from '../components/Icons';
import Header from '../components/Header';
import UserExamples from '../components/UserExamples';
import PricingSection from '../components/PricingSection';
import Footer from '../components/Footer';
import { useTranslations } from 'next-intl';

export const dynamic = 'force-dynamic';

export default function Home() {
  const t = useTranslations('common');

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50">
        <Header />

        {/* 编辑器区域 */}
        <div className="relative">
          <XhsEditor />
        </div>

        {/* 用户案例 */}
        <div className="relative py-16 bg-white/40" id="user-examples">
          <h2 className="text-3xl font-bold text-center mb-4">{t('examples')}</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{t('examplesDescription')}</p>
          <UserExamples />
        </div>

        {/* 功能特点 */}
        <div className="relative px-4 py-16" id="features">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">{t('features')}</h2>
            <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">{t('featuresDescription')}</p>

            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <FeatureCard icon={<IconBulb />} title={t('feature1Title')} description={t('feature1Description')} />
              <FeatureCard icon={<IconTool />} title={t('feature2Title')} description={t('feature2Description')} />
              <FeatureCard icon={<IconMessage />} title={t('feature3Title')} description={t('feature3Description')} />
              <FeatureCard icon={<IconShield />} title={t('feature4Title')} description={t('feature4Description')} />
            </div>
          </div>
        </div>

        {/* 使用说明 */}
        <div className="relative py-16 bg-white/40" id="guide">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">{t('guide')}</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">{t('guideDescription')}</p>

            <div className="mb-12">
              <h3 className="text-xl font-semibold text-center mb-8 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                {t('inspirationMode')}
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <GuideCard number="01" title={t('step1Title')} description={t('step1Description')} />
                <GuideCard number="02" title={t('step2Title')} description={t('step2Description')} />
                <GuideCard number="03" title={t('step3Title')} description={t('step3Description')} />
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-center mb-8 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                {t('hotPostMode')}
              </h3>
              <div className="grid md:grid-cols-4 gap-8">
                <GuideCard number="01" title={t('hotStep1Title')} description={t('hotStep1Description')} />
                <GuideCard number="02" title={t('hotStep2Title')} description={t('hotStep2Description')} />
                <GuideCard number="03" title={t('hotStep3Title')} description={t('hotStep3Description')} />
                <GuideCard number="04" title={t('hotStep4Title')} description={t('hotStep4Description')} />
              </div>
            </div>
          </div>
        </div>

        <PricingSection />
      </main>
      <Footer />
    </>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md hover:bg-white/80 transition-all duration-300 border border-gray-100">
      <div className="w-12 h-12 mx-auto mb-5 text-blue-500 transform group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2.5 text-center">{title}</h3>
      <p className="text-gray-600 text-center text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function GuideCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="group p-6 bg-white/60 backdrop-blur-sm rounded-xl hover:shadow-md transition-all duration-300 border border-gray-100/50">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
          {number}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-blue-100 to-purple-100"></div>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '../i18n/client';
import { locales } from '../config/i18n';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <select
      onChange={e => handleChange(e.target.value)}
      value={locale}
      className="bg-transparent border border-gray-300 rounded px-2 py-1 text-sm">
      {locales.map(loc => (
        <option key={loc} value={loc}>
          {loc === 'zh' ? '中文' : 'English'}
        </option>
      ))}
    </select>
  );
}

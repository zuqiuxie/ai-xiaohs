import createMiddleware from 'next-intl/middleware';
import { locales } from './app/config/i18n';

export default createMiddleware({
  locales,
  defaultLocale: 'zh',
  localePrefix: 'always'
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)']
};

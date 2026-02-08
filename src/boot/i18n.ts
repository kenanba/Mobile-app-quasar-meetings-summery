import { boot } from 'quasar/wrappers';
import { createI18n } from 'vue-i18n';

import en from 'src/i18n/en';
import de from 'src/i18n/de';

const savedLocale = localStorage.getItem('quasar_memo_locale') || 'en';

const i18n = createI18n({
  legacy: false,
  locale: savedLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    de,
  },
});

export default boot(({ app }) => {
  app.use(i18n);
});

export { i18n };

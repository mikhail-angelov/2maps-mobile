import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import i18nextReactNative from 'i18next-react-native-language-detector'
import translationRU from './app/locales/ru/translation.json'
import translationEN from './app/locales/en/translation.json'

i18n
  .use(i18nextReactNative)
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    compatibilityJSON: 'v1',
    fallbackLng: 'en',
    debug: true,
    resources: {
      ru: {
        translation: translationRU
      },
      en: {
        translation: translationEN
      },
    },
  });

export default i18n;
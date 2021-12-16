import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import i18nextReactNative from 'i18next-react-native-language-detector'

i18n
  .use(i18nextReactNative)
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    compatibilityJSON: 'v1',
    fallbackLng: i18n.locale,
    lng: i18n.locale,
    debug: true,
    resources: {
      ru: {
        translation: {
          Tracks: 'Треки',
        },
      },
      en: {
        translation: {
          Tracks: 'Tracks',
        },
      },
    },
  });


export default i18n;
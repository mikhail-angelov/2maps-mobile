import { Alert, Linking } from "react-native";
import i18next from 'i18next';

export const makeDonation = async() => {
    const url = "https://yoomoney.ru/quickpay/shop-widget?writer=seller&targets=%D0%9D%D0%B0%20%D1%80%D0%B0%D0%B7%D0%B2%D0%B8%D1%82%D0%B8%D0%B5%202map&targets-hint=&default-sum=100&button-text=11&payment-type-choice=on&hint=&successURL=&quickpay=shop&account=41001740466845"
    const supported = await Linking.canOpenURL(url);
    if (supported) {
        await Linking.openURL(url);
    } else {
        Alert.alert(`${i18next.t('Don\'t know how to open this URL')}: ${url}`);
    }
  }
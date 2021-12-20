import {Alert, Platform} from 'react-native';
import RNIap, {InAppPurchase, SubscriptionPurchase} from 'react-native-iap';
import {ActionTypeEnum, AppThunk} from '.';
import i18next from 'i18next';
import * as _ from 'lodash';

const itemSkus = Platform.select({
  ios: [],
  android: [
    'android.test.purchased',
    //'android.test.canceled',
    //'android.test.refunded',
    //'android.test.item_unavailable',
  ],
});

export const requestPurchase = async () => {
  if (!itemSkus) return;
  const products = await RNIap.getProducts(itemSkus);
  if (_.isEmpty(products)) {
    return Alert.alert(i18next.t('No one available product!'));
  }
  const sku = products?.[0].productId || '';
  try {
    await RNIap.requestPurchase(sku);
  } catch (err: any) {
    console.warn(err.code, err.message);
  }
};

export const restorePurchaseAction = (): AppThunk => {
  return async dispatch => {
    const purchases = await RNIap.getAvailablePurchases();
    console.info('Available purchases', purchases);
    if (purchases && purchases.length) {
      dispatch(completeSuccessPurchaseAction(purchases[0]));
      Alert.alert(i18next.t('Purchases are restored successfully!'));
    } else {
      dispatch(completeSuccessPurchaseAction(null));
      Alert.alert(i18next.t("You don't have any purchases!"));
    }
  };
};

export const completeSuccessPurchaseAction = (
  purchase: InAppPurchase | SubscriptionPurchase | null,
) => ({type: ActionTypeEnum.SuccessPurchase, payload: purchase});

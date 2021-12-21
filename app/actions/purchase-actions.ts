import {Alert, Platform} from 'react-native';
import RNIap, {InAppPurchase, SubscriptionPurchase} from 'react-native-iap';
import {ActionTypeEnum, AppThunk} from '.';
import i18next from 'i18next';
import * as _ from 'lodash';
import Config from 'react-native-config';

const itemSkus = Platform.select({
  ios: [],
  android: [
    Config.ANDROID_PURCHASE_APP_ID,
    //'android.test.purchased',
    //'android.test.canceled',
    //'android.test.refunded',
    //'android.test.item_unavailable',
  ],
});

export const requestPurchase = async () => {
  if (!itemSkus) {
    return;
  }
  const [purchases, products] = await Promise.all([
    RNIap.getAvailablePurchases(),
    RNIap.getProducts(itemSkus),
  ]);
  const purchaseProductId = _.get(purchases, '[0].productId', null);
  const availableProductId = _.get(products, '[0].productId', undefined);
  if (_.isEqual(purchaseProductId, availableProductId)) {
    return Alert.alert(i18next.t('You already bought the app!'));
  }

  if (_.isEmpty(availableProductId)) {
    return Alert.alert(i18next.t('No Products Available'));
  }
  try {
    await RNIap.requestPurchase(availableProductId);
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
      Alert.alert(
        i18next.t('Successfully restored purchases!', {
          count: purchases.length,
        }),
      );
    } else {
      dispatch(completeSuccessPurchaseAction(null));
      Alert.alert(i18next.t("Looks like you haven't purchased anything"));
    }
  };
};

export const completeSuccessPurchaseAction = (
  purchase: InAppPurchase | SubscriptionPurchase | null,
) => ({type: ActionTypeEnum.SuccessPurchase, payload: purchase});

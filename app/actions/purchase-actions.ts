import {Alert, NativeModules, Platform} from 'react-native';
import RNIap, {InAppPurchase} from 'react-native-iap';
import {ActionTypeEnum, AppThunk} from '.';
import i18next from 'i18next';
import * as _ from 'lodash';

export const requestPurchase = async () => {
  const isTestDevice = await NativeModules.MapsModule.isTestDevice()
  if (isTestDevice) {
    return
  }
  const itemSkus =
    Platform.select({
      ios: [''],
      android: [process.env.ANDROID_PURCHASE_ITEM_SKU || 'disable_ads'],
    }) || ['disable_ads'];
  try {
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
      await RNIap.requestPurchase(availableProductId);
  } catch (err: any) {
    console.log(err.code, err.message);
    Alert.alert(
      i18next.t('Something goes wrong :('),
      i18next.t('Please try one more time'),
    );
  }
};

export const restorePurchaseAction = (): AppThunk => {
  return async dispatch => {
    try {
      const purchases = await RNIap.getAvailablePurchases();
      console.info('Available purchases', purchases);
      if (purchases && purchases.length) {
        dispatch(setPurchasesAction(purchases));
        Alert.alert(
          i18next.t('Successfully restored purchases!', {
            count: purchases.length,
          }),
        );
      } else {
        dispatch(setPurchasesAction(undefined));
        Alert.alert(i18next.t("Looks like you haven't purchased anything"));
      }
    } catch (e) {
      console.log('error restoring purchase', e);
      Alert.alert(
        i18next.t('Something goes wrong :('),
        i18next.t('Please try one more time'),
      );
    }
  };
};

export const addPurchaseAction = (purchase: InAppPurchase) => ({
  type: ActionTypeEnum.AddPurchase,
  payload: purchase,
});

export const setPurchasesAction = (purchases?: InAppPurchase[]) => ({
  type: ActionTypeEnum.SetPurchases,
  payload: purchases,
});

export const setPurchaseConnectionFlagAction = (value : boolean) => ({
  type: ActionTypeEnum.EstablishedPurchaseConnection,
  payload: value,
})
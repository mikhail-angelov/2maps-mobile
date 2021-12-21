import {Alert, EmitterSubscription, Platform} from 'react-native';
import RNIap, {
  InAppPurchase,
  PurchaseError,
  finishTransaction,
  purchaseErrorListener,
  purchaseUpdatedListener,
} from 'react-native-iap';
import {ActionTypeEnum, AppThunk} from '.';
import i18next from 'i18next';
import * as _ from 'lodash';
import Config from 'react-native-config';

let purchaseUpdateSubscription: EmitterSubscription;
let purchaseErrorSubscription: EmitterSubscription;

const itemSkus =
  Platform.select({
    ios: [],
    android: [Config.ANDROID_PURCHASE_APP_ID || ''],
  }) || [];

export const requestPurchase = async () => {
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

export const initGoogleStoreConnectionAction =
  (): AppThunk => async dispatch => {
    try {
      await RNIap.initConnection();
      if (Platform.OS === 'android') {
        await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
      } else {
        await RNIap.clearTransactionIOS();
      }
    } catch (err: any) {
      console.warn(err.code, err.message);
    }
    purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: any) => {
        console.info('purchase', purchase);
        const receipt = purchase.transactionReceipt
          ? purchase.transactionReceipt
          : purchase.originalJson;

        if (receipt) {
          try {
            const ackResult = await finishTransaction(purchase);
            console.info('ackResult', ackResult);
            dispatch(addPurchaseAction(purchase));
          } catch (ackErr) {
            console.warn('ackErr', ackErr);
          }
        }
      },
    );

    purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        console.log('purchaseErrorListener', error);
        Alert.alert('Purchase error', error?.message || '');
      },
    );
  };

export const closeGoogleStoreConnection = async () => {
  if (purchaseUpdateSubscription) {
    purchaseUpdateSubscription.remove();
  }
  if (purchaseErrorSubscription) {
    purchaseErrorSubscription.remove();
  }
  RNIap.endConnection();
};

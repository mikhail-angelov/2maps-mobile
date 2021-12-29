import React, { FC, useEffect } from 'react';
import { Alert, EmitterSubscription, Platform } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { addPurchaseAction, setPurchaseConnectionFlagAction } from '../actions/purchase-actions';
import RNIap, {
    PurchaseError,
    finishTransaction,
    purchaseErrorListener,
    purchaseUpdatedListener,
} from 'react-native-iap';

let purchaseUpdateSubscription: EmitterSubscription | null;
let purchaseErrorSubscription: EmitterSubscription | null;

const mapDispatchToProps = {
    addPurchase: addPurchaseAction,
    setPurchaseConnectionFlag: setPurchaseConnectionFlagAction,
};
const connector = connect(null, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>

const InAppPurchaseManager: FC<Props> = ({ addPurchase, setPurchaseConnectionFlag }) => {
    const initGoogleStoreConnection = async () => {
        try {
            await RNIap.initConnection();
            if (Platform.OS === 'android') {
                await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
            } else {
                await RNIap.clearTransactionIOS();
            }
            setPurchaseConnectionFlag(true)
        } catch (err: any) {
            console.warn(err.code, err.message);
            setPurchaseConnectionFlag(false)
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
                    } catch (ackErr) {
                        console.warn('ackErr', ackErr);
                    }
                    addPurchase(purchase)
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

    const closeGoogleStoreConnection = async () => {
        if (purchaseUpdateSubscription) {
            purchaseUpdateSubscription.remove();
            purchaseUpdateSubscription = null;
        }
        if (purchaseErrorSubscription) {
            purchaseErrorSubscription.remove();
            purchaseErrorSubscription = null;
        }
        await RNIap.endConnection();
    };

    useEffect(() => {
        initGoogleStoreConnection()
        return () => { closeGoogleStoreConnection() }
    }, [])
    return null
}

export default connector(InAppPurchaseManager)
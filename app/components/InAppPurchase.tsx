import React, { FC, useEffect } from 'react';
import {
    Alert,
    Platform,
} from 'react-native';
import RNIap, {
    PurchaseError,
    finishTransaction,
    purchaseErrorListener,
    purchaseUpdatedListener,
} from 'react-native-iap';
import { connect, ConnectedProps } from 'react-redux';
import { completeSuccessPurchaseAction } from '../actions/purchase-actions';

let purchaseUpdateSubscription: any;
let purchaseErrorSubscription: any;

const mapDispatchToProps = {
    completeSuccessPurchase: completeSuccessPurchaseAction,
};
const connector = connect(null, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>

const IAP: FC<Props> = ({ completeSuccessPurchase }) => {
    const init = async () => {
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
                        completeSuccessPurchase(purchase)
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
    }

    useEffect(() => {
        init()
        return () => {
            if (purchaseUpdateSubscription) {
                purchaseUpdateSubscription.remove();
                purchaseUpdateSubscription = null;
            }
            if (purchaseErrorSubscription) {
                purchaseErrorSubscription.remove();
                purchaseErrorSubscription = null;
            }
            RNIap.endConnection()
        }
    }, [])
    return null
}

export default connector(IAP)
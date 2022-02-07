import React, { FC, useEffect } from 'react';
import { Alert, EmitterSubscription, Platform } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { addPurchaseAction } from '../actions/purchase-actions';
import RNIap, {
    PurchaseError,
    finishTransaction,
    purchaseErrorListener,
    purchaseUpdatedListener,
} from 'react-native-iap';
import { checkForTestDevice } from '../actions/auth-actions';

let purchaseUpdateSubscription: EmitterSubscription | null;
let purchaseErrorSubscription: EmitterSubscription | null;

interface ComponentProps {
    setIsPurchaseConnected: (isPurchaseConnected: boolean) => void;
}

const mapDispatchToProps = {
    addPurchase: addPurchaseAction,
};
const connector = connect(null, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & ComponentProps

const InAppPurchaseManager: FC<Props> = ({ addPurchase, setIsPurchaseConnected }) => {
    useEffect(() => {
        let isGoogleStoreConnected = false
        const initGoogleStoreConnection = async () => {
            console.info('initGoogleStoreConnection');
            try {
                await RNIap.initConnection();
                isGoogleStoreConnected = true
                if (Platform.OS === 'android') {
                    await RNIap.flushFailedPurchasesCachedAsPendingAndroid();
                } else {
                    await RNIap.clearTransactionIOS();
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
                setIsPurchaseConnected(true)
            } catch (err: any) {
                console.info(err.code, err.message);
                setIsPurchaseConnected(false)
            }
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
            if (isGoogleStoreConnected) {
                console.info('closeGoogleStoreConnection');
                await RNIap.endConnection();
                isGoogleStoreConnected = false
            }
        };
        checkForTestDevice().then((isTestDeviceResponse: boolean) => {
            if (!isTestDeviceResponse) {
                initGoogleStoreConnection()
            }
        })
        return () => { closeGoogleStoreConnection() }
    }, [])
    return null
}

export default connector(InAppPurchaseManager)
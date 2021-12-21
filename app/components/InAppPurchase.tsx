import React, { FC, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { closeGoogleStoreConnection, initGoogleStoreConnectionAction } from '../actions/purchase-actions';

const mapDispatchToProps = {
    initGoogleStoreConnection: initGoogleStoreConnectionAction,
};
const connector = connect(null, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>

const InAppPurchaseManager: FC<Props> = ({ initGoogleStoreConnection }) => {
    useEffect(() => {
        initGoogleStoreConnection()
        return () => { closeGoogleStoreConnection() }
    }, [])
    return null
}

export default connector(InAppPurchaseManager)
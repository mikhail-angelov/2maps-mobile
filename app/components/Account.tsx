import React, { FC, useCallback } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import { purple } from "../constants/color";
import { selectIsAuthenticated, selectPurchaseConnectionFlag, selectPurchases } from '../reducers/auth'
import { useTranslation } from "react-i18next";
import MapModal from "./Modal";
import { requestPurchase, restorePurchaseAction } from "../actions/purchase-actions";

const mapStateToProps = (state: State) => ({
    isAuthenticated: selectIsAuthenticated(state),
    purchases: selectPurchases(state),
    isPurchaseConnected: selectPurchaseConnectionFlag(state),
});
const mapDispatchToProps = {
    restorePurchase: restorePurchaseAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)

interface AccountProps {
    close: () => void;
    showAuth: () => void;
}

type Props = ConnectedProps<typeof connector> & AccountProps
const Account: FC<Props> = ({ close, showAuth, isAuthenticated, purchases, restorePurchase, isPurchaseConnected }) => {
    const { t } = useTranslation()

    return <MapModal onRequestClose={close}>
        <View style={styles.content}>
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={isAuthenticated ? t('Account') : t('Login')} onPress={showAuth} />
            </View>
            {purchases ? <Text style={styles.subTitle}>{t('Premium version!')}</Text> : <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={t('Purchase')} onPress={requestPurchase} disabled={!isPurchaseConnected} />
            </View>}
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={t('Restore Purchase')} onPress={restorePurchase} disabled={!isPurchaseConnected} />
            </View>
        </View>
    </MapModal>
}

export default connector(Account)


const styles = StyleSheet.create({
    content: {
        width: '100%',
        alignItems: 'flex-start',
    },
    subTitle: {
        marginVertical: 10,
        color: 'black',
        fontSize: 18,
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 10
    },
    btn: {
        paddingHorizontal: 20,
        backgroundColor: purple,
    },
});
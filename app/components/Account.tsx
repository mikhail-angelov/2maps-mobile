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
        <Text style={styles.title}>{t('Manage Account')}</Text>
        <View style={styles.content}>
            {purchases && <Text style={styles.subTitle}>{t('Premium version!')}</Text> }
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={isAuthenticated ? t('Account') : t('Login')} onPress={showAuth} />
            </View>
            {!purchases && 
                <View style={styles.row}>
                    <Button buttonStyle={styles.btn} title={t('Purchase')} onPress={requestPurchase} disabled={!isPurchaseConnected} />
                </View>
            }
            <View style={styles.lastRow}>
                <Button buttonStyle={styles.btn} title={t('Restore Purchase')} onPress={restorePurchase} disabled={!isPurchaseConnected} />
            </View>
        </View>
    </MapModal>
}

export default connector(Account)


const styles = StyleSheet.create({
    title: {
        maxWidth: '90%',
        marginTop: -8,
        marginBottom: 10,
        color: 'black',
        fontSize: 24,
        fontWeight: '700',
    },
    content: {
        width: '100%',
        marginTop: 10,
    },
    subTitle: {
        width: '100%',
        marginBottom: 20,
        color: 'black',
        fontSize: 18,
    },
    row: {
        width: '100%',
        marginBottom: 15,
        flexDirection: 'row',
    },
    lastRow: {
        marginBottom: 0
    },
    btn: {
        paddingHorizontal: 20,
        minWidth: '100%',
        backgroundColor: purple,
    },
});
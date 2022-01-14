import React, { FC, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import { logoutAction } from "../actions/auth-actions";
import {selectUser} from '../reducers/auth'
import ChangePassword from "./ChangePassword";
import { useTranslation } from "react-i18next";
import { purple, red } from "../constants/color";

const mapStateToProps = (state: State) => ({
    user: selectUser(state)
});
const mapDispatchToProps = {
    logout: logoutAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector>
const Settings: FC<Props> = ({ logout, user }: Props) => {
    const [showChangePassword, setShowChangePassword] = useState(false)
    const { t } = useTranslation()

    return <View style={styles.content} accessibilityLabel={t('Account')}>
        <Text style={styles.title}>{t('Account')}</Text>
        <Text style={styles.subTitle}>{`${t('Hello')} ${user?.email}`}</Text>
        <View style={styles.row}>
        <Button buttonStyle={styles.btn} onPress={() =>setShowChangePassword(true)} title={t('Change Password')} />
        </View>
        <Button titleStyle={styles.inlineBtn} type='clear' onPress={() => logout && logout()} title={t('Logout')} />
        {showChangePassword && <ChangePassword close={() => setShowChangePassword(false)} />}
    </View>
}

export default connector(Settings)


const styles = StyleSheet.create({
    content:{
        width:'100%',
        alignItems:'flex-start',
    },
    title: {
        maxWidth: '90%',
        marginTop: -5,
        marginBottom: 10,
        color: 'black',
        fontSize: 24,
        fontWeight: '700',
    },
    subTitle: {
        marginVertical: 10,
        color: 'black',
        fontSize: 14,
    },
    row: {
        flexDirection:'row',
        justifyContent: 'space-between',
        width:'100%',
        marginBottom: 10,
    },
    btn: {
        // paddingHorizontal: 20,
        backgroundColor: purple,
        minWidth: '100%',
        minHeight: 48,
    },
    inlineBtn: {
        minWidth: '100%',
        color: red,
    }
});
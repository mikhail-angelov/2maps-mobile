import React, { FC, useEffect, useRef, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, TextInput, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import { selectError, selectIsAuthInProgress, selectResetToken } from "../reducers/auth";
import { resetPasswordAction } from "../actions/auth-actions";
import { purple } from "../constants/color";
import MapModal from "./Modal";
import Spinner from "./Spinner";
import { useTranslation } from "react-i18next";

const mapStateToProps = (state: State) => ({
    error: selectError(state),
    resetToken: selectResetToken(state),
    isAuthInProgress: selectIsAuthInProgress(state),
});
const mapDispatchToProps = {
    resetPassword: resetPasswordAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

const PasswordReset: FC<Props> = ({ error, resetPassword, close, resetToken, isAuthInProgress }) => {
    const [password, setPassword] = useState<string>('')
    const inProcess = useRef(false)
    const { t } = useTranslation();

    const onPassword = () => {
        if (resetPassword && resetToken) {
            inProcess.current = true
            resetPassword({
                password, resetToken
            })
        }
    }
    useEffect(() => {
        if (!isAuthInProgress && !error && inProcess.current) {
            close()
        }
    }, [isAuthInProgress])
    useEffect(() => {
        setPassword('')
    }, [resetToken])
    return <MapModal onRequestClose={close}>
        <Spinner show={isAuthInProgress} />
        <View style={styles.content}>
            <Text style={styles.subTitle}>{t('Change your password')}</Text>
            <View style={styles.formField}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.modalInput}
                    onChangeText={(value) => setPassword(value)}
                    placeholder={t('password')}
                    value={password}
                />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} disabled={!password} onPress={onPassword} title={t('Submit')} />
            </View>
        </View>
    </MapModal>
}

const styles = StyleSheet.create({
    content: {
        width: '100%',
    },
    error: {
        color: 'red',
    },
    label: {
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        marginBottom: 10,
    },
    btn: {
        paddingHorizontal: 20,
        backgroundColor: purple,
    },
    formField: {
        flexDirection: 'column',
        display: 'flex',
    },
    subTitle: {
        marginVertical: 10,
        color: 'black',
        fontSize: 20,
    },
    modalInput: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'grey',
        marginBottom: 10,
        width: '100%',
    },
});


export default connector(PasswordReset)
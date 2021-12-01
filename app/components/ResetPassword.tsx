import React, { FC, useEffect, useRef, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, TextInput, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import { selectError, selectIsAuthInProgress, selectResetToken } from "../reducers/auth";
import { changePasswordAction } from "../actions/auth-actions";
import MapModal from "./Modal";
import Spinner from "./Spinner";

const mapStateToProps = (state: State) => ({
    error: selectError(state),
    resetToken: selectResetToken(state),
    isAuthInProgress: selectIsAuthInProgress(state),
});
const mapDispatchToProps = {
    changePassword: changePasswordAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

const PasswordReset: FC<Props> = ({ error, changePassword, close, resetToken, isAuthInProgress }) => {
    const [password, setPassword] = useState<string>('')
    const inProcess = useRef(false)
    const onPassword = () => {
        if (changePassword && resetToken) {
            inProcess.current = true
            changePassword({
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
        <View style={styles.content}>
            <Text style={styles.subTitle}>Change your password</Text>
            <View style={styles.formField}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.modalInput}
                    onChangeText={(value) => setPassword(value)}
                    placeholder="password"
                    value={password}
                />
            </View>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} disabled={!password} onPress={onPassword} title="Submit" />
            </View>
            <Spinner show={isAuthInProgress} />
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
        borderWidth: 1,
        borderColor: 'grey',
        marginBottom: 10,
        width: '100%',
    },
});


export default connector(PasswordReset)
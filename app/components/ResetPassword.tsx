import React, { FC, useEffect, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, TextInput, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import { selectError, selectResetToken } from "../reducers/auth";
import { changePasswordAction } from "../actions/auth-actions";
import MapModal from "./Modal";

const mapStateToProps = (state: State) => ({
    error: selectError(state),
    resetToken: selectResetToken(state),
});
const mapDispatchToProps = {
    changePassword: changePasswordAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

const PasswordReset: FC<Partial<Props>> = ({ error, changePassword, close, resetToken }) => {
    const [password, setPassword] = useState<string>('')
    const onPassword = () => {
        if (changePassword && resetToken) { changePassword({ password, resetToken }) }
    }
    useEffect(()=>{
        setPassword('')
    },[resetToken])
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
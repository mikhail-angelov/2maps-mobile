import React, { FC, useState, useRef, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, TextInput, Text, Pressable, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import { selectIsAuthenticated, selectIsAuthInProgress, selectError } from "../reducers/auth";
import { loginAction, signUpAction, setAuthErrorAction, passwordResetAction } from "../actions/auth-actions";
import Settings from './Settings'
import MapModal from './Modal'

const mapStateToProps = (state: State) => ({
    isAuthenticated: selectIsAuthenticated(state),
    isAuthInProgress: selectIsAuthInProgress(state),
    error: selectError(state),
});
const mapDispatchToProps = {
    login: loginAction,
    signUp: signUpAction,
    setAuthError: setAuthErrorAction,
    passwordReset: passwordResetAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

interface LoginProps {
    setSignUp: () => void;
    setPasswordReset: () => void;
    error?: Props['error'];
    login: Props['login'];
}
const Login: FC<LoginProps> = ({ error, login, setSignUp, setPasswordReset }) => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    return <View style={styles.content}>
        <Text style={styles.subTitle}>Login</Text>
        <View style={styles.formField}>
            <Text style={styles.label}>Email</Text>
            <TextInput
                keyboardType="email-address"
                style={styles.modalInput}
                onChangeText={(value) => setEmail(value)}
                placeholder="email"
                value={email}
            />
        </View>
        <View style={styles.formField}>
            <View style={[styles.passwordWrapper, styles.label]}>
                <Text>Password</Text>
                <Button titleStyle={styles.inlineBtn} type='clear' onPress={setPasswordReset} title="Forgot password?" />
            </View>
            <TextInput
                style={styles.modalInput}
                onChangeText={(value) => setPassword(value)}
                placeholder="password"
                value={password}
            />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.row}>
            <Button buttonStyle={styles.btn} disabled={!email || !password} onPress={() => login({ email, password })} title="Login" />
            <Button buttonStyle={styles.btn} type='clear' onPress={setSignUp} title="Sign Up" />
        </View>
    </View>
}
interface SignUpProps {
    back: () => void;
    signUp: Props['signUp'];
    error?: Props['error'];
    isAuthInProgress: Props['isAuthInProgress'];
}
const SignUp: FC<SignUpProps> = ({ error, signUp, back, isAuthInProgress }) => {
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const inProcess = useRef(false)

    const onSignUp = () => {
        inProcess.current = true
        signUp({ name, email, password })
    }
    useEffect(() => {
        if (!isAuthInProgress && !error && inProcess.current) {
            back && back()
        }
    }, [isAuthInProgress])

    return <View style={styles.content}>
        <Text style={styles.subTitle}>Sign Up</Text>
        <View style={styles.formField}>
            <Text style={styles.label}>Name</Text>
            <TextInput
                style={styles.modalInput}
                onChangeText={(value) => setName(value)}
                placeholder="name"
                value={name}
            />
        </View>
        <View style={styles.formField}>
            <Text style={styles.label}>Email</Text>
            <TextInput
                style={styles.modalInput}
                onChangeText={(value) => setEmail(value)}
                placeholder="email"
                value={email}
            />
        </View>
        <View style={styles.formField}>
            <Text style={styles.label}>Password</Text>
            <TextInput
                style={styles.modalInput}
                onChangeText={(value) => setPassword(value)}
                placeholder="password"
                value={password}
            />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.row}>
            <Button buttonStyle={styles.btn} disabled={!name || !email || !password} onPress={onSignUp} title="Sign Up" />
            <Button buttonStyle={styles.btn} type='clear' onPress={back} title="Back" />
        </View>
    </View>
}

const Auth: FC<Props> = ({ isAuthenticated, isAuthInProgress, error, login, signUp, setAuthError, close, passwordReset }) => {
    const [ui, setUi] = useState<string>('login')
    const authState = useRef(isAuthenticated);
    useEffect(() => {
        console.log('isAuthenticated', isAuthenticated, authState.current)
        setAuthError('')
        if (isAuthenticated !== authState.current) {
            console.log('auth is changed')
            close()
        }
    }, [isAuthenticated])
    console.log('-e-', error)

    let content = <View />
    if (isAuthenticated) {
        content = <Settings close={close} />
    } else if (ui === 'login') {
        content = <Login error={error} login={login} setSignUp={() => setUi('signUp')} setPasswordReset={() => setUi('passwordReset')} />
    } else if (ui === 'signUp') {
        content = <SignUp error={error} signUp={signUp} back={() => setUi('login')} isAuthInProgress={isAuthInProgress} />
    } else if (ui === 'passwordReset') {
        content = <PasswordReset error={error} passwordReset={passwordReset} back={() => setUi('login')} setAuthError={setAuthError} isAuthInProgress={isAuthInProgress} />
    }

    return <MapModal onRequestClose={close}>
        {content}
        {isAuthInProgress && <View style={styles.spinner}>
            <Text>loading...</Text>
        </View>}

    </MapModal>
}
interface PasswordResetProps {
    back: () => void;
    passwordReset: Props['passwordReset'];
    setAuthError: Props['setAuthError'];
    error: Props['error'];
    isAuthInProgress: Props['isAuthInProgress'];
}
const PasswordReset: FC<PasswordResetProps> = ({ error, passwordReset, back, setAuthError, isAuthInProgress }) => {
    const [email, setEmail] = useState<string>('')
    const inProcess = useRef(false)
    const onBack = () => {
        setAuthError('')
        back()
    }
    const onPasswordReset = () => {
        inProcess.current = true
        passwordReset({ email })
    }
    useEffect(() => {
        if (!isAuthInProgress && !error && inProcess.current) {
            back()
        }
    }, [isAuthInProgress])
    return <View style={styles.content}>
        <Text style={styles.subTitle}>Reset your password</Text>
        <View style={styles.formField}>
            <Text style={styles.label}>Enter your user account's verified email address and we will send you a password reset link</Text>
            <TextInput
                keyboardType="email-address"
                style={styles.modalInput}
                onChangeText={(value) => setEmail(value)}
                placeholder="email"
                value={email}
            />
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.row}>
            <Button buttonStyle={styles.btn} disabled={!email} onPress={onPasswordReset} title="Password Reset" />
            <Button buttonStyle={styles.btn} type='clear' onPress={onBack} title="Back" />
        </View>
    </View>
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
    spinner: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.5)'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 20,
        marginBottom: 10,
    },
    buttonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    btn: {
        // paddingHorizontal: 20,
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
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
    passwordWrapper: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    inlineBtn: {
        fontSize: 14,
    }
});


export default connector(Auth)
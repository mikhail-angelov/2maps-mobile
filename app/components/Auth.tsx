import React, { FC, useState, useRef, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, TextInput, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import { selectIsAuthenticated, selectIsAuthInProgress, selectError } from "../reducers/auth";
import { loginAction, signUpAction, setAuthErrorAction, forgetPasswordAction, Credentials, SignUp as SignUpType, PasswordReset as PasswordResetType } from "../actions/auth-actions";
import Settings from './Settings'
import MapModal from './Modal'
import Spinner from "./Spinner";

const mapStateToProps = (state: State) => ({
    isAuthenticated: selectIsAuthenticated(state),
    isAuthInProgress: selectIsAuthInProgress(state),
    error: selectError(state),
});
const mapDispatchToProps = {
    login: loginAction,
    signUp: signUpAction,
    setAuthError: setAuthErrorAction,
    forgetPassword: forgetPasswordAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

interface LoginProps {
    setSignUp: () => void;
    setPasswordReset: () => void;
    error?: string;
    login: (data: Credentials) => void;
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
                secureTextEntry={true}
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
    signUp: (data: SignUpType) => void;
    error?: string;
    isAuthInProgress: boolean;
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
                secureTextEntry={true}
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

const Auth: FC<Props> = ({ isAuthenticated, isAuthInProgress, error, login, signUp, setAuthError, close, forgetPassword }) => {
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
        content = <Settings />
    } else if (ui === 'login') {
        content = <Login error={error} login={login} setSignUp={() => setUi('signUp')} setPasswordReset={() => setUi('passwordReset')} />
    } else if (ui === 'signUp') {
        content = <SignUp error={error} signUp={signUp} back={() => setUi('login')} isAuthInProgress={isAuthInProgress} />
    } else if (ui === 'passwordReset') {
        content = <ForgetPassword error={error} passwordReset={forgetPassword} back={() => setUi('login')} setAuthError={setAuthError} isAuthInProgress={isAuthInProgress} />
    }

    return <MapModal onRequestClose={close}>
        <Spinner show={isAuthInProgress} />
        {content}
    </MapModal>
}
interface PasswordResetProps {
    back: () => void;
    passwordReset: (data: PasswordResetType) => void;
    setAuthError: (error: string) => void;
    error?: string;
    isAuthInProgress: boolean;
}
const ForgetPassword: FC<PasswordResetProps> = ({ error, passwordReset, back, setAuthError, isAuthInProgress }) => {
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
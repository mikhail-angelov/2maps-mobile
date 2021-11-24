import React, { FC, useState, useRef, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, TextInput, Text, Modal, Pressable, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Button } from 'react-native-elements';
import { selectIsAuthenticated, selectIsAuthInProgress, selectError } from "../reducers/auth";
import { loginAction, signUpAction, setAuthErrorAction } from "../actions/auth-actions";
import Settings from './Settings'

const mapStateToProps = (state: State) => ({
    isAuthenticated: selectIsAuthenticated(state),
    isAuthInProgress: selectIsAuthInProgress(state),
    error: selectError(state),
});
const mapDispatchToProps = {
    login: loginAction,
    signUp: signUpAction,
    setAuthError: setAuthErrorAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

const Login: FC<Partial<Props> & { setSignUp: () => void }> = ({ error, login, setSignUp }) => {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    return <View style={styles.content}>
        <Text style={styles.subTitle}>Login</Text>
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
            <Button buttonStyle={styles.btn} disabled={!email || !password} onPress={() => login && login({ email, password })} title="Login" />
            <Button buttonStyle={styles.btn} type='clear' onPress={setSignUp} title="Sign Up" />
        </View>
    </View>
}
const SignUp: FC<Partial<Props> & { back: () => void }> = ({ error, signUp, back }) => {
    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    return <View  style={styles.content}>
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
            <Button buttonStyle={styles.btn} disabled={!name || !email || !password} onPress={() => signUp && signUp({ name, email, password })} title="Sign Up" />
            <Button buttonStyle={styles.btn} type='clear' onPress={back} title="Back" />
        </View>
    </View>
}

const Auth: FC<Props> = ({ isAuthenticated, isAuthInProgress, error, login, signUp, setAuthError, close }) => {
    const [ui, setUi] = useState<string>('login')
    const authState = useRef(isAuthenticated);
    useEffect(() => {
        console.log('isAuthenticated',isAuthenticated, authState.current)
        setAuthError('')
        if (isAuthenticated !== authState.current) {
            console.log('auth is changed')
            close()
        }
    }, [isAuthenticated])
    console.log('-e-', error)

    let content = <View />
    if (isAuthenticated) {
        content = <Settings close={close}/>
    } else if (ui === 'login') {
        content = <Login error={error} login={login} setSignUp={() => setUi('signUp')} />
    } else if (ui === 'signUp') {
        content = <SignUp error={error} signUp={signUp} back={() => setUi('login')} />
    }

    return <Modal
        animationType="fade"
        transparent={true}
        visible
        onRequestClose={close}
    >
        <TouchableWithoutFeedback onPress={close}>
            <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <View style={styles.centeredView} >

            <View style={styles.modalView}>
                {content}
                {isAuthInProgress && <View style={styles.spinner}>
                    <Text>loading...</Text>
                </View>}
                <Pressable
                    style={[styles.button, styles.buttonClose]}
                    onPress={close}
                >
                    <Text style={styles.textStyle}>✕</Text>
                </Pressable>
            </View>
        </View>
    </Modal>
}


const styles = StyleSheet.create({
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        position: 'relative',
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "flex-start",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxWidth: '80%',
        minWidth: '80%',
    },
    content: {
        width: '100%',
    },
    error: {
        color: 'red',
    },
    label: {
        marginBottom:10,
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
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2
    },
    btn: {
        // paddingHorizontal: 20,
    },
    buttonOpen: {
        backgroundColor: "#F194FF",
    },
    buttonClose: {
        backgroundColor: "#2196F3",
        position: "absolute",
        top: 20,
        right: 20,
        width: 40,
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
    formField:{
        flexDirection:'column',
        display:'flex',
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
    }
});


export default connector(Auth)
import React, { FC, useState } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import { View, Text, StyleSheet } from "react-native";
import { Button } from 'react-native-elements';
import QR from './QR'
import { logoutAction } from "../actions/auth-actions";
import { syncMarksAction } from "../actions/marks-actions";
import {selectUser} from '../reducers/auth'


const mapStateToProps = (state: State) => ({
    user: selectUser(state)
});
const mapDispatchToProps = {
    logout: logoutAction,
    syncMarks: syncMarksAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }
const Settings: FC<Props> = ({ logout, syncMarks, user, close }) => {
    const [showQRReader, setShowQRReader] = useState(false)


    return <View style={styles.content}>
        <Text style={styles.subTitle}>{`Hello ${user?.email}`}</Text>
        <View style={styles.row}>
        <Button buttonStyle={styles.btn} onPress={syncMarks} title="Sync markers" />
        <Button buttonStyle={styles.btn} onPress={() => setShowQRReader(true)} title="Download map" disabled/>
        </View>
        <Button buttonStyle={styles.btn} type='clear' onPress={() => logout && logout()} title="Logout" />
        {showQRReader && <QR close={() => setShowQRReader(false)} select={() => { }} />}
    </View>
}

export default connector(Settings)


const styles = StyleSheet.create({
    content:{
        width:'100%',
        alignItems:'flex-start',
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
    },
});
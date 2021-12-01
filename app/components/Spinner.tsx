import React, { FC } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";

interface Props {
    show: boolean;
}

const Spinner: FC<Props> = ({ show }) => {
    if (!show) return null
    return (<View style={styles.spinner}>
        <ActivityIndicator size="large" color="#2196F3" />
    </View>)
}

const styles = StyleSheet.create({
    spinner: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.5)',
        flex: 1,
        justifyContent: "center",
        zIndex: 9999,
    }
})

export default Spinner
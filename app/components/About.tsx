import React, { FC, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Button } from 'react-native-elements';
import { useTranslation } from "react-i18next";
import MapModal from "./Modal";
import { CONTACT_EMAIL, HELP_URL, TERMS_URL } from "../actions/api";

interface AboutProps {
    close: () => void;
}

const About: FC<AboutProps> = ({ close }) => {
    const { t, i18n } = useTranslation()
    return <MapModal onRequestClose={close}>
        <View style={styles.content}>
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={t('Contact Developer')} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} />
            </View>
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={t('Terms of the Service')} onPress={() => Linking.openURL(`${TERMS_URL}?lang=${i18n.language}`)} />
            </View>
            <View style={styles.lastRow}>
                <Button buttonStyle={styles.btn} title={t('Help')} onPress={() => Linking.openURL(`${HELP_URL}?lang=${i18n.language}`)} />
            </View></View>
    </MapModal>
}

export default About

const styles = StyleSheet.create({
    content: {
        width: '100%',
        marginTop: 40,
    },
    row: {
        width: '100%',
        marginBottom: 15
    },
    lastRow: {
        marginBottom: 0
    },
    btn: {
        paddingHorizontal: 20,
        width: '100%',
    },
});
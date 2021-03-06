import React, { FC, useEffect, useState } from "react";
import { View, Text, StyleSheet, Linking, NativeModules } from "react-native";
import { Button } from 'react-native-elements';
import { useTranslation } from "react-i18next";
import MapModal from "./Modal";
import { CONTACT_EMAIL, HELP_URL, PRIVACY_POLICY_EN_URL, PRIVACY_POLICY_RU_URL, TERMS_OF_SERVICE_EN_URL, TERMS_OF_SERVICE_RU_URL } from "../actions/api";
import { purple } from "../constants/color";

interface AboutProps {
    close: () => void;
}

const About: FC<AboutProps> = ({ close }) => {
    const [version, setVersion] = useState('')
    const { t, i18n } = useTranslation()
    const termsUrl = i18n.language === 'ru-RU' ? { tos: TERMS_OF_SERVICE_RU_URL, privacy: PRIVACY_POLICY_RU_URL } : { tos: TERMS_OF_SERVICE_EN_URL, privacy: PRIVACY_POLICY_EN_URL }
    useEffect(()=>{
        NativeModules.MapsModule.getVersion().then((value: string)=>{
            setVersion(value)
        });
    },[])
    return <MapModal onRequestClose={close} accessibilityLabel={t('About app')}>
        <Text style={styles.title}>{t('About app')}</Text>
        <Text style={styles.version}>{t('Version')}: {version}</Text>
        <View style={styles.content}>
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={t('Contact Developer')} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} />
            </View>
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={t('Terms of the Service')} onPress={() => Linking.openURL(termsUrl.tos)} />
            </View>
            <View style={styles.row}>
                <Button buttonStyle={styles.btn} title={t('Privacy Policy')} onPress={() => Linking.openURL(termsUrl.privacy)} />
            </View>
            <View style={styles.lastRow}>
                <Button buttonStyle={styles.btn} title={t('Help')} onPress={() => Linking.openURL(HELP_URL)} />
            </View></View>
    </MapModal>
}

export default About

const styles = StyleSheet.create({
    content: {
        width: '100%',
        marginTop: 20,
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
        minHeight: 48,
        backgroundColor: purple,
    },
    title: {
        maxWidth: '90%',
        marginTop: -8,
        marginBottom: 10,
        color: 'black',
        fontSize: 24,
        fontWeight: '700',
    },
    version: {
        marginBottom: 10,
        width: "100%",
    }
});
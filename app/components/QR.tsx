import React, { FC } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    Linking,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { useTranslation } from "react-i18next";
import { green, purple } from "../constants/color";

const LINKING_URL = 'http://www.etomesto.ru/karta5467/'

interface Props {
    select: (data: string) => void;
    close: () => void;
}

const QR: FC<Props> = ({ select, close }) => {
    const { t } = useTranslation()

    const onSuccess = (e: any) => {
        console.log('qr', e.data)
        select(e.data)
        close()
    };

    return <QRCodeScanner
        onRead={onSuccess}
        cameraType='back'
        showMarker
        markerStyle={styles.markerStyle}
        topContent={
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>
                    {t('Scan map QR code')}
                </Text>
                <View style={styles.linkContainer}>
                    <Text style={styles.titleText}>
                        {t('For example: ')}
                    </Text>
                    <Text style={styles.link} onPress={() => Linking.openURL(LINKING_URL)}>{t('EtoMesto.ru')}</Text>
                </View>
            </View>
        }
        bottomContent={
            <TouchableOpacity style={styles.buttonTouchable} onPress={close}>
                <Text style={styles.buttonText}>{t('Cancel')}</Text>
            </TouchableOpacity>
        }
    />
}

export default QR


const styles = StyleSheet.create({
    titleContainer: {
        width: "100%",
        paddingHorizontal: 32,
        paddingBottom: 70,
    },
    titleText: {
        fontSize: 16,
        color: '#212121'
    },
    linkContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "baseline"
    },
    link: {
        fontSize: 18,
        color: purple,
        textDecorationLine: "underline"
    },
    buttonTouchable: {
        padding: 26,
    },
    buttonText: {
        fontSize: 21,
        color: purple,
    },
    markerStyle: {
        borderRadius: 10,
        borderStyle: "dashed",
        borderEndColor: green
    }
});

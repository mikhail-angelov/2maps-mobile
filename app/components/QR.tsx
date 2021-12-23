import React, { FC, useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';


interface Props {
    select: (data: string) => void;
    close: () => void;
}

const QR: FC<Props> = ({ select, close }) => {
    const [front, setFront] = useState(false)
    const onSuccess = (e: any) => {
        console.log('qr', e.data)
        select(e.data)
        close()
    };

    return <QRCodeScanner
        onRead={onSuccess}
        cameraType={front ? "front" : 'back'}
        topContent={
            <Text style={styles.centerText}>
                Scan map QR code form https://2map.xyz
            </Text>
        }
        bottomContent={
            <View style={styles.row}>
                <TouchableOpacity style={styles.buttonTouchable} onPress={close}>
                    <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonTouchable} onPress={() => setFront(!front)}>
                    <Text style={styles.buttonText}>Flip</Text>
                </TouchableOpacity>
            </View>
        }
    />
}

export default QR


const styles = StyleSheet.create({
    centerText: {
        flex: 1,
        fontSize: 18,
        padding: 32,
        color: '#777'
    },
    textBold: {
        fontWeight: '500',
        color: '#000'
    },
    buttonText: {
        fontSize: 21,
        color: 'rgb(0,122,255)'
    },
    buttonTouchable: {
        padding: 16
    },
    row:{
        flexDirection:'row'
    },
    qr: {
        width: 200
    }
});
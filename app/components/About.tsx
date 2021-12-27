import React, { FC, useState } from "react";
import { View, StyleSheet, Linking } from "react-native";
import { Button } from 'react-native-elements';
import { useTranslation } from "react-i18next";
import MapModal from "./Modal";
import Pdf from 'react-native-pdf';

const CONTACT_EMAIL = "mikhail.angelov@gmail.com"
const EULA_URL = "http://samples.leanpub.com/thereactnativebook-sample.pdf"
const HELP_URL = "http://samples.leanpub.com/thereactnativebook-sample.pdf"

enum UI {
    eula,
    help,
    default
}

interface PdfProps {
    sourceUri: string
}

const PdfComponent: FC<PdfProps> = ({ sourceUri }) => {
    return <View style={styles.container}><Pdf source={{ uri: sourceUri, cache: true }}
        onLoadComplete={(numberOfPages, filePath) => {
            console.log(`Number of pages: ${numberOfPages}`);
        }}
        onPageChanged={(page, numberOfPages) => {
            console.log(`Current page: ${page}`);
        }}
        onError={(error) => {
            console.log(error);
        }}
        onPressLink={(uri) => {
            console.log(`Link pressed: ${uri}`);
        }}
        style={styles.pdf}
    /></View>
}

interface AboutProps {
    close: () => void;
}

const About: FC<AboutProps> = ({ close }) => {
    const [ui, setUi] = useState<UI>(UI.default)
    const { t } = useTranslation()
    let content = <View style={styles.content}>
        <View style={styles.row}>
            <Button buttonStyle={styles.btn} title={t('Contact')} onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} />
        </View>
        <View style={styles.row}>
            <Button buttonStyle={styles.btn} title={t('EULA')} onPress={() => setUi(UI.eula)} />
        </View>
        <View style={styles.row}>
            <Button buttonStyle={styles.btn} title={t('Help')} onPress={() => setUi(UI.help)} />
        </View>
    </View>
    if (ui === UI.eula) {
        content = <PdfComponent sourceUri={EULA_URL} />
    } else if (ui === UI.help) {
        content = <PdfComponent sourceUri={HELP_URL} />
    }
    return <MapModal onRequestClose={close}>
        {content}
    </MapModal>
}

export default About

const styles = StyleSheet.create({
    content: {
        width: '100%',
        marginTop: 40,
    },
    row: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 10
    },
    btn: {
        paddingHorizontal: 20,
    },
    container: {
        height: '100%',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 40,
    },
    pdf: {
        flex: 1,
        width: '100%',
    }

});
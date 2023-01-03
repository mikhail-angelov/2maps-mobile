import React, { FC, useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, FlatList, Linking, ScrollView, SafeAreaView } from "react-native";
import { Button } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import ProgressBar from '../components/ProgressBar';
import { connect, ConnectedProps } from "react-redux";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { State, MapInfo, Storage, PrimaryMapInfo, ModalActionType } from '../store/types'
import { getLocalMapListAction, setPrimaryMapAction, setSecondaryMapAction, loadMapListAction, downloadMapAction, downloadMapByQRAction, removeLocalMapAction, cancelDownloadMapAction, getStorageMemoryInfo, importMapAction, moveMapToSdCardAction, moveMapToPhoneStorageAction, isFileValid, cancelTransferMapAction } from '../actions/map-actions'
import { selectPrimaryMap, selectSecondaryMap, selectMapList, selectMapIsLoading, onLineMapList, selectAvailableMapList, selectMapError, selectDownloadProgress, selectMapIsDownLoading, selectMapIsRelocating, selectRelocateProgress } from '../reducers/map'
import { selectIsAuthenticated } from '../reducers/auth'
import { showModalAction } from '../actions/ui-actions'
import { ItemValue } from "@react-native-picker/picker/typings/Picker";
import Spinner from "../components/Spinner";
import { useTranslation } from "react-i18next";
import { green, purple, red } from "../constants/color";
import QR from "../components/QR";
import * as _ from 'lodash';
import { validateMapInfoList } from "../utils/validation";
import MapModal from "../components/Modal";

const LINKING_URL = 'http://www.etomesto.ru/karta5467/'
const ETO_MESTO_URL = 'http://www.etomesto.ru/'

const internalStorage: Storage = "internal"
const sdCardStorage: Storage = "sd-card"
const removeStorageFromNamePattern = new RegExp(`:(${internalStorage}|${sdCardStorage})`)

interface MapItem {
    id: string;
    name: string;
    file: string;
    loaded: boolean;
    storage?: Storage;
}

const Help: FC = () => {
    const { t } = useTranslation()
    return (
        <SafeAreaView>
            <ScrollView style={styles.helpScrollView}>
                <Text style={styles.helpTitle}>{t('helpTitle')}</Text>
                <View style={styles.helpArticle}>
                    <View style={styles.helpArticleBullet}>
                        <Text style={styles.helpText}>1.</Text>
                    </View>
                    <View style={styles.helpArticleTextContainer}>
                        <Text style={[styles.helpText]}>{t('firstArticleHelp.firstLine')}</Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('firstArticleHelp.secondLine')}<Text style={styles.link} onPress={() => Linking.openURL(LINKING_URL)}>&nbsp;{t('EtoMesto.ru')}</Text> </Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('firstArticleHelp.thirdLine')}</Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('firstArticleHelp.fourthLine')}</Text>
                    </View>
                </View>
                <View style={styles.helpArticle}>
                    <View style={styles.helpArticleBullet}>
                        <Text style={styles.helpText}>2.</Text>
                    </View>
                    <View style={styles.helpArticleTextContainer}>
                        <Text style={styles.helpText}>{t('secondArticleHelp.firstLine')}</Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('secondArticleHelp.secondLine')}<Text style={styles.link} onPress={() => Linking.openURL(LINKING_URL)}>&nbsp;{t('EtoMesto.ru')}</Text> </Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('secondArticleHelp.thirdLine')}</Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('secondArticleHelp.fourthLine')}</Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('secondArticleHelp.firthLine')}</Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('secondArticleHelp.sixthLine')}</Text>
                    </View>
                </View>
                <View style={styles.helpArticle}>
                    <View style={styles.helpArticleBullet}>
                        <Text style={styles.helpText}>3.</Text>
                    </View>
                    <View style={styles.helpArticleTextContainer}>
                        <Text style={styles.helpText}>{t('thirdArticleHelp.firstLine')}</Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('thirdArticleHelp.secondLine')}</Text>
                        <Text style={[styles.helpText, styles.helpTextAddGap]}>{t('thirdArticleHelp.thirdLine')}</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const mapStateToProps = (state: State) => ({
    primaryMap: selectPrimaryMap(state),
    secondaryMap: selectSecondaryMap(state),
    list: selectMapList(state),
    isLoading: selectMapIsLoading(state),
    isDownLoading: selectMapIsDownLoading(state),
    availableMapList: selectAvailableMapList(state),
    isAuthenticated: selectIsAuthenticated(state),
    error: selectMapError(state),
    progress: selectDownloadProgress(state),
    isRelocating: selectMapIsRelocating(state),
    progressForRelocate: selectRelocateProgress(state),
});
const mapDispatchToProps = {
    getLocalMapList: getLocalMapListAction,
    setPrimaryMap: setPrimaryMapAction,
    setSecondaryMap: setSecondaryMapAction,
    loadMapList: loadMapListAction,
    downloadMap: downloadMapAction,
    removeLocalMap: removeLocalMapAction,
    cancelDownloadMap: cancelDownloadMapAction,
    importMap: importMapAction,
    moveMapToSdCard: moveMapToSdCardAction,
    moveMapToPhoneStorage: moveMapToPhoneStorageAction,
    downloadMapByQR: downloadMapByQRAction,
    cancelTransferMap: cancelTransferMapAction,
    showModal: showModalAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & {
    close: () => void,
    showAuth: () => void,
}


const MapSettings: FC<Props> = ({ primaryMap, secondaryMap, isLoading, isDownLoading, list, availableMapList, isAuthenticated, error, progress, isRelocating, progressForRelocate,
    cancelDownloadMap, close, getLocalMapList, setPrimaryMap, setSecondaryMap, loadMapList, downloadMap, removeLocalMap, showAuth, importMap, moveMapToSdCard, moveMapToPhoneStorage, downloadMapByQR, cancelTransferMap, showModal }) => {
    const { t } = useTranslation()
    const [availableInternalMemory, setAvailableInternalMemory] = useState("")
    const [totalInternalMemory, setTotalInternalMemory] = useState("")
    const [availableExternalMemory, setAvailableExternalMemory] = useState("")
    const [totalExternalMemory, setTotalExternalMemory] = useState("")
    const [isSDCardExist, setIsSDCardExist] = useState(true)
    const [isMemoryAvailable, setIsMemoryAvailable] = useState(true)
    const [showQRReader, setShowQRReader] = useState(false)
    const [showHelp, setShowHelp] = useState(false)

    useEffect(() => {
        getLocalMapList()
        if (isAuthenticated) {
            loadMapList()
        }
    }, [])

    useEffect(() => {
        getStorageMemoryInfo()
            .then((response) => {
                setAvailableInternalMemory(response.internalFree)
                setTotalInternalMemory(response.internalTotal)
                if (response.sdFree && response.sdTotal) {
                    setAvailableExternalMemory(response.sdFree)
                    setTotalExternalMemory(response.sdTotal)
                } else {
                    setIsSDCardExist(false)
                }
            })
            .catch(() => {
                setIsMemoryAvailable(false)
            })
    }, [list])

    const validList = validateMapInfoList(list)
    const allMaps: MapItem[] = [
        ...validList.map(({ name, url, size, storage }: MapInfo) => ({ id: name, name: `${name.replace(removeStorageFromNamePattern, "")} (${(size / 1000000).toFixed(3)}M)`, file: url, loaded: true, storage })),
        ...availableMapList.filter(({ name }) => !validList.find((item) => item.name.replace(removeStorageFromNamePattern, "") === name)).map(({ id, name, url, size }) => {
            return { id, name: `${name} (${(size / 1000000).toFixed(3)}M)`, file: url, loaded: false }
        })]
    const primaryList = [...onLineMapList, ...list]
    const onSetPrimary = (value: ItemValue) => {
        const map = primaryList.find((item) => item.name === value)
        if (!map) return
        setPrimaryMap(map)
    }
    const onSetSecondary = (value: ItemValue) => {
        setSecondaryMap(list.find(x => x.name === value))
    }

    const confirmMovementMapToSdCard = (item: MapItem) => {
        if (isSDCardExist) {
            showModal({
                title: '', text: t('Move to SD Card', { name: item.name }),
                actions: [
                    { text: t('No'), type: ModalActionType.cancel },
                    { text: t('Yes'), type: ModalActionType.default, handler: () => { moveMapToSdCard(item.id) } },
                ]
            })
        } else {
            showModal({
                title: '', text: t('No SD Card', { name: item.name }), actions: [
                    { text: t('Ok'), type: ModalActionType.cancel },
                ]
            })
        }
    }

    const confirmMovementMapToPhoneStorage = (item: MapItem) => {
        showModal({
            title: '', text: t('Move to Phone', { name: item.name }), actions: [
                { text: t('No'), type: ModalActionType.cancel },
                { text: t('Yes'), type: ModalActionType.default, handler: () => { moveMapToPhoneStorage(item.id) } },
            ]
        })
    }

    const confirmRemoving = (item: MapItem) => {
        showModal({
            title: t('Warning!'), text: t('Are you sure to remove the map?', { name: item.name }), actions: [
                { text: t('No'), type: ModalActionType.cancel },
                { text: t('Yes'), type: ModalActionType.default, handler: () => { removeLocalMap(item.id) } },
            ]
        })
    }

    const processCapturedQR = (link: string) => {
        const fileName = _.last(link.split("/")) || ''
        if (isFileValid(fileName)) {
            downloadMapByQR({ url: link, name: fileName })
        } else {
            showModal({
                title: t('File name is not valid:', { name: fileName }), text: t('You have to try with ".sqlitedb" files'), actions: [
                    { text: t('Ok'), type: ModalActionType.cancel },
                ]
            })
        }
    }

    const renderItem = (item: MapItem, isAuthenticated: boolean) => (
        (isAuthenticated || item.loaded) &&
        <View style={styles.row}>
            <Text style={styles.listNameText}>{item.name}</Text>
            {item.loaded && (
                <View style={styles.listButtonsContainer}>
                    {item.storage === internalStorage && <Icon.Button style={styles.listButton} iconStyle={styles.listIconStorage} size={22} backgroundColor="transparent" name="phone-android" accessibilityLabel="move to sd card" onPress={() => confirmMovementMapToSdCard(item)} />}
                    {item.storage === sdCardStorage && <Icon.Button style={styles.listButton} iconStyle={styles.listIconStorage} size={22} backgroundColor="transparent" name="sd-card" accessibilityLabel="move to mobile" onPress={() => confirmMovementMapToPhoneStorage(item)} />}
                    <Icon.Button style={styles.listButton} iconStyle={styles.listIconRemove} size={22} backgroundColor="transparent" name="delete-outline" accessibilityLabel="remove" onPress={() => confirmRemoving(item)} />
                </View>
            )}
            {!item.loaded && isAuthenticated && <Button titleStyle={{ color: purple }} type='clear' onPress={() => downloadMap({ id: item.id, name: item.file })} title="download" />}
        </View>
        || null
    );

    return <Modal style={styles.container} visible onRequestClose={close}>
        {isDownLoading && <View style={styles.loadingOverlay}>
            <Text style={styles.loadingLabel}>{t('loading...')}</Text>
            <View style={styles.progressBar}><ProgressBar progress={progress} /></View>
            <Button title="Cancel" onPress={cancelDownloadMap} />
        </View>}
        {isRelocating && <View style={styles.loadingOverlay}>
            <Text style={styles.loadingLabel}>{t('transferring...')}</Text>
            <View style={styles.progressBar}><ProgressBar progress={progressForRelocate} /></View>
            <Button title="Cancel" onPress={cancelTransferMap} />
        </View>}
        <Spinner show={isLoading} />
        <View style={styles.header}>
            <View style={styles.headerButton}>
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="arrow-back-ios" onPress={close} />
            </View>
            <View style={styles.headerText}>
                <Text style={styles.title}>{t('Maps')}</Text>
            </View>
        </View>
        <View style={styles.content}>
            <View style={styles.row}>
                <Text style={styles.label}>{t('Primary Map')}:</Text>
                <Picker
                    selectedValue={primaryMap?.name}
                    style={styles.picker}
                    onValueChange={onSetPrimary}
                    mode="dropdown"
                >
                    {primaryList.map(({ name }: PrimaryMapInfo) => (<Picker.Item key={name} label={name} value={name} style={styles.pickerItem} />))}
                </Picker>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>{t('Secondary Map')}:</Text>
                <Picker
                    selectedValue={secondaryMap?.name}
                    style={styles.picker}
                    onValueChange={onSetSecondary}
                    mode="dropdown"
                >
                    <Picker.Item label="None" value={''} style={styles.pickerItem} />
                    {list.map(({ name }: MapInfo) => (<Picker.Item key={name} label={name} value={name} style={styles.pickerItem} />))}
                </Picker>
            </View>
            {isMemoryAvailable ?
                <View style={styles.row}>
                    <Text>{`${t('Memory on phone')} ${totalInternalMemory}/${availableInternalMemory} ${t('free')}, ${isSDCardExist ? `${t('SD card')} ${totalExternalMemory}/${availableExternalMemory} ${t('free')}` : 'no SD card'}`}</Text>
                </View> : <View style={styles.row}>
                    <Text>{t('Phone memory is not writable')}</Text>
                </View>}
            <View style={styles.buttonsRow}>
                <Icon.Button backgroundColor={purple} name="file-download" onPress={importMap}>
                    <Text style={styles.darkButtonText}>{t('Import')}</Text>
                </Icon.Button>
                <Icon.Button backgroundColor={purple} name="qr-code-scanner" onPress={() => setShowQRReader(true)}>
                    <Text style={styles.darkButtonText}>{t('Scan QR')}</Text>
                </Icon.Button>
                <Icon.Button backgroundColor={green} name="help-outline" onPress={() => setShowHelp(true)}>
                    <Text style={styles.darkButtonText}>{t('Help')}</Text>
                </Icon.Button>
            </View>
            <View style={styles.row}>
                <Text style={styles.notificationText}>{t('Supported map format .SQLiteDB')}</Text>
                <Text style={styles.link} onPress={() => Linking.openURL(ETO_MESTO_URL)}>EtoMesto.ru</Text>
            </View>
            <View style={styles.availableMaps}>
                <FlatList
                    data={allMaps}
                    renderItem={({ item }) => renderItem(item, isAuthenticated)}
                    keyExtractor={(item: MapItem) => item.id}
                />
                {!isAuthenticated &&
                    <Button buttonStyle={styles.btn} title={t('Login to download maps') as string} onPress={showAuth} />
                }
            </View>
            {!!error && <Text style={styles.errors}>{t(error)}</Text>}
        </View>
        {showQRReader &&
            <Modal>
                <QR close={() => setShowQRReader(false)} select={(link) => { processCapturedQR(link) }} />
            </Modal>
        }
        {showHelp && <MapModal onRequestClose={() => setShowHelp(false)}><Help /></MapModal>}
    </Modal>
}

export default connector(MapSettings)

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0, bottom: 0,
        marginTop: 20,
        // padding: 20,
        height: '100%',
    },
    content: {
        flex: 1,
        margin: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        backgroundColor: purple,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        margin: 5,
        width: "100%",
    },
    headerButton: {
        width: 60,
    },
    titleButton: {
        minWidth: 100,
        maxWidth: 1,
        textAlign: 'center',
        alignContent: 'center',
        padding: 10,
        margin: 10,
    },
    headerText: {
        width: '100%',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
    },
    title: {
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    item: {
        backgroundColor: "#f9c2ff",
        padding: 20,
        marginVertical: 8,
    },
    picker: {
        minWidth: 150,
        flex: 1,
        color: 'black',
        backgroundColor: "#ddd",
    },
    pickerItem: {
        // minWidth: 150,
        // flex: 1,
        backgroundColor: "white",
        color: 'black',
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 18,
        flex: 1,
    },
    availableMaps: {
        borderWidth: 1,
        borderColor: '#ccc',
        backgroundColor: "#fff",
        padding: 10,
        flex: 1,
        overflow: 'scroll',
    },
    btn: {
        margin: 15,
        maxWidth: '100%',
        backgroundColor: purple,
    },
    errors: {
        color: 'red',
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)',
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
    },
    progressBar: {
        width: '100%',
        marginBottom: 10,
        paddingHorizontal: 5,
    },
    loadingLabel: {
        fontSize: 16,
        marginBottom: 10,
    },
    listNameText: {
        flex: 1,
    },
    listButtonsContainer: {
        flexDirection: "row",

    },
    listIconStorage: {
        color: purple,
    },
    listIconRemove: {
        color: red,
    },
    listButton: {
        minHeight: 48,
        minWidth: 48,
        marginLeft: 10,
    },
    darkButtonText: {
        color: "white",
    },
    buttonsRow: {
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "space-around"
    },
    notificationText: {
        // marginTop: 10,
        // marginBottom: 20,
        marginHorizontal: 5,
        fontSize: 16,
        fontWeight: '600',
    },
    helpScrollView: {
        marginTop: 20,
    },
    helpArticle: {
        marginTop: 20,
        flexDirection: "row",
    },
    helpArticleBullet: {
        flexBasis: 18,
    },
    helpArticleTextContainer: {
        flex: 1,
    },
    helpTitle: {
        color: '#212121',
        fontSize: 20,
        fontWeight: '300',
    },
    helpText: {
        color: '#212121',
        fontSize: 16,
    },
    helpTextAddGap: {
        marginTop: 10,
    },
    link: {
        fontSize: 18,
        color: purple,
        textDecorationLine: "underline",
    },
});
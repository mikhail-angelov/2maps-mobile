import React, { FC, useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, FlatList, Alert } from "react-native";
import { Button } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import ProgressBar from '../components/ProgressBar';
import { connect, ConnectedProps } from "react-redux";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { State, MapInfo, Storage, PrimaryMapInfo } from '../store/types'
import { getLocalMapListAction, setPrimaryMapAction, setSecondaryMapAction, loadMapListAction, downloadMapAction, downloadMapByQRAction, removeLocalMapAction, cancelDownloadMapAction, getStorageMemoryInfo, importMapAction, moveMapToSdCardAction, moveMapToPhoneStorageAction, isFileValid, cancelTransferMapAction } from '../actions/map-actions'
import { selectPrimaryMap, selectSecondaryMap, selectMapList, selectMapIsLoading, onLineMapList, selectAvailableMapList, selectMapError, selectDownloadProgress, selectMapIsDownLoading, selectMapIsRelocating, selectRelocateProgress } from '../reducers/map'
import { selectIsAuthenticated } from '../reducers/auth'
import { ItemValue } from "@react-native-picker/picker/typings/Picker";
import Spinner from "../components/Spinner";
import { useTranslation } from "react-i18next";
import { purple, red } from "../constants/color";
import QR from "../components/QR";
import * as _ from 'lodash';
import { validateMapInfoList } from "../utils/validation";

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
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & {
    close: () => void,
    showAuth: () => void,
}


const MapSettings: FC<Props> = ({ primaryMap, secondaryMap, isLoading, isDownLoading, list, availableMapList, isAuthenticated, error, progress, isRelocating, progressForRelocate, cancelDownloadMap, close, getLocalMapList, setPrimaryMap, setSecondaryMap, loadMapList, downloadMap, removeLocalMap, showAuth, importMap, moveMapToSdCard, moveMapToPhoneStorage, downloadMapByQR, cancelTransferMap }) => {
    const { t } = useTranslation()
    const [availableInternalMemory, setAvailableInternalMemory] = useState("")
    const [totalInternalMemory, setTotalInternalMemory] = useState("")
    const [availableExternalMemory, setAvailableExternalMemory] = useState("")
    const [totalExternalMemory, setTotalExternalMemory] = useState("")
    const [isSDCardExist, setIsSDCardExist] = useState(true)
    const [isMemoryAvailable, setIsMemoryAvailable] = useState(true)
    const [showQRReader, setShowQRReader] = useState(false)

    useEffect(() => {
        getLocalMapList()
        if(isAuthenticated) {
            loadMapList()
        }
    }, [])

    useEffect(() => {
        getStorageMemoryInfo()
            .then((response) => {
                setAvailableInternalMemory(response.internalFree)
                setTotalInternalMemory(response.internalTotal)
                if(response.sdFree && response.sdTotal) {
                    setAvailableExternalMemory(response.sdFree)
                    setTotalExternalMemory(response.sdTotal)
                } else {
                    setIsSDCardExist(false)
                }
            })
            .catch(() => {
                setIsMemoryAvailable(false)
            })
    },[list])

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
        if(isSDCardExist){
            Alert.alert(
                "",
                t('Move to SD Card', {name: item.name}),
                [
                    { text: t('No'), style: "cancel" },
                    { text: t('Yes'), onPress: () => {moveMapToSdCard(item.id)} }
                ]
            );
        } else {
            Alert.alert(
                "",
                t('No SD Card'),
                [
                    { text: t('Ok'), style: "default" },
                ]
            );
        }
    }

    const confirmMovementMapToPhoneStorage = (item: MapItem) => {
        Alert.alert(
            "",
            t('Move to Phone', {name: item.name}),
            [
                { text: t('No'), style: "cancel" },
                { text: t('Yes'), onPress: () => {moveMapToPhoneStorage(item.id) } }
            ]
        );
    }

    const confirmRemoving = (item: MapItem) => {
        Alert.alert(
            t('Warning!'),
            t('Are you sure to remove the map?', {name: item.name}),
            [
                { text: t('No'), style: "cancel" },
                { text: t('Yes'), onPress: () => {removeLocalMap(item.id)} }
            ]
        );
    }

    const processCapturedQR = (link: string) => {
        const fileName = _.last(link.split("/")) || ''
        if (isFileValid(fileName)) {
            downloadMapByQR({url: link, name: fileName})         
        } else {
            Alert.alert(
                t('File name is not valid:', {name: fileName}),
                t('You have to try with ".sqlitedb" files'),
                [
                    { text: t('Ok') }
                ]
            );
        }
    }

    const renderItem = (item: MapItem, isAuthenticated: boolean ) => (
        (isAuthenticated || item.loaded) &&
            <View style={styles.row}>
                <Text style={styles.listNameText}>{item.name}</Text>
                {item.loaded && (
                    <View style={styles.listButtonsContainer}>
                        {item.storage === internalStorage && <Icon.Button style={styles.listButton} iconStyle={styles.listIconStorage} size={22} backgroundColor="transparent" name="phone-android" accessibilityLabel="move to sd card" onPress={() => confirmMovementMapToSdCard(item)}/>}
                        {item.storage === sdCardStorage && <Icon.Button style={styles.listButton} iconStyle={styles.listIconStorage} size={22} backgroundColor="transparent" name="sd-card" accessibilityLabel="move to mobile" onPress={() => confirmMovementMapToPhoneStorage(item)}/>}
                        <Icon.Button style={styles.listButton} iconStyle={styles.listIconRemove} size={22} backgroundColor="transparent" name="delete-outline" accessibilityLabel="remove" onPress={() => confirmRemoving(item)}/>
                    </View>
                )}
                {!item.loaded && isAuthenticated && <Button titleStyle={{color: purple}} type='clear' onPress={() => downloadMap({ id: item.id, name: item.file })} title="download" />}
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
                    {primaryList.map(({ name }: PrimaryMapInfo) => (<Picker.Item key={name} label={name} value={name} />))}
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
                    <Picker.Item label="None" value={''} />
                    {list.map(({ name }: MapInfo) => (<Picker.Item key={name} label={name} value={name} />))}
                </Picker>
            </View>
            <View style={styles.row}>
                <Text>{t('Phone')}: {isMemoryAvailable ? `${availableInternalMemory} ${t('free of')} ${totalInternalMemory}`: t('Not Available')}</Text>
            </View>
            <View style={styles.row}>
                <Text>{t('SD card')}: {isSDCardExist && isMemoryAvailable ? `${availableExternalMemory} ${t('free of')} ${totalExternalMemory}`: t('Not Available')}</Text>
            </View>
            <View style={styles.buttonsRow}>
                <Icon.Button backgroundColor={purple} name="file-download" onPress={importMap}>
                    <Text style={styles.darkButtonText}>{t('Import Map')}</Text>
                </Icon.Button>
                <Icon.Button backgroundColor={purple} name="qr-code-scanner" onPress={() => setShowQRReader(true)}>
                    <Text style={styles.darkButtonText}>{t('Scan QR')}</Text>
                </Icon.Button>
            </View>
            <Text style={styles.notificationText}>{t('Supported map format Locus Map .SQLiteDB')}</Text>
            <View style={styles.availableMaps}>
                <FlatList
                    data={allMaps}
                    renderItem={({item}) => renderItem(item, isAuthenticated)}
                    keyExtractor={(item: MapItem) => item.id}
                />
                {!isAuthenticated &&
                    <Button buttonStyle={styles.btn} title={t('Login to download maps')} onPress={showAuth} />
                }
            </View>
            {!!error && <Text style={styles.errors}>{error}</Text>}
        </View>
        {showQRReader && 
            <Modal>
                <QR close={() => setShowQRReader(false)} select={(link) => {processCapturedQR(link)}} />
            </Modal>
        }
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
        width: 150,
        justifyContent: 'flex-end',
    },
    label: {
        fontSize: 18,
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
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        justifyContent: "space-around"
    },
    notificationText: {
        marginTop: 10,
        marginBottom: 20,
        marginHorizontal: 5,
        fontSize: 16,
        fontWeight: '600',
    },
});
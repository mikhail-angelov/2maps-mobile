import React, { FC, useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, FlatList, Alert } from "react-native";
import { Button } from "react-native-elements";
import { Picker } from "@react-native-picker/picker";
import ProgressBar from '../components/ProgressBar';
import { connect, ConnectedProps } from "react-redux";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { State, MapInfo, Storage } from '../store/types'
import { getLocalMapListAction, setPrimaryMapAction, setSecondaryMapAction, loadMapListAction, downloadMapAction, removeLocalMapAction, cancelDownloadMapAction, getStorageMemoryInfo, importMapAction, moveMapToSdCardAction, moveMapToPhoneStorageAction } from '../actions/map-actions'
import { selectPrimaryMap, selectSecondaryMap, selectMapList, selectMapIsLoading, onLineMapList, selectAvailableMapList, selectMapError, selectDownloadProgress, selectMapIsDownLoading } from '../reducers/map'
import { selectIsAuthenticated } from '../reducers/auth'
import { ItemValue } from "@react-native-picker/picker/typings/Picker";
import Spinner from "../components/Spinner";
import { useTranslation } from "react-i18next";
import { purple, red } from "../constants/color";
import {
    MenuProvider,
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';

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
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & {
    close: () => void,
    showAuth: () => void,
}


const MapSettings: FC<Props> = ({ primaryMap, secondaryMap, isLoading, isDownLoading, list, availableMapList, isAuthenticated, error, progress, cancelDownloadMap, close, getLocalMapList, setPrimaryMap, setSecondaryMap, loadMapList, downloadMap, removeLocalMap, showAuth, importMap, moveMapToSdCard, moveMapToPhoneStorage }) => {
    const { t } = useTranslation()
    const [availableInternalMemory, setAvailableInternalMemory] = useState("")
    const [totalInternalMemory, setTotalInternalMemory] = useState("")
    const [availableExternalMemory, setAvailableExternalMemory] = useState("")
    const [totalExternalMemory, setTotalExternalMemory] = useState("")
    const [isSDCardExist, setIsSDCardExist] = useState(true)
    const [isMemoryAvailable, setIsMemoryAvailable] = useState(true)

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

    const allMaps: MapItem[] = [
        ...list.map(({ name, url, size = 0, storage }: MapInfo) => ({ id: name, name: `${name.replace(removeStorageFromNamePattern, "")} (${(size / 1000000).toFixed(3)}M)`, file: url, loaded: true, storage })),
        ...availableMapList.filter(({ name }) => !list.find((item) => item.name.replace(removeStorageFromNamePattern, "") === name)).map(({ id, name, url, size }) => {
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

    const renderItem = (item: MapItem, isAuthenticated: boolean ) => (
        (isAuthenticated || item.loaded) &&
            <View style={styles.row}>
                <Text>{item.name}</Text>
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
            <View style={styles.progressBar}><ProgressBar progress={progress} value={progress} /></View>
            <Button title="Cancel" onPress={cancelDownloadMap} />
        </View>}
        <Spinner show={isLoading} />
        <MenuProvider>
            <View style={styles.header}>
                <View style={styles.headerButton}>
                    <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="arrow-back-ios" onPress={close} />
                </View>
                <View style={styles.headerText}>
                    <Text style={styles.title}>{t('Settings')}</Text>
                </View>
                <Menu>
                    <MenuTrigger><Icon style={styles.menuMainIcon} name="menu" /></MenuTrigger>
                    <MenuOptions >
                        <MenuOption onSelect={importMap}>
                            <View style={styles.menuOptionContainer}>
                                <Icon style={styles.menuIcon} name="file-upload" />
                                <Text style={styles.menuText}>{t('Import Map')}</Text>
                            </View>
                        </MenuOption>
                    </MenuOptions>
                </Menu>
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
                        {primaryList.map(({ name }: MapInfo) => (<Picker.Item key={name} label={name} value={name} />))}
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
        </MenuProvider>
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
    menuMainIcon: {
        textAlign: 'center',
        alignContent: 'center',
        padding: 10,
        margin: 10,
        fontSize: 22,
        fontWeight: '700',
        color: 'white',
    },
    menuOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        padding: 10,
        margin: 10,
        fontSize: 22,
        fontWeight: '700',
        color: purple,
    },
    menuText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '700',
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
    }
});
import React, { FC, useEffect, useState } from "react";
import { View, Text, Modal, StyleSheet, FlatList, NativeModules } from "react-native";
import { Button } from "react-native-elements";
import MapboxGL from "@react-native-mapbox-gl/maps";
import { Picker } from "@react-native-community/picker";
import ProgressBar from '../components/ProgressBar';
import { connect, ConnectedProps } from "react-redux";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { State, MapInfo } from '../store/types'
import { getLocalMapListAction, setPrimaryMapAction, setSecondaryMapAction, loadMapListAction, downloadMapAction, removeLocalMapAction, cancelDownloadMapAction, getAvailableInternalMemorySize, getTotalInternalMemorySize, getAvailableExternalMemorySize, externalMemoryAvailable, getTotalExternalMemorySize } from '../actions/map-actions'
import { selectPrimaryMap, selectSecondaryMap, selectMapList, selectMapIsLoading, onLineMapList, selectAvailableMapList, selectMapError, selectDownloadProgress, selectMapIsDownLoading } from '../reducers/map'
import { selectIsAuthenticated } from '../reducers/auth'
import { ItemValue } from "@react-native-community/picker/typings/Picker";
import Spinner from "../components/Spinner";
import { useTranslation } from "react-i18next";
import { purple } from "../constants/color";

interface MapItem {
    id: string;
    name: string;
    file: string;
    loaded: boolean;
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
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & {
    close: () => void,
    showAuth: () => void,
}


const MapSettings: FC<Props> = ({ primaryMap, secondaryMap, isLoading, isDownLoading, list, availableMapList, isAuthenticated, error, progress, cancelDownloadMap, close, getLocalMapList, setPrimaryMap, setSecondaryMap, loadMapList, downloadMap, removeLocalMap, showAuth }) => {
    const { t } = useTranslation()
    const [availableInternalMemory, setAvailableInternalMemory] = useState("")
    const [totalInternalMemory, setTotalInternalMemory] = useState("")
    const [availableExternalMemory, setAvailableExternalMemory] = useState("")
    const [totalExternalMemory, setTotalExternalMemory] = useState("")
    const [isSDCArdExist, setIsSDCArdExist] = useState(false)

    useEffect(() => {
        getLocalMapList()

        getAvailableInternalMemorySize().then(setAvailableInternalMemory)
        getTotalInternalMemorySize().then(setTotalInternalMemory)
        externalMemoryAvailable().then((externalMemoryAvailable) => {
            if(externalMemoryAvailable){
                setIsSDCArdExist(true)
                getAvailableExternalMemorySize().then(setAvailableExternalMemory)
                getTotalExternalMemorySize().then(setTotalExternalMemory)
            }else{
                setIsSDCArdExist(false)
            }
        })
        if(isAuthenticated) {
            loadMapList()
        }
    }, [])
    const allMaps: MapItem[] = [
        ...list.map(({ name, url, size = 0 }: MapInfo) => ({ id: name, name: `${name} (${(size / 1000000).toFixed(3)}M)`, file: url, loaded: true })),
        ...availableMapList.filter(({ name }) => !list.find((item) => item.name === name)).map(({ id, name, url, size }) => {
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

    const renderItem = (item: MapItem, isAuthenticated: boolean ) => (
        (isAuthenticated || item.loaded) &&
            <View style={styles.row}>
                <Text>{item.name}</Text>
                {item.loaded && <Button titleStyle={{color: purple}} type='clear' onPress={() => removeLocalMap(item.id)} title="remove" />}
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
        <View style={styles.header}>
            <View style={styles.headerButton}>
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="arrow-back-ios" onPress={close} />
            </View>
            <View style={styles.headerText}>
                <Text style={styles.title}>{t('Settings')}</Text>
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
                <Text>{t('Phone')}: {availableInternalMemory} {t('free of')} {totalInternalMemory}</Text>
            </View>
            <View style={styles.row}>
                <Text>{t('SD card')}: {isSDCArdExist ? `${availableExternalMemory} ${t('free of')} ${totalExternalMemory}`: t('Not Available')}</Text>
            </View>
            <View style={styles.availableMaps}>
                <FlatList
                    data={allMaps}
                    renderItem={({item}) => renderItem(item, isAuthenticated)}
                    keyExtractor={(item: MapItem) => item.name}
                />
                {!isAuthenticated &&
                    <Button buttonStyle={styles.btn} title={t('Login to download maps')} onPress={showAuth} />
                }
            </View>
            {!!error && <Text style={styles.errors}>{error}</Text>}
        </View>
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
        flexDirection: 'column',
        justifyContent: 'flex-start',
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
});
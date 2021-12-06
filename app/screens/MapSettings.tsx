import React, { FC, useEffect } from "react";
import { View, Text, Modal, StyleSheet, FlatList } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";
import { Picker } from "@react-native-community/picker";
import { connect, ConnectedProps } from "react-redux";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { State, MapInfo } from '../store/types'
import { gelLocalMapListAction, setPrimaryMapAction, setSecondaryMapAction, loadMapListAction, downloadMapAction, removeLocalMapAction } from '../actions/map-actions'
import { selectPrimaryMap, selectSecondaryMap, selectMapList, selectMapIsLoading, onLineMapList, selectAvailableMapList, selectMapError } from '../reducers/map'
import { selectIsAuthenticated } from '../reducers/auth'
import { ItemValue } from "@react-native-community/picker/typings/Picker";
import { Button } from "react-native-elements/dist/buttons/Button";
import Spinner from "../components/Spinner";

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
    availableMapList: selectAvailableMapList(state),
    isAuthenticated: selectIsAuthenticated(state),
    error: selectMapError(state),
});
const mapDispatchToProps = {
    gelLocalMapList: gelLocalMapListAction,
    setPrimaryMap: setPrimaryMapAction,
    setSecondaryMap: setSecondaryMapAction,
    loadMapList: loadMapListAction,
    downloadMap: downloadMapAction,
    removeLocalMap: removeLocalMapAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }


const MapSettings: FC<Props> = ({ primaryMap, secondaryMap, isLoading, list, availableMapList, isAuthenticated, error, close, gelLocalMapList, setPrimaryMap, setSecondaryMap, loadMapList, downloadMap, removeLocalMap }) => {
    useEffect(() => {
        gelLocalMapList()
        loadMapList()
    }, [])
    const allMaps: MapItem[] = [
        ...list.map(({ name, url }: MapInfo) => ({ id: name, name: `${name} (${(0 / 1000000).toFixed(3)}M)`, file: url, loaded: true })),
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

    const renderItem = ({ item }: { item: MapItem }) => (
        <View style={styles.row}>
            <Text>{item.name}</Text>
            {item.loaded ? <Button type='clear' onPress={() => removeLocalMap(item.id)} title="remove" /> : <Button type='clear' onPress={() => downloadMap({ id: item.id, name: item.file })} title="download" />}
        </View>
    );

    return <Modal style={styles.container} visible onRequestClose={close}>
        <Spinner show={isLoading} />
        <View style={styles.header}>
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="close" onPress={close} />
        </View>
        <View style={styles.content}>
            <View style={styles.row}>
                <Text style={styles.label}>Primary Map:</Text>
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
                <Text style={styles.label}>Secondary Map:</Text>
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

            {isAuthenticated ?
                <View style={styles.availableMaps}>
                    <FlatList
                        data={allMaps}
                        renderItem={renderItem}
                        keyExtractor={(item: MapItem) => item.name}
                    />
                </View> : <View>
                    <Text>You need to be logged in to download maps</Text>
                </View>}
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
        flexDirection: 'row',
        justifyContent: "flex-end",
        padding: 10,
        backgroundColor: '#303846',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        margin: 5,
    },
    titleButton: {
        textAlign: 'center',
        alignContent: 'center',
        padding: 10,
        margin: 10,
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
    errors: {
        color: 'red',
    }
});
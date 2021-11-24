import React, { FC, useEffect } from "react";
import { View, Text, Modal, StyleSheet, } from "react-native";
import MapboxGL from "@react-native-mapbox-gl/maps";
import { Picker } from "@react-native-community/picker";
import { connect, ConnectedProps } from "react-redux";
import Icon from 'react-native-vector-icons/MaterialIcons';
import { State, MapInfo } from '../store/types'
import { loadMapListAction, setPrimaryMapAction, setSecondaryMapAction, setStyleUrlAction } from '../actions/map-actions'
import { selectPrimaryMap, selectSecondaryMap, selectMapList, selectMapIsLoading, selectStyleUrl, selectMapError } from '../reducers/map'
import { ItemValue } from "@react-native-community/picker/typings/Picker";

const styleUrls = [
    { label: 'Vector', value: MapboxGL.StyleURL.Street },
    { label: 'Satellite', value: MapboxGL.StyleURL.Satellite },
    { label: 'SatelliteStreet', value: MapboxGL.StyleURL.SatelliteStreet },
    { label: 'Dark', value: MapboxGL.StyleURL.Dark },
]
const mapStateToProps = (state: State) => ({
    primaryMap: selectPrimaryMap(state),
    secondaryMap: selectSecondaryMap(state),
    list: selectMapList(state),
    isLoading: selectMapIsLoading(state),
    styleUrl: selectStyleUrl(state),
});
const mapDispatchToProps = {
    loadMapList: loadMapListAction,
    setPrimaryMap: setPrimaryMapAction,
    setSecondaryMap: setSecondaryMapAction,
    setStyleUrl: setStyleUrlAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }


const MapSettings: FC<Props> = ({ primaryMap, secondaryMap, styleUrl, list, close, loadMapList, setPrimaryMap, setSecondaryMap, setStyleUrl }) => {
    useEffect(() => {
        loadMapList()
    }, [])
    const onSetStyleUrl = (value: ItemValue) => {
        console.log('---',value)
        setStyleUrl(value as MapboxGL.StyleURL)
    }
    const onSetPrimary = (value: ItemValue) => {
        setPrimaryMap(list.find(x => x.name === value))
    }
    const onSetSecondary = (value: ItemValue) => {
        setSecondaryMap(list.find(x => x.name === value))
    }

    return <Modal style={styles.container} visible onRequestClose={close}>
        <View style={styles.buttons}>
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="close" onPress={close} />
        </View>
        <View style={styles.scroll}>
            <View style={styles.row}>
                <Text style={styles.label}>Main Map style:</Text>
                <Picker
                    selectedValue={styleUrl}
                    style={styles.picker}
                    onValueChange={onSetStyleUrl}
                    mode="dropdown"
                >
                    {styleUrls.map(({ label, value }) => (<Picker.Item key={label} label={label} value={value} />))}
                </Picker>
            </View>
            <View style={styles.row}>
                <Text style={styles.label}>Primary Map:</Text>
                <Picker
                    selectedValue={primaryMap?.name}
                    style={styles.picker}
                    onValueChange={onSetPrimary}
                    mode="dropdown"
                >
                    <Picker.Item label="None" value={''} />
                    {list.map(({ name }: MapInfo) => (<Picker.Item key={name} label={name} value={name} />))}
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
    scroll: {
        // height: '90%',
        // backgroundColor: "#fff",

    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: "space-between",
        margin: 5,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: "flex-end",
        padding: 10,
        backgroundColor: '#303846',
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
    }
});
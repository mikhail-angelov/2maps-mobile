import React, { FC } from "react";
import { View, FlatList, StyleSheet, Modal, Alert } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { Button, ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import distance from '@turf/distance';
import { orderBy } from 'lodash'
import dayjs from 'dayjs'
import { State } from '../store/types'
import { selectIsTracking, selectTracks } from '../reducers/tracker'
import { addPointAction, addTrackAction, selectTrackAction, startTrackingAction, stopTrackingAction, exportTrackAction, removeTrackAction, importTrackAction } from "../actions/tracker-actions";
import { SvgXml } from "react-native-svg";

export enum MENU {
    Cancel,
    ToggleTrack,
    ToggleTrackRecord,
    Import,
    Export,
}

interface Item {
    id: string;
    title: string;
    subtitle: string;
    thumbnail: string;
}

const mapStateToProps = (state: State) => ({
    tracks: selectTracks(state),
    isTracking: selectIsTracking(state),
});
const mapDispatchToProps = {
    selectTrack: selectTrackAction,
    startTracking: startTrackingAction,
    stopTracking: stopTrackingAction,
    exportTrack: exportTrackAction,
    removeTrack: removeTrackAction,
    importTrack: importTrackAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

const Tracks: FC<Props> = ({ tracks, isTracking, startTracking, stopTracking, selectTrack, close, exportTrack, removeTrack, importTrack }) => {
    const toggleTracking = () => {
        if (isTracking) {
            stopTracking()
        } else {
            startTracking()
        }
    }
    const onSelectTrack = (id: string) => {
        const track = tracks.find((item) => item.id === id)
        selectTrack(track)
        close()
    }

    const onRemoveTrack = (itemId: string) => {
        Alert.alert(
            "Warning!",
            "Are you sure to remove the track?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => { removeTrack(itemId); selectTrack(undefined) } }
            ]
        );
    }

    const list: Item[] = orderBy(tracks, 'start', 'desc').map(({ id, name, start, end, track, thumbnail }) => {
        const l = distance(track[0], track[track.length - 1]).toFixed(3)
        const subtitle = `T: ${dayjs(end - start).format('HH:mm')}, L: ${l} km.`
        return {
            id,
            title: name || dayjs(start).format('YY.MM.DD HH:mm'),
            subtitle,
            thumbnail: thumbnail || '',
        }
    })

    const keyExtractor = (item: Item) => item.id
    const renderItem = ({ item }: { item: Item }) => (
        <ListItem.Swipeable
            leftWidth={130}
            rightContent={
                <View style={{ flexDirection: "row" }}>
                    <Button
                        icon={{ name: 'file-download', color: 'white' }}
                        buttonStyle={{ minHeight: '100%', backgroundColor: 'blue', borderRadius: 0 }}
                        containerStyle={{ flex: 1 }}
                        onPress={() => exportTrack(item.id)}
                    />
                    <Button
                        icon={{ name: 'delete', color: 'white' }}
                        buttonStyle={{ minHeight: '100%', backgroundColor: 'red', borderRadius: 0 }}
                        containerStyle={{ flex: 1 }}
                        onPress={() => onRemoveTrack(item.id)}
                    />
                </View>
            }
            bottomDivider
            onPress={() => onSelectTrack(item.id)}>
            {!!item.thumbnail && <SvgXml xml={item.thumbnail} />}
            <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
        </ListItem.Swipeable>
    )
    
    return <Modal style={styles.container} visible onRequestClose={close}>        
        <View style={styles.buttons}>
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="file-upload" onPress={importTrack} />
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name={isTracking ? 'gps-not-fixed' : 'gps-fixed'} onPress={toggleTracking} />
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="share" onPress={() => selectTrack(undefined)} />
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="close" onPress={close} />
        </View>
        <View style={styles.scroll}>
            <FlatList
                keyExtractor={keyExtractor}
                data={list}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 30 }}
            />
        </View>
    </Modal>
}

export default connector(Tracks)


const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0, bottom: 0,
        marginTop: 20,
        width: '100%',
    },
    scroll: {
        height: '90%',
        backgroundColor: '#fff',
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
});
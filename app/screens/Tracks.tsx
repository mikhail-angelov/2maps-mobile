import React, { FC } from "react";
import { View, StyleSheet, Modal, Alert, TouchableOpacity } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { Button, ListItem } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import distance from '@turf/distance';
import { orderBy } from 'lodash'
import dayjs from 'dayjs'
import { State } from '../store/types'
import { selectIsTracking, selectTracks } from '../reducers/tracker'
import { selectTrackAction, startTrackingAction, stopTrackingAction, exportTrackAction, removeTrackAction, importTrackAction } from "../actions/tracker-actions";
import { SvgXml } from "react-native-svg";
import { useTranslation } from "react-i18next";
import Advertisement from "../components/AdMob";

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
    thumbnail?: string;
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
    const { t } = useTranslation();

    const toggleTracking = () => {
        if (isTracking) {
            stopTracking()
        } else {
            startTracking()
        }
    }
    const onSelectTrack = (id: string) => {
        console.log('onSelectTrack', id)
        const track = tracks.find((item) => item.id === id)
        selectTrack(track)
        close()
    }

    const onRemoveTrack = (itemId: string) => {
        Alert.alert(
            t('Warning!'),
            t('Are you sure to remove the track?'),
            [
                { text: t('No'), style: "cancel" },
                { text: t('Yes'), onPress: () => { removeTrack(itemId); selectTrack(undefined) } }
            ]
        );
    }

    const list: Item[] = orderBy(tracks, 'start', 'desc').map(({ id, name, start, end, track, thumbnail }) => {
        const l = distance(track[0], track[track.length - 1]).toFixed(3)
        const subtitle = `T: ${dayjs(end - start).format('HH:mm')}, L: ${l} km.`
        return {
            id,
            key: id,
            title: name || dayjs(start).format('YY.MM.DD HH:mm'),
            subtitle,
            thumbnail: thumbnail || '',
        }
    })

    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            activeOpacity={1}
            style={styles.row}
            onPress={() => onSelectTrack(item.id)}
        >
            <View style={{ minHeight: '100%', justifyContent: 'center', paddingRight: 10 }}>
                {!!item.thumbnail ? <SvgXml xml={item.thumbnail} /> : <Icon name='map' size={50} />}
            </View>
            <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
        </TouchableOpacity>
    )
    const renderHiddenItem = ({ item }: { item: Item }) => (
        <View style={{ flexDirection: "row", marginLeft: 'auto', maxWidth: 200 }}>
            <Button
                icon={{ name: 'file-download', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: '#6666FF', borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => exportTrack(item.id)}
            />
            <Button
                icon={{ name: 'delete', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: '#CC6666', borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => onRemoveTrack(item.id)}
            />
            <Button
                icon={{ name: 'visibility', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: '#669966', borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => onSelectTrack(item.id)}
            />
        </View>
    );

    return <Modal style={styles.container} visible onRequestClose={close}>
        <View style={styles.wrapper}>
            <View style={styles.buttons}>
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="file-upload" onPress={importTrack} />
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name={isTracking ? 'gps-not-fixed' : 'gps-fixed'} onPress={toggleTracking} />
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="share" onPress={() => selectTrack(undefined)} />
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="close" onPress={close} />
            </View>
            <View style={styles.scroll}>
                <SwipeListView
                    data={list}
                    renderItem={renderItem}
                    renderHiddenItem={renderHiddenItem}
                    leftOpenValue={0}
                    rightOpenValue={-200}
                    previewRowKey={list[0] ? list[0].id : undefined}
                    previewOpenValue={-40}
                    previewOpenDelay={1000}
                />
            </View>
        </View>
        <Advertisement />
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
    wrapper: {
        flex: 1,
    },
    scroll: {
        flex: 1,
        backgroundColor: '#fff',
    },
    row: {
        flexDirection: "row",
        textAlign: 'center',
        backgroundColor: "white",
        borderBottomColor: '#DDDDDD',
        borderBottomWidth: 1,
        height: 70,
        paddingHorizontal: 20,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: "flex-end",
        textAlign: 'center',
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
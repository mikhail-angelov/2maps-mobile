import React, { FC } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import distance from '@turf/distance';
import { orderBy } from 'lodash'
import dayjs from 'dayjs'
import { Track } from '../store/types'

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
}

interface Props {
    tracks: Track[];
    isTracking: boolean;
    select: (id: string) => void;
    toggleTracking: () => void;
    unSelect: () => void;
    close: () => void;
}

const Tracks: FC<Props> = ({ tracks, isTracking, toggleTracking, unSelect, select, close }) => {
    const list: Item[] = orderBy(tracks, 'start', 'desc').map(({ id, name, start, end, track }) => {
        const l = distance(track[0], track[track.length - 1]).toFixed(3)
        const subtitle = `T: ${dayjs(end - start).format('HH:mm')}, L: ${l} km.`
        return {
            id,
            title: `${dayjs(start).format('YY.MM.DD HH:mm')} ${name}`,
            subtitle,
        }
    })

    const keyExtractor = (item: Item) => item.id
    const renderItem = ({ item }: { item: Item }) => (
        <ListItem bottomDivider onPress={() => select(item.id)}>
            <Icon name='map' />
            <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
        </ListItem>
    )
    return <View style={styles.container}>
        <View style={styles.buttons}>
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name={isTracking ? 'gps-not-fixed' : 'gps-fixed'} onPress={toggleTracking} />
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="share" onPress={unSelect} />
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
    </View>
}

export default Tracks


const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0, bottom: 0,
        marginTop: 20,
        width: '100%',
    },
    scroll: {
        height: '90%',
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: "flex-end",
        padding: 10,
        backgroundColor: '#ccc',
    },
    titleButton: {
        textAlign: 'center',
        alignContent: 'center',
        padding: 10,
        margin: 10,
    },
});
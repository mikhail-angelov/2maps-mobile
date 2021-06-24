import React, { FC, useMemo } from "react";
import { View, FlatList, StyleSheet, Alert } from "react-native";
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Position } from '@turf/helpers';
import distance from '@turf/distance';
import { orderBy } from 'lodash'
import { Mark } from '../store/types'

interface Props {
    markers: Mark[];
    center: Position;
    close: () => void;
    importMarks: () => void;
    exportMarks: () => void;
    removeAll: () => void;
    select: (item: Mark) => void;
}
interface Item {
    title: string;
    subtitle: string;
    mark: Mark;
}

const Markers: FC<Props> = ({ markers, center, close, select, importMarks, exportMarks, removeAll }) => {
    const onRemoveAll = () => {
        Alert.alert(
            "Warning!",
            "Are you sure to remove all your markers?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: removeAll }
            ]
        );
    }
    const list: Item[] = orderBy(markers, mark => distance(mark.geometry.coordinates, center, { units: 'kilometers' }))
        .map(mark => ({
            title: mark.name,
            subtitle: `${distance(mark.geometry.coordinates, center, { units: 'kilometers' }).toFixed(2)} km, ${mark.description||''}`,
            mark,
        }))
    const keyExtractor = (item: Item, index: number) => index.toString()
    const renderItem = ({ item }: { item: Item }) => (
        <ListItem bottomDivider onPress={() => select(item.mark)}>
            <Icon name="location-pin" />
            <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Subtitle>{item.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
        </ListItem>
    )
    const memoizedValue = useMemo(() => renderItem, [markers]);
    return <View style={styles.container}>
        <View style={styles.buttons}>
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="file-download" onPress={exportMarks} />
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="import-export" onPress={importMarks} />
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="delete" onPress={onRemoveAll} />
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="close" onPress={close} />
        </View>
        <View style={styles.scroll}>
            <FlatList
                keyExtractor={keyExtractor}
                data={list}
                renderItem={memoizedValue}
                contentContainerStyle={{ paddingBottom: 30 }}
            />
        </View>
    </View>
}

export default Markers

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
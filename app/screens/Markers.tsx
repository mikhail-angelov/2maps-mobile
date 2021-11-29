import React, { FC, useMemo } from "react";
import { View, FlatList, StyleSheet, Alert, Modal } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { ListItem } from 'react-native-elements';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Position } from '@turf/helpers';
import distance from '@turf/distance';
import { orderBy } from 'lodash'
import { State, Mark } from '../store/types'
import { selectIsAuthenticated } from '../reducers/auth'
import { selectMarks } from '../reducers/marks'
import { importPoisAction, exportPoisAction, removeAllPoisAction, syncMarksAction } from '../actions/marks-actions'


interface OwnProps {
    center: Position;
    close: () => void;
    select: (item: Mark) => void;
}
interface Item {
    title: string;
    subtitle: string;
    mark: Mark;
}

const mapStateToProps = (state: State) => ({
    markers: selectMarks(state),
    isAuthenticated: selectIsAuthenticated(state),
});
const mapDispatchToProps = {
    importPois: importPoisAction,
    exportPois: exportPoisAction,
    removeAllPois: removeAllPoisAction,
    syncMarks: syncMarksAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & OwnProps

const Markers: FC<Props> = ({ markers, center, isAuthenticated, close, select, importPois, exportPois, removeAllPois, syncMarks }) => {
    const onRemoveAll = () => {
        Alert.alert(
            "Warning!",
            "Are you sure to remove all your markers?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: removeAllPois }
            ]
        );
    }
    const list: Item[] = orderBy(markers, mark => distance(mark.geometry.coordinates, center, { units: 'kilometers' }))
        .map(mark => ({
            title: mark.name,
            subtitle: `${distance(mark.geometry.coordinates, center, { units: 'kilometers' }).toFixed(2)} km, ${mark.description || ''}`,
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
    return <Modal style={styles.container} visible onRequestClose={close}>
        <View style={styles.buttons}>
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="file-download" onPress={exportPois} />
            <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="file-upload" onPress={importPois} />
            {isAuthenticated && <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="import-export" onPress={syncMarks} />}
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
    </Modal>
}

export default connector(Markers)

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
        backgroundColor: '#303846',
    },
    titleButton: {
        textAlign: 'center',
        alignContent: 'center',
        padding: 10,
        margin: 10,
    },
});
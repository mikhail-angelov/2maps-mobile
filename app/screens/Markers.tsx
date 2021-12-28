import React, { FC, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Modal, TouchableOpacity } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { Button, ListItem } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Position } from '@turf/helpers';
import distance from '@turf/distance';
import { orderBy } from 'lodash'
import { State, Mark } from '../store/types'
import { selectIsAuthenticated } from '../reducers/auth'
import { selectMarks } from '../reducers/marks'
import { importPoisAction, exportPoisAction, removeAllPoisAction, syncMarksAction, removeMarkCompletelyAction, editMarkAction } from '../actions/marks-actions'
import { useTranslation } from "react-i18next";
import Advertisement from "../components/AdMob";
import MapModal from "../components/Modal";
import { renderColor } from "../utils/formats";
import { purple } from "../constants/color";

interface OwnProps {
    center: Position;
    close: () => void;
    select: (item: Mark) => void;
}
interface Item {
    rate: number;
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
    removeMark: removeMarkCompletelyAction,
    editMark: editMarkAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & OwnProps

const Markers: FC<Props> = ({ markers, center, isAuthenticated, close, select, importPois, exportPois, removeAllPois, syncMarks, removeMark, editMark }) => {
    const { t } = useTranslation();

    const list: Item[] = orderBy(markers, mark => distance(mark.geometry.coordinates, center, { units: 'kilometers' }))
    .map(mark => ({
        rate: mark.rate,
        key: mark.id,
        title: mark.name,
        subtitle: `${distance(mark.geometry.coordinates, center, { units: 'kilometers' }).toFixed(2)} km, ${mark.description || ''}`,
        mark,
    }));

    const [isFilterMarks, setIsFilterMarks] = useState<boolean>(false);
    const [filterText, setFilterText] = useState<string>('');
    const [filterList, setFilterList] = useState<Item[]>(list);

    const onRemoveAll = () => {
        Alert.alert(
            t('Warning!'),
            t('Are you sure to remove all your markers?'),
            [
                { text: t('No'), style: "cancel" },
                { text: t('Yes'), onPress: removeAllPois }
            ]
        );
    }
    const onRemoveMark = (id?: string) => {
        if (!id) return
        Alert.alert(
            t('Warning!'),
            t('Are you sure to remove the marker?'),
            [
                { text: t('No'), style: "cancel" },
                { text: t('Yes'), onPress: () => removeMark(id) }
            ]
        );
    }
    
    const setFilterMarks = () => {
        const newMarkList = filterText ? list.filter(item => item.title.includes(filterText) || item.subtitle.includes(filterText)) : list;
        setFilterList(newMarkList);
        setIsFilterMarks(false);
    }

    const setFilterReset = () => {
        setFilterText('');
        setFilterList(list);
        setIsFilterMarks(false);
    }

    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            activeOpacity={1}
            style={styles.row}
            onPress={() => select(item.mark)}
        >
            <View style={{ minHeight: '100%', justifyContent: 'center', paddingRight: 10 }}>
                <Icon style={{color: renderColor(item.rate)}} size={30} name="location-pin" />
            </View>
            <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Subtitle style={{color: '#aaa'}}>{item.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
        </TouchableOpacity>
    )
    const renderHiddenItem = ({ item }: { item: Item }) => (
        <View style={{ flexDirection: "row", marginLeft: 'auto', maxWidth: 150 }}>
            <Button
                icon={{ name: 'edit', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: '#6666FF', borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => editMark(item.mark)}
            />
            <Button
                icon={{ name: 'delete', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: '#CC6666', borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => onRemoveMark(item.mark.id)}
            />
        </View>
    );
    const memoizedValue = useMemo(() => renderItem, [markers]);
    const memoizedHiddenValue = useMemo(() => renderHiddenItem, [markers]);
    return <Modal style={styles.container} visible onRequestClose={close}>
        <View style={styles.wrapper}>
            <View style={styles.buttons}>
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="search" onPress={() => setIsFilterMarks(true)} />
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="file-download" onPress={exportPois} />
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="file-upload" onPress={importPois} />
                {isAuthenticated && <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="import-export" onPress={syncMarks} />}
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="delete" onPress={onRemoveAll} />
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="close" onPress={close} />
            </View>
            <View style={styles.scroll}>
                <SwipeListView
                    data={filterList}
                    renderItem={memoizedValue}
                    renderHiddenItem={memoizedHiddenValue}
                    leftOpenValue={0}
                    rightOpenValue={-150}
                    previewRowKey={filterList[0] ? filterList[0].mark.id : undefined}
                    previewOpenValue={-40}
                    previewOpenDelay={1000}
                />
            </View>
        </View>
        <Advertisement />
        {isFilterMarks && (
            <MapModal onRequestClose={() => setIsFilterMarks(false)}>
                <View style={styles.filterContainer}>
                    <Text style={styles.inputLabel}>{t('Filter')}:</Text>
                    <TextInput
                        style={styles.modalInput}
                        onChangeText={(value) => setFilterText(value)}
                        value={filterText}
                    />
                    <View style={styles.buttonsRow}>
                        <Button buttonStyle={styles.btn} title={t('Apply')} onPress={setFilterMarks} />
                        <Button titleStyle={styles.inlineBtn} type='clear' onPress={setFilterReset} title={t('Clear')} />
                    </View>
                </View>
            </MapModal>
        )}
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
    wrapper: {
        flex: 1,
    },
    scroll: {
        flex: 1,
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
        textAlign: 'center',
        justifyContent: "space-between",
        padding: 5,
        backgroundColor: '#303846',
    },
    titleButton: {
        textAlign: 'center',
        alignContent: 'center',
        padding: 10,
        margin: 10,
    },
    filterContainer: {
        marginTop: 20,
        width: '100%',
    },
    inputLabel: {
        marginBottom: 5,
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
    modalInput: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'grey',
        marginBottom: 10,
        width: '100%',
    },
    buttonsRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        marginBottom: 15,
    },
    btn: {
        paddingHorizontal: 20,
        backgroundColor: purple,
    },
    inlineBtn: {
        color: purple,
    }
});
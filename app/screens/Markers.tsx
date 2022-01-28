import React, { FC, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Modal, TouchableOpacity } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { Button, ListItem } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
    MenuProvider,
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import { Position } from '@turf/helpers';
import distance from '@turf/distance';
import { orderBy } from 'lodash'
import { State, Mark } from '../store/types'
import { selectIsAuthenticated } from '../reducers/auth'
import { selectMarks } from '../reducers/marks'
import { importPoisAction, exportPoisAction, removeAllPoisAction, syncMarksAction, removeMarkCompletelyAction, editMarkAction } from '../actions/marks-actions'
import { useTranslation } from "react-i18next";
import Advertisement from "../components/AdMob";
import { renderColor } from "../utils/formats";
import { emptyListText, purple, red } from "../constants/color";
import * as _ from 'lodash';

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

    const onFilterMarks = (text?: string) => {
        setFilterText(text || '');
        const newMarkList = text
            ? list.filter(item => item.title.toLowerCase().includes(text.toLowerCase()) ||
                item.subtitle.toLowerCase().includes(text.toLowerCase()))
            : list;
        setFilterList(newMarkList);
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
                <Icon style={{ color: renderColor(item.rate) }} size={30} name="location-pin" />
            </View>
            <ListItem.Content>
                <ListItem.Title>{item.title}</ListItem.Title>
                <ListItem.Subtitle style={{ color: '#aaa' }}>{item.subtitle}</ListItem.Subtitle>
            </ListItem.Content>
        </TouchableOpacity>
    )
    const renderHiddenItem = ({ item }: { item: Item }) => (
        <View style={{ flexDirection: "row", marginLeft: 'auto', maxWidth: 150 }}>
            <Button
                icon={{ name: 'edit', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: purple, borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => editMark(item.mark)}
            />
            <Button
                icon={{ name: 'delete', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: red, borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => onRemoveMark(item.mark.id)}
            />
        </View>
    );
    const memoizedValue = useMemo(() => renderItem, [markers]);
    const memoizedHiddenValue = useMemo(() => renderHiddenItem, [markers]);
    useEffect(() => {
        setFilterList(list)
    }, [markers])
    return <Modal style={styles.container} visible onRequestClose={close}>
        <MenuProvider>
            <View style={styles.wrapper}>
                <View style={styles.buttons}>
                    <View style={styles.buttonsContainer}>
                        <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="arrow-back-ios" onPress={close} />
                        {isFilterMarks ? (
                            <View style={styles.filterContainer}>
                                <TextInput
                                    placeholder={t('filter')}
                                    style={styles.filterInput}
                                    onChangeText={(value) => onFilterMarks(value)}
                                    value={filterText}
                                />
                                <Button buttonStyle={styles.btn} titleStyle={styles.inlineBtn} type='clear' onPress={setFilterReset} title='&#215;' />
                            </View>
                        ) : (
                            <View style={styles.buttonsWithoutClose}>
                                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="search" onPress={() => setIsFilterMarks(!isFilterMarks)} />
                                <Menu >
                                    <MenuTrigger><Icon style={styles.menuMainIcon} name="menu" /></MenuTrigger>
                                    <MenuOptions >
                                        <MenuOption onSelect={exportPois}>
                                            <View style={styles.menuOptionContainer}>
                                                <Icon style={styles.menuIcon} name="file-download" />
                                                <Text style={styles.menuText}>{t('Export Marks')}</Text>
                                            </View>
                                        </MenuOption>
                                        <MenuOption onSelect={importPois}>
                                            <View style={styles.menuOptionContainer}>
                                                <Icon style={styles.menuIcon} name="file-upload" />
                                                <Text style={styles.menuText}>{t('Import Mark')}</Text>
                                            </View>
                                        </MenuOption>
                                        {isAuthenticated &&
                                            <MenuOption onSelect={syncMarks}>
                                                <View style={styles.menuOptionContainer}>
                                                    <Icon style={styles.menuIcon} name="import-export" />
                                                    <Text style={styles.menuText}>{t('Sync Mark')}</Text>
                                                </View>
                                            </MenuOption>
                                        }
                                        <MenuOption onSelect={onRemoveAll}>
                                            <View style={styles.menuOptionContainer}>
                                                <Icon style={styles.menuIcon} name="delete" />
                                                <Text style={styles.menuText}>{t('Remove Marks')}</Text>
                                            </View>
                                        </MenuOption>
                                    </MenuOptions>
                                </Menu>
                            </View>
                        )}
                    </View>
                    <View style={styles.headerTitleContainer}>
                        <Text style={styles.title}>{t('Marks')}</Text>
                    </View>
                </View>
                {_.isEmpty(list) ? 
                <View style={styles.scroll} accessibilityLabel={t('No Items')}>
                    <Text style={styles.sheetText}>{t('No Items')}</Text>
                </View>
                : 
                <View style={styles.scroll} accessibilityLabel={t('Marks')}>
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
                }
            </View>
            <Advertisement />
        </MenuProvider>
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
        maxWidth: '100%',
        flexDirection: 'column',
        textAlign: 'center',
        padding: 5,
        backgroundColor: purple,
    },
    buttonsContainer: {
        flexDirection: 'row',
    },
    headerTitleContainer: {
        width: '100%',
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
    },
    buttonsWithoutClose: {
        flexDirection: 'row',
        textAlign: 'center',
        justifyContent: "space-between",
        width: '80%',
    },
    titleButton: {
        textAlign: 'center',
        alignContent: 'center',
        padding: 5,
        margin: 10,
        height: 40,
    },
    filterContainer: {
        paddingTop: 5,
        width: '80%',
        flexDirection: 'row',
        justifyContent: 'center'
    },
    filterInput: {
        borderRadius: 5,
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
        borderWidth: 1,
        borderRightWidth: 0,
        borderColor: 'grey',
        paddingHorizontal: 10,
        backgroundColor: 'white',
        width: '80%',
        height: 50,
    },
    btn: {
        borderRadius: 5,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,
        borderWidth: 1,
        borderLeftWidth: 0,
        borderColor: 'grey',
        height: 50,
        backgroundColor: 'white',
    },
    inlineBtn: {
        color: purple,
        fontSize: 20,
    },
    title: {
        marginTop: 12,
        color: 'white',
        fontSize: 24,
        fontWeight: '700',
    },
    menuMainIcon: {
        textAlign: 'center',
        alignContent: 'center',
        padding: 10,
        margin: 10,
        marginBottom: 5,
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
    sheetText: {
        color: emptyListText,
        textAlignVertical: "center",
        textAlign: "center",
        height: "100%",
        width: "100%",
        fontSize: 16,
    }
});
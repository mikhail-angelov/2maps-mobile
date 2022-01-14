import React, { FC, useEffect } from "react";
import { View, StyleSheet, Modal, Alert, TouchableOpacity } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { Button, ListItem, Text } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { orderBy } from 'lodash'
import dayjs from 'dayjs'
import {
    MenuProvider,
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
} from 'react-native-popup-menu';
import { State } from '../store/types'
import { selectSelectedTrack, selectTracks } from '../reducers/tracker'
import { selectTrackAction, exportTrack, removeTrackAction, importTrackAction, updateTrackListAction, clearTrackListAction } from "../actions/tracker-actions";
import { SvgXml } from "react-native-svg";
import { useTranslation } from "react-i18next";
import Advertisement from "../components/AdMob";
import { emptyListText, green, purple, red } from "../constants/color";
import * as _ from 'lodash';

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
    selectedTrack: selectSelectedTrack(state),
});
const mapDispatchToProps = {
    selectTrack: selectTrackAction,
    removeTrack: removeTrackAction,
    importTrack: importTrackAction,
    updateTrackList: updateTrackListAction,
    clearTrackList: clearTrackListAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

const Tracks: FC<Props> = ({ tracks, selectedTrack, selectTrack, close, removeTrack, importTrack, updateTrackList, clearTrackList }) => {
    const { t } = useTranslation();

    const onSelectTrack = (id: string) => {
        if (id === selectedTrack?.id) {
            selectTrack(undefined);
        } else {
            console.log('onSelectTrack', id)
            const track = tracks.find((item) => item.id === id)
            selectTrack(track)
            close()
        }
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

    const list: Item[] = orderBy(tracks, 'start', 'desc').map(({ id, name, start, end, distance, thumbnail }) => {
        const subtitle = `T: ${dayjs(end - start).format('HH:mm')}, L: ${distance} km.`
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
                buttonStyle={{ minHeight: '100%', backgroundColor: purple, borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => exportTrack(item.id)}
            />
            <Button
                icon={{ name: 'delete', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: red, borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => onRemoveTrack(item.id)}
            />
            <Button
                icon={{ name: item.id !== selectedTrack?.id ? 'visibility' : 'visibility-off', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: green, borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => onSelectTrack(item.id)}
            />
        </View>
    );
    
    useEffect(() => {
        updateTrackList()
        return () => {clearTrackList()}
    }, [])

    return <Modal style={styles.container} visible onRequestClose={close}>
        <MenuProvider>
            <View style={styles.wrapper}>
                <View style={styles.buttons}>
                    <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="arrow-back-ios" onPress={close} />
                    <Text style={styles.title}>{t('Tracks')}</Text>
                    <Menu>
                        <MenuTrigger><Icon style={styles.menuMainIcon} name="menu" /></MenuTrigger>
                        <MenuOptions >
                            <MenuOption onSelect={importTrack}>
                                <View style={styles.menuOptionContainer}>
                                    <Icon style={styles.menuIcon} name="file-upload" />
                                    <Text style={styles.menuText}>{t('Import Track')}</Text>
                                </View>
                            </MenuOption>
                        </MenuOptions>
                    </Menu>
                </View>
                {_.isEmpty(list) ? 
                <View style={styles.scroll} accessibilityLabel={t('No Items')}>
                    <Text style={styles.sheetText}>{t('No Items')}</Text>
                </View>
                : 
                <View style={styles.scroll} accessibilityLabel={t('Tracks')}>
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
                }
                
            </View>
            <Advertisement />
        </MenuProvider>
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
        justifyContent: "space-between",
        textAlign: 'center',
        paddingHorizontal: 10,
        backgroundColor: purple,
    },
    titleButton: {
        textAlign: 'center',
        alignContent: 'center',
        padding: 10,
        margin: 10,
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
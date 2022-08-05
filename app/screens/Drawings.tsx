import React, { FC, useEffect } from "react";
import { View, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { Button, ListItem, Text } from 'react-native-elements';
import { SwipeListView } from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { orderBy } from 'lodash'
import dayjs from 'dayjs'
import { State, ModalActionType } from '../store/types'
import { showModalAction } from "../actions/ui-actions";
import { SvgXml } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { emptyListText, purple, red } from "../constants/color";
import * as _ from 'lodash';
import { selectAllDrawings } from "../reducers/drawings";
import { setActualDrawingAction, removeDrawingAction, getDrawingThumbnailsFromSvgFilesAction, removeDrawingThumbnailFromStateAction } from "../actions/drawing-actions";

interface Item {
    id: string;
    title: string;
    subtitle: string;
    thumbnail?: string;
}

const mapStateToProps = (state: State) => ({
    drawings: selectAllDrawings(state),
});
const mapDispatchToProps = {
    showModal: showModalAction,
    setActualDrawing: setActualDrawingAction,
    removeDrawing: removeDrawingAction,
    getDrawingThumbnailsFromSvgFiles: getDrawingThumbnailsFromSvgFilesAction,
    removeDrawingThumbnailFromState: removeDrawingThumbnailFromStateAction
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

const Drawings: FC<Props> = ({ drawings, close, showModal, setActualDrawing, removeDrawing, getDrawingThumbnailsFromSvgFiles, removeDrawingThumbnailFromState }) => {
    const { t } = useTranslation();

    const onSelectDrawing = (id: string) => {
        setActualDrawing(id)
        close()
    }

    const onRemoveDrawing = (itemId: string) => {
        showModal({
            title: t('Warning!'), text: t('Are you sure to remove the drawing?'), actions: [
                { text: t('No'), type: ModalActionType.cancel },
                { text: t('Yes'), type: ModalActionType.default, handler: () => { removeDrawing(itemId) } },
            ]
        })
    }

    const list: Item[] = orderBy(drawings, 'date', 'desc').map(({ id, name, date, thumbnail }) => {
        const subtitle = `T: ${dayjs(date).format('YY.MM.DD HH:mm')}`
        return {
            id,
            key: id,
            title: `${name}`,
            subtitle,
            thumbnail: thumbnail || '',
        }
    })

    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            activeOpacity={1}
            style={styles.row}
            onPress={() => onSelectDrawing(item.id)}
        >
            <View style={{ minHeight: '100%', justifyContent: 'center', paddingRight: 10 }}>
                {!!item.thumbnail ? <SvgXml xml={item.thumbnail} /> : <Icon name='image-search' size={50} />}
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
                icon={{ name: 'delete', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: red, borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => onRemoveDrawing(item.id)}
            />
        </View>
    )
    
    useEffect(()=> {
        getDrawingThumbnailsFromSvgFiles()
        return () => removeDrawingThumbnailFromState()
    }, [])

    return <Modal style={styles.container} visible onRequestClose={close}>
        <View style={styles.wrapper}>
            <View style={styles.buttons}>
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="arrow-back-ios" onPress={close} />
                <Text style={styles.title}>{t('Drawings')}</Text>
            </View>
            {_.isEmpty(list) ?
                <View style={styles.scroll} accessibilityLabel={t('No Items')}>
                    <Text style={styles.sheetText}>{t('No Items')}</Text>
                </View>
                :
                <View style={styles.scroll} accessibilityLabel={t('Drawings')}>
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
    </Modal>
}

export default connector(Drawings)

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
        position: 'absolute',
        left: 50,
        right: 50,
        textAlign: 'center',
        marginTop: 12,
        color: 'white',
        fontSize: 24,
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
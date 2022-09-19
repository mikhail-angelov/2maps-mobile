import React, { FC } from "react";
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
import { selectTrips } from "../reducers/trips";
import { removeTripAction, setActualTripAction } from "../actions/trips-actions";

interface Item {
    id: string;
    title: string;
    subtitle: string;
    thumbnail?: string;
}

const mapStateToProps = (state: State) => ({
    trips: selectTrips(state),
});
const mapDispatchToProps = {
    showModal: showModalAction,
    setActualTrip: setActualTripAction,
    removeTrip: removeTripAction,
};
const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & { close: () => void }

const Drawings: FC<Props> = ({ trips, close, showModal, setActualTrip, removeTrip }) => {
    const { t } = useTranslation();

    const onSelectTrip = (id: string) => {
        setActualTrip(id)
        close()
    }

    const onRemoveTrip = (itemId: string) => {
        showModal({
            title: t('Warning!'), text: t('Are you sure to remove the trip?'), actions: [
                { text: t('No'), type: ModalActionType.cancel },
                { text: t('Yes'), type: ModalActionType.default, handler: () => { removeTrip(itemId) } },
            ]
        })
    }

    const list: Item[] = orderBy(trips, 'date', 'desc').map(({ id, name, date }) => {
        const subtitle = `T: ${dayjs(date).format('YY.MM.DD HH:mm')}`
        return {
            id,
            key: id,
            title: `${name}`,
            subtitle,
        }
    })

    const renderItem = ({ item }: { item: Item }) => (
        <TouchableOpacity
            activeOpacity={1}
            style={styles.row}
            onPress={() => onSelectTrip(item.id)}
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
        <View style={{ flexDirection: "row", marginLeft: 'auto', width: 100 }}>
            <Button
                icon={{ name: 'delete', color: 'white' }}
                buttonStyle={{ minHeight: '100%', backgroundColor: red, borderRadius: 0 }}
                containerStyle={{ flex: 1, borderRadius: 0 }}
                onPress={() => onRemoveTrip(item.id)}
            />
        </View>
    )
    
    return <Modal style={styles.container} visible onRequestClose={close}>
        <View style={styles.wrapper}>
            <View style={styles.buttons}>
                <Icon.Button style={styles.titleButton} backgroundColor="#fff0" name="arrow-back-ios" onPress={close} />
                <Text style={styles.title}>{t('Trips')}</Text>
            </View>
            {_.isEmpty(list) ?
                <View style={styles.scroll} accessibilityLabel={t('No Items')}>
                    <Text style={styles.sheetText}>{t('No Items')}</Text>
                </View>
                :
                <View style={styles.scroll} accessibilityLabel={t('Trips')}>
                    <SwipeListView
                        data={list}
                        renderItem={renderItem}
                        renderHiddenItem={renderHiddenItem}
                        leftOpenValue={0}
                        rightOpenValue={-100}
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
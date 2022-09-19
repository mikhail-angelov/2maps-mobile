import React from "react";
import { FlatList, ListRenderItem, StyleSheet, View } from "react-native";
import { Button, ListItem, Text } from "react-native-elements";
import { connect, ConnectedProps } from "react-redux";
import { selectTrips } from "../reducers/trips";
import { Mark, ModalActionType, State, Trip } from "../store/types";
import MapModal from "./Modal";
import i18next from "i18next";
import { addMarkToNewTripAction, addMarkToTripAction } from "../actions/trips-actions";
import { showModalAction } from "../actions/ui-actions";
import dayjs from "dayjs";

interface OwnProps {
    markAppendedToTrip: Mark
    onClose: () => void
}

const mapStateToProps = (state: State) => ({
    trips: selectTrips(state)
});

const mapDispatchToProps = {
    addMarkToNewTrip: addMarkToNewTripAction,
    addMarkToTrip: addMarkToTripAction,
    showModal: showModalAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & OwnProps

const TripSelectionDialog: React.FC<Props> = ({ markAppendedToTrip, trips, onClose, addMarkToNewTrip, showModal, addMarkToTrip }) => {
    const onNewTripButton = () => {
        showModal({
            title: `${i18next.t('Create a new trip')}`,
            text: `${i18next.t('Trip name:')}`,
            actions: [
                { type: ModalActionType.input },
                {
                    text: 'Cancel',
                    type: ModalActionType.cancel,
                },
                {
                    text: 'Ok',
                    type: ModalActionType.default,
                    handler: (text) => {
                        const tripName = text || ''
                        addMarkToNewTrip(tripName, markAppendedToTrip)
                        onClose()
                    },
                },
            ],
        })
    }
    const onSelectTrip = (tripId: string) => {
        addMarkToTrip(markAppendedToTrip, tripId)
        onClose()
    }

    const renderTripsItem: ListRenderItem<Trip> = ({ item }) => (<ListItem
        onPress={() => onSelectTrip(item.id)}
        bottomDivider
    >
        <ListItem.Content>
            <ListItem.Title><Text>{item.name}</Text></ListItem.Title>
            <ListItem.Subtitle>{dayjs(item.date).format('YY.MM.DD HH:mm')}</ListItem.Subtitle>
        </ListItem.Content>
    </ListItem>)

    return (
        <MapModal onRequestClose={onClose} accessibilityLabel="info mark">
            <View style={styles.newTripContainer}>
                <Button
                    icon={{ name: 'control-point', color: 'gray' }}
                    titleStyle={{ fontSize: 20 }}
                    title={i18next.t('add a new trip')}
                    iconPosition="top"
                    containerStyle={styles.newTripButtonContainer}
                    type="outline"
                    buttonStyle={styles.newTripButton}
                    onPress={onNewTripButton}
                >
                </Button>
            </View>
            <View style={styles.listOfTripsContainer}>
                <FlatList
                    keyExtractor={(item, index) => index.toString()}
                    data={trips}
                    renderItem={renderTripsItem}

                />
            </View>
        </MapModal>
    )
}

export default connector(TripSelectionDialog)

const styles = StyleSheet.create({
    row: {
        flexDirection: "row",
        textAlign: 'center',
        backgroundColor: "white",
        borderBottomColor: '#DDDDDD',
        borderBottomWidth: 1,
        height: 70,
        paddingHorizontal: 20,
    },
    newTripContainer: {
        width: '100%',
        marginTop: 40,
        marginBottom: 20,
    },
    newTripButtonContainer: {
        width: '100%',
    },
    newTripButton: {
        borderColor: 'rgb(78, 116, 289)',
        borderRadius: 10,
        borderStyle: 'dashed'
    },
    listOfTripsContainer: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#eee',
        maxHeight: '80%',
    }
})
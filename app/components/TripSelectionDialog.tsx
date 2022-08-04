import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Button, ListItem } from "react-native-elements";
import { connect, ConnectedProps } from "react-redux";
import { selectTrips } from "../reducers/trips";
import { Mark, ModalActionType, State } from "../store/types";
import MapModal from "./Modal";
import i18next from "i18next";
import { addMarkToNewTripAction } from "../actions/trips-actions";
import { showModalAction } from "../actions/ui-actions";

interface OwnProps {
    markAppendedToTrip: Mark
    onClose: () => void
}

const mapStateToProps = (state: State) => ({
    trips: selectTrips(state)
});

const mapDispatchToProps = {
    addMarkToNewTrip: addMarkToNewTripAction,
    showModal: showModalAction,
};

const connector = connect(mapStateToProps, mapDispatchToProps)
type Props = ConnectedProps<typeof connector> & OwnProps

const TripSelectionDialog: React.FC<Props> = ({ markAppendedToTrip, trips, onClose, addMarkToNewTrip, showModal }) => {
    const onNewTripButton = () => {
    }
    const onSelectTrip = (tripId: string) => {
    }
    return (
        <MapModal onRequestClose={onClose} accessibilityLabel="info mark">
            <View style={styles.newTripContainer}>
                <Button
                    icon={{ name: 'control-point', color: 'gray' }}
                    titleStyle={{ fontSize: 20}}
                    title={i18next.t('add new trip')}
                    iconPosition="top"
                    containerStyle={styles.newTripButtonContainer}
                    type="outline"
                    buttonStyle={styles.newTripButton}
                    onPress={onNewTripButton}
                    >
                </Button>
            </View>
            <View>
                {trips.map((item) => (
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.row}
                        onPress={() => onSelectTrip(item.id)}
                    >
                        <ListItem.Content>
                            <ListItem.Title>{item.name}</ListItem.Title>
                            <ListItem.Subtitle>{item.date}</ListItem.Subtitle>
                        </ListItem.Content>
                    </TouchableOpacity>))}
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
    }
})
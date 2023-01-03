import React, { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { State, Mark, MarkType, Trip } from '../store/types'
import MapboxGL from "@rnmapbox/maps";
import { useTranslation } from "react-i18next";

interface OwnProps {
    mark?: Mark;
    trip?: Trip;
    unselect: () => void;
    openEdit: () => void;
}
const mapStateToProps = (state: State) => ({

});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> & OwnProps;

const SelectedMark: FC<Props> = ({ mark, trip, unselect, openEdit }) => {
    const {t} = useTranslation()
    if (!mark) {
        return null
    }

    const markName = mark.type === MarkType.TRIP ? `${(mark.selectedMarkIndex || 0) + 1}. ${trip?.name ? trip.name: t('Trip')}: ${mark.name}`: mark.name

    return (<MapboxGL.MarkerView
        id="sel"
        coordinate={mark.geometry.coordinates}
        title={markName}
        anchor={{ x: 0.5, y: 0.99 }}
    >
        <TouchableOpacity delayLongPress={500} onLongPress={openEdit} onPress={unselect} style={styles.touchable}>
            <MapboxGL.Callout title={markName} />
        </TouchableOpacity>
    </MapboxGL.MarkerView>);
}

const styles = StyleSheet.create({
    touchable: {
        // backgroundColor: 'blue',
        // width: 40,
        height: 50,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default connector(SelectedMark)


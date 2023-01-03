import React, { FC } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { connect, ConnectedProps } from "react-redux";
import { State, Mark } from '../store/types'
import MapboxGL, { LineLayerStyle, SymbolLayerStyle } from "@rnmapbox/maps";

const WikiStyle: LineLayerStyle = {
    lineWidth: 2,
    lineColor: 'red',
    lineOpacity: 0.6,
}
const WikiStyleLabel: SymbolLayerStyle = {
    textColor: 'red',
    textSize: 18,
    textField: ['get', 'title'],
    textAnchor: 'bottom',
}

interface OwnProps {
    mark?: Mark;
    unselect: () => void;
    openEdit: () => void;
}
const mapStateToProps = (state: State) => ({

});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> & OwnProps;

const SelectedMark: FC<Props> = ({ mark, unselect, openEdit }) => {
    if (!mark) {
        return null
    }

    return (<MapboxGL.MarkerView
        id="sel"
        coordinate={mark.geometry.coordinates}
        title={mark.name}
        anchor={{ x: 0.5, y: 1.2 }}
    >
        <TouchableOpacity delayLongPress={500} onLongPress={openEdit} onPress={unselect} style={styles.touchable}>
            <MapboxGL.Callout title={mark.name} />
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


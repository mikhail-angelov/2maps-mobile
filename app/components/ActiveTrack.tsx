import React, { FC, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import MapboxGL, { LineLayerStyle } from "@react-native-mapbox-gl/maps";
import { lineString } from '@turf/helpers';
import { selectActiveTrack, selectSelectedTrack } from '../reducers/tracker'
import { Position } from "geojson";

const ActiveTrackStyle: LineLayerStyle = {
    lineCap: 'round',
    lineWidth: 6,
    // lineWidth: [
    //     'interpolate', ['linear'],
    //     ['zoom'],
    //     16, 1,
    //     20, 3
    // ],
    lineOpacity: 0.84,
    lineColor: 'red',
}
const SelectedTrackStyle: LineLayerStyle = {
    lineCap: 'round',
    lineWidth: 6,
    lineOpacity: 0.84,
    lineColor: 'blue',
}

interface ActiveTrackProps{
    onTrackSelect: (start: Position, end: Position) => void
}
const mapStateToProps = (state: State) => ({
    activeTrack: selectActiveTrack(state),
    selectedTrack: selectSelectedTrack(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> & ActiveTrackProps

const ActiveTrack: FC<Props> = ({ activeTrack, selectedTrack, onTrackSelect }) => {
    const activeRoute = activeTrack && activeTrack.track.length > 1 ? lineString(activeTrack.track) : null
    const selectedRoute = selectedTrack && selectedTrack.track.length > 1 ? lineString(selectedTrack.track) : null

    useEffect(() => {
        if (selectedRoute && selectedTrack) {
            const start = selectedRoute.geometry.coordinates[0]
            const end = selectedRoute.geometry.coordinates[selectedRoute.geometry.coordinates.length - 1]
            onTrackSelect(start, end)
        }
    }, [selectedTrack])

    return (<>{activeRoute && <MapboxGL.ShapeSource id='active-track' shape={activeRoute}>
        <MapboxGL.LineLayer id='activeLineLayer' style={ActiveTrackStyle} minZoomLevel={1} />
    </MapboxGL.ShapeSource>}
        {selectedRoute && <MapboxGL.ShapeSource id='selected-track' shape={selectedRoute}>
            <MapboxGL.LineLayer id='selectedLineLayer' style={SelectedTrackStyle} minZoomLevel={1} />
        </MapboxGL.ShapeSource>}
    </>);
}

export default connector(ActiveTrack)

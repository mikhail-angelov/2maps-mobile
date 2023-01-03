import React, { FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State, Tracking } from '../store/types'
import MapboxGL, { LineLayerStyle } from "@rnmapbox/maps";
import { lineString } from '@turf/helpers';
import { selectActiveTrack, selectSelectedTrack, selectIsTracking } from '../reducers/tracker'
import { purple } from "../constants/color";

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
    lineColor: purple,
}

const mapStateToProps = (state: State) => ({
    activeTrack: selectActiveTrack(state),
    selectedTrack: selectSelectedTrack(state),
    tracking: selectIsTracking(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector>

const ActiveTrack: FC<Props> = ({ activeTrack, selectedTrack, tracking }) => {
    const activeRoute = activeTrack && activeTrack?.track?.length > 1 ? lineString(activeTrack.track) : null
    const selectedRoute = selectedTrack && selectedTrack?.track?.length > 1 ? lineString(selectedTrack.track) : null

    return (<>{activeRoute && tracking === Tracking.trackAndRecord && <MapboxGL.ShapeSource id='active-track' shape={activeRoute}>
        <MapboxGL.LineLayer id='activeLineLayer' style={ActiveTrackStyle} minZoomLevel={1} layerIndex={10000}/>
    </MapboxGL.ShapeSource>}
        {selectedRoute && <MapboxGL.ShapeSource id='selected-track' shape={selectedRoute}>
            <MapboxGL.LineLayer id='selectedLineLayer' style={SelectedTrackStyle} minZoomLevel={1} layerIndex={10001}/>
        </MapboxGL.ShapeSource>}
    </>);
}

export default connector(ActiveTrack)

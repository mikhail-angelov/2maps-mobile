import React, { FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import MapboxGL, {  LineLayerStyle } from "@react-native-mapbox-gl/maps";
import { lineString } from '@turf/helpers';
import { selectActiveTrack } from '../reducers/tracker'


const TrackStyle: LineLayerStyle = {
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
const mapStateToProps = (state: State) => ({
    activeTrack: selectActiveTrack(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector>

const ActiveTrack: FC<Props> = ({ activeTrack }) => {
    const route = activeTrack && activeTrack.track.length > 1 ? lineString(activeTrack.track) : null
        
    if (!route) {
        return null
    }
    return (<MapboxGL.ShapeSource id='active-track' shape={route}>
        <MapboxGL.LineLayer id='lineLayer' style={TrackStyle} minZoomLevel={1} />
    </MapboxGL.ShapeSource>);
}

export default connector(ActiveTrack)

import React, { FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import MapboxGL, { CircleLayerStyle, LineLayerStyle } from "@react-native-mapbox-gl/maps";
import { lineString, point } from '@turf/helpers';
import { selectActiveTrack, selectSelectedTrack } from '../reducers/tracker'
import { Position } from "geojson";
import { findMinMaxCoordinates } from "../utils/normalize";
import { Feature, LineString, Point } from 'geojson'

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

const SelectedPointStyle: CircleLayerStyle = {
    circleRadius: 7,
    circleColor: "blue",
    circleOpacity: 0.84,
}
interface ActiveTrackProps {
    onTrackSelect: (start: Position, end: Position) => void
}
const mapStateToProps = (state: State) => ({
    activeTrack: selectActiveTrack(state),
    selectedTrack: selectSelectedTrack(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> & ActiveTrackProps

const ActiveTrack: FC<Props> = ({ activeTrack, selectedTrack, onTrackSelect }) => {
    let selectedRoute: Feature<LineString> | null = null
    let selectedPoint: Feature<Point> | null = null
    const activeRoute = activeTrack && activeTrack.track.length > 1 ? lineString(activeTrack.track) : null

    if (selectedTrack) {
        let { maxX, maxY, minX, minY } = findMinMaxCoordinates(selectedTrack.track)
        if (!maxX || !maxY || !minX || !minY) {
            return null
        }

        if ((maxX === minX) && (maxY === minY)) {
            selectedPoint = point([maxX, maxY])
            selectedRoute = null
        } else {
            selectedRoute = lineString(selectedTrack.track)
            selectedPoint = null
        }

        // delta 0.005 of Latitude or 0.006 of Longitude ≈ 0.5km
        if ((Math.abs(maxX - minX) < 0.005) && (Math.abs(maxY - minY) < 0.006)) {
            minX -= 0.0025
            maxX += 0.0025
            minY -= 0.003
            maxY += 0.003
        }

        const start = [minX, minY]
        const end = [maxX, maxY]
        onTrackSelect(start, end)
    } else {
        selectedRoute = null
        selectedPoint = null
    }

    return (<>{activeRoute && <MapboxGL.ShapeSource id='active-track' shape={activeRoute}>
        <MapboxGL.LineLayer id='activeLineLayer' style={ActiveTrackStyle} minZoomLevel={1} />
    </MapboxGL.ShapeSource>}
        {selectedRoute && <MapboxGL.ShapeSource id='selected-track' shape={selectedRoute}>
            <MapboxGL.LineLayer id='selectedLineLayer' style={SelectedTrackStyle} minZoomLevel={1} />
        </MapboxGL.ShapeSource>}
        {selectedPoint && <MapboxGL.ShapeSource id='selected-point' shape={selectedPoint}>
            <MapboxGL.CircleLayer id='selectedPointLayer' style={SelectedPointStyle} minZoomLevel={1} />
        </MapboxGL.ShapeSource>}
    </>);
}

export default connector(ActiveTrack)

import React, { FC, useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import MapboxGL, { CircleLayerStyle, OnPressEvent } from "@react-native-mapbox-gl/maps";
import { featureCollection } from '@turf/helpers';
import { markToFeature } from "../actions/marks-actions";
import { colorPalette } from "../constants/color";
import { selectActiveTrip, selectActiveTripBBox } from "../reducers/trips";

export const MarkStyle: CircleLayerStyle = {
    circleRadius: 14,
    circleColor: ['step', ['number', ['get', 'rate'], 0], colorPalette[0], 1, colorPalette[1], 2, colorPalette[2], 3, colorPalette[3], 4, colorPalette[4], 5, colorPalette[5]],
    circleOpacity: 1,
    circleStrokeColor: 'yellow',
    circleStrokeWidth: 7,
    circleStrokeOpacity: 1,
}

interface TripMapLayerProps {
    camera?: MapboxGL.Camera;
    onMarkPress: (event: OnPressEvent) => void;
}

const mapStateToProps = (state: State) => ({
    activeTrip: selectActiveTrip(state),
    activeTripBBox: selectActiveTripBBox(state)
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> & TripMapLayerProps

const TripMapLayer: FC<Props> = ({ activeTrip, activeTripBBox, camera, onMarkPress }) => {
    if (!activeTrip || !activeTrip.marks || !activeTrip.marks.length) {
        return null
    }
    const marksCollection = featureCollection(activeTrip.marks.filter(item => !item.deleted).map(markToFeature))
    useEffect(() => {
        if (!activeTripBBox || !camera) {
            return
        }
        const tripStart = activeTripBBox[0];
        const tripEnd = activeTripBBox[1] || tripStart;
        camera.fitBounds(tripStart, tripEnd, 100, 100);
    }, [activeTripBBox])

    return (<MapboxGL.ShapeSource
        id="activeTripSource"
        hitbox={{ width: 40, height: 40 }}
        onPress={onMarkPress}
        shape={marksCollection}>
        <MapboxGL.CircleLayer id='tripMarks' style={MarkStyle} minZoomLevel={1} layerIndex={20003} />
    </MapboxGL.ShapeSource>);
}

export default connector(TripMapLayer)

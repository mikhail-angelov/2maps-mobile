import React, { FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import MapboxGL, { CircleLayerStyle, OnPressEvent } from "@react-native-mapbox-gl/maps";
import { featureCollection } from '@turf/helpers';
import { selectMarks } from "../reducers/marks";
import { markToFeature } from "../actions/marks-actions";
import { colorPalette } from "../constants/color";

const MarkStyle: CircleLayerStyle = {
    circleRadius: 8,
    circleColor: ['step', ['number', ['get', 'rate'], 0], colorPalette[0], 1, colorPalette[1], 2, colorPalette[2], 3, colorPalette[3], 4, colorPalette[4], 5, colorPalette[5]],
    circleOpacity: 0.7,
    circleStrokeColor: 'white',
    circleStrokeWidth: 4,
    circleStrokeOpacity: 0.7,
}

interface MarksLocationProps {
    onMarkPress: (event: OnPressEvent) => void;
}

const mapStateToProps = (state: State) => ({
    marks: selectMarks(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> & MarksLocationProps

const MarksLocation: FC<Props> = ({ marks, onMarkPress }) => {    
    const marksCollection = featureCollection(marks.filter(item => !item.deleted).map(markToFeature))

    return (<MapboxGL.ShapeSource
        id="marksLocationSource"
        hitbox={{ width: 20, height: 20 }}
        onPress={onMarkPress}
        shape={marksCollection}>
        <MapboxGL.CircleLayer id='marks' style={MarkStyle} minZoomLevel={1} layerIndex={10003}/>
    </MapboxGL.ShapeSource>);
}

export default connector(MarksLocation)

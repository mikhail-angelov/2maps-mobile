import React, { FC } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import MapboxGL, { CircleLayerStyle, OnPressEvent } from "@react-native-mapbox-gl/maps";
import { featureCollection } from '@turf/helpers';
import { selectMarks } from "../reducers/marks";
import { markToFeature } from "../actions/marks-actions";

const MarkStyle: CircleLayerStyle = {
    circleRadius: 12,
    circleColor: 'blue',
    circleOpacity: 0.6,
    circleStrokeColor: 'white',
    circleStrokeWidth: 0.5,
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
        <MapboxGL.CircleLayer id='marks' style={MarkStyle} minZoomLevel={1} />
    </MapboxGL.ShapeSource>);
}

export default connector(MarksLocation)

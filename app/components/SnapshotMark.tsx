import React from "react";
import MapboxGL from "@react-native-mapbox-gl/maps";
import { Mark, State } from "../store/types";
import { selectCenter, selectPrimaryMap, selectZoom } from "../reducers/map";
import { connect, ConnectedProps } from "react-redux";
import { MarkStyle } from "./MarksLocation";
import { markToFeature } from "../actions/marks-actions";

const mapStateToProps = (state: State) => ({
    center: selectCenter(state),
    zoom: selectZoom(state),
    primaryMap: selectPrimaryMap(state),
});

const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> & { onSetMap: (map: MapboxGL.MapView) => void, mark: Mark }

const SnapshotMark: React.FC<Props> = ({ primaryMap, onSetMap, center, zoom, mark }) => {
    return (
        <MapboxGL.MapView
            zoomEnabled
            compassEnabled
            styleURL={primaryMap.url}
            compassViewMargins={{ x: 0, y: 100 }}
            ref={onSetMap}
            style={{ height: 400, width: 400, position: 'absolute', right: '500%' }}
            logoEnabled={false}
        >
            <MapboxGL.Camera
                defaultSettings={{ centerCoordinate: center, zoomLevel: zoom }}
                followZoomLevel={zoom}
                followUserMode='normal'
            />
            <MapboxGL.ShapeSource
                id="marksLocationSource"
                hitbox={{ width: 20, height: 20 }}
                shape={markToFeature(mark)}>
                <MapboxGL.CircleLayer id='mark' style={MarkStyle} minZoomLevel={1} layerIndex={10003} />
            </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
    )
}

export default connector(SnapshotMark)
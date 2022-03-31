import React from "react";
import MapboxGL from "@react-native-mapbox-gl/maps";
import { Mark, State } from "../store/types";
import { selectCenter, selectOpacity, selectPrimaryMap, selectSecondaryMap, selectZoom } from "../reducers/map";
import { connect, ConnectedProps } from "react-redux";
import { MarkStyle } from "./MarksLocation";
import { markToFeature } from "../actions/marks-actions";
import { rasterSourceProps } from "../screens/Map";

const mapStateToProps = (state: State) => ({
    center: selectCenter(state),
    zoom: selectZoom(state),
    primaryMap: selectPrimaryMap(state),
    secondaryMap: selectSecondaryMap(state),
    opacity: selectOpacity(state),
});

const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector> & { onSetMap: (map: MapboxGL.MapView) => void, mark: Mark }

const SnapshotMark: React.FC<Props> = ({ primaryMap, onSetMap, center, zoom, mark, secondaryMap, opacity }) => {
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
            {secondaryMap && <MapboxGL.RasterSource {...rasterSourceProps} tileUrlTemplates={[secondaryMap.url]}>
                <MapboxGL.RasterLayer
                    id="stamenWatercolorLayer"
                    sourceID="stamenWatercolorSource"
                    style={{ rasterOpacity: opacity }}
                    layerIndex={10000}
                />
            </MapboxGL.RasterSource>}
            <MapboxGL.ShapeSource
                id="marksLocationSource"
                hitbox={{ width: 20, height: 20 }}
                shape={markToFeature(mark)}>
                <MapboxGL.CircleLayer id='mark' style={MarkStyle} minZoomLevel={1} layerIndex={100003} />
            </MapboxGL.ShapeSource>
        </MapboxGL.MapView>
    )
}

export default connector(SnapshotMark)
import React, { FC, useMemo } from "react";
import { connect, ConnectedProps } from "react-redux";
import { State } from '../store/types'
import MapboxGL, { LineLayerStyle } from "@react-native-mapbox-gl/maps";
import { lineString } from '@turf/helpers';
import { selectActiveDrawing, selectActiveDrawingChunk } from "../reducers/drawings";

const DrawingStyle: LineLayerStyle = {
    lineCap: 'round',
    lineWidth: 6,
    lineOpacity: 0.84,
    lineColor: 'red',
}

const mapStateToProps = (state: State) => ({
    activeDrawing: selectActiveDrawing(state),
    activeDrawingChunk: selectActiveDrawingChunk(state),
});
const connector = connect(mapStateToProps)
type Props = ConnectedProps<typeof connector>


const OldDrawing: FC<Partial<Props>> = ({ activeDrawing }): any => {
    const result = useMemo(() => {
        if (!activeDrawing) {
            return null
        }
        return activeDrawing.filter(chunk => chunk && chunk.length > 1).map((chunk, index) => {
            const activeRoute = chunk && chunk.length > 1 ? lineString(chunk) : null
            if (!activeRoute) return null
            return (
                <MapboxGL.ShapeSource id={`active-drawing${index}`} shape={activeRoute} key={index}>
                    <MapboxGL.LineLayer id={`drawingLayer${index}`} style={DrawingStyle} minZoomLevel={1} layerIndex={500000} key={index} />
                </MapboxGL.ShapeSource>
            )
        })
    }, [activeDrawing])
    return result
}

const Drawing: FC<Props> = ({ activeDrawing, activeDrawingChunk }): any => {
    const activeRoute = activeDrawingChunk && activeDrawingChunk.length > 1 ? lineString(activeDrawingChunk) : null
    return (
        <>
            <OldDrawing activeDrawing={activeDrawing} />
            {activeRoute && (<MapboxGL.ShapeSource id={`active-drawing`} shape={activeRoute} >
                <MapboxGL.LineLayer id={`drawingLayer`} style={DrawingStyle} minZoomLevel={1} layerIndex={500000} />
            </MapboxGL.ShapeSource>)}
        </>
    )
}

export default connector(Drawing)

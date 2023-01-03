import React, {FC} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {State} from '../store/types';
import MapboxGL, {LineLayerStyle} from '@rnmapbox/maps';
import {lineString} from '@turf/helpers';
import {selectActiveDrawing} from '../reducers/drawings';
import {red} from '../constants/color';

const DrawingStyle: LineLayerStyle = {
  lineCap: 'round',
  lineWidth: 6,
  lineOpacity: 0.84,
  lineColor: red,
};

const mapStateToProps = (state: State) => ({
  activeDrawing: selectActiveDrawing(state),
});
const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

const DrawingMapLayer: FC<Props> = ({activeDrawing}): any => {
  if (!activeDrawing) {
    return null;
  }
  return activeDrawing
    .filter(chunk => chunk && chunk.length > 1)
    .map((chunk, index) => {
      const activeRoute = chunk && chunk.length > 1 ? lineString(chunk) : null;
      if (!activeRoute) return null;
      return (
        <MapboxGL.ShapeSource
          id={`active-drawing${index}`}
          shape={activeRoute}
          key={index}>
          <MapboxGL.LineLayer
            id={`drawingLayer${index}`}
            style={DrawingStyle}
            minZoomLevel={1}
            layerIndex={500000}
            key={index}
          />
        </MapboxGL.ShapeSource>
      );
    });
};

export default connector(DrawingMapLayer);

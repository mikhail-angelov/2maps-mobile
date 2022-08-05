import React, {FC} from 'react';
import {connect, ConnectedProps} from 'react-redux';
import {State} from '../store/types';
import {selectActiveDrawingChunk} from '../reducers/drawings';
import Svg, {Polyline} from 'react-native-svg';
import {useWindowDimensions} from 'react-native';

const mapStateToProps = (state: State) => ({
  activeDrawingChunk: selectActiveDrawingChunk(state),
});
const connector = connect(mapStateToProps);
type Props = ConnectedProps<typeof connector>;

const DrawingChunk: FC<Props> = ({activeDrawingChunk}) => {
  const {height, width} = useWindowDimensions();
  const points =
    activeDrawingChunk?.map(position => position.join(',')).join(' ') || '';
  return (
    <Svg height={height} width={width}>
      <Polyline
        points={points}
        fill="none"
        stroke="red"
        strokeWidth={6}
        strokeOpacity={0.84}
      />
    </Svg>
  );
};

export default connector(DrawingChunk);

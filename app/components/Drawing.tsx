import React, { FC, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { GestureResponderEvent, StyleSheet, View } from 'react-native';
import DrawingChunk from './DrawingChunk';
import MapboxGL from '@rnmapbox/maps';
import { addPointForDrawingChunkAction, finishDrawNewChunkAction, removeLastDrawingChunkAction, saveActualDrawingAction, setActualDrawingAction, startDrawNewChunkAction, shareActualDrawing } from '../actions/drawing-actions';
import IconCommunity from 'react-native-vector-icons/MaterialCommunityIcons';

interface OwnProps {
  setActiveDrawingLayout: (value: boolean) => void
  map?: MapboxGL.MapView
}

const mapDispatchToProps = {
  addPointForDrawingChunk: addPointForDrawingChunkAction,
  finishDrawNewChunk: finishDrawNewChunkAction,
  startDrawNewChunk: startDrawNewChunkAction,
  removeLastDrawingChunk: removeLastDrawingChunkAction,
  saveActualDrawing: saveActualDrawingAction,
  setActualDrawing: setActualDrawingAction,
};
const connector = connect(null, mapDispatchToProps);
type Props = ConnectedProps<typeof connector> & OwnProps;

const Drawing: FC<Props> = ({ map, setActiveDrawingLayout, addPointForDrawingChunk, finishDrawNewChunk, startDrawNewChunk, removeLastDrawingChunk, saveActualDrawing }) => {
  const [showDrawingButtons, setShowDrawingButtons] = useState(true);
  const [isPressedShareButton, setIsPressedShareButton] = useState(false);

  const onTouchStartDrawing = () => {
    startDrawNewChunk()
    setShowDrawingButtons(false)
  }
  const onTouchMoveDrawing = async (event: GestureResponderEvent) => {
    if (event.nativeEvent.touches.length !== 1) {
      return
    }
    const { locationX, locationY } = event.nativeEvent
    addPointForDrawingChunk(locationX, locationY)
  }
  const onTouchEndDrawing = () => {
    if (map) {
      finishDrawNewChunk(map)
      setShowDrawingButtons(true)
    }
  }
  const stepBackDrawing = () => {
    removeLastDrawingChunk()
  }
  const saveDrawing = () => {
    saveActualDrawing()
    setActiveDrawingLayout(false)
  }
  const shareDrawing = async () => {
    if (map) {
      setIsPressedShareButton(true)
      try {
        await shareActualDrawing(map)
        setActiveDrawingLayout(false)
      } catch (e) {
        setIsPressedShareButton(false)
      }
    }
  }
  return (
    <>
      <View style={styles.drawingLayout}
        onTouchMove={onTouchMoveDrawing}
        onTouchEnd={onTouchEndDrawing}
        onTouchStart={onTouchStartDrawing}
      >
        <DrawingChunk />
      </View>
      {showDrawingButtons && (
        <View style={styles.drawingButtons}>
          <IconCommunity.Button
            name="close"
            color="white"
            backgroundColor="#00f5"
            style={{
              width: 48,
              height: 48,
              padding: 0,
              justifyContent: 'center',
            }}
            iconStyle={{ marginLeft: 10, width: 20 }}
            borderRadius={24}
            onPress={() => setActiveDrawingLayout(false)}
          />
          <View style={{ height: 40 }}></View>
          <IconCommunity.Button
            name="restore"
            color="white"
            backgroundColor="#00f5"
            style={{
              width: 48,
              height: 48,
              padding: 0,
              justifyContent: 'center',
            }}
            iconStyle={{ marginLeft: 10, width: 20 }}
            borderRadius={24}
            onPress={stepBackDrawing}
          />
          <View style={{ height: 40 }}></View>
          <IconCommunity.Button
            name="content-save-outline"
            color="white"
            backgroundColor="#00f5"
            style={{
              width: 48,
              height: 48,
              padding: 0,
              justifyContent: 'center',
            }}
            iconStyle={{ marginLeft: 10, width: 20 }}
            borderRadius={24}
            onPress={saveDrawing}
          />
          <View style={{ height: 40 }}></View>
          <IconCommunity.Button
            name="image-move"
            color="white"
            backgroundColor={isPressedShareButton ? "#7474fe54" : "#00f5"}
            style={{
              width: 48,
              height: 48,
              padding: 0,
              justifyContent: 'center',
            }}
            iconStyle={{ marginLeft: 10, width: 20 }}
            borderRadius={24}
            onPress={shareDrawing}
            disabled={isPressedShareButton}
          />
        </View>
      )}
    </>
  );
};

export default connector(Drawing);

const styles = StyleSheet.create({
  drawingLayout: {
    position: 'absolute',
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  drawingButtons: {
    position: 'absolute',
    right: 10,
    height: '100%',
    width: 48,
    flexDirection: 'column',
    justifyContent: 'center',
  }
})
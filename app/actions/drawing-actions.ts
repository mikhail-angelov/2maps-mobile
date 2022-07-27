import { ActionTypeEnum, AppThunk } from '.';
import * as _ from 'lodash';
import { Position } from 'geojson';

export const drawingChunkAction = (newPoint: Position): AppThunk => async (dispatch, getState) => {
  const activeDrawingChunk = getState().drawings.activeDrawingChunk
  const lastRecord = _.last(activeDrawingChunk)
  if (!_.isEqual(lastRecord, newPoint)) {
    dispatch({ type: ActionTypeEnum.ActiveDrawing, payload: [...activeDrawingChunk, newPoint] })
  }
};

export const startDrawNewChunkAction = (newPoint: Position): AppThunk => async (dispatch, getState) => {
    dispatch({ type: ActionTypeEnum.ActiveDrawing, payload: [newPoint] })
};

export const finishDrawingChunkAction = (): AppThunk => async (dispatch, getState) => {
    dispatch({ type: ActionTypeEnum.FinishDrawingChunk })
};

export const removeLastDrawingChunkAction = (): AppThunk => async (dispatch, getState) => {
  const activeDrawing = getState().drawings.activeDrawing
  dispatch({type: ActionTypeEnum.SetActiveDrawing, payload: activeDrawing.slice(0 ,-1)})
}
import { ActionTypeEnum, AppThunk } from '.';
import * as _ from 'lodash';
import { Position } from 'geojson';
import { selectActiveDrawing, selectAllDrawings } from '../reducers/drawings';
import { Drawing } from '../store/types';
import {v4 as uuid} from '@lukeed/uuid';

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
  const activeDrawing = selectActiveDrawing(getState())
  dispatch({type: ActionTypeEnum.SetActiveDrawing, payload: activeDrawing.slice(0 ,-1)})
}
export const saveActualDrawingAction = (): AppThunk => async (dispatch, getState) => {
  const activeDrawing = selectActiveDrawing(getState())
  if (activeDrawing.length === 0) {
    return
  }
  const newDrawing: Drawing = {
    id: uuid(),
    date: Date.now(),
    name: '',
    drawing: activeDrawing
  }
  dispatch({type: ActionTypeEnum.SaveDrawing, payload: newDrawing})
}

export const setActualDrawingAction = (id: string): AppThunk => async (dispatch, getState) => {
  const drawings = selectAllDrawings(getState())
  const result = drawings.find(item => item.id === id)
  dispatch({type: ActionTypeEnum.SetActiveDrawing, payload: result?.drawing || []})
}

export const removeDrawingAction = (id: string): AppThunk => async (dispatch, getState) => {
  const drawings = selectAllDrawings(getState())
  const result = drawings.filter(item => item.id !== id)
  dispatch({type: ActionTypeEnum.SetDrawings, payload: result})
}
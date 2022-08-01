import { createSelector } from 'reselect';
import { Position } from 'geojson';
import { ActionTypeEnum } from '../actions';
import { createReducer } from './reducer-utils';
import { Drawing, DrawingsState, State } from '../store/types';

const initialState: DrawingsState = Object.freeze({
  drawings: [],
  activeDrawing: [],
  activeDrawingChunk: [],
});

export default createReducer<DrawingsState>(initialState, {
  [ActionTypeEnum.SetDrawingChunk]: (newActiveDrawingChunk: Position[]) => (state: DrawingsState) => ({
    ...state,
    activeDrawingChunk: newActiveDrawingChunk,
  }),
  [ActionTypeEnum.SetActiveDrawing]: (newActiveDrawing: Position[][]) => (state: DrawingsState) => ({
    ...state,
    activeDrawing: newActiveDrawing,
  }),
  [ActionTypeEnum.SaveDrawing]: (newDrawing: Drawing) => (state: DrawingsState) => ({
    ...state,
    drawings: [...state.drawings, newDrawing],
    activeDrawing: [],
    activeDrawingChunk: undefined,
  }),
  [ActionTypeEnum.SetDrawings]: (drawings: Drawing[]) => (state: DrawingsState) => ({
    ...state,
    drawings,
  })
});

export const selectDrawingState = (state: State) => state.drawings;
export const selectActiveDrawing = createSelector(
  selectDrawingState,
  state => state.activeDrawing,
);
export const selectActiveDrawingChunk = createSelector(
  selectDrawingState,
  state => state.activeDrawingChunk,
);
export const selectAllDrawings = createSelector(
  selectDrawingState,
  state => state.drawings,
);
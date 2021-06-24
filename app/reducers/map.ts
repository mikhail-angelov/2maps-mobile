import { createSelector } from "reselect";
import { MapState, State } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

const CENTER_COORD = [44.320691, 56.090846];

const initialState: MapState = Object.freeze({
  opacity: 0.5,
  zoom: 16,
  center: CENTER_COORD,
});

export default createReducer<MapState>(initialState, {
  [ActionTypeEnum.SetCenter]: (center) => (state) => ({
    ...state,
    center,
  }),
  [ActionTypeEnum.SetZoom]: (zoom) => (state) => ({
    ...state,
    zoom,
  }),
  [ActionTypeEnum.SetOpacity]: (opacity) => (state) => ({
    ...state,
    opacity,
  }),
});
export const selectMapState = (state: State) => state.map;
export const selectOpacity = createSelector(
  selectMapState,
  (state) => state.opacity
);
export const selectCenter = createSelector(
  selectMapState,
  (state) => state.center
);
export const selectZoom = createSelector(
  selectMapState,
  (state) => state.zoom
);
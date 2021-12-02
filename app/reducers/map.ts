import MapboxGL from "@react-native-mapbox-gl/maps";
import { createSelector } from "reselect";
import { MapState, MapInfo, MapFile, State } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

export const onLineMapList: MapInfo[] = [
  { name: 'MapBox Vector(online)', url: MapboxGL.StyleURL.Street },
  { name: 'MapBox Satellite(online)', url: MapboxGL.StyleURL.Satellite },
  { name: 'MapBox SatelliteStreet()online', url: MapboxGL.StyleURL.SatelliteStreet },
]
const CENTER_COORD = [44.320691, 56.090846];

const initialState: MapState = Object.freeze({
  opacity: 0.5,
  zoom: 16,
  center: CENTER_COORD,
  primaryMap: onLineMapList[0],
  styleUrl: MapboxGL.StyleURL.Street,
  list: [],
  availableMaps:[],
  loading: false,
});

export default createReducer<MapState>(initialState, {
  [ActionTypeEnum.SetCenter]: (center: number[]) => (state: MapState) => ({
    ...state,
    center,
  }),
  [ActionTypeEnum.SetZoom]: (zoom: number) => (state: MapState) => ({
    ...state,
    zoom,
  }),
  [ActionTypeEnum.SetOpacity]: (opacity: number) => (state: MapState) => ({
    ...state,
    opacity,
  }),
  [ActionTypeEnum.SetPrimary]: (primaryMap: MapInfo) => (state: MapState) => ({
    ...state,
    primaryMap,
  }),
  [ActionTypeEnum.SetSecondary]: (secondaryMap?: MapInfo) => (state: MapState) => ({
    ...state,
    secondaryMap,
  }),
  [ActionTypeEnum.GetMapList]: () => (state: MapState) => ({
    ...state,
    loading: true,
    error: undefined,
  }),
  [ActionTypeEnum.GetMapListSuccess]: (list: MapInfo[]) => (state: MapState) => ({
    ...state,
    loading: false,
    error: undefined,
    list,
  }),
  [ActionTypeEnum.GetMapListFailure]: (error: string) => (state: MapState) => ({
    ...state,
    loading: false,
    error,
  }),
  [ActionTypeEnum.LoadMapList]: () => (state: MapState) => ({
    ...state,
    loading: true,
    error: undefined,
  }),
  [ActionTypeEnum.LoadMapListSuccess]: (availableMaps: MapFile[]) => (state: MapState) => ({
    ...state,
    loading: false,
    error: undefined,
    availableMaps,
  }),
  [ActionTypeEnum.LoadMapListFailure]: (error: string) => (state: MapState) => ({
    ...state,
    loading: false,
    error,
  }),
  [ActionTypeEnum.DownloadMap]: () => (state: MapState) => ({
    ...state,
    loading: true,
    error: undefined,
  }),
  [ActionTypeEnum.DownloadMapSuccess]: () => (state: MapState) => ({
    ...state,
    loading: false,
    error: undefined,
  }),
  [ActionTypeEnum.DownloadMapFailure]: (error: string) => (state: MapState) => ({
    ...state,
    loading: false,
    error,
  }),
  [ActionTypeEnum.DeleteMap]: () => (state: MapState) => ({
    ...state,
    loading: true,
    error: undefined,
  }),
  [ActionTypeEnum.DeleteMapSuccess]: () => (state: MapState) => ({
    ...state,
    loading: false,
    error: undefined,
  }),
  [ActionTypeEnum.DeleteMapFailure]: (error: string) => (state: MapState) => ({
    ...state,
    loading: false,
    error,
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
export const selectPrimaryMap = createSelector(
  selectMapState,
  (state) => state.primaryMap
);
export const selectSecondaryMap = createSelector(
  selectMapState,
  (state) => state.secondaryMap
);
export const selectMapList = createSelector(
  selectMapState,
  (state) => state.list
);
export const selectMapIsLoading = createSelector(
  selectMapState,
  (state) => state.loading
);
export const selectMapError = createSelector(
  selectMapState,
  (state) => state.error
);
export const selectAvailableMapList = createSelector(
  selectMapState,
  (state) => state.availableMaps
);
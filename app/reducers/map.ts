import MapboxGL from "@react-native-mapbox-gl/maps";
import { createSelector } from "reselect";
import { MapState, MapInfo, MapFile, State, PrimaryMapInfo } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

export const onLineMapList: PrimaryMapInfo[] = [
  { name: 'MapBox Vector(online)', url: MapboxGL.StyleURL.Street },
  { name: 'MapBox Satellite(online)', url: MapboxGL.StyleURL.Satellite },
  { name: 'MapBox SatelliteStreet(online)', url: MapboxGL.StyleURL.SatelliteStreet },
]
const CENTER_COORD = [44.031732,56.304132];

const initialState: MapState = Object.freeze({
  opacity: 0.5,
  zoom: 16,
  center: CENTER_COORD,
  primaryMap: onLineMapList[0],
  styleUrl: MapboxGL.StyleURL.Street,
  list: [],
  availableMaps: [],
  loading: false,
  downloading: false,
  downloadProgress: 0,
  relocating: false,
  relocateProgress: 0,
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
    downloading: true,
    downloadProgress: 0,
    downloadId: '',
    error: undefined,
  }),
  [ActionTypeEnum.DownloadMapSuccess]: () => (state: MapState) => ({
    ...state,
    downloading: false,
    downloadProgress: 0,
    error: undefined,
  }),
  [ActionTypeEnum.DownloadMapFailure]: (error: string) => (state: MapState) => ({
    ...state,
    downloading: false,
    downloadProgress: 0,
    error,
  }),
  [ActionTypeEnum.LoadMapProgress]: (data: any) => (state: MapState) => ({
    ...state,
    downloadProgress: Math.floor(data?.downloaded ? (data.downloaded * 100 / data.total) : 0),
    downloadId: data?.downloadId,
    downloading: true,
  }),
  [ActionTypeEnum.CancelDownloadMap]: () => (state: MapState) => ({
    ...state,
    downloadProgress: 0,
    downloadId: '',
    downloading: false,
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
  [ActionTypeEnum.ImportMap]: () => (state: MapState) => ({
    ...state,
    loading: true,
    error: undefined,
  }),
  [ActionTypeEnum.ImportMapSuccess]: () => (state: MapState) => ({
    ...state,
    loading: false,
    error: undefined,
  }),
  [ActionTypeEnum.ImportMapFailure]: (error: string) => (state: MapState) => ({
    ...state,
    loading: false,
    error,
  }),
  [ActionTypeEnum.ChangeMapStorage]: () => (state: MapState) => ({
    ...state,
    error: undefined,
    relocating: true,
    relocateProgress: 0,
  }),
  [ActionTypeEnum.ChangeMapStorageSuccess]: () => (state: MapState) => ({
    ...state,
    relocating: false,
    loading: false,
    relocateProgress: 0,
    error: undefined,
  }),
  [ActionTypeEnum.ChangeMapStorageFailure]: (error: string) => (state: MapState) => ({
    ...state,
    relocating: false,
    relocateProgress: 0,
    loading: false,
    error,
  }),
  [ActionTypeEnum.RelocateMapProgress]: (completePercentage: number) => (state: MapState) => ({
    ...state,
    relocateProgress: completePercentage,
    relocating: true,
  }),
  [ActionTypeEnum.CancelChangeMapStorage]: () => (state: MapState) => ({
    ...state,
    loading: true,
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
export const selectMapIsDownLoading = createSelector(
  selectMapState,
  (state) => state.downloading
);
export const selectMapError = createSelector(
  selectMapState,
  (state) => state.error
);
export const selectAvailableMapList = createSelector(
  selectMapState,
  (state) => state.availableMaps
);
export const selectDownloadProgress = createSelector(
  selectMapState,
  (state) => state.downloadProgress
);
export const selectDownloadId = createSelector(
  selectMapState,
  (state) => state.downloadId
);
export const selectMapIsRelocating = createSelector(
  selectMapState,
  (state) => state.relocating
);
export const selectRelocateProgress = createSelector(
  selectMapState,
  (state) => state.relocateProgress
);
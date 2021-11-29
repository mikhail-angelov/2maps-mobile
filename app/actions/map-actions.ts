import MapboxGL from "@react-native-mapbox-gl/maps";
import { ActionTypeEnum, AppThunk } from ".";
import { Position } from 'geojson';
import { MapInfo } from "../store/types";
import {getLocal} from './api'

export const setCenterAction = (center: Position) => {
  //todo: validate params
  return { type: ActionTypeEnum.SetCenter, payload: center }
};
export const setOpacityAction = (opacity: number) => {
  return { type: ActionTypeEnum.SetOpacity, payload: isNaN(+opacity)?1:opacity }
};
export const setZoomAction = (zoom: number) => {
  return { type: ActionTypeEnum.SetZoom, payload: isNaN(+zoom)?12:+zoom }
};

export const setPrimaryMapAction = (map: MapInfo) => {
  return { type: ActionTypeEnum.SetPrimary, payload: map }
};
export const setSecondaryMapAction = (map?: MapInfo) => {
  return { type: ActionTypeEnum.SetSecondary, payload: map }
};
export const loadMapListAction = (): AppThunk => {
  return async (dispatch) => {
    try {
      console.log('load maps'); 
      dispatch({ type: ActionTypeEnum.GetMapList});
      const res = await getLocal('maps');
      console.log('load maps', res.data);
      const list = res.data.map((name:string) => ({name, url: `http://localhost:5555/map/${name}/{z}/{x}/{y}.png`}));
      dispatch({ type: ActionTypeEnum.GetMapListSuccess, payload: list });
    } catch (err) {
      console.log("error", err);
      dispatch({
        type: ActionTypeEnum.GetMapListFailure,
        payload: "get map list failure",
      });
    }
  };
};
import { ActionTypeEnum, AppThunk } from ".";
import { Position } from 'geojson';
import { NativeModules } from "react-native";
import { MapInfo } from "../store/types";
import { getLocal, get, post, HOST, HOST_LOCAL } from './api'
import { selectToken } from '../reducers/auth'
import { selectDownloadId } from '../reducers/map'

export const setCenterAction = (center: Position) => {
  //todo: validate params
  return { type: ActionTypeEnum.SetCenter, payload: center }
};
export const setOpacityAction = (opacity: number) => {
  console.log('setOpacityAction', opacity);
  return { type: ActionTypeEnum.SetOpacity, payload: isNaN(+opacity) ? 1 : +opacity }
};
export const setZoomAction = (zoom: number) => {
  return { type: ActionTypeEnum.SetZoom, payload: isNaN(+zoom) ? 12 : +zoom }
};

export const setPrimaryMapAction = (map: MapInfo) => {
  return { type: ActionTypeEnum.SetPrimary, payload: map }
};
export const setSecondaryMapAction = (map?: MapInfo) => {
  return { type: ActionTypeEnum.SetSecondary, payload: map }
};
export const getLocalMapListAction = (): AppThunk => {
  return async (dispatch) => {
    try {
      console.log('get maps');
      dispatch({ type: ActionTypeEnum.GetMapList });
      const res = await getLocal('maps');
      console.log('get maps', res.data);
      const list = res.data.map((name: string) => ({ name, url: `${HOST_LOCAL}/map/${name}/{z}/{x}/{y}.png` }));
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
export const loadMapListAction = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      console.log('load maps');
      const token = selectToken(getState())
      dispatch({ type: ActionTypeEnum.LoadMapList });
      const res = await get({ url: `${HOST}/maps`, token });
      console.log('load maps', res.data);
      dispatch({ type: ActionTypeEnum.LoadMapListSuccess, payload: res.data });
    } catch (err) {
      console.log("error", err);
      dispatch({
        type: ActionTypeEnum.LoadMapListFailure,
        payload: "get map list failure",
      });
    }
  };
};

const download = (url = '', config = {}) => {
  return new Promise((resolve, reject) => {
    NativeModules.MapsModule.download(url, config, (err: any, data: any) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });
};

export const downloadMapAction = ({ id, name }: { id: string, name: string }): AppThunk => {
  return async (dispatch, getState) => {
    try {
      console.log('download map ', id);
      const token = selectToken(getState())
      dispatch({ type: ActionTypeEnum.DownloadMap });
      const res = await post({ url: `${HOST}/maps/${id}`, token, data: {} });
      console.log('map', res.data);
      if (!res.data?.url) {
        throw new Error('no url')
      }
      const url = res.data.url;
      const config = {
        downloadTitle: "Title that should appear in Native Download manager",
        downloadDescription:
          "Description that should appear in Native Download manager",
        saveAsName: name,
        allowedInRoaming: true,
        allowedInMetered: true,
        showInDownloads: true,
        external: true,
        path: "any",
        id,
      };

      // const response = await downloadManager.download(url, headers , config)
      const response = await download(url, config);

      console.log('download map', response);
      dispatch({ type: ActionTypeEnum.DownloadMapSuccess, payload: response });
      dispatch(getLocalMapListAction());
    } catch (err) {
      console.log("download map failure", err);
      dispatch({
        type: ActionTypeEnum.DownloadMapFailure,
        payload: "download map failure",
      });
    }
  };
};

export const cancelDownloadMapAction = (): AppThunk => (dispatch, getState) => {
  const downloadId = selectDownloadId(getState())
  if (downloadId) {
    NativeModules.MapsModule.cancelDownload(downloadId)
  }
  dispatch({ type: ActionTypeEnum.CancelDownloadMap });
}

export const removeLocalMapAction = (name: string): AppThunk => {
  return async (dispatch, getState) => {
    try {
      dispatch({ type: ActionTypeEnum.DeleteMap });
      await NativeModules.MapsModule.removeMap(name);
      dispatch({ type: ActionTypeEnum.DeleteMapSuccess, payload: name });
      dispatch(getLocalMapListAction());
    } catch (err) {
      console.log("error", err);
      dispatch({
        type: ActionTypeEnum.DeleteMapFailure,
        payload: "remove map failure",
      });
    }
  };
};
import { ActionTypeEnum, AppThunk } from ".";
import { Position } from 'geojson';
import { NativeModules } from "react-native";
import { getLocal, get, post, HOST, getLocalhost, getMapsDirectoryPath } from './api'
import { MapInfo, PrimaryMapInfo, StorageMemory } from "../store/types";
import { selectToken } from '../reducers/auth'
import { selectDownloadId } from '../reducers/map'
import { AxiosResponse } from "axios";
import DocumentPicker from "react-native-document-picker";
import RNFS from 'react-native-fs';
import * as _ from 'lodash';
import i18next from "i18next";
import { validateLoadedMapList, validateLocalMapList } from "../utils/validation";

export interface LocalMapFile {
  name: string;
  path: string;
  size: number;
  storage: string;
  minzoom: number;
  maxzoom: number;
}

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

export const setPrimaryMapAction = (map: PrimaryMapInfo) => {
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
      const res: AxiosResponse<{[key: string]: LocalMapFile}> = await getLocal('maps');
      console.log('get maps', res.data); 
      const validLocalMaps = validateLocalMapList(res.data)
      const list = Object.values(validLocalMaps).map(({name, size, storage}) => ({ name, url: `${getLocalhost()}/map/${name}/{z}/{x}/{y}.png`, size, storage }));
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
      const validMapList = validateLoadedMapList(res.data)
      dispatch({ type: ActionTypeEnum.LoadMapListSuccess, payload: validMapList });
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
      dispatch({ type: ActionTypeEnum.DownloadMapSuccess });
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

export const getStorageMemoryInfo = async(): Promise<StorageMemory> => {
  const response: string = await NativeModules.MapsModule.getStorageMemoryInfo()
  return JSON.parse(response)
}

const createNewFileName = (name: string): string => {
  const ext = '.sqlitedb'
  const changeableName = name.replace(ext, '')
  const regex = /\((\d+)\)$/
  const newName = changeableName.replace(regex, (str, p1)=>(`(${+p1 + 1})`))
  return changeableName === newName ? newName + '(1)' + ext : newName + ext
}

const findUniqName = async(path: string, fileName: string): Promise<string> => {
  try{
    const statResult = await RNFS.stat(path + fileName)
    if(statResult.isFile()) {
      return findUniqName(path, createNewFileName(fileName))
    }
  }catch(e){}  
  return fileName
}

export const isFileValid = (fileName: string): boolean => {
  const regex = /\.sqlitedb$/
  return regex.test(fileName)
}

export const importMapAction = (): AppThunk => {
  return async dispatch => {
    dispatch({ type: ActionTypeEnum.ImportMap });
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles]
      });
      if(!isFileValid(res.name)){
        throw new Error()
      }
      const destinationPath = await getMapsDirectoryPath()
      if(!destinationPath) {
        dispatch({ type: ActionTypeEnum.ImportMapFailure, payload: 'import map failure, can not find directory path' });
        return
      }      
      const fileName = await findUniqName(destinationPath, res.name)
      await RNFS.copyFile(res.fileCopyUri, destinationPath + fileName)
      dispatch({ type: ActionTypeEnum.ImportMapSuccess });
      dispatch(getLocalMapListAction())
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      }
      dispatch({ type: ActionTypeEnum.ImportMapFailure, payload: 'import map failure' });
    }
  };
};

export const moveMapToSdCardAction = (path: string): AppThunk => {
  return async dispatch => {    
    dispatch({ type: ActionTypeEnum.ChangeMapStorage });
      try {
        await new Promise((resolve, reject) => {
          NativeModules.MapsModule.moveMapToSDCard(path, (err: string, data: any) => {
            if (err) {
              return reject(err);
            }
            return resolve(data);
          });
        });
        dispatch({type: ActionTypeEnum.ChangeMapStorageSuccess})
        dispatch(getLocalMapListAction())
      } catch(e) {
        const message = _.isString(e) ? e : _.get(e, 'message', 'change map storage failure')
        dispatch({type: ActionTypeEnum.ChangeMapStorageFailure, payload: message})
      }
  }
}

export const moveMapToPhoneStorageAction = (path: string): AppThunk => {
  return async dispatch => {    
    dispatch({ type: ActionTypeEnum.ChangeMapStorage });
      try {
        await new Promise((resolve, reject) => {
          NativeModules.MapsModule.moveMapToPhoneStorage(path, (err: string, data: any) => {
            if (err) {
              return reject(err);
            }
            return resolve(data);
          });
        });
        dispatch({type: ActionTypeEnum.ChangeMapStorageSuccess})
        dispatch(getLocalMapListAction())
      } catch(e) {
        const message = _.isString(e) ? e : _.get(e, 'message', 'change map storage failure')
        dispatch({type: ActionTypeEnum.ChangeMapStorageFailure, payload: message})
      }
  }
}

export const cancelTransferMapAction = (): AppThunk => (dispatch) => {  
  dispatch({ type: ActionTypeEnum.CancelChangeMapStorage });
  NativeModules.MapsModule.cancelMapTransfer()
}

export const downloadMapByQRAction = ({ url, name }: { url: string, name: string }): AppThunk => {
  return async (dispatch) => {
    try {
      console.log('download map by QR', url);
      dispatch({ type: ActionTypeEnum.DownloadMap });

      const config = {
        downloadTitle: name,
        downloadDescription: i18next.t('Map file:', {name}),
        saveAsName: name,
        allowedInRoaming: true,
        allowedInMetered: true,
        showInDownloads: true,
        external: true,
        path: "any",
        id: name,
      };
      const response = await download(url, config);

      console.log('download map', response);
      dispatch({ type: ActionTypeEnum.DownloadMapSuccess });
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

export const setShowWikimapiaAction = (value: boolean) => ({type: ActionTypeEnum.SetWikimapia, payload: value})
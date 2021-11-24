import { ActionTypeEnum, AppThunk } from ".";
import { Alert } from "react-native";
import { postLarge, HOST } from "./api";
import { Mark, POI } from "../store/types";
import { feature, Feature, Point } from '@turf/helpers';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs'
import { nanoid } from 'nanoid'
import { selectMarks } from '../reducers/marks'
import { selectToken } from '../reducers/auth'

const MARKS_URL = `${HOST}/marks/m`

export const markToFeature = (mark: Mark): Feature<Point> => {
  const aFeature = feature(mark.geometry);
  aFeature.id = mark.id;
  aFeature.properties = {
    description: `<strong>${mark.description || mark.name}</strong>`,
    description_orig: mark.description,
    name: mark.name,
    icon: '',
    timestamp: mark.timestamp|| Date.now()
  };
  return aFeature
}
export const featureToMark = (feature: Feature<Point>): Mark => {
  const mark: Mark = {
    geometry: feature.geometry,
    id: feature.id?String(feature.id): '',
    name: feature.properties?.name || '',
    description: feature.properties?.description_orig || '',
    timestamp: feature.properties?.timestamp || Date.now()
  };
  return mark
}

export const loadMarksAction = (): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: ActionTypeEnum.MarksRequest });
      // const response = await post(`${AUTH_URL}/login`, credentials);

      // dispatch({
      //   type: ActionTypeEnum.MarksSuccess,
      //   payload: response.data,
      // });
    } catch (e) {
      console.log("marks error", e);
      dispatch({
        type: ActionTypeEnum.MarksFailure,
        payload: "marks failure",
      });
    }
  };
};

export const editMarkAction = (mark?: Mark) =>({ type: ActionTypeEnum.EditMark, payload: mark });
export const saveMarkAction = (mark: Mark) =>({ type: ActionTypeEnum.SaveMark, payload: {...mark, timestamp: Date.now()} });
export const removeMarkAction = (id: string)  => ({ type: ActionTypeEnum.RemoveMark, payload: id });

export const removeAllPoisAction = (): AppThunk => {
  return async (dispatch) => {
    dispatch({ type: ActionTypeEnum.RemoveAllMarks });
  };
};
export const importPoisAction = (): AppThunk => {
  return async (dispatch) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size,
        res.fileCopyUri,
      );
      const data = await RNFS.readFile(decodeURI(res.fileCopyUri), 'utf8')
      const pois = JSON.parse(data) as POI[]
      const marks = pois.map(({ id, name = '', description = '', point, timestamp }) => {
        return { id: id || nanoid(), name, description, timestamp, geometry: { type: 'Point', coordinates: [point.lng, point.lat] } }
      })
      dispatch({ type: ActionTypeEnum.ImportPois, payload: marks });
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };
};
export const exportPoisAction = (): AppThunk => {
  return async (dispatch, getState) => {
    const pois = selectMarks(getState())
    let url = ''
    try {
      const data = JSON.stringify(pois)
      url = RNFS.DocumentDirectoryPath + '/poi.json';
      console.log('writing to:', url, '\n')
      await RNFS.writeFile(decodeURI(url), data, 'utf8')
      Alert.alert('Markers are saved', `to ${url}`)
    } catch (err: any) {
      console.log('Error write to:', url, '\n', err)
      Alert.alert('Oops', `do not manage to save it ${url}`)
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };
};

export const syncMarksAction = (): AppThunk => {
  return async (dispatch, getState) => {
    const pois = selectMarks(getState())
    const token = selectToken(getState())
    try{
      const items = pois.map(({ id, name, description, geometry, timestamp }) => ({ id, name, description, lat: geometry.coordinates[1], lng: geometry.coordinates[0], timestamp }))
      const res = await postLarge({url:`${MARKS_URL}/sync`, data: items, token})
      console.log('sync', res.data)
      
      const marks: Mark[] = res.data.map(({ id, name = '', description = '', lat, lng, timestamp }: any) => {
        return { id: id || nanoid(), name, description, timestamp, geometry: { type: 'Point', coordinates: [lng, lat] } }
      })
      dispatch({ type: ActionTypeEnum.ImportPois, payload: marks });


      Alert.alert('Markers are synced', `Yo!`)
    } catch (err) {
      console.log('Error write to:', err)
      Alert.alert('Oops', `do not manage to sync`)
    }
  };
};
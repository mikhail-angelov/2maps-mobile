import { ActionTypeEnum, AppThunk } from ".";
import { Alert } from "react-native";
// import { post, getWithAuth, postWithAuth, setToken } from "./api";
import { Mark, POI } from "../store/types";
import { feature, Feature, Point } from '@turf/helpers';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs'
import {selectMarks, } from '../reducers/marks'

export const markToFeature = (mark: Mark): Feature<Point> => {
  const aFeature = feature(mark.geometry);
  aFeature.id = mark.id;
  aFeature.properties = {
    description: `<strong>${mark.name}</strong>`,
    name: mark.name,
    icon: '',
  };
  return aFeature
}
export const featureToMark = (feature: Feature<Point>): Mark => {
  const mark: Mark = {
    geometry: feature.geometry,
    id: feature.id || '',
    name: feature.properties?.name || '',
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

export const addMarkAction = (mark: Mark): AppThunk => {
  return async (dispatch) => {
    dispatch({ type: ActionTypeEnum.AddMark, payload: mark });
  };
};
export const removeMarkAction = (id: string): AppThunk => {
  return async (dispatch) => {
    dispatch({ type: ActionTypeEnum.RemoveMark, payload: id });
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
      console.log('-1-', pois)
      const marks = pois.map(({ id, name, point }) => ({ id, name, geometry: { type: 'Point', coordinates: [point.lng, point.lat] } }))
      dispatch({ type: ActionTypeEnum.ImportPois, payload: marks });
    } catch (err) {
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
    let url =''
    try {
      const data = JSON.stringify(pois)
      url =  RNFS.DocumentDirectoryPath + '/poi.json';
      console.log('writing to:', url, '\n')
      await RNFS.writeFile(decodeURI(url), data, 'utf8')
      Alert.alert('Markers are saved', `to ${url}`)
    } catch (err) {
      console.log('Error write to:', url, '\n',err)
      Alert.alert('Oops', `do not manage to save it ${url}`)
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };
};
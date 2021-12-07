import { ActionTypeEnum, AppThunk } from ".";
import MapboxGL from "@react-native-mapbox-gl/maps";
import { ThreeAxisMeasurement } from 'expo-sensors';
import { Track } from "../store/types";
import { selectIsTracking, selectLocation } from '../reducers/tracker';
import { selectTracks } from "../reducers/tracker";
import RNFS from 'react-native-fs'
import DocumentPicker from 'react-native-document-picker';
import { createKml, parseKml } from "../utils/kml";
import { Alert } from "react-native";
import { nanoid } from 'nanoid/non-secure'

export const compassAngle = (magnetometer: ThreeAxisMeasurement) => {
  let angle = 0.0
  if (magnetometer) {
    const { x, y, z } = magnetometer;
    angle = Math.atan2(x, y);
    angle = angle * (180 / Math.PI)
    // angle = angle + 90
    angle = (angle + 360) % 360
  }
  return Math.round(angle);
};

export const setCompassAction = (compass: ThreeAxisMeasurement) => {
  return { type: ActionTypeEnum.SetCompass, payload: compass }
};
export const setLocationAction = (location: MapboxGL.Location) => ({ type: ActionTypeEnum.SetLocation, payload: location });
export const setTracksAction = (tracks: Track[]) => {
  return { type: ActionTypeEnum.SetTracks, payload: tracks }
};
export const addTrackAction = (track: Track) => {
  return { type: ActionTypeEnum.AddTrack, payload: track }
};
export const removeTrackAction = (trackId: string) => {
  return { type: ActionTypeEnum.RemoveTrack, payload: trackId }
};
export const selectTrackAction = (track: Track | undefined) => {
  return { type: ActionTypeEnum.SetSelectedTrack, payload: track }
};
export const startTrackingAction = (): AppThunk => {
  return async (dispatch,  getState) => {
    const location = selectLocation(getState())
    const startPoint = [location.coords.longitude, location.coords.latitude]
    const track: Track = {
      id: `${Date.now()}`,
      start: Date.now(),
      end: Date.now(),
      name: '',
      track: [startPoint, startPoint],
    }
    dispatch({ type: ActionTypeEnum.StartTracking, payload: track });
  };
};

export const addPointAction = (location: MapboxGL.Location) => ({ type: ActionTypeEnum.AddPoint, payload: location });
export const stopTrackingAction = (): AppThunk => {
  return async (dispatch) => {
    //todo: render trackIcon to save it
    dispatch({ type: ActionTypeEnum.EndTracking })
  };
}

export const exportTrackAction = (trackId: string): AppThunk => {
  return async (dispatch, getState) => {
    const tracks = selectTracks(getState())
    const exportedTrack = tracks.find(item => item.id === trackId)
    let url = ''
    try {
      if(!exportedTrack) {
        throw 'can not find track by id'
      }
      const compiledKml = createKml(exportedTrack)
      url = RNFS.DownloadDirectoryPath + `/${compiledKml.name}.kml`;
      console.log('writing kml to:', url, '\n')
      await RNFS.writeFile(decodeURI(url), compiledKml.data, 'utf8')
      Alert.alert('Track is saved', `to ${url}`)
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
export const restartTrackingAction = (): AppThunk => {
  return async (dispatch,  getState) => {
    const tracking = selectIsTracking(getState())
    if(tracking){
      dispatch({ type: ActionTypeEnum.PauseTracking })
      setTimeout(()=>dispatch({ type: ActionTypeEnum.ResumeTracking }), 10000)
    }
  };
}
export const importTrackAction = (): AppThunk => {
  return async (dispatch) => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });
      const data = await RNFS.readFile(decodeURI(res.fileCopyUri), 'utf8')
      const trackFromKml = parseKml(data)
      const newTrack: Track = {
        id: nanoid(),
        start: trackFromKml.start,
        end: trackFromKml.end,
        name: trackFromKml.name,
        track: trackFromKml.coordinates,
      }
       dispatch(addTrackAction(newTrack));
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };
};
import { ActionTypeEnum, AppThunk } from ".";
import MapboxGL from "@react-native-mapbox-gl/maps";
import { Alert } from "react-native";
import { LocationObject, hasServicesEnabledAsync, requestForegroundPermissionsAsync, getLastKnownPositionAsync } from 'expo-location';
import { ThreeAxisMeasurement } from 'expo-sensors';
import { Track } from "../store/types";
import { Position } from 'geojson';

export const getLocation = async () => {
  const isEnabled = await hasServicesEnabledAsync()
  if (!isEnabled) {
    Alert.alert('Oops', 'Location service is disabled')
    return
  }
  let { status } = await requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Oops', 'Permission to access location was denied')
    return;
  }

  const location = await getLastKnownPositionAsync();
  console.log('location!!', location);
  return location
}

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
  return async (dispatch) => {
    console.log('-startTrackingAction-')
    const location = await getLocation()
    if (!location) {
      console.log('-startTrackingAction-', location)
      return
    }
    const point = [location.coords.longitude, location.coords.latitude]
    const track: Track = {
      id: `${Date.now()}`,
      start: Date.now(),
      end: Date.now(),
      name: '',
      track: [point, point],
    }
    dispatch({ type: ActionTypeEnum.StartTracking, payload: track });
  };
};

export const addPointAction = (location: MapboxGL.Location) => ({ type: ActionTypeEnum.AddPoint, payload: location });
export const stopTrackingAction = (): AppThunk => {
  return async (dispatch) => {
    console.log('-stopTrackingAction-')
    //todo: render trackIcon to save it
    dispatch({ type: ActionTypeEnum.EndTracking })
  };
}
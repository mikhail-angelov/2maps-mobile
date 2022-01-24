import {ActionTypeEnum, AppThunk} from '.';
import MapboxGL from '@react-native-mapbox-gl/maps';
import {State, Track} from '../store/types';
import {
  selectActiveTrack,
  selectIsTracking,
  selectLocation,
} from '../reducers/tracker';
import {selectTracks} from '../reducers/tracker';
import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import {createKml, parseKml} from '../utils/kml';
import {Alert, PermissionsAndroid} from 'react-native';
import {v4 as uuid} from '@lukeed/uuid';
import {
  latLngToTileIndex,
  convertToBoxSize,
  findMinMaxCoordinates,
} from '../utils/normalize';
import {makeSvg} from '../utils/svg';
import * as _ from 'lodash';
import i18next from 'i18next';
import distance from '@turf/distance';

const PATH = `${RNFS.CachesDirectoryPath}/tracks`;
const TRACKS_EXT = '.track';
const SVG_EXT = '.svg';

const ACCESS_FINE_LOCATION = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
const ACCESS_COARSE_LOCATION = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION

export const compassAngle = (magnetometer: any) => {
  let angle = 0.0;
  if (magnetometer) {
    const {x, y, z} = magnetometer;
    angle = Math.atan2(x, y);
    angle = angle * (180 / Math.PI);
    // angle = angle + 90
    angle = (angle + 360) % 360;
  }
  return Math.round(angle);
};

export const setCompassAction = (compass: any) => {
  return {type: ActionTypeEnum.SetCompass, payload: compass};
};
export const setLocationAction = (location: MapboxGL.Location) => ({
  type: ActionTypeEnum.SetLocation,
  payload: location,
});
export const setTracksAction = (tracks: Track[]) => {
  return {type: ActionTypeEnum.SetTracks, payload: tracks};
};
export const addTrackAction = (track: Track) => {
  return {type: ActionTypeEnum.AddTrack, payload: track};
};
export const removeTrackAction =
  (trackId: string): AppThunk =>
  async dispatch => {
    await removeFile(`${PATH}/${trackId}${TRACKS_EXT}`);
    await removeFile(`${PATH}/${trackId}${SVG_EXT}`);
    dispatch({type: ActionTypeEnum.RemoveTrack, payload: trackId});
  };
const getTrackFromFile = async (trackId: string): Promise<Track> => {
  const data = await RNFS.readFile(`${PATH}/${trackId}${TRACKS_EXT}`, 'utf8');
  return JSON.parse(data);
};
const writeTrackToFile = async (activeTrack: Track) => {
  try {
    await RNFS.readDir(PATH);
  } catch (e) {
    if (_.get(e, 'message') === 'Folder does not exist') {
      await RNFS.mkdir(PATH);
    } else {
      const title = i18next.t('Can not save track!');
      const message = `${i18next.t('Directory unreachable')}: ${PATH}; ${_.get(
        e,
        'message',
        '',
      )}`;
      Alert.alert(title, message);
      throw e;
    }
  }
  const filepath = `${PATH}/${activeTrack.id}`;
  activeTrack.distance = distance(
    activeTrack.track[0],
    activeTrack.track[activeTrack.track.length - 1],
  ).toFixed(3);
  await RNFS.writeFile(
    decodeURI(filepath + TRACKS_EXT),
    JSON.stringify(activeTrack),
    'utf8',
  );
  const svgThumbnail = renderTrackIcon(activeTrack) || '';
  if (svgThumbnail) {
    await RNFS.writeFile(decodeURI(filepath + SVG_EXT), svgThumbnail, 'utf8');
  }
};
export const selectTrackAction = (track: Track | undefined): AppThunk => {
  return async dispatch => {
    if (!track) {
      dispatch({type: ActionTypeEnum.SetSelectedTrack, payload: track});
      dispatch({type: ActionTypeEnum.SetSelectedTrackBBox, payload: []});
      return;
    }
    let trackFromFile;
    try {
      trackFromFile = await getTrackFromFile(track.id);
    } catch (e) {
      console.log(e);
      Alert.alert('Can not read track file');
      return;
    }
    let {maxX, maxY, minX, minY} = findMinMaxCoordinates(trackFromFile.track);
    if (!maxX || !maxY || !minX || !minY) {
      return;
    }
    // delta 0.005 of Latitude or 0.006 of Longitude ≈ 0.5km
    if (Math.abs(maxX - minX) < 0.005 && Math.abs(maxY - minY) < 0.006) {
      minX -= 0.0025;
      maxX += 0.0025;
      minY -= 0.003;
      maxY += 0.003;
    }
    const start = [minX, minY];
    const end = [maxX, maxY];
    dispatch({type: ActionTypeEnum.SetSelectedTrack, payload: trackFromFile});
    dispatch({
      type: ActionTypeEnum.SetSelectedTrackBBox,
      payload: [start, end],
    });
  };
};

const checkLocationPermissionsAction = async() => {
  try {
    const isGrantedCoarse = await PermissionsAndroid.check(ACCESS_COARSE_LOCATION);
    const isGrantedFine = await PermissionsAndroid.check(ACCESS_FINE_LOCATION);  
    if (!isGrantedCoarse || !isGrantedFine) {
      Alert.alert(i18next.t("Allow Location Permission otherwise tracking won't work"))
    }
  } catch(e) {
    throw {message: i18next.t("Check location permissions error")}
  }  
}

const requestLocationPermissions = async () => {
  const granted = await PermissionsAndroid.requestMultiple([ACCESS_COARSE_LOCATION, ACCESS_FINE_LOCATION]);
  
  if (granted[ACCESS_FINE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED || granted[ACCESS_COARSE_LOCATION] !== PermissionsAndroid.RESULTS.GRANTED) {
    throw {message: i18next.t("Location permission denied")}
  }
  console.log("You can use the Location");
}

export const startTrackingAction = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      await checkLocationPermissionsAction()
      await requestLocationPermissions()
      const location = selectLocation(getState());
      const startPoint = [location.coords.longitude, location.coords.latitude];
      const track: Track = {
        id: uuid(),
        start: Date.now(),
        end: Date.now(),
        name: '',
        track: [startPoint, startPoint],
      };
      dispatch({type: ActionTypeEnum.StartTracking, payload: track});
    } catch (e) {
      console.log(e);
      const title = i18next.t('Permissions error!')
      const message = _.get(e, 'message', i18next.t('Something goes wrong :('))
      Alert.alert(title, message)
    }
  };
  
};

export const addPointAction = (location: MapboxGL.Location) => ({
  type: ActionTypeEnum.AddPoint,
  payload: location,
});

const renderTrackIcon = (activeTrack: Track) => {
  if (!activeTrack || _.isEmpty(activeTrack.track)) return;
  const coordinatesXY = activeTrack.track.map(point =>
    latLngToTileIndex({lng: point[0], lat: point[1], zoom: 100}),
  );
  const boxX = 50;
  const boxY = 50;
  const boxCoordinates = convertToBoxSize(coordinatesXY, boxX - 1, boxY - 1);
  if (!boxCoordinates) return;
  const svg = makeSvg(boxCoordinates, boxX, boxY);
  return svg;
};

export const stopTrackingAction = (): AppThunk => {
  return async (dispatch, getState) => {
    const activeTrack = getState().tracker.activeTrack;
    if (activeTrack) {
      try {
        activeTrack.end = Date.now();
        await writeTrackToFile(activeTrack);
      } catch (e) {
        console.log(e);
      }
    }

    dispatch({type: ActionTypeEnum.EndTracking});
  };
};

export const updateTrackListAction = (): AppThunk => async dispatch => {
  try {
    const rawPathData = await RNFS.readDir(PATH);
    if (_.isEmpty(rawPathData)) return;

    const trackFiles = _.filter(
      rawPathData,
      item => item.name.slice(-TRACKS_EXT.length) === TRACKS_EXT,
    );
    if (_.isEmpty(trackFiles)) return;
    let tracks: Track[] = [];
    for (const file of trackFiles) {
      const data = await RNFS.readFile(file.path, 'utf8');
      let track;
      try {
        track = JSON.parse(data) as Track;
      } catch (e) {
        continue;
      }
      track.track = [];
      const svgPath = `${PATH}/${track.id}${SVG_EXT}`;
      const svgFileStat = await RNFS.stat(svgPath);
      if (svgFileStat.isFile()) {
        track.thumbnail = await RNFS.readFile(svgFileStat.path, 'utf8');
      }
      tracks.push(track);
    }
    dispatch({type: ActionTypeEnum.SetTracks, payload: tracks});
  } catch (e) {
    console.log('Update tracks error', e);
  }
};

export const clearTrackListAction = () => ({
  type: ActionTypeEnum.SetTracks,
  payload: [],
});

export const exportTrack = async (trackId: string) => {
  let url = '';
  try {
    const exportedTrack = await getTrackFromFile(trackId);
    if (!exportedTrack) {
      throw 'can not find track by id';
    }
    const compiledKml = createKml(exportedTrack);
    url = RNFS.DownloadDirectoryPath + `/${compiledKml.name}.kml`;
    console.log('writing kml to:', url, '\n');
    await RNFS.writeFile(decodeURI(url), compiledKml.data, 'utf8');
    Alert.alert(i18next.t('Track is saved'), `${i18next.t('to')} ${url}`);
  } catch (err: any) {
    console.log('Error write to:', url, '\n', err);
    Alert.alert(
      i18next.t('Oops'),
      `${i18next.t('do not manage to save it')} ${url}`,
    );
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the picker, exit any dialogs or menus and move on
    } else {
      throw err;
    }
  }
};
export const restartTrackingAction = (): AppThunk => {
  return async (dispatch, getState) => {
    const tracking = selectIsTracking(getState());
    if (tracking) {
      dispatch({type: ActionTypeEnum.PauseTracking});
      setTimeout(() => dispatch({type: ActionTypeEnum.ResumeTracking}), 10000);
    }
  };
};
export const importTrackAction = (): AppThunk => {
  return async dispatch => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
        copyTo: 'cachesDirectory',
      });
      const data = await RNFS.readFile(decodeURI(res.fileCopyUri), 'utf8');
      const trackFromKml = parseKml(data);
      const newTrack: Track = {
        id: uuid(),
        start: trackFromKml.start,
        end: trackFromKml.end,
        name: trackFromKml.name,
        track: trackFromKml.coordinates,
      };
      await writeTrackToFile(newTrack);
      dispatch(updateTrackListAction());
    } catch (err: any) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };
};

const removeFile = async (path: string) => {
  try {
    await RNFS.unlink(path);
  } catch (e) {
    console.log(e);
  }
};

import {createSelector} from 'reselect';
import MapboxGL from '@rnmapbox/maps';
import {Position} from 'geojson';
import {TrackerState, State, Track, Tracking} from '../store/types';
import {ActionTypeEnum} from '../actions';
import {createReducer} from './reducer-utils';

const CENTER = [44.320691, 56.090846];

const initialState: TrackerState = Object.freeze({
  location: {
    coords: {
      latitude: CENTER[1],
      longitude: CENTER[0],
      altitude: 0,
      accuracy: 0,
      altitudeAccuracy: 0,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  },
  compass: {x: 0, y: 0, z: 0},
  tracks: [],
  tracking: false,
  trackingAndRecording: false,
  selectedTrackBBox: [],
});

export default createReducer<TrackerState>(initialState, {
  [ActionTypeEnum.SetCompass]: (compass: any) => (state: TrackerState) => ({
    ...state,
    compass,
  }),
  [ActionTypeEnum.SetLocation]:
    (location: MapboxGL.Location) => (state: TrackerState) => {
      console.log('set location', location);
      return {
        ...state,
        location,
      };
    },
  [ActionTypeEnum.SetTracks]: (tracks: Track[]) => (state: TrackerState) => ({
    ...state,
    tracks,
  }),
  [ActionTypeEnum.AddTrack]: (track: Track) => (state: TrackerState) => ({
    ...state,
    tracks: [...state.tracks, track],
  }),
  [ActionTypeEnum.RemoveTrack]: (trackId: string) => (state: TrackerState) => ({
    ...state,
    tracks: state.tracks.filter(item => item.id !== trackId),
  }),
  [ActionTypeEnum.SetSelectedTrack]:
    (selectedTrack?: Track) => (state: TrackerState) => ({
      ...state,
      selectedTrack,
    }),
  [ActionTypeEnum.SetSelectedTrackBBox]:
    (selectedTrackBBox?: number[][]) => (state: TrackerState) => ({
      ...state,
      selectedTrackBBox,
    }),
  [ActionTypeEnum.StartTracking]:
    (activeTrack: Track) => (state: TrackerState) => ({
      ...state,
      activeTrack,
      tracking: true,
    }),
  [ActionTypeEnum.StartTrackingAndRecording]:
    (activeTrack: Track) => (state: TrackerState) => ({
      ...state,
      activeTrack,
      tracking: true,
      trackingAndRecording: true,
    }),
  [ActionTypeEnum.EndTracking]: () => (state: TrackerState) => ({
    ...state,
    activeTrack: undefined,
    tracking: false,
    trackingAndRecording: false,
  }),
  [ActionTypeEnum.PauseTracking]: () => (state: TrackerState) => ({
    ...state,
    tracking: false,
    trackingAndRecording: false,
  }),
  [ActionTypeEnum.ResumeTracking]: () => (state: TrackerState) => ({
    ...state,
    tracking: true,
  }),
  [ActionTypeEnum.AddPoint]:
    ({track, prevPosition}: {track: number[][]; prevPosition: Position}) =>
    (state: TrackerState) => {
      if (!state.activeTrack) {
        return state;
      }
      return {
        ...state,
        activeTrack: {
          ...state.activeTrack,
          track,
          prevPosition,
          end: Date.now(),
        },
      };
    },
});
export const selectTrackerState = (state: State) => state.tracker;
export const selectCompass = createSelector(
  selectTrackerState,
  state => state.compass,
);
export const selectLocation = createSelector(
  selectTrackerState,
  state => state.location,
);
export const selectTracks = createSelector(
  selectTrackerState,
  state => state.tracks,
);
export const selectActiveTrack = createSelector(
  selectTrackerState,
  state => state.activeTrack,
);
export const selectIsTracking = createSelector(selectTrackerState, state => {
  if (state.trackingAndRecording) {
    return Tracking.trackAndRecord;
  } else if (state.tracking) {
    return Tracking.track;
  } else {
    return Tracking.none;
  }
});
export const selectSelectedTrack = createSelector(
  selectTrackerState,
  state => state.selectedTrack,
);
export const selectSelectedTrackBBox = createSelector(
  selectTrackerState,
  state => state.selectedTrackBBox,
);

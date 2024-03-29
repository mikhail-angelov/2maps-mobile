import {createSelector} from 'reselect';
import MapboxGL from '@rnmapbox/maps';
import {Position} from 'geojson';
import {v4 as uuid} from '@lukeed/uuid';
import {TrackerState, State, Track} from '../store/types';
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
  recording: false,
  selectedTrackBBox: [],
});

export default createReducer<TrackerState>(initialState, {
  [ActionTypeEnum.SetCompass]: (compass: any) => (state: TrackerState) => ({
    ...state,
    compass,
  }),
  [ActionTypeEnum.SetLocation]:
    (location: MapboxGL.Location) => (state: TrackerState) => {
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
      recording: false,
    }),
  [ActionTypeEnum.EndTracking]: () => (state: TrackerState) => ({
    ...state,
    activeTrack: undefined,
    tracking: false,
    recording: false,
  }),
  [ActionTypeEnum.PauseTracking]: () => (state: TrackerState) => ({
    ...state,
    tracking: false,
  }),
  [ActionTypeEnum.ResumeTracking]: () => (state: TrackerState) => ({
    ...state,
    tracking: true,
  }),
  [ActionTypeEnum.StartTrackRecording]: () => (state: TrackerState) => {
    return {
      ...state,
      recording: true,
      activeTrack: {
        id: uuid(),
        start: Date.now(),
        end: Date.now(),
        name: '',
        track: [],
      },
    };
  },
  [ActionTypeEnum.EndTrackRecording]: () => (state: TrackerState) => {
    const activeTrack = state.activeTrack;
    return {
      ...state,
      recording: false,
      activeTrack: activeTrack ? {...activeTrack, track: []} : activeTrack,
    };
  },
  [ActionTypeEnum.AddPoint]: (position: Position) => (state: TrackerState) => {
    if (!state.activeTrack) {
      return state;
    }
    return {
      ...state,
      activeTrack: {
        ...state.activeTrack,
        track: [...state.activeTrack.track, position],
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
  return state.tracking;
});
export const selectIsRecording = createSelector(selectTrackerState, state => {
  return state.recording;
});
export const selectSelectedTrack = createSelector(
  selectTrackerState,
  state => state.selectedTrack,
);
export const selectSelectedTrackBBox = createSelector(
  selectTrackerState,
  state => state.selectedTrackBBox,
);

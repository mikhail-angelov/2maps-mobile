import { createSelector } from "reselect";
import { TrackerState, State, Track } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

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
  compass: { x: 0, y: 0, z: 0 },
  tracks: [],
});

export default createReducer<TrackerState>(initialState, {
  [ActionTypeEnum.SetCompass]: (compass) => (state) => ({
    ...state,
    compass,
  }),
  [ActionTypeEnum.SetLocation]: (location) => (state) => ({
    ...state,
    location,
  }),
  [ActionTypeEnum.SetTracks]: (tracks: Track[]) => (state) => ({
    ...state,
    tracks,
  }),
  [ActionTypeEnum.AddTrack]: (track: Track) => (state) => ({
    ...state,
    tracks: [...state.tracks, track],
  }),
  [ActionTypeEnum.RemoveTrack]: (trackId: string) => (state) => ({
    ...state,
    tracks: state.tracks.filter(item => item.id !== trackId),
  }),
  [ActionTypeEnum.SetSelectedTrack]: (selectedTrack) => (state) => ({
    ...state,
    selectedTrack,
  }),
  [ActionTypeEnum.StartTracking]: (activeTrack: Track) => (state) => ({
    ...state,
    activeTrack,
  }),
  [ActionTypeEnum.EndTracking]: () => (state) => ({
    ...state,
    activeTrack: undefined,
  }),
  [ActionTypeEnum.AddPoint]: (point) => (state) => {
    if (!state.activeTrack) {
      return state
    }
    return {
      ...state,
      activeTrack: { ...state.activeTrack, track: [...state.activeTrack.track, point], end: Date.now() },
    }
  },
});
export const selectTrackerState = (state: State) => state.tracker;
export const selectCompass = createSelector(
  selectTrackerState,
  (state) => state.compass
);
export const selectLocation = createSelector(
  selectTrackerState,
  (state) => state.location
);
export const selectTracks = createSelector(
  selectTrackerState,
  (state) => state.tracks
);
export const selectActiveTrack = createSelector(
  selectTrackerState,
  (state) => state.activeTrack
);
export const selectSelectedTrack = createSelector(
  selectTrackerState,
  (state) => state.selectedTrack
);
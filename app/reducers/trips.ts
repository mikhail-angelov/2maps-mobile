import { createSelector } from 'reselect';
import { Mark, State, Trip, TripsState } from '../store/types';
import { ActionTypeEnum } from '../actions';
import { createReducer } from './reducer-utils';

const initialState: TripsState = Object.freeze({
  trips: [],
  selectedTripBBox: [],
  activeTrip: undefined,
  selectedMark: undefined,
});

export default createReducer<TripsState>(initialState, {
  [ActionTypeEnum.SetTrips]: (trips: Trip[]) => (state: TripsState) => ({
    ...state,
    trips,
  }),
  [ActionTypeEnum.SetSelectedTripBBox]:
  (selectedTripBBox: number[][]) => (state: TripsState) => ({
    ...state,
    selectedTripBBox,
  }),
  [ActionTypeEnum.SetActiveTrip]: (newActiveTrip: Trip) => (state: TripsState) => ({
    ...state,
    activeTrip: newActiveTrip,
    selectedMark: undefined
  }),
  [ActionTypeEnum.SelectActiveTripMark]: (selectedMark?: Mark) => (state: TripsState) => ({
    ...state,
    selectedMark,
  }),
});
export const selectTripsState = (state: State) => state.trips;
export const selectTrips = createSelector(
  selectTripsState,
  state => state.trips,
);
export const selectActiveTrip = createSelector(
  selectTripsState,
  state => state.activeTrip,
);
export const selectActiveTripBBox = createSelector(
  selectTripsState,
  state => state.selectedTripBBox,
);
export const selectActiveTripMark = createSelector(
  selectTripsState,
  state => state.selectedMark,
);

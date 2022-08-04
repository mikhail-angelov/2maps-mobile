import { createSelector } from 'reselect';
import { State, Trip, TripsState } from '../store/types';
import { ActionTypeEnum } from '../actions';
import { createReducer } from './reducer-utils';

const initialState: TripsState = Object.freeze({
  trips: []
});

export default createReducer<TripsState>(initialState, {
  [ActionTypeEnum.SetTrips]: (trips: Trip[]) => (state: TripsState) => ({
    ...state,
    trips,
  })
});
export const selectTripsState = (state: State) => state.trips;
export const selectTrips = createSelector(
  selectTripsState,
  state => state.trips,
);

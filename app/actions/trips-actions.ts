import { v4 as uuid } from "@lukeed/uuid";
import { ActionTypeEnum, AppThunk } from ".";
import { selectActiveTrip, selectTrips } from "../reducers/trips";
import { Mark, Trip } from "../store/types";
import { findMinMaxCoordinates } from "../utils/normalize";
import i18next from 'i18next';

export const addMarkToTripAction = (mark: Mark, tripId: string): AppThunk => (dispatch, getState) => {
    const trips = selectTrips(getState())
    const targetTripIndex = trips.findIndex(item => item.id === tripId)
    if (targetTripIndex === -1) {
        return
    }
    const markExistInTripIndex = trips[targetTripIndex].marks.findIndex(item => item.id === mark.id)
    let updatedTripWithNewMark
    if (markExistInTripIndex === -1) {
        updatedTripWithNewMark = { ...trips[targetTripIndex], marks: [...trips[targetTripIndex].marks, mark] }
    } else {
        updatedTripWithNewMark = {
            ...trips[targetTripIndex], marks: [...trips[targetTripIndex].marks.slice(0, markExistInTripIndex), ...trips[targetTripIndex].marks.slice(markExistInTripIndex + 1), mark]
        }
    }
    const newTrips = [...trips.slice(0, targetTripIndex), ...trips.slice(targetTripIndex + 1), updatedTripWithNewMark]
    dispatch({ type: ActionTypeEnum.SetTrips, payload: newTrips })
}

export const addMarkToNewTripAction = (tripName: string, mark: Mark): AppThunk => (dispatch, getState) => {
    const trips = selectTrips(getState())
    const createdTrip: Trip = {
        id: uuid(),
        name: tripName,
        marks: [mark],
        date: Date.now()
    }
    const newTrips = [...trips, createdTrip]
    dispatch({ type: ActionTypeEnum.SetTrips, payload: newTrips })
}

export const setActualTripAction =
  (id: string): AppThunk =>
    async (dispatch, getState) => {
      const trips = selectTrips(getState());
      const result = trips.find(item => item.id === id);
      if (!result || !result.marks) {
        dispatch({
          type: ActionTypeEnum.SetActiveTrip,
          payload: undefined,
        })
        dispatch({
          type: ActionTypeEnum.SetSelectedDrawingBBox,
          payload: undefined,
        });
        return
      }
      dispatch({
        type: ActionTypeEnum.SetActiveTrip,
        payload: result,
      })
      const marksCoordinates = result.marks.map(item => (item.geometry.coordinates))
      let { maxX, maxY, minX, minY } = findMinMaxCoordinates([marksCoordinates])
      if (Math.abs(maxX - minX) < 0.005 && Math.abs(maxY - minY) < 0.006) {
        minX -= 0.0025;
        maxX += 0.0025;
        minY -= 0.003;
        maxY += 0.003;
      }
      const start = [minX, minY];
      const end = [maxX, maxY];
      dispatch({
        type: ActionTypeEnum.SetSelectedTripBBox,
        payload: [start, end],
      });
    };

export const removeTripAction = (id: string): AppThunk => async(dispatch, getState) => {
  const trips = selectTrips(getState());
  const result = trips.filter(item => item.id !== id);
  dispatch({ type: ActionTypeEnum.SetTrips, payload: result });
}

export const selectTripMarkAction = (mark?: Mark): AppThunk => async (dispatch, getState) => {
  const trip = selectActiveTrip(getState())
  const markIndex = trip?.marks.findIndex((item) => item.id === mark?.id) || 0
  const markForActiveTrip = {...mark, name: `${markIndex + 1}. ${i18next.t('Trip')} "${trip?.name || ''}"${mark?.name ? `: ${mark.name}` : ''}`}
  dispatch({type: ActionTypeEnum.SelectActiveTripMark, payload: markForActiveTrip})
}
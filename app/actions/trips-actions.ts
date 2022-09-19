import { v4 as uuid } from "@lukeed/uuid";
import { ActionTypeEnum, AppThunk } from ".";
import { selectActiveTrip, selectTrips } from "../reducers/trips";
import { Mark, MarkType, Trip } from "../store/types";
import { findMinMaxCoordinates } from "../utils/normalize";

export const addMarkToTripAction = (mark: Mark, tripId: string): AppThunk => (dispatch, getState) => {
  const trips = selectTrips(getState())
  const targetTripIndex = trips.findIndex(item => item.id === tripId)
  if (targetTripIndex === -1) {
    return
  }

  const updatedTripWithNewMark = { ...trips[targetTripIndex], marks: [...trips[targetTripIndex].marks, mark] }
  const newTrips = trips.map((item) => item.id === tripId ? updatedTripWithNewMark : item)
  dispatch({ type: ActionTypeEnum.SetTrips, payload: newTrips })
  dispatch({ type: ActionTypeEnum.SetActiveTrip, payload: updatedTripWithNewMark })
  dispatch({ type: ActionTypeEnum.EditMark, payload: undefined })
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
  dispatch({ type: ActionTypeEnum.SetActiveTrip, payload: createdTrip })
  dispatch({ type: ActionTypeEnum.EditMark, payload: undefined })
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

export const removeTripAction = (id: string): AppThunk => async (dispatch, getState) => {
  const trips = selectTrips(getState());
  const result = trips.filter(item => item.id !== id);
  dispatch({ type: ActionTypeEnum.SetTrips, payload: result });
}

export const selectTripMarkAction = (mark?: Mark): AppThunk => async (dispatch, getState) => {
  if (!mark) {
    return dispatch({ type: ActionTypeEnum.SetActiveTripMark, payload: undefined })
  }
  const trip = selectActiveTrip(getState())
  const markIndex = trip?.marks.findIndex((item) => item.id === mark?.id) || 0
  const markForActiveTrip = { ...mark, type: MarkType.TRIP, selectedMarkIndex: markIndex }
  dispatch({ type: ActionTypeEnum.SetActiveTripMark, payload: markForActiveTrip })
}

export const removeActiveTripMarkAction = (markId: string): AppThunk => async (dispatch, getState) => {
  const activeTrip = selectActiveTrip(getState())
  if (!activeTrip) {
    return
  }

  const newMarks = activeTrip.marks.filter(item => item.id !== markId)
  const updatedTrip = { ...activeTrip, marks: newMarks }
  if (newMarks.length > 0) {
    dispatch({ type: ActionTypeEnum.SetActiveTrip, payload: updatedTrip })
  } else {
    dispatch({ type: ActionTypeEnum.SetActiveTrip, payload: undefined })
  }

  const trips = selectTrips(getState())
  const newTrips = trips.map(item => item.id === updatedTrip.id ? updatedTrip : item)
  dispatch({ type: ActionTypeEnum.SetTrips, payload: newTrips })
}

export const saveTripMarkAction = (mark: Mark): AppThunk => async (dispatch, getState) => {
  const activeTrip = selectActiveTrip(getState())
  if (!activeTrip) {
    return
  }
  const newMarks = activeTrip.marks.map(item => item.id === mark.id ? mark : item)
  const updatedTrip = { ...activeTrip, marks: newMarks }
  const trips = selectTrips(getState())
  const newTrips = trips.map(item => item.id === updatedTrip.id ? updatedTrip : item)
  dispatch({ type: ActionTypeEnum.SetActiveTrip, payload: updatedTrip })
  dispatch({ type: ActionTypeEnum.SetTrips, payload: newTrips })
  dispatch({ type: ActionTypeEnum.EditMark, payload: undefined })
}
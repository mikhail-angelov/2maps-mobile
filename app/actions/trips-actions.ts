import { v4 as uuid } from "@lukeed/uuid";
import { ActionTypeEnum, AppThunk } from ".";
import { selectTrips } from "../reducers/trips";
import { Mark, Trip } from "../store/types";

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
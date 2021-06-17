import { Action } from "redux";
import { ThunkAction } from "redux-thunk";
import { State } from "../store/types";

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  State,
  unknown,
  Action<string>
>;

export enum ActionTypeEnum {
  // marks
  MarksRequest = "marks/MARKS_REQUEST",
  MarksSuccess = "marks/MARKS_SUCCESS",
  MarksFailure = "marks/MARKS_FAILURE",
  AddMark = "marks/ADD_MARK",
  RemoveMark = "marks/REMOVE_MARK",
  ImportPois = "marks/IMPORT_POIS",
  //tracker
  SetCompass = 'tracker/SET_COMPASS',
  SetLocation = 'tracker/SET_LOCATION',
  SetTracks = 'tracker/SET_TRACKS',
  AddTrack = 'tracker/ADD_TRACK',
  RemoveTrack = 'tracker/REMOVE_TRACK',
  SetSelectedTrack = 'tracker/SET_SELECTED_TRACK',
  StartTracking = 'tracker/START_TRACKING',
  EndTracking = 'tracker/END_TRACKING',
  AddPoint = 'tracker/ADD_POINT',
}

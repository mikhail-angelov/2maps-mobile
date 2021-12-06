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
  // auth
  AuthError = 'auth/ERROR',
  LoginRequest = "auth/LOGIN_REQUEST",
  LoginSuccess = "auth/LOGIN_SUCCESS",
  LoginFailure = "auth/LOGIN_FAILURE",
  LogoutRequest = "auth/LOGOUT_REQUEST",
  LogoutSuccess = "auth/LOGOUT_SUCCESS",
  LogoutFailure = "auth/LOGOUT_FAILURE",
  SignUpRequest = "auth/SIGN_UP_REQUEST",
  SignUpSuccess = "auth/SIGN_UP_SUCCESS",
  SignUpFailure = "auth/SIGN_UP_FAILURE",
  PasswordResetRequest = "auth/PASSWORD_RESET_REQUEST",
  PasswordResetSuccess = "auth/PASSWORD_RESET_SUCCESS",
  PasswordResetFailure = "auth/PASSWORD_RESET_FAILURE",
  StoreResetToken = "auth/STORE_RESET_TOKEN",
  ChangePasswordRequest = "auth/CHANGE_PASSWORD_REQUEST",
  ChangePasswordSuccess = "auth/CHANGE_PASSWORD_SUCCESS",
  ChangePasswordFailure = "auth/CHANGE_PASSWORD_FAILURE",
  // marks
  MarksRequest = "marks/MARKS_REQUEST",
  MarksSuccess = "marks/MARKS_SUCCESS",
  MarksFailure = "marks/MARKS_FAILURE",
  AddMark = "marks/ADD_MARK",
  EditMark = "marks/EDIT_MARK",
  SaveMark = "marks/SAVE_MARK",
  UpdateMark = "marks/UPDATE_MARK",
  RemoveMark = "marks/REMOVE_MARK",
  RemoveAllMarks = "marks/REMOVE_ALL_MARKS",
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
  PauseTracking = 'tracker/PAUSE_TRACKING',
  ResumeTracking = 'tracker/RESUME_TRACKING',
  AddPoint = 'tracker/ADD_POINT',
  //map
  SetCenter = 'map/SET_CENTER',
  SetOpacity = 'map/SET_OPACITY',
  SetZoom = 'map/SET_ZOOM',
  SetPrimary = 'map/SET_PRIMARY',
  SetSecondary = 'map/SET_SECONDARY',
  GetMapList = 'map/GET_MAP_LIST',
  GetMapListSuccess = 'map/GET_MAP_LIST_SUCCESS',
  GetMapListFailure = 'map/GET_MAP_LIST_FAILED',
  LoadMapList = 'map/LOAD_MAP_LIST',
  LoadMapListSuccess = 'map/LOAD_MAP_LIST_SUCCESS',
  LoadMapListFailure = 'map/LOAD_MAP_LIST_FAILED',
  DownloadMap = 'map/DOWNLOAD_MAP',
  DownloadMapSuccess = 'map/DOWNLOAD_MAP_SUCCESS',
  DownloadMapFailure = 'map/DOWNLOAD_MAP_FAILED',
  DeleteMap = 'map/DELETE_MAP',
  DeleteMapSuccess = 'map/DELETE_MAP_SUCCESS',
  DeleteMapFailure = 'map/DELETE_MAP_FAILED',
  //wiki
  WikiRequest = 'wiki/REQUEST',
  WikiSuccess = 'wiki/REQUEST_SUCCESS',
  WikiFailure = 'wiki/REQUEST_FAILURE',
}

import { createSelector } from "reselect";
import { AuthState, State, AuthParams } from "../store/types";
import { ActionTypeEnum } from "../actions";
import { createReducer } from "./reducer-utils";

const initialState: AuthState = Object.freeze({
  authenticated: false,
  isRequestInProgress: false,
  token: ''
});

export default createReducer<AuthState>(initialState, {
  [ActionTypeEnum.AuthError]: (error?: string) => (state: AuthState) => ({
    ...state,
    error,
  }),
  [ActionTypeEnum.LoginRequest]: () => (state: AuthState) => ({
    ...state,
    isRequestInProgress: true,
    error: '',
  }),
  [ActionTypeEnum.LoginSuccess]: ({ token, user }:AuthParams) => (state: AuthState) => ({
    ...state,
    authenticated: true,
    token,
    user,
    error: '',
    isRequestInProgress: false,
  }),
  [ActionTypeEnum.LoginFailure]: (error:string) => (state: AuthState) => ({
    ...state,
    error,
    isRequestInProgress: false,
    authenticated: false,
  }),
  [ActionTypeEnum.SignUpRequest]: () => (state: AuthState) => ({
    ...state,
    isRequestInProgress: true,
    error: '',
  }),
  [ActionTypeEnum.SignUpSuccess]: ({ token, user }:AuthParams) => (state: AuthState) => ({
    ...state,
    authenticated: true,
    token,
    user,
    error: '',
    isRequestInProgress: false,
  }),
  [ActionTypeEnum.SignUpFailure]: (error: string) => (state: AuthState) => ({
    ...state,
    error,
    authenticated: false,
    isRequestInProgress: false,
  }),
  [ActionTypeEnum.LogoutRequest]: () => (state: AuthState): AuthState => ({
    ...state,
    isRequestInProgress: true,
    error: '',
  }),
  [ActionTypeEnum.LogoutSuccess]: () => (state: AuthState) => ({
    ...state,
    authenticated: false,
    token: '',
    user: undefined,
    isRequestInProgress: false,
    error: '',
  }),
  [ActionTypeEnum.LogoutFailure]: (error:string) => (state: AuthState) => ({
    ...state,
    error,
    authenticated: false,
    token: '',
    user: undefined,
    isRequestInProgress: false,
  }),
});
export const selectAuthState = (state: State) => state.auth;
export const selectIsAuthInProgress = createSelector(
  selectAuthState,
  (state) => state.isRequestInProgress
);
export const selectIsAuthenticated = createSelector(
  selectAuthState,
  (state) => state.authenticated
);
export const selectToken = createSelector(
  selectAuthState,
  (state) => state.token
);
export const selectUser = createSelector(
  selectAuthState,
  (state) => state.user
);
export const selectError = createSelector(
  selectAuthState,
  (state) => state.error
);

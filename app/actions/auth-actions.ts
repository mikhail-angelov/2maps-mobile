import { ActionTypeEnum, AppThunk } from ".";
import { post, HOST } from "./api";
import { selectToken } from '../reducers/auth'
import { AuthParams } from '../store/types'

const AUTH_URL = `${HOST}/auth/m`

interface Credentials {
  email: string;
  password: string;
}
interface SignUp {
  name: string;
  email: string;
  password: string;
}
interface PasswordReset {
  email: string;
}

export const setAuthErrorAction = (error: string) => {
  return { type: ActionTypeEnum.AuthError, payload: error }
};

export const loginAction = (data: Credentials): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: ActionTypeEnum.LoginRequest });
      console.log('loginAction',data)
      const response = await post<AuthParams>({ url: `${AUTH_URL}/login`, data });
      dispatch({
        type: ActionTypeEnum.LoginSuccess,
        payload: response.data,
      });
    } catch (e) {
      console.log("login error", JSON.stringify(e));
      dispatch({
        type: ActionTypeEnum.LoginFailure,
        payload: "login failure",
      });
    }
  };
};
export const logoutAction = (): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: ActionTypeEnum.LogoutRequest });
      const response = await post({ url: `${AUTH_URL}/logout`, data: {} });

      dispatch({
        type: ActionTypeEnum.LogoutSuccess,
      });
    } catch (e) {
      console.log("logout error", e);
      dispatch({
        type: ActionTypeEnum.LogoutFailure,
        payload: "logout failure",
      });
    }
  };
};
export const checkAction = (): AppThunk => {
  return async (dispatch, getState) => {
    try {
      const token = selectToken(getState())
      if (!token) {
        throw 'logout'
      }
      const response = await post<AuthParams>({ url: `${AUTH_URL}/check`, data: {}, token });
      dispatch({
        type: ActionTypeEnum.LoginSuccess,
        payload: response.data,
      });

    } catch (e) {
      console.log("logout check", e);
      dispatch({ type: ActionTypeEnum.LogoutSuccess });
    }
  };
};

export const signUpAction = (data: SignUp): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: ActionTypeEnum.SignUpRequest });
      const response = await post<AuthParams>({ url: `${AUTH_URL}/sign-up`, data });

      dispatch({
        type: ActionTypeEnum.SignUpSuccess,
        payload: response.data,
      });
    } catch (e) {
      console.log("sign up error", e);
      dispatch({
        type: ActionTypeEnum.SignUpFailure,
        payload: "sign up failure",
      });
    }
  };
};

export const passwordResetAction = (data: PasswordReset): AppThunk => {
  return async (dispatch) => {
    try {
      dispatch({ type: ActionTypeEnum.PasswordResetRequest });
      await post<AuthParams>({ url: `${AUTH_URL}/forget`, data });
      dispatch({
        type: ActionTypeEnum.PasswordResetSuccess,
      });
    } catch (e) {
      console.log("password reset error", e);
      dispatch({
        type: ActionTypeEnum.PasswordResetFailure,
        payload: "password reset failure",
      });
    }
  };
};

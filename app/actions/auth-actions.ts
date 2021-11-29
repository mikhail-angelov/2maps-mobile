import { ActionTypeEnum, AppThunk } from ".";
import { post, HOST } from "./api";
import { AuthParams } from '../store/types'
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const setStorageData = async (key: string, value: any) => {
  try {
    console.log('set store', key, value)
    const jsonValue = JSON.stringify(value)
    await AsyncStorage.setItem(key, jsonValue)
  } catch (e) {
    console.log('saving store error', e)
  }
}

const getStorageData = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key)
    console.log('get store', key, jsonValue)
    if(jsonValue !== null) {
      return JSON.parse(jsonValue)
    }
  } catch(e) {
    console.log('getting store error', e)
  }
}

const removeStorageData = async (keys: string[]) => {
  try {
    await AsyncStorage.multiRemove(keys)
  } catch(e) {
    console.log('removing store error', e)
  }
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
      if (response.data.token && response.data.user) {
        await setStorageData('token', response.data.token)
        await setStorageData('user', response.data.user)
      }
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

      await removeStorageData(['token', 'user'])
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
      const token = await getStorageData('token')
      if (!token) {
        throw 'logout'
      }
      let payload
      const isOnline = getState().network.isConnected
      if (isOnline) {
        const response = await post<AuthParams>({ url: `${AUTH_URL}/check`, data: {}, token });
        payload = response.data
      }else{
        const user = await getStorageData('user')
        payload = {token, user}
      }     

      dispatch({
        type: ActionTypeEnum.LoginSuccess,
        payload,
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

      if (response.data.token && response.data.user) {
        await setStorageData('token', response.data.token)
        await setStorageData('user', response.data.user)
      }
    } catch (e) {
      console.log("sign up error", e);
      dispatch({
        type: ActionTypeEnum.SignUpFailure,
        payload: "sign up failure",
      });
    }
  };
};

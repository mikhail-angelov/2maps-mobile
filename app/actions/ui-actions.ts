import { ActionTypeEnum, AppThunk } from ".";
import { NativeModules } from "react-native";
import { ModalParams } from '../store/types'
import { selectAwake } from '../reducers/ui'

export const showModalAction = (modalParams: ModalParams) => {
  return { type: ActionTypeEnum.UIAddModal, payload: modalParams }
};

export const removeModalAction = () => {
  return { type: ActionTypeEnum.UIRemoveModal}
};

export const toggleAwakeAction = (): AppThunk => {
  return async (dispatch, getState) => {
    const awake = !selectAwake(getState())
    try {
      await NativeModules.MapsModule.setAwake(awake);
      dispatch({ type: ActionTypeEnum.SetAwake, payload: awake });
    } catch (err) {
      console.log("error", err);
      dispatch({ type: ActionTypeEnum.SetAwake, payload: !awake });
    }
  };
};